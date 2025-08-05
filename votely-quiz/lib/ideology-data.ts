// Ideology data extracted from grid details TSV
// This provides dynamic alignment and surprise text based on political position

export interface IdeologyInfo {
  ideology: string;
  friendlyLabel: string;
  explanation: string;
  examples: string;
  alignIdeology1: string;
  alignIdeology1Text: string;
  alignIdeology2: string;
  alignIdeology2Text: string;
  surpriseIdeology1: string;
  surpriseIdeology1Text: string;
  surpriseIdeology2: string;
  surpriseIdeology2Text: string;
}

// Map ideology names to their detailed information
export const ideologyData: Record<string, IdeologyInfo> = {
  "Bolshevik Marxism": {
    ideology: "Bolshevik Marxism",
    friendlyLabel: "Revolutionary Socialist",
    explanation: "Believes only a revolution led by a strong, disciplined party can fully overthrow capitalism and create a socialist society. Gradual reforms or popular protests are seen as inadequate. Only by seizing state power and transforming economic structures through a centralized movement can a true socialist order be built and defended from counterrevolution.",
    examples: "Lenin's Bolsheviks in the 1917 Russian Revolution created the first lasting communist state, showing how a disciplined revolutionary party could seize power. Their model shaped the 20th century left, and even today, some tiny communist parties in the West cite this period as their historical inspiration.",
    alignIdeology1: "Trotskyism",
    alignIdeology1Text: "Bolshevik Marxism and Trotskyism share a deep commitment to revolution as the means to destroy capitalism and reshape society under worker control.",
    alignIdeology2: "Maoism",
    alignIdeology2Text: "Bolshevik Marxism and Maoism both rely on disciplined parties to lead transformation, differing mainly in whether peasants or urban workers are the key force.",
    surpriseIdeology1: "Civic Conservatism",
    surpriseIdeology1Text: "The two share a belief that shared values keep communities together, even if they imagine very different kinds of order.",
    surpriseIdeology2: "Objectivism",
    surpriseIdeology2Text: "Both reject passivity and insist society must be reshaped intentionally, though they differ on the end goal."
  },
  "Democratic Socialism": {
    ideology: "Democratic Socialism",
    friendlyLabel: "Ballot-Box Socialist",
    explanation: "Seeks to achieve socialist principles like public ownership and extensive welfare gradually through democratic elections instead of violent revolution. Promotes reforms and social programs while respecting institutions and avoiding authoritarian control. Frames democracy as a vehicle for socialism, aiming for fairness without sacrificing freedoms or rights.",
    examples: "Bernie Sanders and Alexandria Ocasio-Cortez call themselves democratic socialists while working through elections. In Europe, similar parties govern by expanding welfare and public services. These movements prove that socialism can operate within democratic systems, reshaping policy without dismantling representative government or relying on revolution.",
    alignIdeology1: "Social Democracy",
    alignIdeology1Text: "Democratic Socialism and Social Democracy share the belief that markets can coexist with public control to ensure equity and protect citizens' welfare.",
    alignIdeology2: "Socialism",
    alignIdeology2Text: "Both push for shared ownership and redistribution, with Democratic Socialism relying more on elections to achieve its aims.",
    surpriseIdeology1: "Civic Conservatism",
    surpriseIdeology1Text: "Together they care about community bonds, though they define them differently.",
    surpriseIdeology2: "Liberal Conservatism",
    surpriseIdeology2Text: "Together they mix tradition and reform, but with very different balances."
  },
  "Liberalism": {
    ideology: "Liberalism",
    friendlyLabel: "Individual Rights Advocate",
    explanation: "Represents classic Western liberal democracy committed to freedom, the rule of law, and a mixed economy. Accepts mostly capitalist markets but relies on government to provide education, infrastructure, and a safety net. Frames itself as the balance between liberty and stability, believing rights and institutions must protect both individuals and society.",
    examples: "Most Western governments today reflect liberal principles, from Barack Obama's policies to Emmanuel Macron's. They combine free markets with civil liberties and welfare programs. This balanced model, blending individual rights and economic pragmatism, has become the default framework for governance in much of the modern democratic world.",
    alignIdeology1: "Social Liberalism",
    alignIdeology1Text: "Liberalism and Social Liberalism both protect personal freedom and believe in government's role to balance markets with fairness for all citizens.",
    alignIdeology2: "Classical Liberalism",
    alignIdeology2Text: "Both Liberalism and Classical Liberalism share a core of individual rights and free markets, though Liberalism invites more social intervention.",
    surpriseIdeology1: "Distributism",
    surpriseIdeology1Text: "Each side wants fairness for individuals, though one looks to markets and one to land.",
    surpriseIdeology2: "Civic Conservatism",
    surpriseIdeology2Text: "Both trust in community responsibility, though they frame it differently."
  },
  "Conservatism": {
    ideology: "Conservatism",
    friendlyLabel: "Mainstream Right",
    explanation: "Favors preserving long-standing traditions and institutions while allowing only gradual, cautious change. Supports free markets and strong defense, seeing these as part of stability. Stresses law, order, and family values, portraying itself as a steady hand against upheaval, and warning that too much reform risks unraveling the social fabric.",
    examples: "The U.S. Republican Party under Ronald Reagan and Britain's Conservative Party under leaders like David Cameron exemplify mainstream conservatism. They combined free markets, strong defense, and traditional values. These leaders shaped the dominant center-right framework in the modern West and continue to influence political debates.",
    alignIdeology1: "Traditional Conservatism",
    alignIdeology1Text: "Conservatism and Traditional Conservatism share a belief in stability, respect for heritage, and cautious, deliberate change when necessary.",
    alignIdeology2: "Liberal Conservatism",
    alignIdeology2Text: "Both blend trust in markets with cultural continuity, holding that freedom must rest on a foundation of shared values.",
    surpriseIdeology1: "Distributism",
    surpriseIdeology1Text: "The pair honor small scale ties, though one frames them as duty.",
    surpriseIdeology2: "Progressivism",
    surpriseIdeology2Text: "The pair care deeply about society's future, though they see it differently."
  },
  "Libertarianism": {
    ideology: "Libertarianism",
    friendlyLabel: "Maximum Freedom Advocate",
    explanation: "Champions minimal government interference in both personal and economic matters. Believes individuals should be free to make their own choices as long as they don't harm others. Supports free markets, voluntary associations, and personal responsibility while opposing most regulations, taxes, and government programs.",
    examples: "The Libertarian Party in the U.S. and figures like Ron Paul advocate for minimal government. Think tanks like the Cato Institute promote these ideas. While never achieving major electoral success, libertarian ideas influence debates on personal freedom, drug policy, and economic regulation across the political spectrum.",
    alignIdeology1: "Classical Liberalism",
    alignIdeology1Text: "Both champion individual liberty and free markets as the foundation of a prosperous society.",
    alignIdeology2: "Anarcho-Capitalism",
    alignIdeology2Text: "Share a belief in voluntary exchange and minimal coercion, though libertarians accept some government.",
    surpriseIdeology1: "Progressivism",
    surpriseIdeology1Text: "Both value personal freedom and social tolerance, though they differ on economic policy.",
    surpriseIdeology2: "Democratic Socialism",
    surpriseIdeology2Text: "Each seeks to maximize human freedom, though through very different means."
  },
  "Anarcho-Capitalism": {
    ideology: "Anarcho-Capitalism",
    friendlyLabel: "Stateless Capitalist",
    explanation: "Envisions a society with no government at all, where private property, free markets, and voluntary contracts handle everything. Security, law, and infrastructure would be provided by competing private companies. Believes the state is inherently coercive and that truly free markets can organize society better than any government.",
    examples: "Murray Rothbard and Hans-Hermann Hoppe developed anarcho-capitalist theory. While no society has implemented it, cryptocurrency communities and seasteading projects attempt to create stateless market systems. The ideology remains mostly theoretical but influences libertarian and blockchain movements worldwide.",
    alignIdeology1: "Libertarianism",
    alignIdeology1Text: "Both minimize state power and maximize market freedom, though anarcho-capitalists go further.",
    alignIdeology2: "Objectivism",
    alignIdeology2Text: "Share belief in rational self-interest and property rights as moral foundations.",
    surpriseIdeology1: "Anarcho-Communism",
    surpriseIdeology1Text: "Both reject all state authority, though their economic visions are opposites.",
    surpriseIdeology2: "Mutualism",
    surpriseIdeology2Text: "Each imagines society without rulers, organized through voluntary cooperation."
  },
  "Socialism": {
    ideology: "Socialism",
    friendlyLabel: "Shared Economy Advocate",
    explanation: "Believes that major industries and resources should be owned or strictly regulated by the community, usually through the state or cooperatives. Seeks to ensure wealth is distributed fairly and everyone's needs are met. Promotes economic equality and social welfare while curbing unchecked private power, but risks inefficiency through heavy oversight.",
    examples: "Many European countries have socialist-inspired parties, like France's Socialist Party or the historic UK Labour platform. In the U.S., Bernie Sanders' movement brought socialist ideas like Medicare for All into mainstream debate. While democratic, these efforts reflect a lasting thread of socialist thinking in Western politics.",
    alignIdeology1: "Democratic Socialism",
    alignIdeology1Text: "Socialism and Democratic Socialism share the aim of shared ownership and fairness, differing mainly in whether democracy is their chosen path forward.",
    alignIdeology2: "State Socialism",
    alignIdeology2Text: "Both envision public control of resources to end inequality, but State Socialism relies more heavily on centralized power to deliver it.",
    surpriseIdeology1: "Civic Conservatism",
    surpriseIdeology1Text: "Each of them stresses duty to the group, though for very different ideals.",
    surpriseIdeology2: "Distributism",
    surpriseIdeology2Text: "Each of them values spreading resources, though in distinct ways."
  },
  "Progressivism": {
    ideology: "Progressivism",
    friendlyLabel: "Social Reform Champion",
    explanation: "Advocates for continuous social reform and cultural change to create a more equitable and inclusive society. Supports expanding rights, environmental protection, and social justice while challenging traditional hierarchies. Believes society can and should evolve beyond past limitations through education, activism, and policy reform.",
    examples: "The Progressive Era in early 20th century America brought women's suffrage and labor reforms. Modern progressive movements like Black Lives Matter and climate activism continue this tradition. Politicians like Elizabeth Warren and movements across Europe push for systemic changes to address inequality and injustice.",
    alignIdeology1: "Social Liberalism",
    alignIdeology1Text: "Both push steady legal change to address inequality, sharing faith in public policy as a tool to solve social problems.",
    alignIdeology2: "Democratic Socialism",
    alignIdeology2Text: "Share commitment to equality and social justice through democratic means.",
    surpriseIdeology1: "Libertarianism",
    surpriseIdeology1Text: "Both value personal freedom and oppose traditional restrictions on individual choice.",
    surpriseIdeology2: "Paleoconservatism",
    surpriseIdeology2Text: "Each believes society needs fundamental change, though in opposite directions."
  },
  "Fascism": {
    ideology: "Fascism",
    friendlyLabel: "Totalitarian Nationalist",
    explanation: "Demands a nation be fully unified under a powerful leader and a militarized government. Sees glory as achievable only through strict obedience, national expansion, and crushing opposition. Uses intimidation and violence to enforce order and loyalty, believing sacrifice for the leader and the state is the highest duty of every citizen.",
    examples: "Benito Mussolini's Italy in the 1920s and 1930s created the blueprint for fascism, combining mass rallies, militarism, and one-party rule. Modern ultra-nationalist and neo-fascist groups borrow his symbols and ideas, but no Western government today openly adopts Mussolini's model of governance or his ideology.",
    alignIdeology1: "Nazism",
    alignIdeology1Text: "Fascism and Nazism share authoritarian rule, state glorification, and ruthless control, though Nazism adds an extreme racial agenda not central to all fascism.",
    alignIdeology2: "Francoism",
    alignIdeology2Text: "Like Francoism, Fascism relied on tradition, nationalism, and hierarchy, though its tone was often more revolutionary and militaristic.",
    surpriseIdeology1: "Distributism",
    surpriseIdeology1Text: "Each side dislikes pure laissez faire economics, though one uses that to build hierarchy and the other to build localism.",
    surpriseIdeology2: "Progressivism",
    surpriseIdeology2Text: "Together they seek sweeping social transformation, even if their end goals are polar opposites."
  },
  "Centrism": {
    ideology: "Centrism",
    friendlyLabel: "Pragmatic Moderate",
    explanation: "Rejects extreme ideologies on the left or right, instead seeking compromise and practical solutions. Blends policies from both sides, mixing market freedom with welfare and regulation as needed. Frames centrism as realism, favoring gradual adjustments and middle-ground solutions over radical changes or ideological purity in governing.",
    examples: "Leaders like Joe Biden in the U.S. or Angela Merkel in Germany govern from the center, borrowing ideas from left and right. They avoid extremes, favoring incremental reforms and compromises. These figures embody centrist politics, which prizes stability and consensus rather than dramatic ideological swings or upheaval.",
    alignIdeology1: "Liberal Democracy",
    alignIdeology1Text: "Centrism and Liberal Democracy both prize moderation and balance, mixing policies from all sides to maintain stability and avoid extremes.",
    alignIdeology2: "Third-Way Labour",
    alignIdeology2Text: "Both Centrism and Third-Way Labour avoid ideological rigidity, blending free markets with welfare to keep society steady and pragmatic.",
    surpriseIdeology1: "Juche",
    surpriseIdeology1Text: "The pair think strategy matters, though one seeks balance and one isolation.",
    surpriseIdeology2: "Falangism",
    surpriseIdeology2Text: "The pair talk of unity, but with radically different meanings."
  }
};

// Helper function to get ideology info based on political scores
export function getIdeologyFromScores(economicScore: number, socialScore: number, progressiveScore?: number): IdeologyInfo | null {
  // This is a simplified mapping - you would need more sophisticated logic
  // to map exact scores to ideologies based on your 9x9 grid
  
  // For now, return a default based on rough quadrants
  if (economicScore < -33 && socialScore < -33) {
    return ideologyData["Libertarianism"] || null;
  } else if (economicScore < -33 && socialScore > 33) {
    return ideologyData["Democratic Socialism"] || null;
  } else if (economicScore > 33 && socialScore < -33) {
    return ideologyData["Anarcho-Capitalism"] || null;
  } else if (economicScore > 33 && socialScore > 33) {
    return ideologyData["Fascism"] || null;
  } else if (Math.abs(economicScore) < 33 && Math.abs(socialScore) < 33) {
    return ideologyData["Centrism"] || null;
  } else if (economicScore < 0) {
    return ideologyData["Socialism"] || null;
  } else if (socialScore < 0) {
    return ideologyData["Libertarianism"] || null;
  } else if (socialScore > 0) {
    return ideologyData["Conservatism"] || null;
  } else {
    return ideologyData["Liberalism"] || null;
  }
}