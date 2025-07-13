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
import React, { useRef, useState, useEffect } from 'react';
import { saveQuizResult } from '@/lib/quiz';

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
  let economicQuestions = 0;
  let socialQuestions = 0;

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
    } else {
      socialScore += config.agreeDirection === 'authoritarian' ? score : -score;
      socialQuestions++;
    }
  });

  // Calculate max possible scores based on number of questions answered
  const maxEconomicScore = economicQuestions * 2;
  const maxSocialScore = socialQuestions * 2;

  // Prevent division by zero
  const economic = maxEconomicScore > 0 ? normalizeScore(economicScore, maxEconomicScore) : 0;
  const social = maxSocialScore > 0 ? normalizeScore(socialScore, maxSocialScore) : 0;

  return { economic, social };
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

export default function ResultsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const answersParam = searchParams.get('answers');
  const quizType = searchParams.get('type') || 'short';
  const isShared = searchParams.get('shared') === 'true';
  const graphRef = useRef<HTMLDivElement>(null);
  const [showMotionDot, setShowMotionDot] = useState(true);
  const [graphSize, setGraphSize] = useState({ width: 0, height: 0 });
  const [docId, setDocId] = useState<string | null>(null);
  const hasSaved = useRef(false);

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
  
  const { economic, social } = calculateScores(answers, quizType);
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
      .then(id => setDocId(id))
      .catch(console.error);
  }, [answers, economic, social, alignment, isShared]);


  // Calculate dot position (convert -10..10 to 0..100 for CSS/SVG)
  const dotX = ((x + 10) / 20) * 100;
  const dotY = ((10 - y) / 20) * 100;

  // Calculate pixel positions for motion path
  const startX = graphSize.width / 2;
  const startY = graphSize.height / 2;
  const endX = (dotX / 100) * graphSize.width;
  const endY = (dotY / 100) * graphSize.height;
  const overshootX = endX + (endX - startX) * -0.10; // 5% past the target
  const overshootY = endY + (endY - startY) * -0.10;
  const motionPath = `M ${startX} ${startY} Q ${overshootX} ${overshootY}, ${endX} ${endY}`;

  // Hide the motion dot after animation
  useEffect(() => {
    if (!showMotionDot) return;
    const timeout = setTimeout(() => setShowMotionDot(false), 1300); // animation duration + buffer
    return () => clearTimeout(timeout);
  }, [showMotionDot]);

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
      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        <div className="text-center space-y-4">
          {isShared && (
            <div className="inline-block bg-purple-100 border border-purple-300 text-purple-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              👤 Viewing shared results
            </div>
          )}
          <h1 className="text-4xl font-bold text-foreground">Your Political Alignment</h1>
          <div className="inline-block bg-background rounded-2xl shadow-lg p-6 space-y-2">
            <h2 className="text-3xl md:text-4xl font-extrabold flex items-center justify-center gap-2">
              <span>{alignmentEmojis[alignment.label]}</span>
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{alignment.label}</span>
            </h2>
            <p className="text-foreground/60 max-w-2xl mx-auto text-center">
              {alignment.description}
            </p>
            <div className="mt-4 flex flex-col items-center text-sm text-foreground/80">
              <div className="mb-1 text-center"><span className="font-semibold">Real Ideologies:</span> {alignment.realIdeologies}</div>
              <div className="text-center"><span className="font-semibold">Recent Examples:</span> {alignment.usExamples}</div>
            </div>
          </div>
        </div>

        <div ref={graphRef} className="relative aspect-square max-w-2xl mx-auto rounded-2xl shadow-lg p-16 bg-background backdrop-blur-md">
          {/* Only show the static dot after animation */}
          <PoliticalCompassSvg point={!showMotionDot ? { x, y } : undefined} />
          {showMotionDot && graphSize.width > 0 && graphSize.height > 0 && (
            <div
              className="motion-dot absolute w-6 h-6 rounded-full z-10"
              style={{
                background: '#6B21A8', // grape color
                border: '3px solid #4B006E',
                boxShadow: '0 0 0 4px #C4B5FD44',
                left: 0,
                top: 0,
                transform: 'translate(-50%, -50%)',
              }}
            />
          )}
        </div>
        <style jsx global>{`
          .motion-dot {
            offset-path: path('${motionPath}');
            offset-distance: 0%;
            animation: move-dot 1.2s cubic-bezier(0.4, 0.6, 0.2, 1) forwards;
          }
          @keyframes move-dot {
            to {
              offset-distance: 80%;
            }
          }
        `}</style>

        {/* Score details and action buttons in a responsive grid */}
        <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto mt-6">
          <div className="bg-white rounded-xl shadow p-4 text-center flex flex-col justify-center items-center text-xs md:text-base">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Economic Score</div>
            <div className="text-lg md:text-2xl font-semibold text-purple-600">
              {economic < 0 ? 'Left' : 'Right'} ({economic.toFixed(1)}%)
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center flex flex-col justify-center items-center text-xs md:text-base">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Social Score</div>
            <div className="text-lg md:text-2xl font-semibold text-purple-600">
              {social > 0 ? 'Authoritarian' : 'Libertarian'} ({social.toFixed(1)}%)
            </div>
          </div>
          <button 
            className="w-full p-3 md:p-6 text-base md:text-xl text-white bg-purple-600 rounded-2xl hover:bg-purple-700 transition-colors col-span-1"
            onClick={handleShare}
          >
            Share With Friends
          </button>
          <div className="relative col-span-1">
            {/* Background layer for depth effect */}
            <div className="absolute inset-0 bg-[#6200B3] rounded-2xl transform translate-x-1 translate-y-1"></div>
            {/* Main button */}
            <button 
              className="relative w-full p-3 md:p-6 text-base md:text-xl font-semibold text-white bg-[#6200B3] rounded-2xl hover:bg-[#4B006E] active:transform active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 shadow-lg"
              onClick={() => {
                if (docId) {
                  router.push(`/quiz/next?resultId=${docId}`);
                } else {
                  router.push('/quiz/next');
                }
              }}
            >
              Next Steps
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 