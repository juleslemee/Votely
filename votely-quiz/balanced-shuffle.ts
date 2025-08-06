// Balanced shuffling algorithm that maintains both axis and direction balance

interface Question {
  id: number;
  question: string;
  axis: 'economic' | 'authority' | 'cultural';
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
  console.log('🎲 Generating balanced quiz with axis AND direction distribution...');
  
  // Separate by axis AND direction (6 categories total)
  const categories = {
    econLeft: phase1Questions.filter(q => q.axis === 'economic' && q.agreeDir === -1),
    econRight: phase1Questions.filter(q => q.axis === 'economic' && q.agreeDir === 1),
    authLib: phase1Questions.filter(q => q.axis === 'authority' && q.agreeDir === -1),
    authAuth: phase1Questions.filter(q => q.axis === 'authority' && q.agreeDir === 1),
    cultProg: phase1Questions.filter(q => q.axis === 'cultural' && q.agreeDir === -1),
    cultTrad: phase1Questions.filter(q => q.axis === 'cultural' && q.agreeDir === 1)
  };
  
  // Shuffle each category
  const shuffled = {
    econLeft: shuffleArray(categories.econLeft),
    econRight: shuffleArray(categories.econRight),
    authLib: shuffleArray(categories.authLib),
    authAuth: shuffleArray(categories.authAuth),
    cultProg: shuffleArray(categories.cultProg),
    cultTrad: shuffleArray(categories.cultTrad)
  };
  
  console.log(`📊 Available questions:
    Economic: ${categories.econLeft.length} left, ${categories.econRight.length} right
    Authority: ${categories.authLib.length} lib, ${categories.authAuth.length} auth
    Cultural: ${categories.cultProg.length} prog, ${categories.cultTrad.length} trad`);
  
  // Track indices for each category
  const indices = {
    econLeft: 0, econRight: 0,
    authLib: 0, authAuth: 0,
    cultProg: 0, cultTrad: 0
  };
  
  // Distribution plan for 30 questions (6 screens of 5 questions each)
  // Goal: Balance both axis type AND political direction per screen
  const screenPlans = [
    // Screen 1: 2E (1L,1R), 2A (1L,1A), 1C (alt P/T)
    ['econLeft', 'econRight', 'authLib', 'authAuth', 'cultProg'],
    // Screen 2: 2E (1L,1R), 2A (1L,1A), 1C (alt T/P)
    ['econLeft', 'econRight', 'authLib', 'authAuth', 'cultTrad'],
    // Screen 3: 2E (1L,1R), 1A (alt), 2C (1P,1T)
    ['econLeft', 'econRight', 'authLib', 'cultProg', 'cultTrad'],
    // Screen 4: 1E (alt), 2A (1L,1A), 2C (1P,1T)
    ['econLeft', 'authLib', 'authAuth', 'cultProg', 'cultTrad'],
    // Screen 5: 2E (1R only due to imbalance), 1A (A), 2C (1P,1T)
    ['econRight', 'econRight', 'authAuth', 'cultProg', 'cultTrad'],
    // Screen 6: 1E (R), 2A (2A due to imbalance), 2C (1P,1T)
    ['econRight', 'authAuth', 'authAuth', 'cultProg', 'cultTrad']
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
    const aCount = shuffledScreen.filter(q => q.axis === 'authority').length;
    const cCount = shuffledScreen.filter(q => q.axis === 'cultural').length;
    const leftCount = shuffledScreen.filter(q => q.agreeDir === -1).length;
    const rightCount = shuffledScreen.filter(q => q.agreeDir === 1).length;
    
    console.log(`Screen ${screenIdx + 1}: E:${eCount} A:${aCount} C:${cCount} | Left:${leftCount} Right:${rightCount}`);
  }
  
  // Verify overall balance
  const totalLeft = finalQuestions.filter(q => q.agreeDir === -1).length;
  const totalRight = finalQuestions.filter(q => q.agreeDir === 1).length;
  console.log(`\n✅ Total balance: ${totalLeft} left-leaning, ${totalRight} right-leaning questions`);
  
  return finalQuestions;
}

// Example of how this maintains balance:
// Instead of potentially getting 5 right-wing economic questions in a row,
// each screen now has a mix of left and right positions across all axes.
// This prevents order bias where someone might answer differently 
// if they get all "government should..." questions first vs last.