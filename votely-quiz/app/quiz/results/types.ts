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
  axis: 'economic' | 'social';
  agreeDirection: 'left' | 'right' | 'libertarian' | 'authoritarian';
}

export const QUESTION_CONFIG: QuestionConfig[] = [
  { id: 1, axis: 'economic', agreeDirection: 'left' }, // Billionaire tax
  { id: 2, axis: 'economic', agreeDirection: 'left' }, // Climate action
  { id: 3, axis: 'social', agreeDirection: 'libertarian' }, // Police funding
  { id: 4, axis: 'economic', agreeDirection: 'left' }, // Student debt
  { id: 5, axis: 'economic', agreeDirection: 'left' }, // Healthcare
  { id: 6, axis: 'social', agreeDirection: 'libertarian' }, // History education
  { id: 7, axis: 'social', agreeDirection: 'authoritarian' }, // Social media
  { id: 8, axis: 'social', agreeDirection: 'authoritarian' }, // Gun control
  { id: 9, axis: 'economic', agreeDirection: 'left' }, // Minimum wage
  { id: 10, axis: 'social', agreeDirection: 'libertarian' }, // DEI
  { id: 11, axis: 'social', agreeDirection: 'libertarian' }, // Global cooperation
  { id: 12, axis: 'social', agreeDirection: 'libertarian' }, // Personal choices
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