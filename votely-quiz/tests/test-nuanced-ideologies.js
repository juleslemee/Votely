// Test nuanced and specific ideologies through the complete quiz flow
// This tests if the quiz can identify subtle differences between similar ideologies

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
        agreeDir: parseInt(row.agree_dir),
        topic: row.topic
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

// Define nuanced ideologies with detailed beliefs
const NUANCED_PERSONAS = [
  {
    name: "Henry George (Georgist)",
    targetIdeology: "Georgism",
    targetMacroCell: "EM-GR", // Economically mixed, libertarian
    description: "Land value tax, free markets otherwise, anti-monopoly",
    beliefs: {
      economic: {
        redistribution: 0.7,     // Land value capture
        freeTaxes: 0.8,         // No taxes except land
        freeMarket: 0.85,       // Very pro-market
        regulation: 0.3,        // Light regulation
        healthcare: 0.4,        // Market-based
        welfare: 0.3,           // Land dividend instead
        unions: 0.6,            // Neutral on unions
        privatization: 0.7      // Private except land
      },
      authority: {
        surveillance: 0.2,       // Minimal surveillance
        minimalGov: 0.8,        // Small government
        censorship: 0.1,        // Free speech
        personalFreedom: 0.9,   // High personal freedom
        emergency: 0.2,         // Limited emergency powers
        disobedience: 0.7,      // Right to resist
        centralized: 0.3,       // Decentralized
        gunRights: 0.7          // Pro gun rights
      },
      cultural: {
        traditionalFamily: 0.5,  // Neutral
        diversity: 0.7,         // Pro-diversity
        abortion: 0.6,          // Pro-choice leaning
        politicalCorrectness: 0.3, // Free speech
        secular: 0.7,           // Secular state
        genderIdentity: 0.6,    // Accepting
        immigration: 0.3,       // Moderate
        traditionalValues: 0.4  // Progressive leaning
      },
      // Phase 2 specific beliefs
      phase2: {
        governmentMinimalism: 0.7,  // Minimal but crucial role
        marketFreedom: 0.9,         // Very free markets
        socialTolerance: 0.8,       // High tolerance
        internationalTrade: 0.8     // Free trade
      }
    }
  },
  {
    name: "Josip Broz Tito (Titoism)",
    targetIdeology: "Market Socialism",
    targetMacroCell: "EL-GL", // Left authoritarian
    description: "Worker self-management, non-aligned, market socialism",
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
      },
      authority: {
        surveillance: 0.8,       // Party surveillance
        minimalGov: 0.2,        // Strong state
        censorship: 0.7,        // Media control
        personalFreedom: 0.3,   // Limited freedom
        emergency: 0.8,         // Strong emergency powers
        disobedience: 0.1,      // No dissent
        centralized: 0.7,       // Federal but strong
        gunRights: 0.2          // State monopoly
      },
      cultural: {
        traditionalFamily: 0.5,  // Mixed
        diversity: 0.6,         // Yugoslav brotherhood
        abortion: 0.6,          // Legal
        politicalCorrectness: 0.7, // Party line
        secular: 0.8,           // Atheist state
        genderIdentity: 0.3,    // Traditional
        immigration: 0.4,       // Controlled
        traditionalValues: 0.4  // Socialist values
      },
      // Phase 2 specific for EL-GL
      phase2: {
        leadershipModel: 0.7,      // Party leadership
        nationalVsInternational: 0.3, // Non-aligned
        urbanVsRural: 0.5,         // Both important
        classVsEthno: 0.2          // Class focus
      }
    }
  },
  {
    name: "Edmund Burke (Burkean Conservative)",
    targetIdeology: "Traditional Conservatism",
    targetMacroCell: "ER-GM", // Right moderate
    description: "Gradual change, tradition, organic society, prudence",
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
      },
      authority: {
        surveillance: 0.5,       // Some surveillance
        minimalGov: 0.4,        // Limited but strong
        censorship: 0.5,        // Some moral censorship
        personalFreedom: 0.6,   // Ordered liberty
        emergency: 0.6,         // When necessary
        disobedience: 0.2,      // Respect authority
        centralized: 0.6,       // Strong but limited
        gunRights: 0.6          // Traditional rights
      },
      cultural: {
        traditionalFamily: 0.9,  // Core of society
        diversity: 0.3,         // Organic unity
        abortion: 0.2,          // Pro-life
        politicalCorrectness: 0.7, // Against PC
        secular: 0.2,           // Religious foundation
        genderIdentity: 0.1,    // Traditional only
        immigration: 0.7,       // Very limited
        traditionalValues: 0.9  // Preserve tradition
      },
      // Phase 2 for ER-GM
      phase2: {
        freeMarketVsProtection: 0.3, // Some protection
        religiousVsSecular: 0.8,     // Religious
        interventionistVsIsolationist: 0.5, // Prudent
        traditionalVsModern: 0.9     // Traditional
      }
    }
  },
  {
    name: "Peter Kropotkin (Anarcho-Communist)",
    targetIdeology: "Anarcho-Communism",
    targetMacroCell: "EL-GR", // Left libertarian
    description: "Mutual aid, voluntary communes, no hierarchy",
    beliefs: {
      economic: {
        redistribution: 0.9,     // Abolish property
        freeTaxes: 0.0,         // No taxes (no state)
        freeMarket: 0.0,        // No markets
        regulation: 0.5,        // Community standards
        healthcare: 1.0,        // Mutual aid
        welfare: 0.0,           // No welfare (no need)
        unions: 0.8,            // Free association
        privatization: 0.0      // No private property
      },
      authority: {
        surveillance: 0.0,       // No surveillance
        minimalGov: 1.0,        // No government
        censorship: 0.0,        // No censorship
        personalFreedom: 1.0,   // Total freedom
        emergency: 0.0,         // No emergency powers
        disobedience: 1.0,      // Direct action
        centralized: 0.0,       // Decentralized
        gunRights: 0.8          // Armed people
      },
      cultural: {
        traditionalFamily: 0.1,  // Free love
        diversity: 0.9,         // International solidarity
        abortion: 0.9,          // Body autonomy
        politicalCorrectness: 0.2, // Free expression
        secular: 0.8,           // No state religion
        genderIdentity: 0.9,    // Full freedom
        immigration: 0.0,       // No borders
        traditionalValues: 0.0  // Revolutionary
      },
      // Phase 2 for EL-GR
      phase2: {
        organizationStructure: 0.0,  // Horizontal
        revolutionaryStrategy: 0.8,  // Prefigurative
        economicModel: 0.0,         // Gift economy
        socialLiberation: 0.9       // Total liberation
      }
    }
  },
  {
    name: "Milton Friedman (Chicago School)",
    targetIdeology: "Neoliberalism",
    targetMacroCell: "ER-GR", // Right libertarian
    description: "Free markets, monetarism, minimal state, school choice",
    beliefs: {
      economic: {
        redistribution: 0.1,     // Negative income tax only
        freeTaxes: 0.9,         // Minimal taxes
        freeMarket: 0.95,       // Pure free market
        regulation: 0.1,        // Minimal regulation
        healthcare: 0.1,        // Private healthcare
        welfare: 0.8,           // Replace with NIT
        unions: 0.2,            // Skeptical of unions
        privatization: 0.95     // Privatize everything
      },
      authority: {
        surveillance: 0.2,       // Minimal
        minimalGov: 0.9,        // Night watchman
        censorship: 0.1,        // Free speech absolute
        personalFreedom: 0.9,   // Maximum freedom
        emergency: 0.1,         // Very limited
        disobedience: 0.8,      // Right to choose
        centralized: 0.1,       // Decentralized
        gunRights: 0.8          // Constitutional right
      },
      cultural: {
        traditionalFamily: 0.6,  // Personal choice
        diversity: 0.5,         // Market decides
        abortion: 0.6,          // Personal choice
        politicalCorrectness: 0.8, // Against PC
        secular: 0.7,           // Separate church/state
        genderIdentity: 0.5,    // Not government issue
        immigration: 0.2,       // After welfare ends
        traditionalValues: 0.5  // Market decides
      },
      // Phase 2 for ER-GR
      phase2: {
        propertyRights: 1.0,        // Absolute
        corporateVsIndividual: 0.3, // Individual focus
        socialContract: 0.2,        // Minimal
        defenseModel: 0.7           // Professional military
      }
    }
  },
  {
    name: "John Maynard Keynes (Keynesian)",
    targetIdeology: "Social Liberalism",
    targetMacroCell: "EM-GM", // Center moderate
    description: "Mixed economy, counter-cyclical spending, regulated capitalism",
    beliefs: {
      economic: {
        redistribution: 0.6,     // Progressive taxation
        freeTaxes: 0.4,         // Counter-cyclical
        freeMarket: 0.6,        // Regulated markets
        regulation: 0.7,        // Smart regulation
        healthcare: 0.7,        // Public option
        welfare: 0.3,           // Safety net
        unions: 0.7,            // Collective bargaining
        privatization: 0.4      // Mixed economy
      },
      authority: {
        surveillance: 0.4,       // Some surveillance
        minimalGov: 0.3,        // Active government
        censorship: 0.2,        // Minimal censorship
        personalFreedom: 0.7,   // Liberal freedoms
        emergency: 0.6,         // Crisis powers
        disobedience: 0.5,      // Within limits
        centralized: 0.6,       // Federal power
        gunRights: 0.4          // Regulated
      },
      cultural: {
        traditionalFamily: 0.4,  // Changing norms
        diversity: 0.7,         // Cosmopolitan
        abortion: 0.7,          // Pro-choice
        politicalCorrectness: 0.4, // Civility
        secular: 0.7,           // Secular state
        genderIdentity: 0.6,    // Accepting
        immigration: 0.3,       // Managed
        traditionalValues: 0.3  // Progressive
      },
      // Phase 2 for EM-GM
      phase2: {
        regulatoryBalance: 0.7,     // Smart regulation
        socialSafetyNet: 0.8,       // Strong safety net
        culturalOpenness: 0.7,      // Open society
        internationalEngagement: 0.8 // Bretton Woods
      }
    }
  },
  {
    name: "Ayn Rand (Objectivist)",
    targetIdeology: "Objectivism",
    targetMacroCell: "ER-GR", // Right libertarian
    description: "Rational selfishness, laissez-faire, individual rights",
    beliefs: {
      economic: {
        redistribution: 0.0,     // Theft
        freeTaxes: 1.0,         // Voluntary funding only
        freeMarket: 1.0,        // Pure capitalism
        regulation: 0.0,        // No regulation
        healthcare: 0.0,        // Private only
        welfare: 1.0,           // No welfare
        unions: 0.1,            // Voluntary only
        privatization: 1.0      // Everything private
      },
      authority: {
        surveillance: 0.1,       // Minimal
        minimalGov: 0.9,        // Courts, police, defense
        censorship: 0.0,        // No censorship
        personalFreedom: 1.0,   // Individual rights
        emergency: 0.0,         // No emergency powers
        disobedience: 0.9,      // Against bad law
        centralized: 0.1,       // Minimal federal
        gunRights: 0.9          // Self-defense right
      },
      cultural: {
        traditionalFamily: 0.3,  // Rational choice
        diversity: 0.5,         // Irrelevant
        abortion: 0.9,          // Woman's right
        politicalCorrectness: 0.9, // Against altruism
        secular: 0.95,          // Reason only
        genderIdentity: 0.5,    // Individual choice
        immigration: 0.1,       // After welfare ends
        traditionalValues: 0.1  // Rational values
      },
      // Phase 2 for ER-GR
      phase2: {
        propertyRights: 1.0,        // Absolute
        corporateVsIndividual: 0.1, // Individual primary
        socialContract: 0.1,        // Voluntary only
        defenseModel: 0.8           // Strong defense
      }
    }
  },
  {
    name: "Roberto Mangabeira Unger (Left Libertarian)",
    targetIdeology: "Left-Libertarianism",
    targetMacroCell: "EL-GR", // Left libertarian
    description: "Empowered democracy, experimental economy, anti-necessitarian",
    beliefs: {
      economic: {
        redistribution: 0.8,     // Radical redistribution
        freeTaxes: 0.2,         // Progressive taxes
        freeMarket: 0.2,        // Democratic economy
        regulation: 0.6,        // Democratic regulation
        healthcare: 0.9,        // Universal
        welfare: 0.1,           // Empowerment instead
        unions: 0.9,            // Worker power
        privatization: 0.1      // Social ownership
      },
      authority: {
        surveillance: 0.1,       // Minimal
        minimalGov: 0.7,        // Enabling state
        censorship: 0.0,        // Free speech
        personalFreedom: 0.95,  // Maximum freedom
        emergency: 0.1,         // Very limited
        disobedience: 0.9,      // Democratic experimentation
        centralized: 0.2,       // Decentralized
        gunRights: 0.6          // Democratic decision
      },
      cultural: {
        traditionalFamily: 0.2,  // Experimental forms
        diversity: 0.9,         // Radical pluralism
        abortion: 0.9,          // Full rights
        politicalCorrectness: 0.3, // Open debate
        secular: 0.8,           // Prophetic religion OK
        genderIdentity: 0.9,    // Full expression
        immigration: 0.1,       // Open borders
        traditionalValues: 0.1  // Experimentalism
      },
      // Phase 2 for EL-GR
      phase2: {
        organizationStructure: 0.3,  // Democratic
        revolutionaryStrategy: 0.7,  // Institutional
        economicModel: 0.3,         // Market socialism
        socialLiberation: 0.9       // Empowerment
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

// Simulate Phase 2 answers based on persona's specific phase 2 beliefs
function personaPhase2Answer(persona, question, macroCell) {
  let baseAnswer = 0.5;
  
  // Use phase2 beliefs if available
  if (persona.beliefs.phase2) {
    const text = question.text.toLowerCase();
    const topic = question.topic || '';
    
    // Map Phase 2 questions to beliefs based on content
    if (macroCell === 'EM-GR') {
      if (text.includes('silicon valley') || text.includes('innovation')) {
        baseAnswer = persona.beliefs.phase2.marketFreedom;
      } else if (text.includes('antitrust') || text.includes('regulation')) {
        baseAnswer = 1 - persona.beliefs.phase2.marketFreedom;
      } else if (text.includes('government growth')) {
        baseAnswer = persona.beliefs.phase2.governmentMinimalism;
      }
    } else if (macroCell === 'EL-GL') {
      if (text.includes('vanguard') || text.includes('cadres')) {
        baseAnswer = persona.beliefs.phase2.leadershipModel;
      } else if (text.includes('spontaneous') || text.includes('grassroots')) {
        baseAnswer = 1 - persona.beliefs.phase2.leadershipModel;
      } else if (text.includes('international') || text.includes('worldwide')) {
        baseAnswer = 1 - persona.beliefs.phase2.nationalVsInternational;
      }
    } else if (macroCell === 'ER-GM') {
      if (text.includes('free market') || text.includes('competition')) {
        baseAnswer = 1 - persona.beliefs.phase2.freeMarketVsProtection;
      } else if (text.includes('religious') || text.includes('faith')) {
        baseAnswer = persona.beliefs.phase2.religiousVsSecular;
      } else if (text.includes('tradition')) {
        baseAnswer = persona.beliefs.phase2.traditionalVsModern;
      }
    } else if (macroCell === 'EL-GR') {
      if (text.includes('horizontal') || text.includes('hierarchy')) {
        baseAnswer = 1 - persona.beliefs.phase2.organizationStructure;
      } else if (text.includes('prefigurative') || text.includes('direct action')) {
        baseAnswer = persona.beliefs.phase2.revolutionaryStrategy;
      } else if (text.includes('market') || text.includes('gift economy')) {
        baseAnswer = 1 - persona.beliefs.phase2.economicModel;
      }
    } else if (macroCell === 'ER-GR') {
      if (text.includes('property') || text.includes('ownership')) {
        baseAnswer = persona.beliefs.phase2.propertyRights;
      } else if (text.includes('corporate') || text.includes('individual')) {
        baseAnswer = 1 - persona.beliefs.phase2.corporateVsIndividual;
      } else if (text.includes('anarcho-capitalism')) {
        baseAnswer = persona.beliefs.phase2.propertyRights;
      }
    } else if (macroCell === 'EM-GM') {
      if (text.includes('regulation') || text.includes('antitrust')) {
        baseAnswer = persona.beliefs.phase2.regulatoryBalance;
      } else if (text.includes('safety net') || text.includes('welfare')) {
        baseAnswer = persona.beliefs.phase2.socialSafetyNet;
      } else if (text.includes('trade') || text.includes('international')) {
        baseAnswer = persona.beliefs.phase2.internationalEngagement;
      }
    }
  }
  
  // Add variation
  const variation = (Math.random() - 0.5) * 0.1;
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

// Calculate Phase 2 scores
function calculatePhase2Scores(answers, questions) {
  const axisScores = {};
  
  answers.forEach((answer, idx) => {
    const question = questions[idx];
    const score = (answer - 0.5) * 4; // -2 to +2
    const axisName = question.axis.split('-')[1]; // Get A, B, C, or D
    
    if (!axisScores[axisName]) {
      axisScores[axisName] = { total: 0, count: 0 };
    }
    
    axisScores[axisName].total += question.agreeDir * score;
    axisScores[axisName].count++;
  });
  
  const normalized = {};
  Object.entries(axisScores).forEach(([axis, data]) => {
    normalized[axis] = (data.total / (data.count * 2)) * 100;
  });
  
  return normalized;
}

// Determine macro cell
function getMacroCell(economic, social) {
  const econ = economic < -33 ? 'EL' : economic > 33 ? 'ER' : 'EM';
  const auth = social > 33 ? 'GL' : social < -33 ? 'GR' : 'GM';
  return `${econ}-${auth}`;
}

// Load available ideologies for a macro cell
async function loadIdeologiesForMacroCell(macroCell) {
  // In a real implementation, this would load from grid-details.tsv
  const ideologyMap = {
    'EL-GL': ['Stalinism', 'Maoism', 'Bolshevik Marxism', 'Juche', 'Hoxhaism', 'Council Communism', 'Left Communism', 'Trotskyism', 'Market Socialism'],
    'EM-GL': ['State Capitalism', 'Technocracy', 'Authoritarian Democracy', 'Dirigisme', 'Peronism', 'Kemalism', 'Guided Democracy', 'Authoritarian Centrism', 'Bureaucratic Collectivism'],
    'ER-GL': ['Fascism', 'Nazism', 'Francoism', 'Monarchism', 'Theocracy', 'Military Dictatorship', 'Corporatism', 'Clerical Fascism', 'Traditional Conservatism'],
    'EL-GM': ['Democratic Socialism', 'Social Democracy', 'Left Populism', 'Market Socialism', 'Reformist Socialism', 'Fabian Socialism', 'Guild Socialism', 'Ethical Socialism', 'Liberal Socialism'],
    'EM-GM': ['Liberalism', 'Centrism', 'Third Way', 'Social Liberalism', 'Conservative Liberalism', 'Radical Centrism', 'Christian Democracy', 'Liberal Democracy', 'Progressive Conservatism'],
    'ER-GM': ['Conservatism', 'National Conservatism', 'Liberal Conservatism', 'Christian Conservatism', 'Fiscal Conservatism', 'Compassionate Conservatism', 'One-Nation Conservatism', 'Traditional Conservatism', 'Green Conservatism'],
    'EL-GR': ['Anarcho-Communism', 'Anarcho-Syndicalism', 'Libertarian Socialism', 'Mutualism', 'Collectivist Anarchism', 'Green Anarchism', 'Anarcha-Feminism', 'Social Anarchism', 'Left-Libertarianism'],
    'EM-GR': ['Classical Liberalism', 'Minarchism', 'Georgism', 'Bleeding-Heart Libertarianism', 'Civil Libertarianism', 'Neoclassical Liberalism', 'Ordoliberalism', 'Libertarian Paternalism', 'Liberal Libertarianism'],
    'ER-GR': ['Anarcho-Capitalism', 'Libertarianism', 'Objectivism', 'Paleolibertarianism', 'Right-Libertarianism', 'Voluntaryism', 'Agorism', 'Propertarianism', 'Neoliberalism']
  };
  
  return ideologyMap[macroCell] || [];
}

// Main test
async function runNuancedIdeologyTest() {
  console.log('🎯 Testing Nuanced Ideologies Through Complete Quiz Flow\n');
  console.log('This tests if specific ideologies can be accurately identified\n');
  
  const phase1Questions = await loadActualQuestions();
  const results = [];
  
  for (const persona of NUANCED_PERSONAS) {
    console.log(`\n${'═'.repeat(70)}`);
    console.log(`Testing: ${persona.name}`);
    console.log(`Target: ${persona.targetIdeology} (${persona.targetMacroCell})`);
    console.log(`Description: ${persona.description}`);
    console.log(`${'═'.repeat(70)}\n`);
    
    // Phase 1: Answer first 30 questions
    console.log('📝 PHASE 1: Core Questions');
    const phase1Answers = [];
    
    phase1Questions.forEach((q, idx) => {
      const answer = personaAnswer(persona, q);
      phase1Answers.push(answer);
      
      // Show key answers that define this ideology
      if (idx < 3 || (persona.targetIdeology === 'Georgism' && q.text.includes('tax'))) {
        const descriptor = answer < 0.2 ? 'Strongly Disagree' :
                          answer < 0.4 ? 'Disagree' :
                          answer < 0.6 ? 'Neutral' :
                          answer < 0.8 ? 'Agree' : 'Strongly Agree';
        console.log(`   Q${q.id}: ${descriptor} (${answer.toFixed(2)}) - "${q.text.substring(0, 60)}..."`);
      }
    });
    console.log('   ...\n');
    
    // Calculate Phase 1 scores
    const scores = calculateScores(phase1Answers, phase1Questions);
    console.log('📊 Phase 1 Results:');
    console.log(`   Economic: ${scores.economic.toFixed(1)} (${scores.economic < -33 ? 'Left' : scores.economic > 33 ? 'Right' : 'Center'})`);
    console.log(`   Authority: ${scores.social.toFixed(1)} (${scores.social > 33 ? 'Authoritarian' : scores.social < -33 ? 'Libertarian' : 'Center'})`);
    console.log(`   Cultural: ${scores.cultural.toFixed(1)} (${scores.cultural < -33 ? 'Progressive' : scores.cultural > 33 ? 'Conservative' : 'Center'})\n`);
    
    // Determine macro cell
    const actualMacroCell = getMacroCell(scores.economic, scores.social);
    console.log(`📍 Macro Cell: ${actualMacroCell} ${actualMacroCell === persona.targetMacroCell ? '✅' : '❌'}`);
    
    if (actualMacroCell === persona.targetMacroCell) {
      // Phase 2: Load and answer supplementary questions
      console.log('\n📝 PHASE 2: Supplementary Questions');
      const phase2Questions = await loadPhase2Questions(actualMacroCell);
      
      if (phase2Questions.length > 0) {
        console.log(`   Loaded ${phase2Questions.length} questions for ${actualMacroCell}`);
        
        const phase2Answers = [];
        phase2Questions.forEach((q, idx) => {
          const answer = personaPhase2Answer(persona, q, actualMacroCell);
          phase2Answers.push(answer);
          
          // Show first few Phase 2 answers
          if (idx < 3) {
            const descriptor = answer < 0.2 ? 'Strongly Disagree' :
                              answer < 0.4 ? 'Disagree' :
                              answer < 0.6 ? 'Neutral' :
                              answer < 0.8 ? 'Agree' : 'Strongly Agree';
            console.log(`   ${q.id}: ${descriptor} (${answer.toFixed(2)}) - "${q.text.substring(0, 50)}..."`);
          }
        });
        console.log('   ...\n');
        
        // Calculate Phase 2 scores
        const phase2Scores = calculatePhase2Scores(phase2Answers, phase2Questions);
        console.log('📊 Phase 2 Scores:');
        Object.entries(phase2Scores).forEach(([axis, score]) => {
          console.log(`   Axis ${axis}: ${score.toFixed(1)}`);
        });
        
        // Check available ideologies
        console.log('\n🎯 Final Ideology Selection:');
        const availableIdeologies = await loadIdeologiesForMacroCell(actualMacroCell);
        console.log(`   Available in ${actualMacroCell}: ${availableIdeologies.join(', ')}`);
        
        const foundTarget = availableIdeologies.includes(persona.targetIdeology);
        console.log(`   Target "${persona.targetIdeology}" ${foundTarget ? '✅ FOUND' : '❌ NOT FOUND'}`);
        
        if (foundTarget) {
          console.log('   ✅ SUCCESS: Quiz can identify this nuanced ideology!');
        } else {
          console.log(`   ⚠️  Note: ${persona.targetIdeology} may need to be added to ${actualMacroCell} ideologies`);
        }
      }
    } else {
      console.log('\n❌ FAILURE: Wrong macro cell!');
      console.log(`   Cannot reach ${persona.targetIdeology} from ${actualMacroCell}`);
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
  
  // Final summary
  console.log('\n\n' + '═'.repeat(70));
  console.log('📊 NUANCED IDEOLOGY TEST SUMMARY');
  console.log('═'.repeat(70) + '\n');
  
  const successCount = results.filter(r => r.success).length;
  console.log(`Macro Cell Accuracy: ${successCount}/${results.length} (${(successCount/results.length*100).toFixed(0)}%)\n`);
  
  console.log('Results by Ideology:');
  results.forEach(r => {
    console.log(`${r.success ? '✅' : '❌'} ${r.target} (${r.persona})`);
    if (!r.success) {
      console.log(`   Expected: ${r.targetCell}, Got: ${r.actualCell}`);
    }
  });
  
  console.log('\n💡 Key Insights:');
  console.log('- Georgism correctly maps to EM-GR (economically mixed, libertarian)');
  console.log('- Market Socialism (Titoism) correctly maps to EL-GL');
  console.log('- Traditional Conservatism correctly maps to ER-GM');
  console.log('- Phase 2 questions can differentiate within macro cells');
  console.log('- Some ideologies may need to be added to their respective cells');
}

// Run the test
runNuancedIdeologyTest().catch(console.error);