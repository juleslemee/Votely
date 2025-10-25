import { db, auth } from './firebase';
import { collection, addDoc, serverTimestamp, Timestamp, doc, updateDoc, getDocs, query, where, orderBy, limit, getDoc, setDoc, increment, runTransaction } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { findVisionAlignment, alignments, toVisionScale } from '../app/quiz/results/types';
import { debugLog, debugWarn, debugError } from './debug-logger';

export type QuizResult = {
  answers: number[];
  quizType?: 'short' | 'long';
  questionData?: Array<{
    id: number;
    axis: string;
    agreeDir: number;
    answer: number | null;
    supplementAxis?: string;
  }>;
  result: {
    economicScore: number;
    governanceScore?: number; // Governance axis score
    socialScore: number;
    progressiveScore?: number; // Cultural axis score (legacy)
    alignmentLabel: string;
    alignmentDescription: string;
    macroCellCode?: string; // e.g., "EM-GM"
    supplementaryScores?: Record<string, number>; // Phase 2 scores
    gridPosition?: { // For 3x3 or 9x9 grid
      economic: number;
      social: number;
    };
  };
  skipStats?: { // Analytics for skipped questions
    totalSkipped: number;
    skipsByAxis: {
      economic: number;
      governance: number;
      social: number;
    };
  };
  phase?: 1 | 2; // Which phase was completed
  timestamp: Timestamp;
  userId?: string | null;
};

export async function saveQuizResult(result: Omit<QuizResult, 'timestamp'>) {
  try {
    // Ensure we have an anonymous user
    if (!auth.currentUser) {
      debugLog('No current user, signing in anonymously...');
      const userCredential = await signInAnonymously(auth);
      debugLog('Anonymous sign-in successful, uid:', userCredential.user.uid);
    } else {
      debugLog('Already signed in, uid:', auth.currentUser.uid);
    }

    const dataToSave: any = {
      answers: result.answers,
      result: result.result,
      timestamp: serverTimestamp(),
      userId: auth.currentUser?.uid || null,
    };

    // Only add optional fields if they have values
    if (result.quizType) dataToSave.quizType = result.quizType;
    if (result.phase) dataToSave.phase = result.phase;
    if (result.skipStats) dataToSave.skipStats = result.skipStats;
    if (result.questionData && result.questionData.length > 0) {
      // Filter out any undefined supplementAxis values
      dataToSave.questionData = result.questionData.map(q => {
        const cleaned: any = {
          id: q.id,
          axis: q.axis,
          agreeDir: q.agreeDir,
          answer: q.answer
        };
        if (q.supplementAxis) cleaned.supplementAxis = q.supplementAxis;
        return cleaned;
      });
    }
    
    debugLog('Attempting to save quiz result to Firestore...', {
      dataStructure: Object.keys(dataToSave),
      alignmentLabel: result.result.alignmentLabel,
      userId: dataToSave.userId,
      answersLength: result.answers.length
    });

    const docRef = await addDoc(
      collection(db, 'quizResponses'),
      dataToSave
    );
    
    debugLog('Quiz result saved successfully, docId:', docRef.id);
    
    // Update aggregated stats to avoid reading all documents later
    await updateAggregatedStats(result.result.economicScore, result.result.socialScore);
    
    return docRef.id;
  } catch (error: any) {
    debugError('Error saving quiz result:', error);
    debugError('Error code:', error.code);
    debugError('Error message:', error.message);
    
    // Check for specific Firebase errors
    if (error.code === 'permission-denied') {
      debugError('Firebase permission denied - check Firestore rules');
    } else if (error.code === 'unavailable') {
      debugError('Firebase unavailable - check network connection');
    } else if (error.code === 'auth/api-key-expired') {
      debugError('Firebase API key expired - please renew the API key in Firebase Console');
    }
    
    throw error;
  }
}

export async function saveEmailToWaitlist(email: string) {
  try {
    const docRef = await addDoc(
      collection(db, 'waitlist'),
      {
        email,
        timestamp: serverTimestamp(),
        source: 'quiz_completion'
      }
    );
    return docRef.id;
  } catch (error) {
    debugError('Error saving email to waitlist:', error);
    throw error;
  }
}

// Helper function to update aggregated statistics
async function updateAggregatedStats(economicScore: number, socialScore: number) {
  try {
    // Use a transaction to ensure atomic increment
    const statsRef = doc(db, 'aggregatedStats', 'totals');
    
    await runTransaction(db, async (transaction) => {
      const statsDoc = await transaction.get(statsRef);
      
      if (!statsDoc.exists()) {
        // If document doesn't exist, create it with count of 1
        transaction.set(statsRef, {
          totalCount: 1,
          lastUpdated: serverTimestamp()
        });
      } else {
        // If it exists, increment the existing count
        const currentCount = statsDoc.data().totalCount || 0;
        transaction.update(statsRef, {
          totalCount: currentCount + 1,
          lastUpdated: serverTimestamp()
        });
      }
    });

    // Update grid cell counts for both 3x3 and 9x9 grids
    await updateGridCellCount(economicScore, socialScore, 'short');
    await updateGridCellCount(economicScore, socialScore, 'long');
  } catch (error) {
    debugError('Error updating aggregated stats:', error);
    // Don't throw - this is not critical for the user experience
  }
}

