type PoliticalAxis = 'economic' | 'authority' | 'cultural';

export interface Question {
  id: number;
  question: string;
  axis: PoliticalAxis;
  agreeDir?: -1 | 1; // Direction that "agree" pushes the score
}

// New phase-based political questions from TSV
// 30 core questions for balanced assessment
export const allQuestions: Question[] = [
  // ECONOMIC QUESTIONS
  {
    id: 1,
    question: "The government should actively redistribute wealth from the rich to the poor to create a more equal society.",
    axis: 'economic',
    agreeDir: -1
  },
  {
    id: 2,
    question: "Lowering taxes for businesses and individuals is the best way to encourage economic growth.",
    axis: 'economic',
    agreeDir: 1
  },
  {
    id: 3,
    question: "Free-market capitalism is the best economic system, despite any imperfections.",
    axis: 'economic',
    agreeDir: 1
  },
  {
    id: 4,
    question: "Strong government regulation of businesses is necessary to protect consumers and workers.",
    axis: 'economic',
    agreeDir: -1
  },
  {
    id: 5,
    question: "Healthcare should be provided free of charge by the government to all people.",
    axis: 'economic',
    agreeDir: -1
  },
  {
    id: 6,
    question: "Generous social welfare programs can reduce people's incentive to work.",
    axis: 'economic',
    agreeDir: 1
  },
  {
    id: 7,
    question: "Labor unions are necessary to protect workers' rights and should be supported.",
    axis: 'economic',
    agreeDir: -1
  },
  {
    id: 8,
    question: "Private companies can provide services like healthcare and education more efficiently than the government.",
    axis: 'economic',
    agreeDir: 1
  },
  {
    id: 25,
    question: "High-income earners should pay a much larger percentage of their income in taxes than everyone else.",
    axis: 'economic',
    agreeDir: -1
  },
  {
    id: 26,
    question: "Too much government regulation of business stifles economic growth and innovation.",
    axis: 'economic',
    agreeDir: 1
  },

  // AUTHORITY QUESTIONS
  {
    id: 9,
    question: "Government surveillance of citizens' communications is acceptable if it prevents crime and terrorism.",
    axis: 'authority',
    agreeDir: 1
  },
  {
    id: 10,
    question: "The government should have as little involvement in citizens' lives as possible.",
    axis: 'authority',
    agreeDir: -1
  },
  {
    id: 11,
    question: "The government should be able to censor speech or media that it considers dangerous or extremist.",
    axis: 'authority',
    agreeDir: 1
  },
  {
    id: 12,
    question: "Individuals should be free to make their own lifestyle choices as long as they do not harm others.",
    axis: 'authority',
    agreeDir: -1
  },
  {
    id: 13,
    question: "In a national emergency, it is acceptable for the government to suspend some normal legal rights.",
    axis: 'authority',
    agreeDir: 1
  },
  {
    id: 14,
    question: "People have the right to disobey laws they find unjust.",
    axis: 'authority',
    agreeDir: -1
  },
  {
    id: 15,
    question: "A strong, centralized government is necessary to maintain order in society.",
    axis: 'authority',
    agreeDir: 1
  },
  {
    id: 16,
    question: "Law-abiding citizens should be able to own firearms without heavy restrictions.",
    axis: 'authority',
    agreeDir: -1
  },
  {
    id: 27,
    question: "Every citizen should be required to serve in the military or perform national service for at least a year.",
    axis: 'authority',
    agreeDir: 1
  },
  {
    id: 28,
    question: "Local communities should have more power to govern themselves with less central oversight.",
    axis: 'authority',
    agreeDir: -1
  },

  // CULTURAL/SOCIAL QUESTIONS
  {
    id: 17,
    question: "Children are best off when raised by a married mother and father in the same household.",
    axis: 'cultural',
    agreeDir: 1
  },
  {
    id: 18,
    question: "A diverse society with many cultures, religions, and identities is a strength for a nation.",
    axis: 'cultural',
    agreeDir: -1
  },
  {
    id: 19,
    question: "Women should have the right to choose an abortion without government interference.",
    axis: 'cultural',
    agreeDir: -1
  },
  {
    id: 20,
    question: "Political correctness has gone too far, to the point where people are afraid to speak their minds.",
    axis: 'cultural',
    agreeDir: 1
  },
  {
    id: 21,
    question: "Laws and policies should not be influenced by any religion; the government needs to stay secular.",
    axis: 'cultural',
    agreeDir: -1
  },
  {
    id: 22,
    question: "Society should accept people's gender identities, even if they differ from their birth sex.",
    axis: 'cultural',
    agreeDir: -1
  },
  {
    id: 23,
    question: "Immigration into our country should be strictly limited to protect our national culture and economy.",
    axis: 'cultural',
    agreeDir: 1
  },
  {
    id: 24,
    question: "It is more important to preserve traditional values and ways of life than to adopt new social changes.",
    axis: 'cultural',
    agreeDir: 1
  },
  {
    id: 29,
    question: "Society has become too permissive and would benefit from traditional moral standards.",
    axis: 'cultural',
    agreeDir: 1
  },
  {
    id: 30,
    question: "Schools should teach students about historical injustices committed by our country.",
    axis: 'cultural',
    agreeDir: -1
  },

  // TIEBREAKER QUESTIONS (for when scores are close to center)
  {
    id: 31,
    question: "Protecting the environment should be prioritized even at the cost of economic growth.",
    axis: 'economic',
    agreeDir: -1
  },
  {
    id: 32,
    question: "Tariffs and import restrictions are necessary to protect domestic industries.",
    axis: 'economic',
    agreeDir: 1
  },
  {
    id: 33,
    question: "Government policy should follow the advice of qualified experts, even if it goes against popular opinion.",
    axis: 'authority',
    agreeDir: 1
  },
  {
    id: 34,
    question: "If government violates rights, citizens should resist through civil disobedience.",
    axis: 'authority',
    agreeDir: -1
  }
];

