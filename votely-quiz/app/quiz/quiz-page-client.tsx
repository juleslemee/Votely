"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { shortQuestions, longQuestions, Question, Phase2Question, generateShortQuizQuestions, generateLongQuizQuestions, adjustForTiebreakers, getPhase2Questions } from './questions';
import { QUESTION_CONFIG } from './results/types';

// Continuous answer value (0.0 to 1.0)
type AnswerValue = number;

const getValueLabel = (value: number): string => {
  const percentage = Math.abs((value - 0.5) * 200);
  if (percentage <= 10) return "Neutral";
  
  const prefix = value < 0.5 ? "Disagree" : "Agree";
  if (percentage <= 35) return `Slightly ${prefix}`;
  if (percentage <= 65) return prefix;
  return `Strongly ${prefix}`;
};

const getPercentageDisplay = (value: number): string => {
  const percentage = Math.round(Math.abs((value - 0.5) * 200));
  return `${percentage}%`;
};

const getSliderColor = (value: number): string => {
  const distance = Math.abs(value - 0.5) * 2; // 0 to 1
  // Interpolate between purple-200 (233, 213, 255) and purple-600 (147, 51, 234)
  const r = Math.round(233 - (233 - 147) * distance);
  const g = Math.round(213 - (213 - 51) * distance);
  const b = Math.round(255 - (255 - 234) * distance);
  return `rgb(${r} ${g} ${b})`;
};

const QUESTIONS_PER_SCREEN = 5;