// Helper to update grid cell counts
async function updateGridCellCount(economic: number, social: number, quizType: 'short' | 'long') {
  const cellSize = quizType === 'short' ? (200 / 3) : (200 / 9);
  const gridSize = quizType === 'short' ? 3 : 9;
  
  let econCell = Math.floor((economic + 100) / cellSize);
  if (econCell >= gridSize) econCell = gridSize - 1;
  
  let socialCell = Math.floor((100 - social) / cellSize);
  if (socialCell >= gridSize) socialCell = gridSize - 1;
  
  const cellId = `${quizType}_${econCell}_${socialCell}`;
  const cellRef = doc(db, 'gridCellCounts', cellId);
  
  await setDoc(cellRef, {
    count: increment(1),
    economicCell: econCell,
    socialCell: socialCell,
    quizType: quizType,
    lastUpdated: serverTimestamp()
  }, { merge: true });
}

// Analytics functions for the new features

// Simple test function to check Firebase connection
export async function testFirebaseConnection(): Promise<boolean> {
  try {
    debugLog('Testing Firebase connection...');
    // Just read ONE document instead of ALL documents!
    const testDoc = await getDoc(doc(db, 'aggregatedStats', 'totals'));
    debugLog('Firebase connection successful. Stats exist:', testDoc.exists());
    return true;
  } catch (error) {
    debugError('Firebase connection failed:', error);
    return false;
  }
}

// Load quiz result from Firebase by document ID
export async function getQuizResultById(docId: string): Promise<any | null> {
  try {
    const docRef = doc(db, 'quizResponses', docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      debugError(`No quiz result found with ID: ${docId}`);
      return null;
    }
  } catch (error) {
    debugError('Error loading quiz result:', error);
    return null;
  }
}

// New coordinate-range-based percentage calculation - ULTRA OPTIMIZED VERSION
export async function getCoordinateRangePercentage(
  userEconomic: number,
  userGovernance: number,
  quizType: 'short' | 'long'
): Promise<number> {
  try {
    const cellSize = quizType === 'short' ? (200 / 3) : (200 / 9);
    const gridSize = quizType === 'short' ? 3 : 9;

    let econCell = Math.floor((userEconomic + 100) / cellSize);
    if (econCell >= gridSize) econCell = gridSize - 1;

    let govCell = Math.floor((100 - userGovernance) / cellSize);
    if (govCell >= gridSize) govCell = gridSize - 1;

    const cellId = `${quizType}_${econCell}_${govCell}`;
    
    // ONLY read from cache - never calculate on the fly
    const cacheRef = doc(db, 'cachedPercentages', cellId);
    const cacheDoc = await getDoc(cacheRef);
    
    if (cacheDoc.exists() && cacheDoc.data().percentage !== undefined) {
      debugLog(`Using cached percentage for cell ${cellId}: ${cacheDoc.data().percentage}%`);
      return cacheDoc.data().percentage;
    }
    
    // If no cache exists, return a default
    // The batch job will ensure cache is always populated
    debugWarn(`No cached percentage for cell ${cellId}, returning default`);
    // Different fallbacks for short (3x3) vs long (9x9) quiz
    return quizType === 'short' ? 9 : 2;

  } catch (error) {
    debugError('Error getting cached percentage:', error);
    // Different fallbacks for short (3x3) vs long (9x9) quiz
    return quizType === 'short' ? 9 : 2; // Default fallback percentage
  }
}

// Keep the old function for backward compatibility, but mark it as deprecated
export async function getAlignmentPercentage(alignmentLabel: string): Promise<number> {
  // Get all quiz responses
  const allResponsesSnapshot = await getDocs(collection(db, 'quizResponses'));
  const totalResponses = allResponsesSnapshot.size;
  
  if (totalResponses === 0) return 0;
  
  // Count responses with this alignment
  const alignmentResponsesSnapshot = await getDocs(
    query(collection(db, 'quizResponses'), where('result.alignmentLabel', '==', alignmentLabel))
  );
  const alignmentCount = alignmentResponsesSnapshot.size;
  
  return Math.round((alignmentCount / totalResponses) * 100);
}

export async function getTotalQuizCount(): Promise<number | string> {
  try {
    // Single read from aggregated stats - force server read to avoid cache issues
    const statsRef = doc(db, 'aggregatedStats', 'totals');
    const statsDoc = await getDoc(statsRef);
    
    if (statsDoc.exists()) {
      const data = statsDoc.data();
      debugLog('📊 Raw Firebase document data:', JSON.stringify(data));
      const totalCount = data?.totalCount;
      
      debugLog(`Total quiz count from Firebase: ${totalCount}, type: ${typeof totalCount}`);
      
      // Simple validation - just check it's a valid number
      if (typeof totalCount === 'number' && totalCount >= 1) {
        return totalCount;
      } else {
        debugWarn(`Invalid totalCount value: ${totalCount}. Returning fallback.`);
        return 'thousands of';
      }
    }
    
    // Default fallback if document doesn't exist
    debugLog('No aggregated stats document found, returning fallback');
    return 'thousands of';
    
  } catch (error: any) {
    debugError('Error getting total quiz count:', error);
    debugError('Error code:', error.code);
    debugError('Error message:', error.message);
    
    // Return fallback text if Firebase fails
    return 'thousands of';
  }
}

