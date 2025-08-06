// Comprehensive test of all 81 ideologies with tiebreaker detection
// Tests if quiz can identify all ideologies and when tiebreakers are needed

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
  }
  
  phase1Questions.sort((a, b) => a.id - b.id);
  return phase1Questions;
}

// Load tiebreaker questions
async function loadTiebreakerQuestions() {
  const tsvContent = fs.readFileSync('./public/political_quiz_final.tsv', 'utf-8');
  const lines = tsvContent.split('\n');
  const headers = lines[0].split('\t');
  
  const tiebreakerQuestions = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = line.split('\t');
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });
    
    if (row.phase === '1' && row.q_type === 'tiebreaker') {
      let axis = row.axis;
      if (axis === 'econ') axis = 'economic';
      if (axis === 'auth') axis = 'authority';
      if (axis === 'soc') axis = 'cultural';
      
      tiebreakerQuestions.push({
        id: row.id,
        text: row.text,
        axis: axis,
        agreeDir: parseInt(row.agree_dir)
      });
    }
  }
  
  return tiebreakerQuestions;
}

// All 81 ideologies organized by macro cell
const ALL_81_IDEOLOGIES = {
  'EL-GL': [
    { name: "Stalin", ideology: "Stalinism", economic: 1.0, authority: 1.0, cultural: 0.4 },
    { name: "Mao", ideology: "Maoism", economic: 0.95, authority: 0.95, cultural: 0.3 },
    { name: "Tito", ideology: "Market Socialism", economic: 0.9, authority: 0.8, cultural: 0.5 },
    { name: "Hoxha", ideology: "Hoxhaism", economic: 1.0, authority: 1.0, cultural: 0.6 },
    { name: "Lenin", ideology: "Bolshevik Marxism", economic: 0.95, authority: 0.9, cultural: 0.3 },
    { name: "Trotsky", ideology: "Trotskyism", economic: 0.9, authority: 0.85, cultural: 0.2 },
    { name: "Kim Il-sung", ideology: "Juche", economic: 1.0, authority: 1.0, cultural: 0.8 },
    { name: "Council Communist", ideology: "Council Communism", economic: 0.85, authority: 0.7, cultural: 0.2 },
    { name: "Luxemburg", ideology: "Left Communism", economic: 0.9, authority: 0.75, cultural: 0.15 }
  ],
  'EM-GL': [
    { name: "Lee Kuan Yew", ideology: "Authoritarian Capitalism", economic: 0.55, authority: 0.9, cultural: 0.7 },
    { name: "Putin", ideology: "Managed Democracy", economic: 0.5, authority: 0.95, cultural: 0.8 },
    { name: "Xi Jinping", ideology: "State Capitalism", economic: 0.45, authority: 0.95, cultural: 0.6 },
    { name: "Perón", ideology: "Peronism", economic: 0.6, authority: 0.8, cultural: 0.65 },
    { name: "Atatürk", ideology: "Kemalism", economic: 0.5, authority: 0.75, cultural: 0.3 },
    { name: "Park Chung-hee", ideology: "Guided Democracy", economic: 0.6, authority: 0.85, cultural: 0.7 },
    { name: "Nasser", ideology: "Arab Socialism", economic: 0.4, authority: 0.85, cultural: 0.6 },
    { name: "Technocrat", ideology: "Technocracy", economic: 0.5, authority: 0.8, cultural: 0.4 },
    { name: "Bismarck", ideology: "Bureaucratic Collectivism", economic: 0.55, authority: 0.8, cultural: 0.75 }
  ],
  'ER-GL': [
    { name: "Mussolini", ideology: "Fascism", economic: 0.75, authority: 0.95, cultural: 0.85 },
    { name: "Hitler", ideology: "Nazism", economic: 0.7, authority: 1.0, cultural: 0.9 },
    { name: "Franco", ideology: "Francoism", economic: 0.65, authority: 0.85, cultural: 0.95 },
    { name: "Louis XIV", ideology: "Absolute Monarchism", economic: 0.7, authority: 0.9, cultural: 1.0 },
    { name: "Pinochet", ideology: "Military Dictatorship", economic: 0.9, authority: 0.9, cultural: 0.8 },
    { name: "Salazar", ideology: "Corporatism", economic: 0.6, authority: 0.85, cultural: 0.9 },
    { name: "Khomeini", ideology: "Theocracy", economic: 0.55, authority: 0.95, cultural: 0.95 },
    { name: "Dollfuss", ideology: "Clerical Fascism", economic: 0.65, authority: 0.9, cultural: 0.9 },
    { name: "Paternalist", ideology: "Paternalistic Conservatism", economic: 0.6, authority: 0.7, cultural: 0.85 }
  ],
  'EL-GM': [
    { name: "Bernie Sanders", ideology: "Democratic Socialism", economic: 0.85, authority: 0.35, cultural: 0.2 },
    { name: "Olof Palme", ideology: "Social Democracy", economic: 0.75, authority: 0.4, cultural: 0.25 },
    { name: "Corbyn", ideology: "Left Populism", economic: 0.8, authority: 0.3, cultural: 0.15 },
    { name: "Allende", ideology: "Market Socialism", economic: 0.8, authority: 0.45, cultural: 0.3 },
    { name: "Bernstein", ideology: "Reformist Socialism", economic: 0.7, authority: 0.45, cultural: 0.35 },
    { name: "Fabian", ideology: "Fabian Socialism", economic: 0.75, authority: 0.5, cultural: 0.3 },
    { name: "Guild Socialist", ideology: "Guild Socialism", economic: 0.8, authority: 0.35, cultural: 0.25 },
    { name: "Ethical Socialist", ideology: "Ethical Socialism", economic: 0.7, authority: 0.4, cultural: 0.2 },
    { name: "Mill Socialist", ideology: "Liberal Socialism", economic: 0.65, authority: 0.35, cultural: 0.25 }
  ],
  'EM-GM': [
    { name: "Biden", ideology: "Liberalism", economic: 0.45, authority: 0.45, cultural: 0.35 },
    { name: "Macron", ideology: "Liberal Centrism", economic: 0.5, authority: 0.5, cultural: 0.4 },
    { name: "Blair", ideology: "Third Way", economic: 0.55, authority: 0.55, cultural: 0.45 },
    { name: "Obama", ideology: "Social Liberalism", economic: 0.4, authority: 0.5, cultural: 0.3 },
    { name: "Merkel", ideology: "Christian Democracy", economic: 0.55, authority: 0.5, cultural: 0.6 },
    { name: "Radical Centrist", ideology: "Radical Centrism", economic: 0.5, authority: 0.45, cultural: 0.4 },
    { name: "Liberal Democrat", ideology: "Liberal Democracy", economic: 0.45, authority: 0.4, cultural: 0.35 },
    { name: "Progressive Conservative", ideology: "Progressive Conservatism", economic: 0.6, authority: 0.5, cultural: 0.55 },
    { name: "Conservative Liberal", ideology: "Conservative Liberalism", economic: 0.6, authority: 0.55, cultural: 0.6 }
  ],
  'ER-GM': [
    { name: "Reagan", ideology: "Conservatism", economic: 0.8, authority: 0.6, cultural: 0.8 },
    { name: "Thatcher", ideology: "Liberal Conservatism", economic: 0.85, authority: 0.6, cultural: 0.75 },
    { name: "Trump", ideology: "National Conservatism", economic: 0.75, authority: 0.65, cultural: 0.85 },
    { name: "Burke", ideology: "Traditional Conservatism", economic: 0.7, authority: 0.55, cultural: 0.9 },
    { name: "Christian Right", ideology: "Christian Conservatism", economic: 0.75, authority: 0.6, cultural: 0.9 },
    { name: "Fiscal Conservative", ideology: "Fiscal Conservatism", economic: 0.9, authority: 0.45, cultural: 0.5 },
    { name: "Cameron", ideology: "Compassionate Conservatism", economic: 0.7, authority: 0.5, cultural: 0.65 },
    { name: "One-Nation Tory", ideology: "One-Nation Conservatism", economic: 0.65, authority: 0.55, cultural: 0.7 },
    { name: "Green Conservative", ideology: "Green Conservatism", economic: 0.7, authority: 0.5, cultural: 0.6 }
  ],
  'EL-GR': [
    { name: "Kropotkin", ideology: "Anarcho-Communism", economic: 0.95, authority: 0.0, cultural: 0.05 },
    { name: "Chomsky", ideology: "Anarcho-Syndicalism", economic: 0.85, authority: 0.05, cultural: 0.1 },
    { name: "Bookchin", ideology: "Libertarian Socialism", economic: 0.8, authority: 0.1, cultural: 0.1 },
    { name: "Proudhon", ideology: "Mutualism", economic: 0.7, authority: 0.05, cultural: 0.25 },
    { name: "Bakunin", ideology: "Collectivist Anarchism", economic: 0.85, authority: 0.0, cultural: 0.15 },
    { name: "Green Anarchist", ideology: "Green Anarchism", economic: 0.9, authority: 0.0, cultural: 0.05 },
    { name: "Goldman", ideology: "Anarcha-Feminism", economic: 0.85, authority: 0.0, cultural: 0.0 },
    { name: "Social Anarchist", ideology: "Social Anarchism", economic: 0.8, authority: 0.05, cultural: 0.1 },
    { name: "Unger", ideology: "Left-Libertarianism", economic: 0.75, authority: 0.15, cultural: 0.15 }
  ],
  'EM-GR': [
    { name: "Mill", ideology: "Classical Liberalism", economic: 0.65, authority: 0.2, cultural: 0.25 },
    { name: "Nozick", ideology: "Minarchism", economic: 0.85, authority: 0.1, cultural: 0.4 },
    { name: "George", ideology: "Georgism", economic: 0.5, authority: 0.15, cultural: 0.35 },
    { name: "Bleeding-Heart", ideology: "Bleeding-Heart Libertarianism", economic: 0.6, authority: 0.2, cultural: 0.2 },
    { name: "Civil Libertarian", ideology: "Civil Libertarianism", economic: 0.55, authority: 0.1, cultural: 0.2 },
    { name: "Neoclassical", ideology: "Neoclassical Liberalism", economic: 0.7, authority: 0.2, cultural: 0.3 },
    { name: "Hayek", ideology: "Ordoliberalism", economic: 0.75, authority: 0.25, cultural: 0.5 },
    { name: "Paternalist Libertarian", ideology: "Libertarian Paternalism", economic: 0.6, authority: 0.3, cultural: 0.4 },
    { name: "Liberal Libertarian", ideology: "Liberal Libertarianism", economic: 0.55, authority: 0.15, cultural: 0.25 }
  ],
  'ER-GR': [
    { name: "Rothbard", ideology: "Anarcho-Capitalism", economic: 1.0, authority: 0.0, cultural: 0.5 },
    { name: "Rand", ideology: "Objectivism", economic: 1.0, authority: 0.05, cultural: 0.1 },
    { name: "Ron Paul", ideology: "Libertarianism", economic: 0.9, authority: 0.1, cultural: 0.4 },
    { name: "Hoppe", ideology: "Paleolibertarianism", economic: 1.0, authority: 0.0, cultural: 0.85 },
    { name: "Right-Libertarian", ideology: "Right-Libertarianism", economic: 0.95, authority: 0.05, cultural: 0.5 },
    { name: "Friedman", ideology: "Chicago School", economic: 0.9, authority: 0.1, cultural: 0.5 },
    { name: "Voluntaryist", ideology: "Voluntaryism", economic: 0.95, authority: 0.0, cultural: 0.45 },
    { name: "Agorist", ideology: "Agorism", economic: 0.9, authority: 0.0, cultural: 0.3 },
    { name: "Propertarian", ideology: "Propertarianism", economic: 0.95, authority: 0.05, cultural: 0.7 }
  ]
};

