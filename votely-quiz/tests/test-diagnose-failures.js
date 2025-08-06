// Diagnose why Tito and Burke personas failed to reach correct macro cells

const fs = require('fs');

// Load actual questions from TSV
async function loadActualQuestions() {
  const tsvContent = fs.readFileSync('./public/political_quiz_final.tsv', 'utf-8');
  const lines = tsvContent.split('\n');
  const headers = lines[0].split('\t');
  
  const phase1Questions = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = line.split('\t');
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });
    
    // Only get Phase 1 core questions (P01-P30)
    if (row.phase === '1' && row.q_type === 'core') {
      // Map axis names from TSV to our expected format
      let axis = row.axis;
      if (axis === 'econ') axis = 'economic';
      if (axis === 'auth') axis = 'authority';
      if (axis === 'soc') axis = 'cultural';
      
      // Parse question ID to number
      const idNum = parseInt(row.id.substring(1));
      
      phase1Questions.push({
        id: idNum,
        text: row.text,
        axis: axis,
        agreeDir: parseInt(row.agree_dir)
      });
    }
  }
  
  // Sort by ID to ensure correct order
  phase1Questions.sort((a, b) => a.id - b.id);
  
  return phase1Questions;
}

// Problematic personas
const PROBLEM_PERSONAS = [
  {
    name: "Josip Broz Tito (Market Socialism)",
    targetMacroCell: "EL-GL", // Need: Left Authoritarian
    actualMacroCell: "EM-GL", // Got: Center Authoritarian
    actualScores: { economic: -32.0, authority: 51.5, cultural: -10.1 },
    beliefs: {
      economic: {
        redistribution: 0.8,     // Worker ownership
        freeTaxes: 0.2,         // High taxes
        freeMarket: 0.3,        // Socialist markets
        regulation: 0.7,        // Heavy regulation
        healthcare: 0.9,        // Universal
        welfare: 0.2,           // Strong welfare
        unions: 0.4,            // Workers councils instead
        privatization: 0.1      // Social ownership
      }
    }
  },
  {
    name: "Edmund Burke (Traditional Conservative)",
    targetMacroCell: "ER-GM", // Need: Right Moderate
    actualMacroCell: "EM-GM", // Got: Center Moderate  
    actualScores: { economic: 25.2, authority: 11.4, cultural: 64.3 },
    beliefs: {
      economic: {
        redistribution: 0.3,     // Some noblesse oblige
        freeTaxes: 0.7,         // Low taxes
        freeMarket: 0.7,        // Free but moral markets
        regulation: 0.4,        // Some regulation
        healthcare: 0.3,        // Private charity
        welfare: 0.6,           // Limited welfare
        unions: 0.4,            // Suspicious of unions
        privatization: 0.7      // Private property sacred
      }
    }
  }
];

// Simulate how a persona would answer a question
function personaAnswer(persona, question) {
  let baseAnswer = 0.5; // Default neutral
  
  // Map questions to beliefs based on content keywords
  const text = question.text.toLowerCase();
  
  if (question.axis === 'economic') {
    if (text.includes('redistribute') || text.includes('wealth') && text.includes('equal')) {
      baseAnswer = persona.beliefs.economic.redistribution;
    } else if (text.includes('tax') && (text.includes('lower') || text.includes('business'))) {
      baseAnswer = persona.beliefs.economic.freeTaxes;
    } else if (text.includes('free-market') || text.includes('capitalism')) {
      baseAnswer = persona.beliefs.economic.freeMarket;
    } else if (text.includes('regulation') && text.includes('business')) {
      baseAnswer = text.includes('too much') ? 
        1 - persona.beliefs.economic.regulation : 
        persona.beliefs.economic.regulation;
    } else if (text.includes('healthcare')) {
      baseAnswer = persona.beliefs.economic.healthcare;
    } else if (text.includes('welfare')) {
      baseAnswer = persona.beliefs.economic.welfare;
    } else if (text.includes('union')) {
      baseAnswer = persona.beliefs.economic.unions;
    } else if (text.includes('private') && text.includes('efficient')) {
      baseAnswer = persona.beliefs.economic.privatization;
    } else if (text.includes('high-income') && text.includes('tax')) {
      baseAnswer = persona.beliefs.economic.redistribution;
    }
  }
  
  return baseAnswer;
}

// Calculate scores
function calculateScores(answers, questions) {
  let economicScore = 0, socialScore = 0, culturalScore = 0;
  let economicCount = 0, socialCount = 0, culturalCount = 0;
  
  answers.forEach((answer, idx) => {
    const question = questions[idx];
    const score = (answer - 0.5) * 4; // -2 to +2
    
    if (question.axis === 'economic') {
      economicScore += question.agreeDir * score;
      economicCount++;
    } else if (question.axis === 'authority') {
      socialScore += question.agreeDir * score;
      socialCount++;
    } else if (question.axis === 'cultural') {
      culturalScore += question.agreeDir * score;
      culturalCount++;
    }
  });
  
  return {
    economic: (economicScore / (economicCount * 2)) * 100,
    social: (socialScore / (socialCount * 2)) * 100,
    cultural: (culturalScore / (culturalCount * 2)) * 100
  };
}

