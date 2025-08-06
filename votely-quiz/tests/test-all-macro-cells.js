// Test all 9 macro cells with realistic personas
// This ensures complete coverage of the political compass

const fs = require('fs');

// Load Phase 2 questions for a specific macro cell
async function loadPhase2Questions(macroCell) {
  const tsvContent = fs.readFileSync('./public/political_quiz_final.tsv', 'utf-8');
  const lines = tsvContent.split('\n');
  const headers = lines[0].split('\t');
  
  const phase2Questions = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = line.split('\t');
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });
    
    // Get Phase 2 questions for this macro cell
    if (row.phase === '2' && row.macro_cell === macroCell) {
      phase2Questions.push({
        id: row.id,
        text: row.text,
        axis: row.axis,
        agreeDir: parseInt(row.agree_dir)
      });
    }
  }
  
  return phase2Questions;
}

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

// Define personas for all 9 macro cells
const ALL_PERSONAS = [
  // TOP ROW - AUTHORITARIAN
  {
    name: "Stalin (Communist Dictator)",
    targetIdeology: "Stalinism",
    targetMacroCell: "EL-GL",
    beliefs: {
      economic: {
        redistribution: 1.0,     // Total redistribution
        freeTaxes: 0.0,         // No tax cuts
        freeMarket: 0.0,        // No free market
        regulation: 1.0,        // Total state control
        healthcare: 1.0,        // State provided
        welfare: 0.0,           // No welfare skepticism
        unions: 0.3,            // State-controlled unions only
        privatization: 0.0      // No privatization
      },
      authority: {
        surveillance: 1.0,       // Total surveillance
        minimalGov: 0.0,        // Maximum state
        censorship: 1.0,        // Total censorship
        personalFreedom: 0.0,   // No personal freedom
        emergency: 1.0,         // Permanent emergency
        disobedience: 0.0,      // No disobedience
        centralized: 1.0,       // Total centralization
        gunRights: 0.0          // No gun rights
      },
      cultural: {
        traditionalFamily: 0.5,  // Mixed
        diversity: 0.2,         // Soviet nationalism
        abortion: 0.5,          // State decides
        politicalCorrectness: 0.8, // Party line
        secular: 0.9,           // Anti-religious
        genderIdentity: 0.2,    // Traditional
        immigration: 0.3,       // Controlled
        traditionalValues: 0.3  // Revolutionary values
      }
    }
  },
  {
    name: "Xi Jinping (Authoritarian Centrist)",
    targetIdeology: "State Capitalism",
    targetMacroCell: "EM-GL",
    beliefs: {
      economic: {
        redistribution: 0.6,     // Some redistribution
        freeTaxes: 0.4,         // Strategic taxes
        freeMarket: 0.5,        // Controlled markets
        regulation: 0.8,        // Heavy regulation
        healthcare: 0.7,        // State healthcare
        welfare: 0.3,           // Limited welfare
        unions: 0.1,            // No independent unions
        privatization: 0.5      // Mixed ownership
      },
      authority: {
        surveillance: 1.0,       // Total surveillance
        minimalGov: 0.0,        // Maximum state
        censorship: 1.0,        // Great firewall
        personalFreedom: 0.1,   // Very limited
        emergency: 0.9,         // Ready for emergency
        disobedience: 0.0,      // No disobedience
        centralized: 1.0,       // Party control
        gunRights: 0.0          // No gun rights
      },
      cultural: {
        traditionalFamily: 0.7,  // Traditional values
        diversity: 0.2,         // Han nationalism
        abortion: 0.3,          // One-child legacy
        politicalCorrectness: 0.7, // Party correctness
        secular: 0.8,           // Atheist state
        genderIdentity: 0.1,    // Traditional only
        immigration: 0.1,       // Very restricted
        traditionalValues: 0.7  // Confucian values
      }
    }
  },
  {
    name: "Mussolini (Fascist)",
    targetIdeology: "Fascism",
    targetMacroCell: "ER-GL",
    beliefs: {
      economic: {
        redistribution: 0.2,     // Limited redistribution
        freeTaxes: 0.7,         // Pro-business taxes
        freeMarket: 0.6,        // Corporatist capitalism
        regulation: 0.3,        // Light on business
        healthcare: 0.4,        // Limited state role
        welfare: 0.7,           // Skeptical of welfare
        unions: 0.1,            // State unions only
        privatization: 0.8      // Mostly private
      },
      authority: {
        surveillance: 0.9,       // Heavy surveillance
        minimalGov: 0.0,        // Totalitarian
        censorship: 0.9,        // Heavy censorship
        personalFreedom: 0.1,   // Very limited
        emergency: 1.0,         // Permanent emergency
        disobedience: 0.0,      // No disobedience
        centralized: 1.0,       // Total control
        gunRights: 0.2          // Military only
      },
      cultural: {
        traditionalFamily: 0.9,  // Traditional enforced
        diversity: 0.0,         // Ethnic nationalism
        abortion: 0.2,          // Restricted
        politicalCorrectness: 0.3, // Their own PC
        secular: 0.2,           // Church alliance
        genderIdentity: 0.0,    // Traditional only
        immigration: 0.0,       // Closed borders
        traditionalValues: 0.9  // Roman glory
      }
    }
  },
  
  // MIDDLE ROW - MODERATE
  {
    name: "Bernie Sanders (Democratic Socialist)",
    targetIdeology: "Democratic Socialism",
    targetMacroCell: "EL-GM",
    beliefs: {
      economic: {
        redistribution: 0.9,     // Strong redistribution
        freeTaxes: 0.1,         // Tax the rich
        freeMarket: 0.2,        // Skeptical of markets
        regulation: 0.85,       // Strong regulation
        healthcare: 0.95,       // Medicare for all
        welfare: 0.15,         // Pro-welfare
        unions: 0.9,           // Strong unions
        privatization: 0.1     // Public services
      },
      authority: {
        surveillance: 0.3,       // Privacy concerns
        minimalGov: 0.4,        // Active but limited
        censorship: 0.2,        // Free speech
        personalFreedom: 0.8,   // Personal liberty
        emergency: 0.4,         // Cautious
        disobedience: 0.7,      // Civil rights tradition
        centralized: 0.5,       // Federal programs
        gunRights: 0.4          // Some restrictions
      },
      cultural: {
        traditionalFamily: 0.3,  // Progressive
        diversity: 0.85,        // Multicultural
        abortion: 0.9,          // Pro-choice
        politicalCorrectness: 0.2, // Anti-anti-PC
        secular: 0.8,           // Secular state
        genderIdentity: 0.85,   // Trans rights
        immigration: 0.15,      // Pro-immigration
        traditionalValues: 0.2  // Progressive
      }
    }
  },
  {
    name: "Joe Biden (Liberal Centrist)",
    targetIdeology: "Liberalism",
    targetMacroCell: "EM-GM",
    beliefs: {
      economic: {
        redistribution: 0.5,
        freeTaxes: 0.5,
        freeMarket: 0.6,
        regulation: 0.6,
        healthcare: 0.6,
        welfare: 0.4,
        unions: 0.6,
        privatization: 0.5
      },
      authority: {
        surveillance: 0.5,
        minimalGov: 0.4,
        censorship: 0.3,
        personalFreedom: 0.7,
        emergency: 0.5,
        disobedience: 0.5,
        centralized: 0.5,
        gunRights: 0.4
      },
      cultural: {
        traditionalFamily: 0.4,
        diversity: 0.7,
        abortion: 0.7,
        politicalCorrectness: 0.4,
        secular: 0.7,
        genderIdentity: 0.7,
        immigration: 0.3,
        traditionalValues: 0.4
      }
    }
  },
  {
    name: "Mitt Romney (Moderate Conservative)",
    targetIdeology: "Liberal Conservatism",
    targetMacroCell: "ER-GM",
    beliefs: {
      economic: {
        redistribution: 0.2,
        freeTaxes: 0.8,
        freeMarket: 0.85,
        regulation: 0.2,
        healthcare: 0.3,
        welfare: 0.7,
        unions: 0.3,
        privatization: 0.8
      },
      authority: {
        surveillance: 0.6,
        minimalGov: 0.3,
        censorship: 0.4,
        personalFreedom: 0.6,
        emergency: 0.6,
        disobedience: 0.3,
        centralized: 0.6,
        gunRights: 0.7
      },
      cultural: {
        traditionalFamily: 0.8,
        diversity: 0.4,
        abortion: 0.3,
        politicalCorrectness: 0.7,
        secular: 0.4,
        genderIdentity: 0.3,
        immigration: 0.7,
        traditionalValues: 0.7
      }
    }
  },
  
  // BOTTOM ROW - LIBERTARIAN
  {
    name: "Noam Chomsky (Libertarian Socialist)",
    targetIdeology: "Anarcho-Syndicalism",
    targetMacroCell: "EL-GR",
    beliefs: {
      economic: {
        redistribution: 0.8,     // Worker control
        freeTaxes: 0.2,         // Tax the wealthy
        freeMarket: 0.1,        // Anti-capitalist
        regulation: 0.8,        // Worker regulation
        healthcare: 0.9,        // Universal
        welfare: 0.1,           // Mutual aid
        unions: 1.0,            // Syndicalism
        privatization: 0.0      // Worker ownership
      },
      authority: {
        surveillance: 0.0,       // No surveillance
        minimalGov: 0.9,        // Minimal state
        censorship: 0.0,        // Free speech absolute
        personalFreedom: 1.0,   // Maximum freedom
        emergency: 0.0,         // No emergency powers
        disobedience: 1.0,      // Direct action
        centralized: 0.0,       // Decentralized
        gunRights: 0.7          // Armed workers
      },
      cultural: {
        traditionalFamily: 0.2,  // Free association
        diversity: 0.9,         // Internationalist
        abortion: 0.9,          // Body autonomy
        politicalCorrectness: 0.3, // Free speech
        secular: 0.8,           // No state religion
        genderIdentity: 0.9,    // Full acceptance
        immigration: 0.1,       // No borders
        traditionalValues: 0.1  // Revolutionary
      }
    }
  },
  {
    name: "Gary Johnson (Classical Liberal)",
    targetIdeology: "Classical Liberalism",
    targetMacroCell: "EM-GR",
    beliefs: {
      economic: {
        redistribution: 0.3,
        freeTaxes: 0.7,
        freeMarket: 0.8,
        regulation: 0.3,
        healthcare: 0.3,
        welfare: 0.6,
        unions: 0.5,
        privatization: 0.7
      },
      authority: {
        surveillance: 0.2,
        minimalGov: 0.8,
        censorship: 0.1,
        personalFreedom: 0.9,
        emergency: 0.2,
        disobedience: 0.8,
        centralized: 0.2,
        gunRights: 0.9
      },
      cultural: {
        traditionalFamily: 0.4,
        diversity: 0.6,
        abortion: 0.7,
        politicalCorrectness: 0.2,
        secular: 0.8,
        genderIdentity: 0.6,
        immigration: 0.3,
        traditionalValues: 0.3
      }
    }
  },
  {
    name: "Murray Rothbard (Anarcho-Capitalist)",
    targetIdeology: "Anarcho-Capitalism",
    targetMacroCell: "ER-GR",
    beliefs: {
      economic: {
        redistribution: 0.0,
        freeTaxes: 1.0,
        freeMarket: 1.0,
        regulation: 0.0,
        healthcare: 0.0,
        welfare: 1.0,
        unions: 0.3,
        privatization: 1.0
      },
      authority: {
        surveillance: 0.0,
        minimalGov: 1.0,
        censorship: 0.0,
        personalFreedom: 1.0,
        emergency: 0.0,
        disobedience: 1.0,
        centralized: 0.0,
        gunRights: 1.0
      },
      cultural: {
        traditionalFamily: 0.5,
        diversity: 0.5,
        abortion: 0.5,
        politicalCorrectness: 0.7,
        secular: 0.8,
        genderIdentity: 0.5,
        immigration: 0.3,
        traditionalValues: 0.5
      }
    }
  }
];

