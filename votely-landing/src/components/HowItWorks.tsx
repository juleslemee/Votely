import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  
  const steps = [
    {
      title: "Stay Informed Without Doomscrolling",
      description: "We show you just a few key civic updates based on the issues you care about, all in plain language with no overload.",
      image: "swipe-step",
      details: "We highlight just a few local updates that actually matter to you based on the issues you selected during onboarding. It's bite-sized; no drama, no noise."
    },
    {
      title: "See Who's Representing You",
      description: "Get a clear view of who holds power locally and when the next election could shift it.",
      image: "analyze-step",
      details: "We break down who's in charge in your area, from city council to Congress, with party, position, and what they actually control. No searching through PDFs required."
    },
    {
      title: "Take Action That Actually Matters",
      description: "From emailing your rep to RSVPing for a town hall, it only takes one tap to get involved.",
      image: "discover-step",
      details: "We give you small, meaningful actions based on your political values, like emailing your rep or RSVPing to a town hall. No friction, no guesswork, just one tap to get involved."
    }
  ];

  // Preload images
  useEffect(() => {
    const preloadImages = async () => {
      const imagePaths = [
        "/Page 1 - Learn.png",
        "/Page 2 - Act.png",
        "/Page 3 - Map.png"
      ];
      
      for (const path of imagePaths) {
        const img = new Image();
        img.src = path;
        img.onload = () => {
          setLoadedImages(prev => ({ ...prev, [path]: true }));
        };
      }
    };
    
    preloadImages();
  }, []);

  const nextStep = () => {
    setActiveStep((prev) => (prev === steps.length - 1 ? 0 : prev + 1));
  };

  const stepComponents = [
    // Learn step visualization
    <div key="learn" className="flex flex-col items-center justify-center h-full w-full">
      <div className="max-w-[300px] w-full mx-auto">
        <img 
          src="/Page 1 - Learn.png" 
          alt="Learn step mockup" 
          className={`w-full h-full object-contain transition-opacity duration-300 ${
            loadedImages["/Page 1 - Learn.png"] ? "opacity-100" : "opacity-0"
          }`}
          loading="lazy"
        />
      </div>
    </div>,
    
    // Act step visualization
    <div key="act" className="flex flex-col items-center justify-center h-full w-full">
      <div className="max-w-[300px] w-full mx-auto">
        <img 
          src="/Page 2 - Act.png" 
          alt="Act step mockup" 
          className={`w-full h-full object-contain transition-opacity duration-300 ${
            loadedImages["/Page 2 - Act.png"] ? "opacity-100" : "opacity-0"
          }`}
          loading="lazy"
        />
      </div>
    </div>,
    
    // Map step visualization
    <div key="map" className="flex flex-col items-center justify-center h-full w-full">
      <div className="max-w-[300px] w-full mx-auto">
        <img 
          src="/Page 3 - Map.png" 
          alt="Map step mockup" 
          className={`w-full h-full object-contain transition-opacity duration-300 ${
            loadedImages["/Page 3 - Map.png"] ? "opacity-100" : "opacity-0"
          }`}
          loading="lazy"
        />
      </div>
    </div>
  ];

  return (
    <section id="how-it-works" className="votely-section">
      <div className="container-custom">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="">Your Personalized Civic Toolkit</span>
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Votely helps you turn political self-awareness into impact by connecting you to 
            civic actions and local decisions that reflect your values.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Steps */}
          <div>
            <div className="space-y-6">
              {steps.map((step, index) => (
                <div 
                  key={index} 
                  className={`flex gap-4 cursor-pointer p-4 rounded-lg transition-all ${
                    activeStep === index 
                      ? "bg-votely-lavender/10 shadow-sm border border-votely-lavender/20" 
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => setActiveStep(index)}
                >
                  <div 
                    className={`rounded-full w-8 h-8 flex-shrink-0 flex items-center justify-center ${
                      activeStep === index 
                        ? "bg-votely-grape text-white" 
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <h3 className={`font-semibold mb-1 ${
                      activeStep === index ? "text-votely-grape" : "text-gray-800"
                    }`}>
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-600">{step.description}</p>
                    
                    {activeStep === index && (
                      <p className="text-sm mt-2 text-votely-black/80 animate-fade-in-up">
                        {step.details}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8">
              <Button 
                onClick={nextStep}
                className="bg-votely-grape hover:bg-votely-lavender text-white transition-all flex items-center gap-2"
              >
                Show Next Step
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
          
          {/* Visualization */}
          <div className="h-[600px] flex items-center justify-center">
            <div className="w-full animate-card-slide">
              {stepComponents[activeStep]}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
