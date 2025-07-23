'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  ANSWER_SCORES,
  QUESTION_CONFIG,
  MAX_ECONOMIC_SCORE,
  MAX_SOCIAL_SCORE,
  normalizeScore,
  toVisionScale,
  findVisionAlignment
} from './types';
import { PoliticalCompassSvg } from '../../../lib/political-compass-svg';
import React, { useRef, useState, useEffect, lazy, Suspense } from 'react';
const ResultCube = lazy(() => import('../../../components/ResultCube'));
const ResultCubeFallback = lazy(() => import('../../../components/ResultCubeFallback'));
import { saveQuizResult, getAlignmentPercentage, getTotalQuizCount, getPoliticalGroupMatches, getSurprisingAlignments, testFirebaseConnection, getWaitlistCount } from '@/lib/quiz';

// SVGs to preload for next steps
const NEXT_STEPS_SVGS = [
  '/Page 1 - Learn.svg',
  '/Page 2 - Act.svg',
  '/Page 3 - Map.svg',
];

// Preloader component that loads images in the background
function ImagePreloader() {
  useEffect(() => {
    NEXT_STEPS_SVGS.forEach(src => {
      const img = new window.Image();
      img.src = src;
    });
  }, []);

  return null;
}

function calculateScores(answers: number[], quizType: string = 'short') {
  let economicScore = 0;
  let socialScore = 0;
  let progressiveScore = 0;
  let economicQuestions = 0;
  let socialQuestions = 0;
  let progressiveQuestions = 0;

  // Convert continuous values (0-1) to score values (-2 to +2)
  const convertToScore = (value: number): number => {
    return (value - 0.5) * 4; // Maps 0->-2, 0.5->0, 1->2
  };

  // Map question indices to actual question IDs based on quiz type
  const getQuestionIds = (quizType: string): number[] => {
    if (quizType === 'long') {
      // Long quiz uses all questions 1-50
      return Array.from({ length: 50 }, (_, i) => i + 1);
    } else {
      // Short quiz uses specific question IDs: [1, 5, 4, 11, 20, 26, 29, 31, 37, 41]
      return [1, 5, 4, 11, 20, 26, 29, 31, 37, 41];
    }
  };

  const questionIds = getQuestionIds(quizType);

  questionIds.forEach((questionId, index) => {
    if (index >= answers.length) return; // Skip if we don't have an answer
    
    const continuousValue = answers[index];
    if (isNaN(continuousValue)) return; // Skip NaN values
    
    const score = convertToScore(continuousValue);
    
    // Find the config for this question ID
    const config = QUESTION_CONFIG.find(c => c.id === questionId);
    if (!config) return; // Skip if config not found

    if (config.axis === 'economic') {
      economicScore += config.agreeDirection === 'left' ? -score : score;
      economicQuestions++;
    } else if (config.axis === 'social') {
      socialScore += config.agreeDirection === 'authoritarian' ? score : -score;
      socialQuestions++;
    } else if (config.axis === 'progressive') {
      progressiveScore += config.agreeDirection === 'progressive' ? -score : score;
      progressiveQuestions++;
    }
  });

  // Calculate max possible scores based on number of questions answered
  const maxEconomicScore = economicQuestions * 2;
  const maxSocialScore = socialQuestions * 2;
  const maxProgressiveScore = progressiveQuestions * 2;

  // Prevent division by zero
  const economic = maxEconomicScore > 0 ? normalizeScore(economicScore, maxEconomicScore) : 0;
  const social = maxSocialScore > 0 ? normalizeScore(socialScore, maxSocialScore) : 0;
  const progressive = maxProgressiveScore > 0 ? normalizeScore(progressiveScore, maxProgressiveScore) : 0;

  return { economic, social, progressive };
}

