export type QuadrantType = 'PROGRESSIVE_IDEALIST' | 'SYSTEM_REFORMER' | 'FREEDOM_SEEKER' | 'CONSERVATIVE_GUARDIAN';

export interface QuadrantInfo {
  type: QuadrantType;
  title: string;
  emoji: string;
  description: string;
  gradient: {
    from: string;
    to: string;
  };
}


// Question scoring configuration
export interface QuestionConfig {
  id: number;
  axis: 'economic' | 'authority' | 'cultural';
  agreeDirection: 'left' | 'right' | 'libertarian' | 'authoritarian' | 'progressive' | 'conservative';
}

export const QUESTION_CONFIG: QuestionConfig[] = [
  // ECONOMIC QUESTIONS (16 total) - IDs 1-16
  { id: 1, axis: 'economic', agreeDirection: 'left' }, // Progressive taxation
  { id: 2, axis: 'economic', agreeDirection: 'left' }, // Government healthcare
  { id: 3, axis: 'economic', agreeDirection: 'left' }, // Labor unions
  { id: 4, axis: 'economic', agreeDirection: 'left' }, // Business regulation
  { id: 5, axis: 'economic', agreeDirection: 'left' }, // Government housing
  { id: 6, axis: 'economic', agreeDirection: 'left' }, // Wealth redistribution
  { id: 7, axis: 'economic', agreeDirection: 'left' }, // Environment over growth
  { id: 8, axis: 'economic', agreeDirection: 'left' }, // Worker ownership
  { id: 9, axis: 'economic', agreeDirection: 'right' }, // Tax cuts
  { id: 10, axis: 'economic', agreeDirection: 'right' }, // Privatization
  { id: 11, axis: 'economic', agreeDirection: 'right' }, // Welfare concerns
  { id: 12, axis: 'economic', agreeDirection: 'right' }, // Regulation burden
  { id: 13, axis: 'economic', agreeDirection: 'right' }, // Economic inequality acceptance
  { id: 14, axis: 'economic', agreeDirection: 'right' }, // Free market capitalism
  { id: 15, axis: 'economic', agreeDirection: 'right' }, // Trade protectionism
  { id: 16, axis: 'economic', agreeDirection: 'right' }, // Anti-socialism

  // AUTHORITY QUESTIONS (17 total) - IDs 17-33
  { id: 17, axis: 'authority', agreeDirection: 'authoritarian' }, // Government surveillance
  { id: 18, axis: 'authority', agreeDirection: 'authoritarian' }, // Government censorship
  { id: 19, axis: 'authority', agreeDirection: 'authoritarian' }, // Emergency powers
  { id: 20, axis: 'authority', agreeDirection: 'authoritarian' }, // Harsh punishment
  { id: 21, axis: 'authority', agreeDirection: 'authoritarian' }, // Centralized government
  { id: 22, axis: 'authority', agreeDirection: 'authoritarian' }, // Law obedience
  { id: 23, axis: 'authority', agreeDirection: 'authoritarian' }, // Expert governance
  { id: 24, axis: 'authority', agreeDirection: 'authoritarian' }, // Mandatory service
  { id: 25, axis: 'authority', agreeDirection: 'libertarian' }, // Personal freedom
  { id: 26, axis: 'authority', agreeDirection: 'libertarian' }, // Limited government
  { id: 27, axis: 'authority', agreeDirection: 'libertarian' }, // Local governance
  { id: 28, axis: 'authority', agreeDirection: 'libertarian' }, // Civil disobedience
  { id: 29, axis: 'authority', agreeDirection: 'libertarian' }, // Gun rights
  { id: 30, axis: 'authority', agreeDirection: 'libertarian' }, // Moral freedom
  { id: 31, axis: 'authority', agreeDirection: 'libertarian' }, // Right to revolt
  { id: 32, axis: 'authority', agreeDirection: 'libertarian' }, // Anarchism
  { id: 33, axis: 'authority', agreeDirection: 'libertarian' }, // Victimless crimes

  // CULTURAL QUESTIONS (17 total) - IDs 34-50
  { id: 34, axis: 'cultural', agreeDirection: 'conservative' }, // Traditional family
  { id: 35, axis: 'cultural', agreeDirection: 'conservative' }, // Immigration limits
  { id: 36, axis: 'cultural', agreeDirection: 'conservative' }, // Traditional values
  { id: 37, axis: 'cultural', agreeDirection: 'conservative' }, // National pride
  { id: 38, axis: 'cultural', agreeDirection: 'conservative' }, // National sovereignty
  { id: 39, axis: 'cultural', agreeDirection: 'conservative' }, // Political correctness
  { id: 40, axis: 'cultural', agreeDirection: 'conservative' }, // Traditional morality
  { id: 41, axis: 'cultural', agreeDirection: 'progressive' }, // Diversity strength
  { id: 42, axis: 'cultural', agreeDirection: 'progressive' }, // Secularism
  { id: 43, axis: 'cultural', agreeDirection: 'progressive' }, // Affirmative action
  { id: 44, axis: 'cultural', agreeDirection: 'progressive' }, // Gender identity
  { id: 45, axis: 'cultural', agreeDirection: 'progressive' }, // Reproductive rights
  { id: 46, axis: 'cultural', agreeDirection: 'progressive' }, // Death penalty abolition
  { id: 47, axis: 'cultural', agreeDirection: 'progressive' }, // Cultural appropriation
  { id: 48, axis: 'cultural', agreeDirection: 'progressive' }, // Drug health approach
  { id: 49, axis: 'cultural', agreeDirection: 'progressive' }, // Historical awareness
  { id: 50, axis: 'cultural', agreeDirection: 'conservative' }, // Social stability
];

