type PoliticalAxis = 'economic' | 'social';

export interface Question {
  id: number;
  question: string;
  axis: PoliticalAxis;
}

// 50 neutral political questions balanced between economic and social axes
// Questions are designed to be unbiased while covering the full political spectrum
export const allQuestions: Question[] = [
  // ECONOMIC QUESTIONS (25 total)
  {
    id: 1,
    question: "High-income earners should pay significantly higher tax rates than middle-income earners.",
    axis: 'economic'
  },
  {
    id: 2,
    question: "The government should invest heavily in renewable energy infrastructure.",
    axis: 'economic'
  },
  {
    id: 3,
    question: "Workers should have the right to form unions and collectively bargain for wages.",
    axis: 'economic'
  },
  {
    id: 4,
    question: "The minimum wage should be increased to ensure full-time workers can afford basic living expenses.",
    axis: 'economic'
  },
  {
    id: 5,
    question: "Healthcare should be provided by the government as a public service.",
    axis: 'economic'
  },
  {
    id: 6,
    question: "Student loan debt should be forgiven or significantly reduced through government intervention.",
    axis: 'economic'
  },
  {
    id: 7,
    question: "Large corporations should be broken up to prevent monopolistic practices.",
    axis: 'economic'
  },
  {
    id: 8,
    question: "The government should provide universal basic income to all citizens.",
    axis: 'economic'
  },
  {
    id: 9,
    question: "Wealthy individuals should face restrictions on political campaign contributions.",
    axis: 'economic'
  },
  {
    id: 10,
    question: "Private property ownership is essential for economic prosperity.",
    axis: 'economic'
  },
  {
    id: 11,
    question: "Free trade agreements generally benefit national economies.",
    axis: 'economic'
  },
  {
    id: 12,
    question: "The government should regulate prices for essential goods during emergencies.",
    axis: 'economic'
  },
  {
    id: 13,
    question: "Economic inequality is primarily the result of differences in individual effort and ability.",
    axis: 'economic'
  },
  {
    id: 14,
    question: "Government spending should prioritize infrastructure over tax cuts.",
    axis: 'economic'
  },
  {
    id: 15,
    question: "Banks and financial institutions require more government oversight.",
    axis: 'economic'
  },
  {
    id: 16,
    question: "Small businesses should receive tax advantages over large corporations.",
    axis: 'economic'
  },
  {
    id: 17,
    question: "The government should guarantee employment for all citizens willing to work.",
    axis: 'economic'
  },
  {
    id: 18,
    question: "International economic cooperation is more beneficial than economic nationalism.",
    axis: 'economic'
  },
  {
    id: 19,
    question: "Inheritance taxes help reduce wealth concentration across generations.",
    axis: 'economic'
  },
  {
    id: 20,
    question: "Market competition naturally leads to fair pricing and innovation.",
    axis: 'economic'
  },
  {
    id: 21,
    question: "Government subsidies for renewable energy are necessary for climate progress.",
    axis: 'economic'
  },
  {
    id: 22,
    question: "Cryptocurrency should be regulated similarly to traditional financial instruments.",
    axis: 'economic'
  },
  {
    id: 23,
    question: "Public transportation should be funded primarily through government investment.",
    axis: 'economic'
  },
  {
    id: 24,
    question: "Economic growth should be prioritized over environmental protection when they conflict.",
    axis: 'economic'
  },
  {
    id: 25,
    question: "Social safety nets reduce people's motivation to work and be self-reliant.",
    axis: 'economic'
  },

  // SOCIAL QUESTIONS (25 total)
  {
    id: 26,
    question: "Government agencies should monitor online communications to prevent terrorism.",
    axis: 'social'
  },
  {
    id: 27,
    question: "Social media platforms should be required to remove content deemed harmful or misleading.",
    axis: 'social'
  },
  {
    id: 28,
    question: "Law enforcement funding should be reduced in favor of community social services.",
    axis: 'social'
  },
  {
    id: 29,
    question: "Firearms ownership should be subject to extensive background checks and licensing.",
    axis: 'social'
  },
  {
    id: 30,
    question: "Educational curricula should include comprehensive coverage of historical injustices.",
    axis: 'social'
  },
  {
    id: 31,
    question: "Adults should be free to make personal choices about their own bodies without government interference.",
    axis: 'social'
  },
  {
    id: 32,
    question: "Organizations should actively work to increase diversity in their hiring practices.",
    axis: 'social'
  },
  {
    id: 33,
    question: "National security concerns justify some limitations on individual privacy rights.",
    axis: 'social'
  },
  {
    id: 34,
    question: "Religious institutions should be exempt from laws that conflict with their beliefs.",
    axis: 'social'
  },
  {
    id: 35,
    question: "Immigration levels should be determined primarily by economic labor needs.",
    axis: 'social'
  },
  {
    id: 36,
    question: "Traditional family structures provide the best environment for raising children.",
    axis: 'social'
  },
  {
    id: 37,
    question: "Hate speech should be legally prohibited even if it limits free expression.",
    axis: 'social'
  },
  {
    id: 38,
    question: "Cultural assimilation should be encouraged for immigrants to promote social cohesion.",
    axis: 'social'
  },
  {
    id: 39,
    question: "Government should remain neutral in matters of personal morality and lifestyle choices.",
    axis: 'social'
  },
  {
    id: 40,
    question: "Schools should teach standardized moral values shared by the broader community.",
    axis: 'social'
  },
  {
    id: 41,
    question: "Peaceful protest is an essential right that should rarely be restricted.",
    axis: 'social'
  },
  {
    id: 42,
    question: "Society benefits when people maintain strong connections to their cultural heritage.",
    axis: 'social'
  },
  {
    id: 43,
    question: "Government surveillance programs help protect citizens from criminal activity.",
    axis: 'social'
  },
  {
    id: 44,
    question: "Local communities should have the authority to establish their own social norms and rules.",
    axis: 'social'
  },
  {
    id: 45,
    question: "International cooperation is more important than maintaining national sovereignty.",
    axis: 'social'
  },
  {
    id: 46,
    question: "Scientific consensus should guide government policy even when it conflicts with popular opinion.",
    axis: 'social'
  },
  {
    id: 47,
    question: "Individual merit should be the primary factor in college admissions and job hiring.",
    axis: 'social'
  },
  {
    id: 48,
    question: "Social order requires some people to have authority over others.",
    axis: 'social'
  },
  {
    id: 49,
    question: "Drug use should be treated as a health issue rather than a criminal justice issue.",
    axis: 'social'
  },
  {
    id: 50,
    question: "Maintaining social stability is more important than rapid social change.",
    axis: 'social'
  }
];

// Short quiz: 10 questions (5 economic, 5 social)
export const shortQuestions: Question[] = [
  allQuestions[0],  // Tax rates
  allQuestions[4],  // Healthcare
  allQuestions[3],  // Minimum wage
  allQuestions[10], // Free trade
  allQuestions[19], // Market competition
  allQuestions[25], // Surveillance
  allQuestions[28], // Gun control
  allQuestions[30], // Personal choices
  allQuestions[36], // Hate speech
  allQuestions[40]  // Peaceful protest
];

// Long quiz uses all 50 questions
export const longQuestions: Question[] = allQuestions;