// Convert belief strength to quiz answers
function beliefToAnswers(belief) {
  // belief.economic: 0 = far left, 0.5 = center, 1 = far right
  return {
    economic: {
      redistribution: 1 - belief.economic,     // High redistribution = left
      freeTaxes: belief.economic,              // Low taxes = right
      freeMarket: belief.economic,             // Free market = right
      regulation: 1 - belief.economic,         // High regulation = left
      healthcare: 1 - belief.economic,         // Universal healthcare = left
      welfare: belief.economic,                // Welfare skepticism = right
      unions: (1 - belief.economic) * 0.8,     // Pro-union = left
      privatization: belief.economic           // Privatization = right
    },
    authority: {
      surveillance: belief.authority,
      minimalGov: 1 - belief.authority,
      censorship: belief.authority,
      personalFreedom: 1 - belief.authority,
      emergency: belief.authority,
      disobedience: 1 - belief.authority,
      centralized: belief.authority,
      gunRights: 1 - belief.authority * 0.8
    },
    cultural: {
      traditionalFamily: belief.cultural,
      diversity: 1 - belief.cultural,
      abortion: 1 - belief.cultural,
      politicalCorrectness: belief.cultural * 0.7,
      secular: 1 - belief.cultural * 0.8,
      genderIdentity: 1 - belief.cultural,
      immigration: belief.cultural,
      traditionalValues: belief.cultural
    }
  };
}

