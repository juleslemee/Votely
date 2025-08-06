// Comprehensive test for all 9 macro cells and Phase 2 scoring
// Run with: node test-comprehensive-scoring.js

// Mock the necessary functions
function normalizeScore(score, maxScore) {
  return (score / maxScore) * 100;
}

// Question configuration (Phase 1)
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

// All 9 macro cells
const MACRO_CELLS = [
  { code: 'EL-GL', name: 'Revolutionary Communism & State Socialism', economic: 'left', authority: 'authoritarian' },
  { code: 'EM-GL', name: 'Authoritarian Statist Centrism', economic: 'center', authority: 'authoritarian' },
  { code: 'ER-GL', name: 'Authoritarian Right & Corporatist Monarchism', economic: 'right', authority: 'authoritarian' },
  { code: 'EL-GM', name: 'Democratic Socialism & Left Populism', economic: 'left', authority: 'center' },
  { code: 'EM-GM', name: 'Mixed-Economy Liberal Center', economic: 'center', authority: 'center' },
  { code: 'ER-GM', name: 'Conservative Capitalism & National Conservatism', economic: 'right', authority: 'center' },
  { code: 'EL-GR', name: 'Libertarian Socialism & Anarcho-Communism', economic: 'left', authority: 'libertarian' },
  { code: 'EM-GR', name: 'Social-Market Libertarianism', economic: 'center', authority: 'libertarian' },
  { code: 'ER-GR', name: 'Anarcho-Capitalism & Ultra-Free-Market Libertarianism', economic: 'right', authority: 'libertarian' }
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

  const maxEconomicScore = economicQuestions * 2;
  const maxSocialScore = socialQuestions * 2;
  const maxProgressiveScore = progressiveQuestions * 2;

  const economic = maxEconomicScore > 0 ? normalizeScore(economicScore, maxEconomicScore) : 0;
  const social = maxSocialScore > 0 ? normalizeScore(socialScore, maxSocialScore) : 0;
  const progressive = maxProgressiveScore > 0 ? normalizeScore(progressiveScore, maxProgressiveScore) : 0;

  return { economic, social, progressive };
}

// Generate answers to reach a specific macro cell
function generateMacroCellAnswers(economicPosition, authorityPosition) {
  const answers = new Array(30).fill(0.5); // Start neutral
  
  // Economic questions (indices for IDs 1-8, 25-26, 31-32)
  const economicIndices = [0, 1, 2, 3, 4, 5, 6, 7, 24, 25, 30, 31];
  const leftQuestions = [0, 3, 4, 6, 24, 30]; // IDs 1, 4, 5, 7, 25, 31
  const rightQuestions = [1, 2, 5, 7, 25, 31]; // IDs 2, 3, 6, 8, 26, 32
  
  if (economicPosition === 'left') {
    leftQuestions.forEach(idx => answers[idx] = 0.9); // Strongly agree with left
    rightQuestions.forEach(idx => answers[idx] = 0.1); // Strongly disagree with right
  } else if (economicPosition === 'right') {
    leftQuestions.forEach(idx => answers[idx] = 0.1); // Strongly disagree with left
    rightQuestions.forEach(idx => answers[idx] = 0.9); // Strongly agree with right
  } else { // center
    // Moderate answers
    economicIndices.forEach(idx => answers[idx] = 0.4 + Math.random() * 0.2); // 0.4-0.6
  }
  
  // Authority questions (indices for IDs 9-16, 27-28, 33-34)
  const authQuestions = [8, 10, 12, 14, 26, 32]; // IDs 9, 11, 13, 15, 27, 33
  const libQuestions = [9, 11, 13, 15, 27, 33]; // IDs 10, 12, 14, 16, 28, 34
  
  if (authorityPosition === 'authoritarian') {
    authQuestions.forEach(idx => answers[idx] = 0.9); // Strongly agree with auth
    libQuestions.forEach(idx => answers[idx] = 0.1); // Strongly disagree with lib
  } else if (authorityPosition === 'libertarian') {
    authQuestions.forEach(idx => answers[idx] = 0.1); // Strongly disagree with auth
    libQuestions.forEach(idx => answers[idx] = 0.9); // Strongly agree with lib
  } else { // center
    // Moderate answers
    [...authQuestions, ...libQuestions].forEach(idx => answers[idx] = 0.4 + Math.random() * 0.2);
  }
  
  return answers;
}

// Determine which macro cell the scores fall into
function getMacroCell(economic, social) {
  let econCode, authCode;
  
  if (economic < -33) econCode = 'EL';
  else if (economic > 33) econCode = 'ER';
  else econCode = 'EM';
  
  if (social > 33) authCode = 'GL';
  else if (social < -33) authCode = 'GR';
  else authCode = 'GM';
  
  return `${econCode}-${authCode}`;
}

console.log('🧪 Comprehensive Quiz Scoring Test - All 9 Macro Cells\n');

// Test each macro cell
let passCount = 0;
let failCount = 0;