// Short quiz: Filter allQuestions for only priority 2 questions
// Generate randomized short quiz questions
export function generateShortQuizQuestions(): Question[] {
  console.log('🎲 Generating randomized short quiz questions...');
  
  // Get the priority 2 questions and shuffle them
  const priority2Ids = [1, 2, 3, 4, 9, 10, 11, 12, 17, 18];
  const priority2Questions = allQuestions.filter(q => priority2Ids.includes(q.id));
  const randomizedShort = shuffleArray(priority2Questions);
  
  console.log(`📝 Short Quiz: ${randomizedShort.length} questions randomized`);
  console.log('Question order:', randomizedShort.map(q => `${q.id}`).join(', '));
  
  return randomizedShort;
}

// Static fallback for short quiz (backwards compatibility)
export const shortQuestions: Question[] = allQuestions.filter(q => {
  const priority2Ids = [1, 2, 3, 4, 9, 10, 11, 12, 17, 18];
  return priority2Ids.includes(q.id);
});

// Get core Phase 1 questions (IDs 1-30)
export const phase1Questions = allQuestions.filter(q => q.id >= 1 && q.id <= 30);

// Get tiebreaker questions (IDs 31-34)
export const tiebreakerQuestions = allQuestions.filter(q => q.id >= 31 && q.id <= 34);

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
export function generateLongQuizQuestions(): Question[] {
  console.log('🎲 Generating randomized long quiz questions with balanced distribution...');
  
  // Separate questions by axis for balanced distribution
  const economicQuestions = phase1Questions.filter(q => q.axis === 'economic');
  const authorityQuestions = phase1Questions.filter(q => q.axis === 'authority');
  const culturalQuestions = phase1Questions.filter(q => q.axis === 'cultural');
  
  // Shuffle each category
  const shuffledEconomic = shuffleArray(economicQuestions);
  const shuffledAuthority = shuffleArray(authorityQuestions);
  const shuffledCultural = shuffleArray(culturalQuestions);
  
  console.log(`📊 Question distribution: ${shuffledEconomic.length} economic, ${shuffledAuthority.length} authority, ${shuffledCultural.length} cultural`);
  
  // For the first 20 questions (screens 1-4), ensure balanced distribution
  // We want roughly 6-7 of each type in the first 20
  const first20: Question[] = [];
  
  // Take 7 economic, 7 authority, 6 cultural for first 20
  first20.push(...shuffledEconomic.slice(0, 7));
  first20.push(...shuffledAuthority.slice(0, 7));
  first20.push(...shuffledCultural.slice(0, 6));
  
  // Shuffle the first 20 to mix them up
  const shuffledFirst20 = shuffleArray(first20);
  
  // For the last 10 questions (screens 5-6), use remaining questions
  // This ensures we have 3 economic, 3 authority, 4 cultural available
  const last10: Question[] = [];
  last10.push(...shuffledEconomic.slice(7)); // 3 remaining economic
  last10.push(...shuffledAuthority.slice(7)); // 3 remaining authority
  last10.push(...shuffledCultural.slice(6));  // 4 remaining cultural
  
  // Shuffle the last 10
  const shuffledLast10 = shuffleArray(last10);
  
  const finalQuestions = [...shuffledFirst20, ...shuffledLast10];
  
  console.log(`📝 Phase 1: ${finalQuestions.length} questions arranged`);
  console.log('First 20 distribution:', shuffledFirst20.map(q => q.axis.charAt(0).toUpperCase()).join(''));
  console.log('Last 10 distribution:', shuffledLast10.map(q => q.axis.charAt(0).toUpperCase()).join(''));
  console.log('Last 10 reserves - E:', shuffledLast10.filter(q => q.axis === 'economic').length,
              'A:', shuffledLast10.filter(q => q.axis === 'authority').length,
              'C:', shuffledLast10.filter(q => q.axis === 'cultural').length);
  
  return finalQuestions;
}

