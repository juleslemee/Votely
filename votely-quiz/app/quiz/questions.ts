type PoliticalAxis = 'economic' | 'authority' | 'cultural';

export interface Question {
  id: number;
  question: string;
  axis: PoliticalAxis;
}

// 50 balanced political questions across economic, authority, and cultural axes
// Questions are designed to be neutral while covering the full political spectrum
export const allQuestions: Question[] = [
  // ECONOMIC QUESTIONS (16 total) - 8 left, 8 right
  {
    id: 1,
    question: "High-income earners should pay a much larger percentage of their income in taxes than everyone else.",
    axis: 'economic'
  },
  {
    id: 2,
    question: "Healthcare should be provided free of charge by the government to all people.",
    axis: 'economic'
  },
  {
    id: 3,
    question: "Labor unions are necessary to protect workers' rights and should be supported.",
    axis: 'economic'
  },
  {
    id: 4,
    question: "Strong government regulation of businesses is necessary to protect consumers and workers.",
    axis: 'economic'
  },
  {
    id: 5,
    question: "Ensuring affordable housing for all citizens is a responsibility of the government.",
    axis: 'economic'
  },
  {
    id: 6,
    question: "The government should actively redistribute wealth from the rich to the poor to create a more equal society.",
    axis: 'economic'
  },
  {
    id: 7,
    question: "Protecting the environment should be prioritized even at the cost of economic growth.",
    axis: 'economic'
  },
  {
    id: 8,
    question: "Employees should have an ownership stake or say in the companies they work for.",
    axis: 'economic'
  },
  {
    id: 9,
    question: "Lowering taxes for businesses and individuals is the best way to encourage economic growth.",
    axis: 'economic'
  },
  {
    id: 10,
    question: "Private companies can provide services like healthcare and education more efficiently than the government.",
    axis: 'economic'
  },
  {
    id: 11,
    question: "Generous social welfare programs can reduce people's incentive to work.",
    axis: 'economic'
  },
  {
    id: 12,
    question: "Too much government regulation of business stifles economic growth and innovation.",
    axis: 'economic'
  },
  {
    id: 13,
    question: "Economic inequality is not a problem as long as there is equality of opportunity.",
    axis: 'economic'
  },
  {
    id: 14,
    question: "Free-market capitalism is the best economic system, despite any imperfections.",
    axis: 'economic'
  },
  {
    id: 15,
    question: "Tariffs and import restrictions are necessary to protect domestic industries.",
    axis: 'economic'
  },
  {
    id: 16,
    question: "Implementing socialist policies would only harm the economy.",
    axis: 'economic'
  },

  // AUTHORITY QUESTIONS (17 total) - 8 libertarian, 9 authoritarian
  {
    id: 17,
    question: "Government surveillance of citizens' communications is acceptable if it prevents crime and terrorism.",
    axis: 'authority'
  },
  {
    id: 18,
    question: "The government should be able to censor speech or media that it considers dangerous or extremist.",
    axis: 'authority'
  },
  {
    id: 19,
    question: "In a national emergency, it is acceptable for the government to suspend some normal legal rights.",
    axis: 'authority'
  },
  {
    id: 20,
    question: "Criminals who commit serious crimes deserve harsh punishments, not rehabilitation.",
    axis: 'authority'
  },
  {
    id: 21,
    question: "A strong, centralized government is necessary to maintain order in society.",
    axis: 'authority'
  },
  {
    id: 22,
    question: "People should always obey the law, even if they feel it is unjust.",
    axis: 'authority'
  },
  {
    id: 23,
    question: "Government policy should follow the advice of qualified experts, even if it goes against popular opinion.",
    axis: 'authority'
  },
  {
    id: 24,
    question: "Every citizen should be required to serve in the military or perform national service for at least a year.",
    axis: 'authority'
  },
  {
    id: 25,
    question: "Individuals should be free to make their own lifestyle choices as long as they do not harm others.",
    axis: 'authority'
  },
  {
    id: 26,
    question: "The government should have as little involvement in citizens' lives as possible.",
    axis: 'authority'
  },
  {
    id: 27,
    question: "Local communities should have more power to govern themselves and less oversight from the central government.",
    axis: 'authority'
  },
  {
    id: 28,
    question: "People have the right to disobey laws they find unjust.",
    axis: 'authority'
  },
  {
    id: 29,
    question: "Law-abiding citizens should be able to own firearms without heavy restrictions.",
    axis: 'authority'
  },
  {
    id: 30,
    question: "The government should not enforce any moral or cultural values on individuals.",
    axis: 'authority'
  },
  {
    id: 31,
    question: "If the government violates the people's rights, the people have the right to overthrow it.",
    axis: 'authority'
  },
  {
    id: 32,
    question: "In an ideal society, communities could manage themselves without any centralized government.",
    axis: 'authority'
  },

  // CULTURAL QUESTIONS (17 total) - 9 conservative, 8 progressive  
  {
    id: 33,
    question: "Consensual acts that do not harm others (such as adult sex work) should not be outlawed.",
    axis: 'authority'
  },

  // CULTURAL QUESTIONS (17 total) - 9 conservative, 8 progressive
  {
    id: 34,
    question: "Children are best off when raised by a married mother and father in the same household.",
    axis: 'cultural'
  },
  {
    id: 35,
    question: "Immigration into our country should be strictly limited to protect our national culture and economy.",
    axis: 'cultural'
  },
  {
    id: 36,
    question: "It is more important to preserve traditional values and ways of life than to adopt new social changes.",
    axis: 'cultural'
  },
  {
    id: 37,
    question: "It's important for citizens to be proud of their country's history and heritage.",
    axis: 'cultural'
  },
  {
    id: 38,
    question: "Maintaining our national sovereignty should be prioritized over working with international organizations.",
    axis: 'cultural'
  },
  {
    id: 39,
    question: "Political correctness has gone too far, to the point where people are afraid to speak their minds.",
    axis: 'cultural'
  },
  {
    id: 40,
    question: "Society has become too permissive and would be better off if we returned to more traditional standards of morality.",
    axis: 'cultural'
  },
  {
    id: 41,
    question: "A diverse society with many cultures, religions, and identities is a strength for a nation.",
    axis: 'cultural'
  },
  {
    id: 42,
    question: "Laws and policies should not be influenced by any religion; the government needs to stay secular.",
    axis: 'cultural'
  },
  {
    id: 43,
    question: "Policies like affirmative action are necessary to help correct historical inequalities.",
    axis: 'cultural'
  },
  {
    id: 44,
    question: "Society should accept people's gender identities, even if they differ from their birth sex.",
    axis: 'cultural'
  },
  {
    id: 45,
    question: "Women should have the right to choose an abortion without government interference.",
    axis: 'cultural'
  },
  {
    id: 46,
    question: "The death penalty should be abolished in all cases.",
    axis: 'cultural'
  },
  {
    id: 47,
    question: "People should avoid adopting elements of other cultures in ways that are disrespectful or insensitive.",
    axis: 'cultural'
  },
  {
    id: 48,
    question: "Drug use should be treated as a public health issue (with education and treatment) rather than a criminal one.",
    axis: 'cultural'
  },
  {
    id: 49,
    question: "Schools should teach students about the historical injustices committed by our country.",
    axis: 'cultural'
  },
  {
    id: 50,
    question: "Maintaining social stability is more important than rapid social change.",
    axis: 'cultural'
  }
];

