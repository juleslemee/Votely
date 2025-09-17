// Import unified question loader
import { 
  getPhase1Questions, 
  getTiebreakerQuestions,
  Question as TSVQuestion,
  loadAllQuestions 
} from '../../lib/question-loader';
import { fetchTSVWithCache } from '@/lib/tsv-cache';
import { debugLog, debugWarn, debugError } from '@/lib/debug-logger';

type PoliticalAxis = 'economic' | 'governance' | 'social';

export interface Question {
  id: number;
  question: string;
  description?: string; // Description from description column in TSV
  axis: PoliticalAxis;
  agreeDir?: -1 | 1; // Direction that "agree" pushes the score
  boundary?: 'LEFT_CENTER' | 'CENTER_RIGHT' | 'LIB_CENTER' | 'CENTER_AUTH'; // For tiebreakers
  originalId?: string; // Keep track of original TSV ID
  removalPriority?: string; // From removal_priority column (e.g., "first", "second")
}

// Cache for loaded questions - FORCE CLEAR FOR DEBUGGING
let cachedPhase1: Question[] | null = null;
let cachedTiebreakers: Question[] | null = null; 
let cachedAll: Question[] | null = null;

// Clear caches on module load to force fresh data loading - timestamp: 22:20
cachedPhase1 = null;
cachedTiebreakers = null;
cachedAll = null;

// Convert TSV question to app Question format
function convertQuestion(q: TSVQuestion): Question {
  // Debug: Log conversion for questions that should have removal priority
  if (['P25', 'P28', 'P29', 'P36'].includes(q.originalId || '')) {
    debugLog(`🔄 Converting ${q.originalId}: removalPriority="${q.removalPriority}" (type: ${typeof q.removalPriority})`);
  }
  
  return {
    id: q.id,
    question: q.text,
    description: q.description,
    axis: q.axis,
    agreeDir: q.agreeDir,
    boundary: q.boundary,
    originalId: q.originalId,
    text: q.text, // Also include text property for compatibility
    removalPriority: q.removalPriority // Include removal priority for tiebreaker replacement
  } as Question;
}

// Load all questions from TSV (replaces hardcoded array)
export const allQuestions: Question[] = [
  // This array will be populated from TSV on first use
  // Keeping as empty array for now to maintain backwards compatibility
];

// Async function to get Phase 1 questions from TSV
export async function getPhase1QuestionsAsync(): Promise<Question[]> {
  if (cachedPhase1) {
    debugLog(`📦 Using cached Phase 1 questions (${cachedPhase1.length} questions)`);
    return cachedPhase1;
  }
  
  debugLog(`🔄 Loading fresh Phase 1 questions from TSV...`);
  const tsvQuestions = await getPhase1Questions();
  debugLog(`📥 Got ${tsvQuestions.length} TSV questions, converting...`);
  cachedPhase1 = tsvQuestions.map(convertQuestion);
  debugLog(`✅ Converted to ${cachedPhase1.length} app questions`);
  return cachedPhase1;
}

// Async function to get tiebreaker questions from TSV
export async function getTiebreakerQuestionsAsync(boundaries?: string[]): Promise<Question[]> {
  if (cachedTiebreakers && !boundaries) return cachedTiebreakers;
  const tsvQuestions = boundaries 
    ? await getTiebreakerQuestions(boundaries)
    : await getTiebreakerQuestions(['LEFT_CENTER', 'CENTER_RIGHT', 'LIB_CENTER', 'CENTER_AUTH']);
  const converted = tsvQuestions.map(convertQuestion);
  if (!boundaries) cachedTiebreakers = converted;
  return converted;
}

// Get all questions (phase 1 + tiebreakers)
export async function getAllQuestionsAsync(): Promise<Question[]> {
  if (cachedAll) return cachedAll;
  const [phase1, tiebreakers] = await Promise.all([
    getPhase1QuestionsAsync(),
    getTiebreakerQuestionsAsync()
  ]);
  cachedAll = [...phase1, ...tiebreakers];
  return cachedAll;
}