// Answer questions based on beliefs
function personaAnswer(beliefs, question) {
  let baseAnswer = 0.5;
  const text = question.text.toLowerCase();
  
  if (question.axis === 'economic') {
    if (text.includes('redistribute') || text.includes('wealth') && text.includes('equal')) {
      baseAnswer = beliefs.economic.redistribution;
    } else if (text.includes('tax') && (text.includes('lower') || text.includes('business'))) {
      baseAnswer = beliefs.economic.freeTaxes;
    } else if (text.includes('free-market') || text.includes('capitalism')) {
      baseAnswer = beliefs.economic.freeMarket;
    } else if (text.includes('regulation') && text.includes('business')) {
      baseAnswer = text.includes('too much') ? 
        1 - beliefs.economic.regulation : 
        beliefs.economic.regulation;
    } else if (text.includes('healthcare')) {
      baseAnswer = beliefs.economic.healthcare;
    } else if (text.includes('welfare')) {
      baseAnswer = beliefs.economic.welfare;
    } else if (text.includes('union')) {
      baseAnswer = beliefs.economic.unions;
    } else if (text.includes('private') && text.includes('efficient')) {
      baseAnswer = beliefs.economic.privatization;
    } else if (text.includes('high-income') && text.includes('tax')) {
      baseAnswer = beliefs.economic.redistribution;
    }
  } else if (question.axis === 'authority') {
    if (text.includes('surveillance')) {
      baseAnswer = beliefs.authority.surveillance;
    } else if (text.includes('little involvement') || text.includes('minimal')) {
      baseAnswer = beliefs.authority.minimalGov;
    } else if (text.includes('censor')) {
      baseAnswer = beliefs.authority.censorship;
    } else if (text.includes('lifestyle choice') || text.includes('personal')) {
      baseAnswer = beliefs.authority.personalFreedom;
    } else if (text.includes('emergency')) {
      baseAnswer = beliefs.authority.emergency;
    } else if (text.includes('disobey')) {
      baseAnswer = beliefs.authority.disobedience;
    } else if (text.includes('centralized') || text.includes('strong')) {
      baseAnswer = beliefs.authority.centralized;
    } else if (text.includes('firearm') || text.includes('gun')) {
      baseAnswer = beliefs.authority.gunRights;
    } else if (text.includes('military') || text.includes('service')) {
      baseAnswer = beliefs.authority.centralized;
    } else if (text.includes('local') && text.includes('communit')) {
      baseAnswer = 1 - beliefs.authority.centralized;
    }
  } else if (question.axis === 'cultural') {
    if (text.includes('married mother and father')) {
      baseAnswer = beliefs.cultural.traditionalFamily;
    } else if (text.includes('diverse') || text.includes('multicultural')) {
      baseAnswer = beliefs.cultural.diversity;
    } else if (text.includes('abortion')) {
      baseAnswer = beliefs.cultural.abortion;
    } else if (text.includes('political correctness')) {
      baseAnswer = beliefs.cultural.politicalCorrectness;
    } else if (text.includes('secular') || text.includes('religion')) {
      baseAnswer = beliefs.cultural.secular;
    } else if (text.includes('gender identit')) {
      baseAnswer = beliefs.cultural.genderIdentity;
    } else if (text.includes('immigration')) {
      baseAnswer = beliefs.cultural.immigration;
    } else if (text.includes('traditional values')) {
      baseAnswer = beliefs.cultural.traditionalValues;
    } else if (text.includes('permissive') || text.includes('moral')) {
      baseAnswer = beliefs.cultural.traditionalValues;
    } else if (text.includes('historical injustice')) {
      baseAnswer = 1 - beliefs.cultural.traditionalValues;
    }
  }
  
  // Add variation
  const variation = (Math.random() - 0.5) * 0.1;
  return Math.max(0, Math.min(1, baseAnswer + variation));
}