function handleShare() {
  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.set('shared', 'true');
  const shareUrl = currentUrl.toString();
  
  const shareData = {
    title: 'My Political Alignment Results',
    text: 'Check out my political alignment results on Votely!',
    url: shareUrl,
  };

  if (navigator.share) {
    navigator.share(shareData).catch(() => {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(shareUrl);
    alert('Link copied to clipboard!');
  } else {
    // Fallback for very old browsers
    window.prompt('Copy this link:', shareUrl);
  }
}

// Star background effect (copied and adapted from Home)
interface Star {
  top: number;
  left: number;
  size: string;
  color: string;
  rotate: string;
}
const NUM_STARS = 110;
const MIN_DIST = 7;
const SIZES = [
  'w-8 h-8', 'w-10 h-10', 'w-12 h-12', 'w-14 h-14', 'w-16 h-16', 'w-20 h-20',
  'w-24 h-24', 'w-28 h-28', 'w-32 h-32', 'w-40 h-40',
];
const COLORS = [
  'text-primary','text-secondary'
];
const ROTATIONS = ['rotate-0', 'rotate-3', 'rotate-6', 'rotate-12', '-rotate-3', '-rotate-6', '-rotate-12', 'rotate-45', '-rotate-45'];
function randomStar(existing: Star[]): Star {
  let tries = 0;
  while (tries < 100) {
    const top = Math.random() * 95 + 2;
    const left = Math.random() * 95 + 2;
    if (existing.every((s: Star) => {
      const dx = s.left - left;
      const dy = s.top - top;
      return Math.sqrt(dx * dx + dy * dy) > MIN_DIST;
    })) {
      return {
        top,
        left,
        size: SIZES[Math.floor(Math.random() * SIZES.length)] + ' md:' + SIZES[Math.floor(Math.random() * SIZES.length)],
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotate: ROTATIONS[Math.floor(Math.random() * ROTATIONS.length)],
      };
    }
    tries++;
  }
  return {
    top: Math.random() * 95 + 2,
    left: Math.random() * 95 + 2,
    size: SIZES[Math.floor(Math.random() * SIZES.length)] + ' md:' + SIZES[Math.floor(Math.random() * SIZES.length)],
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    rotate: ROTATIONS[Math.floor(Math.random() * ROTATIONS.length)],
  };
}
const starPattern: Star[] = [];
for (let i = 0; i < NUM_STARS; i++) {
  const isTop = i < Math.floor(NUM_STARS * 2 / 3);
  let star: Star;
  let tries = 0;
  do {
    star = randomStar(starPattern);
    if (isTop && star.top > 50) star.top = Math.random() * 45 + 2;
    tries++;
  } while (starPattern.some(s => Math.sqrt((s.left - star.left) ** 2 + (s.top - star.top) ** 2) < MIN_DIST) && tries < 10);
  starPattern.push(star);
}

// Emoji map for each alignment
const alignmentEmojis: Record<string, string> = {
  'Revolutionary Socialist': '🚩',
  'Welfare Commander': '🛡️',
  'Homeland Defender': '🏰',
  'Order-First Conservative': '⚖️',
  'Structured Progressive': '🏛️',
  "People's Advocate": '🗣️',
  'Structured Capitalist': '🏦',
  'Tradition Capitalist': '💼',
  'Cooperative Dreamer': '🤝',
  'Collective Rebel': '✊',
  'Underground Organizer': '🕵️',
  'Freedom Entrepreneur': '🚀',
  'Localist Organizer': '🌱',
  'Green Radical': '🌍',
  'Minimalist Libertarian': '🦅',
  'Radical Capitalist': '💸',
  'Pragmatic Moderate': '⚪',
};

function getOrdinalSuffix(n: number): string {
  const j = n % 10;
  const k = n % 100;
  if (j === 1 && k !== 11) {
    return 'st';
  }
  if (j === 2 && k !== 12) {
    return 'nd';
  }
  if (j === 3 && k !== 13) {
    return 'rd';
  }
  return 'th';
}

export default function ResultsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const answersParam = searchParams.get('answers');
  const quizType = searchParams.get('type') || 'short';
  const isShared = searchParams.get('shared') === 'true';
  const graphRef = useRef<HTMLDivElement>(null);
  const [graphSize, setGraphSize] = useState({ width: 0, height: 0 });
  const [docId, setDocId] = useState<string | null>(null);
  const hasSaved = useRef(false);
  const [view3D, setView3D] = useState(true);

  useEffect(() => {
    if (!graphRef.current) return;
    const rect = graphRef.current.getBoundingClientRect();
    setGraphSize({ width: rect.width, height: rect.height });
  }, []);

  if (!answersParam) {
    return <div>No results found. Please take the quiz first.</div>;
  }

  const answers = answersParam.split(',').map(val => {
    const num = parseFloat(val);
    return isNaN(num) ? 0.5 : num; // Default to neutral if parsing fails
  });
  
  const { economic, social, progressive } = calculateScores(answers, quizType);
  // Convert to -10..10 scale for Vision alignment
  const x = toVisionScale(economic);
  const y = toVisionScale(social);
  const alignment = findVisionAlignment(x, y);

  // Save the quiz result (skip if this is a shared result)
  useEffect(() => {
    if (hasSaved.current || isShared) return;
    hasSaved.current = true;
    
    saveQuizResult({
      answers,
      result: {
        economicScore: economic,
        socialScore: social,
        alignmentLabel: alignment.label,
        alignmentDescription: alignment.description,
      },
    })
      .then(id => {
        console.log('Quiz result saved successfully with ID:', id);
        setDocId(id);
      })
      .catch(error => {
        console.error('Failed to save quiz result:', error);
        console.error('Error details:', error.message, error.code);
      });
  }, [answers, economic, social, alignment, isShared]);

  // Load analytics data
  useEffect(() => {
    const loadAnalyticsData = async () => {
      console.log('Starting analytics data load...');
      
      // First test the basic Firebase connection
      const isConnected = await testFirebaseConnection();
      if (!isConnected) {
        console.error('Firebase connection test failed, aborting analytics load');
        return;
      }

      // Load all analytics data in parallel
      const [percentage, totalCount, groupMatches, surprisingMatches, waitlist] = await Promise.all([
        getAlignmentPercentage(alignment.label),
        getTotalQuizCount(),
        getPoliticalGroupMatches(economic, social),
        getSurprisingAlignments(economic, social),
        getWaitlistCount()
      ]);

      console.log('Analytics data loaded:', { percentage, totalCount, groupMatches, surprisingMatches });

      setResultPercentage(percentage);
      setTotalQuizCount(totalCount);
      setPoliticalGroups(groupMatches);
      setSurprisingAlignments(surprisingMatches);
      setWaitlistCount(waitlist);
    };

    loadAnalyticsData().catch(error => {
      console.error('Error loading analytics data:', error);
    });
  }, [alignment.label, economic, social]);




  // State for dynamic data
  const [resultPercentage, setResultPercentage] = useState<number | null>(null);
  const [totalQuizCount, setTotalQuizCount] = useState<number | null>(null);
  const [politicalGroups, setPoliticalGroups] = useState<Array<{name: string, description: string, match: number}>>([]);
  const [surprisingAlignments, setSurprisingAlignments] = useState<Array<{group: string, commonGround: string}>>([]);
  const [waitlistCount, setWaitlistCount] = useState<number>(0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/10 p-4 md:p-8 relative overflow-hidden">
      {/* Star background */}
      <div className="absolute inset-0 pointer-events-none select-none z-0">
        {starPattern.map((star, i) => (
          <svg
            key={i}
            className={`absolute opacity-20 ${star.size} ${star.color} ${star.rotate}`}
            style={{
              top: `${star.top}%`,
              left: `${star.left}%`,
            }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <polygon points="12,2 15,10 23,10 17,15 19,23 12,18 5,23 7,15 1,10 9,10" />
          </svg>
        ))}
      </div>
      
      {/* Main content */}
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          {isShared && (
            <div className="inline-block bg-purple-100 border border-purple-300 text-purple-800 px-4 py-2 rounded-full text-sm font-medium mb-4 mr-2">
              👤 Viewing shared results
            </div>
          )}
          <div className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
            <span>🎯</span> Quiz Complete!
          </div>
          <h1 className="text-4xl font-bold text-foreground">Your Political Alignment</h1>
          <p className="text-foreground/60 mt-2">
            <span className="inline-flex items-center gap-1">
              <span>👥</span> You're {totalQuizCount !== null && totalQuizCount > 0 ? `1 of ${totalQuizCount.toLocaleString()}` : 'joining'} quiz takers
            </span>
          </p>
        </div>

        {/* 2x2 Grid Layout with custom proportions */}
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6">
          {/* Left Column - Political Compass + Founding Supporter */}
          <div className="flex flex-col gap-6 contents lg:flex lg:flex-col">
            {/* Political Compass */}
            <div ref={graphRef} className="bg-background rounded-2xl shadow-lg p-8 relative order-1 lg:order-none">
              {/* View Toggle and Instructions */}
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-600">
                  {view3D ? 'Click and drag to rotate the 3D cube' : 'Your political position on the traditional compass'}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">2D</span>
                  <button
                    onClick={() => setView3D(!view3D)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                      view3D ? 'bg-purple-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        view3D ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-gray-600">3D</span>
                </div>
              </div>

              {view3D ? (
                <Suspense fallback={<div className="h-[400px] flex items-center justify-center">Loading 3D visualization...</div>}>
                  {typeof window !== 'undefined' && 'WebGLRenderingContext' in window ? (
                    <ResultCube
                      x={economic}
                      y={social}
                      z={progressive}
                      ideologyLabel={alignment.label}
                      onInteraction={(type) => console.log('Interaction:', type)}
                    />
                  ) : (
                    <ResultCubeFallback
                      x={economic}
                      y={social}
                      z={progressive}
                      ideologyLabel={alignment.label}
                    />
                  )}
                </Suspense>
              ) : (
                <PoliticalCompassSvg point={{ x, y }} />
              )}
            </div>

            {/* Become a Founding Supporter */}
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl shadow-lg p-8 text-white flex-1 flex flex-col order-4 lg:order-none">
              <h3 className="text-2xl font-bold mb-4">Be the {waitlistCount + 1}{getOrdinalSuffix(waitlistCount + 1)} to join our email list</h3>
              <p className="mb-6 text-white/90">
                Stop scrolling, start doing. Get early access to the app that shows you exactly how to influence local elections and policy decisions that actually affect your life.
              </p>
              
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-start gap-2">
                  <span className="text-xl">•</span>
                  <span>Early access to new features</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-xl">•</span>
                  <span>Show the founder you actually want the app</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-xl">•</span>
                  <span>Shape the app's development</span>
                </li>
              </ul>
              
              <div className="space-y-3">
                <button 
                  className="w-full bg-white text-purple-600 font-semibold py-3 px-6 rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                  onClick={() => {
                    if (docId) {
                      router.push(`/quiz/next?resultId=${docId}`);
                    } else {
                      router.push('/quiz/next');
                    }
                  }}
                >
                  <span>✉️</span> Join as Founding Supporter
                </button>
                
                <button 
                  className="w-full bg-white/20 backdrop-blur text-white font-medium py-3 px-6 rounded-xl hover:bg-white/30 transition-colors flex items-center justify-center gap-2"
                  onClick={handleShare}
                >
                  <span>🔗</span> Share Your Results
                </button>
              </div>
              
              <p className="text-center text-white/60 text-sm mt-auto pt-6">
                <span>⭐</span> Join {waitlistCount > 0 ? waitlistCount.toLocaleString() : ''} political enthusiasts
              </p>
            </div>
          </div>

          {/* Right Column - User Results + You Align With */}
          <div className="flex flex-col gap-6 h-full contents lg:flex lg:flex-col">
            {/* User Results (takes more vertical space) */}
            <div className="bg-background rounded-2xl shadow-lg p-8 pb-12 order-2 lg:order-none" style={{ flex: '0 0 auto' }}>
              <h2 className="text-3xl font-bold text-purple-600 mb-2">{alignment.label}</h2>
              <p className="text-sm text-foreground/60 mb-4">{resultPercentage !== null ? `${resultPercentage}% of quiz takers get this result` : 'Loading percentage...'}</p>
              <p className="text-foreground/80 mb-8">{alignment.description}</p>
              
              {/* Score Bars */}
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-purple-600">Economic Score</span>
                    <span className="text-sm text-foreground/60">{economic < 0 ? 'Left' : 'Right'} ({Math.abs(economic).toFixed(1)}%)</span>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 relative">
                      <div 
                        className="bg-purple-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.abs(economic) / 2}%`,
                          marginLeft: economic < 0 ? `${50 - Math.abs(economic) / 2}%` : '50%'
                        }}
                      />
                    </div>
                    {/* Center line */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 h-2.5 bg-gray-400"></div>
                    <span className="absolute top-full left-1/2 transform -translate-x-1/2 text-xs text-gray-500 mt-1">Center</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-purple-600">Social Score</span>
                    <span className="text-sm text-foreground/60">{social > 0 ? 'Authoritarian' : 'Libertarian'} ({Math.abs(social).toFixed(1)}%)</span>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 relative">
                      <div 
                        className="bg-purple-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.abs(social) / 2}%`,
                          marginLeft: social < 0 ? `${50 - Math.abs(social) / 2}%` : '50%'
                        }}
                      />
                    </div>
                    {/* Center line */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 h-2.5 bg-gray-400"></div>
                    <span className="absolute top-full left-1/2 transform -translate-x-1/2 text-xs text-gray-500 mt-1">Center</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-purple-600">Progressive-Conservative Score</span>
                    <span className="text-sm text-foreground/60">{progressive < 0 ? 'Progressive' : 'Conservative'} ({Math.abs(progressive).toFixed(1)}%)</span>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 relative">
                      <div 
                        className="bg-purple-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.abs(progressive) / 2}%`,
                          marginLeft: progressive < 0 ? `${50 - Math.abs(progressive) / 2}%` : '50%'
                        }}
                      />
                    </div>
                    {/* Center line */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 h-2.5 bg-gray-400"></div>
                    <span className="absolute top-full left-1/2 transform -translate-x-1/2 text-xs text-gray-500 mt-1">Center</span>
                  </div>
                </div>
              </div>
            </div>

            {/* You Align With (smaller card that fills remaining space) */}
            <div className="bg-background rounded-2xl shadow-lg p-8 min-h-0 overflow-auto order-3 lg:order-none">
              <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <span>👥</span> You Align With
              </h3>
              <p className="text-foreground/60 mb-6">Based on your responses, here are the political groups that share similar views:</p>
              
              <div className="space-y-4 mb-8">
                {politicalGroups.map((group, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-start mb-2 gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground">{group.name}</h4>
                        <p className="text-sm text-foreground/60">{group.description}</p>
                      </div>
                      <span className="text-sm font-medium text-purple-600 whitespace-nowrap flex flex-col items-end flex-shrink-0">
                        <span>{group.match}%</span>
                        <span>match</span>
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${group.match}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              {/* What Might Surprise You */}
              <div className="border-t pt-6">
                <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span>💭</span> What Might Surprise You
                </h4>
                <div className="space-y-3">
                  {surprisingAlignments.map((item, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <h5 className="font-medium text-sm text-purple-600 mb-1">{item.group}</h5>
                      <p className="text-xs text-foreground/70">{item.commonGround}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
} 