// Short quiz: Filter questions marked with short_quiz = 'yes'
export async function generateShortQuizQuestions(): Promise<Question[]> {
  debugLog('🎲 Generating randomized short quiz questions...');
  
  // Get all Phase 1 questions (including tiebreakers) from TSV
  const allPhase1Questions = await getAllQuestionsAsync();
  
  // Filter for questions marked with short_quiz = 'yes' in TSV
  const allQuestions = await loadAllQuestions();
  const shortQuizQuestions: Question[] = [];
  
  for (const [originalId, tsvQuestion] of allQuestions) {
    if (tsvQuestion.shortQuiz && tsvQuestion.phase === 1) {
      // Find the converted question in our Phase 1 array (now includes all 44 questions: 36 core + 8 tiebreakers)
      const convertedQuestion = allPhase1Questions.find(q => q.originalId === originalId);
      if (convertedQuestion) {
        shortQuizQuestions.push(convertedQuestion);
      }
    }
  }
  
  const randomizedShort = shuffleArray(shortQuizQuestions);
  
  debugLog(`📝 Short Quiz: ${randomizedShort.length} questions randomized (from short_quiz='yes' column)`);
  debugLog('Question order:', randomizedShort.map(q => `${q.originalId || q.id}`).join(', '));
  
  return randomizedShort;
}

// Static fallback for short quiz (backwards compatibility)
export const shortQuestions: Question[] = [];

// Get core Phase 1 questions - now async
export let phase1Questions: Question[] = [];
export let tiebreakerQuestions: Question[] = [];

// Initialize questions on module load
(async () => {
  try {
    const [p1, tb] = await Promise.all([
      getPhase1QuestionsAsync(),
      getTiebreakerQuestionsAsync()
    ]);
    phase1Questions = p1;
    tiebreakerQuestions = tb;
    // Also populate allQuestions for backwards compatibility
    allQuestions.push(...p1, ...tb);
  } catch (error) {
    debugError('Failed to load questions from TSV:', error);
  }
})();

