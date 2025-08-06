// Comprehensive test of ALL 81 ideologies with correct tiebreaker logic
// Tiebreakers trigger within ±15 of macro cell borders (±33)

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

// Load ideology grid data
async function loadIdeologyGrid() {
  try {
    const gridContent = fs.readFileSync('./public/grid-3x3-details.tsv', 'utf-8');
    const lines = gridContent.split('\n');
    const headers = lines[0].split('\t');
    
    const ideologies = {};
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split('\t');
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      
      const macroCell = row['Macro Cell'] || row['macro_cell'];
      if (!ideologies[macroCell]) {
        ideologies[macroCell] = [];
      }
      
      ideologies[macroCell].push({
        name: row['Ideology'] || row['ideology'],
        description: row['Description'] || row['description'] || ''
      });
    }
    
    return ideologies;
  } catch (e) {
    console.log('Could not load grid file, using default ideologies');
    return null;
  }
}

// All 81 ideologies with detailed beliefs
const ALL_81_IDEOLOGIES = {
  'EL-GL': [
    {
      name: "Stalinism",
      beliefs: {
        economic: { redistribution: 1.0, freeTaxes: 0.0, freeMarket: 0.0, regulation: 1.0, healthcare: 1.0, welfare: 0.0, unions: 0.2, privatization: 0.0 },
        authority: { surveillance: 1.0, minimalGov: 0.0, censorship: 1.0, personalFreedom: 0.0, emergency: 1.0, disobedience: 0.0, centralized: 1.0, gunRights: 0.0 },
        cultural: { traditionalFamily: 0.6, diversity: 0.4, abortion: 0.5, politicalCorrectness: 0.9, secular: 0.9, genderIdentity: 0.2, immigration: 0.3, traditionalValues: 0.6 }
      }
    },
    {
      name: "Maoism",
      beliefs: {
        economic: { redistribution: 0.95, freeTaxes: 0.05, freeMarket: 0.05, regulation: 0.95, healthcare: 0.95, welfare: 0.05, unions: 0.3, privatization: 0.05 },
        authority: { surveillance: 0.95, minimalGov: 0.05, censorship: 0.95, personalFreedom: 0.05, emergency: 0.95, disobedience: 0.05, centralized: 0.9, gunRights: 0.1 },
        cultural: { traditionalFamily: 0.4, diversity: 0.6, abortion: 0.6, politicalCorrectness: 0.8, secular: 0.95, genderIdentity: 0.3, immigration: 0.4, traditionalValues: 0.3 }
      }
    },
    {
      name: "Bolshevik Marxism",
      beliefs: {
        economic: { redistribution: 0.95, freeTaxes: 0.05, freeMarket: 0.05, regulation: 0.95, healthcare: 0.95, welfare: 0.05, unions: 0.35, privatization: 0.05 },
        authority: { surveillance: 0.9, minimalGov: 0.1, censorship: 0.85, personalFreedom: 0.15, emergency: 0.9, disobedience: 0.1, centralized: 0.85, gunRights: 0.15 },
        cultural: { traditionalFamily: 0.3, diversity: 0.7, abortion: 0.7, politicalCorrectness: 0.8, secular: 0.9, genderIdentity: 0.4, immigration: 0.5, traditionalValues: 0.2 }
      }
    },
    {
      name: "Juche",
      beliefs: {
        economic: { redistribution: 1.0, freeTaxes: 0.0, freeMarket: 0.0, regulation: 1.0, healthcare: 1.0, welfare: 0.0, unions: 0.05, privatization: 0.0 },
        authority: { surveillance: 1.0, minimalGov: 0.0, censorship: 1.0, personalFreedom: 0.0, emergency: 1.0, disobedience: 0.0, centralized: 1.0, gunRights: 0.0 },
        cultural: { traditionalFamily: 0.8, diversity: 0.2, abortion: 0.3, politicalCorrectness: 0.9, secular: 0.5, genderIdentity: 0.0, immigration: 0.0, traditionalValues: 0.8 }
      }
    },
    {
      name: "Hoxhaism",
      beliefs: {
        economic: { redistribution: 1.0, freeTaxes: 0.0, freeMarket: 0.0, regulation: 1.0, healthcare: 1.0, welfare: 0.0, unions: 0.1, privatization: 0.0 },
        authority: { surveillance: 1.0, minimalGov: 0.0, censorship: 1.0, personalFreedom: 0.0, emergency: 1.0, disobedience: 0.0, centralized: 1.0, gunRights: 0.0 },
        cultural: { traditionalFamily: 0.7, diversity: 0.3, abortion: 0.4, politicalCorrectness: 1.0, secular: 1.0, genderIdentity: 0.1, immigration: 0.0, traditionalValues: 0.7 }
      }
    },
    {
      name: "Council Communism",
      beliefs: {
        economic: { redistribution: 0.85, freeTaxes: 0.15, freeMarket: 0.15, regulation: 0.85, healthcare: 0.85, welfare: 0.15, unions: 0.8, privatization: 0.15 },
        authority: { surveillance: 0.6, minimalGov: 0.4, censorship: 0.5, personalFreedom: 0.5, emergency: 0.6, disobedience: 0.4, centralized: 0.5, gunRights: 0.5 },
        cultural: { traditionalFamily: 0.2, diversity: 0.8, abortion: 0.8, politicalCorrectness: 0.6, secular: 0.8, genderIdentity: 0.6, immigration: 0.3, traditionalValues: 0.2 }
      }
    },
    {
      name: "Left Communism",
      beliefs: {
        economic: { redistribution: 0.9, freeTaxes: 0.1, freeMarket: 0.1, regulation: 0.9, healthcare: 0.9, welfare: 0.1, unions: 0.7, privatization: 0.1 },
        authority: { surveillance: 0.65, minimalGov: 0.35, censorship: 0.55, personalFreedom: 0.45, emergency: 0.65, disobedience: 0.35, centralized: 0.6, gunRights: 0.4 },
        cultural: { traditionalFamily: 0.15, diversity: 0.85, abortion: 0.85, politicalCorrectness: 0.6, secular: 0.8, genderIdentity: 0.65, immigration: 0.2, traditionalValues: 0.15 }
      }
    },
    {
      name: "Trotskyism",
      beliefs: {
        economic: { redistribution: 0.9, freeTaxes: 0.1, freeMarket: 0.1, regulation: 0.9, healthcare: 0.9, welfare: 0.1, unions: 0.5, privatization: 0.1 },
        authority: { surveillance: 0.75, minimalGov: 0.25, censorship: 0.65, personalFreedom: 0.35, emergency: 0.75, disobedience: 0.25, centralized: 0.7, gunRights: 0.3 },
        cultural: { traditionalFamily: 0.2, diversity: 0.8, abortion: 0.8, politicalCorrectness: 0.7, secular: 0.85, genderIdentity: 0.5, immigration: 0.2, traditionalValues: 0.15 }
      }
    },
    {
      name: "Marxism-Leninism",
      beliefs: {
        economic: { redistribution: 0.95, freeTaxes: 0.05, freeMarket: 0.05, regulation: 0.95, healthcare: 0.95, welfare: 0.05, unions: 0.3, privatization: 0.05 },
        authority: { surveillance: 0.9, minimalGov: 0.1, censorship: 0.85, personalFreedom: 0.15, emergency: 0.9, disobedience: 0.1, centralized: 0.9, gunRights: 0.1 },
        cultural: { traditionalFamily: 0.5, diversity: 0.5, abortion: 0.6, politicalCorrectness: 0.85, secular: 0.9, genderIdentity: 0.3, immigration: 0.4, traditionalValues: 0.4 }
      }
    }
  ],
  
  'EM-GL': [
    {
      name: "Authoritarian Democracy",
      beliefs: {
        economic: { redistribution: 0.55, freeTaxes: 0.45, freeMarket: 0.55, regulation: 0.65, healthcare: 0.65, welfare: 0.35, unions: 0.2, privatization: 0.6 },
        authority: { surveillance: 0.85, minimalGov: 0.15, censorship: 0.75, personalFreedom: 0.25, emergency: 0.85, disobedience: 0.05, centralized: 0.85, gunRights: 0.15 },
        cultural: { traditionalFamily: 0.7, diversity: 0.3, abortion: 0.35, politicalCorrectness: 0.65, secular: 0.5, genderIdentity: 0.2, immigration: 0.35, traditionalValues: 0.7 }
      }
    },
    {
      name: "Technocracy",
      beliefs: {
        economic: { redistribution: 0.5, freeTaxes: 0.5, freeMarket: 0.6, regulation: 0.6, healthcare: 0.7, welfare: 0.3, unions: 0.2, privatization: 0.6 },
        authority: { surveillance: 0.8, minimalGov: 0.2, censorship: 0.6, personalFreedom: 0.4, emergency: 0.7, disobedience: 0.1, centralized: 0.8, gunRights: 0.1 },
        cultural: { traditionalFamily: 0.4, diversity: 0.6, abortion: 0.6, politicalCorrectness: 0.5, secular: 0.8, genderIdentity: 0.5, immigration: 0.5, traditionalValues: 0.3 }
      }
    },
    {
      name: "State Capitalism",
      beliefs: {
        economic: { redistribution: 0.6, freeTaxes: 0.4, freeMarket: 0.5, regulation: 0.8, healthcare: 0.7, welfare: 0.3, unions: 0.1, privatization: 0.5 },
        authority: { surveillance: 1.0, minimalGov: 0.0, censorship: 1.0, personalFreedom: 0.1, emergency: 0.9, disobedience: 0.0, centralized: 1.0, gunRights: 0.0 },
        cultural: { traditionalFamily: 0.7, diversity: 0.3, abortion: 0.3, politicalCorrectness: 0.7, secular: 0.8, genderIdentity: 0.1, immigration: 0.1, traditionalValues: 0.7 }
      }
    },
    {
      name: "Dirigisme",
      beliefs: {
        economic: { redistribution: 0.6, freeTaxes: 0.4, freeMarket: 0.45, regulation: 0.75, healthcare: 0.75, welfare: 0.25, unions: 0.3, privatization: 0.45 },
        authority: { surveillance: 0.7, minimalGov: 0.3, censorship: 0.6, personalFreedom: 0.4, emergency: 0.7, disobedience: 0.15, centralized: 0.75, gunRights: 0.2 },
        cultural: { traditionalFamily: 0.6, diversity: 0.4, abortion: 0.45, politicalCorrectness: 0.55, secular: 0.65, genderIdentity: 0.35, immigration: 0.4, traditionalValues: 0.55 }
      }
    },
    {
      name: "Peronism",
      beliefs: {
        economic: { redistribution: 0.7, freeTaxes: 0.3, freeMarket: 0.3, regulation: 0.8, healthcare: 0.8, welfare: 0.2, unions: 0.3, privatization: 0.3 },
        authority: { surveillance: 0.8, minimalGov: 0.2, censorship: 0.7, personalFreedom: 0.3, emergency: 0.8, disobedience: 0.1, centralized: 0.8, gunRights: 0.2 },
        cultural: { traditionalFamily: 0.7, diversity: 0.3, abortion: 0.4, politicalCorrectness: 0.6, secular: 0.3, genderIdentity: 0.2, immigration: 0.5, traditionalValues: 0.7 }
      }
    },
    {
      name: "Kemalism",
      beliefs: {
        economic: { redistribution: 0.6, freeTaxes: 0.4, freeMarket: 0.4, regulation: 0.7, healthcare: 0.7, welfare: 0.3, unions: 0.3, privatization: 0.4 },
        authority: { surveillance: 0.7, minimalGov: 0.3, censorship: 0.6, personalFreedom: 0.4, emergency: 0.7, disobedience: 0.2, centralized: 0.8, gunRights: 0.2 },
        cultural: { traditionalFamily: 0.4, diversity: 0.6, abortion: 0.6, politicalCorrectness: 0.5, secular: 0.95, genderIdentity: 0.4, immigration: 0.4, traditionalValues: 0.2 }
      }
    },
    {
      name: "Guided Democracy",
      beliefs: {
        economic: { redistribution: 0.45, freeTaxes: 0.55, freeMarket: 0.65, regulation: 0.55, healthcare: 0.55, welfare: 0.45, unions: 0.15, privatization: 0.65 },
        authority: { surveillance: 0.85, minimalGov: 0.15, censorship: 0.75, personalFreedom: 0.25, emergency: 0.85, disobedience: 0.05, centralized: 0.85, gunRights: 0.15 },
        cultural: { traditionalFamily: 0.75, diversity: 0.25, abortion: 0.35, politicalCorrectness: 0.65, secular: 0.4, genderIdentity: 0.15, immigration: 0.3, traditionalValues: 0.75 }
      }
    },
    {
      name: "Authoritarian Centrism",
      beliefs: {
        economic: { redistribution: 0.5, freeTaxes: 0.5, freeMarket: 0.5, regulation: 0.6, healthcare: 0.6, welfare: 0.4, unions: 0.25, privatization: 0.5 },
        authority: { surveillance: 0.8, minimalGov: 0.2, censorship: 0.7, personalFreedom: 0.3, emergency: 0.8, disobedience: 0.1, centralized: 0.8, gunRights: 0.2 },
        cultural: { traditionalFamily: 0.6, diversity: 0.4, abortion: 0.4, politicalCorrectness: 0.6, secular: 0.5, genderIdentity: 0.25, immigration: 0.4, traditionalValues: 0.6 }
      }
    },
    {
      name: "Bureaucratic Collectivism",
      beliefs: {
        economic: { redistribution: 0.6, freeTaxes: 0.4, freeMarket: 0.4, regulation: 0.7, healthcare: 0.7, welfare: 0.3, unions: 0.2, privatization: 0.4 },
        authority: { surveillance: 0.75, minimalGov: 0.25, censorship: 0.65, personalFreedom: 0.35, emergency: 0.75, disobedience: 0.15, centralized: 0.8, gunRights: 0.25 },
        cultural: { traditionalFamily: 0.75, diversity: 0.25, abortion: 0.25, politicalCorrectness: 0.65, secular: 0.3, genderIdentity: 0.1, immigration: 0.4, traditionalValues: 0.8 }
      }
    }
  ],
  
  'ER-GL': [
    {
      name: "Fascism",
      beliefs: {
        economic: { redistribution: 0.2, freeTaxes: 0.8, freeMarket: 0.6, regulation: 0.3, healthcare: 0.4, welfare: 0.8, unions: 0.1, privatization: 0.85 },
        authority: { surveillance: 0.9, minimalGov: 0.0, censorship: 0.9, personalFreedom: 0.1, emergency: 1.0, disobedience: 0.0, centralized: 1.0, gunRights: 0.2 },
        cultural: { traditionalFamily: 0.9, diversity: 0.1, abortion: 0.2, politicalCorrectness: 0.3, secular: 0.2, genderIdentity: 0.0, immigration: 0.0, traditionalValues: 0.9 }
      }
    },
    {
      name: "Nazism",
      beliefs: {
        economic: { redistribution: 0.3, freeTaxes: 0.7, freeMarket: 0.5, regulation: 0.4, healthcare: 0.5, welfare: 0.7, unions: 0.0, privatization: 0.7 },
        authority: { surveillance: 1.0, minimalGov: 0.0, censorship: 1.0, personalFreedom: 0.0, emergency: 1.0, disobedience: 0.0, centralized: 1.0, gunRights: 0.1 },
        cultural: { traditionalFamily: 0.95, diversity: 0.0, abortion: 0.1, politicalCorrectness: 0.2, secular: 0.3, genderIdentity: 0.0, immigration: 0.0, traditionalValues: 0.95 }
      }
    },
    {
      name: "Francoism",
      beliefs: {
        economic: { redistribution: 0.3, freeTaxes: 0.7, freeMarket: 0.5, regulation: 0.4, healthcare: 0.3, welfare: 0.7, unions: 0.0, privatization: 0.7 },
        authority: { surveillance: 0.85, minimalGov: 0.05, censorship: 0.85, personalFreedom: 0.15, emergency: 0.9, disobedience: 0.0, centralized: 0.9, gunRights: 0.3 },
        cultural: { traditionalFamily: 0.95, diversity: 0.05, abortion: 0.05, politicalCorrectness: 0.4, secular: 0.0, genderIdentity: 0.0, immigration: 0.05, traditionalValues: 0.95 }
      }
    },
    {
      name: "Monarchism",
      beliefs: {
        economic: { redistribution: 0.2, freeTaxes: 0.9, freeMarket: 0.4, regulation: 0.5, healthcare: 0.2, welfare: 0.9, unions: 0.0, privatization: 0.6 },
        authority: { surveillance: 0.7, minimalGov: 0.0, censorship: 0.8, personalFreedom: 0.2, emergency: 0.8, disobedience: 0.0, centralized: 0.95, gunRights: 0.1 },
        cultural: { traditionalFamily: 1.0, diversity: 0.0, abortion: 0.1, politicalCorrectness: 0.5, secular: 0.0, genderIdentity: 0.0, immigration: 0.1, traditionalValues: 1.0 }
      }
    },
    {
      name: "Theocracy",
      beliefs: {
        economic: { redistribution: 0.4, freeTaxes: 0.6, freeMarket: 0.4, regulation: 0.6, healthcare: 0.6, welfare: 0.5, unions: 0.2, privatization: 0.5 },
        authority: { surveillance: 0.95, minimalGov: 0.0, censorship: 0.95, personalFreedom: 0.05, emergency: 0.95, disobedience: 0.0, centralized: 0.9, gunRights: 0.1 },
        cultural: { traditionalFamily: 1.0, diversity: 0.0, abortion: 0.0, politicalCorrectness: 0.8, secular: 0.0, genderIdentity: 0.0, immigration: 0.2, traditionalValues: 1.0 }
      }
    },
    {
      name: "Military Dictatorship",
      beliefs: {
        economic: { redistribution: 0.1, freeTaxes: 0.9, freeMarket: 0.95, regulation: 0.1, healthcare: 0.1, welfare: 0.9, unions: 0.0, privatization: 0.95 },
        authority: { surveillance: 0.95, minimalGov: 0.05, censorship: 0.9, personalFreedom: 0.05, emergency: 0.95, disobedience: 0.0, centralized: 0.85, gunRights: 0.2 },
        cultural: { traditionalFamily: 0.85, diversity: 0.15, abortion: 0.1, politicalCorrectness: 0.7, secular: 0.2, genderIdentity: 0.0, immigration: 0.1, traditionalValues: 0.85 }
      }
    },
    {
      name: "Corporatism",
      beliefs: {
        economic: { redistribution: 0.3, freeTaxes: 0.6, freeMarket: 0.5, regulation: 0.5, healthcare: 0.4, welfare: 0.6, unions: 0.1, privatization: 0.6 },
        authority: { surveillance: 0.8, minimalGov: 0.1, censorship: 0.8, personalFreedom: 0.2, emergency: 0.85, disobedience: 0.0, centralized: 0.85, gunRights: 0.2 },
        cultural: { traditionalFamily: 0.9, diversity: 0.1, abortion: 0.1, politicalCorrectness: 0.6, secular: 0.1, genderIdentity: 0.0, immigration: 0.1, traditionalValues: 0.9 }
      }
    },
    {
      name: "Paternalistic Conservatism",
      beliefs: {
        economic: { redistribution: 0.35, freeTaxes: 0.6, freeMarket: 0.6, regulation: 0.45, healthcare: 0.45, welfare: 0.6, unions: 0.3, privatization: 0.65 },
        authority: { surveillance: 0.65, minimalGov: 0.2, censorship: 0.6, personalFreedom: 0.35, emergency: 0.7, disobedience: 0.15, centralized: 0.7, gunRights: 0.35 },
        cultural: { traditionalFamily: 0.85, diversity: 0.15, abortion: 0.2, politicalCorrectness: 0.7, secular: 0.2, genderIdentity: 0.05, immigration: 0.3, traditionalValues: 0.85 }
      }
    },
    {
      name: "Authoritarian Capitalism",
      beliefs: {
        economic: { redistribution: 0.15, freeTaxes: 0.85, freeMarket: 0.8, regulation: 0.2, healthcare: 0.2, welfare: 0.85, unions: 0.05, privatization: 0.9 },
        authority: { surveillance: 0.9, minimalGov: 0.1, censorship: 0.85, personalFreedom: 0.15, emergency: 0.9, disobedience: 0.0, centralized: 0.85, gunRights: 0.15 },
        cultural: { traditionalFamily: 0.8, diversity: 0.2, abortion: 0.25, politicalCorrectness: 0.65, secular: 0.3, genderIdentity: 0.1, immigration: 0.2, traditionalValues: 0.8 }
      }
    }
  ],
  
  'EL-GM': [
    {
      name: "Democratic Socialism",
      beliefs: {
        economic: { redistribution: 0.9, freeTaxes: 0.1, freeMarket: 0.2, regulation: 0.85, healthcare: 0.95, welfare: 0.15, unions: 0.9, privatization: 0.1 },
        authority: { surveillance: 0.3, minimalGov: 0.4, censorship: 0.2, personalFreedom: 0.8, emergency: 0.4, disobedience: 0.7, centralized: 0.5, gunRights: 0.4 },
        cultural: { traditionalFamily: 0.3, diversity: 0.85, abortion: 0.9, politicalCorrectness: 0.2, secular: 0.8, genderIdentity: 0.85, immigration: 0.15, traditionalValues: 0.2 }
      }
    },
    {
      name: "Social Democracy",
      beliefs: {
        economic: { redistribution: 0.8, freeTaxes: 0.2, freeMarket: 0.3, regulation: 0.75, healthcare: 0.9, welfare: 0.2, unions: 0.85, privatization: 0.2 },
        authority: { surveillance: 0.4, minimalGov: 0.3, censorship: 0.2, personalFreedom: 0.75, emergency: 0.4, disobedience: 0.6, centralized: 0.6, gunRights: 0.3 },
        cultural: { traditionalFamily: 0.3, diversity: 0.8, abortion: 0.85, politicalCorrectness: 0.3, secular: 0.85, genderIdentity: 0.8, immigration: 0.2, traditionalValues: 0.2 }
      }
    },
    {
      name: "Left Populism",
      beliefs: {
        economic: { redistribution: 0.85, freeTaxes: 0.15, freeMarket: 0.15, regulation: 0.8, healthcare: 0.95, welfare: 0.1, unions: 0.95, privatization: 0.05 },
        authority: { surveillance: 0.2, minimalGov: 0.4, censorship: 0.1, personalFreedom: 0.85, emergency: 0.3, disobedience: 0.8, centralized: 0.4, gunRights: 0.4 },
        cultural: { traditionalFamily: 0.25, diversity: 0.9, abortion: 0.9, politicalCorrectness: 0.15, secular: 0.75, genderIdentity: 0.9, immigration: 0.1, traditionalValues: 0.15 }
      }
    },
    {
      name: "Market Socialism",
      beliefs: {
        economic: { redistribution: 0.8, freeTaxes: 0.2, freeMarket: 0.25, regulation: 0.75, healthcare: 0.9, welfare: 0.15, unions: 0.6, privatization: 0.15 },
        authority: { surveillance: 0.45, minimalGov: 0.35, censorship: 0.3, personalFreedom: 0.7, emergency: 0.45, disobedience: 0.55, centralized: 0.55, gunRights: 0.35 },
        cultural: { traditionalFamily: 0.35, diversity: 0.75, abortion: 0.8, politicalCorrectness: 0.3, secular: 0.75, genderIdentity: 0.75, immigration: 0.25, traditionalValues: 0.25 }
      }
    },
    {
      name: "Reformist Socialism",
      beliefs: {
        economic: { redistribution: 0.75, freeTaxes: 0.25, freeMarket: 0.35, regulation: 0.7, healthcare: 0.85, welfare: 0.25, unions: 0.8, privatization: 0.25 },
        authority: { surveillance: 0.4, minimalGov: 0.35, censorship: 0.25, personalFreedom: 0.7, emergency: 0.45, disobedience: 0.55, centralized: 0.55, gunRights: 0.35 },
        cultural: { traditionalFamily: 0.4, diversity: 0.7, abortion: 0.75, politicalCorrectness: 0.35, secular: 0.7, genderIdentity: 0.65, immigration: 0.3, traditionalValues: 0.3 }
      }
    },
    {
      name: "Fabian Socialism",
      beliefs: {
        economic: { redistribution: 0.8, freeTaxes: 0.2, freeMarket: 0.3, regulation: 0.75, healthcare: 0.9, welfare: 0.2, unions: 0.75, privatization: 0.2 },
        authority: { surveillance: 0.45, minimalGov: 0.3, censorship: 0.3, personalFreedom: 0.65, emergency: 0.5, disobedience: 0.5, centralized: 0.6, gunRights: 0.3 },
        cultural: { traditionalFamily: 0.35, diversity: 0.75, abortion: 0.8, politicalCorrectness: 0.35, secular: 0.75, genderIdentity: 0.7, immigration: 0.25, traditionalValues: 0.25 }
      }
    },
    {
      name: "Guild Socialism",
      beliefs: {
        economic: { redistribution: 0.85, freeTaxes: 0.15, freeMarket: 0.2, regulation: 0.8, healthcare: 0.9, welfare: 0.15, unions: 0.95, privatization: 0.1 },
        authority: { surveillance: 0.25, minimalGov: 0.45, censorship: 0.15, personalFreedom: 0.8, emergency: 0.35, disobedience: 0.75, centralized: 0.4, gunRights: 0.45 },
        cultural: { traditionalFamily: 0.3, diversity: 0.8, abortion: 0.85, politicalCorrectness: 0.25, secular: 0.75, genderIdentity: 0.75, immigration: 0.2, traditionalValues: 0.2 }
      }
    },
    {
      name: "Ethical Socialism",
      beliefs: {
        economic: { redistribution: 0.75, freeTaxes: 0.25, freeMarket: 0.3, regulation: 0.7, healthcare: 0.85, welfare: 0.2, unions: 0.7, privatization: 0.25 },
        authority: { surveillance: 0.35, minimalGov: 0.4, censorship: 0.2, personalFreedom: 0.75, emergency: 0.4, disobedience: 0.65, centralized: 0.5, gunRights: 0.4 },
        cultural: { traditionalFamily: 0.25, diversity: 0.85, abortion: 0.85, politicalCorrectness: 0.2, secular: 0.8, genderIdentity: 0.8, immigration: 0.15, traditionalValues: 0.15 }
      }
    },
    {
      name: "Liberal Socialism",
      beliefs: {
        economic: { redistribution: 0.7, freeTaxes: 0.3, freeMarket: 0.35, regulation: 0.65, healthcare: 0.8, welfare: 0.25, unions: 0.65, privatization: 0.3 },
        authority: { surveillance: 0.3, minimalGov: 0.45, censorship: 0.15, personalFreedom: 0.8, emergency: 0.35, disobedience: 0.7, centralized: 0.45, gunRights: 0.5 },
        cultural: { traditionalFamily: 0.3, diversity: 0.8, abortion: 0.85, politicalCorrectness: 0.25, secular: 0.8, genderIdentity: 0.8, immigration: 0.2, traditionalValues: 0.2 }
      }
    }
  ],
  
  'EM-GM': [
    {
      name: "Liberalism",
      beliefs: {
        economic: { redistribution: 0.55, freeTaxes: 0.45, freeMarket: 0.55, regulation: 0.6, healthcare: 0.65, welfare: 0.35, unions: 0.55, privatization: 0.5 },
        authority: { surveillance: 0.45, minimalGov: 0.45, censorship: 0.3, personalFreedom: 0.7, emergency: 0.5, disobedience: 0.5, centralized: 0.5, gunRights: 0.35 },
        cultural: { traditionalFamily: 0.35, diversity: 0.7, abortion: 0.75, politicalCorrectness: 0.35, secular: 0.7, genderIdentity: 0.7, immigration: 0.3, traditionalValues: 0.35 }
      }
    },
    {
      name: "Centrism",
      beliefs: {
        economic: { redistribution: 0.5, freeTaxes: 0.5, freeMarket: 0.5, regulation: 0.5, healthcare: 0.5, welfare: 0.5, unions: 0.5, privatization: 0.5 },
        authority: { surveillance: 0.5, minimalGov: 0.5, censorship: 0.5, personalFreedom: 0.5, emergency: 0.5, disobedience: 0.5, centralized: 0.5, gunRights: 0.5 },
        cultural: { traditionalFamily: 0.5, diversity: 0.5, abortion: 0.5, politicalCorrectness: 0.5, secular: 0.5, genderIdentity: 0.5, immigration: 0.5, traditionalValues: 0.5 }
      }
    },
    {
      name: "Third Way",
      beliefs: {
        economic: { redistribution: 0.55, freeTaxes: 0.45, freeMarket: 0.6, regulation: 0.55, healthcare: 0.65, welfare: 0.35, unions: 0.5, privatization: 0.55 },
        authority: { surveillance: 0.55, minimalGov: 0.35, censorship: 0.35, personalFreedom: 0.65, emergency: 0.55, disobedience: 0.4, centralized: 0.55, gunRights: 0.3 },
        cultural: { traditionalFamily: 0.4, diversity: 0.65, abortion: 0.7, politicalCorrectness: 0.4, secular: 0.65, genderIdentity: 0.6, immigration: 0.35, traditionalValues: 0.4 }
      }
    },
    {
      name: "Social Liberalism",
      beliefs: {
        economic: { redistribution: 0.6, freeTaxes: 0.4, freeMarket: 0.5, regulation: 0.65, healthcare: 0.7, welfare: 0.3, unions: 0.6, privatization: 0.45 },
        authority: { surveillance: 0.4, minimalGov: 0.45, censorship: 0.25, personalFreedom: 0.75, emergency: 0.45, disobedience: 0.55, centralized: 0.5, gunRights: 0.35 },
        cultural: { traditionalFamily: 0.3, diversity: 0.75, abortion: 0.8, politicalCorrectness: 0.3, secular: 0.75, genderIdentity: 0.75, immigration: 0.25, traditionalValues: 0.3 }
      }
    },
    {
      name: "Conservative Liberalism",
      beliefs: {
        economic: { redistribution: 0.45, freeTaxes: 0.55, freeMarket: 0.6, regulation: 0.45, healthcare: 0.5, welfare: 0.45, unions: 0.45, privatization: 0.6 },
        authority: { surveillance: 0.5, minimalGov: 0.4, censorship: 0.35, personalFreedom: 0.65, emergency: 0.5, disobedience: 0.45, centralized: 0.5, gunRights: 0.45 },
        cultural: { traditionalFamily: 0.55, diversity: 0.55, abortion: 0.6, politicalCorrectness: 0.5, secular: 0.6, genderIdentity: 0.5, immigration: 0.45, traditionalValues: 0.55 }
      }
    },
    {
      name: "Radical Centrism",
      beliefs: {
        economic: { redistribution: 0.5, freeTaxes: 0.5, freeMarket: 0.55, regulation: 0.55, healthcare: 0.6, welfare: 0.4, unions: 0.5, privatization: 0.55 },
        authority: { surveillance: 0.45, minimalGov: 0.4, censorship: 0.3, personalFreedom: 0.7, emergency: 0.5, disobedience: 0.5, centralized: 0.5, gunRights: 0.4 },
        cultural: { traditionalFamily: 0.4, diversity: 0.65, abortion: 0.65, politicalCorrectness: 0.4, secular: 0.65, genderIdentity: 0.6, immigration: 0.35, traditionalValues: 0.4 }
      }
    },
    {
      name: "Christian Democracy",
      beliefs: {
        economic: { redistribution: 0.55, freeTaxes: 0.45, freeMarket: 0.55, regulation: 0.6, healthcare: 0.65, welfare: 0.35, unions: 0.55, privatization: 0.5 },
        authority: { surveillance: 0.5, minimalGov: 0.4, censorship: 0.4, personalFreedom: 0.6, emergency: 0.5, disobedience: 0.4, centralized: 0.55, gunRights: 0.35 },
        cultural: { traditionalFamily: 0.65, diversity: 0.5, abortion: 0.45, politicalCorrectness: 0.55, secular: 0.35, genderIdentity: 0.4, immigration: 0.45, traditionalValues: 0.65 }
      }
    },
    {
      name: "Liberal Democracy",
      beliefs: {
        economic: { redistribution: 0.5, freeTaxes: 0.5, freeMarket: 0.55, regulation: 0.55, healthcare: 0.6, welfare: 0.4, unions: 0.55, privatization: 0.55 },
        authority: { surveillance: 0.4, minimalGov: 0.45, censorship: 0.25, personalFreedom: 0.75, emergency: 0.45, disobedience: 0.55, centralized: 0.5, gunRights: 0.4 },
        cultural: { traditionalFamily: 0.35, diversity: 0.7, abortion: 0.7, politicalCorrectness: 0.35, secular: 0.7, genderIdentity: 0.65, immigration: 0.3, traditionalValues: 0.35 }
      }
    },
    {
      name: "Progressive Conservatism",
      beliefs: {
        economic: { redistribution: 0.45, freeTaxes: 0.55, freeMarket: 0.6, regulation: 0.5, healthcare: 0.55, welfare: 0.45, unions: 0.5, privatization: 0.55 },
        authority: { surveillance: 0.5, minimalGov: 0.4, censorship: 0.35, personalFreedom: 0.65, emergency: 0.5, disobedience: 0.4, centralized: 0.5, gunRights: 0.5 },
        cultural: { traditionalFamily: 0.6, diversity: 0.5, abortion: 0.5, politicalCorrectness: 0.55, secular: 0.5, genderIdentity: 0.45, immigration: 0.4, traditionalValues: 0.6 }
      }
    }
  ],
  
  'ER-GM': [
    {
      name: "Conservatism",
      beliefs: {
        economic: { redistribution: 0.2, freeTaxes: 0.85, freeMarket: 0.85, regulation: 0.2, healthcare: 0.25, welfare: 0.75, unions: 0.25, privatization: 0.85 },
        authority: { surveillance: 0.6, minimalGov: 0.35, censorship: 0.4, personalFreedom: 0.6, emergency: 0.6, disobedience: 0.3, centralized: 0.6, gunRights: 0.8 },
        cultural: { traditionalFamily: 0.85, diversity: 0.15, abortion: 0.25, politicalCorrectness: 0.75, secular: 0.25, genderIdentity: 0.2, immigration: 0.6, traditionalValues: 0.85 }
      }
    },
    {
      name: "National Conservatism",
      beliefs: {
        economic: { redistribution: 0.3, freeTaxes: 0.7, freeMarket: 0.7, regulation: 0.35, healthcare: 0.35, welfare: 0.65, unions: 0.3, privatization: 0.7 },
        authority: { surveillance: 0.7, minimalGov: 0.25, censorship: 0.55, personalFreedom: 0.45, emergency: 0.7, disobedience: 0.2, centralized: 0.7, gunRights: 0.65 },
        cultural: { traditionalFamily: 0.9, diversity: 0.1, abortion: 0.15, politicalCorrectness: 0.85, secular: 0.15, genderIdentity: 0.05, immigration: 0.85, traditionalValues: 0.9 }
      }
    },
    {
      name: "Liberal Conservatism",
      beliefs: {
        economic: { redistribution: 0.25, freeTaxes: 0.8, freeMarket: 0.8, regulation: 0.25, healthcare: 0.3, welfare: 0.7, unions: 0.3, privatization: 0.8 },
        authority: { surveillance: 0.5, minimalGov: 0.4, censorship: 0.3, personalFreedom: 0.7, emergency: 0.5, disobedience: 0.35, centralized: 0.55, gunRights: 0.7 },
        cultural: { traditionalFamily: 0.7, diversity: 0.25, abortion: 0.35, politicalCorrectness: 0.65, secular: 0.35, genderIdentity: 0.25, immigration: 0.5, traditionalValues: 0.7 }
      }
    },
    {
      name: "Christian Conservatism",
      beliefs: {
        economic: { redistribution: 0.25, freeTaxes: 0.75, freeMarket: 0.75, regulation: 0.3, healthcare: 0.3, welfare: 0.7, unions: 0.3, privatization: 0.75 },
        authority: { surveillance: 0.6, minimalGov: 0.3, censorship: 0.5, personalFreedom: 0.5, emergency: 0.6, disobedience: 0.25, centralized: 0.6, gunRights: 0.75 },
        cultural: { traditionalFamily: 0.95, diversity: 0.05, abortion: 0.1, politicalCorrectness: 0.8, secular: 0.05, genderIdentity: 0.05, immigration: 0.6, traditionalValues: 0.95 }
      }
    },
    {
      name: "Fiscal Conservatism",
      beliefs: {
        economic: { redistribution: 0.15, freeTaxes: 0.9, freeMarket: 0.9, regulation: 0.15, healthcare: 0.2, welfare: 0.85, unions: 0.2, privatization: 0.9 },
        authority: { surveillance: 0.45, minimalGov: 0.45, censorship: 0.25, personalFreedom: 0.75, emergency: 0.45, disobedience: 0.4, centralized: 0.5, gunRights: 0.75 },
        cultural: { traditionalFamily: 0.6, diversity: 0.35, abortion: 0.5, politicalCorrectness: 0.6, secular: 0.5, genderIdentity: 0.4, immigration: 0.5, traditionalValues: 0.6 }
      }
    },
    {
      name: "Compassionate Conservatism",
      beliefs: {
        economic: { redistribution: 0.3, freeTaxes: 0.7, freeMarket: 0.7, regulation: 0.35, healthcare: 0.35, welfare: 0.6, unions: 0.35, privatization: 0.7 },
        authority: { surveillance: 0.55, minimalGov: 0.35, censorship: 0.35, personalFreedom: 0.65, emergency: 0.55, disobedience: 0.3, centralized: 0.55, gunRights: 0.65 },
        cultural: { traditionalFamily: 0.75, diversity: 0.2, abortion: 0.3, politicalCorrectness: 0.7, secular: 0.3, genderIdentity: 0.2, immigration: 0.55, traditionalValues: 0.75 }
      }
    },
    {
      name: "One-Nation Conservatism",
      beliefs: {
        economic: { redistribution: 0.35, freeTaxes: 0.65, freeMarket: 0.65, regulation: 0.4, healthcare: 0.4, welfare: 0.55, unions: 0.4, privatization: 0.65 },
        authority: { surveillance: 0.55, minimalGov: 0.35, censorship: 0.4, personalFreedom: 0.6, emergency: 0.55, disobedience: 0.3, centralized: 0.6, gunRights: 0.55 },
        cultural: { traditionalFamily: 0.7, diversity: 0.25, abortion: 0.35, politicalCorrectness: 0.65, secular: 0.35, genderIdentity: 0.25, immigration: 0.5, traditionalValues: 0.7 }
      }
    },
    {
      name: "Paternalistic Conservatism",
      beliefs: {
        economic: { redistribution: 0.35, freeTaxes: 0.65, freeMarket: 0.65, regulation: 0.4, healthcare: 0.4, welfare: 0.6, unions: 0.35, privatization: 0.65 },
        authority: { surveillance: 0.6, minimalGov: 0.3, censorship: 0.45, personalFreedom: 0.55, emergency: 0.6, disobedience: 0.25, centralized: 0.65, gunRights: 0.5 },
        cultural: { traditionalFamily: 0.8, diversity: 0.15, abortion: 0.25, politicalCorrectness: 0.7, secular: 0.25, genderIdentity: 0.15, immigration: 0.55, traditionalValues: 0.8 }
      }
    },
    {
      name: "Green Conservatism",
      beliefs: {
        economic: { redistribution: 0.3, freeTaxes: 0.7, freeMarket: 0.7, regulation: 0.35, healthcare: 0.35, welfare: 0.65, unions: 0.35, privatization: 0.7 },
        authority: { surveillance: 0.5, minimalGov: 0.4, censorship: 0.3, personalFreedom: 0.7, emergency: 0.5, disobedience: 0.35, centralized: 0.55, gunRights: 0.6 },
        cultural: { traditionalFamily: 0.65, diversity: 0.3, abortion: 0.4, politicalCorrectness: 0.6, secular: 0.45, genderIdentity: 0.3, immigration: 0.5, traditionalValues: 0.65 }
      }
    }
  ],
  
  'EL-GR': [
    {
      name: "Anarcho-Communism",
      beliefs: {
        economic: { redistribution: 0.9, freeTaxes: 0.0, freeMarket: 0.0, regulation: 0.5, healthcare: 1.0, welfare: 0.0, unions: 0.8, privatization: 0.0 },
        authority: { surveillance: 0.0, minimalGov: 1.0, censorship: 0.0, personalFreedom: 1.0, emergency: 0.0, disobedience: 1.0, centralized: 0.0, gunRights: 0.8 },
        cultural: { traditionalFamily: 0.1, diversity: 0.9, abortion: 0.9, politicalCorrectness: 0.2, secular: 0.8, genderIdentity: 0.9, immigration: 0.0, traditionalValues: 0.0 }
      }
    },
    {
      name: "Anarcho-Syndicalism",
      beliefs: {
        economic: { redistribution: 0.85, freeTaxes: 0.05, freeMarket: 0.1, regulation: 0.6, healthcare: 0.95, welfare: 0.05, unions: 1.0, privatization: 0.05 },
        authority: { surveillance: 0.05, minimalGov: 0.95, censorship: 0.05, personalFreedom: 0.95, emergency: 0.05, disobedience: 0.95, centralized: 0.05, gunRights: 0.75 },
        cultural: { traditionalFamily: 0.15, diversity: 0.85, abortion: 0.85, politicalCorrectness: 0.25, secular: 0.75, genderIdentity: 0.85, immigration: 0.05, traditionalValues: 0.1 }
      }
    },
    {
      name: "Libertarian Socialism",
      beliefs: {
        economic: { redistribution: 0.8, freeTaxes: 0.1, freeMarket: 0.15, regulation: 0.65, healthcare: 0.9, welfare: 0.1, unions: 0.85, privatization: 0.1 },
        authority: { surveillance: 0.1, minimalGov: 0.85, censorship: 0.1, personalFreedom: 0.9, emergency: 0.1, disobedience: 0.85, centralized: 0.1, gunRights: 0.7 },
        cultural: { traditionalFamily: 0.2, diversity: 0.8, abortion: 0.8, politicalCorrectness: 0.3, secular: 0.7, genderIdentity: 0.8, immigration: 0.1, traditionalValues: 0.15 }
      }
    },
    {
      name: "Mutualism",
      beliefs: {
        economic: { redistribution: 0.7, freeTaxes: 0.1, freeMarket: 0.2, regulation: 0.5, healthcare: 0.8, welfare: 0.1, unions: 0.9, privatization: 0.05 },
        authority: { surveillance: 0.05, minimalGov: 0.9, censorship: 0.05, personalFreedom: 0.9, emergency: 0.1, disobedience: 0.85, centralized: 0.05, gunRights: 0.75 },
        cultural: { traditionalFamily: 0.3, diversity: 0.8, abortion: 0.8, politicalCorrectness: 0.3, secular: 0.7, genderIdentity: 0.7, immigration: 0.2, traditionalValues: 0.2 }
      }
    },
    {
      name: "Collectivist Anarchism",
      beliefs: {
        economic: { redistribution: 0.85, freeTaxes: 0.05, freeMarket: 0.05, regulation: 0.55, healthcare: 0.95, welfare: 0.05, unions: 0.85, privatization: 0.0 },
        authority: { surveillance: 0.0, minimalGov: 0.95, censorship: 0.0, personalFreedom: 0.95, emergency: 0.0, disobedience: 0.95, centralized: 0.0, gunRights: 0.8 },
        cultural: { traditionalFamily: 0.15, diversity: 0.85, abortion: 0.85, politicalCorrectness: 0.2, secular: 0.75, genderIdentity: 0.8, immigration: 0.05, traditionalValues: 0.1 }
      }
    },
    {
      name: "Green Anarchism",
      beliefs: {
        economic: { redistribution: 0.9, freeTaxes: 0.0, freeMarket: 0.0, regulation: 0.4, healthcare: 1.0, welfare: 0.0, unions: 0.7, privatization: 0.0 },
        authority: { surveillance: 0.0, minimalGov: 1.0, censorship: 0.0, personalFreedom: 1.0, emergency: 0.0, disobedience: 1.0, centralized: 0.0, gunRights: 0.7 },
        cultural: { traditionalFamily: 0.05, diversity: 0.95, abortion: 0.9, politicalCorrectness: 0.15, secular: 0.7, genderIdentity: 0.9, immigration: 0.0, traditionalValues: 0.0 }
      }
    },
    {
      name: "Anarcha-Feminism",
      beliefs: {
        economic: { redistribution: 0.85, freeTaxes: 0.0, freeMarket: 0.0, regulation: 0.5, healthcare: 1.0, welfare: 0.0, unions: 0.8, privatization: 0.0 },
        authority: { surveillance: 0.0, minimalGov: 1.0, censorship: 0.0, personalFreedom: 1.0, emergency: 0.0, disobedience: 1.0, centralized: 0.0, gunRights: 0.6 },
        cultural: { traditionalFamily: 0.0, diversity: 0.95, abortion: 1.0, politicalCorrectness: 0.1, secular: 0.8, genderIdentity: 1.0, immigration: 0.0, traditionalValues: 0.0 }
      }
    },
    {
      name: "Social Anarchism",
      beliefs: {
        economic: { redistribution: 0.8, freeTaxes: 0.05, freeMarket: 0.1, regulation: 0.55, healthcare: 0.9, welfare: 0.05, unions: 0.85, privatization: 0.05 },
        authority: { surveillance: 0.05, minimalGov: 0.95, censorship: 0.05, personalFreedom: 0.95, emergency: 0.05, disobedience: 0.9, centralized: 0.05, gunRights: 0.7 },
        cultural: { traditionalFamily: 0.1, diversity: 0.9, abortion: 0.85, politicalCorrectness: 0.2, secular: 0.75, genderIdentity: 0.85, immigration: 0.05, traditionalValues: 0.05 }
      }
    },
    {
      name: "Platformism",
      beliefs: {
        economic: { redistribution: 0.85, freeTaxes: 0.05, freeMarket: 0.1, regulation: 0.6, healthcare: 0.9, welfare: 0.05, unions: 0.9, privatization: 0.05 },
        authority: { surveillance: 0.1, minimalGov: 0.85, censorship: 0.1, personalFreedom: 0.85, emergency: 0.15, disobedience: 0.8, centralized: 0.15, gunRights: 0.7 },
        cultural: { traditionalFamily: 0.2, diversity: 0.8, abortion: 0.8, politicalCorrectness: 0.25, secular: 0.7, genderIdentity: 0.75, immigration: 0.1, traditionalValues: 0.15 }
      }
    }
  ],
  
  'EM-GR': [
    {
      name: "Classical Liberalism",
      beliefs: {
        economic: { redistribution: 0.35, freeTaxes: 0.7, freeMarket: 0.75, regulation: 0.35, healthcare: 0.4, welfare: 0.5, unions: 0.6, privatization: 0.7 },
        authority: { surveillance: 0.15, minimalGov: 0.75, censorship: 0.05, personalFreedom: 0.95, emergency: 0.2, disobedience: 0.75, centralized: 0.25, gunRights: 0.65 },
        cultural: { traditionalFamily: 0.35, diversity: 0.8, abortion: 0.75, politicalCorrectness: 0.2, secular: 0.8, genderIdentity: 0.7, immigration: 0.25, traditionalValues: 0.25 }
      }
    },
    {
      name: "Minarchism",
      beliefs: {
        economic: { redistribution: 0.1, freeTaxes: 0.85, freeMarket: 0.9, regulation: 0.15, healthcare: 0.2, welfare: 0.8, unions: 0.5, privatization: 0.85 },
        authority: { surveillance: 0.15, minimalGov: 0.85, censorship: 0.05, personalFreedom: 0.9, emergency: 0.15, disobedience: 0.75, centralized: 0.15, gunRights: 0.85 },
        cultural: { traditionalFamily: 0.45, diversity: 0.65, abortion: 0.7, politicalCorrectness: 0.25, secular: 0.75, genderIdentity: 0.6, immigration: 0.25, traditionalValues: 0.35 }
      }
    },
    {
      name: "Georgism",
      beliefs: {
        economic: { redistribution: 0.7, freeTaxes: 0.8, freeMarket: 0.85, regulation: 0.3, healthcare: 0.4, welfare: 0.3, unions: 0.6, privatization: 0.7 },
        authority: { surveillance: 0.2, minimalGov: 0.8, censorship: 0.1, personalFreedom: 0.9, emergency: 0.2, disobedience: 0.7, centralized: 0.3, gunRights: 0.7 },
        cultural: { traditionalFamily: 0.5, diversity: 0.7, abortion: 0.6, politicalCorrectness: 0.3, secular: 0.7, genderIdentity: 0.6, immigration: 0.3, traditionalValues: 0.4 }
      }
    },
    {
      name: "Bleeding-Heart Libertarianism",
      beliefs: {
        economic: { redistribution: 0.4, freeTaxes: 0.65, freeMarket: 0.7, regulation: 0.4, healthcare: 0.45, welfare: 0.45, unions: 0.65, privatization: 0.65 },
        authority: { surveillance: 0.2, minimalGov: 0.75, censorship: 0.1, personalFreedom: 0.85, emergency: 0.25, disobedience: 0.7, centralized: 0.25, gunRights: 0.6 },
        cultural: { traditionalFamily: 0.25, diversity: 0.85, abortion: 0.8, politicalCorrectness: 0.15, secular: 0.8, genderIdentity: 0.8, immigration: 0.15, traditionalValues: 0.2 }
      }
    },
    {
      name: "Civil Libertarianism",
      beliefs: {
        economic: { redistribution: 0.45, freeTaxes: 0.6, freeMarket: 0.65, regulation: 0.45, healthcare: 0.5, welfare: 0.4, unions: 0.6, privatization: 0.6 },
        authority: { surveillance: 0.05, minimalGov: 0.85, censorship: 0.0, personalFreedom: 0.95, emergency: 0.1, disobedience: 0.85, centralized: 0.2, gunRights: 0.75 },
        cultural: { traditionalFamily: 0.3, diversity: 0.8, abortion: 0.85, politicalCorrectness: 0.15, secular: 0.85, genderIdentity: 0.8, immigration: 0.2, traditionalValues: 0.2 }
      }
    },
    {
      name: "Neoclassical Liberalism",
      beliefs: {
        economic: { redistribution: 0.3, freeTaxes: 0.75, freeMarket: 0.8, regulation: 0.3, healthcare: 0.35, welfare: 0.6, unions: 0.5, privatization: 0.75 },
        authority: { surveillance: 0.25, minimalGov: 0.7, censorship: 0.15, personalFreedom: 0.8, emergency: 0.3, disobedience: 0.65, centralized: 0.3, gunRights: 0.6 },
        cultural: { traditionalFamily: 0.4, diversity: 0.7, abortion: 0.7, politicalCorrectness: 0.3, secular: 0.7, genderIdentity: 0.65, immigration: 0.3, traditionalValues: 0.35 }
      }
    },
    {
      name: "Ordoliberalism",
      beliefs: {
        economic: { redistribution: 0.35, freeTaxes: 0.7, freeMarket: 0.75, regulation: 0.35, healthcare: 0.45, welfare: 0.5, unions: 0.55, privatization: 0.7 },
        authority: { surveillance: 0.3, minimalGov: 0.65, censorship: 0.2, personalFreedom: 0.75, emergency: 0.35, disobedience: 0.6, centralized: 0.35, gunRights: 0.55 },
        cultural: { traditionalFamily: 0.5, diversity: 0.6, abortion: 0.6, politicalCorrectness: 0.4, secular: 0.65, genderIdentity: 0.55, immigration: 0.35, traditionalValues: 0.45 }
      }
    },
    {
      name: "Libertarian Paternalism",
      beliefs: {
        economic: { redistribution: 0.4, freeTaxes: 0.65, freeMarket: 0.7, regulation: 0.4, healthcare: 0.5, welfare: 0.45, unions: 0.55, privatization: 0.65 },
        authority: { surveillance: 0.35, minimalGov: 0.6, censorship: 0.25, personalFreedom: 0.7, emergency: 0.4, disobedience: 0.55, centralized: 0.4, gunRights: 0.5 },
        cultural: { traditionalFamily: 0.4, diversity: 0.65, abortion: 0.65, politicalCorrectness: 0.35, secular: 0.65, genderIdentity: 0.6, immigration: 0.35, traditionalValues: 0.4 }
      }
    },
    {
      name: "Liberal Libertarianism",
      beliefs: {
        economic: { redistribution: 0.45, freeTaxes: 0.6, freeMarket: 0.65, regulation: 0.45, healthcare: 0.5, welfare: 0.4, unions: 0.6, privatization: 0.6 },
        authority: { surveillance: 0.15, minimalGov: 0.8, censorship: 0.05, personalFreedom: 0.9, emergency: 0.2, disobedience: 0.75, centralized: 0.2, gunRights: 0.7 },
        cultural: { traditionalFamily: 0.25, diversity: 0.8, abortion: 0.8, politicalCorrectness: 0.2, secular: 0.8, genderIdentity: 0.75, immigration: 0.2, traditionalValues: 0.2 }
      }
    }
  ],
  
  'ER-GR': [
    {
      name: "Anarcho-Capitalism",
      beliefs: {
        economic: { redistribution: 0.0, freeTaxes: 1.0, freeMarket: 1.0, regulation: 0.0, healthcare: 0.0, welfare: 1.0, unions: 0.3, privatization: 1.0 },
        authority: { surveillance: 0.0, minimalGov: 1.0, censorship: 0.0, personalFreedom: 1.0, emergency: 0.0, disobedience: 1.0, centralized: 0.0, gunRights: 1.0 },
        cultural: { traditionalFamily: 0.5, diversity: 0.5, abortion: 0.5, politicalCorrectness: 0.7, secular: 0.8, genderIdentity: 0.5, immigration: 0.3, traditionalValues: 0.5 }
      }
    },
    {
      name: "Libertarianism",
      beliefs: {
        economic: { redistribution: 0.1, freeTaxes: 0.9, freeMarket: 0.9, regulation: 0.1, healthcare: 0.1, welfare: 0.85, unions: 0.4, privatization: 0.9 },
        authority: { surveillance: 0.1, minimalGov: 0.85, censorship: 0.05, personalFreedom: 0.9, emergency: 0.1, disobedience: 0.8, centralized: 0.1, gunRights: 0.9 },
        cultural: { traditionalFamily: 0.5, diversity: 0.6, abortion: 0.6, politicalCorrectness: 0.6, secular: 0.7, genderIdentity: 0.55, immigration: 0.3, traditionalValues: 0.45 }
      }
    },
    {
      name: "Objectivism",
      beliefs: {
        economic: { redistribution: 0.0, freeTaxes: 1.0, freeMarket: 1.0, regulation: 0.0, healthcare: 0.0, welfare: 1.0, unions: 0.1, privatization: 1.0 },
        authority: { surveillance: 0.1, minimalGov: 0.9, censorship: 0.0, personalFreedom: 1.0, emergency: 0.0, disobedience: 0.9, centralized: 0.1, gunRights: 0.9 },
        cultural: { traditionalFamily: 0.3, diversity: 0.5, abortion: 0.9, politicalCorrectness: 0.9, secular: 0.95, genderIdentity: 0.5, immigration: 0.1, traditionalValues: 0.1 }
      }
    },
    {
      name: "Paleolibertarianism",
      beliefs: {
        economic: { redistribution: 0.0, freeTaxes: 1.0, freeMarket: 1.0, regulation: 0.0, healthcare: 0.0, welfare: 1.0, unions: 0.2, privatization: 1.0 },
        authority: { surveillance: 0.0, minimalGov: 1.0, censorship: 0.0, personalFreedom: 0.9, emergency: 0.0, disobedience: 0.95, centralized: 0.0, gunRights: 1.0 },
        cultural: { traditionalFamily: 0.85, diversity: 0.2, abortion: 0.3, politicalCorrectness: 0.9, secular: 0.4, genderIdentity: 0.1, immigration: 0.05, traditionalValues: 0.85 }
      }
    },
    {
      name: "Right-Libertarianism",
      beliefs: {
        economic: { redistribution: 0.05, freeTaxes: 0.95, freeMarket: 0.95, regulation: 0.05, healthcare: 0.05, welfare: 0.9, unions: 0.3, privatization: 0.95 },
        authority: { surveillance: 0.05, minimalGov: 0.9, censorship: 0.05, personalFreedom: 0.95, emergency: 0.05, disobedience: 0.85, centralized: 0.05, gunRights: 0.95 },
        cultural: { traditionalFamily: 0.55, diversity: 0.55, abortion: 0.55, politicalCorrectness: 0.7, secular: 0.65, genderIdentity: 0.45, immigration: 0.25, traditionalValues: 0.5 }
      }
    },
    {
      name: "Voluntaryism",
      beliefs: {
        economic: { redistribution: 0.0, freeTaxes: 1.0, freeMarket: 1.0, regulation: 0.0, healthcare: 0.0, welfare: 1.0, unions: 0.4, privatization: 1.0 },
        authority: { surveillance: 0.0, minimalGov: 1.0, censorship: 0.0, personalFreedom: 1.0, emergency: 0.0, disobedience: 1.0, centralized: 0.0, gunRights: 1.0 },
        cultural: { traditionalFamily: 0.45, diversity: 0.6, abortion: 0.65, politicalCorrectness: 0.65, secular: 0.75, genderIdentity: 0.6, immigration: 0.2, traditionalValues: 0.4 }
      }
    },
    {
      name: "Agorism",
      beliefs: {
        economic: { redistribution: 0.0, freeTaxes: 1.0, freeMarket: 1.0, regulation: 0.0, healthcare: 0.0, welfare: 1.0, unions: 0.5, privatization: 1.0 },
        authority: { surveillance: 0.0, minimalGov: 1.0, censorship: 0.0, personalFreedom: 1.0, emergency: 0.0, disobedience: 1.0, centralized: 0.0, gunRights: 0.9 },
        cultural: { traditionalFamily: 0.3, diversity: 0.7, abortion: 0.7, politicalCorrectness: 0.6, secular: 0.8, genderIdentity: 0.7, immigration: 0.1, traditionalValues: 0.2 }
      }
    },
    {
      name: "Propertarianism",
      beliefs: {
        economic: { redistribution: 0.0, freeTaxes: 1.0, freeMarket: 1.0, regulation: 0.0, healthcare: 0.0, welfare: 1.0, unions: 0.15, privatization: 1.0 },
        authority: { surveillance: 0.05, minimalGov: 0.95, censorship: 0.05, personalFreedom: 0.9, emergency: 0.05, disobedience: 0.85, centralized: 0.05, gunRights: 1.0 },
        cultural: { traditionalFamily: 0.7, diversity: 0.3, abortion: 0.4, politicalCorrectness: 0.8, secular: 0.5, genderIdentity: 0.2, immigration: 0.1, traditionalValues: 0.7 }
      }
    },
    {
      name: "Neo-Libertarianism",
      beliefs: {
        economic: { redistribution: 0.1, freeTaxes: 0.85, freeMarket: 0.85, regulation: 0.15, healthcare: 0.15, welfare: 0.8, unions: 0.35, privatization: 0.85 },
        authority: { surveillance: 0.2, minimalGov: 0.75, censorship: 0.1, personalFreedom: 0.85, emergency: 0.2, disobedience: 0.7, centralized: 0.2, gunRights: 0.8 },
        cultural: { traditionalFamily: 0.5, diversity: 0.6, abortion: 0.65, politicalCorrectness: 0.65, secular: 0.7, genderIdentity: 0.55, immigration: 0.35, traditionalValues: 0.45 }
      }
    }
  ]
};

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
    } else if (text.includes('military') && text.includes('defense')) {
      // Military spending - right-auth strongly support, left opposes
      baseAnswer = beliefs.economic.privatization * 0.7 + beliefs.authority.centralized * 0.3;
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
    } else if (text.includes('police') && text.includes('enforcement')) {
      // Police power - auth strongly support, lib oppose
      baseAnswer = beliefs.authority.surveillance * 0.8 + beliefs.authority.centralized * 0.2;
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
    } else if (text.includes('patriotism') || text.includes('national pride')) {
      // Patriotism - nationalists strongly support, progressives oppose
      baseAnswer = beliefs.cultural.traditionalValues * 0.7 + (1 - beliefs.cultural.diversity) * 0.3;
    } else if (text.includes('permissive') || text.includes('moral')) {
      baseAnswer = beliefs.cultural.traditionalValues;
    } else if (text.includes('historical injustice')) {
      baseAnswer = 1 - beliefs.cultural.traditionalValues;
    }
  }
  
  // Add realistic variation
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

