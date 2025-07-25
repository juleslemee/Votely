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
    description: "Capitalism isn't just flawed in your view: it's fundamentally broken. Only collective ownership can deliver real justice, and you're ready for the systemic change that requires, even if it means tearing down what exists.",
    realIdeologies: "Marxist-Leninism",
    usExamples: "Historic USSR, Cuban Revolution sympathizers",
    xRange: [-10, -5],
    yRange: [5, 10]
  },
  {
    label: "Welfare Commander",
    description: "Markets fail people, but government can fix that. Nordic-style socialism speaks to you: high taxes funding strong safety nets, with regulation that actually puts people before profits.",
    realIdeologies: "State Socialism",
    usExamples: "Bernie Sanders (economic ideas, but democratic leaning)",
    xRange: [-5, 0],
    yRange: [5, 10]
  },
  {
    label: "Homeland Defender",
    description: "Globalization has gone too far, threatening both national identity and working families. What resonates with you: strong borders, traditional values, and leaders who genuinely put country first.",
    realIdeologies: "National Conservatism",
    usExamples: "Donald Trump (NatCon movement), Brexit supporters",
    xRange: [0, 5],
    yRange: [5, 10]
  },
  {
    label: "Order-First Conservative",
    description: "Chaos surrounds us, and only strong leadership can restore sanity. Traditional hierarchies didn't emerge by accident: they serve important purposes. Society needs structure, not endless questioning of authority.",
    realIdeologies: "Fascism-lite",
    usExamples: "Hard-right authoritarian populists in Europe",
    xRange: [5, 10],
    yRange: [5, 10]
  },
  {
    label: "Structured Progressive",
    description: "Major reforms are needed, but democracy is the way to get them. The system has serious flaws, yet it's fixable with smart policies, competent experts, and the political will to take on entrenched interests.",
    realIdeologies: "Democratic Socialism (authoritarian-leaning)",
    usExamples: "Elizabeth Warren (milder version), AOC (left-wing establishment reform)",
    xRange: [-10, -5],
    yRange: [0, 5]
  },
  {
    label: "People's Advocate",
    description: "Working-class anger needs a voice, and economic populism is the answer. The elites have rigged this game, which is why we need leaders who'll actually fight for ordinary people instead of Wall Street.",
    realIdeologies: "Populist Socialism",
    usExamples: "Chávez-inspired Latin American populists",
    xRange: [-5, 0],
    yRange: [0, 5],
    additionalCondition: (x, y) => Math.abs(x) + Math.abs(y) > 2.5
  },
  {
    label: "Structured Capitalist",
    description: "Markets need smart guidance to reach their potential. Government and business should work together building national strength. Pure laissez-faire economics is just as naive as pure socialism.",
    realIdeologies: "Corporatism",
    usExamples: "Italy's corporatist period under Mussolini (economic system only)",
    xRange: [0, 5],
    yRange: [0, 5],
    additionalCondition: (x, y) => Math.abs(x) + Math.abs(y) > 2.5
  },
  {
    label: "Tradition Capitalist",
    description: "Free markets and timeless values both deserve defending. Real success flows from hard work paired with moral discipline. When we abandon what our ancestors built, society inevitably declines.",
    realIdeologies: "Reactionary Capitalism",
    usExamples: "Economic Nationalists in US Right (e.g. Bannonites)",
    xRange: [5, 10],
    yRange: [0, 5]
  },
  {
    label: "Cooperative Dreamer",
    description: "Picture communities organizing themselves with no bosses, no bureaucrats. That's true freedom: collective self-management where people cooperate as equals rather than compete as rivals.",
    realIdeologies: "Libertarian Socialism",
    usExamples: "Grassroots socialism, Occupy Wall Street radicals",
    xRange: [-10, -5],
    yRange: [-5, 0]
  },
  {
    label: "Collective Rebel",
    description: "Workers should run the factories. Communities should govern themselves. Unions and direct action, not politicians and CEOs, will build the world we actually need.",
    realIdeologies: "Anarcho-Syndicalism",
    usExamples: "Union-led worker movements, grassroots labor organizing",
    xRange: [-5, 0],
    yRange: [-5, 0],
    additionalCondition: (x, y) => Math.abs(x) + Math.abs(y) > 2.5
  },
  {
    label: "Underground Organizer",
    description: "The system won't reform itself, so build alternatives: crypto networks, black markets, parallel institutions. When the state won't leave people alone, help them route around it entirely.",
    realIdeologies: "Agorism",
    usExamples: "Crypto-anarchist movements, underground economic activism",
    xRange: [0, 5],
    yRange: [-5, 0],
    additionalCondition: (x, y) => Math.abs(x) + Math.abs(y) > 2.5
  },
  {
    label: "Freedom Entrepreneur",
    description: "Every regulation represents chains on human potential. Markets solve problems while governments create them. Simply let people trade freely and prosperity will bloom.",
    realIdeologies: "Market Anarchism",
    usExamples: "Libertarian-leaning entrepreneurs, crypto-libertarians",
    xRange: [5, 10],
    yRange: [-5, 0]
  },
  {
    label: "Localist Organizer",
    description: "Neighbors deserve more trust than nations ever will. Small-scale, face-to-face democracy actually works. Communities should manage their own affairs without distant bureaucrats interfering.",
    realIdeologies: "Mutualism",
    usExamples: "Local food co-ops, decentralization movements",
    xRange: [-10, -5],
    yRange: [-10, -5]
  },
  {
    label: "Green Radical",
    description: "Capitalism is literally cooking the planet. Real environmentalism demands dismantling these growth-obsessed systems and building sustainable communities that respect natural limits.",
    realIdeologies: "Eco-Socialism",
    usExamples: "Green New Deal radicals, Extinction Rebellion supporters",
    xRange: [-5, 0],
    yRange: [-10, -5]
  },
  {
    label: "Minimalist Libertarian",
    description: "Government should stick to the basics: courts, cops, and defense. Everything else works better through voluntary associations, private charity, and genuine free markets.",
    realIdeologies: "Minarchism",
    usExamples: "Ron Paul, small-government libertarians",
    xRange: [0, 5],
    yRange: [-10, -5]
  },
  {
    label: "Radical Capitalist",
    description: "Why have government at all? Private property, voluntary contracts, and market competition can handle every function the state claims to serve, including courts and police.",
    realIdeologies: "Anarcho-Capitalism",
    usExamples: "Radical libertarians, Silicon Valley anarcho-capitalists",
    xRange: [5, 10],
    yRange: [-10, -5]
  },
  {
    label: "Pragmatic Moderate",
    description: "Pragmatic solutions beat rigid ideologies every time. Evidence trumps theory. The sensible approach: fix what's broken, keep what works, and adapt as circumstances change.",
    realIdeologies: "Radical Centrism / Social Liberalism",
    usExamples: "Mainstream moderates, Third Way Democrats, pragmatic centrists",
    xRange: [-2.5, 2.5],
    yRange: [-2.5, 2.5],
    additionalCondition: (x, y) => Math.abs(x) + Math.abs(y) <= 2.5
  }
];