export default function QuizPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quizType = searchParams.get('type') || 'short';
  
  // Generate randomized questions on component mount
  const [questions, setQuestions] = useState<(Question | Phase2Question)[]>([]);
  const [originalQuestions, setOriginalQuestions] = useState<Question[]>([]); // Keep original for tiebreaker adjustment
  const [phase2QuestionsLoaded, setPhase2QuestionsLoaded] = useState(false);
  
  // Calculate total screens dynamically based on current questions length
  const TOTAL_SCREENS = Math.ceil(questions.length / QUESTIONS_PER_SCREEN);
  
  const [answers, setAnswers] = useState<Record<number, AnswerValue>>({});
  const [screen, setScreen] = useState(0);
  const [dragState, setDragState] = useState<{ questionId: number; isDragging: boolean; startValue?: number; element?: HTMLElement } | null>(null);
  const [hoveredQuestion, setHoveredQuestion] = useState<number | null>(null);
  const [tiebreakerChecked, setTiebreakerChecked] = useState(false);
  
  // Initialize randomized questions
  useEffect(() => {
    const randomizedQuestions = quizType === 'long' 
      ? generateLongQuizQuestions()
      : generateShortQuizQuestions();
    setQuestions(randomizedQuestions);
    setOriginalQuestions([...randomizedQuestions]);
    console.log(`🎮 Quiz initialized with ${randomizedQuestions.length} questions`);
  }, [quizType]);


  const handleAnswerSelect = (questionId: number, value: AnswerValue) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSliderInteraction = (questionId: number, event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    event.preventDefault(); // Prevent default touch behavior on mobile
    // Find the actual slider track element (not the invisible click area)
    const sliderTrack = event.currentTarget.querySelector('.slider-track');
    if (!sliderTrack) return;
    const rect = sliderTrack.getBoundingClientRect();
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const relativeX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, relativeX / rect.width));
    handleAnswerSelect(questionId, percentage);
  };

  const handleSliderMouseDown = (questionId: number, event: React.MouseEvent<HTMLDivElement>) => {
    const currentValue = answers[questionId] ?? 0.5;
    setDragState({ questionId, isDragging: true, startValue: currentValue, element: event.currentTarget });
    handleSliderInteraction(questionId, event);
  };

  const handleSliderTouchStart = (questionId: number, event: React.TouchEvent<HTMLDivElement>) => {
    const currentValue = answers[questionId] ?? 0.5;
    setDragState({ questionId, isDragging: true, startValue: currentValue, element: event.currentTarget });
    handleSliderInteraction(questionId, event);
  };

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (dragState?.isDragging && dragState.element) {
        const sliderTrack = dragState.element.querySelector('.slider-track');
        if (!sliderTrack) return;
        const rect = sliderTrack.getBoundingClientRect();
        const relativeX = event.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, relativeX / rect.width));
        handleAnswerSelect(dragState.questionId, percentage);
      }
    };

    const handleMouseUp = () => {
      setDragState(null);
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (dragState?.isDragging && dragState.element) {
        event.preventDefault(); // Prevent default touch behavior like swiping
        const sliderTrack = dragState.element.querySelector('.slider-track');
        if (!sliderTrack) return;
        const rect = sliderTrack.getBoundingClientRect();
        const relativeX = event.touches[0].clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, relativeX / rect.width));
        handleAnswerSelect(dragState.questionId, percentage);
      }
    };

    const handleTouchEnd = () => {
      setDragState(null);
    };

    if (dragState?.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [dragState]);

  // Calculate current scores for tiebreaker check
  const calculateCurrentScores = () => {
    let economicScore = 0;
    let governanceScore = 0; // Renamed from socialScore for clarity
    let economicQuestions = 0;
    let governanceQuestions = 0; // Renamed from socialQuestions
    
    // Convert continuous values (0-1) to score values (-2 to +2)
    const convertToScore = (value: number): number => {
      return (value - 0.5) * 4; // Maps 0->-2, 0.5->0, 1->2
    };
    
    // Only calculate for questions that have been answered
    questions.slice(0, 20).forEach((question) => {
      const answer = answers[question.id];
      if (answer === undefined) return;
      
      const score = convertToScore(answer);
      const config = QUESTION_CONFIG.find(c => c.id === question.id);
      if (!config) return;
      
      if (config.axis === 'economic') {
        economicScore += config.agreeDirection === 'left' ? -score : score;
        economicQuestions++;
      } else if (config.axis === 'authority') {
        governanceScore += config.agreeDirection === 'authoritarian' ? score : -score;
        governanceQuestions++;
      }
    });
    
    // Normalize to -100 to +100 scale
    const maxEconomicScore = economicQuestions * 2;
    const maxGovernanceScore = governanceQuestions * 2;
    
    const normalizedEconomic = maxEconomicScore > 0 ? (economicScore / maxEconomicScore) * 100 : 0;
    const normalizedGovernance = maxGovernanceScore > 0 ? (governanceScore / maxGovernanceScore) * 100 : 0;
    
    return { economic: normalizedEconomic, governance: normalizedGovernance };
  };

  const handleNext = async () => {
    console.log(`🎮 Screen transition: ${screen} -> ${screen + 1}, Total screens: ${TOTAL_SCREENS}, Questions: ${questions.length}`);
    
    // Check for tiebreakers after screen 3 (before moving to screen 4)
    // Screen 3 = questions 15-20, so after this we've answered 20 questions
    if (screen === 3 && quizType === 'long' && !tiebreakerChecked) {
      console.log('📊 Reached screen 4 - checking for tiebreaker needs...');
      
      const scores = calculateCurrentScores();
      const remainingQuestions = questions.slice(20); // Last 10 questions
      const adjustedQuestions = adjustForTiebreakers(remainingQuestions, scores.economic, scores.governance);
      
      // Update the questions array if tiebreakers were added
      if (adjustedQuestions !== remainingQuestions) {
        const newQuestions = [...questions.slice(0, 20), ...adjustedQuestions];
        setQuestions(newQuestions);
        console.log('📝 Questions updated with tiebreakers');
      }
      
      setTiebreakerChecked(true);
    }
    
    // Load Phase 2 questions when completing screen 5 (the last screen of Phase 1)  
    console.log(`🔍 Phase 2 Check: screen=${screen}, quizType=${quizType}, phase2Loaded=${phase2QuestionsLoaded}, questions=${questions.length}`);
    if (screen === 5 && quizType === 'long' && !phase2QuestionsLoaded && questions.length === 30) {
      console.log('🚀 Phase 1 complete - Loading Phase 2 questions...');
      
      const scores = calculateCurrentScores();
      
      // Determine macro cell for Phase 2
      let econCode: 'EL' | 'EM' | 'ER';
      if (scores.economic < -33) econCode = 'EL';
      else if (scores.economic > 33) econCode = 'ER';
      else econCode = 'EM';
      
      let authCode: 'GL' | 'GM' | 'GR';
      if (scores.governance > 33) authCode = 'GL';
      else if (scores.governance < -33) authCode = 'GR';
      else authCode = 'GM';
      
      const macroCellCode = `${econCode}-${authCode}`;
      console.log(`📍 User landed in macro cell: ${macroCellCode}`);
      console.log(`📊 Final Phase 1 Scores - Economic: ${scores.economic.toFixed(2)}, Governance: ${scores.governance.toFixed(2)}`);
      
      try {
        const phase2Questions = await getPhase2Questions(macroCellCode);
        console.log(`✨ Phase 2 Ready: ${phase2Questions.length} questions loaded and shuffled`);
        
        // Add Phase 2 questions to the existing questions array
        const extendedQuestions = [...questions, ...phase2Questions];
        setQuestions(extendedQuestions);
        setPhase2QuestionsLoaded(true);
        
        console.log(`🎯 Quiz extended to ${extendedQuestions.length} total questions (Phase 1: 30, Phase 2: 20)`);
        console.log(`📱 New TOTAL_SCREENS will be: ${Math.ceil(extendedQuestions.length / QUESTIONS_PER_SCREEN)}`);
      } catch (error) {
        console.error('Error loading Phase 2 questions:', error);
      }
    }
    
    // Check if we should proceed to next screen
    const canProceed = screen < TOTAL_SCREENS - 1;
    const justLoadedPhase2 = screen === 5 && quizType === 'long' && phase2QuestionsLoaded;
    const willLoadPhase2 = screen === 5 && quizType === 'long' && !phase2QuestionsLoaded && questions.length === 30;
    
    if (canProceed || justLoadedPhase2 || willLoadPhase2) {
      setScreen(screen + 1);
      
      // Ensure scroll to top after screen change
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      });
    }
  };

  const handleBack = () => {
    if (screen > 0) {
      setScreen(screen - 1);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      });
    }
  };

  const handleSubmit = async () => {
    console.log('🏁 Quiz Complete!');
    console.log(`📊 Final Quiz: ${questions.length} questions answered (${quizType === 'long' ? 'Phase 1: 30, Phase 2: 20' : 'Short quiz: 10'})`);
    
    const answerArray = questions.map(q => answers[q.id] !== undefined ? answers[q.id] : 0.5); // Default to neutral (0.5) if not answered
    const formattedAnswers = answerArray.map(val => val.toFixed(2));
    router.push(`/quiz/results?answers=${formattedAnswers.join(',')}&type=${quizType}`);
  };

  const startIdx = screen * QUESTIONS_PER_SCREEN;
  const endIdx = startIdx + QUESTIONS_PER_SCREEN;
  const currentQuestions = questions.slice(startIdx, endIdx);

  const numAnswered = Object.keys(answers).length;
  const isScreenComplete = currentQuestions.every(q => answers[q.id] !== undefined);
  const isComplete = numAnswered === questions.length;
  const progress = (numAnswered / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/25 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-12">
        {/* Progress Bar */}
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-6">
          <div
            className="h-full transition-all duration-300"
            style={{ 
              width: `${progress}%`,
              background: 'linear-gradient(to right, rgb(233 213 255), rgb(147 51 234))'
            }}
          />
        </div>
        <h1 className="text-4xl font-bold text-foreground text-center mb-8">
          Political Views Quiz - {quizType === 'long' ? 'Longform' : 'Shortform'}
        </h1>
        <div className="space-y-16 md:space-y-20">
          {currentQuestions.map((question) => (
            <div key={question.id} className="space-y-6">
              <h2 className="text-xl md:text-2xl font-semibold text-foreground text-center max-w-2xl mx-auto leading-relaxed px-4">
                {question.question}
              </h2>
              <div className="relative pt-10 md:pt-12 px-4 md:px-8">
                {/* Current selection label - moved higher and made more prominent */}
                {answers[question.id] !== undefined && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2">
                    <span className="inline-block bg-primary/20 text-secondary font-semibold px-6 py-1.5 rounded-full text-sm md:text-base whitespace-nowrap">
                      {getValueLabel(answers[question.id])} • {getPercentageDisplay(answers[question.id])}
                    </span>
                  </div>
                )}
                <div className="relative max-w-2xl mx-auto">
                  {/* Labels above slider */}
                  <div className="flex justify-between mb-2 text-xs md:text-sm text-foreground/75">
                    <span>Strongly Disagree</span>
                    <span>Strongly Agree</span>
                  </div>
                  <div className="relative h-8 md:h-10">
                    {/* Slider track with extended click area */}
                    <div 
                      className="absolute top-1/2 left-0 right-0 -translate-y-1/2 cursor-pointer select-none pt-8 pb-8 px-10 -mx-10"
                      style={{ touchAction: 'none' }}
                      data-question-id={question.id}
                      onMouseDown={(e) => handleSliderMouseDown(question.id, e)}
                      onTouchStart={(e) => handleSliderTouchStart(question.id, e)}
                      onClick={(e) => handleSliderInteraction(question.id, e)}
                      onMouseEnter={() => setHoveredQuestion(question.id)}
                      onMouseLeave={() => setHoveredQuestion(null)}
                    >
                      {/* Slider track */}
                      <div className="slider-track h-2 bg-purple-200 rounded-full relative overflow-visible absolute top-1/2 left-0 right-0 -translate-y-1/2">
                        {/* Solid color fill based on direction and value */}
                        {answers[question.id] !== undefined && (
                          <div
                            className={`absolute h-full ${
                              answers[question.id] < 0.5 ? 'rounded-l-full' : 'rounded-r-full'
                            } ${
                              dragState?.questionId === question.id && dragState.isDragging ? '' : 'transition-all duration-150'
                            }`}
                            style={{
                              backgroundColor: getSliderColor(answers[question.id]),
                              left: answers[question.id] < 0.5 ? `${answers[question.id] * 100}%` : '50%',
                              right: answers[question.id] >= 0.5 ? `${(1 - answers[question.id]) * 100}%` : '50%'
                            }}
                          />
                        )}
                        {/* Center line indicator */}
                        <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-purple-300" />
                        {/* Slider thumb - now with pulsating animation when not set */}
                        <div
                          className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-purple-600 rounded-full border-2 border-white shadow-lg cursor-grab active:cursor-grabbing hover:scale-110 ${
                            dragState?.questionId === question.id && dragState.isDragging ? '' : 'transition-transform'
                          }`}
                          style={{
                            left: `${(answers[question.id] ?? 0.5) * 100}%`,
                            transform: 'translateX(-50%) translateY(-50%)',
                            animation: answers[question.id] === undefined ? 'pulse-scale 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none'
                          }}
                        />
                      </div>
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
          {screen < TOTAL_SCREENS - 1 || (screen === 5 && quizType === 'long' && !phase2QuestionsLoaded && questions.length === 30) ? (
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
        
        <div className="flex justify-center items-center mt-8 pt-4 border-t border-gray-200/30">
          <a 
            href="https://votely.juleslemee.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors group"
          >
            <img 
              src="/logo.svg" 
              alt="Votely Logo" 
              className="w-6 h-6 group-hover:scale-105 transition-transform"
            />
            <span className="text-sm font-medium">Votely</span>
          </a>
        </div>
      </div>
    </div>
  );
}