// Short quiz: 10 questions mixed across axes for engagement
export const shortQuestions: Question[] = [
  allQuestions[3],  // ID 4 - Strong government regulation (economic left)
  allQuestions[16], // ID 17 - Government surveillance (authority authoritarian)
  allQuestions[40], // ID 41 - Diversity strength (cultural progressive)
  allQuestions[8],  // ID 9 - Tax cuts for growth (economic right)
  allQuestions[25], // ID 26 - Limited government involvement (authority libertarian)
  allQuestions[5],  // ID 6 - Wealth redistribution (economic left)
  allQuestions[17], // ID 18 - Government censorship (authority authoritarian)
  allQuestions[33], // ID 34 - Traditional family values (cultural conservative)
  allQuestions[13], // ID 14 - Free-market capitalism (economic right)
  allQuestions[44]  // ID 45 - Abortion rights (cultural progressive)
];

// Long quiz: all 50 questions in mixed order to keep users engaged
export const longQuestions: Question[] = [
  allQuestions[0],  // ID 1 - Economic
  allQuestions[16], // ID 17 - Authority
  allQuestions[33], // ID 34 - Cultural
  allQuestions[8],  // ID 9 - Economic
  allQuestions[24], // ID 25 - Authority
  allQuestions[40], // ID 41 - Cultural
  allQuestions[1],  // ID 2 - Economic
  allQuestions[17], // ID 18 - Authority
  allQuestions[34], // ID 35 - Cultural
  allQuestions[9],  // ID 10 - Economic
  allQuestions[25], // ID 26 - Authority
  allQuestions[41], // ID 42 - Cultural
  allQuestions[2],  // ID 3 - Economic
  allQuestions[18], // ID 19 - Authority
  allQuestions[35], // ID 36 - Cultural
  allQuestions[10], // ID 11 - Economic
  allQuestions[26], // ID 27 - Authority
  allQuestions[42], // ID 43 - Cultural
  allQuestions[3],  // ID 4 - Economic
  allQuestions[19], // ID 20 - Authority
  allQuestions[36], // ID 37 - Cultural
  allQuestions[11], // ID 12 - Economic
  allQuestions[27], // ID 28 - Authority
  allQuestions[43], // ID 44 - Cultural
  allQuestions[4],  // ID 5 - Economic
  allQuestions[20], // ID 21 - Authority
  allQuestions[37], // ID 38 - Cultural
  allQuestions[12], // ID 13 - Economic
  allQuestions[28], // ID 29 - Authority
  allQuestions[44], // ID 45 - Cultural
  allQuestions[5],  // ID 6 - Economic
  allQuestions[21], // ID 22 - Authority
  allQuestions[38], // ID 39 - Cultural
  allQuestions[13], // ID 14 - Economic
  allQuestions[29], // ID 30 - Authority
  allQuestions[45], // ID 46 - Cultural
  allQuestions[6],  // ID 7 - Economic
  allQuestions[22], // ID 23 - Authority
  allQuestions[39], // ID 40 - Cultural
  allQuestions[14], // ID 15 - Economic
  allQuestions[30], // ID 31 - Authority
  allQuestions[46], // ID 47 - Cultural
  allQuestions[7],  // ID 8 - Economic
  allQuestions[23], // ID 24 - Authority
  allQuestions[47], // ID 48 - Cultural
  allQuestions[15], // ID 16 - Economic
  allQuestions[31], // ID 32 - Authority
  allQuestions[48], // ID 49 - Cultural
  allQuestions[32], // ID 33 - Authority
  allQuestions[49]  // ID 50 - Cultural
];