"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Info, Ban, Check } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';
import { Question, Phase2Question, generateShortQuizQuestions, generateLongQuizQuestions, generateFinal10Questions, getTiebreakerQuestionsAsync, adjustForTiebreakers, getPhase2Questions } from './questions';
import { 
  generateSessionId, 
  saveQuizSession, 
  getCurrentSession,
  updateSessionAnswers,
  updateSessionPhase1Results,
  addPhase2Questions,
  completeSession,
  QuizSession,
  QuizQuestion 
} from '@/lib/quiz-session';

// Import calculateScores for live preview and DebugPanel
import { calculateScores } from './results/results-client';
import { DebugPanel } from '@/components/DebugPanel';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { debugLog, debugWarn, debugError } from '@/lib/debug-logger';

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

const QUESTIONS_PER_SCREEN = 12;

export default function QuizPageClient() {
  const posthog = usePostHog();
  const router = useRouter();
  const searchParams = useSearchParams();
  const quizType = searchParams.get('type') || 'short';
  const isDebugMode = searchParams.get('debug') === 'true';
  
  // Generate randomized questions on component mount
  const [questions, setQuestions] = useState<(Question | Phase2Question)[]>([]);
  const [originalQuestions, setOriginalQuestions] = useState<Question[]>([]); // Keep original for tiebreaker adjustment
  const [phase2QuestionsLoaded, setPhase2QuestionsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // Calculate total screens dynamically based on current questions length
  const TOTAL_SCREENS = Math.ceil(questions.length / QUESTIONS_PER_SCREEN);
  
  const [answers, setAnswers] = useState<Record<number, AnswerValue | null>>({});
  const [skippedQuestions, setSkippedQuestions] = useState<Set<number>>(new Set());
  const [screen, setScreen] = useState(0);
  const [dragState, setDragState] = useState<{ questionId: number; isDragging: boolean; startValue?: number; element?: HTMLElement } | null>(null);
  const [hoveredQuestion, setHoveredQuestion] = useState<number | null>(null);
  const [tiebreakerChecked, setTiebreakerChecked] = useState(false);
  const [liveScores, setLiveScores] = useState<{economic: number, governance: number, social: number} | null>(null);
  const [skipWarning, setSkipWarning] = useState<string | null>(null);
  const answeredQuestionsRef = useRef<Set<number>>(new Set());
  const lastTrackedQuizType = useRef<string | null>(null);
  const phase2TrackedRef = useRef(false);
  const lastSkipWarningRef = useRef<string | null>(null);

  
  // Initialize randomized questions and session
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        
        // Always start fresh - no session resume
        debugLog('🧹 Starting fresh quiz session');
        if (isDebugMode) {
          debugLog('🐛 DEBUG MODE ACTIVATED - Enhanced logging enabled');
        }
        sessionStorage.removeItem('votely_quiz_session');
        
        // Create new session
        debugLog(`🎯 Loading ${quizType} quiz questions...`);
        const randomizedQuestions = quizType === 'long' 
          ? await generateLongQuizQuestions()
          : await generateShortQuizQuestions();
        
        if (!randomizedQuestions || randomizedQuestions.length === 0) {
          throw new Error('No questions loaded from TSV file');
        }
        
        setQuestions(randomizedQuestions);
        setOriginalQuestions([...randomizedQuestions]);
        answeredQuestionsRef.current.clear();
        phase2TrackedRef.current = false;
        lastSkipWarningRef.current = null;
        
        // Save session (only for current quiz, not for resume)
        const session: QuizSession = {
          sessionId: generateSessionId(),
          type: quizType as 'short' | 'long',
          questions: randomizedQuestions.map(q => ({
            id: q.id,
            originalId: (q as any).originalId || `P${q.id}`,
            text: q.question,
            axis: q.axis,
            agreeDir: q.agreeDir || 1,
            phase: 1,
            qType: 'core'
          } as QuizQuestion)),
          answers: {},
          createdAt: Date.now()
        };
        saveQuizSession(session);
        debugLog(`🎮 New quiz session created: ${session.sessionId}`);
        debugLog(`📋 ${randomizedQuestions.length} questions loaded`);
        if (posthog && lastTrackedQuizType.current !== quizType) {
          posthog.capture('quiz_session_started', {
            quiz_type: quizType,
            question_count: randomizedQuestions.length
          });
          lastTrackedQuizType.current = quizType;
        }
        setIsLoading(false);
      } catch (error) {
        debugError('❌ Failed to load quiz questions:', error);
        setLoadError(`Failed to load quiz questions: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setIsLoading(false);
      }
    };
    loadQuestions();
  }, [quizType, posthog]);

  // Load Phase 2 questions when Phase 1 is complete (36 questions answered or skipped)
  useEffect(() => {
    if (quizType !== 'long' || phase2QuestionsLoaded || questions.length !== 36) return;

    // Count questions that are either answered (non-null) or explicitly skipped
    const answeredOrSkippedCount = questions.slice(0, 36).filter(q =>
      (answers[q.id] !== undefined && answers[q.id] !== null) || skippedQuestions.has(q.id)
    ).length;

    if (answeredOrSkippedCount === 36) {
      debugLog(`🚀 Phase 1 complete (${answeredOrSkippedCount} questions answered/skipped) - Loading Phase 2 questions...`);
      
      // Calculate scores from the 36 Phase 1 questions
      const calculateScores = () => {
        // This would use the same logic as calculateCurrentScores but I'll keep it simple for now
        let economicScore = 0;
        let governanceScore = 0;
        let socialScore = 0;

        questions.forEach(q => {
          const answer = answers[q.id];
          if (answer === undefined || answer === null) return;

          const score = (answer - 0.5) * 4; // Convert 0-1 to -2 to +2

          if (q.axis === 'economic') {
            economicScore += score * (q.agreeDir || 1);
          } else if (q.axis === 'governance') {
            governanceScore += score * (q.agreeDir || 1);
          } else if (q.axis === 'social') {
            socialScore += score * (q.agreeDir || 1);
          }
        });
        
        // Normalize to -100 to +100 scale
        const normalize = (score: number, max: number) => (score / max) * 100;
        const econQuestions = questions.filter(q => q.axis === 'economic').length;
        const govQuestions = questions.filter(q => q.axis === 'governance').length;
        const socQuestions = questions.filter(q => q.axis === 'social').length;
        
        return {
          economic: normalize(economicScore, econQuestions * 2),
          governance: normalize(governanceScore, govQuestions * 2),
          social: normalize(socialScore, socQuestions * 2)
        };
      };
      
      const loadPhase2 = async () => {
        const scores = calculateScores();
        
        // Determine macro cell for Phase 2
        let econCode: 'EL' | 'EM' | 'ER';
        if (scores.economic < -33) econCode = 'EL';
        else if (scores.economic > 33) econCode = 'ER';
        else econCode = 'EM';
        
        let authCode: 'GL' | 'GM' | 'GA';
        if (scores.governance > 33) authCode = 'GA'; // More authoritarian
        else if (scores.governance < -33) authCode = 'GL'; // More libertarian
        else authCode = 'GM';
        
        const macroCellCode = `${econCode}-${authCode}`;
        debugLog(`📍 User landed in macro cell: ${macroCellCode}`);
        debugLog(`📊 Phase 1 Scores - Economic: ${scores.economic.toFixed(2)}, Governance: ${scores.governance.toFixed(2)}, Social: ${scores.social.toFixed(2)}`);
        
        try {
          const phase2Questions = await getPhase2Questions(macroCellCode);
          debugLog(`✨ Phase 2 Ready: ${phase2Questions.length} questions loaded`);
          
          // Add Phase 2 questions to the existing questions array
          const extendedQuestions = [...questions, ...phase2Questions];
          setQuestions(extendedQuestions);
          setPhase2QuestionsLoaded(true);
          if (posthog && !phase2TrackedRef.current) {
            posthog.capture('phase2_loaded', {
              quiz_type: quizType,
              macro_cell_code: macroCellCode,
              phase2_question_count: phase2Questions.length
            });
            phase2TrackedRef.current = true;
          }
          
          // Add Phase 2 questions to session
          const phase2SessionQuestions: QuizQuestion[] = phase2Questions.map(q => ({
            id: q.id,
            originalId: (q as any).originalId || `P2_${q.id}`,
            text: q.question,
            axis: 'social', // Phase 2 uses supplementary axes
            agreeDir: q.agreeDir || 1,
            phase: 2,
            qType: 'refine',
            supplementAxis: (q as any).supplementAxis
          }));
          addPhase2Questions(phase2SessionQuestions);
          
          // Update session with Phase 1 results
          updateSessionPhase1Results(scores, macroCellCode);
          
          debugLog(`🎯 Quiz extended to ${extendedQuestions.length} total questions`);
        } catch (error) {
          debugError('Error loading Phase 2 questions:', error);
        }
      };
      
      loadPhase2();
    }
  }, [answers, questions, quizType, phase2QuestionsLoaded, skippedQuestions, posthog]);

  const handleAnswerSelect = (questionId: number, value: AnswerValue | null) => {
    // DEBUG: Log answer changes
    if (value === null) {
      debugLog(`🔄 handleAnswerSelect Q${questionId}: Setting to NULL (skip)`);
    } else if (answers[questionId] === null || answers[questionId] === undefined) {
      debugLog(`🔄 handleAnswerSelect Q${questionId}: ${answers[questionId]} → ${value} (answering after skip)`);
    }

    const newAnswers = {
      ...answers,
      [questionId]: value
    };

    // DEBUG: Verify the newAnswers object
    debugLog(`🔄 newAnswers[${questionId}] = ${newAnswers[questionId]} (type: ${typeof newAnswers[questionId]})`);

    setAnswers(newAnswers);

    // DEBUG: Log what we're updating in session
    debugLog(`🔄 Updating session with: { ${questionId}: ${value} }`);

    if (value !== null && posthog && !answeredQuestionsRef.current.has(questionId)) {
      const questionMeta = questions.find(q => q.id === questionId);
      const isPhase2Question = questionId >= 45 || (questionMeta && (questionMeta as any).phase === 2);
      const axis = isPhase2Question
        ? (questionMeta as any)?.supplementAxis || 'supplementary'
        : questionMeta?.axis || 'unknown';
      const questionType = isPhase2Question
        ? 'refine'
        : questionMeta?.boundary
          ? 'tiebreaker'
          : 'core';
      const bucket = getValueLabel(value);
      const percentage = Math.round(Math.abs((value - 0.5) * 200));

      answeredQuestionsRef.current.add(questionId);
      posthog.capture('question_answered', {
        quiz_type: quizType,
        question_id: questionId,
        question_axis: axis,
        question_type: questionType,
        answer_value: value,
        answer_bucket: bucket,
        answer_percent: percentage,
      });
    }

    // Remove from skipped set if answering after skip
    if (value !== null && skippedQuestions.has(questionId)) {
      const newSkipped = new Set(skippedQuestions);
      newSkipped.delete(questionId);
      setSkippedQuestions(newSkipped);
      debugLog(`🔄 Removed Q${questionId} from skipped set - answering after skip`);

    }

    // Update session
    updateSessionAnswers({ [questionId]: value });
  };

  const handleSkipQuestion = (questionId: number) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    // Check if we can skip this question (enforce 50% per-axis limit)
    const newSkipped = new Set(skippedQuestions);
    newSkipped.add(questionId);

    // Count skips by axis (including supplementary axes for Phase 2)
    const skipsByAxis: Record<string, number> = {};
    const questionsByAxis: Record<string, number> = {};

    // Initialize counts for all axes
    questions.forEach(q => {
      if (q.id < 45) {
        // Phase 1: main axes (including tiebreakers)
        if (q.axis) {
          if (!skipsByAxis[q.axis]) skipsByAxis[q.axis] = 0;
          if (!questionsByAxis[q.axis]) questionsByAxis[q.axis] = 0;
          questionsByAxis[q.axis]++;
        }
      } else {
        // Phase 2: supplementary axes
        const suppAxis = (q as any).supplementAxis;
        if (suppAxis) {
          if (!skipsByAxis[suppAxis]) skipsByAxis[suppAxis] = 0;
          if (!questionsByAxis[suppAxis]) questionsByAxis[suppAxis] = 0;
          questionsByAxis[suppAxis]++;
        }
      }
    });

    // Debug: Log the current question distribution
    debugLog(`📊 Current question distribution:`, questionsByAxis);

    // Count current skips
    newSkipped.forEach(qId => {
      const q = questions.find(qu => qu.id === qId);
      if (q) {
        if (q.id < 45) {
          if (q.axis) {
            if (!skipsByAxis[q.axis]) skipsByAxis[q.axis] = 0;
            skipsByAxis[q.axis]++;
          }
        } else {
          const suppAxis = (q as any).supplementAxis;
          if (suppAxis) {
            if (!skipsByAxis[suppAxis]) skipsByAxis[suppAxis] = 0;
            skipsByAxis[suppAxis]++;
          }
        }
      }
    });

    // Determine which axis this question belongs to
    const targetAxis = question.id < 45 ? question.axis : (question as any).supplementAxis;

    if (targetAxis && questionsByAxis[targetAxis]) {
      const currentSkips = skipsByAxis[targetAxis] || 0;
      const totalQuestions = questionsByAxis[targetAxis];
      const wouldBeSkipPercentage = (currentSkips / totalQuestions) * 100;

      // Debug the skip calculation
      debugLog(`🔍 Skip check for Q${questionId} (${targetAxis}):`);
      debugLog(`  Current skips in ${targetAxis}: ${currentSkips}`);
      debugLog(`  Total questions in ${targetAxis}: ${totalQuestions}`);
      debugLog(`  Would be skip percentage: ${wouldBeSkipPercentage.toFixed(1)}%`);
      debugLog(`  All questions in axis:`, questions.filter(q => q.id < 45 && q.axis === targetAxis).map(q => `Q${q.id}`));

      if (wouldBeSkipPercentage > 50) {
        // Show error as a temporary toast
        setSkipWarning(`⚠️ Cannot skip: You've already skipped 50% of ${targetAxis} questions (${currentSkips}/${totalQuestions}). This would reduce accuracy too much.`);
        // Auto-hide after 3 seconds
        setTimeout(() => setSkipWarning(null), 3000);
        if (posthog) {
          posthog.capture('skip_limit_blocked', {
            quiz_type: quizType,
            question_id: questionId,
            axis: targetAxis,
            current_skip_percentage: wouldBeSkipPercentage,
            current_skips: currentSkips,
            total_axis_questions: totalQuestions
          });
        }
        return; // Don't allow the skip
      }
    } else {
      debugLog(`⚠️ Skip check failed - targetAxis: ${targetAxis}, questionsByAxis[${targetAxis}]: ${questionsByAxis[targetAxis]}`);
    }

    // Allow the skip - only update skippedQuestions Set, don't modify answers
    setSkippedQuestions(newSkipped);
    if (posthog) {
      const axis = questionId < 45
        ? question?.axis || 'unknown'
        : (question as any)?.supplementAxis || 'supplementary';
      const questionType = questionId >= 45
        ? 'refine'
        : question?.boundary
          ? 'tiebreaker'
          : 'core';
      posthog.capture('question_skipped', {
        quiz_type: quizType,
        question_id: questionId,
        axis,
        question_type: questionType
      });
    }

    // Recalculate scores immediately with the new skipped set
    const recalculatedScores = calculateCurrentScores(true, newSkipped);
    setLiveScores(recalculatedScores);
    debugLog(`🔄 Recalculated scores after skip - Economic: ${recalculatedScores.economic.toFixed(2)}, Governance: ${recalculatedScores.governance.toFixed(2)}, Social: ${recalculatedScores.social.toFixed(2)}`);

    // Only recalculate Phase 2 supplementary scores if this axis was already fully answered
    if (questionId >= 45) {
      const skippedQuestion = questions.find(q => q.id === questionId);
      if (skippedQuestion && (skippedQuestion as any).supplementAxis) {
        const suppAxis = (skippedQuestion as any).supplementAxis;

        // First, check if ALL questions for this axis were previously answered
        const axisQuestions = questions.filter(q => q.id >= 45 && (q as any).supplementAxis === suppAxis);
        const answeredBeforeSkip = axisQuestions.filter(q =>
          answers[q.id] !== undefined && answers[q.id] !== null && !skippedQuestions.has(q.id)
        );

        // Only recalculate if this axis was fully answered before the skip
        if (answeredBeforeSkip.length === axisQuestions.length) {
          debugLog(`🔄 ${suppAxis} was fully answered (${axisQuestions.length}/${axisQuestions.length}), recalculating after skip Q${questionId}...`);

          // Calculate supplementary scores for this axis (excluding the newly skipped question)
          const supplementaryScores: Record<string, { score: number; count: number }> = {};
          axisQuestions.forEach(q => {
            if (!newSkipped.has(q.id)) {
              const answer = answers[q.id];
              if (answer !== undefined && answer !== null) {
                if (!supplementaryScores[suppAxis]) {
                  supplementaryScores[suppAxis] = { score: 0, count: 0 };
                }
                const score = (answer - 0.5) * 4;
                const contribution = (q.agreeDir || 1) * score;
                supplementaryScores[suppAxis].score += contribution;
                supplementaryScores[suppAxis].count++;
              }
            }
          });

          if (supplementaryScores[suppAxis]) {
            const maxScore = supplementaryScores[suppAxis].count * 2;
            const normalizedScore = supplementaryScores[suppAxis].count > 0
              ? (supplementaryScores[suppAxis].score + maxScore) / (maxScore * 2) * 100
              : 0;
            debugLog(`🔄 ${suppAxis} after skip: ${normalizedScore.toFixed(1)}% (Raw: ${supplementaryScores[suppAxis].score.toFixed(2)}/${maxScore}, ${supplementaryScores[suppAxis].count} questions)`);
          }
        } else {
          debugLog(`⏩ ${suppAxis} not fully answered yet (${answeredBeforeSkip.length}/${axisQuestions.length}), skipping recalculation to avoid locking incomplete state`);
        }
      }
    }

    // DEBUG: Log the skip action
    debugLog(`⏭️ SKIPPING Q${questionId}: Adding to skipped set (keeping answer: ${answers[questionId]})`);
    debugLog(`   Question added to skip set: ${newSkipped.has(questionId)}`);

    // Update warnings
    checkSkipLimits(newSkipped);
  };

  const checkSkipLimits = (skipped: Set<number>) => {
    // Count skips by axis (including supplementary axes)
    const skipsByAxis: Record<string, number> = {};
    const questionsByAxis: Record<string, number> = {};

    // Initialize counts for all axes
    questions.forEach(q => {
      if (q.id < 45) {
        // Phase 1: main axes (including tiebreakers)
        if (q.axis) {
          if (!questionsByAxis[q.axis]) questionsByAxis[q.axis] = 0;
          questionsByAxis[q.axis]++;
          // Debug tiebreaker axis detection
          if ((q as any).boundary) {
            debugLog(`  🔍 Tiebreaker Q${q.id} has axis: ${q.axis}, boundary: ${(q as any).boundary}`);
          }
        } else {
          debugLog(`  ⚠️ Phase 1 Question Q${q.id} missing axis property`);
        }
      } else {
        // Phase 2: supplementary axes
        const suppAxis = (q as any).supplementAxis;
        if (suppAxis) {
          if (!questionsByAxis[suppAxis]) questionsByAxis[suppAxis] = 0;
          questionsByAxis[suppAxis]++;
        }
      }
    });

    // Count current skips
    skipped.forEach(qId => {
      const question = questions.find(q => q.id === qId);
      if (question) {
        if (question.id < 45) {
          if (question.axis) {
            if (!skipsByAxis[question.axis]) skipsByAxis[question.axis] = 0;
            skipsByAxis[question.axis]++;
          }
        } else {
          const suppAxis = (question as any).supplementAxis;
          if (suppAxis) {
            if (!skipsByAxis[suppAxis]) skipsByAxis[suppAxis] = 0;
            skipsByAxis[suppAxis]++;
          }
        }
      }
    });

    // Calculate overall skip percentage for Phase 1
    const totalPhase1Questions = questions.filter(q => q.id < 45).length;
    const phase1Skips = Array.from(skipped).filter(qId => qId < 45).length;
    const skipPercentage = totalPhase1Questions > 0 ? (phase1Skips / totalPhase1Questions) * 100 : 0;

    // Check for warnings
    const warnings = [];

    // Overall skip percentage warning
    if (skipPercentage >= 25) {
      warnings.push(`You've skipped ${Math.round(skipPercentage)}% of questions.`);
    }

    // Axis-specific warnings (approaching 50% limit)
    const axisApproachingLimit: string[] = [];
    Object.entries(skipsByAxis).forEach(([axis, count]) => {
      if (questionsByAxis[axis] && questionsByAxis[axis] > 0) {
        const axisSkipPercentage = (count / questionsByAxis[axis]) * 100;
        if (axisSkipPercentage >= 40) { // Warning when close to 50% limit
          axisApproachingLimit.push(`${axis} (${Math.round(axisSkipPercentage)}%)`);
        }
      }
    });

    if (axisApproachingLimit.length > 0) {
      warnings.push(`Approaching skip limit for: ${axisApproachingLimit.join(', ')}`);
    }

    if (warnings.length > 0) {
      const warningMessage = `ℹ️ ${warnings.join(' ')}`;
      setSkipWarning(warningMessage);
      // Auto-hide info warnings after 5 seconds
      setTimeout(() => setSkipWarning(null), 5000);
      if (posthog && lastSkipWarningRef.current !== warningMessage) {
        posthog.capture('skip_limit_warning', {
          quiz_type: quizType,
          warnings: warnings,
        });
        lastSkipWarningRef.current = warningMessage;
      }
    } else {
      setSkipWarning(null);
      lastSkipWarningRef.current = null;
    }
  };

  const handleSliderInteraction = (questionId: number, event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    event.preventDefault(); // Prevent default touch behavior on mobile
    event.stopPropagation(); // Stop event bubbling
    
    // Find the actual slider track element (not the invisible click area)
    const sliderTrack = event.currentTarget.querySelector('.slider-track');
    if (!sliderTrack) return;
    const rect = sliderTrack.getBoundingClientRect();
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const relativeX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, relativeX / rect.width));
    
    // Store the value immediately to prevent visual flickering
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
        event.stopPropagation();
        
        const sliderTrack = dragState.element.querySelector('.slider-track');
        if (!sliderTrack) return;
        const rect = sliderTrack.getBoundingClientRect();
        const relativeX = event.touches[0].clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, relativeX / rect.width));
        
        // Use requestAnimationFrame for smoother updates
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
  const calculateCurrentScores = (debug: boolean = false, skippedSet?: Set<number>) => {
    const currentSkipped = skippedSet || skippedQuestions;
    let economicScore = 0;
    let governanceScore = 0; // Renamed from socialScore for clarity
    let socialScore = 0;
    let economicQuestions = 0;
    let governanceQuestions = 0; // Renamed from socialQuestions
    let socialQuestions = 0;
    
    // Convert continuous values (0-1) to score values (-2 to +2)
    const convertToScore = (value: number): number => {
      return (value - 0.5) * 4; // Maps 0->-2, 0.5->0, 1->2
    };
    
    // Only calculate for questions that have been answered
    // For short quiz: all questions (12), for long quiz: Phase 1 questions (36)
    const questionsToScore = questions.slice(0, Math.min(questions.length, 36));

    if (debug) {
      debugLog('🔍 DETAILED SCORING BREAKDOWN:');
      debugLog('================================');

      // Count skipped vs answered questions for tiebreaker context
      const skipCounts = { economic: 0, governance: 0, social: 0 };
      const answerCounts = { economic: 0, governance: 0, social: 0 };

      questionsToScore.forEach(q => {
        const answer = answers[q.id];
        if (answer === undefined || answer === null || currentSkipped.has(q.id)) {
          if (q.axis) skipCounts[q.axis]++;
        } else {
          if (q.axis) answerCounts[q.axis]++;
        }
      });

      debugLog(`📊 Question Status (for tiebreaker calculation):`);
      debugLog(`   Economic: ${answerCounts.economic} answered, ${skipCounts.economic} skipped`);
      debugLog(`   Governance: ${answerCounts.governance} answered, ${skipCounts.governance} skipped`);
      debugLog(`   Social: ${answerCounts.social} answered, ${skipCounts.social} skipped`);
      debugLog('================================');
    }

    questionsToScore.forEach((question) => {
      const answer = answers[question.id];
      if (answer === undefined || answer === null || currentSkipped.has(question.id)) return;
      
      const score = convertToScore(answer);
      const agreeDir = question.agreeDir || 1;
      const contribution = score * agreeDir;
      
      if (question.axis === 'economic') {
        // agreeDir -1 means agreeing pushes left (negative), 1 means agreeing pushes right (positive)
        economicScore += contribution;
        economicQuestions++;
        if (debug) {
          const direction = agreeDir === -1 ? 'LEFT' : 'RIGHT';
          debugLog(`Q${question.id} (Econ-${direction}): Answer=${answer.toFixed(2)} → Score=${score.toFixed(2)} × Dir=${agreeDir} = ${contribution.toFixed(2)}`);
        }
      } else if (question.axis === 'governance') {
        // agreeDir -1 means agreeing pushes libertarian (negative), 1 means agreeing pushes authoritarian (positive)
        governanceScore += contribution;
        governanceQuestions++;
        if (debug) {
          const direction = agreeDir === -1 ? 'LIB' : 'AUTH';
          debugLog(`Q${question.id} (Auth-${direction}): Answer=${answer.toFixed(2)} → Score=${score.toFixed(2)} × Dir=${agreeDir} = ${contribution.toFixed(2)}`);
        }
      } else if (question.axis === 'social') {
        // agreeDir -1 means agreeing pushes progressive (negative), 1 means agreeing pushes traditional (positive)
        socialScore += contribution;
        socialQuestions++;
        if (debug) {
          const direction = agreeDir === -1 ? 'PROG' : 'TRAD';
          debugLog(`Q${question.id} (Social-${direction}): Answer=${answer.toFixed(2)} → Score=${score.toFixed(2)} × Dir=${agreeDir} = ${contribution.toFixed(2)}`);
        }
      }
    });
    
    if (debug) {
      debugLog('================================');
      debugLog(`Economic: Raw sum=${economicScore.toFixed(2)}, Questions=${economicQuestions}, Max possible=±${economicQuestions * 2}`);
      debugLog(`Authority: Raw sum=${governanceScore.toFixed(2)}, Questions=${governanceQuestions}, Max possible=±${governanceQuestions * 2}`);
      debugLog(`Social: Raw sum=${socialScore.toFixed(2)}, Questions=${socialQuestions}, Max possible=±${socialQuestions * 2}`);
    }
    
    // Normalize to -100 to +100 scale
    const maxEconomicScore = economicQuestions * 2;
    const maxGovernanceScore = governanceQuestions * 2;
    const maxSocialScore = socialQuestions * 2;
    
    const normalizedEconomic = maxEconomicScore > 0 ? (economicScore / maxEconomicScore) * 100 : 0;
    const normalizedGovernance = maxGovernanceScore > 0 ? (governanceScore / maxGovernanceScore) * 100 : 0;
    const normalizedSocial = maxSocialScore > 0 ? (socialScore / maxSocialScore) * 100 : 0;
    
    if (debug) {
      debugLog(`Normalized Economic: ${normalizedEconomic.toFixed(2)}% (${normalizedEconomic < 0 ? 'LEFT' : 'RIGHT'})`);
      debugLog(`Normalized Authority: ${normalizedGovernance.toFixed(2)}% (${normalizedGovernance < 0 ? 'LIBERTARIAN' : 'AUTHORITARIAN'})`);
      debugLog(`Normalized Social: ${normalizedSocial.toFixed(2)}% (${normalizedSocial < 0 ? 'PROGRESSIVE' : 'TRADITIONAL'})`);
      debugLog('================================');
    }
    
    return { economic: normalizedEconomic, governance: normalizedGovernance, social: normalizedSocial };
  };

  const handleNext = async () => {
    debugLog(`🎮 Screen transition: ${screen} -> ${screen + 1}, Total screens: ${TOTAL_SCREENS}, Questions: ${questions.length}`);
    
    // Get current screen questions for Phase 2 check
    const startIdx = screen * QUESTIONS_PER_SCREEN;
    const endIdx = startIdx + QUESTIONS_PER_SCREEN;
    const currentScreenQuestions = questions.slice(startIdx, endIdx);
    const answeredOnScreen = currentScreenQuestions.filter(q =>
      answers[q.id] !== undefined && answers[q.id] !== null && !skippedQuestions.has(q.id)
    ).length;
    const skippedOnScreen = currentScreenQuestions.filter(q => skippedQuestions.has(q.id)).length;
    const isPhase2Screen = phase2QuestionsLoaded && startIdx >= 36;

    posthog?.capture('screen_advanced', {
      quiz_type: quizType,
      from_screen: screen,
      to_screen: screen + 1,
      answered_on_screen: answeredOnScreen,
      skipped_on_screen: skippedOnScreen,
      phase: isPhase2Screen ? 'phase2' : 'phase1'
    });
    
    // Check for tiebreakers after screen 1 (24 questions answered)
    // This will potentially modify questions 25-36 on screen 2
    if (screen === 1 && quizType === 'long' && !tiebreakerChecked && questions.length === 36) {
      debugLog('🔍 === CHECKPOINT: 24 QUESTIONS COMPLETED ===');
      
      // Calculate scores from the first 24 questions only
      const scores = calculateCurrentScores();
      debugLog(`📊 Scores after 24 questions - Economic: ${scores.economic.toFixed(2)}, Authority: ${scores.governance.toFixed(2)}, Social: ${scores.social.toFixed(2)}`);
      
      // Log current session data for debugging
      const currentSession = getCurrentSession();
      if (currentSession) {
        debugLog('📋 Session status:', {
          sessionId: currentSession.sessionId,
          questionsAnswered: Object.keys(currentSession.answers).length,
          totalQuestions: questions.length
        });
      }
      
      // Detect which tiebreaker zones we're in
      // New threshold system: -56 to -22 and +22 to +56 (macro boundaries remain ±33.33)
      const boundaries: string[] = [];
      
      if (scores.economic >= -56 && scores.economic <= -22) {
        boundaries.push('LEFT_CENTER');
        debugLog(`📍 In LEFT_CENTER tiebreaker zone (economic: ${scores.economic.toFixed(2)} in range -56 to -22)`);
      }
      if (scores.economic >= 22 && scores.economic <= 56) {
        boundaries.push('CENTER_RIGHT');
        debugLog(`📍 In CENTER_RIGHT tiebreaker zone (economic: ${scores.economic.toFixed(2)} in range +22 to +56)`);
      }
      if (scores.governance >= -56 && scores.governance <= -22) {
        boundaries.push('LIB_CENTER');
        debugLog(`📍 In LIB_CENTER tiebreaker zone (authority: ${scores.governance.toFixed(2)} in range -56 to -22)`);
      }
      if (scores.governance >= 22 && scores.governance <= 56) {
        boundaries.push('CENTER_AUTH');
        debugLog(`📍 In CENTER_AUTH tiebreaker zone (authority: ${scores.governance.toFixed(2)} in range +22 to +56)`);
      }
      
      // Get tiebreaker questions if needed
      if (boundaries.length > 0) {
        debugLog(`⚖️ TIEBREAKERS NEEDED! Near ${boundaries.length} boundary(ies): ${boundaries.join(', ')}`);
        const tiebreakerQuestions = await getTiebreakerQuestionsAsync(boundaries);
        debugLog(`📌 Loading ${tiebreakerQuestions.length} tiebreaker questions to clarify position`);
        if (posthog) {
          posthog.capture('tiebreaker_loaded', {
            quiz_type: quizType,
            boundaries,
            tiebreaker_count: tiebreakerQuestions.length
          });
        }
        
        // Integrate tiebreaker questions into questions 25-36 based on removal priority
        const questionsToModify = [...questions.slice(24, 36)]; // Questions 25-36 (make a copy)
        const questionsBeforeModification = questions.slice(0, 24); // Questions 1-24
        
        // Categorize social questions by removal priority
        const socialQuestionsByPriority: { index: number; question: any; priority: string }[] = [];
        questionsToModify.forEach((q, index) => {
          if (q.axis === 'social') {
            socialQuestionsByPriority.push({
              index,
              question: q,
              priority: (q as any).removalPriority || 'none'
            });
          }
        });
        
        // Sort by removal priority: 'first' comes first, then 'second', then others
        socialQuestionsByPriority.sort((a, b) => {
          const priorityOrder: Record<string, number> = { 'first': 0, 'second': 1, 'none': 2 };
          return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
        });
        
        debugLog(`📊 Questions 25-36 social questions by removal priority:`);
        
        // Debug: Log actual removalPriority values
        socialQuestionsByPriority.forEach((item, i) => {
          debugLog(`    Q${25 + item.index}: removalPriority="${(item.question as any).removalPriority}" → priority="${item.priority}"`);
        });
        
        const firstPriority = socialQuestionsByPriority.filter(q => q.priority === 'first');
        const secondPriority = socialQuestionsByPriority.filter(q => q.priority === 'second');
        const noPriority = socialQuestionsByPriority.filter(q => q.priority === 'none');
        debugLog(`  - 'first' priority (remove if 1+ boundaries): ${firstPriority.length} questions`);
        debugLog(`  - 'second' priority (remove if 2+ boundaries): ${secondPriority.length} questions`);
        debugLog(`  - no removal priority: ${noPriority.length} questions`);
        
        // Debug: Show which specific questions have which priorities
        if (firstPriority.length > 0) {
          debugLog(`    First priority questions: ${firstPriority.map(q => q.question.originalId || q.question.id).join(', ')}`);
        }
        if (secondPriority.length > 0) {
          debugLog(`    Second priority questions: ${secondPriority.map(q => q.question.originalId || q.question.id).join(', ')}`);
        }
        
        // Determine which questions to replace based on number of boundaries
        let questionsToReplace: typeof socialQuestionsByPriority = [];
        
        if (boundaries.length >= 1) {
          // Remove all 'first' priority questions
          questionsToReplace.push(...firstPriority);
          debugLog(`  → Removing ${firstPriority.length} 'first' priority questions (${boundaries.length} boundary detected)`);
        }
        
        if (boundaries.length >= 2) {
          // Also remove 'second' priority questions
          questionsToReplace.push(...secondPriority);
          debugLog(`  → Also removing ${secondPriority.length} 'second' priority questions (${boundaries.length} boundaries detected)`);
        }
        
        // Replace the questions
        const numReplacements = Math.min(tiebreakerQuestions.length, questionsToReplace.length);

        if (numReplacements > 0) {
          // Track which questions are being replaced for skip handling
          const replacedQuestionIds = new Set<number>();

          for (let i = 0; i < numReplacements; i++) {
            const replaceItem = questionsToReplace[i];
            const tiebreaker = tiebreakerQuestions[i];
            const oldQuestionId = questionsToModify[replaceItem.index].id;

            debugLog(`  🔄 Replacing Q${25 + replaceItem.index}: "${replaceItem.question.question.substring(0, 50)}..." → "${tiebreaker.question.substring(0, 50)}..."`);
            debugLog(`  📊 Tiebreaker axis info: axis="${tiebreaker.axis}", boundary="${tiebreaker.boundary}"`);
            questionsToModify[replaceItem.index] = tiebreaker;
            replacedQuestionIds.add(oldQuestionId);
          }

          // Update the full questions array
          const updatedQuestions = [...questionsBeforeModification, ...questionsToModify];
          setQuestions(updatedQuestions);

          // Clean up skipped questions that were replaced by tiebreakers
          if (replacedQuestionIds.size > 0) {
            const updatedSkipped = new Set(skippedQuestions);
            replacedQuestionIds.forEach(id => {
              if (updatedSkipped.has(id)) {
                updatedSkipped.delete(id);
                debugLog(`  🧹 Removed skip for replaced question ID ${id}`);
              }
            });
            setSkippedQuestions(updatedSkipped);

            // Recalculate skip limits with new questions
            checkSkipLimits(updatedSkipped);
          }

          debugLog(`✅ Integrated ${numReplacements} tiebreaker questions based on removal priorities`);
          debugLog(`📝 Modified quiz maintains 36 Phase 1 questions with better boundary resolution`);
        } else {
          debugLog('⚠️ No questions with appropriate removal priority to replace');
        }
      } else {
        debugLog('✅ No tiebreakers needed - scores are clear of boundaries');
        debugLog('📝 Continuing with standard questions 25-36');
      }
      
      // Mark that we've checked for tiebreakers
      setTiebreakerChecked(true);
    }
    
    // Log checkpoint after all 36 Phase 1 questions are complete (moving from screen 2)
    if (screen === 2 && quizType === 'long' && questions.length >= 36 && !phase2QuestionsLoaded) {
      debugLog('🎯 === CHECKPOINT: ALL 36 PHASE 1 QUESTIONS COMPLETED ===');
      const scores = calculateCurrentScores();
      debugLog(`📊 Final Phase 1 Scores - Economic: ${scores.economic.toFixed(2)}, Authority: ${scores.governance.toFixed(2)}, Social: ${scores.social.toFixed(2)}`);
      
      // Determine macro cell
      let econCode: 'EL' | 'EM' | 'ER';
      if (scores.economic < -33) econCode = 'EL';
      else if (scores.economic > 33) econCode = 'ER';
      else econCode = 'EM';
      
      let authCode: 'GL' | 'GM' | 'GA';
      if (scores.governance > 33) authCode = 'GA'; // More authoritarian
      else if (scores.governance < -33) authCode = 'GL'; // More libertarian
      else authCode = 'GM';
      
      const macroCellCode = `${econCode}-${authCode}`;
      debugLog(`📍 Macro cell determined: ${macroCellCode}`);
      debugLog('⏳ Phase 2 questions will load automatically via useEffect...');
      posthog?.capture('phase1_completed', {
        quiz_type: quizType,
        macro_cell_code: macroCellCode,
        economic_score: scores.economic,
        governance_score: scores.governance,
        social_score: scores.social
      });
    }
    
    // Always proceed to next screen (we handle button visibility separately now)
    setScreen(screen + 1);
    
    // Ensure scroll to top after screen change
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  };

  const handleBack = () => {
    if (screen > 0) {
      posthog?.capture('screen_back', {
        quiz_type: quizType,
        from_screen: screen,
        to_screen: screen - 1
      });
      setScreen(screen - 1);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      });
    }
  };

  const handleSubmit = async () => {
    debugLog('🏁 Quiz Complete!');
    const answeredCount = questions.length - skippedQuestions.size;
    const skippedCount = skippedQuestions.size;
    debugLog(`📊 Final Quiz: ${answeredCount} questions answered, ${skippedCount} skipped (${quizType === 'long' ? 'Phase 1: 36, Phase 2: 24' : 'Short quiz: 12'})`);

    // Track quiz completion
    posthog?.capture('quiz_completed', {
      quiz_type: quizType,
      questions_answered: answeredCount,
      questions_skipped: skippedCount,
      total_questions: questions.length,
      completion_rate: (answeredCount / questions.length) * 100
    });

    // Mark session as complete locally (for cleanup)
    completeSession();

    // Prepare data for results page
    // Filter out skipped questions entirely, but keep answers for non-skipped
    const questionData = questions
      .filter(q => !skippedQuestions.has(q.id)) // Remove skipped questions
      .map(q => ({
        id: q.id,
        axis: q.axis,
        agreeDir: q.agreeDir || 1,
        answer: answers[q.id], // Only answered questions remain
        // Include supplementAxis for Phase 2 questions
        supplementAxis: (q as any).supplementAxis
      }));

    // DEBUG: Log submission data structure
    debugLog('🚀 SUBMITTING DATA (New Approach):');
    debugLog(`📊 Total questions: ${questions.length}`);
    debugLog(`📊 Skipped questions: ${skippedQuestions.size}`);
    debugLog(`📊 Questions being submitted: ${questionData.length}`);
    debugLog('📋 Skipped question IDs:', Array.from(skippedQuestions));
    debugLog('📋 Sample submitted data (first 10):');
    questionData.slice(0, 10).forEach((q, i) => {
      debugLog(`  [${i}] Q${q.id}: ANSWERED (${q.answer}) axis=${q.axis} suppAxis=${q.supplementAxis}`);
    });

    // Include skip statistics for analytics
    const skipStats = {
      totalSkipped: skippedCount,
      skipsByAxis: {
        economic: 0,
        governance: 0,
        social: 0
      }
    };

    skippedQuestions.forEach(qId => {
      const question = questions.find(q => q.id === qId);
      if (question && question.id < 45) {
        skipStats.skipsByAxis[question.axis]++;
      }
    });

    const submissionData = {
      questionData,
      skipStats
    };

    const encodedData = btoa(JSON.stringify(submissionData));

    // Navigate to results with encoded data
    // The results page will save to Firebase and get the docId
    const debugParam = isDebugMode ? '&debug=true' : '';
    router.push(`/quiz/results?data=${encodeURIComponent(encodedData)}&type=${quizType}${debugParam}`);
  };

  const startIdx = screen * QUESTIONS_PER_SCREEN;
  const endIdx = startIdx + QUESTIONS_PER_SCREEN;
  const currentQuestions = questions.slice(startIdx, endIdx);

  const numAnswered = Object.keys(answers).length;
  const isScreenComplete = currentQuestions.every(q =>
    answers[q.id] !== undefined || skippedQuestions.has(q.id)
  );

  // Debug mode auto-fill functions
  const autoFillAll = (value: number) => {
    const newAnswers: Record<number, AnswerValue> = {};
    questions.forEach(q => {
      newAnswers[q.id] = value;
    });
    setAnswers(newAnswers);
  };

  const autoFillRandom = () => {
    const newAnswers: Record<number, AnswerValue> = {};
    questions.forEach(q => {
      newAnswers[q.id] = Math.random();
    });
    setAnswers(newAnswers);
  };

  const autoFillPattern = (pattern: 'alternate' | 'extreme') => {
    const newAnswers: Record<number, AnswerValue> = {};
    questions.forEach((q, index) => {
      if (pattern === 'alternate') {
        newAnswers[q.id] = index % 2 === 0 ? 0.2 : 0.8;
      } else if (pattern === 'extreme') {
        newAnswers[q.id] = Math.random() > 0.5 ? 0.05 : 0.95;
      }
    });
    setAnswers(newAnswers);
  };

  // Calculate live scores in debug mode
  useEffect(() => {
    if (!isDebugMode || Object.keys(answers).length === 0) return;

    const calculateLiveScores = async () => {
      try {
        const answersArray = questions.map(q => answers[q.id] ?? 0.5);
        const questionIds = questions.map(q => q.id);
        const questionData = questions.map(q => ({
          id: q.id,
          axis: q.axis,
          agreeDir: q.agreeDir || 1,
          supplementAxis: (q as any).supplementAxis
        }));
        
        const scores = await calculateScores(answersArray, questionIds, quizType, undefined, false, questionData);
        setLiveScores(scores);
      } catch (error) {
        debugError('Error calculating live scores:', error);
      }
    };

    calculateLiveScores();
  }, [answers, questions, isDebugMode, quizType]);
  
  // Total expected questions for each quiz type
  const totalExpectedQuestions = quizType === 'long' ? 60 : 12; // 36 Phase 1 + 24 Phase 2 for long, 12 for short
  const isComplete = numAnswered === totalExpectedQuestions;
  
  // Progress should always be out of expected total
  const progress = (numAnswered / totalExpectedQuestions) * 100;

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-primary/25 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-xl text-foreground">Loading quiz questions...</p>
          <p className="text-sm text-gray-600">This may take a moment on mobile devices</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (loadError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-primary/25 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-lg">
          <p className="text-xl text-red-600 font-semibold">Failed to Load Quiz</p>
          <p className="text-gray-700">{loadError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
          <p className="text-sm text-gray-600 mt-4">If this problem persists, please try using a different browser or clearing your cache.</p>
        </div>
      </div>
    );
  }

  // Show message if no questions loaded
  if (!isLoading && questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-primary/25 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-xl text-gray-700">No questions available</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/25 p-4 md:p-8 overflow-x-hidden">
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
          {currentQuestions.map((question) => {
            const isSkipped = skippedQuestions.has(question.id);
            return (
              <div key={question.id} className={`space-y-4 transition-opacity duration-200 ${isSkipped ? 'opacity-50' : ''}`}>
                {/* Statement with explanation and skip icons */}
                <div className="flex items-center gap-3 mb-6 px-4 md:px-8">
                  <div className="max-w-2xl mx-auto flex items-center gap-3">
                    <h2 className={`text-xl md:text-2xl font-semibold text-center leading-relaxed flex-1 transition-colors ${
                      isSkipped ? 'text-gray-400' : 'text-foreground'
                    }`}>
                      {question.question}
                    </h2>

                    {/* Icons container - stacked vertically */}
                    <div className="flex flex-col gap-1">
                      {/* Info icon with tooltip */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              className={`flex-shrink-0 p-2 transition-colors rounded-full touch-manipulation ${
                                isSkipped
                                  ? 'text-gray-300 cursor-not-allowed'
                                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                              }`}
                              disabled={isSkipped}
                              aria-label="Show explanation"
                              onClick={() => console.log('Info button clicked', { questionId: question.id, description: question.description })}
                            >
                              <Info size={20} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="left"
                            className="w-[min(28rem,calc(100vw-6rem))] text-sm leading-relaxed"
                            sideOffset={8}
                          >
                            {question.description || `Test tooltip for question ${question.id}`}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {/* Skip/Unskip icon */}
                      {isSkipped ? (
                        <button
                          onClick={() => {
                            const newSkipped = new Set(skippedQuestions);
                            newSkipped.delete(question.id);
                            setSkippedQuestions(newSkipped);
                            // Set to neutral if no previous answer
                            if (answers[question.id] === null || answers[question.id] === undefined) {
                              handleAnswerSelect(question.id, 0.5);
                            }
                          }}
                          className="p-2 transition-colors rounded-full hover:bg-green-100 touch-manipulation text-gray-400 hover:text-green-600"
                          aria-label="Unskip question"
                        >
                          <Check size={20} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSkipQuestion(question.id)}
                          className="p-2 transition-colors rounded-full hover:bg-red-100 touch-manipulation text-gray-400 hover:text-red-500"
                          aria-label="Skip question"
                        >
                          <Ban size={20} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Show slider only when not skipped */}
                {!isSkipped && (
                  <div className="relative pt-10 md:pt-12 px-4 md:px-8">
                    {/* Current selection label - moved higher and made more prominent */}
                    {answers[question.id] !== undefined && answers[question.id] !== null && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2">
                        <span className="inline-block bg-primary/20 text-secondary font-semibold px-6 py-1.5 rounded-full text-sm md:text-base whitespace-nowrap">
                          {getValueLabel(answers[question.id]!)} • {getPercentageDisplay(answers[question.id]!)}
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
                      style={{ 
                        touchAction: 'none',
                        WebkitTouchCallout: 'none',
                        WebkitUserSelect: 'none',
                        userSelect: 'none',
                        WebkitTapHighlightColor: 'transparent'
                      }}
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
                        {answers[question.id] !== undefined && answers[question.id] !== null && (
                          <div
                            className={`absolute h-full ${
                              answers[question.id]! < 0.5 ? 'rounded-l-full' : 'rounded-r-full'
                            } ${
                              dragState?.questionId === question.id && dragState.isDragging ? '' : 'transition-all duration-100'
                            }`}
                            style={{
                              backgroundColor: getSliderColor(answers[question.id]!),
                              left: answers[question.id]! < 0.5 ? `${answers[question.id]! * 100}%` : '50%',
                              right: answers[question.id]! >= 0.5 ? `${(1 - answers[question.id]!) * 100}%` : '50%',
                              willChange: 'left, right, background-color'
                            }}
                          />
                        )}
                        {/* Center line indicator */}
                        <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-purple-300" />
                        {/* Slider thumb - now with pulsating animation when not set */}
                        <div
                          className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 md:w-5 md:h-5 bg-purple-600 rounded-full border-2 border-white shadow-lg cursor-grab active:cursor-grabbing hover:scale-110 ${
                            dragState?.questionId === question.id && dragState.isDragging ? '' : 'transition-transform duration-150'
                          }`}
                          style={{
                            left: `${(answers[question.id] ?? 0.5) * 100}%`,
                            transform: 'translateX(-50%) translateY(-50%)',
                            animation: answers[question.id] === undefined ? 'pulse-scale 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
                            WebkitTransform: 'translateX(-50%) translateY(-50%)',
                            willChange: 'transform, left',
                            WebkitBackfaceVisibility: 'hidden',
                            backfaceVisibility: 'hidden',
                            WebkitTapHighlightColor: 'transparent'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
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
          {/* For long quiz: expect 5 screens (60 questions / 12 per screen) */}
          {/* For short quiz: expect 1 screen (12 questions / 12 per screen) */}
          {(() => {
            if (quizType === 'short') {
              // Short quiz: show Submit on the final screen
              return screen < Math.ceil(questions.length / QUESTIONS_PER_SCREEN) - 1;
            } else {
              // Long quiz: always show Next until we reach the actual final screen
              // Account for Phase 2 loading - if Phase 2 hasn't loaded yet, expect it will
              const expectedTotalQuestions = phase2QuestionsLoaded ? questions.length : 60;
              const expectedTotalScreens = Math.ceil(expectedTotalQuestions / QUESTIONS_PER_SCREEN);
              return screen < expectedTotalScreens - 1;
            }
          })() ? (
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
            href="https://getvotely.com" 
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

      {/* New Comprehensive Debug Panel */}
      <DebugPanel
        isVisible={isDebugMode}
        questions={questions}
        answers={answers}
        setAnswers={setAnswers}
        quizType={quizType}
        liveScores={liveScores}
        numAnswered={numAnswered}
        totalExpectedQuestions={totalExpectedQuestions}
        screen={screen}
        totalScreens={TOTAL_SCREENS}
        validationIssues={[]} // Will be populated by enhanced validation
      />

      {/* Toast notification for skip warnings */}
      {skipWarning && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-gray-900 text-white rounded-lg px-6 py-4 shadow-lg max-w-md">
            <p className="text-sm">{skipWarning}</p>
          </div>
        </div>
      )}
    </div>
  );
}
