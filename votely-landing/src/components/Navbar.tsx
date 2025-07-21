import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/90 backdrop-blur-md shadow-sm py-2" : "py-4 bg-transparent"
      }`}
    >
      <div className="container-custom flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <img 
            src="/VotelyLogo.svg" 
            alt="Votely Logo" 
            className="w-10 h-10"
          />
          <span className="font-bold text-xl text-votely-grape font-ubuntu">Votely</span>
        </a>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-votely-black hover:text-votely-grape transition-colors font-noto">
            Features
          </a>
          <a href="#how-it-works" className="text-votely-black hover:text-votely-grape transition-colors font-noto">
            How It Works
          </a>
          <Button 
            className="bg-votely-lavender hover:bg-votely-lavender/80 text-white font-noto"
            onClick={() => window.location.href = 'https://votelyquiz.juleslemee.com'}
          >
            Start Quiz
          </Button>
          <Button 
            className="bg-votely-grape hover:bg-votely-lavender text-white transition-colors"
            onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Join Waitlist
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-votely-black" onClick={toggleMenu}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-md py-4 px-6 flex flex-col gap-4 animate-fade-in-up">
          <a 
            href="#features" 
            className="text-votely-black hover:text-votely-grape transition-colors py-2 font-noto"
            onClick={() => setIsMenuOpen(false)}
          >
            Features
          </a>
          <a 
            href="#how-it-works" 
            className="text-votely-black hover:text-votely-grape transition-colors py-2 font-noto"
            onClick={() => setIsMenuOpen(false)}
          >
            How It Works
          </a>
          <Button 
            className="bg-votely-lavender hover:bg-votely-lavender/80 text-white w-full font-noto"
            onClick={() => {
              window.location.href = 'https://votelyquiz.juleslemee.com';
              setIsMenuOpen(false);
            }}
          >
            Start Quiz
          </Button>
          <Button 
            className="bg-votely-grape hover:bg-votely-lavender text-white w-full transition-colors mt-2 font-noto"
            onClick={() => {
              document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' });
              setIsMenuOpen(false);
            }}
          >
            Join Waitlist
          </Button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
