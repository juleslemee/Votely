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
import { AdaptivePoliticalCompass } from '../../../lib/adaptive-political-compass';
import React, { useRef, useState, useEffect, lazy, Suspense } from 'react';
import { loadGridData, findIdeologyByPosition, findDetailedIdeology, GridCellData } from '@/lib/grid-data-loader';

// Macro cell colors from the political compass
const MACRO_CELL_COLORS = {
  'EL-GL': '#ff9ea0',   // Revolutionary Communism & State Socialism
  'EM-GL': '#ff9fff',   // Authoritarian Statist Centrism
  'ER-GL': '#9f9fff',   // Authoritarian Right & Corporatist Monarchism
  'EL-GM': '#ffcfa1',   // Democratic Socialism & Left Populism
  'EM-GM': '#e5e5e5',   // Mixed-Economy Liberal Center
  'ER-GM': '#9ffffe',   // Conservative Capitalism & National Conservatism
  'EL-GR': '#9fff9e',   // Libertarian Socialism & Anarcho-Communism
  'EM-GR': '#d4fe9a',   // Social-Market Libertarianism
  'ER-GR': '#ffff9f'    // Anarcho-Capitalism & Ultra-Free-Market Libertarianism
};

// Helper function to get macro cell color
function getMacroCellColor(macroCellCode: string): string {
  return MACRO_CELL_COLORS[macroCellCode as keyof typeof MACRO_CELL_COLORS] || '#e5e5e5';
}

// Helper function to find grid data by macro cell code
function findGridDataByMacroCell(gridData: GridCellData[], macroCellCode: string): GridCellData | null {
  return gridData.find(cell => cell.macroCellCode === macroCellCode) || null;
}