// Randomize array order using Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Generate randomized long quiz questions with balanced distribution
// Current system: First 4 screens (20 questions) with 5 per screen
// NEW TARGET: First 3 screens (36 questions) with 12 per screen 
// Each screen: 4 econ + 4 authority + 4 social
export async function generateLongQuizQuestions(): Promise<Question[]> {
  debugLog('🎲 Generating randomized long quiz questions with balanced distribution...');
  
  // Get Phase 1 questions from TSV
  const p1Questions = await getPhase1QuestionsAsync();
  
  // Separate questions by axis AND direction for truly balanced distribution
  // Filter social questions by removal priority for screen filtering
  const economicLeft = p1Questions.filter(q => q.axis === 'economic' && q.agreeDir === -1);
  const economicRight = p1Questions.filter(q => q.axis === 'economic' && q.agreeDir === 1);
  const governanceLib = p1Questions.filter(q => q.axis === 'governance' && q.agreeDir === -1);
  const governanceAuth = p1Questions.filter(q => q.axis === 'governance' && q.agreeDir === 1);
  
  // Social questions separated by removal priority:
  // - No removal priority: Always safe to include in any screen
  // - "second" priority: Removed if we have 2+ tiebreakers (4+ tiebreaker questions)
  // - "first" priority: Removed first if we have 1+ tiebreakers (2+ tiebreaker questions)
  const socialProgNoRemoval = p1Questions.filter(q => 
    q.axis === 'social' && q.agreeDir === -1 && !q.removalPriority
  );
  const socialTradNoRemoval = p1Questions.filter(q => 
    q.axis === 'social' && q.agreeDir === 1 && !q.removalPriority
  );
  const socialProgFirstPriority = p1Questions.filter(q => 
    q.axis === 'social' && q.agreeDir === -1 && q.removalPriority === 'first'
  );
  const socialTradFirstPriority = p1Questions.filter(q => 
    q.axis === 'social' && q.agreeDir === 1 && q.removalPriority === 'first'
  );
  const socialProgSecondPriority = p1Questions.filter(q => 
    q.axis === 'social' && q.agreeDir === -1 && q.removalPriority === 'second'
  );
  const socialTradSecondPriority = p1Questions.filter(q => 
    q.axis === 'social' && q.agreeDir === 1 && q.removalPriority === 'second'
  );
  
  debugLog(`📋 Generating first 36 questions from ${p1Questions.length} available Phase 1 questions`);
  
  // Shuffle each subcategory
  const shuffledEconLeft = shuffleArray(economicLeft);
  const shuffledEconRight = shuffleArray(economicRight);
  const shuffledGovLib = shuffleArray(governanceLib);
  const shuffledGovAuth = shuffleArray(governanceAuth);
  const shuffledSocProgNoRemoval = shuffleArray(socialProgNoRemoval);
  const shuffledSocTradNoRemoval = shuffleArray(socialTradNoRemoval);
  const shuffledSocProgFirstPriority = shuffleArray(socialProgFirstPriority);
  const shuffledSocTradFirstPriority = shuffleArray(socialTradFirstPriority);
  const shuffledSocProgSecondPriority = shuffleArray(socialProgSecondPriority);
  const shuffledSocTradSecondPriority = shuffleArray(socialTradSecondPriority);
  
  // Build priority pools for social questions (safe first, all removable last)
  // Priority order: no removal (screens 1-2) > all removable questions combined (screen 3)
  const removableProgQuestions = [...shuffledSocProgSecondPriority, ...shuffledSocProgFirstPriority];
  const removableTradQuestions = [...shuffledSocTradSecondPriority, ...shuffledSocTradFirstPriority];
  
  const socialProgPool = [
    ...shuffledSocProgNoRemoval,
    ...shuffleArray(removableProgQuestions) // Shuffle combined removable questions
  ];
  const socialTradPool = [
    ...shuffledSocTradNoRemoval,
    ...shuffleArray(removableTradQuestions) // Shuffle combined removable questions
  ];
  
  debugLog(`📊 Available questions:`);
  debugLog(`  Economic: ${economicLeft.length}L/${economicRight.length}R`);
  debugLog(`  Governance: ${governanceLib.length}L/${governanceAuth.length}A`);
  debugLog(`  Social (no removal): ${socialProgNoRemoval.length}P/${socialTradNoRemoval.length}T (total: ${socialProgNoRemoval.length + socialTradNoRemoval.length})`);
  debugLog(`  Social (removable - combined "first"+"second"): ${removableProgQuestions.length}P/${removableTradQuestions.length}T (total: ${removableProgQuestions.length + removableTradQuestions.length})`);
  debugLog(`    - "second" priority: ${socialProgSecondPriority.length}P/${socialTradSecondPriority.length}T`);
  debugLog(`    - "first" priority: ${socialProgFirstPriority.length}P/${socialTradFirstPriority.length}T`);
  debugLog(`🧮 Social question math: Need 12 total for first 36 questions (6P + 6T)`);
  debugLog(`   Available: ${socialProgNoRemoval.length + socialTradNoRemoval.length} (no removal) + ${removableProgQuestions.length + removableTradQuestions.length} (removable) = ${socialProgNoRemoval.length + socialTradNoRemoval.length + removableProgQuestions.length + removableTradQuestions.length} total`);
  debugLog(`   Screen 3 needs: 6 social questions, have ${removableProgQuestions.length + removableTradQuestions.length} removable questions available`);
  
  // Debug: Check if we found the expected questions with removal priorities
  debugLog(`🔍 Debug - All removable questions (will be placed in screen 3):`);
  removableProgQuestions.forEach(q => debugLog(`    ${q.originalId}: "${q.removalPriority}" priority (progressive)`));
  removableTradQuestions.forEach(q => debugLog(`    ${q.originalId}: "${q.removalPriority}" priority (traditional)`));
  
  debugLog(`🎯 Target for first 36: 12 econ (6L,6R), 12 gov (6L,6A), 12 social (6P,6T)`);
  debugLog(`💡 Removal priority: "first" removed before "second" when tiebreakers needed`);
  
  // Check if we have enough questions for first 36 (3 screens of 12 each)
  // Distribution: 12 econ (6L, 6R), 12 gov (6L, 6A), 12 social (6P, 6T)
  const requiredCounts = {
    econLeft: 6, econRight: 6,
    govLib: 6, govAuth: 6,
    socProg: 6, socTrad: 6
  };
  
  if (economicLeft.length < requiredCounts.econLeft) {
    debugWarn(`⚠️ Not enough economic left questions: ${economicLeft.length}/${requiredCounts.econLeft}`);
  }
  if (economicRight.length < requiredCounts.econRight) {
    debugWarn(`⚠️ Not enough economic right questions: ${economicRight.length}/${requiredCounts.econRight}`);
  }
  if (governanceLib.length < requiredCounts.govLib) {
    debugWarn(`⚠️ Not enough governance libertarian questions: ${governanceLib.length}/${requiredCounts.govLib}`);
  }
  if (governanceAuth.length < requiredCounts.govAuth) {
    debugWarn(`⚠️ Not enough governance authoritarian questions: ${governanceAuth.length}/${requiredCounts.govAuth}`);
  }
  if (socialProgPool.length < requiredCounts.socProg) {
    debugWarn(`⚠️ Not enough social progressive questions: ${socialProgPool.length}/${requiredCounts.socProg}`);
  }
  if (socialTradPool.length < requiredCounts.socTrad) {
    debugWarn(`⚠️ Not enough social traditional questions: ${socialTradPool.length}/${requiredCounts.socTrad}`);
  }
  
  // Track indices for pulling from each subcategory
  const indices = {
    econLeft: 0, econRight: 0,
    govLib: 0, govAuth: 0,
    socProg: 0, socTrad: 0
  };
  
  // Build questions for each screen with balanced distribution
  const finalQuestions: Question[] = [];
  
  // NEW SCREEN-BY-SCREEN DISTRIBUTION PLAN - 3 SCREENS (36 questions)
  // Each screen: 4 econ (2L, 2R), 4 gov (2L, 2A), 4 social (2P, 2T) = 12 per screen
  // Total: 12 econ (6L, 6R), 12 gov (6L, 6A), 12 social (6P, 6T)
  const screenPlans = [
    // Screen 1 (Q1-12): 4E(2L,2R), 4A(2L,2A), 4C(2P,2T)
    { econLeft: 2, econRight: 2, govLib: 2, govAuth: 2, socProg: 2, socTrad: 2 },
    // Screen 2 (Q13-24): 4E(2L,2R), 4A(2L,2A), 4C(2P,2T)
    { econLeft: 2, econRight: 2, govLib: 2, govAuth: 2, socProg: 2, socTrad: 2 },
    // Screen 3 (Q25-36): 4E(2L,2R), 4A(2L,2A), 4C(2P,2T)
    { econLeft: 2, econRight: 2, govLib: 2, govAuth: 2, socProg: 2, socTrad: 2 }
    // Total: 12 econ (6L, 6R), 12 gov (6L, 6A), 12 social (6P, 6T)
  ];
  
  // Generate questions for each screen
  for (let screenIdx = 0; screenIdx < screenPlans.length; screenIdx++) {
    const plan = screenPlans[screenIdx];
    const screenQuestions: Question[] = [];
    
    // Add questions according to plan
    for (let i = 0; i < plan.econLeft; i++) {
      if (indices.econLeft < shuffledEconLeft.length) {
        screenQuestions.push(shuffledEconLeft[indices.econLeft++]);
      }
    }
    for (let i = 0; i < plan.econRight; i++) {
      if (indices.econRight < shuffledEconRight.length) {
        screenQuestions.push(shuffledEconRight[indices.econRight++]);
      }
    }
    for (let i = 0; i < plan.govLib; i++) {
      if (indices.govLib < shuffledGovLib.length) {
        screenQuestions.push(shuffledGovLib[indices.govLib++]);
      }
    }
    for (let i = 0; i < plan.govAuth; i++) {
      if (indices.govAuth < shuffledGovAuth.length) {
        screenQuestions.push(shuffledGovAuth[indices.govAuth++]);
      }
    }
    for (let i = 0; i < plan.socProg; i++) {
      if (indices.socProg < socialProgPool.length) {
        screenQuestions.push(socialProgPool[indices.socProg++]);
      }
    }
    for (let i = 0; i < plan.socTrad; i++) {
      if (indices.socTrad < socialTradPool.length) {
        screenQuestions.push(socialTradPool[indices.socTrad++]);
      }
    }
    
    // Shuffle within screen to randomize presentation
    const shuffledScreen = shuffleArray(screenQuestions);
    finalQuestions.push(...shuffledScreen);
  }
  
  // Log distribution per screen for verification (NEW: 12 questions per screen)
  debugLog(`📝 Phase 1 Initial: ${finalQuestions.length} questions (3 screens @ 12 per screen)`);
  for (let i = 0; i < 3; i++) {
    const screenQuestions = finalQuestions.slice(i * 12, (i + 1) * 12);
    const e = screenQuestions.filter(q => q.axis === 'economic').length;
    const g = screenQuestions.filter(q => q.axis === 'governance').length;
    const s = screenQuestions.filter(q => q.axis === 'social').length;
    const left = screenQuestions.filter(q => q.agreeDir === -1).length;
    const right = screenQuestions.filter(q => q.agreeDir === 1).length;
    debugLog(`Screen ${i + 1} (Q${i*12+1}-${(i+1)*12}): E:${e} G:${g} S:${s} | L:${left} R:${right}`);
  }
  
  // Overall balance check for first 36 questions
  const totalEcon = finalQuestions.filter(q => q.axis === 'economic').length;
  const totalGov = finalQuestions.filter(q => q.axis === 'governance').length;
  const totalSoc = finalQuestions.filter(q => q.axis === 'social').length;
  const totalLeft = finalQuestions.filter(q => q.agreeDir === -1).length;
  const totalRight = finalQuestions.filter(q => q.agreeDir === 1).length;
  debugLog(`✅ First 36 questions generated: ${totalEcon} econ, ${totalGov} gov, ${totalSoc} social`);
  debugLog(`✅ Direction balance: ${totalLeft} left-leaning, ${totalRight} right-leaning`);
  
  return finalQuestions;
}

