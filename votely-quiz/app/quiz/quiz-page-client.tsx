"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type LikertValue = 1 | 2 | 3 | 4 | 5;
type PoliticalAxis = 'economic' | 'social';

const questions = [
  {
    id: 1,
    question: "Billionaires should be heavily taxed to fund social programs for the less fortunate.",
    axis: 'economic' as PoliticalAxis
  },
  {
    id: 2,
    question: "Climate change is an urgent crisis that justifies drastic government action and investment.",
    axis: 'economic' as PoliticalAxis
  },
  {
    id: 3,
    question: "We should redirect funding from police into social services because community well-being prevents crime more than strict policing does.",
    axis: 'social' as PoliticalAxis
  },
  {
    id: 4,
    question: "The government should cancel most student loan debt, even if it means taxpayers bear the cost.",
    axis: 'economic' as PoliticalAxis
  },
  {
    id: 5,
    question: "Healthcare is a human right – the government should provide universal healthcare for everyone.",
    axis: 'economic' as PoliticalAxis
  },
  {
    id: 6,
    question: "Public schools should teach America's full history of racism and injustice, even if it makes some uncomfortable.",
    axis: 'social' as PoliticalAxis
  },
  {
    id: 7,
    question: "Social media should remove hateful or misleading content, even at the cost of absolute free speech.",
    axis: 'social' as PoliticalAxis
  },
  {
    id: 8,
    question: "Gun control saves lives – we need stricter gun laws and bans on assault weapons.",
    axis: 'social' as PoliticalAxis
  },
  {
    id: 9,
    question: "No one working full-time should live in poverty – the minimum wage must be a living wage, even if some businesses struggle.",
    axis: 'economic' as PoliticalAxis
  },
  {
    id: 10,
    question: "Government and companies should actively promote diversity and inclusion – it's needed to fix inequality.",
    axis: 'social' as PoliticalAxis
  },
  {
    id: 11,
    question: "The U.S. should prioritize global cooperation over 'America First' – we're global citizens as much as American citizens.",
    axis: 'social' as PoliticalAxis
  },
  {
    id: 12,
    question: "Personal choices (like drug use or assisted dying) should be legal – the government shouldn't police adult decisions that don't harm others.",
    axis: 'social' as PoliticalAxis
  }
];

const likertLabels = {
  1: "Strongly Disagree",
  2: "Disagree",
  3: "Neutral",
  4: "Agree",
  5: "Strongly Agree",
};

const QUESTIONS_PER_SCREEN = 3;
const TOTAL_SCREENS = Math.ceil(questions.length / QUESTIONS_PER_SCREEN);

export default function QuizPageClient() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<number, LikertValue>>({});
  const [screen, setScreen] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [screen]);

  const handleAnswerSelect = (questionId: number, value: LikertValue) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (screen < TOTAL_SCREENS - 1) {
      setScreen(screen + 1);
    }
  };

  const handleBack = () => {
    if (screen > 0) setScreen(screen - 1);
  };

  const handleSubmit = () => {
    const answerArray = questions.map(q => answers[q.id] || 3); // Default to neutral if not answered
    router.push(`/quiz/results?answers=${answerArray.join(',')}`);
  };

  const startIdx = screen * QUESTIONS_PER_SCREEN;
  const endIdx = startIdx + QUESTIONS_PER_SCREEN;
  const currentQuestions = questions.slice(startIdx, endIdx);

  const numAnswered = Object.keys(answers).length;
  const isScreenComplete = currentQuestions.every(q => answers[q.id]);
  const isComplete = numAnswered === questions.length;
  const progress = (numAnswered / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/25 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-12">
        {/* Progress Bar */}
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-purple-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <h1 className="text-4xl font-bold text-foreground text-center mb-8">
          Political Views Quiz
        </h1>
        <div className="space-y-16 md:space-y-20">
          {currentQuestions.map((question) => (
            <div key={question.id} className="space-y-6">
              <h2 className="text-xl md:text-2xl font-semibold text-foreground text-center max-w-2xl mx-auto leading-relaxed px-4">
                {question.question}
              </h2>
              <div className="relative pt-10 md:pt-12 px-4 md:px-8">
                {/* Current selection label - moved higher and made more prominent */}
                {answers[question.id] && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2">
                    <span className="inline-block bg-primary/20 text-secondary font-semibold px-6 py-1.5 rounded-full text-sm md:text-base">
                      {likertLabels[answers[question.id]]}
                    </span>
                  </div>
                )}
                <div className="relative max-w-2xl mx-auto">
                  {/* Labels above slider */}
                  <div className="flex justify-between mb-2 text-xs md:text-sm text-foreground/75">
                    <span>Strongly Disagree</span>
                    <span>Strongly Agree</span>
                  </div>
                  <div className="relative h-5 md:h-6">
                    {/* Slider track */}
                    <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2">
                      <div className="h-0.5 bg-purple-200">
                        {/* Selected range */}
                        <div
                          className="h-full bg-purple-500"
                          style={{
                            width: `${((answers[question.id] || 0) / 5) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                    {/* Slider dots */}
                    <div className="absolute top-0 left-0 right-0 h-full flex justify-between items-center">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          onClick={() => handleAnswerSelect(question.id, value as LikertValue)}
                          className={`
                            w-4 h-4 md:w-5 md:h-5 rounded-full
                            ${answers[question.id] === value
                              ? 'bg-purple-600 scale-110 ring-2 ring-purple-200'
                              : 'bg-purple-300 hover:bg-purple-400'}
                            transition-all duration-200
                            focus:outline-none focus:ring-2 focus:ring-purple-500
                          `}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center mt-8 gap-4">
          <button
            onClick={handleBack}
            disabled={screen === 0}
            className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors
              ${screen === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-purple-400 hover:bg-purple-600'}`}
          >
            Back
          </button>
          {screen < TOTAL_SCREENS - 1 ? (
            <button
              onClick={handleNext}
              disabled={!isScreenComplete}
              className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors
                ${!isScreenComplete ? 'bg-gray-300 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!isScreenComplete}
              className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors
                ${!isScreenComplete ? 'bg-gray-300 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
            >
              See Your Results
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
