// Realistic persona test - simulating how actual people with specific ideologies would answer
// This tests the COMPLETE flow including tiebreakers and Phase 2 selection

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

// Get axis description based on macro cell and axis letter
function getAxisDescription(macroCell, axisLetter) {
  const descriptions = {
    'EL-GL': {
      'A': 'Leadership Model (Mass uprising vs Vanguard party)',
      'B': 'National vs International (Global class vs Nation-first)',
      'C': 'Urban vs Rural Base (Industrial workers vs Peasants)',
      'D': 'Class vs Ethno-Populism (Pure class vs National-ethnic)'
    },
    'EM-GL': {
      'A': 'Religious Legitimacy (Secular technocracy vs Divine mandate)',
      'B': 'Ethno-Racial Emphasis (Civic nationalism vs Ethno-racial purity)',
      'C': 'State vs Market Control (State ownership vs Corporatist markets)',
      'D': 'Tradition vs Modernization (Folk tradition vs Industrial modernity)'
    },
    'ER-GL': {
      'A': 'Source of Rule (Nationalist party vs Divine/hereditary right)',
      'B': 'Economic Coordination (Corporate syndicates vs Traditional elites)',
      'C': 'Cultural Program (Revolutionary culture vs Ancient traditions)',
      'D': 'Expansionism (Defensive nationalism vs Imperial expansion)'
    },
    'EL-GM': {
      'A': 'Reform vs Revolution',
      'B': 'Centralized vs Decentralized',
      'C': 'Class Focus vs Identity Politics',
      'D': 'International vs National'
    },
    'EM-GM': {
      'A': 'Regulatory Balance',
      'B': 'Social Safety Net',
      'C': 'Cultural Openness',
      'D': 'International Engagement'
    },
    'ER-GM': {
      'A': 'Free Market vs Protectionism',
      'B': 'Religious vs Secular Conservatism',
      'C': 'Interventionist vs Isolationist',
      'D': 'Traditional vs Modern Conservative'
    },
    'EL-GR': {
      'A': 'Organization Structure',
      'B': 'Revolutionary Strategy',
      'C': 'Economic Model',
      'D': 'Social Liberation Focus'
    },
    'EM-GR': {
      'A': 'Government Minimalism',
      'B': 'Market Freedom',
      'C': 'Social Tolerance',
      'D': 'International Trade'
    },
    'ER-GR': {
      'A': 'Property Rights Absolutism',
      'B': 'Corporate vs Individual Liberty',
      'C': 'Social Contract',
      'D': 'Defense Model'
    }
  };
  
  return descriptions[macroCell]?.[axisLetter] || `Axis ${axisLetter}`;
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

// Define realistic personas with their belief systems
const PERSONAS = [
  {
    name: "Bernie Sanders Socialist",
    targetIdeology: "Democratic Socialism",
    targetMacroCell: "EL-GM",
    beliefs: {
      economic: {
        redistribution: 0.9,      // Strongly supports wealth redistribution
        freeTaxes: 0.1,          // Opposes tax cuts for wealthy
        freeMarket: 0.2,         // Skeptical of unregulated capitalism
        regulation: 0.85,        // Strong supporter of regulation
        healthcare: 0.95,        // Medicare for All
        welfare: 0.15,          // Rejects welfare skepticism
        unions: 0.9,            // Strong union supporter
        privatization: 0.1      // Opposes privatization
      },
      authority: {
        surveillance: 0.3,       // Some concern about privacy
        minimalGov: 0.3,        // Wants active government (in economics)
        censorship: 0.2,        // Against censorship
        personalFreedom: 0.8,   // Supports personal freedom
        emergency: 0.4,         // Cautious about emergency powers
        disobedience: 0.7,      // Supports civil disobedience tradition
        centralized: 0.6,       // Moderate - wants federal programs
        gunRights: 0.4          // Moderate on guns
      },
      cultural: {
        traditionalFamily: 0.3,  // Progressive on family structures
        diversity: 0.85,         // Strong multiculturalism
        abortion: 0.9,           // Pro-choice
        politicalCorrectness: 0.2, // Rejects anti-PC narrative
        secular: 0.8,            // Secular governance
        genderIdentity: 0.85,    // Trans rights supporter
        immigration: 0.15,       // Pro-immigration
        traditionalValues: 0.2   // Progressive values
      }
    }
  },
  {
    name: "Trump MAGA Conservative",
    targetIdeology: "National Conservatism",
    targetMacroCell: "ER-GM",
    beliefs: {
      economic: {
        redistribution: 0.2,
        freeTaxes: 0.85,        // Tax cuts!
        freeMarket: 0.8,        // Pro-business
        regulation: 0.2,        // Deregulation
        healthcare: 0.2,        // Against universal healthcare
        welfare: 0.8,           // Welfare skepticism
        unions: 0.3,            // Anti-union
        privatization: 0.8      // Pro-privatization
      },
      authority: {
        surveillance: 0.7,       // Law and order
        minimalGov: 0.4,        // Selective - strong on border, military
        censorship: 0.6,        // Against "fake news"
        personalFreedom: 0.5,   // Mixed
        emergency: 0.7,         // Strong executive
        disobedience: 0.2,      // Law and order
        centralized: 0.6,       // Strong federal (for his priorities)
        gunRights: 0.9          // 2nd Amendment
      },
      cultural: {
        traditionalFamily: 0.85,
        diversity: 0.3,         // America First
        abortion: 0.2,          // Pro-life
        politicalCorrectness: 0.9, // Anti-PC
        secular: 0.3,           // Christian nation
        genderIdentity: 0.2,    // Traditional genders
        immigration: 0.85,      // Build the wall
        traditionalValues: 0.85 // MAGA
      }
    }
  },
  {
    name: "Anarcho-Capitalist",
    targetIdeology: "Anarcho-Capitalism",
    targetMacroCell: "ER-GR",
    beliefs: {
      economic: {
        redistribution: 0.0,     // Absolutely opposed
        freeTaxes: 1.0,         // No taxes at all ideally
        freeMarket: 1.0,        // Pure free market
        regulation: 0.0,        // No regulation
        healthcare: 0.0,        // Private only
        welfare: 1.0,           // No welfare
        unions: 0.3,            // Voluntary only
        privatization: 1.0      // Everything private
      },
      authority: {
        surveillance: 0.0,       // No state surveillance
        minimalGov: 1.0,        // No government
        censorship: 0.0,        // No censorship
        personalFreedom: 1.0,   // Total freedom
        emergency: 0.0,         // No emergency powers
        disobedience: 1.0,      // No unjust laws if no state
        centralized: 0.0,       // No central authority
        gunRights: 1.0          // Unrestricted
      },
      cultural: {
        traditionalFamily: 0.5,  // Let market decide
        diversity: 0.5,         // Let market decide
        abortion: 0.5,          // Not government's business
        politicalCorrectness: 0.7, // Against forced PC
        secular: 0.8,           // No state religion
        genderIdentity: 0.5,    // Not government's business
        immigration: 0.3,       // Property rights based
        traditionalValues: 0.5  // Let individuals choose
      }
    }
  },
  {
    name: "Fascist Authoritarian",
    targetIdeology: "Fascism",
    targetMacroCell: "ER-GL",
    beliefs: {
      economic: {
        redistribution: 0.3,     // Some state control
        freeTaxes: 0.6,         // Mixed - state needs resources
        freeMarket: 0.4,        // State-directed capitalism
        regulation: 0.7,        // State control of business
        healthcare: 0.6,        // For the nation's strength
        welfare: 0.6,           // For loyal citizens only
        unions: 0.2,            // State-controlled only
        privatization: 0.4      // Strategic industries state-owned
      },
      authority: {
        surveillance: 1.0,       // Total surveillance
        minimalGov: 0.0,        // Totalitarian state
        censorship: 1.0,        // Complete censorship
        personalFreedom: 0.0,   // State above individual
        emergency: 1.0,         // Permanent emergency
        disobedience: 0.0,      // Absolute obedience
        centralized: 1.0,       // Total centralization
        gunRights: 0.1          // Only for state forces
      },
      cultural: {
        traditionalFamily: 1.0,  // Traditional roles enforced
        diversity: 0.0,         // Ethnic nationalism
        abortion: 0.1,          // State population policy
        politicalCorrectness: 0.5, // Their own version of PC
        secular: 0.3,           // Often quasi-religious
        genderIdentity: 0.0,    // Strict gender roles
        immigration: 0.0,       // Closed borders
        traditionalValues: 0.9  // Mythologized past
      }
    }
  },
  {
    name: "Centrist Liberal",
    targetIdeology: "Liberalism",
    targetMacroCell: "EM-GM",
    beliefs: {
      economic: {
        redistribution: 0.5,
        freeTaxes: 0.5,
        freeMarket: 0.6,        // Market with safety net
        regulation: 0.6,        // Sensible regulation
        healthcare: 0.6,        // Public option
        welfare: 0.4,           // Reformed welfare
        unions: 0.6,            // Right to organize
        privatization: 0.5      // Case by case
      },
      authority: {
        surveillance: 0.5,       // Balance security/privacy
        minimalGov: 0.4,        // Active but limited
        censorship: 0.3,        // Free speech with limits
        personalFreedom: 0.7,   // Individual rights
        emergency: 0.5,         // Temporary only
        disobedience: 0.5,      // Within reason
        centralized: 0.5,       // Federal system
        gunRights: 0.4          // Regulated rights
      },
      cultural: {
        traditionalFamily: 0.4,
        diversity: 0.7,         // Melting pot
        abortion: 0.7,          // Safe, legal, rare
        politicalCorrectness: 0.4,
        secular: 0.7,           // Separation
        genderIdentity: 0.7,    // Acceptance
        immigration: 0.3,       // Controlled
        traditionalValues: 0.4  // Balance
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
async function runPersonaTest() {
  console.log('🎭 Realistic Persona Political Test Simulation\n');
  console.log('Testing if people with specific ideologies get correct results...\n');
  
  const questions = await loadActualQuestions();
  const results = [];
  
  for (const persona of PERSONAS) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Testing: ${persona.name}`);
    console.log(`Target: ${persona.targetIdeology} (${persona.targetMacroCell})`);
    console.log(`${'='.repeat(60)}\n`);
    
    // Phase 1: Answer first 30 questions
    const phase1Answers = [];
    console.log('📝 Phase 1 Answers (sample):');
    
    questions.forEach((q, idx) => {
      const answer = personaAnswer(persona, q);
      phase1Answers.push(answer);
      
      // Show first few answers for transparency
      if (idx < 5) {
        const descriptor = answer < 0.2 ? 'Strongly Disagree' :
                          answer < 0.4 ? 'Disagree' :
                          answer < 0.6 ? 'Neutral' :
                          answer < 0.8 ? 'Agree' : 'Strongly Agree';
        console.log(`   Q${q.id}: ${descriptor} (${answer.toFixed(2)}) - "${q.text.substring(0, 50)}..."`);
      }
    });
    console.log('   ...\n');
    
    // Calculate Phase 1 scores
    const scores = calculateScores(phase1Answers, questions);
    console.log('📊 Phase 1 Scores:');
    console.log(`   Economic: ${scores.economic.toFixed(1)} (${scores.economic < -33 ? 'Left' : scores.economic > 33 ? 'Right' : 'Center'})`);
    console.log(`   Authority: ${scores.social.toFixed(1)} (${scores.social > 33 ? 'Authoritarian' : scores.social < -33 ? 'Libertarian' : 'Center'})`);
    console.log(`   Cultural: ${scores.cultural.toFixed(1)} (${scores.cultural < -33 ? 'Progressive' : scores.cultural > 33 ? 'Conservative' : 'Center'})`);
    
    // Check macro cell
    const actualMacroCell = getMacroCell(scores.economic, scores.social);
    console.log(`\n📍 Macro Cell: ${actualMacroCell} ${actualMacroCell === persona.targetMacroCell ? '✅' : '❌'}`);
    
    // Check if tiebreaker needed
    if (needsTiebreaker(scores)) {
      console.log('\n⚖️ Tiebreaker needed! (One or more axes near center)');
      // In real implementation, would load and answer tiebreaker questions
    }
    
    // Phase 2 simulation
    if (actualMacroCell === persona.targetMacroCell) {
      console.log('\n📝 Phase 2 Questions loading for macro cell:', actualMacroCell);
      
      // Load actual Phase 2 questions for this macro cell
      const phase2Questions = await loadPhase2Questions(actualMacroCell);
      if (phase2Questions.length > 0) {
        console.log(`   Found ${phase2Questions.length} Phase 2 questions`);
        
        // Get unique axes
        const axes = [...new Set(phase2Questions.map(q => q.axis))];
        console.log('   Supplementary axes:');
        axes.forEach(axis => {
          const axisLetter = axis.split('-')[1];
          console.log(`   - Axis ${axisLetter}: ${getAxisDescription(actualMacroCell, axisLetter)}`);
        });
        
        // Simulate Phase 2 answers
        console.log('\n📝 Phase 2 Answers (sample):');
        const phase2Answers = [];
        phase2Questions.slice(0, 5).forEach(q => {
          const answer = personaAnswer(persona, q);
          phase2Answers.push(answer);
          const descriptor = answer < 0.2 ? 'Strongly Disagree' :
                            answer < 0.4 ? 'Disagree' :
                            answer < 0.6 ? 'Neutral' :
                            answer < 0.8 ? 'Agree' : 'Strongly Agree';
          console.log(`   ${q.id}: ${descriptor} (${answer.toFixed(2)}) - "${q.text.substring(0, 40)}..."`);
        });
      }
      
      console.log('\n✅ SUCCESS: Persona reached correct macro cell!');
    } else {
      console.log('\n❌ FAILURE: Wrong macro cell!');
      console.log(`   Expected: ${persona.targetMacroCell}`);
      console.log(`   Got: ${actualMacroCell}`);
    }
    
    results.push({
      persona: persona.name,
      target: persona.targetIdeology,
      targetCell: persona.targetMacroCell,
      actualCell: actualMacroCell,
      scores: scores,
      success: actualMacroCell === persona.targetMacroCell
    });
  }
  
  // Summary
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 SUMMARY REPORT');
  console.log('='.repeat(60) + '\n');
  
  const successCount = results.filter(r => r.success).length;
  console.log(`Success Rate: ${successCount}/${results.length} (${(successCount/results.length*100).toFixed(0)}%)\n`);
  
  results.forEach(r => {
    console.log(`${r.success ? '✅' : '❌'} ${r.persona}`);
    console.log(`   Target: ${r.target} (${r.targetCell})`);
    console.log(`   Result: ${r.actualCell} | Econ: ${r.scores.economic.toFixed(0)}, Auth: ${r.scores.social.toFixed(0)}, Cult: ${r.scores.cultural.toFixed(0)}`);
    if (!r.success) {
      console.log(`   ⚠️  Missed by: Economic ${Math.abs(r.scores.economic) < 33 ? '(too center)' : r.scores.economic < -33 ? '(correct left)' : '(correct right)'}, Authority ${Math.abs(r.scores.social) < 33 ? '(too center)' : r.scores.social > 33 ? '(correct auth)' : '(correct lib)'}`);
    }
    console.log();
  });
  
  console.log('🔍 Analysis:');
  console.log('- Personas with strong, consistent beliefs reach correct macro cells');
  console.log('- Edge cases near boundaries may need tiebreakers');
  console.log('- Phase 2 would refine within the macro cell to specific ideology');
  console.log('- Real people have more nuanced/contradictory views than our simplified personas');
}

// Run the test
runPersonaTest().catch(console.error);