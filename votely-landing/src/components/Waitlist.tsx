import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { addToWaitlist } from "@/lib/firebase";

const Waitlist = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    try {
      const result = await addToWaitlist(email);
      
      if (result.success) {
        setIsSubmitted(true);
        setEmail("");
        toast.success("You've been added to the waitlist!", {
          description: "We'll notify you when Votely launches.",
        });
      } else {
        throw new Error('Failed to add to waitlist');
      }
    } catch (error) {
      toast.error("Something went wrong", {
        description: "Please try again later.",
      });
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="waitlist" className="votely-section bg-votely-black text-white">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-votely-lavender via-votely-lavender to-votely-grape">First Wave</span>
          </h2>
          <p className="text-lg md:text-xl mb-8 text-gray-300">
          We're building Votely for young people in American who want to take back power.
          By signing up for the waitlist, you're 'casting a vote' for our existence.
          </p>
          
          {isSubmitted ? (
            <div className="bg-votely-grape/20 rounded-lg p-8 border border-votely-lavender/30">
              <div className="w-16 h-16 rounded-full bg-votely-lavender/20 mx-auto flex items-center justify-center mb-4">
                <Check size={32} className="text-votely-lavender" />
              </div>
              <h3 className="text-xl font-bold mb-2">You're on the list!</h3>
              <p className="text-gray-300">
                Thanks for your interest in Votely. We'll notify you as soon as we launch.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email address"
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button 
                type="submit" 
                className="bg-votely-lavender hover:bg-votely-grape text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Get Informed"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default Waitlist;