// Generate the final 10 questions (screens 5-6) after tiebreaker evaluation
export async function generateFinal10Questions(
  usedQuestions: Question[], // Questions already used in first 20
  tiebreakerQuestions: Question[] = []
): Promise<Question[]> {
  debugLog('🎯 Generating final 10 questions (screens 5-6) after tiebreaker evaluation...');
  
  // Get all Phase 1 questions
  const allP1Questions = await getPhase1QuestionsAsync();
  
  // Get remaining unused questions
  const usedIds = new Set(usedQuestions.map(q => q.id));
  const unusedQuestions = allP1Questions.filter(q => !usedIds.has(q.id));
  
  debugLog(`📋 ${unusedQuestions.length} unused questions remaining for screens 5-6`);
  
  // Separate remaining questions by axis and direction
  const remainingEconLeft = unusedQuestions.filter(q => q.axis === 'economic' && q.agreeDir === -1);
  const remainingEconRight = unusedQuestions.filter(q => q.axis === 'economic' && q.agreeDir === 1);
  const remainingGovLib = unusedQuestions.filter(q => q.axis === 'governance' && q.agreeDir === -1);
  const remainingGovAuth = unusedQuestions.filter(q => q.axis === 'governance' && q.agreeDir === 1);
  const remainingSocProg = unusedQuestions.filter(q => q.axis === 'social' && q.agreeDir === -1);
  const remainingSocTrad = unusedQuestions.filter(q => q.axis === 'social' && q.agreeDir === 1);
  
  debugLog(`📊 Remaining - EL:${remainingEconLeft.length} ER:${remainingEconRight.length} GL:${remainingGovLib.length} GA:${remainingGovAuth.length} SP:${remainingSocProg.length} ST:${remainingSocTrad.length}`);
  
  // Shuffle remaining questions
  const shuffledRemaining = [
    ...shuffleArray(remainingEconLeft),
    ...shuffleArray(remainingEconRight),
    ...shuffleArray(remainingGovLib),
    ...shuffleArray(remainingGovAuth),
    ...shuffleArray(remainingSocProg),
    ...shuffleArray(remainingSocTrad)
  ];
  
  // Take first 10 questions (or however many we have)
  let final10 = shuffledRemaining.slice(0, 10);
  
  // Replace some questions with tiebreakers if provided
  if (tiebreakerQuestions.length > 0) {
    const maxReplacements = Math.min(tiebreakerQuestions.length, 4); // Max 4 tiebreakers
    debugLog(`🔄 Replacing ${maxReplacements} questions with tiebreakers`);
    
    // Replace social questions first (they're least important for macro positioning)
    for (let i = 0; i < maxReplacements && i < final10.length; i++) {
      const socialIndex = final10.findIndex(q => q.axis === 'social');
      if (socialIndex >= 0 && i < tiebreakerQuestions.length) {
        final10[socialIndex] = tiebreakerQuestions[i];
        debugLog(`✅ Replaced social question with tiebreaker: "${tiebreakerQuestions[i].question.substring(0, 50)}..."`);
      }
    }
  }
  
  // Final shuffle
  final10 = shuffleArray(final10);
  
  debugLog(`✅ Generated ${final10.length} questions for screens 5-6`);
  return final10;
}