// Check if tiebreaker is needed based on proximity to boundaries
function needsTiebreaker(scores) {
  const BOUNDARY_DISTANCE = 15; // Within 15 points of ±33 boundary
  
  // Check if within 15 points of economic boundaries (-33 or +33)
  const econNearBoundary = 
    (scores.economic >= -48 && scores.economic <= -18) || // Near -33
    (scores.economic >= 18 && scores.economic <= 48);     // Near +33
  
  // Check if within 15 points of authority boundaries (-33 or +33)
  const authNearBoundary = 
    (scores.social >= -48 && scores.social <= -18) || // Near -33
    (scores.social >= 18 && scores.social <= 48);     // Near +33
  
  return econNearBoundary || authNearBoundary;
}

// Main test
async function testAll81Ideologies() {
  console.log('🌐 Testing ALL 81 Political Ideologies\n');
  console.log('Tiebreaker Logic: Triggers within ±15 of macro cell borders (±33)\n');
  
  const questions = await loadActualQuestions();
  const gridData = await loadIdeologyGrid();
  
  const results = {
    total: 0,
    success: 0,
    failure: 0,
    tiebreakers: 0,
    byCell: {}
  };
  
  // Initialize cell tracking
  for (const cell of Object.keys(ALL_81_IDEOLOGIES)) {
    results.byCell[cell] = { total: 0, success: 0, failures: [] };
  }
  
  // Test each macro cell
  for (const [macroCell, ideologies] of Object.entries(ALL_81_IDEOLOGIES)) {
    console.log(`\n${'═'.repeat(70)}`);
    console.log(`TESTING ${macroCell} (${ideologies.length} ideologies)`);
    console.log(`${'═'.repeat(70)}\n`);
    
    for (const ideology of ideologies) {
      results.total++;
      results.byCell[macroCell].total++;
      
      // Answer questions
      const answers = [];
      questions.forEach(q => {
        answers.push(personaAnswer(ideology.beliefs, q));
      });
      
      // Calculate scores
      const scores = calculateScores(answers, questions);
      const actualCell = getMacroCell(scores.economic, scores.social);
      const success = actualCell === macroCell;
      
      // Check tiebreaker
      const needsTie = needsTiebreaker(scores);
      if (needsTie) results.tiebreakers++;
      
      // Display result
      const icon = success ? '✅' : '❌';
      const tieIcon = needsTie ? '⚖️' : '';
      
      console.log(`${icon} ${ideology.name} ${tieIcon}`);
      console.log(`   E:${scores.economic.toFixed(1)} A:${scores.social.toFixed(1)} C:${scores.cultural.toFixed(1)} → ${actualCell}`);
      
      if (needsTie) {
        const details = [];
        if (scores.economic >= -48 && scores.economic <= -18) details.push(`Econ near -33 (${scores.economic.toFixed(1)})`);
        if (scores.economic >= 18 && scores.economic <= 48) details.push(`Econ near +33 (${scores.economic.toFixed(1)})`);
        if (scores.social >= -48 && scores.social <= -18) details.push(`Auth near -33 (${scores.social.toFixed(1)})`);
        if (scores.social >= 18 && scores.social <= 48) details.push(`Auth near +33 (${scores.social.toFixed(1)})`);
        console.log(`   ⚖️  Tiebreaker: ${details.join(', ')}`);
      }
      
      if (success) {
        results.success++;
        results.byCell[macroCell].success++;
      } else {
        results.failure++;
        results.byCell[macroCell].failures.push(ideology.name);
        console.log(`   ⚠️  Expected ${macroCell}, got ${actualCell}`);
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
  console.log(`Ideologies triggering tiebreakers: ${results.tiebreakers} (${(results.tiebreakers/results.total*100).toFixed(1)}%)`);
  console.log(`Tiebreaker zones: -48 to -18 and +18 to +48 on each axis\n`);
  
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
  
  console.log('\n💡 Key Insights:');
  console.log('- Tiebreakers trigger within ±15 of boundaries (not center)');
  console.log('- This catches ideologies near macro cell borders');
  console.log('- Phase 2 questions differentiate within each cell');
  console.log('- Subtle differences between ideologies require Phase 2');
}

// Run the test
testAll81Ideologies().catch(console.error);