// Calculate scores
function calculateScores(answers, questions) {
  let economicScore = 0, socialScore = 0, culturalScore = 0;
  let economicCount = 0, socialCount = 0, culturalCount = 0;
  
  answers.forEach((answer, idx) => {
    const question = questions[idx];
    const score = (answer - 0.5) * 4;
    
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
  const TIEBREAKER_THRESHOLD = 15; // Current threshold
  return Math.abs(scores.economic) <= TIEBREAKER_THRESHOLD || 
         Math.abs(scores.social) <= TIEBREAKER_THRESHOLD || 
         Math.abs(scores.cultural) <= TIEBREAKER_THRESHOLD;
}

// Check if near boundary
function nearBoundary(scores) {
  const BOUNDARY_MARGIN = 5; // Within 5 points of ±33
  const econNearBoundary = Math.abs(Math.abs(scores.economic) - 33) <= BOUNDARY_MARGIN;
  const authNearBoundary = Math.abs(Math.abs(scores.social) - 33) <= BOUNDARY_MARGIN;
  return econNearBoundary || authNearBoundary;
}

// Main test
async function test81Ideologies() {
  console.log('🌐 Testing All 81 Political Ideologies\n');
  console.log('This comprehensive test covers the entire political spectrum\n');
  
  const questions = await loadActualQuestions();
  const tiebreakerQuestions = await loadTiebreakerQuestions();
  
  console.log(`Loaded ${questions.length} core questions and ${tiebreakerQuestions.length} tiebreaker questions\n`);
  
  const results = {
    total: 0,
    success: 0,
    failure: 0,
    tiebreakers: 0,
    nearBoundary: 0,
    byCell: {}
  };
  
  // Test each macro cell
  for (const [macroCell, ideologies] of Object.entries(ALL_81_IDEOLOGIES)) {
    console.log(`\n${'═'.repeat(70)}`);
    console.log(`TESTING ${macroCell} (${ideologies.length} ideologies)`);
    console.log(`${'═'.repeat(70)}\n`);
    
    results.byCell[macroCell] = { total: 0, success: 0, failures: [] };
    
    for (const persona of ideologies) {
      results.total++;
      results.byCell[macroCell].total++;
      
      // Convert simple beliefs to detailed beliefs
      const beliefs = beliefToAnswers(persona);
      
      // Answer questions
      const answers = [];
      questions.forEach(q => {
        answers.push(personaAnswer(beliefs, q));
      });
      
      // Calculate scores
      const scores = calculateScores(answers, questions);
      const actualCell = getMacroCell(scores.economic, scores.social);
      const success = actualCell === macroCell;
      
      // Check special conditions
      const needsTie = needsTiebreaker(scores);
      const nearBound = nearBoundary(scores);
      
      if (needsTie) results.tiebreakers++;
      if (nearBound) results.nearBoundary++;
      
      // Display result
      const icon = success ? '✅' : '❌';
      const tieIcon = needsTie ? '⚖️' : '';
      const boundIcon = nearBound ? '🎯' : '';
      
      console.log(`${icon} ${persona.name} (${persona.ideology}) ${tieIcon}${boundIcon}`);
      console.log(`   E:${scores.economic.toFixed(1)} A:${scores.social.toFixed(1)} C:${scores.cultural.toFixed(1)} → ${actualCell}`);
      
      if (success) {
        results.success++;
        results.byCell[macroCell].success++;
      } else {
        results.failure++;
        results.byCell[macroCell].failures.push(persona.name);
        console.log(`   ⚠️  Expected ${macroCell}, got ${actualCell}`);
      }
      
      // If tiebreaker needed, show which axes
      if (needsTie) {
        const axes = [];
        if (Math.abs(scores.economic) <= 15) axes.push(`Econ(${scores.economic.toFixed(1)})`);
        if (Math.abs(scores.social) <= 15) axes.push(`Auth(${scores.social.toFixed(1)})`);
        if (Math.abs(scores.cultural) <= 15) axes.push(`Cult(${scores.cultural.toFixed(1)})`);
        console.log(`   ⚖️  Tiebreaker needed for: ${axes.join(', ')}`);
      }
    }
    
    // Cell summary
    const cellSuccess = results.byCell[macroCell].success;
    const cellTotal = results.byCell[macroCell].total;
    console.log(`\n📊 ${macroCell} Summary: ${cellSuccess}/${cellTotal} (${(cellSuccess/cellTotal*100).toFixed(0)}%)`);
    if (results.byCell[macroCell].failures.length > 0) {
      console.log(`   Failed: ${results.byCell[macroCell].failures.join(', ')}`);
    }
  }
  
  // Overall summary
  console.log('\n\n' + '═'.repeat(70));
  console.log('📊 COMPREHENSIVE 81 IDEOLOGY TEST RESULTS');
  console.log('═'.repeat(70) + '\n');
  
  console.log(`Overall Success Rate: ${results.success}/${results.total} (${(results.success/results.total*100).toFixed(1)}%)\n`);
  console.log(`Ideologies needing tiebreakers: ${results.tiebreakers} (${(results.tiebreakers/results.total*100).toFixed(1)}%)`);
  console.log(`Ideologies near boundaries (±5 of 33): ${results.nearBoundary} (${(results.nearBoundary/results.total*100).toFixed(1)}%)\n`);
  
  // Grid visualization
  console.log('Political Compass Grid Success Rates:');
  console.log('                 LEFT          CENTER         RIGHT');
  console.log('              ───────────────────────────────────────');
  
  const rows = [
    { name: 'AUTH  ', cells: ['EL-GL', 'EM-GL', 'ER-GL'] },
    { name: 'CENTER', cells: ['EL-GM', 'EM-GM', 'ER-GM'] },
    { name: 'LIB   ', cells: ['EL-GR', 'EM-GR', 'ER-GR'] }
  ];
  
  rows.forEach(row => {
    const cellResults = row.cells.map(cell => {
      const data = results.byCell[cell];
      const pct = (data.success/data.total*100).toFixed(0);
      return `${data.success}/${data.total} (${pct}%)`;
    });
    console.log(`${row.name} │ ${cellResults[0].padEnd(12)} │ ${cellResults[1].padEnd(13)} │ ${cellResults[2]}`);
  });
  
  // Analysis of boundaries
  console.log('\n💡 Boundary Analysis:');
  console.log(`- Current tiebreaker threshold: ±15`);
  console.log(`- Macro cell boundaries: ±33`);
  console.log(`- Gap between tiebreaker and boundary: 18 points`);
  
  if (results.nearBoundary > 10) {
    console.log(`\n⚠️  ${results.nearBoundary} ideologies are near boundaries!`);
    console.log('Consider expanding tiebreaker threshold from ±15 to ±20 or ±25');
    console.log('This would help with edge cases like Franco (29.5) and Orbán (16.3)');
  }
  
  console.log('\n🔍 Key Insights:');
  console.log('- Most failures occur near macro cell boundaries');
  console.log('- Tiebreakers help refine placement for centrist scores');
  console.log('- Phase 2 questions would further differentiate within cells');
  console.log('- Consider dynamic tiebreaker threshold based on proximity to boundaries');
}

// Run the test
test81Ideologies().catch(console.error);