// Function to adjust final questions based on tiebreaker needs (called after screen 4)
export async function adjustForTiebreakers(
  remainingQuestions: Question[],
  economicScore: number,
  governanceScore: number
): Promise<Question[]> {
  debugLog('🎯 Checking for tiebreaker needs...');
  debugLog(`Current scores - Economic: ${economicScore.toFixed(2)}, Governance: ${governanceScore.toFixed(2)}`);
  
  // Check proximity to macro cell boundaries (±33.33 for 3x3 grid)
  // New threshold system: -56 to -22 and +22 to +56 (macro boundaries remain ±33.33)
  const boundaries: string[] = [];
  
  // Economic tiebreaker zones
  if (economicScore >= -56 && economicScore <= -22) {
    boundaries.push('LEFT_CENTER');
    debugLog('📍 In Left-Center economic tiebreaker zone');
  }
  if (economicScore >= 22 && economicScore <= 56) {
    boundaries.push('CENTER_RIGHT');
    debugLog('📍 In Center-Right economic tiebreaker zone');
  }
  
  // Authority tiebreaker zones
  if (governanceScore >= -56 && governanceScore <= -22) {
    boundaries.push('LIB_CENTER');
    debugLog('📍 In Lib-Center authority tiebreaker zone');
  }
  if (governanceScore >= 22 && governanceScore <= 56) {
    boundaries.push('CENTER_AUTH');
    debugLog('📍 In Center-Auth authority tiebreaker zone');
  }
  
  if (boundaries.length === 0) {
    debugLog('✅ No tiebreakers needed - clear positioning');
    return remainingQuestions;
  }
  
  debugLog(`🎯 Selecting targeted tiebreakers for boundaries: ${boundaries.join(', ')}`);
  
  // Get relevant tiebreaker questions for detected boundaries from TSV
  const relevantTiebreakers = await getTiebreakerQuestionsAsync(boundaries);
  
  debugLog(`Found ${relevantTiebreakers.length} relevant tiebreaker questions`);
  
  // Count available social questions to replace
  const socialIndices = remainingQuestions
    .map((q, i) => q.axis === 'social' ? i : -1)
    .filter(i => i !== -1);
  
  const maxReplacements = Math.min(relevantTiebreakers.length, socialIndices.length, 4);
  debugLog(`Will replace up to ${maxReplacements} social questions with tiebreakers`);
  
  // Replace social questions with targeted tiebreakers
  let adjustedQuestions = [...remainingQuestions];
  for (let i = 0; i < maxReplacements; i++) {
    adjustedQuestions[socialIndices[i]] = relevantTiebreakers[i];
    debugLog(`✅ Added tiebreaker: "${relevantTiebreakers[i].question.substring(0, 50)}..."`);
  }
  
  return adjustedQuestions;
}

