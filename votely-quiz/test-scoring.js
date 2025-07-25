// Test scoring for different extreme political positions
// This file tests the scoring logic to ensure it works correctly

// Import the question configurations
const QUESTION_CONFIG = [
  // ECONOMIC QUESTIONS (16 total) - IDs 1-16
  { id: 1, axis: 'economic', agreeDirection: 'left' },
  { id: 2, axis: 'economic', agreeDirection: 'left' },
  { id: 3, axis: 'economic', agreeDirection: 'left' },
  { id: 4, axis: 'economic', agreeDirection: 'left' },
  { id: 5, axis: 'economic', agreeDirection: 'left' },
  { id: 6, axis: 'economic', agreeDirection: 'left' },
  { id: 7, axis: 'economic', agreeDirection: 'left' },
  { id: 8, axis: 'economic', agreeDirection: 'left' },
  { id: 9, axis: 'economic', agreeDirection: 'right' },
  { id: 10, axis: 'economic', agreeDirection: 'right' },
  { id: 11, axis: 'economic', agreeDirection: 'right' },
  { id: 12, axis: 'economic', agreeDirection: 'right' },
  { id: 13, axis: 'economic', agreeDirection: 'right' },
  { id: 14, axis: 'economic', agreeDirection: 'right' },
  { id: 15, axis: 'economic', agreeDirection: 'right' },
  { id: 16, axis: 'economic', agreeDirection: 'right' },
  // AUTHORITY QUESTIONS (17 total) - IDs 17-33
  { id: 17, axis: 'authority', agreeDirection: 'authoritarian' },
  { id: 18, axis: 'authority', agreeDirection: 'authoritarian' },
  { id: 19, axis: 'authority', agreeDirection: 'authoritarian' },
  { id: 20, axis: 'authority', agreeDirection: 'authoritarian' },
  { id: 21, axis: 'authority', agreeDirection: 'authoritarian' },
  { id: 22, axis: 'authority', agreeDirection: 'authoritarian' },
  { id: 23, axis: 'authority', agreeDirection: 'authoritarian' },
  { id: 24, axis: 'authority', agreeDirection: 'authoritarian' },
  { id: 25, axis: 'authority', agreeDirection: 'libertarian' },
  { id: 26, axis: 'authority', agreeDirection: 'libertarian' },
  { id: 27, axis: 'authority', agreeDirection: 'libertarian' },
  { id: 28, axis: 'authority', agreeDirection: 'libertarian' },
  { id: 29, axis: 'authority', agreeDirection: 'libertarian' },
  { id: 30, axis: 'authority', agreeDirection: 'libertarian' },
  { id: 31, axis: 'authority', agreeDirection: 'libertarian' },
  { id: 32, axis: 'authority', agreeDirection: 'libertarian' },
  { id: 33, axis: 'authority', agreeDirection: 'libertarian' },
  // CULTURAL QUESTIONS (17 total) - IDs 34-50
  { id: 34, axis: 'cultural', agreeDirection: 'conservative' },
  { id: 35, axis: 'cultural', agreeDirection: 'conservative' },
  { id: 36, axis: 'cultural', agreeDirection: 'conservative' },
  { id: 37, axis: 'cultural', agreeDirection: 'conservative' },
  { id: 38, axis: 'cultural', agreeDirection: 'conservative' },
  { id: 39, axis: 'cultural', agreeDirection: 'conservative' },
  { id: 40, axis: 'cultural', agreeDirection: 'conservative' },
  { id: 41, axis: 'cultural', agreeDirection: 'progressive' },
  { id: 42, axis: 'cultural', agreeDirection: 'progressive' },
  { id: 43, axis: 'cultural', agreeDirection: 'progressive' },
  { id: 44, axis: 'cultural', agreeDirection: 'progressive' },
  { id: 45, axis: 'cultural', agreeDirection: 'progressive' },
  { id: 46, axis: 'cultural', agreeDirection: 'progressive' },
  { id: 47, axis: 'cultural', agreeDirection: 'progressive' },
  { id: 48, axis: 'cultural', agreeDirection: 'progressive' },
  { id: 49, axis: 'cultural', agreeDirection: 'progressive' },
  { id: 50, axis: 'cultural', agreeDirection: 'conservative' },
];