// Find the closest alignment based on -10..10 scale and Vision logic
export function findVisionAlignment(economicScore: number, socialScore: number, culturalScore: number = 0): Alignment {
  // economicScore and socialScore are expected to be in -10..10
  let baseAlignment: Alignment = alignments[0];
  
  for (const alignment of alignments) {
    const inX = economicScore >= alignment.xRange[0] && economicScore <= alignment.xRange[1];
    const inY = socialScore >= alignment.yRange[0] && socialScore <= alignment.yRange[1];
    const cond = alignment.additionalCondition ? alignment.additionalCondition(economicScore, socialScore) : true;
    if (inX && inY && cond) {
      baseAlignment = alignment;
      break;
    }
  }
  
  // Add cultural modifiers for strong cultural leanings
  const culturalThreshold = 4; // Strong cultural lean threshold
  if (Math.abs(culturalScore) >= culturalThreshold) {
    const modifiedAlignment = { ...baseAlignment };
    
    // Ideology-specific cultural spins
    const culturalSpins: Record<string, { progressive: { sublabel: string, description: string }, conservative: { sublabel: string, description: string } }> = {
      'Revolutionary Socialist': {
        progressive: {
          sublabel: 'Intersectional Focus',
          description: 'You see capitalism as fundamentally broken and believe only collective ownership can deliver justice. Your focus on intersectional liberation means dismantling all forms of oppression simultaneously.'
        },
        conservative: {
          sublabel: 'Communitarian Focus', 
          description: 'You see capitalism as fundamentally broken and believe only collective ownership can deliver justice. You emphasize traditional community bonds and cultural continuity within socialist structures.'
        }
      },
      'Welfare Commander': {
        progressive: {
          sublabel: 'Social Justice Emphasis',
          description: 'You trust government to fix market failures and protect the vulnerable. Your progressive approach prioritizes expanding rights and dismantling systemic inequalities through policy.'
        },
        conservative: {
          sublabel: 'Family Values Emphasis',
          description: 'You trust government to fix market failures and protect the vulnerable. Your traditional values focus on strengthening working families and preserving community institutions.'
        }
      },
      'Homeland Defender': {
        progressive: {
          sublabel: 'Environmental Nationalism',
          description: 'You believe globalization threatens national identity and working families. Your environmental focus channels nationalism toward protecting the homeland from climate threats and corporate exploitation.'
        },
        conservative: {
          sublabel: 'Cultural Preservation',
          description: 'You believe globalization threatens national identity and working families. Your traditional values emphasize preserving heritage, customs, and moral foundations against foreign influence.'
        }
      },
      'Freedom Entrepreneur': {
        progressive: {
          sublabel: 'Social Liberty Focus',
          description: 'You see every regulation as chains on human potential. Your progressive values emphasize personal autonomy in lifestyle choices while maintaining strong free-market principles.'
        },
        conservative: {
          sublabel: 'Constitutional Markets',
          description: 'You see every regulation as chains on human potential. Your traditional values ground free markets in constitutional principles and moral entrepreneurship.'
        }
      },
      'Minimalist Libertarian': {
        progressive: {
          sublabel: 'Civil Rights Focus',
          description: 'You want government doing only the basics: courts, cops, and defense. Your progressive instincts focus on protecting individual rights from both state and social conformity pressures.'
        },
        conservative: {
          sublabel: 'Constitutional Originalist',
          description: 'You want government doing only the basics: courts, cops, and defense. Your traditional values emphasize returning to constitutional foundations and time-tested governance principles.'
        }
      },
      'Pragmatic Moderate': {
        progressive: {
          sublabel: 'Reform-Minded',
          description: 'You prefer pragmatic, flexible solutions over rigid ideologies. Your progressive lean means supporting gradual social change through evidence-based reforms and inclusive institutions.'
        },
        conservative: {
          sublabel: 'Stability-Focused',
          description: 'You prefer pragmatic, flexible solutions over rigid ideologies. Your traditional values favor cautious, incremental change that preserves stability while addressing genuine problems.'
        }
      }
    };
    
    const spin = culturalSpins[baseAlignment.label];
    if (spin) {
      const culturalDirection = culturalScore < -culturalThreshold ? 'progressive' : 'conservative';
      modifiedAlignment.label = `${baseAlignment.label}: ${spin[culturalDirection].sublabel}`;
      modifiedAlignment.description = spin[culturalDirection].description;
    }
    
    return modifiedAlignment;
  }
  
  return baseAlignment;
}