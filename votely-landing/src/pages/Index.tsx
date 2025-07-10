import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import TheProblem from "../components/TheProblem";
import HowItWorks from "../components/HowItWorks";
import Vision from "../components/Vision";
import Waitlist from "../components/Waitlist";
import Footer from "../components/Footer";
import PreloadResources from "../components/PreloadResources";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <PreloadResources />
      <Navbar />
      
      <main className="flex-1">
        <Hero />
        <TheProblem />
        <Vision />
        <HowItWorks />
        <Waitlist />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
