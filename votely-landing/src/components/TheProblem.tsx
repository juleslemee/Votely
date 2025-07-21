
import { Newspaper, Landmark, HeartCrack } from "lucide-react";

const problems = [
  {
    title: "It's hard to stay informed without the noise",
    description: "You want to keep up, but most civic info is either dry, buried, or drowned out by overwhelming national headlines.",
    icon: <Newspaper className="text-votely-grape" />,
  },
  {
    title: "You don't know who actually represents you",
    description: "It's confusing to figure out who's in charge locally, what they stand for, or when you get to vote them in (or out).",
    icon: <Landmark className="text-votely-grape" />,
  },
  {
    title: "Taking action feels intimidating or pointless",
    description: "Even if you care, it's not obvious what to do. Small actions like emailing your rep or RSVPing to a meeting aren't things anyone's shown you how to do.",
    icon: <HeartCrack className="text-votely-grape" />,
  },
];

const TheProblem = () => {
  return (
    <section id="features" className="votely-section bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-12 md:mb-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Politics Feel Broken
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            You care about the issues but feel powerless to make a difference.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {problems.map((problem, index) => (
            <div 
              key={index}
              className="votely-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in"
            >
              <div className="rounded-full bg-votely-lavender/10 p-4 w-16 h-16 flex items-center justify-center mb-4 mx-auto">
                {problem.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center">{problem.title}</h3>
              <p className="text-gray-600 text-center">{problem.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TheProblem;