// Function to adjust final questions based on tiebreaker needs (called after screen 4)
export function adjustForTiebreakers(
  remainingQuestions: Question[],
  economicScore: number,
  governanceScore: number
): Question[] {
  console.log('🎯 Checking for tiebreaker needs...');
  console.log(`Current scores - Economic: ${economicScore.toFixed(2)}, Governance: ${governanceScore.toFixed(2)}`);
  
  // Check proximity to macro cell boundaries (±33.33 for 3x3 grid)
  // If within ±5 of boundary, we need tiebreakers
  const BOUNDARY_THRESHOLD = 5;
  const MACRO_BOUNDARY = 33.33;
  
  const needsEconomicTiebreaker = Math.abs(Math.abs(economicScore) - MACRO_BOUNDARY) <= BOUNDARY_THRESHOLD;
  const needsGovernanceTiebreaker = Math.abs(Math.abs(governanceScore) - MACRO_BOUNDARY) <= BOUNDARY_THRESHOLD;
  
  console.log(`Tiebreakers needed - Economic: ${needsEconomicTiebreaker}, Governance: ${needsGovernanceTiebreaker}`);
  
  let adjustedQuestions = [...remainingQuestions];
  let replacedCount = 0;
  
  // Count available questions by type in remaining set
  const remainingByType = {
    economic: remainingQuestions.filter(q => q.axis === 'economic').length,
    authority: remainingQuestions.filter(q => q.axis === 'authority').length,
    cultural: remainingQuestions.filter(q => q.axis === 'cultural').length
  };
  
  console.log('Remaining questions by type:', remainingByType);
  
  // Replace cultural questions with tiebreakers if needed
  if (needsEconomicTiebreaker && remainingByType.cultural >= 2) {
    const economicTiebreakers = tiebreakerQuestions.filter(q => q.axis === 'economic');
    const culturalIndices = adjustedQuestions
      .map((q, i) => q.axis === 'cultural' ? i : -1)
      .filter(i => i !== -1);
    
    // Replace up to 2 cultural questions with economic tiebreakers
    for (let i = 0; i < Math.min(2, economicTiebreakers.length, culturalIndices.length); i++) {
      adjustedQuestions[culturalIndices[i]] = economicTiebreakers[i];
      replacedCount++;
      console.log(`✅ Replaced cultural question with economic tiebreaker: "${economicTiebreakers[i].question.substring(0, 50)}..."`);
    }
  }
  
  if (needsGovernanceTiebreaker && remainingByType.cultural >= 2 - replacedCount) {
    const authorityTiebreakers = tiebreakerQuestions.filter(q => q.axis === 'authority');
    const culturalIndices = adjustedQuestions
      .map((q, i) => q.axis === 'cultural' ? i : -1)
      .filter(i => i !== -1);
    
    // Replace up to 2 more cultural questions with authority tiebreakers
    const startIndex = replacedCount; // Skip already replaced ones
    for (let i = 0; i < Math.min(2, authorityTiebreakers.length, culturalIndices.length - startIndex); i++) {
      adjustedQuestions[culturalIndices[startIndex + i]] = authorityTiebreakers[i];
      console.log(`✅ Replaced cultural question with authority tiebreaker: "${authorityTiebreakers[i].question.substring(0, 50)}..."`);
    }
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
    const response = await fetch('/political_quiz_final.tsv');
    const text = await response.text();
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