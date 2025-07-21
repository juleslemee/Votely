import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

const Hero = () => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    // Preload the quiz mockup image
    const img = new Image();
    img.src = "/Quiz Mockup.svg";
    img.onload = () => setIsImageLoaded(true);
  }, []);

  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-24 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-votely-lavender/10 to-votely-white z-0"></div>
      <div className="container-custom relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
              Discover your political identity. <br />
              <span className="block h-3"></span>
              Act on what matters <span className="gradient-text">locally.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl">
              Take our 2-minute quiz to find your political quadrant, then get actions you can take in your city based on your values.
            </p>
            
            <div className="flex flex-col gap-4 justify-center md:justify-start items-center md:items-start">
              <Button 
                className="bg-gradient-to-r from-votely-grape to-votely-lavender text-white font-medium text-xl font-ubuntu py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-auto"
                onClick={() => window.location.href = 'https://votelyquiz.juleslemee.com'}
              >
                Find Out Your Political Leaning
              </Button>
              <Button 
                className="bg-white/10 backdrop-blur-sm text-votely-grape text-xl font-ubuntu py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-auto border border-white/20"
                onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Get Informed of a Full Release
              </Button>
            </div>
          </div>
          
          <div className="flex-1 flex justify-center items-center">
            <div className="relative w-full max-w-[280px] mx-auto animate-float">
              <img 
                src="/Quiz Mockup.svg" 
                alt="Votely Quiz Interface" 
                className={`w-full h-full transition-opacity duration-300 ${
                  isImageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                loading="eager"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