// Normalize scores to -100 to 100 range
function normalizeScore(score, maxScore) {
  return (score / maxScore) * 100;
}

// Calculate scores function (mimics the one in results-client.tsx)
function calculateScores(answers, quizType = 'short') {
  let economicScore = 0;
  let socialScore = 0;
  let progressiveScore = 0;
  let economicQuestions = 0;
  let socialQuestions = 0;
  let progressiveQuestions = 0;

  // Convert continuous values (0-1) to score values (-2 to +2)
  const convertToScore = (value) => {
    return (value - 0.5) * 4; // Maps 0->-2, 0.5->0, 1->2
  };

  // Map question indices to actual question IDs based on quiz type
  const getQuestionIds = (quizType) => {
    if (quizType === 'long') {
      // Long quiz uses questions in a specific shuffled order
      return [
        1, 17, 34, 9, 25, 41, 2, 18, 35, 10,
        26, 42, 3, 19, 36, 11, 27, 43, 4, 20,
        37, 12, 28, 44, 5, 21, 38, 13, 29, 45,
        6, 22, 39, 14, 30, 46, 7, 23, 40, 15,
        31, 47, 8, 24, 48, 16, 32, 49, 33, 50
      ];
    } else {
      // Short quiz uses specific question IDs: [4, 20, 41, 9, 25, 6, 35, 29, 14, 44]
      return [4, 20, 41, 9, 25, 6, 35, 29, 14, 44];
    }
  };

  const questionIds = getQuestionIds(quizType);

  questionIds.forEach((questionId, index) => {
    if (index >= answers.length) return;
    
    const continuousValue = answers[index];
    if (isNaN(continuousValue)) return;
    
    const score = convertToScore(continuousValue);
    
    // Find the config for this question ID
    const config = QUESTION_CONFIG.find(c => c.id === questionId);
    if (!config) return;

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

  // Calculate max possible scores based on number of questions answered
  const maxEconomicScore = economicQuestions * 2;
  const maxSocialScore = socialQuestions * 2;
  const maxProgressiveScore = progressiveQuestions * 2;

  // Prevent division by zero
  const economic = maxEconomicScore > 0 ? normalizeScore(economicScore, maxEconomicScore) : 0;
  const social = maxSocialScore > 0 ? normalizeScore(socialScore, maxSocialScore) : 0;
  const progressive = maxProgressiveScore > 0 ? normalizeScore(progressiveScore, maxProgressiveScore) : 0;

  return { economic, social, progressive };
}

// Test scenarios
console.log("=== TESTING QUIZ SCORING ===\n");

// Test 1: Extreme Economic Left (Short Quiz)
console.log("TEST 1: Extreme Economic Left (Short Quiz)");
console.log("Questions: [4, 20, 41, 9, 25, 6, 35, 29, 14, 44]");
console.log("Economic questions: 4(left), 9(right), 6(left), 14(right)");
console.log("Answering: Strongly agree to left questions, strongly disagree to right questions");
const extremeLeftShort = [
  1.0, // Q4 (economic left) - strongly agree
  0.5, // Q20 (authority authoritarian) - neutral
  0.5, // Q41 (cultural progressive) - neutral
  0.0, // Q9 (economic right) - strongly disagree
  0.5, // Q25 (authority libertarian) - neutral
  1.0, // Q6 (economic left) - strongly agree
  0.5, // Q35 (cultural conservative) - neutral
  0.5, // Q29 (authority libertarian) - neutral
  0.0, // Q14 (economic right) - strongly disagree
  0.5  // Q44 (cultural progressive) - neutral
];
const leftResultShort = calculateScores(extremeLeftShort, 'short');
console.log("Result:", leftResultShort);
console.log("Expected: economic should be strongly negative (left)\n");

// Test 2: Extreme Economic Right (Short Quiz)
console.log("TEST 2: Extreme Economic Right (Short Quiz)");
const extremeRightShort = [
  0.0, // Q4 (economic left) - strongly disagree
  0.5, // Q20 (authority authoritarian) - neutral
  0.5, // Q41 (cultural progressive) - neutral
  1.0, // Q9 (economic right) - strongly agree
  0.5, // Q25 (authority libertarian) - neutral
  0.0, // Q6 (economic left) - strongly disagree
  0.5, // Q35 (cultural conservative) - neutral
  0.5, // Q29 (authority libertarian) - neutral
  1.0, // Q14 (economic right) - strongly agree
  0.5  // Q44 (cultural progressive) - neutral
];
const rightResultShort = calculateScores(extremeRightShort, 'short');
console.log("Result:", rightResultShort);
console.log("Expected: economic should be strongly positive (right)\n");

// Test 3: Extreme Authoritarian (Short Quiz)
console.log("TEST 3: Extreme Authoritarian (Short Quiz)");
console.log("Authority questions: 20(auth), 25(lib), 29(lib)");
const extremeAuthShort = [
  0.5, // Q4 (economic) - neutral
  1.0, // Q20 (authority authoritarian) - strongly agree
  0.5, // Q41 (cultural progressive) - neutral
  0.5, // Q9 (economic) - neutral
  0.0, // Q25 (authority libertarian) - strongly disagree
  0.5, // Q6 (economic) - neutral
  0.5, // Q35 (cultural conservative) - neutral
  0.0, // Q29 (authority libertarian) - strongly disagree
  0.5, // Q14 (economic) - neutral
  0.5  // Q44 (cultural progressive) - neutral
];
const authResultShort = calculateScores(extremeAuthShort, 'short');
console.log("Result:", authResultShort);
console.log("Expected: social should be strongly positive (authoritarian)\n");

// Test 4: Extreme Libertarian (Short Quiz)
console.log("TEST 4: Extreme Libertarian (Short Quiz)");
const extremeLibShort = [
  0.5, // Q4 (economic) - neutral
  0.0, // Q20 (authority authoritarian) - strongly disagree
  0.5, // Q41 (cultural progressive) - neutral
  0.5, // Q9 (economic) - neutral
  1.0, // Q25 (authority libertarian) - strongly agree
  0.5, // Q6 (economic) - neutral
  0.5, // Q35 (cultural conservative) - neutral
  1.0, // Q29 (authority libertarian) - strongly agree
  0.5, // Q14 (economic) - neutral
  0.5  // Q44 (cultural progressive) - neutral
];
const libResultShort = calculateScores(extremeLibShort, 'short');
console.log("Result:", libResultShort);
console.log("Expected: social should be strongly negative (libertarian)\n");

// Test 5: Extreme Progressive (Short Quiz)
console.log("TEST 5: Extreme Progressive (Short Quiz)");
console.log("Cultural questions: 41(prog), 35(cons), 44(prog)");
const extremeProgShort = [
  0.5, // Q4 (economic) - neutral
  0.5, // Q20 (authority authoritarian) - neutral
  1.0, // Q41 (cultural progressive) - strongly agree
  0.5, // Q9 (economic) - neutral
  0.5, // Q25 (authority libertarian) - neutral
  0.5, // Q6 (economic) - neutral
  0.0, // Q35 (cultural conservative) - strongly disagree
  0.5, // Q29 (authority libertarian) - neutral
  0.5, // Q14 (economic) - neutral
  1.0  // Q44 (cultural progressive) - strongly agree
];
const progResultShort = calculateScores(extremeProgShort, 'short');
console.log("Result:", progResultShort);
console.log("Expected: progressive should be strongly negative (progressive)\n");

// Test 6: Extreme Conservative (Short Quiz)
console.log("TEST 6: Extreme Conservative (Short Quiz)");
const extremeConsShort = [
  0.5, // Q4 (economic) - neutral
  0.5, // Q20 (authority authoritarian) - neutral
  0.0, // Q41 (cultural progressive) - strongly disagree
  0.5, // Q9 (economic) - neutral
  0.5, // Q25 (authority libertarian) - neutral
  0.5, // Q6 (economic) - neutral
  1.0, // Q35 (cultural conservative) - strongly agree
  0.5, // Q29 (authority libertarian) - neutral
  0.5, // Q14 (economic) - neutral
  0.0  // Q44 (cultural progressive) - strongly disagree
];
const consResultShort = calculateScores(extremeConsShort, 'short');
console.log("Result:", consResultShort);
console.log("Expected: progressive should be strongly positive (conservative)\n");

// Test 7: Long Quiz - Extreme Socialist & Progressive
console.log("TEST 7: Long Quiz - Socialist & Progressive Person");
console.log("This simulates someone who is economically far left and culturally progressive");
const socialistProgressiveLong = new Array(50).fill(0.5); // Start with all neutral

// Set economic left questions to strongly agree (1.0)
[0, 6, 12, 18, 24, 30, 36, 42].forEach(idx => socialistProgressiveLong[idx] = 1.0); // IDs 1,2,3,4,5,6,7,8

// Set economic right questions to strongly disagree (0.0)
[3, 9, 15, 21, 27, 33, 39, 45].forEach(idx => socialistProgressiveLong[idx] = 0.0); // IDs 9,10,11,12,13,14,15,16

// Set progressive questions to strongly agree (1.0)
[5, 11, 17, 23, 29, 35, 41, 44, 47].forEach(idx => socialistProgressiveLong[idx] = 1.0); // IDs 41,42,43,44,45,46,47,48,49

// Set conservative questions to strongly disagree (0.0)
[2, 8, 14, 20, 26, 32, 38, 49].forEach(idx => socialistProgressiveLong[idx] = 0.0); // IDs 34,35,36,37,38,39,40,50

const socialistProgResult = calculateScores(socialistProgressiveLong, 'long');
console.log("Result:", socialistProgResult);
console.log("Expected: economic strongly negative (left), progressive strongly negative (progressive)\n");

// Test 8: Combined Extreme - Anarcho-Capitalist
console.log("TEST 8: Long Quiz - Anarcho-Capitalist");
console.log("This simulates extreme economic right + extreme libertarian");
const anarchoCapLong = new Array(50).fill(0.5); // Start with all neutral

// Set economic right questions to strongly agree (1.0)
[3, 9, 15, 21, 27, 33, 39, 45].forEach(idx => anarchoCapLong[idx] = 1.0); // IDs 9,10,11,12,13,14,15,16

// Set economic left questions to strongly disagree (0.0)
[0, 6, 12, 18, 24, 30, 36, 42].forEach(idx => anarchoCapLong[idx] = 0.0); // IDs 1,2,3,4,5,6,7,8

// Set libertarian questions to strongly agree (1.0)
[4, 10, 16, 22, 28, 34, 40, 46, 48].forEach(idx => anarchoCapLong[idx] = 1.0); // IDs 25,26,27,28,29,30,31,32,33

// Set authoritarian questions to strongly disagree (0.0)
[1, 7, 13, 19, 25, 31, 37, 43].forEach(idx => anarchoCapLong[idx] = 0.0); // IDs 17,18,19,20,21,22,23,24

const anarchoCapResult = calculateScores(anarchoCapLong, 'long');
console.log("Result:", anarchoCapResult);
console.log("Expected: economic strongly positive (right), social strongly negative (libertarian)\n");

console.log("=== SCORING VERIFICATION COMPLETE ===");
console.log("\nSummary:");
console.log("- Negative economic = LEFT, Positive economic = RIGHT");
console.log("- Negative social = LIBERTARIAN, Positive social = AUTHORITARIAN");
console.log("- Negative progressive = PROGRESSIVE, Positive progressive = CONSERVATIVE");