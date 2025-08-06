// Import unified question loader
import { 
  getPhase1Questions, 
  getTiebreakerQuestions,
  Question as TSVQuestion,
  loadAllQuestions 
} from '../../lib/question-loader';
import { fetchTSVWithCache } from '@/lib/tsv-cache';

type PoliticalAxis = 'economic' | 'authority' | 'cultural';

export interface Question {
  id: number;
  question: string;
  axis: PoliticalAxis;
  agreeDir?: -1 | 1; // Direction that "agree" pushes the score
  boundary?: 'LEFT_CENTER' | 'CENTER_RIGHT' | 'LIB_CENTER' | 'CENTER_AUTH'; // For tiebreakers
  originalId?: string; // Keep track of original TSV ID
}

// Cache for loaded questions
let cachedPhase1: Question[] | null = null;
let cachedTiebreakers: Question[] | null = null;
let cachedAll: Question[] | null = null;

// Convert TSV question to app Question format
function convertQuestion(q: TSVQuestion): Question {
  return {
    id: q.id,
    question: q.text,
    axis: q.axis,
    agreeDir: q.agreeDir,
    boundary: q.boundary,
    originalId: q.originalId,
    text: q.text // Also include text property for compatibility
  } as Question;
}

// Load all questions from TSV (replaces hardcoded array)
export const allQuestions: Question[] = [
  // This array will be populated from TSV on first use
  // Keeping as empty array for now to maintain backwards compatibility
];