// Phase 2 Question type with supplementary axis
export interface Phase2Question extends Question {
  supplementAxis: string; // e.g., 'ELGL-A' for Leadership Model in EL-GL cell
  axisName?: string; // e.g., 'Leadership Model'
}

// Load and parse Phase 2 questions from TSV
async function loadPhase2QuestionsFromTSV(): Promise<Map<string, Phase2Question[]>> {
  try {
    // Use cached fetch to avoid repeated requests
    const text = await fetchTSVWithCache('/VotelyQuestionsNewestQuestions.tsv');
    const lines = text.trim().split('\n');
    const headers = lines[0].split('\t');
    
    const phase2Map = new Map<string, Phase2Question[]>();
    
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split('\t');
      const phase = row[8]; // phase column (index 8)

      if (phase === '2') {
        const id = row[1]; // id_code column like ERGL-A-01
        const text = row[2]; // text column (index 2)
        const supplementAxis = row[10]; // axis_code column (index 10) contains supplementary axis like ERGL-A
        const agreeDir = parseInt(row[6]) || 1; // agree_dir column (index 6)
        
        // Generate a unique numeric ID for the question
        // Phase 2 questions should start at 45 (after 44 Phase 1 questions)
        let totalPhase2Count = 0;
        for (const questions of phase2Map.values()) {
          totalPhase2Count += questions.length;
        }
        const numericId = 45 + totalPhase2Count;
        
        const question: Phase2Question = {
          id: numericId,
          originalId: id, // Store the original ID from TSV
          question: text,
          description: row[3], // Description column (index 3)
          axis: 'supplementary' as any, // Mark as supplementary axis
          supplementAxis: supplementAxis,
          agreeDir: agreeDir as -1 | 1
        };
        
        // Group by supplementary axis code (e.g., ELGA-A)
        if (!phase2Map.has(supplementAxis)) {
          phase2Map.set(supplementAxis, []);
        }
        phase2Map.get(supplementAxis)!.push(question);
      }
    }
    
    return phase2Map;
  } catch (error) {
    debugError('Error loading Phase 2 questions:', error);
    return new Map();
  }
}