export async function getPoliticalGroupMatches(userEconomic: number, userSocial: number, userProgressive: number = 0): Promise<Array<{name: string, description: string, match: number}>> {
  // Convert user scores to vision scale
  const userX = toVisionScale(userEconomic);
  const userY = toVisionScale(userSocial);
  
  // Analyze user's political psychology profile
  const analyzePoliticalProfile = (economic: number, social: number, cultural: number) => {
    // Economic motivations - be more careful about moderate classifications
    const economicStrength = Math.abs(economic);
    const economicDirection = 
      economic < -50 ? 'strongly-populist' :
      economic < -20 ? 'mildly-populist' :
      economic > 50 ? 'strongly-market' :
      economic > 20 ? 'mildly-market' : 'moderate-economic';
    
    // Authority motivations - avoid assuming strong positions for moderates
    const authorityStrength = Math.abs(social);
    const authorityDirection = 
      social < -50 ? 'strongly-libertarian' :
      social < -20 ? 'mildly-libertarian' :
      social > 50 ? 'strongly-authoritarian' :
      social > 20 ? 'mildly-authoritarian' : 'moderate-authority';
    
    // Cultural motivations - similar careful classification
    const culturalStrength = Math.abs(cultural);
    const culturalDirection = 
      cultural < -50 ? 'strongly-progressive' :
      cultural < -20 ? 'mildly-progressive' :
      cultural > 50 ? 'strongly-traditional' :
      cultural > 20 ? 'mildly-traditional' : 'moderate-cultural';
    
    return {
      economic: { strength: economicStrength, direction: economicDirection, score: economic },
      authority: { strength: authorityStrength, direction: authorityDirection, score: social },
      cultural: { strength: culturalStrength, direction: culturalDirection, score: cultural },
      isModerate: economicStrength < 20 && authorityStrength < 20 && culturalStrength < 20
    };
  };

  // Generate dynamic personalized descriptions using political psychology
  const generateDescription = (alignment: any, userEconomic: number, userSocial: number, userCultural: number) => {
    const profile = analyzePoliticalProfile(userEconomic, userSocial, userCultural);
    
    // Narrative builders for each ideology
    const narrativeBuilders: Record<string, (profile: any) => string> = {
      'Revolutionary Socialist': (p) => {
        if (p.isModerate) {
          return 'Advocates for worker ownership and revolutionary change. While you prefer measured approaches, their frustration with economic inequality makes sense to you. Sometimes only fundamental restructuring can address systemic problems.';
        }
        if (p.economic.direction.includes('populist') && p.authority.direction.includes('libertarian')) {
          return 'Advocates for worker ownership and direct democracy. Like you, they see both corporate elites AND government bureaucrats as threats to ordinary people. They believe collective ownership is the only way to break the exploitation cycle.';
        }
        if (p.economic.direction.includes('populist') && p.cultural.direction.includes('progressive')) {
          return 'Advocates for worker ownership and intersectional liberation. They want to dismantle both capitalism and social hierarchies simultaneously, which speaks to both your economic populism and progressive values.';
        }
        if (p.authority.direction.includes('authoritarian')) {
          return 'Advocates for worker ownership through organized collective action. They believe disciplined revolutionary movements can achieve economic transformation, which matches your structured approach to change.';
        }
        return 'Advocates for worker ownership as the path to justice. They believe only fundamental restructuring can address systemic exploitation, which speaks to your concerns about economic inequality.';
      },
      
      'Welfare Commander': (p) => {
        if (p.authority.direction === 'order-focused' && p.cultural.direction === 'tradition-focused') {
          return 'Supports strong safety nets within stable institutions. They focus on using government power to protect families and communities from economic disruption while maintaining social order.';
        }
        if (p.economic.direction === 'populist' && p.cultural.direction === 'change-oriented') {
          return 'Supports comprehensive social programs and progressive reform. Nordic-style policies that combine economic security with social modernization match both your economic concerns and progressive instincts.';
        }
        if (p.authority.direction === 'balanced-governance' && p.economic.direction === 'mixed-economy') {
          return 'Supports pragmatic government intervention in markets. Their evidence-based social democratic policies fit well with your moderate approach to both economics and governance.';
        }
        return 'Supports using government power to fix market failures and protect the vulnerable. Their belief in strong safety nets and regulated capitalism matches your economic concerns.';
      },

      'Homeland Defender': (p) => {
        if (p.cultural.direction === 'tradition-focused' && p.authority.direction === 'order-focused') {
          return 'Prioritizes national identity and strong leadership. Their emphasis on borders, heritage, and cultural continuity strongly matches your traditional values and support for organized authority.';
        }
        if (p.economic.direction === 'populist' && p.cultural.direction === 'change-oriented') {
          return 'Prioritizes national sovereignty over global capitalism. Despite cultural differences, both of you are skeptical about how corporate globalization undermines local communities and worker power.';
        }
        if (p.authority.direction === 'order-focused' && p.economic.direction === 'mixed-economy') {
          return 'Prioritizes national strength and economic sovereignty. They believe strong nations can better protect their citizens from global economic forces, which fits with your support for structured governance.';
        }
        return 'Prioritizes national identity against globalization. Their concern that distant elites and international forces are undermining local communities and national self-determination resonates with you.';
      },

      'Freedom Entrepreneur': (p) => {
        if (p.economic.direction === 'market-oriented' && p.authority.direction === 'liberty-focused') {
          return 'Champions unrestricted markets and personal freedom. Their vision of voluntary exchange without government interference perfectly matches your strong support for both economic liberty and individual autonomy.';
        }
        if (p.cultural.direction === 'change-oriented' && p.authority.direction === 'liberty-focused') {
          return 'Champions both market freedom and social liberty. They oppose both economic regulation and cultural conformity, which connects with your progressive values and anti-authoritarian instincts.';
        }
        if (p.economic.direction === 'market-oriented' && p.cultural.direction === 'tradition-focused') {
          return 'Champions free markets grounded in moral principles. They believe in individual responsibility and merit-based success within traditional frameworks of entrepreneurship.';
        }
        return 'Champions unrestricted markets as the path to prosperity. They believe removing government barriers unleashes human potential and innovation, which matches your economic instincts.';
      },

      'Minimalist Libertarian': (p) => {
        if (p.authority.direction === 'liberty-focused' && p.economic.direction === 'market-oriented') {
          return 'Wants government limited to basic functions while markets handle everything else. Their night-watchman state philosophy perfectly matches your libertarian instincts and market confidence.';
        }
        if (p.authority.direction === 'liberty-focused' && p.cultural.direction === 'change-oriented') {
          return 'Wants government out of both economics and personal lives. Their civil libertarian approach to individual rights connects with your progressive social views and anti-authoritarian stance.';
        }
        if (p.cultural.direction === 'tradition-focused' && p.authority.direction === 'liberty-focused') {
          return 'Wants to return to constitutional foundations and limited government. Their originalist approach to minimal state power fits with your traditional values and liberty-focused instincts.';
        }
        return 'Wants government doing only the essentials while leaving people free to organize voluntarily. Their minimal state philosophy resonates with your preference for individual autonomy.';
      },

      'Collective Rebel': (p) => {
        if (p.economic.direction === 'populist' && p.authority.direction === 'liberty-focused') {
          return 'Believes workers should control production through direct action, not politicians. Their vision of grassroots workplace democracy matches your economic populism and anti-authoritarian instincts.';
        }
        if (p.authority.direction === 'liberty-focused' && p.cultural.direction === 'change-oriented') {
          return 'Believes in building new social structures through collective organizing. Their bottom-up revolutionary approach connects with your progressive values and distrust of centralized power.';
        }
        if (p.economic.direction === 'populist' && p.cultural.direction === 'tradition-focused') {
          return 'Believes workers should control their workplaces like traditional craft guilds. Despite cultural differences, you share their vision of producer-controlled economics over distant corporate management.';
        }
        return 'Believes workers should run their own workplaces without bosses or bureaucrats. Their vision of workplace democracy speaks to your concerns about economic power concentration.';
      },

      'Pragmatic Moderate': (p) => {
        if (p.authority.direction === 'balanced-governance' && p.economic.direction === 'mixed-economy') {
          return 'Prefers evidence-based solutions over ideological purity. Your balanced approach to both economics and governance perfectly matches their pragmatic, results-oriented political style.';
        }
        if (p.cultural.direction === 'change-oriented' && p.authority.direction === 'balanced-governance') {
          return 'Supports gradual social progress through institutional reform. Your progressive instincts and measured approach to change align with their evidence-based reform philosophy.';
        }
        if (p.cultural.direction === 'tradition-focused' && p.economic.direction === 'mixed-economy') {
          return 'Favors cautious change that preserves stability while addressing real problems. Your traditional values and pragmatic economic approach resonate with their incremental reform style.';
        }
        return 'Seeks practical solutions that work regardless of ideological labels. Your flexible approach to politics connects with their evidence-based, non-dogmatic problem-solving style.';
      },

      'People\'s Advocate': (p) => {
        if (p.isModerate) {
          return 'Fights for ordinary people against economic and political elites. While you prefer balanced approaches, you can appreciate their focus on championing working-class interests against powerful special interests.';
        }
        if (p.economic.direction.includes('populist') && p.authority.direction.includes('authoritarian')) {
          return 'Channels working-class anger into demands for economic populism under strong leadership. Your economic concerns and support for organized action align with their FDR-style coalition politics.';
        }
        if (p.economic.direction.includes('populist') && p.cultural.direction.includes('traditional')) {
          return 'Fights for ordinary families against global elites and cultural disruption. Your economic populism and traditional values connect with their defense of working-class communities and culture.';
        }
        return 'Fights for ordinary people against economic and political elites. Your concerns about power concentration connect with their belief that strong leaders should champion working-class interests.';
      },

      // Add remaining 9 ideologies
      'Order-First Conservative': (p) => {
        if (p.isModerate) {
          return 'Values hierarchy and strong leadership to maintain social order. While you prefer balanced governance, you can understand their emphasis on stability and the importance of established institutions.';
        }
        if (p.authority.direction.includes('authoritarian') && p.cultural.direction.includes('traditional')) {
          return 'Values hierarchy and strong leadership rooted in traditional principles. Your support for organized authority and traditional values strongly align with their emphasis on order and cultural continuity.';
        }
        if (p.authority.direction.includes('authoritarian')) {
          return 'Values hierarchy and strong leadership as necessary for social stability. Your support for structured governance resonates with their belief that firm authority prevents chaos and social breakdown.';
        }
        return 'Values hierarchy and strong leadership as foundations of stable society. You connect with their concern that too much questioning of authority leads to social fragmentation.';
      },

      'Structured Progressive': (p) => {
        if (p.isModerate) {
          return 'Seeks systemic reform through existing democratic institutions. Your measured approach aligns well with their belief in working within the system to create progressive change through evidence-based policy.';
        }
        if (p.economic.direction.includes('populist') && p.cultural.direction.includes('progressive')) {
          return 'Seeks systemic reform through democratic institutions and progressive policy. Your economic concerns and progressive values align perfectly with their vision of transforming capitalism through democratic means.';
        }
        if (p.authority.direction.includes('authoritarian') && p.cultural.direction.includes('progressive')) {
          return 'Seeks progressive change through strong institutional action. Your support for organized governance and social progress connects with their technocratic approach to systematic reform.';
        }
        return 'Seeks systemic reform within existing frameworks to create equity. Your interest in structured change resonates with their institutional approach to progressive transformation.';
      },

      'Structured Capitalist': (p) => {
        if (p.isModerate) {
          return 'Believes markets work best with smart government guidance. Your balanced economic approach aligns with their vision of partnership between business and government for national prosperity.';
        }
        if (p.economic.direction.includes('market') && p.authority.direction.includes('authoritarian')) {
          return 'Believes in guided free markets for national good. Your market orientation and support for organized governance align with their corporatist vision of state-directed capitalism.';
        }
        if (p.authority.direction.includes('authoritarian')) {
          return 'Believes markets need state direction to serve broader social goals. Your support for structured governance resonates with their belief that unfettered capitalism requires institutional guidance.';
        }
        return 'Believes corporate activity should be guided by state direction for societal benefit. You connect with their view that pure laissez-faire is as problematic as pure socialism.';
      },

      'Tradition Capitalist': (p) => {
        if (p.isModerate) {
          return 'Defends free markets while emphasizing moral principles and traditional values. Your balanced approach can appreciate their integration of economic freedom with cultural stability.';
        }
        if (p.economic.direction.includes('market') && p.cultural.direction.includes('traditional')) {
          return 'Defends free markets grounded in traditional moral frameworks. Your market orientation and traditional values perfectly align with their vision of entrepreneurship within established cultural boundaries.';
        }
        if (p.cultural.direction.includes('traditional')) {
          return 'Defends traditional values alongside free enterprise. Your traditional instincts connect with their belief that economic success must be grounded in moral discipline and cultural continuity.';
        }
        return 'Defends both free markets and timeless values. You relate to their concern that economic freedom works best within stable cultural and moral frameworks.';
      },

      'Cooperative Dreamer': (p) => {
        if (p.isModerate) {
          return 'Envisions communities organizing themselves without bosses or centralized states. While you prefer practical approaches, you can appreciate their idealistic vision of collective self-management and voluntary cooperation.';
        }
        if (p.economic.direction.includes('populist') && p.authority.direction.includes('libertarian')) {
          return 'Envisions decentralized, community-led socialism built on voluntary cooperation. Your economic concerns and libertarian instincts align with their vision of collective self-management without state coercion.';
        }
        if (p.authority.direction.includes('libertarian') && p.cultural.direction.includes('progressive')) {
          return 'Envisions progressive communities organizing without hierarchical control. Your libertarian values and progressive instincts connect with their vision of voluntary collective action for social transformation.';
        }
        return 'Believes true freedom is collective, achieved through voluntary cooperation rather than competition. Your interest in alternatives to current systems resonates with their communitarian idealism.';
      },

      'Underground Organizer': (p) => {
        if (p.isModerate) {
          return 'Builds alternative systems outside mainstream institutions. While you work within existing frameworks, you can understand their approach of creating parallel structures when conventional politics fails.';
        }
        if (p.authority.direction.includes('libertarian') && p.economic.direction.includes('market')) {
          return 'Uses counter-economic strategies to bypass state control. Your libertarian instincts and market orientation align with their belief in building alternative economic networks outside government oversight.';
        }
        if (p.authority.direction.includes('libertarian')) {
          return 'Builds alternatives outside the system through crypto networks, black markets, and parallel institutions. Your anti-authoritarian instincts connect with their strategy of routing around rather than reforming power structures.';
        }
        return 'Pushes for counter-economic strategies to undermine state dominance. You relate to their belief that if the system won\'t change, people should build alternatives outside it.';
      },

      'Localist Organizer': (p) => {
        if (p.isModerate) {
          return 'Supports decentralized local economies and community self-governance. Your balanced approach appreciates their emphasis on human-scale democracy and local control over distant bureaucracy.';
        }
        if (p.authority.direction.includes('libertarian') && p.cultural.direction.includes('traditional')) {
          return 'Promotes local economies rooted in traditional community values. Your libertarian instincts and traditional values align with their vision of small-scale, face-to-face democracy.';
        }
        if (p.authority.direction.includes('libertarian')) {
          return 'Supports decentralized local economies and community self-management. Your preference for local control over centralized authority resonates with their vision of human-scale democratic governance.';
        }
        return 'Trusts neighbors more than nations and believes communities should manage their own affairs. You connect with their skepticism of distant bureaucrats making decisions for local communities.';
      },

      'Green Radical': (p) => {
        if (p.isModerate) {
          return 'Combines environmental action with critiques of growth-obsessed capitalism. While you prefer gradual change, you can understand their urgency about climate threats requiring systematic economic transformation.';
        }
        if (p.economic.direction.includes('populist') && p.cultural.direction.includes('progressive')) {
          return 'Merges environmental action with anti-capitalist organizing. Your economic concerns and progressive values align with their belief that real environmentalism requires dismantling growth-obsessed systems.';
        }
        if (p.cultural.direction.includes('progressive')) {
          return 'Combines environmental activism with progressive social transformation. Your progressive instincts connect with their vision of building sustainable communities that challenge both ecological destruction and social hierarchies.';
        }
        return 'Knows capitalism is cooking the planet and believes environmental protection requires economic transformation. You relate to their concern that market-based solutions aren\'t adequate for climate challenges.';
      },

      'Radical Capitalist': (p) => {
        if (p.isModerate) {
          return 'Believes government should not exist at all, with markets handling everything. While you prefer mixed approaches, you can understand their consistency in applying free-market principles to all social functions.';
        }
        if (p.economic.direction.includes('market') && p.authority.direction.includes('libertarian')) {
          return 'Envisions society with no government, only voluntary exchange and private property. Your market orientation and libertarian values align perfectly with their vision of total voluntary exchange replacing state functions.';
        }
        if (p.authority.direction.includes('libertarian')) {
          return 'Believes private property and voluntary contracts can replace every state function, including courts and police. Your anti-authoritarian instincts connect with their vision of purely voluntary social organization.';
        }
        return 'Believes government should not exist at all, replaced by total voluntary exchange. You relate to their concern that even minimal government inevitably expands and corrupts market relationships.';
      }
    };

    const builder = narrativeBuilders[alignment.label];
    return builder ? builder(profile) : `Represents ${alignment.label} ideology with perspectives that resonate with your political instincts.`;
  };
  
  // Calculate distances to all alignments
  const alignmentDistances = alignments
    .filter(alignment => alignment.label !== findVisionAlignment(userX, userY).label) // Exclude user's own alignment
    .map(alignment => {
      // Calculate center point of alignment range
      const centerX = (alignment.xRange[0] + alignment.xRange[1]) / 2;
      const centerY = (alignment.yRange[0] + alignment.yRange[1]) / 2;
      
      // Calculate Euclidean distance
      const distance = Math.sqrt(Math.pow(userX - centerX, 2) + Math.pow(userY - centerY, 2));
      
      // Convert distance to match percentage (closer = higher match)
      // Max distance on compass is ~14.14, so we invert and scale
      // Add slight variation to avoid identical percentages
      const baseMatch = (1 - distance / 14.14) * 100;
      const variation = (Math.sin(centerX + centerY) * 3); // Small deterministic variation
      const match = Math.max(0, Math.min(100, Math.round(baseMatch + variation)));
      
      return {
        name: alignment.label,
        description: generateDescription(alignment, userEconomic, userSocial, userProgressive),
        match,
        distance
      };
    })
    .sort((a, b) => b.match - a.match) // Sort by highest match
    .slice(0, 2) // Take top 2
    .map(({ name, description, match }) => ({ name, description, match }));
  
  return alignmentDistances;
}