// Async function to get Phase 1 questions from TSV
export async function getPhase1QuestionsAsync(): Promise<Question[]> {
  if (cachedPhase1) return cachedPhase1;
  const tsvQuestions = await getPhase1Questions();
  cachedPhase1 = tsvQuestions.map(convertQuestion);
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

// Short quiz: Filter allQuestions for only priority 2 questions
// Generate randomized short quiz questions
export async function generateShortQuizQuestions(): Promise<Question[]> {
  console.log('🎲 Generating randomized short quiz questions...');
  
  // Get all questions from TSV
  const allQs = await getAllQuestionsAsync();
  
  // Get the priority 2 questions and shuffle them
  const priority2Ids = ['P01', 'P02', 'P03', 'P04', 'P09', 'P10', 'P11', 'P12', 'P17', 'P18'];
  const priority2Questions = allQs.filter(q => 
    q.originalId && priority2Ids.includes(q.originalId)
  );
  const randomizedShort = shuffleArray(priority2Questions);
  
  console.log(`📝 Short Quiz: ${randomizedShort.length} questions randomized`);
  console.log('Question order:', randomizedShort.map(q => `${q.id}`).join(', '));
  
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
    console.error('Failed to load questions from TSV:', error);
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
export async function generateLongQuizQuestions(): Promise<Question[]> {
  console.log('🎲 Generating randomized long quiz questions with balanced distribution...');
  
  // Get Phase 1 questions from TSV
  const p1Questions = await getPhase1QuestionsAsync();
  
  // Separate questions by axis AND direction for truly balanced distribution
  const economicLeft = p1Questions.filter(q => q.axis === 'economic' && q.agreeDir === -1);
  const economicRight = p1Questions.filter(q => q.axis === 'economic' && q.agreeDir === 1);
  const authorityLib = p1Questions.filter(q => q.axis === 'authority' && q.agreeDir === -1);
  const authorityAuth = p1Questions.filter(q => q.axis === 'authority' && q.agreeDir === 1);
  const culturalProg = p1Questions.filter(q => q.axis === 'cultural' && q.agreeDir === -1);
  const culturalTrad = p1Questions.filter(q => q.axis === 'cultural' && q.agreeDir === 1);
  
  // Shuffle each subcategory
  const shuffledEconLeft = shuffleArray(economicLeft);
  const shuffledEconRight = shuffleArray(economicRight);
  const shuffledAuthLib = shuffleArray(authorityLib);
  const shuffledAuthAuth = shuffleArray(authorityAuth);
  const shuffledCultProg = shuffleArray(culturalProg);
  const shuffledCultTrad = shuffleArray(culturalTrad);
  
  console.log(`📊 Distribution - Econ: ${economicLeft.length}L/${economicRight.length}R, Auth: ${authorityLib.length}L/${authorityAuth.length}A, Cult: ${culturalProg.length}P/${culturalTrad.length}T`);
  
  // Track indices for pulling from each subcategory
  const indices = {
    econLeft: 0, econRight: 0,
    authLib: 0, authAuth: 0,
    cultProg: 0, cultTrad: 0
  };
  
  // Build questions for each screen with balanced distribution
  const finalQuestions: Question[] = [];
  
  // SCREEN-BY-SCREEN DISTRIBUTION PLAN
  // First 4 screens (20 questions): Must balance axis AND direction
  const screenPlans = [
    // Screen 1 (Q1-5): 2E(1L,1R), 2A(1L,1A), 1C(P)
    { econLeft: 1, econRight: 1, authLib: 1, authAuth: 1, cultProg: 1, cultTrad: 0 },
    // Screen 2 (Q6-10): 2E(1L,1R), 2A(1L,1A), 1C(T)
    { econLeft: 1, econRight: 1, authLib: 1, authAuth: 1, cultProg: 0, cultTrad: 1 },
    // Screen 3 (Q11-15): 2E(1L,1R), 1A(L), 2C(1P,1T)
    { econLeft: 1, econRight: 1, authLib: 1, authAuth: 0, cultProg: 1, cultTrad: 1 },
    // Screen 4 (Q16-20): 1E(R), 2A(2A), 2C(1P,1T)
    { econLeft: 0, econRight: 1, authLib: 0, authAuth: 2, cultProg: 1, cultTrad: 1 },
    // Screen 5 (Q21-25): 2E(1L,1R), 1A(A), 2C(1P,1T)
    { econLeft: 1, econRight: 1, authLib: 0, authAuth: 1, cultProg: 1, cultTrad: 1 },
    // Screen 6 (Q26-30): 1E(R), 2A(2A), 2C(1P,1T)
    { econLeft: 0, econRight: 1, authLib: 0, authAuth: 2, cultProg: 1, cultTrad: 1 }
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
    for (let i = 0; i < plan.authLib; i++) {
      if (indices.authLib < shuffledAuthLib.length) {
        screenQuestions.push(shuffledAuthLib[indices.authLib++]);
      }
    }
    for (let i = 0; i < plan.authAuth; i++) {
      if (indices.authAuth < shuffledAuthAuth.length) {
        screenQuestions.push(shuffledAuthAuth[indices.authAuth++]);
      }
    }
    for (let i = 0; i < plan.cultProg; i++) {
      if (indices.cultProg < shuffledCultProg.length) {
        screenQuestions.push(shuffledCultProg[indices.cultProg++]);
      }
    }
    for (let i = 0; i < plan.cultTrad; i++) {
      if (indices.cultTrad < shuffledCultTrad.length) {
        screenQuestions.push(shuffledCultTrad[indices.cultTrad++]);
      }
    }
    
    // Shuffle within screen to randomize presentation
    const shuffledScreen = shuffleArray(screenQuestions);
    finalQuestions.push(...shuffledScreen);
  }
  
  // Log distribution per screen for verification
  console.log(`📝 Phase 1: ${finalQuestions.length} questions with balanced distribution`);
  for (let i = 0; i < 6; i++) {
    const screenQuestions = finalQuestions.slice(i * 5, (i + 1) * 5);
    const e = screenQuestions.filter(q => q.axis === 'economic').length;
    const a = screenQuestions.filter(q => q.axis === 'authority').length;
    const c = screenQuestions.filter(q => q.axis === 'cultural').length;
    const left = screenQuestions.filter(q => q.agreeDir === -1).length;
    const right = screenQuestions.filter(q => q.agreeDir === 1).length;
    console.log(`Screen ${i + 1}: E:${e} A:${a} C:${c} | L:${left} R:${right}`);
  }
  
  // Overall balance check
  const totalLeft = finalQuestions.filter(q => q.agreeDir === -1).length;
  const totalRight = finalQuestions.filter(q => q.agreeDir === 1).length;
  console.log(`✅ Overall balance: ${totalLeft} left-leaning, ${totalRight} right-leaning`);
  
  return finalQuestions;
}

// Function to adjust final questions based on tiebreaker needs (called after screen 4)
export async function adjustForTiebreakers(
  remainingQuestions: Question[],
  economicScore: number,
  governanceScore: number
): Promise<Question[]> {
  console.log('🎯 Checking for tiebreaker needs...');
  console.log(`Current scores - Economic: ${economicScore.toFixed(2)}, Governance: ${governanceScore.toFixed(2)}`);
  
  // Check proximity to macro cell boundaries (±33.33 for 3x3 grid)
  // If within ±15 of boundary, we need tiebreakers
  const BOUNDARY_THRESHOLD = 15;
  const MACRO_BOUNDARY = 33.33;
  
  // Detect which specific boundaries we're near
  const boundaries: string[] = [];
  
  // Economic boundaries
  if (Math.abs(economicScore + MACRO_BOUNDARY) <= BOUNDARY_THRESHOLD) {
    boundaries.push('LEFT_CENTER');
    console.log('📍 Near Left-Center economic boundary');
  }
  if (Math.abs(economicScore - MACRO_BOUNDARY) <= BOUNDARY_THRESHOLD) {
    boundaries.push('CENTER_RIGHT');
    console.log('📍 Near Center-Right economic boundary');
  }
  
  // Authority boundaries
  if (Math.abs(governanceScore + MACRO_BOUNDARY) <= BOUNDARY_THRESHOLD) {
    boundaries.push('LIB_CENTER');
    console.log('📍 Near Lib-Center authority boundary');
  }
  if (Math.abs(governanceScore - MACRO_BOUNDARY) <= BOUNDARY_THRESHOLD) {
    boundaries.push('CENTER_AUTH');
    console.log('📍 Near Center-Auth authority boundary');
  }
  
  if (boundaries.length === 0) {
    console.log('✅ No tiebreakers needed - clear positioning');
    return remainingQuestions;
  }
  
  console.log(`🎯 Selecting targeted tiebreakers for boundaries: ${boundaries.join(', ')}`);
  
  // Get relevant tiebreaker questions for detected boundaries from TSV
  const relevantTiebreakers = await getTiebreakerQuestionsAsync(boundaries);
  
  console.log(`Found ${relevantTiebreakers.length} relevant tiebreaker questions`);
  
  // Count available cultural questions to replace
  const culturalIndices = remainingQuestions
    .map((q, i) => q.axis === 'cultural' ? i : -1)
    .filter(i => i !== -1);
  
  const maxReplacements = Math.min(relevantTiebreakers.length, culturalIndices.length, 4);
  console.log(`Will replace up to ${maxReplacements} cultural questions with tiebreakers`);
  
  // Replace cultural questions with targeted tiebreakers
  let adjustedQuestions = [...remainingQuestions];
  for (let i = 0; i < maxReplacements; i++) {
    adjustedQuestions[culturalIndices[i]] = relevantTiebreakers[i];
    console.log(`✅ Added tiebreaker: "${relevantTiebreakers[i].question.substring(0, 50)}..."`);
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
    const text = await fetchTSVWithCache('/political_quiz_final.tsv');
    const lines = text.trim().split('\n');
    const headers = lines[0].split('\t');
    
    const phase2Map = new Map<string, Phase2Question[]>();
    
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split('\t');
      const phase = row[3]; // phase column
      
      if (phase === '2') {
        const id = row[0]; // Question ID like ELGL-A-01
        const text = row[1];
        const supplementAxis = row[2]; // This contains the supplementary axis code like ELGL-A
        const agreeDir = parseInt(row[6]); // agree_dir column
        
        // Generate a unique numeric ID for the question
        const numericId = 1000 + i; // Start Phase 2 questions at ID 1000+
        
        const question: Phase2Question = {
          id: numericId,
          question: text,
          axis: 'supplementary' as any, // Mark as supplementary axis
          supplementAxis: supplementAxis,
          agreeDir: agreeDir as -1 | 1
        };
        
        // Group by supplementary axis code (e.g., ELGL-A)
        if (!phase2Map.has(supplementAxis)) {
          phase2Map.set(supplementAxis, []);
        }
        phase2Map.get(supplementAxis)!.push(question);
      }
    }
    
    return phase2Map;
  } catch (error) {
    console.error('Error loading Phase 2 questions:', error);
    return new Map();
  }
}

// Map of supplementary axis names from supplement-axes.tsv
const SUPPLEMENTARY_AXES: Record<string, string> = {
  'ELGL-A': 'Leadership Model',
  'ELGL-B': 'National vs International', 
  'ELGL-C': 'Urban vs Rural Base',
  'ELGL-D': 'Class vs Ethno-Populism',
  'EMGL-A': 'Religious Legitimacy',
  'EMGL-B': 'Ethno-Racial Emphasis',
  'EMGL-C': 'State vs Market Control',
  'EMGL-D': 'Tradition vs Modernization',
  'ERGL-A': 'Source of Rule',
  'ERGL-B': 'Religious Centrality',
  'ERGL-C': 'Economic Direction',
  'ERGL-D': 'Modernization vs Heritage',
  'ELGM-A': 'Reform vs Revolution',
  'ELGM-B': 'Central vs Local Power',
  'ELGM-C': 'Market Usage',
  'ELGM-D': 'Futurism vs Pragmatism',
  'EMGM-A': 'Market Freedom',
  'EMGM-B': 'Welfare Commitment',
  'EMGM-C': 'Globalism vs Domestic',
  'EMGM-D': 'Democracy Model',
  'ERGM-A': 'Social Control',
  'ERGM-B': 'Cultural Focus',
  'ERGM-C': 'Corporate Role',
  'ERGM-D': 'Nationalism Type',
  'ELGR-A': 'Organization Model',
  'ELGR-B': 'Violence Stance',
  'ELGR-C': 'Technology View',
  'ELGR-D': 'Solidarity Scope',
  'EMGR-A': 'State Size',
  'EMGR-B': 'Community Scale',
  'EMGR-C': 'Economic Localism',
  'EMGR-D': 'Social Values',
  'ERGR-A': 'Property Absolutism',
  'ERGR-B': 'Authority Source',
  'ERGR-C': 'Corporate Power',
  'ERGR-D': 'Social Hierarchy'
};

// Function to get Phase 2 questions for a specific macro cell
export async function getPhase2Questions(macroCellCode: string): Promise<Phase2Question[]> {
  console.log('🎯 Loading Phase 2 questions for macro cell:', macroCellCode);
  
  const phase2Map = await loadPhase2QuestionsFromTSV();
  
  // Get the axis codes for this macro cell
  const axisPrefix = macroCellCode.replace('-', '');
  const relevantAxes = [`${axisPrefix}-A`, `${axisPrefix}-B`, `${axisPrefix}-C`, `${axisPrefix}-D`];
  
  console.log('📐 Supplementary axes for refinement:');
  relevantAxes.forEach(axis => {
    const axisName = SUPPLEMENTARY_AXES[axis] || 'Unknown Axis';
    console.log(`  • ${axis}: ${axisName}`);
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
  
  console.log(`📋 Loaded ${phase2Questions.length} Phase 2 questions for supplementary axes`);
  
  // Ensure balanced distribution across axes
  // We want 5 questions from each of the 4 axes
  const questionsPerAxis = 5;
  const finalPhase2: Phase2Question[] = [];
  
  // Shuffle questions within each axis first
  const questionsByAxis = new Map<string, Phase2Question[]>();
  for (const axis of relevantAxes) {
    const axisQuestions = phase2Questions.filter(q => q.supplementAxis === axis);
    questionsByAxis.set(axis, shuffleArray(axisQuestions));
  }
  
  // Take 5 questions from each axis
  for (const [axis, axisQuestions] of questionsByAxis) {
    finalPhase2.push(...axisQuestions.slice(0, questionsPerAxis));
  }
  
  // Final shuffle to mix questions from different axes
  const shuffledPhase2 = shuffleArray(finalPhase2);
  
  console.log(`✅ Phase 2: ${shuffledPhase2.length} questions ready for 4D positioning within macro cell`);
  console.log('🧮 These will create 4 additional axes for Euclidean distance calculation to find specific ideology');
  
  // Log distribution
  console.log('📊 Phase 2 question distribution:');
  for (const axis of relevantAxes) {
    const count = shuffledPhase2.filter(q => q.supplementAxis === axis).length;
    const axisName = SUPPLEMENTARY_AXES[axis] || 'Unknown';
    console.log(`  ${axis} (${axisName}): ${count} questions`);
  }
  
  // Log first few questions to show variety
  console.log('🎲 First 5 Phase 2 questions (showing variety):');
  shuffledPhase2.slice(0, 5).forEach((q, i) => {
    console.log(`  ${i+1}. [${q.supplementAxis}] "${q.question.substring(0, 50)}..."`);
  });
  
  return shuffledPhase2;
}

// Static fallback for long quiz (backwards compatibility)
export const longQuestions: Question[] = phase1Questions;