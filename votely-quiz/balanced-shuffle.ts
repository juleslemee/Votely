// Balanced shuffling algorithm that maintains both axis and direction balance
import { debugLog } from './lib/debug-logger';

interface Question {
  id: number;
  question: string;
  axis: 'economic' | 'governance' | 'social';
  agreeDir?: -1 | 1;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function generateBalancedQuizQuestions(phase1Questions: Question[]): Question[] {
  debugLog('🎲 Generating balanced quiz with axis AND direction distribution...');
  
  // Separate by axis AND direction (6 categories total)
  const categories = {
    econLeft: phase1Questions.filter(q => q.axis === 'economic' && q.agreeDir === -1),
    econRight: phase1Questions.filter(q => q.axis === 'economic' && q.agreeDir === 1),
    govLib: phase1Questions.filter(q => q.axis === 'governance' && q.agreeDir === -1),
    govAuth: phase1Questions.filter(q => q.axis === 'governance' && q.agreeDir === 1),
    socProg: phase1Questions.filter(q => q.axis === 'social' && q.agreeDir === -1),
    socTrad: phase1Questions.filter(q => q.axis === 'social' && q.agreeDir === 1)
  };
  
  // Shuffle each category
  const shuffled = {
    econLeft: shuffleArray(categories.econLeft),
    econRight: shuffleArray(categories.econRight),
    govLib: shuffleArray(categories.govLib),
    govAuth: shuffleArray(categories.govAuth),
    socProg: shuffleArray(categories.socProg),
    socTrad: shuffleArray(categories.socTrad)
  };
  
  debugLog(`📊 Available questions:
    Economic: ${categories.econLeft.length} left, ${categories.econRight.length} right
    Governance: ${categories.govLib.length} lib, ${categories.govAuth.length} auth
    Social: ${categories.socProg.length} prog, ${categories.socTrad.length} trad`);
  
  // Track indices for each category
  const indices = {
    econLeft: 0, econRight: 0,
    govLib: 0, govAuth: 0,
    socProg: 0, socTrad: 0
  };
  
  // Distribution plan for 30 questions (6 screens of 5 questions each)
  // Goal: Balance both axis type AND political direction per screen
  const screenPlans = [
    // Screen 1: 2E (1L,1R), 2A (1L,1A), 1C (alt P/T)
    ['econLeft', 'econRight', 'govLib', 'govAuth', 'socProg'],
    // Screen 2: 2E (1L,1R), 2G (1L,1A), 1S (alt T/P)
    ['econLeft', 'econRight', 'govLib', 'govAuth', 'socTrad'],
    // Screen 3: 2E (1L,1R), 1G (alt), 2S (1P,1T)
    ['econLeft', 'econRight', 'govLib', 'socProg', 'socTrad'],
    // Screen 4: 1E (alt), 2G (1L,1A), 2S (1P,1T)
    ['econLeft', 'govLib', 'govAuth', 'socProg', 'socTrad'],
    // Screen 5: 2E (1R only due to imbalance), 1G (A), 2S (1P,1T)
    ['econRight', 'econRight', 'govAuth', 'socProg', 'socTrad'],
    // Screen 6: 1E (R), 2G (2A due to imbalance), 2S (1P,1T)
    ['econRight', 'govAuth', 'govAuth', 'socProg', 'socTrad']
  ];
  
  const finalQuestions: Question[] = [];
  
  for (let screenIdx = 0; screenIdx < screenPlans.length; screenIdx++) {
    const screenPlan = screenPlans[screenIdx];
    const screenQuestions: Question[] = [];
    
    for (const category of screenPlan) {
      const categoryQuestions = shuffled[category as keyof typeof shuffled];
      const idx = indices[category as keyof typeof indices];
      
      if (idx < categoryQuestions.length) {
        screenQuestions.push(categoryQuestions[idx]);
        indices[category as keyof typeof indices]++;
      }
    }
    
    // Shuffle within each screen to randomize presentation order
    const shuffledScreen = shuffleArray(screenQuestions);
    finalQuestions.push(...shuffledScreen);
    
    // Log screen balance
    const eCount = shuffledScreen.filter(q => q.axis === 'economic').length;
    const gCount = shuffledScreen.filter(q => q.axis === 'governance').length;
    const sCount = shuffledScreen.filter(q => q.axis === 'social').length;
    const leftCount = shuffledScreen.filter(q => q.agreeDir === -1).length;
    const rightCount = shuffledScreen.filter(q => q.agreeDir === 1).length;

    debugLog(`Screen ${screenIdx + 1}: E:${eCount} G:${gCount} S:${sCount} | Left:${leftCount} Right:${rightCount}`);
  }
  
  // Verify overall balance
  const totalLeft = finalQuestions.filter(q => q.agreeDir === -1).length;
  const totalRight = finalQuestions.filter(q => q.agreeDir === 1).length;
  debugLog(`\n✅ Total balance: ${totalLeft} left-leaning, ${totalRight} right-leaning questions`);
  
  return finalQuestions;
}

// Example of how this maintains balance:
// Instead of potentially getting 5 right-wing economic questions in a row,
// each screen now has a mix of left and right positions across all axes.
// This prevents order bias where someone might answer differently 
// if they get all "government should..." questions first vs last.