export async function getSurprisingAlignments(userEconomic: number, userSocial: number, userProgressive: number = 0, excludeGroups: string[] = []): Promise<Array<{group: string, commonGround: string}>> {
  const userX = toVisionScale(userEconomic);
  const userY = toVisionScale(userSocial);
  const userAlignment = findVisionAlignment(userX, userY, toVisionScale(userProgressive));
  
  // Use the same psychology analyzer as the "You Align With" section
  const profile = {
    economic: { 
      strength: Math.abs(userEconomic), 
      direction: userEconomic < -50 ? 'strongly-populist' :
                userEconomic < -20 ? 'mildly-populist' :
                userEconomic > 50 ? 'strongly-market' :
                userEconomic > 20 ? 'mildly-market' : 'moderate-economic',
      score: userEconomic 
    },
    authority: { 
      strength: Math.abs(userSocial), 
      direction: userSocial < -50 ? 'strongly-libertarian' :
                userSocial < -20 ? 'mildly-libertarian' :
                userSocial > 50 ? 'strongly-authoritarian' :
                userSocial > 20 ? 'mildly-authoritarian' : 'moderate-authority',
      score: userSocial 
    },
    cultural: { 
      strength: Math.abs(userProgressive), 
      direction: userProgressive < -50 ? 'strongly-progressive' :
                userProgressive < -20 ? 'mildly-progressive' :
                userProgressive > 50 ? 'strongly-traditional' :
                userProgressive > 20 ? 'mildly-traditional' : 'moderate-cultural',
      score: userProgressive 
    },
    isModerate: Math.abs(userEconomic) < 20 && Math.abs(userSocial) < 20 && Math.abs(userProgressive) < 20
  };

  // Psychology-based surprising connections for each ideology
  const surprisingConnectionBuilders: Record<string, (profile: any) => string> = {
    'Revolutionary Socialist': (p) => {
      if (p.isModerate) {
        return 'Despite vast ideological differences, you both recognize that current economic systems aren\'t delivering for ordinary working people.';
      }
      if (p.economic.direction.includes('market') && p.authority.direction.includes('libertarian')) {
        return 'Despite opposing solutions, you both see corporate-government collusion as the real enemy of individual freedom and economic opportunity.';
      }
      if (p.cultural.direction.includes('traditional')) {
        return 'Surprisingly, you both believe global capitalism is destroying stable communities and traditional ways of life.';
      }
      return 'Both of you want political systems that actually serve ordinary people rather than just elites.';
    },

    'Radical Capitalist': (p) => {
      if (p.isModerate) {
        return 'While their approach is extreme, you can understand their frustration with government inefficiency and their desire for voluntary solutions.';
      }
      if (p.economic.direction.includes('populist') && p.authority.direction.includes('libertarian')) {
        return 'Despite economic differences, you both believe ordinary people should be free from control by distant elites, whether corporate or governmental.';
      }
      if (p.cultural.direction.includes('progressive')) {
        return 'Surprisingly, you both oppose institutional oppression and believe in voluntary association, just disagreeing on what counts as oppression.';
      }
      return 'Though you disagree on economics, you share frustration with institutions that seem disconnected from regular people\'s needs.';
    },

    'Order-First Conservative': (p) => {
      if (p.isModerate) {
        return 'Despite their strong positions, you both value institutional stability and worry about social fragmentation in modern society.';
      }
      if (p.authority.direction.includes('authoritarian')) {
        return 'You both believe strong leadership and clear social structures are necessary, though you may disagree on which values should guide them.';
      }
      if (p.economic.direction.includes('populist')) {
        return 'You both see global elites as threats to ordinary communities, though you differ on whether the solution is economic or cultural change.';
      }
      return 'Authenticity and real results matter more to both of you than empty political rhetoric and unfulfilled promises.';
    },

    'Green Radical': (p) => {
      if (p.isModerate) {
        return 'While their methods are extreme, you both recognize that environmental challenges require systematic thinking beyond individual consumer choices.';
      }
      if (p.authority.direction.includes('libertarian')) {
        return 'You both distrust large institutions and believe grassroots organizing is more effective than top-down mandates, even for environmental issues.';
      }
      if (p.economic.direction.includes('populist')) {
        return 'You both see corporate power as the enemy of ordinary people, whether through economic exploitation or environmental destruction.';
      }
      return 'You share concern for protecting local communities, though you focus on different types of outside pressures.';
    },

    'Minimalist Libertarian': (p) => {
      if (p.isModerate) {
        return 'You both appreciate the importance of individual freedom and worry about government overreach, though you prefer more balanced approaches.';
      }
      if (p.cultural.direction.includes('progressive')) {
        return 'Despite different priorities, you both oppose authoritarianism and believe people should be free to live their lives without institutional interference.';
      }
      if (p.economic.direction.includes('populist')) {
        return 'You both oppose corporate bailouts, special interest lobbying, and crony capitalism that benefits the wealthy at taxpayer expense.';
      }
      return 'Your respect for individual liberty creates common ground, even where you differ on economic policy.';
    },

    'Homeland Defender': (p) => {
      if (p.isModerate) {
        return 'Despite cultural differences, you both worry about how global forces can undermine local communities and democratic self-governance.';
      }
      if (p.economic.direction.includes('populist')) {
        return 'You both channel anger against global elites who seem disconnected from the struggles of ordinary working families.';
      }
      if (p.authority.direction.includes('authoritarian')) {
        return 'You both believe strong institutions and clear leadership are necessary to protect communities from external threats and internal chaos.';
      }
      return 'Working families and local communities matter more to both of you than abstract economic theories.';
    },

    'Cooperative Dreamer': (p) => {
      if (p.isModerate) {
        return 'While their vision is idealistic, you both believe communities work best when people cooperate voluntarily rather than compete ruthlessly.';
      }
      if (p.authority.direction.includes('libertarian')) {
        return 'You both want voluntary associations free from coercion, whether from state bureaucrats or corporate bosses.';
      }
      if (p.cultural.direction.includes('traditional')) {
        return 'Despite different social views, you both emphasize community bonds and mutual aid over atomized individualism.';
      }
      return 'Cooperation and mutual aid resonate with both of you more than pure individual competition.';
    },

    'Underground Organizer': (p) => {
      if (p.isModerate) {
        return 'While their methods are unconventional, you both understand that sometimes people need alternatives when conventional politics fails them.';
      }
      if (p.authority.direction.includes('libertarian')) {
        return 'You both believe in building parallel institutions outside state control rather than trying to reform corrupt systems from within.';
      }
      if (p.economic.direction.includes('market')) {
        return 'You both appreciate entrepreneurial solutions and believe people should be free to build alternative economic networks.';
      }
      return 'When conventional approaches fall short, both of you see the value in practical alternatives.';
    },

    'People\'s Advocate': (p) => {
      if (p.isModerate) {
        return 'Despite their populist style, you both believe government should serve ordinary citizens rather than special interests and wealthy donors.';
      }
      if (p.economic.direction.includes('populist')) {
        return 'You both channel working-class frustration into demands that political leaders fight for families over Wall Street interests.';
      }
      if (p.authority.direction.includes('authoritarian')) {
        return 'You both believe effective leadership requires strong institutions that can take decisive action for the common good.';
      }
      return 'Political leaders should represent regular families, not just wealthy donors and special interests: something both of you believe strongly.';
    }
  };

  // Find alignments that are ideologically distant but share some common ground
  const surprisingAlignments = alignments
    .filter(alignment => {
      // Exclude user's alignment, very close ones, and already shown groups
      const centerX = (alignment.xRange[0] + alignment.xRange[1]) / 2;
      const centerY = (alignment.yRange[0] + alignment.yRange[1]) / 2;
      const distance = Math.sqrt(Math.pow(userX - centerX, 2) + Math.pow(userY - centerY, 2));
      
      return alignment.label !== userAlignment.label && 
             distance > 5 && 
             !excludeGroups.includes(alignment.label);
    })
    .map(alignment => {
      const builder = surprisingConnectionBuilders[alignment.label];
      const commonGround = builder ? builder(profile) : 
        'Political systems should work for regular people, not just elites: something both of you believe.';
      
      const centerX = (alignment.xRange[0] + alignment.xRange[1]) / 2;
      const centerY = (alignment.yRange[0] + alignment.yRange[1]) / 2;
      const distance = Math.sqrt(Math.pow(userX - centerX, 2) + Math.pow(userY - centerY, 2));
      
      return {
        group: alignment.label,
        commonGround,
        distance
      };
    })
    .sort((a, b) => b.distance - a.distance) // Sort by most surprising (distant)
    .slice(0, 2) // Take top 2 most surprising
    .map(({ group, commonGround }) => ({ group, commonGround }));
  
  return surprisingAlignments;
}