// Map of supplementary axis names from supplement-axes.tsv (updated for 6-axis system)
const SUPPLEMENTARY_AXES: Record<string, string> = {
  // EL-GA: Revolutionary Communism & State Socialism
  'ELGA-A': 'Leadership Model',
  'ELGA-B': 'National vs International',
  'ELGA-C': 'Urban vs Rural Base',
  'ELGA-D': 'Class vs Ethno-Populism',
  'ELGA-E': 'Military Role',
  'ELGA-F': 'Cultural Policy',
  // EM-GA: Authoritarian Statist Centrism
  'EMGA-A': 'Source of Authority',
  'EMGA-B': 'Economic Coordination',
  'EMGA-C': 'Revolutionary Origin',
  'EMGA-D': 'Tradition vs Modernization',
  'EMGA-E': 'Racial/Universal Vision',
  'EMGA-F': 'Mass Mobilization',
  // ER-GA: Authoritarian Right & Corporatist Monarchism
  'ERGA-A': 'Source of Rule',
  'ERGA-B': 'Religious Centrality',
  'ERGA-C': 'Economic Direction',
  'ERGA-D': 'Modernization vs Heritage',
  'ERGA-E': 'Mass Politics',
  'ERGA-F': 'Constitutional Limits',
  // EL-GM: Democratic Socialism & Left Populism
  'ELGM-A': 'Reform vs Revolution',
  'ELGM-B': 'Decision Structure',
  'ELGM-C': 'Market Usage',
  'ELGM-D': 'Ownership Model',
  'ELGM-E': 'Party vs Union',
  'ELGM-F': 'International Strategy',
  // EM-GM: Mixed-Economy Liberal Center
  'EMGM-A': 'Market Freedom',
  'EMGM-B': 'Economic Rights',
  'EMGM-C': 'Globalism vs Domestic',
  'EMGM-D': 'Democratic Form',
  'EMGM-E': 'Welfare Model',
  'EMGM-F': 'Cultural Policy',
  // ER-GM: Conservative Capitalism & National Conservatism
  'ERGM-A': 'Government Scope',
  'ERGM-B': 'National Priority',
  'ERGM-C': 'Change Pace',
  'ERGM-D': 'Corporatist Coordination',
  'ERGM-E': 'Social Values',
  'ERGM-F': 'Economic Freedom',
  // EL-GL: Libertarian Socialism & Anarcho-Communism
  'ELGL-A': 'Transition Strategy',
  'ELGL-B': 'Violence vs Pacifism',
  'ELGL-C': 'Eco Priority',
  'ELGL-D': 'Local vs Network',
  'ELGL-E': 'Production Organization',
  'ELGL-F': 'Minimal State',
  // EM-GL: Social-Market Libertarianism
  'EMGL-A': 'Resource Commons',
  'EMGL-B': 'Welfare Provision',
  'EMGL-C': 'Market Purpose',
  'EMGL-D': 'Market Intervention',
  'EMGL-E': 'Land Policy',
  'EMGL-F': 'State Scope',
  // ER-GL: Anarcho-Capitalism & Ultra-Free-Market Libertarianism
  'ERGL-A': 'Enforcement Mechanism',
  'ERGL-B': 'Property Absolutism',
  'ERGL-C': 'Moral Traditionalism',
  'ERGL-D': 'Corporate Power',
  'ERGL-E': 'Immigration Policy',
  'ERGL-F': 'Natural Law'
};