// Simulate how a persona would answer a question based on their beliefs
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
  } else if (question.axis === 'authority') {
    if (text.includes('surveillance')) {
      baseAnswer = persona.beliefs.authority.surveillance;
    } else if (text.includes('little involvement') || text.includes('minimal')) {
      baseAnswer = persona.beliefs.authority.minimalGov;
    } else if (text.includes('censor')) {
      baseAnswer = persona.beliefs.authority.censorship;
    } else if (text.includes('lifestyle choice') || text.includes('personal')) {
      baseAnswer = persona.beliefs.authority.personalFreedom;
    } else if (text.includes('emergency')) {
      baseAnswer = persona.beliefs.authority.emergency;
    } else if (text.includes('disobey')) {
      baseAnswer = persona.beliefs.authority.disobedience;
    } else if (text.includes('centralized') || text.includes('strong')) {
      baseAnswer = persona.beliefs.authority.centralized;
    } else if (text.includes('firearm') || text.includes('gun')) {
      baseAnswer = persona.beliefs.authority.gunRights;
    } else if (text.includes('military') || text.includes('service')) {
      baseAnswer = persona.beliefs.authority.centralized;
    } else if (text.includes('local') && text.includes('communit')) {
      baseAnswer = 1 - persona.beliefs.authority.centralized;
    }
  } else if (question.axis === 'cultural') {
    if (text.includes('married mother and father')) {
      baseAnswer = persona.beliefs.cultural.traditionalFamily;
    } else if (text.includes('diverse') || text.includes('multicultural')) {
      baseAnswer = persona.beliefs.cultural.diversity;
    } else if (text.includes('abortion')) {
      baseAnswer = persona.beliefs.cultural.abortion;
    } else if (text.includes('political correctness')) {
      baseAnswer = persona.beliefs.cultural.politicalCorrectness;
    } else if (text.includes('secular') || text.includes('religion')) {
      baseAnswer = persona.beliefs.cultural.secular;
    } else if (text.includes('gender identit')) {
      baseAnswer = persona.beliefs.cultural.genderIdentity;
    } else if (text.includes('immigration')) {
      baseAnswer = persona.beliefs.cultural.immigration;
    } else if (text.includes('traditional values')) {
      baseAnswer = persona.beliefs.cultural.traditionalValues;
    } else if (text.includes('permissive') || text.includes('moral')) {
      baseAnswer = persona.beliefs.cultural.traditionalValues;
    } else if (text.includes('historical injustice')) {
      baseAnswer = 1 - persona.beliefs.cultural.traditionalValues;
    }
  }
  
  // Add some realistic variation (people aren't 100% consistent)
  const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
  baseAnswer = Math.max(0, Math.min(1, baseAnswer + variation));
  
  return baseAnswer;
}