// Scoring constants
export const ANSWER_SCORES = {
  1: -2, // Strongly Disagree
  2: -1, // Disagree
  3: 0,  // Neutral
  4: 1,  // Agree
  5: 2,  // Strongly Agree
} as const;

// Maximum possible scores (number of questions * max points per question)
export const MAX_ECONOMIC_SCORE = 10; // 5 questions * 2 points
export const MAX_SOCIAL_SCORE = 14;   // 7 questions * 2 points

// Normalize scores to -100 to 100 range
export function normalizeScore(score: number, maxScore: number): number {
  return (score / maxScore) * 100;
}

export interface Position {
  x: number;
  y: number;
}

export interface Alignment {
  label: string;
  description: string;
  realIdeologies: string;
  usExamples: string;
  xRange: [number, number];
  yRange: [number, number];
  additionalCondition?: (x: number, y: number) => boolean;
}

// Convert -100..100 to -10..10
export function toVisionScale(value: number): number {
  return (value / 100) * 10;
}

export const alignments: Alignment[] = [
  {
    label: "Revolutionary Socialist",
    description: "Believes equality must be achieved through organized state action and revolution.",
    realIdeologies: "Marxist-Leninism",
    usExamples: "Historic USSR, Cuban Revolution sympathizers",
    xRange: [-10, -5],
    yRange: [5, 10]
  },
  {
    label: "Welfare Commander",
    description: "Believes a strong welfare state and regulation can ensure fairness.",
    realIdeologies: "State Socialism",
    usExamples: "Bernie Sanders (economic ideas, but democratic leaning)",
    xRange: [-5, 0],
    yRange: [5, 10]
  },
  {
    label: "Homeland Defender",
    description: "Believes in preserving national culture, values, and strong leadership.",
    realIdeologies: "National Conservatism",
    usExamples: "Donald Trump (NatCon movement), Brexit supporters",
    xRange: [0, 5],
    yRange: [5, 10]
  },
  {
    label: "Order-First Conservative",
    description: "Believes tradition, hierarchy, and national strength are critical.",
    realIdeologies: "Fascism-lite",
    usExamples: "Hard-right authoritarian populists in Europe",
    xRange: [5, 10],
    yRange: [5, 10]
  },
  {
    label: "Structured Progressive",
    description: "Supports systemic reforms within existing frameworks to create equity.",
    realIdeologies: "Democratic Socialism (authoritarian-leaning)",
    usExamples: "Elizabeth Warren (milder version), AOC (left-wing establishment reform)",
    xRange: [-10, -5],
    yRange: [0, 5]
  },
  {
    label: "People's Advocate",
    description: "Favors populist social programs combined with strong leadership.",
    realIdeologies: "Populist Socialism",
    usExamples: "Chávez-inspired Latin American populists",
    xRange: [-5, 0],
    yRange: [0, 5],
    additionalCondition: (x, y) => Math.abs(x) + Math.abs(y) > 2.5
  },
  {
    label: "Structured Capitalist",
    description: "Supports corporate activity guided by state direction for societal benefit.",
    realIdeologies: "Corporatism",
    usExamples: "Italy's corporatist period under Mussolini (economic system only)",
    xRange: [0, 5],
    yRange: [0, 5],
    additionalCondition: (x, y) => Math.abs(x) + Math.abs(y) > 2.5
  },
  {
    label: "Tradition Capitalist",
    description: "Defends traditional markets while emphasizing moral hierarchy.",
    realIdeologies: "Reactionary Capitalism",
    usExamples: "Economic Nationalists in US Right (e.g. Bannonites)",
    xRange: [5, 10],
    yRange: [0, 5]
  },
  {
    label: "Cooperative Dreamer",
    description: "Believes true freedom is collective — without bosses or centralized states.",
    realIdeologies: "Libertarian Socialism",
    usExamples: "Grassroots socialism, Occupy Wall Street radicals",
    xRange: [-10, -5],
    yRange: [-5, 0]
  },
  {
    label: "Collective Rebel",
    description: "Advocates for workers controlling production through unions and grassroots action.",
    realIdeologies: "Anarcho-Syndicalism",
    usExamples: "Union-led worker movements, grassroots labor organizing",
    xRange: [-5, 0],
    yRange: [-5, 0],
    additionalCondition: (x, y) => Math.abs(x) + Math.abs(y) > 2.5
  },
  {
    label: "Underground Organizer",
    description: "Pushes for counter-economic strategies to undermine state dominance.",
    realIdeologies: "Agorism",
    usExamples: "Crypto-anarchist movements, underground economic activism",
    xRange: [0, 5],
    yRange: [-5, 0],
    additionalCondition: (x, y) => Math.abs(x) + Math.abs(y) > 2.5
  },
  {
    label: "Freedom Entrepreneur",
    description: "Favors absolute free markets with little to no government interference.",
    realIdeologies: "Market Anarchism",
    usExamples: "Libertarian-leaning entrepreneurs, crypto-libertarians",
    xRange: [5, 10],
    yRange: [-5, 0]
  },
  {
    label: "Localist Organizer",
    description: "Supports decentralized local economies and self-management.",
    realIdeologies: "Mutualism",
    usExamples: "Local food co-ops, decentralization movements",
    xRange: [-10, -5],
    yRange: [-10, -5]
  },
  {
    label: "Green Radical",
    description: "Combines environmental action with critiques of capitalism.",
    realIdeologies: "Eco-Socialism",
    usExamples: "Green New Deal radicals, Extinction Rebellion supporters",
    xRange: [-5, 0],
    yRange: [-10, -5]
  },
  {
    label: "Minimalist Libertarian",
    description: "Wants a minimal state focused only on basic protection (police, courts, military).",
    realIdeologies: "Minarchism",
    usExamples: "Ron Paul, small-government libertarians",
    xRange: [0, 5],
    yRange: [-10, -5]
  },
  {
    label: "Radical Capitalist",
    description: "Believes government should not exist at all; total voluntary exchange.",
    realIdeologies: "Anarcho-Capitalism",
    usExamples: "Radical libertarians, Silicon Valley anarcho-capitalists",
    xRange: [5, 10],
    yRange: [-10, -5]
  },
  {
    label: "Pragmatic Moderate",
    description: "Prefers pragmatic, flexible solutions over rigid ideologies.",
    realIdeologies: "Radical Centrism / Social Liberalism",
    usExamples: "Mainstream moderates, Third Way Democrats, pragmatic centrists",
    xRange: [-2.5, 2.5],
    yRange: [-2.5, 2.5],
    additionalCondition: (x, y) => Math.abs(x) + Math.abs(y) <= 2.5
  }
];

// Find the closest alignment based on -10..10 scale and Vision logic
export function findVisionAlignment(economicScore: number, socialScore: number): Alignment {
  // economicScore and socialScore are expected to be in -10..10
  for (const alignment of alignments) {
    const inX = economicScore >= alignment.xRange[0] && economicScore <= alignment.xRange[1];
    const inY = socialScore >= alignment.yRange[0] && socialScore <= alignment.yRange[1];
    const cond = alignment.additionalCondition ? alignment.additionalCondition(economicScore, socialScore) : true;
    if (inX && inY && cond) return alignment;
  }
  return alignments[0];
}