// Function to get Phase 2 questions for a specific macro cell
// Current system: 4 axes (A,B,C,D) with 5 questions each = 20 total
// NEW TARGET: 6 axes (A,B,C,D,E,F) with 4 questions each = 24 total
export async function getPhase2Questions(macroCellCode: string): Promise<Phase2Question[]> {
  debugLog('🎯 Loading Phase 2 questions for macro cell:', macroCellCode);
  
  const phase2Map = await loadPhase2QuestionsFromTSV();
  
  // Get the axis codes for this macro cell
  // OLD: 4 axes (A,B,C,D) NEW: 6 axes (A,B,C,D,E,F)
  const axisPrefix = macroCellCode.replace('-', '');
  const relevantAxes = [`${axisPrefix}-A`, `${axisPrefix}-B`, `${axisPrefix}-C`, `${axisPrefix}-D`, `${axisPrefix}-E`, `${axisPrefix}-F`];
  
  debugLog('📐 Supplementary axes for refinement (6-axis system):');
  relevantAxes.forEach(axis => {
    const axisName = SUPPLEMENTARY_AXES[axis] || 'Unknown Axis';
    const questionsForAxis = phase2Map.get(axis) || [];
    debugLog(`  • ${axis}: ${axisName} (${questionsForAxis.length} questions found)`);
  });
  
  const phase2Questions: Phase2Question[] = [];
  
  for (const axis of relevantAxes) {
    const questions = phase2Map.get(axis) || [];
    // Add axis name to each question
    questions.forEach(q => {
      q.axisName = SUPPLEMENTARY_AXES[axis];
    });
    phase2Questions.push(...questions);
  }
  
  debugLog(`📋 Loaded ${phase2Questions.length} Phase 2 questions for supplementary axes`);
  
  // Ensure balanced distribution across axes with proper shuffling
  // NEW: 4 questions from each of 6 axes = 24 total
  // Each screen should have 1 question with agreeDir=-1 and 1 with agreeDir=1 from each axis
  const questionsPerAxis = 4;
  const finalPhase2: Phase2Question[] = [];

  // Separate questions by axis AND direction for balanced distribution
  const questionsByAxisAndDir = new Map<string, { left: Phase2Question[], right: Phase2Question[] }>();

  for (const axis of relevantAxes) {
    const axisQuestions = phase2Questions.filter(q => q.supplementAxis === axis);
    const leftQuestions = axisQuestions.filter(q => q.agreeDir === -1);
    const rightQuestions = axisQuestions.filter(q => q.agreeDir === 1);

    questionsByAxisAndDir.set(axis, {
      left: shuffleArray(leftQuestions),
      right: shuffleArray(rightQuestions)
    });

    debugLog(`  ${axis}: ${leftQuestions.length} left (-1), ${rightQuestions.length} right (+1) questions`);
  }

  // Build screens with balanced distribution
  // 2 screens total, 12 questions per screen (2 per axis, 1 left + 1 right)
  const screensNeeded = 2;
  const questionsPerScreen = 12; // 6 axes * 2 questions per axis

  for (let screenIdx = 0; screenIdx < screensNeeded; screenIdx++) {
    const screenQuestions: Phase2Question[] = [];

    // For each axis, add 1 left and 1 right question
    for (const axis of relevantAxes) {
      const axisData = questionsByAxisAndDir.get(axis)!;

      // Add one left-leaning question if available
      if (axisData.left.length > screenIdx) {
        screenQuestions.push(axisData.left[screenIdx]);
      }

      // Add one right-leaning question if available
      if (axisData.right.length > screenIdx) {
        screenQuestions.push(axisData.right[screenIdx]);
      }
    }

    // Shuffle questions within this screen to randomize presentation
    const shuffledScreen = shuffleArray(screenQuestions);
    finalPhase2.push(...shuffledScreen);

    debugLog(`Screen ${screenIdx + 1}: ${shuffledScreen.length} questions (balanced across axes)`);
  }
  
  debugLog(`✅ Phase 2: ${finalPhase2.length} questions ready for 6D positioning within macro cell`);
  debugLog('🧮 These will create 6 axes for Euclidean distance calculation to find specific ideology');

  // Log distribution
  debugLog('📊 Phase 2 question distribution:');
  for (const axis of relevantAxes) {
    const count = finalPhase2.filter(q => q.supplementAxis === axis).length;
    const axisName = SUPPLEMENTARY_AXES[axis] || 'Unknown';
    const leftCount = finalPhase2.filter(q => q.supplementAxis === axis && q.agreeDir === -1).length;
    const rightCount = finalPhase2.filter(q => q.supplementAxis === axis && q.agreeDir === 1).length;
    debugLog(`  ${axis} (${axisName}): ${count} questions (${leftCount} left, ${rightCount} right)`);
  }

  // Log screen distribution for verification
  debugLog('📺 Phase 2 screen distribution:');
  for (let i = 0; i < 2; i++) {
    const screenQuestions = finalPhase2.slice(i * 12, (i + 1) * 12);
    const axisDistribution = new Map<string, { left: number, right: number }>();

    for (const q of screenQuestions) {
      if (!axisDistribution.has(q.supplementAxis)) {
        axisDistribution.set(q.supplementAxis, { left: 0, right: 0 });
      }
      if (q.agreeDir === -1) {
        axisDistribution.get(q.supplementAxis)!.left++;
      } else {
        axisDistribution.get(q.supplementAxis)!.right++;
      }
    }

    debugLog(`  Screen ${i + 1} (Q${i*12+1}-${(i+1)*12}):`);
    for (const [axis, counts] of axisDistribution) {
      debugLog(`    ${axis}: ${counts.left}L + ${counts.right}R`);
    }
  }

  // Log first few questions to show variety
  debugLog('🎲 First 5 Phase 2 questions (showing variety):');
  finalPhase2.slice(0, 5).forEach((q, i) => {
    debugLog(`  ${i+1}. [${q.supplementAxis}] [${q.agreeDir === -1 ? 'L' : 'R'}] "${q.question.substring(0, 50)}..."`);
  });

  return finalPhase2;
}

// Static fallback for long quiz (backwards compatibility)
export const longQuestions: Question[] = phase1Questions;