// Calculate scores (same as real implementation)
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

// Determine macro cell
function getMacroCell(economic, social) {
  const econ = economic < -33 ? 'EL' : economic > 33 ? 'ER' : 'EM';
  const auth = social > 33 ? 'GL' : social < -33 ? 'GR' : 'GM';
  return `${econ}-${auth}`;
}

// Check if tiebreaker is needed
function needsTiebreaker(scores) {
  return Math.abs(scores.economic) <= 15 || 
         Math.abs(scores.social) <= 15 || 
         Math.abs(scores.cultural) <= 15;
}

// Main test
async function runAllMacroCellTest() {
  console.log('🎯 Testing All 9 Macro Cells with Realistic Personas\n');
  console.log('This ensures complete coverage of the political compass\n');
  
  const questions = await loadActualQuestions();
  const results = [];
  
  // Group by macro cell for organized output
  const macroCellGroups = {
    'Authoritarian Row': ['EL-GL', 'EM-GL', 'ER-GL'],
    'Moderate Row': ['EL-GM', 'EM-GM', 'ER-GM'],
    'Libertarian Row': ['EL-GR', 'EM-GR', 'ER-GR']
  };
  
  for (const [groupName, cells] of Object.entries(macroCellGroups)) {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`${groupName.toUpperCase()}`);
    console.log(`${'═'.repeat(60)}`);
    
    for (const targetCell of cells) {
      const persona = ALL_PERSONAS.find(p => p.targetMacroCell === targetCell);
      if (!persona) continue;
      
      console.log(`\n📍 Testing: ${persona.name}`);
      console.log(`   Target: ${persona.targetIdeology} (${persona.targetMacroCell})`);
      
      // Phase 1: Answer questions
      const phase1Answers = [];
      questions.forEach((q) => {
        const answer = personaAnswer(persona, q);
        phase1Answers.push(answer);
      });
      
      // Calculate Phase 1 scores
      const scores = calculateScores(phase1Answers, questions);
      console.log(`   Scores: Econ=${scores.economic.toFixed(1)}, Auth=${scores.social.toFixed(1)}, Cult=${scores.cultural.toFixed(1)}`);
      
      // Check macro cell
      const actualMacroCell = getMacroCell(scores.economic, scores.social);
      const success = actualMacroCell === persona.targetMacroCell;
      console.log(`   Result: ${actualMacroCell} ${success ? '✅' : '❌'}`);
      
      if (!success) {
        console.log(`   ⚠️  Expected ${persona.targetMacroCell} but got ${actualMacroCell}`);
        
        // Analyze why it failed
        const [expectedEcon, expectedAuth] = persona.targetMacroCell.split('-');
        const [actualEcon, actualAuth] = actualMacroCell.split('-');
        
        if (expectedEcon !== actualEcon) {
          console.log(`   ⚠️  Economic axis: Expected ${expectedEcon} but score ${scores.economic.toFixed(1)} maps to ${actualEcon}`);
        }
        if (expectedAuth !== actualAuth) {
          console.log(`   ⚠️  Authority axis: Expected ${expectedAuth} but score ${scores.social.toFixed(1)} maps to ${actualAuth}`);
        }
      }
      
      results.push({
        persona: persona.name,
        target: persona.targetIdeology,
        targetCell: persona.targetMacroCell,
        actualCell: actualMacroCell,
        scores: scores,
        success: success
      });
    }
  }
  
  // Summary
  console.log('\n\n' + '═'.repeat(60));
  console.log('📊 COMPLETE MACRO CELL COVERAGE REPORT');
  console.log('═'.repeat(60) + '\n');
  
  const successCount = results.filter(r => r.success).length;
  console.log(`Overall Success Rate: ${successCount}/${results.length} (${(successCount/results.length*100).toFixed(0)}%)\n`);
  
  // Show grid
  console.log('Political Compass Grid Results:\n');
  console.log('              LEFT (-100)    CENTER (0)     RIGHT (+100)');
  console.log('              ─────────────────────────────────────────');
  
  const rows = [
    { name: 'AUTH (+100)', cells: ['EL-GL', 'EM-GL', 'ER-GL'] },
    { name: 'CENTER (0) ', cells: ['EL-GM', 'EM-GM', 'ER-GM'] },
    { name: 'LIB (-100) ', cells: ['EL-GR', 'EM-GR', 'ER-GR'] }
  ];
  
  rows.forEach(row => {
    console.log(`${row.name} │`, row.cells.map(cell => {
      const result = results.find(r => r.targetCell === cell);
      if (!result) return '     ?     ';
      return result.success ? `    ✅     ` : `    ❌     `;
    }).join('│'));
  });
  
  console.log('\nFailed Personas:');
  results.filter(r => !r.success).forEach(r => {
    console.log(`- ${r.persona}: Expected ${r.targetCell}, got ${r.actualCell}`);
  });
}

// Run the test
runAllMacroCellTest().catch(console.error);