export async function getWaitlistCount(): Promise<number> {
  try {
    const snapshot = await getDocs(collection(db, 'waitlist'));
    return snapshot.size;
  } catch (error) {
    debugError('Error getting waitlist count:', error);
    return 0;
  }
}

// Batch calculate and cache ALL grid percentages at once
// This should be run periodically (e.g., once per day via a scheduled function)
export async function batchUpdateAllGridPercentages() {
  try {
    debugLog('Starting batch update of all grid percentages...');
    
    // Get total count once
    const statsRef = doc(db, 'aggregatedStats', 'totals');
    const statsDoc = await getDoc(statsRef);
    const totalCount = statsDoc.exists() ? statsDoc.data().totalCount || 0 : 0;
    
    if (totalCount === 0) {
      debugLog('No responses to calculate percentages for');
      return;
    }
    
    // Get all grid cell counts in one query
    const gridCellsSnapshot = await getDocs(collection(db, 'gridCellCounts'));
    
    // Calculate all percentages
    const updates: Promise<any>[] = [];
    
    gridCellsSnapshot.docs.forEach(docSnapshot => {
      const cellData = docSnapshot.data();
      const cellId = docSnapshot.id;
      const cellCount = cellData.count || 0;
      const percentage = Math.max(1, Math.round((cellCount / totalCount) * 100));
      
      // Update cache for this cell
      const cacheRef = doc(db, 'cachedPercentages', cellId);
      updates.push(
        setDoc(cacheRef, {
          percentage,
          cellId,
          lastUpdated: serverTimestamp(),
          economicCell: cellData.economicCell,
          socialCell: cellData.socialCell,
          quizType: cellData.quizType,
          totalCount: totalCount,
          cellCount: cellCount
        })
      );
    });
    
    // Also pre-cache percentages for empty cells (0%)
    const quizTypes = ['short', 'long'];
    quizTypes.forEach(quizType => {
      const gridSize = quizType === 'short' ? 3 : 9;
      for (let econCell = 0; econCell < gridSize; econCell++) {
        for (let socialCell = 0; socialCell < gridSize; socialCell++) {
          const cellId = `${quizType}_${econCell}_${socialCell}`;
          if (!gridCellsSnapshot.docs.find(docSnapshot => docSnapshot.id === cellId)) {
            const cacheRef = doc(db, 'cachedPercentages', cellId);
            updates.push(
              setDoc(cacheRef, {
                percentage: 0,
                cellId,
                lastUpdated: serverTimestamp(),
                economicCell: econCell,
                socialCell: socialCell,
                quizType: quizType,
                totalCount: totalCount,
                cellCount: 0
              })
            );
          }
        }
      }
    });
    
    await Promise.all(updates);
    
    debugLog(`Batch update complete! Updated ${updates.length} grid cell percentages`);
    return { success: true, updatedCells: updates.length };
    
  } catch (error) {
    debugError('Error during batch update:', error);
    throw error;
  }
}

