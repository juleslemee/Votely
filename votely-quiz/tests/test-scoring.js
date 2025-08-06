// Simple test runner to verify scoring accuracy
// Run with: node test-scoring.js

// Mock the necessary functions
function normalizeScore(score, maxScore) {
  return (score / maxScore) * 100;
}

// Question configuration
const QUESTION_CONFIG = [
  // ECONOMIC QUESTIONS
  { id: 1, axis: 'economic', agreeDirection: 'left' },
  { id: 2, axis: 'economic', agreeDirection: 'right' },
  { id: 3, axis: 'economic', agreeDirection: 'right' },
  { id: 4, axis: 'economic', agreeDirection: 'left' },
  { id: 5, axis: 'economic', agreeDirection: 'left' },
  { id: 6, axis: 'economic', agreeDirection: 'right' },
  { id: 7, axis: 'economic', agreeDirection: 'left' },
  { id: 8, axis: 'economic', agreeDirection: 'right' },
  { id: 25, axis: 'economic', agreeDirection: 'left' },
  { id: 26, axis: 'economic', agreeDirection: 'right' },
  { id: 31, axis: 'economic', agreeDirection: 'left' },
  { id: 32, axis: 'economic', agreeDirection: 'right' },
  // AUTHORITY QUESTIONS  
  { id: 9, axis: 'authority', agreeDirection: 'authoritarian' },
  { id: 10, axis: 'authority', agreeDirection: 'libertarian' },
  { id: 11, axis: 'authority', agreeDirection: 'authoritarian' },
  { id: 12, axis: 'authority', agreeDirection: 'libertarian' },
  { id: 13, axis: 'authority', agreeDirection: 'authoritarian' },
  { id: 14, axis: 'authority', agreeDirection: 'libertarian' },
  { id: 15, axis: 'authority', agreeDirection: 'authoritarian' },
  { id: 16, axis: 'authority', agreeDirection: 'libertarian' },
  { id: 27, axis: 'authority', agreeDirection: 'authoritarian' },
  { id: 28, axis: 'authority', agreeDirection: 'libertarian' },
  { id: 33, axis: 'authority', agreeDirection: 'authoritarian' },
  { id: 34, axis: 'authority', agreeDirection: 'libertarian' },
  // CULTURAL QUESTIONS
  { id: 17, axis: 'cultural', agreeDirection: 'conservative' },
  { id: 18, axis: 'cultural', agreeDirection: 'progressive' },
  { id: 19, axis: 'cultural', agreeDirection: 'progressive' },
  { id: 20, axis: 'cultural', agreeDirection: 'conservative' },
  { id: 21, axis: 'cultural', agreeDirection: 'progressive' },
  { id: 22, axis: 'cultural', agreeDirection: 'progressive' },
  { id: 23, axis: 'cultural', agreeDirection: 'conservative' },
  { id: 24, axis: 'cultural', agreeDirection: 'conservative' },
  { id: 29, axis: 'cultural', agreeDirection: 'conservative' },
  { id: 30, axis: 'cultural', agreeDirection: 'progressive' },
];

function calculateScores(answers, questionIds) {
  let economicScore = 0;
  let socialScore = 0;
  let progressiveScore = 0;
  let economicQuestions = 0;
  let socialQuestions = 0;
  let progressiveQuestions = 0;

  const convertToScore = (value) => {
    return (value - 0.5) * 4; // Maps 0->-2, 0.5->0, 1->2
  };

  answers.forEach((continuousValue, index) => {
    if (index >= questionIds.length) return;
    if (isNaN(continuousValue)) return;
    
    const questionId = questionIds[index];
    const score = convertToScore(continuousValue);
    
    const config = QUESTION_CONFIG.find(c => c.id === questionId);
    if (!config) {
      console.warn(`No config found for question ID ${questionId}`);
      return;
    }

    if (config.axis === 'economic') {
      economicScore += config.agreeDirection === 'left' ? -score : score;
      economicQuestions++;
    } else if (config.axis === 'authority') {
      socialScore += config.agreeDirection === 'authoritarian' ? score : -score;
      socialQuestions++;
    } else if (config.axis === 'cultural') {
      progressiveScore += config.agreeDirection === 'progressive' ? -score : score;
      progressiveQuestions++;
    }
  });

  const maxEconomicScore = economicQuestions * 2;
  const maxSocialScore = socialQuestions * 2;
  const maxProgressiveScore = progressiveQuestions * 2;

  const economic = maxEconomicScore > 0 ? normalizeScore(economicScore, maxEconomicScore) : 0;
  const social = maxSocialScore > 0 ? normalizeScore(socialScore, maxSocialScore) : 0;
  const progressive = maxProgressiveScore > 0 ? normalizeScore(progressiveScore, maxProgressiveScore) : 0;

  return { economic, social, progressive };
}