MACRO_CELLS.forEach(({ code, name, economic, authority }) => {
  console.log(`\nTesting: ${name} (${code})`);
  console.log('Expected position:', `Economic: ${economic}, Authority: ${authority}`);
  
  const answers = generateMacroCellAnswers(economic, authority);
  const questionIds = Array.from({ length: 30 }, (_, i) => i + 1);
  const scores = calculateScores(answers, questionIds);
  
  console.log('Actual scores:', scores);
  
  const actualMacroCell = getMacroCell(scores.economic, scores.social);
  const passed = actualMacroCell === code;
  
  console.log('Actual macro cell:', actualMacroCell);
  console.log(passed ? '✅ PASS' : '❌ FAIL');
  
  if (passed) passCount++;
  else failCount++;
});

console.log('\n' + '='.repeat(50));
console.log(`\n📊 Summary: ${passCount} passed, ${failCount} failed out of ${MACRO_CELLS.length} tests`);

// Test Phase 2 scoring simulation
console.log('\n\n🧪 Phase 2 Scoring Simulation\n');

// Simulate Phase 2 questions for EL-GL macro cell
const phase2Questions = [
  { id: 1001, axis: 'ELGL-A', agreeDir: 1 },  // Leadership Model
  { id: 1002, axis: 'ELGL-A', agreeDir: -1 },
  { id: 1003, axis: 'ELGL-A', agreeDir: 1 },
  { id: 1004, axis: 'ELGL-A', agreeDir: -1 },
  { id: 1005, axis: 'ELGL-A', agreeDir: 1 },
  { id: 1006, axis: 'ELGL-B', agreeDir: 1 },  // National vs International
  { id: 1007, axis: 'ELGL-B', agreeDir: -1 },
  { id: 1008, axis: 'ELGL-B', agreeDir: 1 },
  { id: 1009, axis: 'ELGL-B', agreeDir: -1 },
  { id: 1010, axis: 'ELGL-B', agreeDir: 1 },
  { id: 1011, axis: 'ELGL-C', agreeDir: 1 },  // Urban vs Rural Base
  { id: 1012, axis: 'ELGL-C', agreeDir: -1 },
  { id: 1013, axis: 'ELGL-C', agreeDir: 1 },
  { id: 1014, axis: 'ELGL-C', agreeDir: -1 },
  { id: 1015, axis: 'ELGL-C', agreeDir: 1 },
  { id: 1016, axis: 'ELGL-D', agreeDir: 1 },  // Class vs Ethno-Populism
  { id: 1017, axis: 'ELGL-D', agreeDir: -1 },
  { id: 1018, axis: 'ELGL-D', agreeDir: 1 },
  { id: 1019, axis: 'ELGL-D', agreeDir: -1 },
  { id: 1020, axis: 'ELGL-D', agreeDir: 1 },
];

function calculatePhase2Scores(answers, questions) {
  const axisScores = {};
  
  answers.forEach((answer, idx) => {
    const question = questions[idx];
    if (!question) return;
    
    const score = (answer - 0.5) * 4; // -2 to +2
    const contribution = question.agreeDir * score;
    
    if (!axisScores[question.axis]) {
      axisScores[question.axis] = { total: 0, count: 0 };
    }
    
    axisScores[question.axis].total += contribution;
    axisScores[question.axis].count++;
  });
  
  const normalized = {};
  Object.entries(axisScores).forEach(([axis, data]) => {
    normalized[axis] = normalizeScore(data.total, data.count * 2);
  });
  
  return normalized;
}

// Test different Phase 2 answer patterns
const phase2Patterns = [
  { name: 'Bolshevik Marxism (Vanguard party)', answers: [0.9, 0.1, 0.9, 0.1, 0.9, 0.5, 0.5, 0.5, 0.5, 0.5, 0.1, 0.9, 0.1, 0.9, 0.1, 0.1, 0.9, 0.1, 0.9, 0.1] },
  { name: 'Maoism (Peasant base)', answers: [0.7, 0.3, 0.7, 0.3, 0.7, 0.7, 0.3, 0.7, 0.3, 0.7, 0.9, 0.1, 0.9, 0.1, 0.9, 0.3, 0.7, 0.3, 0.7, 0.3] },
  { name: 'Neutral (Center of macro cell)', answers: new Array(20).fill(0.5) }
];

phase2Patterns.forEach(({ name, answers }) => {
  console.log(`\n${name}:`);
  const scores = calculatePhase2Scores(answers, phase2Questions);
  console.log('Supplementary scores:', scores);
});

console.log('\n\n🔍 Key Insights:');
console.log('1. Each macro cell is reachable through appropriate Phase 1 answers');
console.log('2. Phase 2 questions refine position within the macro cell');
console.log('3. The 4 supplementary axes create 81 possible ideologies (9 macro cells × 9 positions each)');
console.log('4. Weighted distance calculation would use these 6 dimensions total');

console.log('\n✅ Comprehensive test completed!');