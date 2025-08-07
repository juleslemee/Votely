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
import { loadGridData, findIdeologyByPosition, findDetailedIdeology, findDetailedIdeologyWithSupplementary, GridCellData } from '@/lib/grid-data-loader';
import { getSessionById, QuizSession } from '@/lib/quiz-session';

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
import { saveQuizResult, getQuizResultById, getCoordinateRangePercentage, getTotalQuizCount, getPoliticalGroupMatches, getSurprisingAlignments, testFirebaseConnection, getWaitlistCount } from '@/lib/quiz';
import { loadPhase2QuestionData } from '@/lib/phase2-question-loader';

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

async function calculateScores(answers: number[], questionIds: number[], quizType: string = 'short', phase2Data?: Map<number, { supplementAxis: string; agreeDir: -1 | 1 }>, debugMode: boolean = false, questionData?: any[]) {
  let economicScore = 0;
  let socialScore = 0;
  let progressiveScore = 0;
  let economicQuestions = 0;
  let socialQuestions = 0;
  let progressiveQuestions = 0;

  // Phase 2 scoring for supplementary axes
  const supplementaryScores: Record<string, { score: number; count: number }> = {};

  // Convert continuous values (0-1) to score values (-2 to +2)
  const convertToScore = (value: number): number => {
    return (value - 0.5) * 4; // Maps 0->-2, 0.5->0, 1->2
  };

  // Legacy mode: if no questionIds provided, use hardcoded mapping
  if (questionIds.length === 0) {
    // Fallback to legacy hardcoded IDs for backward compatibility
    const legacyIds = quizType === 'long' 
      ? [1, 9, 17, 2, 10, 18, 3, 11, 19, 4, 12, 20, 5, 13, 21, 6, 14, 22, 7, 15, 23, 8, 16, 24, 25, 27, 29, 26, 28, 30]
      : [1, 2, 3, 4, 9, 10, 11, 12, 17, 18];
    questionIds = legacyIds.slice(0, answers.length);
  }

  // Load Phase 2 data if needed and not provided
  if (!phase2Data && questionIds.some(id => id >= 1000)) {
    phase2Data = await loadPhase2QuestionData();
  }

  if (debugMode) {
    console.log('🔍 DEBUG MODE - Scoring Details:');
    console.log(`Quiz Type: ${quizType}`);
    console.log(`Total Answers: ${answers.length}`);
    console.log(`Question IDs: ${questionIds.length > 0 ? questionIds.join(', ') : 'Legacy mode'}`);
  }

  // Process each answer with its corresponding question ID
  answers.forEach((continuousValue, index) => {
    if (index >= questionIds.length) return; // Skip if we don't have a question ID
    if (isNaN(continuousValue)) return; // Skip NaN values
    
    const questionId = questionIds[index];
    const score = convertToScore(continuousValue);
    
    // Check if this is a Phase 2 question (ID >= 1000)
    if (questionId >= 1000) {
      // Handle Phase 2 supplementary axis questions
      // First check if we have supplementAxis in questionData (from session)
      if (questionData && questionData[index] && questionData[index].supplementAxis) {
        const { supplementAxis, agreeDir } = questionData[index];
        
        // Initialize axis if not exists
        if (!supplementaryScores[supplementAxis]) {
          supplementaryScores[supplementAxis] = { score: 0, count: 0 };
        }
        
        // Apply agree direction: -1 means agreeing is negative on axis, 1 means agreeing is positive
        const contribution = (agreeDir || 1) * score;
        supplementaryScores[supplementAxis].score += contribution;
        supplementaryScores[supplementAxis].count++;
        
        if (debugMode) {
          console.log(`  Q${questionId} (${supplementAxis}): Answer=${continuousValue.toFixed(2)}, Score=${score.toFixed(2)}, AgreeDir=${agreeDir}, Contribution=${contribution.toFixed(2)}`);
        }
      } else if (phase2Data) {
        // Fallback to phase2Data if available
        const phase2Question = phase2Data.get(questionId);
        if (phase2Question) {
          const { supplementAxis, agreeDir } = phase2Question;
          
          // Initialize axis if not exists
          if (!supplementaryScores[supplementAxis]) {
            supplementaryScores[supplementAxis] = { score: 0, count: 0 };
          }
          
          // Apply agree direction: -1 means agreeing is negative on axis, 1 means agreeing is positive
          const contribution = agreeDir * score;
          supplementaryScores[supplementAxis].score += contribution;
          supplementaryScores[supplementAxis].count++;
          
          if (debugMode) {
            console.log(`  Q${questionId} (${supplementAxis}): Answer=${continuousValue.toFixed(2)}, Score=${score.toFixed(2)}, AgreeDir=${agreeDir}, Contribution=${contribution.toFixed(2)}`);
          }
        } else {
          console.warn(`Phase 2 question ${questionId} not found in data`);
        }
      } else {
        console.warn(`Phase 2 question ${questionId} has no supplementAxis data`);
      }
      return;
    }
    
    // Try to use question data if provided, otherwise fall back to config
    let config = null;
    let agreeDir = 1;
    
    if (questionData && questionData[index]) {
      const qData = questionData[index];
      config = { axis: qData.axis };
      agreeDir = qData.agreeDir || 1;
    } else {
      // Find the config for Phase 1 questions
      config = QUESTION_CONFIG.find(c => c.id === questionId);
      if (!config) {
        console.warn(`No config found for question ID ${questionId}`);
        return;
      }
      // Convert old agreeDirection format to numeric agreeDir
      if (config.axis === 'economic') {
        agreeDir = config.agreeDirection === 'left' ? -1 : 1;
      } else if (config.axis === 'authority') {
        agreeDir = config.agreeDirection === 'authoritarian' ? 1 : -1;
      } else if (config.axis === 'cultural') {
        agreeDir = config.agreeDirection === 'progressive' ? -1 : 1;
      }
    }

    let contribution = 0;
    let axisName = '';

    if (config.axis === 'economic') {
      contribution = score * agreeDir;
      economicScore += contribution;
      economicQuestions++;
      axisName = 'Economic';
    } else if (config.axis === 'authority') {
      contribution = score * agreeDir;
      socialScore += contribution;
      socialQuestions++;
      axisName = 'Authority';
    } else if (config.axis === 'cultural') {
      contribution = score * agreeDir;
      progressiveScore += contribution;
      progressiveQuestions++;
      axisName = 'Cultural';
    }
    
    if (debugMode) {
      console.log(`  Q${questionId} (${axisName}): Answer=${continuousValue.toFixed(2)}, Score=${score.toFixed(2)}, AgreeDir=${agreeDir}, Contribution=${contribution.toFixed(2)}`);
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

  // Convert supplementary scores to normalized values
  const supplementary: Record<string, number> = {};
  if (debugMode && Object.keys(supplementaryScores).length > 0) {
    console.log('🔍 Supplementary scores before normalization:', supplementaryScores);
  }
  Object.entries(supplementaryScores).forEach(([axis, data]) => {
    if (data.count > 0) {
      const maxScore = data.count * 2;
      supplementary[axis] = normalizeScore(data.score, maxScore);
    }
  });

  if (debugMode) {
    console.log('\n📊 Final Scores:');
    console.log(`  Economic: ${economic.toFixed(1)} (Raw: ${economicScore}/${maxEconomicScore})`);
    console.log(`  Authority: ${social.toFixed(1)} (Raw: ${socialScore}/${maxSocialScore})`);
    console.log(`  Cultural: ${progressive.toFixed(1)} (Raw: ${progressiveScore}/${maxProgressiveScore})`);
    if (Object.keys(supplementary).length > 0) {
      console.log('\n  Supplementary Axes:');
      Object.entries(supplementary).forEach(([axis, score]) => {
        const rawData = supplementaryScores[axis];
        console.log(`    ${axis}: ${score.toFixed(1)} (Raw: ${rawData.score}/${rawData.count * 2})`);
      });
    }
  }

  return { economic, social, progressive, supplementary };
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
  const firebaseId = searchParams.get('id'); // Firebase document ID
  const sessionIdParam = searchParams.get('sessionId');
  const dataParam = searchParams.get('data');
  const answersParam = searchParams.get('answers');
  const questionIdsParam = searchParams.get('questionIds');
  const quizType = searchParams.get('type') || 'short';
  const isShared = searchParams.get('shared') === 'true';
  const isDebugMode = searchParams.get('debug') === 'true';
  const graphRef = useRef<HTMLDivElement>(null);
  const [graphSize, setGraphSize] = useState({ width: 0, height: 0 });
  const [docId, setDocId] = useState<string | null>(firebaseId);
  const hasSaved = useRef(false);
  const [view3D, setView3D] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [gridData, setGridData] = useState<GridCellData[]>([]);
  const [ideologyData, setIdeologyData] = useState<GridCellData | null>(null);
  const [supplementAxes, setSupplementAxes] = useState<any[]>([]);
  const [supplementScores, setSupplementScores] = useState<Record<string, number>>({});
  const hasLoadedAnalytics = useRef(false);
  const [isLoadingFirebase, setIsLoadingFirebase] = useState(false);
  
  // Store calculated scores
  const [scores, setScores] = useState<{
    economic: number;
    social: number;
    progressive: number;
    supplementary: Record<string, number>;
  } | null>(null);

  // State for parsed data
  const [answers, setAnswers] = useState<number[]>([]);
  const [questionIds, setQuestionIds] = useState<number[]>([]);
  const [questionData, setQuestionData] = useState<any[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Parse question data from Firebase, session or URL params
  useEffect(() => {
    let parsedAnswers: number[] = [];
    let parsedQuestionIds: number[] = [];
    let parsedQuestionData: any[] = [];
    
    // First priority: Load from Firebase if ID provided
    if (firebaseId) {
      console.log('🔥 Loading result from Firebase:', firebaseId);
      setIsLoadingFirebase(true);
      
      getQuizResultById(firebaseId)
        .then(data => {
          if (data) {
            console.log('✅ Loaded from Firebase:', data);
            
            // Set the pre-calculated scores directly
            if (data.result) {
              setScores({
                economic: data.result.economicScore,
                social: data.result.socialScore,
                progressive: data.result.progressiveScore || 0,
                supplementary: data.result.supplementaryScores || {}
              });
              
              // Set ideology data if available
              if (data.result.alignmentLabel) {
                // The ideology is already calculated, just display it
                setIdeologyData({
                  ideology: data.result.alignmentLabel,
                  explanation: data.result.alignmentDescription,
                  friendlyLabel: data.result.alignmentLabel
                } as any);
              }
            }
            
            // Set answers if we need them for the graph
            if (data.answers) {
              setAnswers(data.answers);
              setDataLoaded(true);
            }
            
            // Mark as already saved
            hasSaved.current = true;
          } else {
            console.error('No data found for Firebase ID:', firebaseId);
          }
        })
        .catch(error => {
          console.error('Error loading from Firebase:', error);
        })
        .finally(() => {
          setIsLoadingFirebase(false);
        });
      
      return; // Skip other loading methods
    }
    
    if (sessionIdParam) {
      console.log('🔍 Attempting to load session:', sessionIdParam);
      console.log('Window defined?', typeof window !== 'undefined');
      
      // Load from session
      const session = getSessionById(sessionIdParam);
      console.log('Session loaded?', !!session);
      
      if (session) {
        console.log('📂 Loading results from session:', sessionIdParam);
        console.log('Session questions:', session.questions?.length || 0);
        console.log('Session answers:', Object.keys(session.answers || {}).length);
        
        // Validate session has required data
        if (!session.questions || !session.answers) {
          console.error('Session missing questions or answers:', session);
          return;
        }
        
        const sessionAnswers = session.answers;
        parsedAnswers = session.questions.map(q => sessionAnswers[q.id] ?? 0.5);
        parsedQuestionIds = session.questions.map(q => q.id);
        parsedQuestionData = session.questions.map(q => ({
          id: q.id,
          axis: q.axis,
          agreeDir: q.agreeDir,
          answer: sessionAnswers[q.id] ?? 0.5,
          supplementAxis: q.supplementAxis
        }));
        
        console.log('Parsed answers:', parsedAnswers.length);
        console.log('Parsed question IDs:', parsedQuestionIds.length);
      } else {
        console.error('Session not found:', sessionIdParam);
        console.log('Checking localStorage directly...');
        const stored = localStorage.getItem('votely_quiz_session_all');
        if (stored) {
          const all = JSON.parse(stored);
          console.log('Available sessions:', Object.keys(all));
        }
      }
    } else if (dataParam) {
      // New format: decode base64 question data
      try {
        const decoded = JSON.parse(atob(decodeURIComponent(dataParam)));
        parsedQuestionData = decoded;
        parsedAnswers = decoded.map((q: any) => q.answer);
        parsedQuestionIds = decoded.map((q: any) => q.id);
      } catch (error) {
        console.error('Failed to decode question data:', error);
      }
    } else if (answersParam) {
      // Legacy format: separate answers and question IDs
      parsedAnswers = answersParam.split(',').map(val => {
        const num = parseFloat(val);
        return isNaN(num) ? 0.5 : num; // Default to neutral if parsing fails
      });
      parsedQuestionIds = questionIdsParam ? questionIdsParam.split(',').map(id => parseInt(id)) : [];
      
      // For legacy URLs with 50 answers but no question IDs, try to reconstruct
      if (parsedAnswers.length === 50 && parsedQuestionIds.length === 0 && quizType === 'long') {
        console.log('⚠️ Reconstructing quiz from legacy URL with 50 answers');
        // Phase 1: 30 questions with standard IDs
        const phase1Ids = [1, 9, 17, 2, 10, 18, 3, 11, 19, 4, 12, 20, 5, 13, 21, 6, 14, 22, 7, 15, 23, 8, 16, 24, 25, 27, 29, 26, 28, 30];
        // Phase 2: 20 questions with high IDs (we'll assign generic ones)
        const phase2Ids = Array.from({length: 20}, (_, i) => 1000 + i);
        parsedQuestionIds = [...phase1Ids, ...phase2Ids];
        console.log('🔄 Using reconstructed question IDs for scoring');
      }
    }
    
    setAnswers(parsedAnswers);
    setQuestionIds(parsedQuestionIds);
    setQuestionData(parsedQuestionData);
    setDataLoaded(true);
    console.log('Data loaded:', { answers: parsedAnswers.length, questionIds: parsedQuestionIds.length });
  }, [sessionIdParam, dataParam, answersParam, questionIdsParam, quizType]);

  useEffect(() => {
    if (!graphRef.current) return;
    const rect = graphRef.current.getBoundingClientRect();
    setGraphSize({ width: rect.width, height: rect.height });
  }, []);
  
  // Calculate scores when data is loaded
  useEffect(() => {
    // Wait for data to be loaded and check if we have answers
    if (!dataLoaded || answers.length === 0) return;
    
    async function computeScores() {
      console.log('Computing scores with:', { answers: answers.length, questionIds: questionIds.length });
      const result = await calculateScores(answers, questionIds, quizType, undefined, isDebugMode, questionData);
      setScores(result);
      setSupplementScores(result.supplementary);
    }
    computeScores();
  }, [dataLoaded, answers, questionIds, questionData, quizType, isDebugMode]);
  
  // Extract scores safely
  const economic = scores?.economic || 0;
  const social = scores?.social || 0;
  const progressive = scores?.progressive || 0;

  // Load grid data and find matching ideology
  useEffect(() => {
    async function loadIdeologyData() {
      try {
        const data = await loadGridData(quizType as 'short' | 'long');
        setGridData(data);
        
        let ideology;
        if (quizType === 'long' && Object.keys(supplementScores).length > 0) {
          // Use weighted distance calculation with supplementary scores
          ideology = await findDetailedIdeologyWithSupplementary(
            data, 
            economic, 
            social, 
            supplementScores
          );
        } else if (quizType === 'long') {
          // Long quiz but no supplementary scores yet - use Phase 1 only
          ideology = findDetailedIdeology(data, economic, social, progressive);
        } else {
          // Short quiz
          ideology = findIdeologyByPosition(data, economic, social);
        }
        
        setIdeologyData(ideology);
        
        // Load supplement axes for long quiz
        if (quizType === 'long' && ideology?.macroCellCode) {
          const axesMap = await loadSupplementAxes();
          const macroAxes = axesMap.get(ideology.macroCellCode) || [];
          setSupplementAxes(macroAxes);
        }
      } catch (error) {
        console.error('Error loading ideology data:', error);
      }
    }
    
    loadIdeologyData();
  }, [economic, social, progressive, quizType, scores, supplementScores]);
  
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

  // Save the quiz result (skip if this is a shared result or debug mode)
  useEffect(() => {
    if (hasSaved.current || isShared || isDebugMode) {
      if (isDebugMode && !hasSaved.current) {
        console.log('🐛 DEBUG MODE: Skipping Firebase save');
        hasSaved.current = true;
      }
      return;
    }
    hasSaved.current = true;
    
    saveQuizResult({
      answers,
      quizType: quizType as 'short' | 'long',
      questionData: questionData.length > 0 ? questionData : undefined,
      // Calculate macro cell code from coordinates as fallback
      const calculateMacroCellCode = (econ: number, soc: number): string => {
        let econCode: 'EL' | 'EM' | 'ER';
        if (econ < -33) econCode = 'EL';
        else if (econ > 33) econCode = 'ER';
        else econCode = 'EM';
        
        let authCode: 'GL' | 'GM' | 'GR';
        if (soc > 33) authCode = 'GL';
        else if (soc < -33) authCode = 'GR';
        else authCode = 'GM';
        
        return `${econCode}-${authCode}`;
      };
      
      const macroCellCode = ideologyData?.macroCellCode || calculateMacroCellCode(economic, social);
      
      result: {
        economicScore: economic,
        socialScore: social,
        progressiveScore: progressive,
        alignmentLabel: ideologyData?.ideology || ideologyData?.friendlyLabel || alignment.label,
        alignmentDescription: ideologyData?.explanation || alignment.description,
        macroCellCode: macroCellCode,
        ...(scores?.supplementary && Object.keys(scores.supplementary).length > 0 && {
          supplementaryScores: scores.supplementary
        }),
        gridPosition: {
          economic: economic,
          social: social
        }
      },
      phase: quizType === 'long' && scores?.supplementary && Object.keys(scores.supplementary).length > 0 ? 2 : 1
    })
      .then(id => {
        console.log('Quiz result saved successfully with ID:', id);
        setDocId(id);
        
        // Update URL to use Firebase ID for permanent access
        if (id && !firebaseId) {
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.set('id', id);
          // Remove temporary params
          newUrl.searchParams.delete('data');
          newUrl.searchParams.delete('sessionId');
          newUrl.searchParams.delete('answers');
          newUrl.searchParams.delete('questionIds');
          
          // Update URL without reload
          window.history.replaceState({}, '', newUrl.toString());
        }
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

  // Handle error states within the component return
  if (!answersParam && !sessionIdParam && !dataParam) {
    return <div className="min-h-screen bg-gradient-to-b from-background to-primary/10 p-4 md:p-8 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">No results found</h1>
        <p className="text-foreground/60">Please take the quiz first.</p>
      </div>
    </div>;
  }
  
  // Check if data is still loading
  if (!dataLoaded) {
    return <div className="min-h-screen bg-gradient-to-b from-background to-primary/10 p-4 md:p-8 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">Loading quiz data...</h1>
        <div className="animate-pulse">
          <div className="w-16 h-16 mx-auto bg-purple-600 rounded-full"></div>
        </div>
      </div>
    </div>;
  }
  
  // Check if we have valid data after loading
  if (dataLoaded && answers.length === 0) {
    return <div className="min-h-screen bg-gradient-to-b from-background to-primary/10 p-4 md:p-8 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">Invalid quiz data</h1>
        <p className="text-foreground/60">Unable to load quiz results. Please try taking the quiz again.</p>
        {sessionIdParam && (
          <p className="text-sm text-muted-foreground mt-2">Session ID: {sessionIdParam}</p>
        )}
        <a href="/quiz" className="text-primary hover:underline mt-4 inline-block">Start New Quiz →</a>
      </div>
    </div>;
  }
  
  if (!scores) {
    return <div className="min-h-screen bg-gradient-to-b from-background to-primary/10 p-4 md:p-8 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">Calculating results...</h1>
        <div className="animate-pulse">
          <div className="w-16 h-16 mx-auto bg-purple-600 rounded-full"></div>
        </div>
        {answersParam && !sessionIdParam && answers.length === 50 && (
          <div className="mt-8 text-sm text-muted-foreground max-w-md mx-auto px-4">
            <p className="mb-2">⚠️ Using approximate scoring from legacy URL.</p>
            <p>For accurate results with proper question tracking, please complete the quiz from the beginning.</p>
            <a href="/quiz?type=long" className="text-primary hover:underline mt-4 inline-block">Start New Quiz →</a>
          </div>
        )}
      </div>
    </div>;
  }
  
  // Show loading state while fetching from Firebase
  if (isLoadingFirebase) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-primary/10 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-xl text-foreground">Loading your results...</p>
        </div>
      </div>
    );
  }

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
        {/* Debug Mode Banner */}
        {isDebugMode && (
          <div className="mb-6 p-4 bg-yellow-100 border-2 border-yellow-400 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🐛</span>
              <span className="font-bold text-yellow-800">DEBUG MODE - Results not saved to database</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              Check the browser console for detailed scoring calculations
            </p>
          </div>
        )}
        
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
              <span>👥</span> You're {totalQuizCount !== null && Number(totalQuizCount) > 0 ? `1 of ${Number(totalQuizCount).toLocaleString()}` : 'joining'} quiz takers
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
              <h2 className="text-2xl md:text-3xl font-bold text-purple-600 mb-2 break-words hyphens-auto">
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
                  <div className="flex justify-between mb-2 flex-wrap gap-1">
                    <span className="text-xs md:text-sm font-medium text-purple-600">Economic Score</span>
                    <span className="text-xs md:text-sm text-foreground/60">{displayX < 0 ? 'Left' : 'Right'} ({Math.abs(displayX).toFixed(1)}%)</span>
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
                  <div className="flex justify-between mb-2 flex-wrap gap-1">
                    <span className="text-xs md:text-sm font-medium text-purple-600">Governance Score</span>
                    <span className="text-xs md:text-sm text-foreground/60">{displayY > 0 ? 'Authoritarian' : 'Libertarian'} ({Math.abs(displayY).toFixed(1)}%)</span>
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
                  <div className="flex justify-between mb-2 flex-wrap gap-1">
                    <span className="text-xs md:text-sm font-medium text-purple-600">Social Score</span>
                    <span className="text-xs md:text-sm text-foreground/60">{displayProgressive < 0 ? 'Progressive' : 'Conservative'} ({Math.abs(displayProgressive).toFixed(1)}%)</span>
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
                          <h4 className="font-semibold text-foreground break-words hyphens-auto">{alignmentLabel}</h4>
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
                            <h5 className="font-medium text-foreground break-words hyphens-auto">{surpriseLabel}</h5>
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