// Helper function to find grid data by ideology name (for alignments)
function findGridDataByIdeology(gridData: GridCellData[], ideologyName: string): GridCellData | null {
  return gridData.find(cell => 
    cell.ideology === ideologyName || 
    cell.friendlyLabel === ideologyName ||
    cell.macroCellLabel.includes(ideologyName)
  ) || null;
}
const ResultCube = lazy(() => import('../../../components/ResultCube'));
const ResultCubeFallback = lazy(() => import('../../../components/ResultCubeFallback'));
const UnifiedShareModal = lazy(() => import('../../../components/UnifiedShareModal'));
import AboutCreator from '../../../components/AboutCreator';
import SupplementAxes from '../../../components/SupplementAxes';
import { loadSupplementAxes, calculateSupplementScores } from '@/lib/supplement-axes-loader';
import { saveQuizResult, getCoordinateRangePercentage, getTotalQuizCount, getPoliticalGroupMatches, getSurprisingAlignments, testFirebaseConnection, getWaitlistCount } from '@/lib/quiz';

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
      // Long quiz uses all 30 Phase 1 core questions - these are the question IDs from our new questions.ts
      return [
        1, 9, 17, 2, 10, 18, 3, 11, 19, 4,
        12, 20, 5, 13, 21, 6, 14, 22, 7, 15,
        23, 8, 16, 24, 25, 27, 29, 26, 28, 30
      ];
    } else {
      // Short quiz uses priority 2 questions: P01, P02, P03, P04, P09, P10, P11, P12, P17, P18
      return [1, 2, 3, 4, 9, 10, 11, 12, 17, 18];
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
    } else if (config.axis === 'authority') {
      socialScore += config.agreeDirection === 'authoritarian' ? score : -score;
      socialQuestions++;
    } else if (config.axis === 'cultural') {
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
  const [showShareModal, setShowShareModal] = useState(false);
  const [gridData, setGridData] = useState<GridCellData[]>([]);
  const [ideologyData, setIdeologyData] = useState<GridCellData | null>(null);
  const [supplementAxes, setSupplementAxes] = useState<any[]>([]);
  const [supplementScores, setSupplementScores] = useState<Record<string, number>>({});
  const hasLoadedAnalytics = useRef(false);

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

  // Load grid data and find matching ideology
  useEffect(() => {
    async function loadIdeologyData() {
      try {
        const data = await loadGridData(quizType as 'short' | 'long');
        setGridData(data);
        
        const ideology = quizType === 'long' 
          ? findDetailedIdeology(data, economic, social, progressive)
          : findIdeologyByPosition(data, economic, social);
        setIdeologyData(ideology);
        
        // Load supplement axes for long quiz
        if (quizType === 'long' && ideology?.macroCellCode) {
          const axesMap = await loadSupplementAxes();
          const macroAxes = axesMap.get(ideology.macroCellCode) || [];
          setSupplementAxes(macroAxes);
          
          // Calculate scores for these axes
          const scores = calculateSupplementScores(answers, ideology.macroCellCode, macroAxes);
          setSupplementScores(scores);
        }
      } catch (error) {
        console.error('Error loading ideology data:', error);
      }
    }
    
    loadIdeologyData();
  }, [economic, social, progressive, quizType, answers]);
  
  // Calculate display coordinates - for long quiz, adjust to cell position; for short quiz, use actual coordinates
  let displayX = economic;
  let displayY = social;
  let displayProgressive = progressive;
  
  if (quizType === 'long' && ideologyData?.coordinateRange) {
    // Parse the coordinate range to get cell boundaries
    const coordMatch = ideologyData.coordinateRange.match(/x:\s*(-?\d+\.?\d*)\s*to\s*(-?\d+\.?\d*),\s*y:\s*(-?\d+\.?\d*)\s*to\s*(-?\d+\.?\d*)/);
    if (coordMatch) {
      const [, xMinStr, xMaxStr, yMinStr, yMaxStr] = coordMatch;
      const xMin = parseFloat(xMinStr);
      const xMax = parseFloat(xMaxStr);
      const yMin = parseFloat(yMinStr);
      const yMax = parseFloat(yMaxStr);
      
      // Get cell center as the base position
      const centerX = (xMin + xMax) / 2;
      const centerY = (yMin + yMax) / 2;
      
      // Convert user's actual position to -10 to +10 scale for calculation
      const userX = economic / 10;
      const userY = social / 10;
      
      // Calculate user's offset from cell center with muted influence (0.75 effect)
      const userOffsetX = (userX - centerX) * 0.75;
      const userOffsetY = (userY - centerY) * 0.75;
      
      // Apply the muted offset to the center position
      let adjustedX = centerX + userOffsetX;
      let adjustedY = centerY + userOffsetY;
      
      // Clamp within cell boundaries to ensure we don't go outside
      adjustedX = Math.max(xMin, Math.min(xMax, adjustedX));
      adjustedY = Math.max(yMin, Math.min(yMax, adjustedY));
      
      // Add slight inward padding if at exact boundaries
      const cellWidth = xMax - xMin;
      const cellHeight = yMax - yMin;
      const padding = 0.05; // 5% padding from edges (reduced)
      
      if (adjustedX === xMin) adjustedX = adjustedX + (cellWidth * padding);
      if (adjustedX === xMax) adjustedX = adjustedX - (cellWidth * padding);
      if (adjustedY === yMin) adjustedY = adjustedY + (cellHeight * padding);
      if (adjustedY === yMax) adjustedY = adjustedY - (cellHeight * padding);
      
      // Convert back to -100 to +100 scale
      displayX = adjustedX * 10;
      displayY = adjustedY * 10;
      
      // For cultural/social score, also apply muted positioning within reasonable bounds
      // This ensures 3D cube positioning is also consistent
      displayProgressive = progressive * 0.75;
    }
  }
  
  // Convert to -10..10 scale for Vision alignment and display
  const x = toVisionScale(displayX);
  const y = toVisionScale(displayY);
  const z = toVisionScale(displayProgressive);
  const alignment = findVisionAlignment(x, y, z);

  // Save the quiz result (skip if this is a shared result)
  useEffect(() => {
    if (hasSaved.current || isShared) return;
    hasSaved.current = true;
    
    saveQuizResult({
      answers,
      result: {
        economicScore: economic,
        socialScore: social,
        alignmentLabel: ideologyData?.ideology || ideologyData?.friendlyLabel || alignment.label,
        alignmentDescription: ideologyData?.description || alignment.description,
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
    // Skip if no ideology data yet or already loaded
    if (!ideologyData || hasLoadedAnalytics.current) {
      return;
    }
    
    hasLoadedAnalytics.current = true;
    
    const loadAnalyticsData = async () => {
      console.log('Starting analytics data load...');
      
      // First test the basic Firebase connection
      const isConnected = await testFirebaseConnection();
      if (!isConnected) {
        console.error('Firebase connection test failed, aborting analytics load');
        return;
      }

      // Load all analytics data in parallel
      const [percentage, totalCount, groupMatches, waitlist] = await Promise.all([
        getCoordinateRangePercentage(economic, social, quizType as 'short' | 'long'),
        getTotalQuizCount(),
        getPoliticalGroupMatches(economic, social, progressive),
        getWaitlistCount()
      ]);
      
      // Get surprising alignments, excluding the groups already shown in "You Align With"
      const excludeGroups = groupMatches.map(group => group.name);
      const surprisingMatches = await getSurprisingAlignments(economic, social, progressive, excludeGroups);

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
  }, [economic, social, progressive, quizType, ideologyData]);




  // State for dynamic data
  const [resultPercentage, setResultPercentage] = useState<number | null>(null);
  const [totalQuizCount, setTotalQuizCount] = useState<number | string | null>(null);
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
          {isShared ? (
            <div className="inline-block bg-purple-100 border border-purple-300 text-purple-800 px-4 py-3 rounded-full text-sm font-medium mb-4">
              👤 Viewing shared results – take the quiz yourself at{' '}
              <a 
                href="https://votelyquiz.juleslemee.com" 
                className="font-semibold underline hover:no-underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                votelyquiz.juleslemee.com
              </a>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
              <span>🎯</span> Quiz Complete!
            </div>
          )}
          <h1 className="text-4xl font-bold text-foreground">Your Political Alignment</h1>
          <p className="text-foreground/60 mt-2">
            <span className="inline-flex items-center gap-1">
              <span>👥</span> You're {totalQuizCount !== null && totalQuizCount > 0 ? `1 of ${totalQuizCount.toLocaleString()}` : 'joining'} quiz takers
            </span>
          </p>
        </div>

        {/* 2x1 Grid Layout with equal height columns */}
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 lg:items-start">
          {/* Left Column - Political Compass + Founding Supporter + AboutCreator */}
          <div className="flex flex-col gap-6 contents lg:flex lg:flex-col lg:h-full">
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
                <AdaptivePoliticalCompass point={{ x, y }} quizType={quizType === 'short' ? 'short' : 'long'} />
              )}

              {/* Share Button */}
              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowShareModal(true)}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-4 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 font-medium shadow-lg hover:shadow-xl flex items-center justify-center gap-2 mx-auto"
                >
                  <span>📤</span>
                  Share & Download Your Results
                </button>
              </div>
            </div>

            {/* Become a Founding Supporter */}
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl shadow-lg p-8 text-white flex flex-col order-3 lg:order-none">
              <h3 className="text-2xl font-bold mb-4">Be the {waitlistCount + 1}{getOrdinalSuffix(waitlistCount + 1)} to join our email list</h3>
              <p className="mb-6 text-white/90">
                Stop scrolling, start doing. Get early access to the app that shows you exactly how to influence local elections and policy decisions that actually affect your life.
              </p>
              
              <ul className="space-y-3 mb-8 flex-grow">
                <li className="flex items-start gap-2">
                  <span className="text-xl">•</span>
                  <span>Get early access and shape development</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-xl">•</span>
                  <span>Show the founder you want this built</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-xl">•</span>
                  <span>Free forever guaranteed</span>
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
              </div>
              
            </div>
            
            {/* About Creator - Now in left column */}
            <div className="order-4 lg:order-none">
              <AboutCreator />
            </div>
          </div>

          {/* Right Column - User Results + Alignment sections */}
          <div className="flex flex-col gap-6 contents lg:flex lg:flex-col lg:h-full">
            {/* User Results - Single card containing everything */}
            <div className="bg-background rounded-2xl shadow-lg p-8 pb-12 flex flex-col h-full order-2 lg:order-none">
              <h2 className="text-3xl font-bold text-purple-600 mb-2">
                {quizType === 'short' ? (ideologyData?.macroCellLabel || alignment.label) : (ideologyData?.ideology || alignment.label)}
              </h2>
              <p className="text-sm text-foreground/60 mb-4">{resultPercentage !== null ? `${resultPercentage}% of quiz takers get this result` : 'Loading percentage...'}</p>
              <p className="text-foreground/80 mb-6">{ideologyData?.explanation || alignment.description}</p>
              
              {/* Recent Examples Section */}
              {ideologyData?.examples && (
                <div className="bg-gray-50 rounded-lg p-4 mb-8">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Recent Examples</h3>
                  <p className="text-sm text-gray-700">{ideologyData.examples}</p>
                </div>
              )}
              
              {/* Score Bars */}
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-purple-600">Economic Score</span>
                    <span className="text-sm text-foreground/60">{displayX < 0 ? 'Left' : 'Right'} ({Math.abs(displayX).toFixed(1)}%)</span>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 relative">
                      <div 
                        className="bg-purple-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.abs(displayX) / 2}%`,
                          marginLeft: displayX < 0 ? `${50 - Math.abs(displayX) / 2}%` : '50%'
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
                    <span className="text-sm font-medium text-purple-600">Governance Score</span>
                    <span className="text-sm text-foreground/60">{displayY > 0 ? 'Authoritarian' : 'Libertarian'} ({Math.abs(displayY).toFixed(1)}%)</span>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 relative">
                      <div 
                        className="bg-purple-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.abs(displayY) / 2}%`,
                          marginLeft: displayY < 0 ? `${50 - Math.abs(displayY) / 2}%` : '50%'
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
                    <span className="text-sm text-foreground/60">{displayProgressive < 0 ? 'Progressive' : 'Conservative'} ({Math.abs(displayProgressive).toFixed(1)}%)</span>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 relative">
                      <div 
                        className="bg-purple-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.abs(displayProgressive) / 2}%`,
                          marginLeft: displayProgressive < 0 ? `${50 - Math.abs(displayProgressive) / 2}%` : '50%'
                        }}
                      />
                    </div>
                    {/* Center line */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 h-2.5 bg-gray-400"></div>
                    <span className="absolute top-full left-1/2 transform -translate-x-1/2 text-xs text-gray-500 mt-1">Center</span>
                  </div>
                </div>
              </div>
              
              {/* Supplement Axes for Long Quiz */}
              {quizType === 'long' && supplementAxes.length > 0 && (
                <SupplementAxes
                  axes={supplementAxes}
                  scores={supplementScores}
                  macroCell={ideologyData?.macroCellLabel || ''}
                  macroCellColor={ideologyData?.macroCellCode ? getMacroCellColor(ideologyData.macroCellCode) : undefined}
                />
              )}
              
              {/* You Align With section - integrated for both quiz types */}
              {ideologyData && (
                <div className="mt-8 pt-8 border-t">
                  <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <span>👥</span> You Align With
                  </h3>
                  
                  <div className="space-y-4 mb-8">
                    {/* Single alignment */}
                    {(() => {
                      let alignmentData = null;
                      let alignmentLabel = ideologyData.alignIdeology1;
                      let alignmentColor = '#22c55e';
                      
                      if (quizType === 'short') {
                        alignmentData = findGridDataByIdeology(gridData, ideologyData.alignIdeology1);
                        if (alignmentData) {
                          alignmentLabel = alignmentData.macroCellLabel;
                          alignmentColor = getMacroCellColor(alignmentData.macroCellCode);
                        }
                      } else {
                        alignmentData = gridData.find(cell => cell.ideology === ideologyData.alignIdeology1);
                        if (alignmentData) {
                          alignmentColor = getMacroCellColor(alignmentData.macroCellCode);
                        }
                      }
                      
                      return (
                        <div 
                          className="border-l-4 pl-6 pr-4 bg-gray-50/50 rounded-r-lg py-4" 
                          style={{ 
                            borderLeftColor: alignmentColor,
                            boxShadow: `inset 4px 0 0 ${alignmentColor}, 0 1px 3px rgba(0,0,0,0.05)`
                          }}
                        >
                          <h4 className="font-semibold text-foreground">{alignmentLabel}</h4>
                          <p className="text-sm text-foreground/60">{ideologyData.alignIdeology1Text}</p>
                        </div>
                      );
                    })()}
                  </div>
                  
                  {/* What Might Surprise You */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <span>💭</span> What Might Surprise You
                    </h4>
                    <div className="space-y-3">
                      {(() => {
                        let surpriseData = null;
                        let surpriseLabel = ideologyData.surpriseIdeology1;
                        let surpriseColor = '#f59e0b';
                        
                        if (quizType === 'short') {
                          surpriseData = findGridDataByIdeology(gridData, ideologyData.surpriseIdeology1);
                          if (surpriseData) {
                            surpriseLabel = surpriseData.macroCellLabel;
                            surpriseColor = getMacroCellColor(surpriseData.macroCellCode);
                          }
                        } else {
                          surpriseData = gridData.find(cell => cell.ideology === ideologyData.surpriseIdeology1);
                          if (surpriseData) {
                            surpriseColor = getMacroCellColor(surpriseData.macroCellCode);
                          }
                        }
                        
                        return (
                          <div 
                            className="border-l-4 pl-6 pr-4 bg-gray-50/50 rounded-r-lg py-4" 
                            style={{ 
                              borderLeftColor: surpriseColor,
                              boxShadow: `inset 4px 0 0 ${surpriseColor}, 0 1px 3px rgba(0,0,0,0.05)`
                            }}
                          >
                            <h5 className="font-medium text-foreground">{surpriseLabel}</h5>
                            <p className="text-sm text-foreground/70">{ideologyData.surpriseIdeology1Text}</p>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Long Quiz CTA for Short Quiz Users */}
              {quizType === 'short' && (
                <div className="mt-8 pt-8 border-t">
                  <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <span>🎯</span> Want More Accurate Results?
                  </h3>
                  <p className="text-foreground/80 mb-4">
                    This 10-question quiz mapped you to one of 9 general regions. But political ideologies aren't monolithic. 
                    Each region contains rich internal debates and variations.
                  </p>
                  <div className="bg-purple-50 rounded-lg p-4 mb-6">
                    <p className="text-sm text-purple-900">
                      <strong>The 50-question quiz reveals:</strong>
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-purple-800">
                      <li>• Your specific ideology within your region (81 total possibilities)</li>
                      <li>• Your position on 4 additional axes unique to your political area</li>
                      <li>• More nuanced alignments and surprising connections</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => router.push('/quiz?type=long')}
                    className="w-full bg-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                  >
                    Take the Full 50-Question Quiz
                    <span className="text-sm font-normal opacity-90">(free, 5-10 minutes)</span>
                  </button>
                </div>
              )}
              
            </div>

          </div>
        </div>

      </div>

      {/* Share Modal */}
      <Suspense fallback={null}>
        <UnifiedShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          alignment={alignment}
          economic={displayX}
          social={displayY}
          progressive={displayProgressive}
          x={x}
          y={y}
          z={z}
          quizType={quizType}
          resultPercentage={resultPercentage}
          politicalGroups={politicalGroups}
          surprisingAlignments={surprisingAlignments}
          ideologyData={ideologyData}
          gridData={gridData}
          supplementAxes={supplementAxes}
          supplementScores={supplementScores}
        />
      </Suspense>
      
    </div>
  );
} 