// Main diagnostic
async function diagnoseFailures() {
  console.log('🔍 Diagnosing Persona Failures\n');
  
  const questions = await loadActualQuestions();
  
  for (const persona of PROBLEM_PERSONAS) {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`Analyzing: ${persona.name}`);
    console.log(`Target: ${persona.targetMacroCell} | Got: ${persona.actualMacroCell}`);
    console.log(`Scores: Econ=${persona.actualScores.economic}, Auth=${persona.actualScores.authority}`);
    console.log(`${'═'.repeat(60)}\n`);
    
    // Analyze economic axis
    if (persona.targetMacroCell.startsWith('EL') && persona.actualMacroCell.startsWith('EM')) {
      console.log('❌ ECONOMIC AXIS: Not left enough!');
      console.log('   Need: < -33 | Got:', persona.actualScores.economic);
      console.log('   Missing by:', (-33 - persona.actualScores.economic).toFixed(1), 'points\n');
      
      // Show economic questions and answers
      console.log('📊 Economic Question Analysis:');
      const economicQuestions = questions.filter(q => q.axis === 'economic');
      economicQuestions.forEach(q => {
        const answer = personaAnswer(persona, q);
        const score = (answer - 0.5) * 4 * q.agreeDir;
        console.log(`   Q${q.id}: Answer=${answer.toFixed(2)}, Score=${score.toFixed(1)}`);
        console.log(`        "${q.text.substring(0, 60)}..."`);
      });
      
      // Calculate what answers need to change
      console.log('\n💡 To reach EL (Left), this persona needs:');
      console.log('   - Stronger anti-market positions (currently 0.3)');
      console.log('   - More extreme pro-redistribution (currently 0.8)');
      console.log('   - Stronger anti-privatization (currently 0.1)');
    }
    
    if (persona.targetMacroCell.startsWith('ER') && persona.actualMacroCell.startsWith('EM')) {
      console.log('❌ ECONOMIC AXIS: Not right enough!');
      console.log('   Need: > 33 | Got:', persona.actualScores.economic);
      console.log('   Missing by:', (33 - persona.actualScores.economic).toFixed(1), 'points\n');
      
      // Show economic questions and answers
      console.log('📊 Economic Question Analysis:');
      const economicQuestions = questions.filter(q => q.axis === 'economic');
      let leftAnswers = 0, rightAnswers = 0;
      
      economicQuestions.forEach(q => {
        const answer = personaAnswer(persona, q);
        const score = (answer - 0.5) * 4 * q.agreeDir;
        
        if (q.agreeDir === -1) { // Left questions
          if (answer > 0.5) leftAnswers++;
        } else { // Right questions
          if (answer > 0.5) rightAnswers++;
        }
        
        if (Math.abs(score) > 1) {
          console.log(`   Q${q.id}: Answer=${answer.toFixed(2)}, Score=${score.toFixed(1)} ${score < -1 ? '⬅️' : score > 1 ? '➡️' : ''}`);
          console.log(`        "${q.text.substring(0, 60)}..."`);
        }
      });
      
      console.log(`\n   Summary: ${leftAnswers} left-leaning, ${rightAnswers} right-leaning answers`);
      console.log('\n💡 To reach ER (Right), this persona needs:');
      console.log('   - Stronger free market positions (currently 0.7)');
      console.log('   - More anti-redistribution (currently 0.3)');
      console.log('   - Stronger pro-privatization (currently 0.7)');
    }
    
    // Suggest adjusted beliefs
    console.log('\n🔧 Suggested Belief Adjustments:');
    const adjusted = JSON.parse(JSON.stringify(persona.beliefs.economic));
    
    if (persona.name.includes('Tito')) {
      adjusted.redistribution = 0.95;  // More extreme
      adjusted.freeTaxes = 0.05;       // More extreme
      adjusted.freeMarket = 0.05;      // More anti-market
      adjusted.regulation = 0.95;      // More pro-regulation
      adjusted.privatization = 0.0;    // Complete opposition
      adjusted.welfare = 0.05;         // Fix welfare direction
    } else if (persona.name.includes('Burke')) {
      adjusted.redistribution = 0.1;   // Less redistribution
      adjusted.freeTaxes = 0.9;        // More pro-tax cuts
      adjusted.freeMarket = 0.85;      // More pro-market
      adjusted.regulation = 0.2;       // Less regulation
      adjusted.healthcare = 0.1;       // More private
      adjusted.welfare = 0.8;          // More welfare skepticism
      adjusted.privatization = 0.9;    // More privatization
    }
    
    console.log('   Current:', JSON.stringify(persona.beliefs.economic, null, 2));
    console.log('   Suggested:', JSON.stringify(adjusted, null, 2));
    
    // Test with adjusted beliefs
    const adjustedPersona = { beliefs: { economic: adjusted } };
    const adjustedAnswers = [];
    questions.forEach(q => {
      if (q.axis === 'economic') {
        adjustedAnswers.push(personaAnswer(adjustedPersona, q));
      } else {
        adjustedAnswers.push(0.5); // Neutral for other axes
      }
    });
    
    const adjustedScores = calculateScores(adjustedAnswers, questions);
    console.log('\n📈 Projected scores with adjustments:');
    console.log(`   Economic: ${adjustedScores.economic.toFixed(1)} ${adjustedScores.economic < -33 ? '✅ LEFT' : adjustedScores.economic > 33 ? '✅ RIGHT' : '❌ STILL CENTER'}`);
  }
}

// Run diagnostic
diagnoseFailures().catch(console.error);