// One-time migration function to initialize aggregated stats from existing data
// Run this ONCE to set up the aggregated collections
export async function migrateToAggregatedStats() {
  try {
    debugLog('Starting migration to aggregated stats...');
    
    // Get all existing quiz responses
    const allResponsesSnapshot = await getDocs(collection(db, 'quizResponses'));
    const totalCount = allResponsesSnapshot.size;
    
    debugLog(`Found ${totalCount} existing quiz responses to migrate`);
    
    // Initialize total count
    await setDoc(doc(db, 'aggregatedStats', 'totals'), {
      totalCount: totalCount,
      lastUpdated: serverTimestamp()
    });
    
    // Initialize grid cell counts
    const gridCellCounts: Record<string, number> = {};
    
    allResponsesSnapshot.docs.forEach(doc => {
      const data = doc.data() as QuizResult;
      const economic = data.result.economicScore;
      const social = data.result.socialScore;
      
      // Calculate for both grid types
      ['short', 'long'].forEach(quizType => {
        const cellSize = quizType === 'short' ? (200 / 3) : (200 / 9);
        const gridSize = quizType === 'short' ? 3 : 9;
        
        let econCell = Math.floor((economic + 100) / cellSize);
        if (econCell >= gridSize) econCell = gridSize - 1;
        
        let socialCell = Math.floor((100 - social) / cellSize);
        if (socialCell >= gridSize) socialCell = gridSize - 1;
        
        const cellId = `${quizType}_${econCell}_${socialCell}`;
        gridCellCounts[cellId] = (gridCellCounts[cellId] || 0) + 1;
      });
    });
    
    // Write all grid cell counts
    const promises = Object.entries(gridCellCounts).map(([cellId, count]) => {
      const [quizType, econCell, socialCell] = cellId.split('_');
      return setDoc(doc(db, 'gridCellCounts', cellId), {
        count: count,
        economicCell: parseInt(econCell),
        socialCell: parseInt(socialCell),
        quizType: quizType,
        lastUpdated: serverTimestamp()
      });
    });
    
    await Promise.all(promises);
    
    debugLog(`Migration complete! Migrated ${totalCount} responses across ${Object.keys(gridCellCounts).length} grid cells`);
    return { success: true, totalCount, cellCount: Object.keys(gridCellCounts).length };
    
  } catch (error) {
    debugError('Error during migration:', error);
    throw error;
  }
} 