// Test cases
console.log('🧪 Testing Quiz Scoring Accuracy\n');

// Test 1: All neutral should give 0,0,0
console.log('Test 1: All neutral answers');
const neutralAnswers = new Array(10).fill(0.5);
const shortQuizIds = [1, 2, 3, 4, 9, 10, 11, 12, 17, 18];
const neutralResult = calculateScores(neutralAnswers, shortQuizIds);
console.log('Expected: (0, 0, 0)');
console.log('Actual:', neutralResult);
console.log('✅ Pass:', neutralResult.economic === 0 && neutralResult.social === 0 && neutralResult.progressive === 0);
console.log();

// Test 2: Extreme economic left
console.log('Test 2: Extreme economic left');
const leftAnswers = [1.0, 0.0, 0.0, 1.0, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
const leftResult = calculateScores(leftAnswers, shortQuizIds);
console.log('Expected: economic < -50');
console.log('Actual:', leftResult);
console.log('✅ Pass:', leftResult.economic === -100);
console.log();

// Test 3: Extreme authoritarian
console.log('Test 3: Extreme authoritarian');
const authAnswers = [0.5, 0.5, 0.5, 0.5, 1.0, 0.0, 1.0, 0.0, 0.5, 0.5];
const authResult = calculateScores(authAnswers, shortQuizIds);
console.log('Expected: social > 50');
console.log('Actual:', authResult);
console.log('✅ Pass:', authResult.social === 100);
console.log();

// Test 4: Question order independence
console.log('Test 4: Question order independence');
const testAnswers = [0.8, 0.2, 0.6, 0.4, 0.7, 0.3, 0.9, 0.1, 0.5, 0.5];
const shuffledIds = [17, 1, 9, 4, 12, 18, 2, 10, 3, 11];
const shuffledAnswers = [0.5, 0.8, 0.7, 0.4, 0.1, 0.5, 0.2, 0.3, 0.6, 0.9];
const orderedResult = calculateScores(testAnswers, shortQuizIds);
const shuffledResult = calculateScores(shuffledAnswers, shuffledIds);
console.log('Ordered:', orderedResult);
console.log('Shuffled:', shuffledResult);
console.log('✅ Pass:', 
  Math.abs(orderedResult.economic - shuffledResult.economic) < 0.1 &&
  Math.abs(orderedResult.social - shuffledResult.social) < 0.1
);
console.log();

// Test 5: Mixed realistic answers
console.log('Test 5: Mixed realistic answers');
const mixedAnswers = [0.7, 0.3, 0.4, 0.8, 0.6, 0.5, 0.3, 0.7, 0.8, 0.2];
const mixedResult = calculateScores(mixedAnswers, shortQuizIds);
console.log('Result:', mixedResult);
console.log('Analysis:');
console.log('- Economic:', mixedResult.economic < 0 ? 'Leans left' : 'Leans right');
console.log('- Authority:', mixedResult.social > 0 ? 'Leans authoritarian' : 'Leans libertarian');
console.log('- Cultural:', mixedResult.progressive < 0 ? 'Leans progressive' : 'Leans conservative');

console.log('\n✅ All tests completed!');