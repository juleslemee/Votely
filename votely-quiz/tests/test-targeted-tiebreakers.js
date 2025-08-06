// Test file with targeted tiebreaker system
const fs = require('fs');

// Load questions from TSV including targeted tiebreakers
async function loadQuestionsWithTiebreakers() {
  const tsvContent = fs.readFileSync('./public/political_quiz_final.tsv', 'utf-8');
  const lines = tsvContent.split('\n');
  const headers = lines[0].split('\t');
  
  const phase1Questions = [];
  const tiebreakers = {
    LEFT_CENTER: [],
    CENTER_RIGHT: [],
    LIB_CENTER: [],
    CENTER_AUTH: []
  };
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = line.split('\t');
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });
    
    // Core Phase 1 questions
    if (row.phase === '1' && row.q_type === 'core') {
      let axis = row.axis;
      if (axis === 'econ') axis = 'economic';
      if (axis === 'auth') axis = 'authority';
      if (axis === 'soc') axis = 'cultural';
      
      const idNum = parseInt(row.id.substring(1));
      
      phase1Questions.push({
        id: idNum,
        text: row.text,
        axis: axis,
        agreeDir: parseInt(row.agree_dir)
      });
    }
    
    // Targeted tiebreaker questions
    if (row.phase === '1' && row.q_type === 'tiebreaker') {
      let axis = row.axis;
      if (axis === 'econ') axis = 'economic';
      if (axis === 'auth') axis = 'authority';
      
      const boundary = row.macro_cell;
      if (tiebreakers[boundary]) {
        tiebreakers[boundary].push({
          id: row.id,
          text: row.text,
          axis: axis,
          agreeDir: parseInt(row.agree_dir),
          boundary: boundary
        });
      }
    }
  }
  
  phase1Questions.sort((a, b) => a.id - b.id);
  return { phase1Questions, tiebreakers };
}

// Detect which boundaries a score is near
function detectBoundaries(economicScore, authorityScore) {
  const boundaries = [];
  const MARGIN = 15;
  
  // Economic boundaries
  if (economicScore >= -33 - MARGIN && economicScore <= -33 + MARGIN) {
    boundaries.push('LEFT_CENTER');
  }
  if (economicScore >= 33 - MARGIN && economicScore <= 33 + MARGIN) {
    boundaries.push('CENTER_RIGHT');
  }
  
  // Authority boundaries  
  if (authorityScore >= -33 - MARGIN && authorityScore <= -33 + MARGIN) {
    boundaries.push('LIB_CENTER');
  }
  if (authorityScore >= 33 - MARGIN && authorityScore <= 33 + MARGIN) {
    boundaries.push('CENTER_AUTH');
  }
  
  return boundaries;
}

// Get appropriate tiebreaker questions based on scores
function getTiebreakerQuestions(economicScore, authorityScore, tiebreakers) {
  const boundaries = detectBoundaries(economicScore, authorityScore);
  const selectedQuestions = [];
  
  boundaries.forEach(boundary => {
    if (tiebreakers[boundary]) {
      selectedQuestions.push(...tiebreakers[boundary]);
    }
  });
  
  return selectedQuestions;
}

// Simulate answering questions with targeted tiebreakers
async function testWithTargetedTiebreakers() {
  console.log('🎯 Testing Targeted Tiebreaker System\n');
  console.log('=' .repeat(70));
  
  const { phase1Questions, tiebreakers } = await loadQuestionsWithTiebreakers();
  
  console.log('\n📋 Loaded Questions:');
  console.log(`- Core Phase 1: ${phase1Questions.length} questions`);
  console.log(`- Left-Center tiebreakers: ${tiebreakers.LEFT_CENTER.length}`);
  console.log(`- Center-Right tiebreakers: ${tiebreakers.CENTER_RIGHT.length}`);
  console.log(`- Lib-Center tiebreakers: ${tiebreakers.LIB_CENTER.length}`);
  console.log(`- Center-Auth tiebreakers: ${tiebreakers.CENTER_AUTH.length}`);
  
  // Test cases for different boundary scenarios
  const testCases = [
    {
      name: 'Nazism (Center-Right boundary)',
      economicPrelim: 28.7,
      authorityPrelim: 98.1,
      expectedBoundaries: ['CENTER_RIGHT']
    },
    {
      name: 'Liberal Socialism (Left-Center boundary)',
      economicPrelim: -31.4,
      authorityPrelim: -27.5,
      expectedBoundaries: ['LEFT_CENTER', 'LIB_CENTER']
    },
    {
      name: 'Paternalistic Conservatism (Multiple boundaries)',
      economicPrelim: 20.7,
      authorityPrelim: 40.4,
      expectedBoundaries: ['CENTER_RIGHT', 'CENTER_AUTH']
    },
    {
      name: 'Centrist (No boundaries)',
      economicPrelim: 0,
      authorityPrelim: 0,
      expectedBoundaries: []
    }
  ];
  
  console.log('\n\n🧪 Testing Boundary Detection:\n');
  
  testCases.forEach(test => {
    const boundaries = detectBoundaries(test.economicPrelim, test.authorityPrelim);
    const questions = getTiebreakerQuestions(test.economicPrelim, test.authorityPrelim, tiebreakers);
    
    console.log(`${test.name}:`);
    console.log(`  Scores: E:${test.economicPrelim.toFixed(1)}, A:${test.authorityPrelim.toFixed(1)}`);
    console.log(`  Detected boundaries: ${boundaries.length > 0 ? boundaries.join(', ') : 'None'}`);
    console.log(`  Tiebreaker questions: ${questions.length}`);
    
    if (questions.length > 0) {
      questions.forEach(q => {
        console.log(`    - ${q.id}: "${q.text.substring(0, 50)}..."`);
      });
    }
    
    const success = JSON.stringify(boundaries.sort()) === JSON.stringify(test.expectedBoundaries.sort());
    console.log(`  ✅ Result: ${success ? 'PASS' : 'FAIL'}\n`);
  });
  
  console.log('=' .repeat(70));
  console.log('\n💡 Key Benefits:');
  console.log('1. Targeted questions only appear when needed');
  console.log('2. Different boundaries get different clarifying questions');
  console.log('3. Multiple boundaries trigger multiple tiebreakers');
  console.log('4. No unnecessary questions for clear placements');
}

// Run the test
testWithTargetedTiebreakers().catch(console.error);