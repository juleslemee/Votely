import { useState, useEffect, useRef } from 'react';

type Position = {
  x: number;
  y: number;
};

type Alignment = {
  label: string;
  description: string;
  realIdeologies: string;
  usExamples: string;
  xRange: [number, number];
  yRange: [number, number];
  additionalCondition?: (x: number, y: number) => boolean;
};

const alignments: Alignment[] = [
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
    description: "Believes true freedom is collective, without bosses or centralized states.",
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

const Vision = () => {
  const [mousePosition, setMousePosition] = useState<Position>({ x: 50, y: 50 });
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const quadrantRef = useRef<HTMLDivElement>(null);

  const getClosestAlignment = (position: Position): Alignment => {
    // Convert percentage position to -10 to 10 scale
    // Invert Y axis since the visual has authoritarian at top (positive Y) and libertarian at bottom (negative Y)
    const x = (position.x / 5) - 10;
    const y = 10 - (position.y / 5); // Invert Y axis

    // Find the first alignment that matches the position
    const matchingAlignment = alignments.find(alignment => {
      const inXRange = x >= alignment.xRange[0] && x <= alignment.xRange[1];
      const inYRange = y >= alignment.yRange[0] && y <= alignment.yRange[1];
      const additionalCondition = alignment.additionalCondition ? alignment.additionalCondition(x, y) : true;
      
      return inXRange && inYRange && additionalCondition;
    });

    return matchingAlignment || alignments[0]; // Default to first alignment if none found
  };

  const updatePosition = (clientX: number, clientY: number) => {
    if (!quadrantRef.current) return;

    const rect = quadrantRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    
    // Clamp values between 0 and 100
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));
    
    setMousePosition({ x: clampedX, y: clampedY });
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isMouseDown) return;
    updatePosition(event.clientX, event.clientY);
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    setIsMouseDown(true);
    setHasInteracted(true);
    updatePosition(event.clientX, event.clientY);
  };

  const handleTouchStart = (event: React.TouchEvent) => {
    event.preventDefault(); // Prevent scrolling while dragging
    setIsMouseDown(true);
    setHasInteracted(true);
    const touch = event.touches[0];
    updatePosition(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    event.preventDefault(); // Prevent scrolling while dragging
    if (!isMouseDown) return;
    const touch = event.touches[0];
    updatePosition(touch.clientX, touch.clientY);
  };

  const handleInteractionEnd = () => {
    setIsMouseDown(false);
  };

  // Add global mouse/touch up listeners to handle releases outside the quadrant
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsMouseDown(false);
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchend', handleGlobalMouseUp);
    window.addEventListener('touchcancel', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchend', handleGlobalMouseUp);
      window.removeEventListener('touchcancel', handleGlobalMouseUp);
    };
  }, []);

  const currentAlignment = getClosestAlignment(mousePosition);

  return (
    <section className="votely-section bg-gradient-to-br from-votely-lavender/5 to-gray-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            We'll help you take action<span className="gradient-text"> one step at a time.</span>
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            <a
              href="https://votelyquiz.juleslemee.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-votely-grape hover:text-votely-lavender underline underline-offset-4 font-medium"
            >
              Start with our quiz
            </a> {' '}
            to find where you stand politically. Then, we'll show you small,
            high-impact actions that align with your values, all in your city, on your terms.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Quadrant visualization */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <div 
                ref={quadrantRef}
                className="relative w-full aspect-square cursor-grab active:cursor-grabbing select-none touch-none"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleInteractionEnd}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleInteractionEnd}
                onTouchCancel={handleInteractionEnd}
              >
                {/* X and Y axes */}
                <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-gray-300 -translate-x-1/2"></div>
                <div className="absolute left-0 right-0 top-1/2 h-[2px] bg-gray-300 -translate-y-1/2"></div>
                
                {/* Axis labels */}
                <div className="absolute top-1 left-1/2 -translate-x-1/2 text-sm font-medium">
                  Authoritarian
                </div>
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-sm font-medium">
                  Libertarian
                </div>
                <div className="absolute left-1 top-1/2 -translate-y-1/2 -rotate-90 origin-center text-sm font-medium">
                  Economic Left
                </div>
                <div className="absolute right-1 top-1/2 -translate-y-1/2 rotate-90 origin-center text-sm font-medium">
                  Economic Right
                </div>
                
                {/* Quadrant labels */}
                <div className="absolute top-8 left-8 text-xs text-gray-500">Labor Left</div>
                <div className="absolute top-8 right-8 text-xs text-gray-500">Conservative</div>
                <div className="absolute bottom-8 left-8 text-xs text-gray-500">Progressive</div>
                <div className="absolute bottom-8 right-8 text-xs text-gray-500">Free Market</div>

                {/* Mouse/touch tracking point */}
                <div
                  className={`absolute w-4 h-4 bg-votely-grape rounded-full z-10 
                    transform-gpu will-change-transform cursor-grab
                    ${isMouseDown ? 'scale-125' : hasInteracted ? '' : 'opacity-80 animate-pulse'}
                  `}
                  style={{
                    left: `${mousePosition.x}%`,
                    top: `${mousePosition.y}%`,
                    transform: 'translate(-50%, -50%)',
                    transition: 'opacity 0.2s ease-out, transform 0.15s ease-out',
                    boxShadow: hasInteracted ? 'none' : '0 0 0 8px rgba(176, 125, 213, 0.2)',
                  }}
                />
                
                {/* Hint text when not interacted */}
                {!hasInteracted && (
                  <div 
                    className="absolute bg-votely-grape text-white px-3 py-1 rounded-lg text-xs font-medium animate-bounce z-20 pointer-events-none"
                    style={{
                      left: `${mousePosition.x}%`,
                      top: `${mousePosition.y - 8}%`,
                      transform: 'translate(-50%, -100%)',
                    }}
                  >
                    Try dragging me!
                  </div>
                )}
              </div>
            </div>
            
            {/* Alignment description */}
            <div className="votely-card h-full">
              {hasInteracted ? (
                <div className="animate-fade-in-up">
                  <h3 className="text-2xl font-bold mb-2 gradient-text">
                    {currentAlignment.label}
                  </h3>
                  <p className="text-gray-700 mb-4">
                    {currentAlignment.description}
                  </p>
                  <div className="space-y-2">
                    <div>
                      <h4 className="font-medium text-votely-grape">Real Ideologies:</h4>
                      <p className="text-gray-700">{currentAlignment.realIdeologies}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-votely-grape">Recent Examples:</h4>
                      <p className="text-gray-700">{currentAlignment.usExamples}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="text-votely-lavender mb-4">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="48" 
                      height="48" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Drag to Explore Political Ideologies</h3>
                  <p className="text-gray-600">
                    Click and drag the purple dot to explore different political alignments. Discover where your beliefs might fit in the political landscape.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Vision;
