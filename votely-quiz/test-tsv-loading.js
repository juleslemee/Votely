// Test that TSV loading is working correctly
const fs = require('fs');
const path = require('path');

// Load and parse the TSV file
function loadTSV() {
  const tsvPath = path.join(__dirname, 'public', 'political_quiz_final.tsv');
  const content = fs.readFileSync(tsvPath, 'utf-8');
  const lines = content.trim().split('\n');
  const headers = lines[0].split('\t');
  
  const questions = {
    phase1: [],
    tiebreakers: [],
    phase2: []
  };
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split('\t');
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });
    
    if (row.phase === '1') {
      if (row.q_type === 'core') {
        questions.phase1.push({
          id: row.id,
          text: row.text,
          axis: row.axis,
          agreeDir: parseInt(row.agree_dir)
        });
      } else if (row.q_type === 'tiebreaker') {
        questions.tiebreakers.push({
          id: row.id,
          text: row.text,
          axis: row.axis,
          agreeDir: parseInt(row.agree_dir),
          boundary: row.macro_cell
        });
      }
    } else if (row.phase === '2') {
      questions.phase2.push({
        id: row.id,
        text: row.text,
        supplementAxis: row.axis
      });
    }
  }
  
  return questions;
}

// Test the loading
console.log('Testing TSV Loading...\n');
const questions = loadTSV();

console.log(`Phase 1 Core Questions: ${questions.phase1.length}`);
console.log(`Tiebreaker Questions: ${questions.tiebreakers.length}`);
console.log(`Phase 2 Questions: ${questions.phase2.length}`);

// Check for military question (P04)
const militaryQuestion = questions.phase1.find(q => q.id === 'P04');
if (militaryQuestion) {
  console.log('\n✅ Found updated P04 (military spending):');
  console.log(`   Text: "${militaryQuestion.text.substring(0, 60)}..."`);
  console.log(`   Axis: ${militaryQuestion.axis}`);
  console.log(`   AgreeDir: ${militaryQuestion.agreeDir}`);
} else {
  console.log('\n❌ P04 not found!');
}

// Check for police powers question (P14)
const policeQuestion = questions.phase1.find(q => q.id === 'P14');
if (policeQuestion) {
  console.log('\n✅ Found updated P14 (police powers):');
  console.log(`   Text: "${policeQuestion.text.substring(0, 60)}..."`);
  console.log(`   Axis: ${policeQuestion.axis}`);
  console.log(`   AgreeDir: ${policeQuestion.agreeDir}`);
} else {
  console.log('\n❌ P14 not found!');
}

// Check tiebreaker questions
console.log('\n📍 Tiebreaker Questions:');
const boundaries = ['LEFT_CENTER', 'CENTER_RIGHT', 'LIB_CENTER', 'CENTER_AUTH'];
boundaries.forEach(boundary => {
  const boundaryQuestions = questions.tiebreakers.filter(q => q.boundary === boundary);
  console.log(`   ${boundary}: ${boundaryQuestions.length} questions`);
  if (boundaryQuestions.length > 0) {
    console.log(`      - "${boundaryQuestions[0].text.substring(0, 40)}..."`);
  }
});

// Check axis balance
console.log('\n📊 Phase 1 Axis Balance:');
const axisCounts = { econ: 0, auth: 0, soc: 0 };
const dirCounts = { left: 0, right: 0 };
questions.phase1.forEach(q => {
  axisCounts[q.axis]++;
  if (q.agreeDir === -1) dirCounts.left++;
  else dirCounts.right++;
});
console.log(`   Economic: ${axisCounts.econ}`);
console.log(`   Authority: ${axisCounts.auth}`);
console.log(`   Cultural: ${axisCounts.soc}`);
console.log(`   Left-leaning: ${dirCounts.left}`);
console.log(`   Right-leaning: ${dirCounts.right}`);

console.log('\n✅ TSV Loading Test Complete');