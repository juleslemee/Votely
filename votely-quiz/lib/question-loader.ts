// Unified question loader - loads from new question format
// Uses "VotelyQuestionsNewestQuestions.tsv"

import { fetchTSVWithCache } from './tsv-cache';
import { debugLog, debugWarn, debugError } from './debug-logger';

export interface Question {
  id: number;
  originalId: string; // Original TSV ID (P01, TBE-LC1, ELGA-A-01, etc.)
  text: string;
  description?: string; // Column 3 - context/description
  axis?: 'economic' | 'governance' | 'social'; // Only for Phase 1 questions
  axisLabel: string; // Human-readable axis label from TSV (e.g., "Economic", "Leadership Model")
  topic: string; // Topic category  
  agreeDir: -1 | 1;
  phase: 1 | 2;
  qType: 'core' | 'tiebreaker' | 'refine';
  macroCell?: string; // For Phase 2 questions (EL-GA, etc.)
  axisCode?: string; // For Phase 2 (ELGA-A, etc.) or Phase 1 (econ, auth, soc)
  boundary?: 'LEFT_CENTER' | 'CENTER_RIGHT' | 'LIB_CENTER' | 'CENTER_AUTH'; // For tiebreakers
  shortQuiz?: boolean; // Whether marked 'yes' in short_quiz column
  removalPriority?: string; // From removal_priority column (e.g., "first", "second")
}

let questionsCache: Map<string, Question> | null = null;
let phase1Cache: Question[] | null = null;
let tiebreakerCache: Map<string, Question[]> | null = null;

// Force clear caches for debugging - timestamp: 22:15
questionsCache = null;
phase1Cache = null;
tiebreakerCache = null;

export async function loadAllQuestions(): Promise<Map<string, Question>> {
  if (questionsCache) {
    return questionsCache;
  }

  try {
    // Load from new questions file
    debugLog('Loading questions from TSV file...');
    const text = await fetchTSVWithCache('/VotelyQuestionsNewestQuestions.tsv');
    debugLog(`TSV loaded, length: ${text.length} characters`);
    const lines = text.trim().split('\n');
    const headers = lines[0].split('\t').map(h => h.trim());
    
    // Debug: Check if removal_priority header exists
    debugLog(`📋 TSV Headers found: ${headers.join(', ')}`);
    debugLog(`🔍 removal_priority header index: ${headers.indexOf('removal_priority')}`);
    if (!headers.includes('removal_priority')) {
      debugLog(`❌ removal_priority header NOT found!`);
    }
    
    const questions = new Map<string, Question>();
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split('\t');
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] ? values[index].trim() : values[index];
      });
      
      // Skip if no ID or phase
      if (!row.id || !row.phase) continue;
      
      // Parse phase
      const phase = parseInt(row.phase) as 1 | 2;
      
      // Parse axis for Phase 1 questions only
      let axis: 'economic' | 'governance' | 'social' | undefined;
      if (phase === 1) {
        if (row.axis_code === 'econ') {
          axis = 'economic';
        } else if (row.axis_code === 'gov') {
          axis = 'governance';
        } else if (row.axis_code === 'soc') {
          axis = 'social';
        }
      }
      // Phase 2 questions don't use the traditional 3 axes
      
      // Use the numeric ID directly from the TSV data
      const numericId = parseInt(row.id);
      
      // Create question object
      const question: Question = {
        id: numericId,
        originalId: row.id_code,
        text: row.text || '',
        description: row.description || undefined, // Description column
        axis,
        axisLabel: row.axis_label || '',
        topic: row.topic || '',
        agreeDir: parseInt(row.agree_dir) as -1 | 1,
        phase,
        qType: row.type as 'core' | 'tiebreaker' | 'refine',
        macroCell: row.macro_cell !== 'ALL' ? row.macro_cell : undefined,
        axisCode: row.axis_code || undefined,
        shortQuiz: row.short_quiz === 'yes',
        removalPriority: (row.removal_priority && row.removal_priority.trim()) || undefined
      };
      
      // Debug: Log removal priority parsing for specific questions
      if (['P25', 'P28', 'P29', 'P36'].includes(row.id_code)) {
        debugLog(`🔍 Question ${row.id_code}: removal_priority="${row.removal_priority}" (type: ${typeof row.removal_priority}) → removalPriority="${question.removalPriority}"`);
        debugLog(`    Raw row keys: ${Object.keys(row).join(', ')}`);
        debugLog(`    Raw row values: ${Object.values(row).map(v => `"${v}"`).join(', ')}`);
        
        // Special focus on P36 since it seems to be problematic
        if (row.id_code === 'P36') {
          debugLog(`🚨 P36 DETAILED DEBUG:`);
          debugLog(`    Raw removal_priority value: "${row.removal_priority}"`);
          debugLog(`    After trim: "${(row.removal_priority && row.removal_priority.trim()) || 'undefined'}"`);
          debugLog(`    Truthy check: ${!!(row.removal_priority && row.removal_priority.trim())}`);
        }
      }
      
      // Add boundary for tiebreakers
      if (question.qType === 'tiebreaker' && question.macroCell) {
        question.boundary = question.macroCell as any;
      }
      
      questions.set(row.id_code, question);
    }
    
    // Debug: log what we loaded
    debugLog(`📦 Question loader summary: ${questions.size} total questions loaded`);
    let typeCount: Record<string, number> = {};
    let phaseCount: Record<string, number> = { phase1: 0, phase2: 0 };
    let shortQuizCount = 0;
    
    for (const [id, q] of questions) {
      typeCount[q.qType] = (typeCount[q.qType] || 0) + 1;
      if (q.phase === 1) phaseCount.phase1++;
      else if (q.phase === 2) phaseCount.phase2++;
      if (q.shortQuiz) shortQuizCount++;
    }
    
    debugLog(`📊 By type:`, typeCount);
    debugLog(`📊 By phase:`, phaseCount);
    debugLog(`📊 Short quiz eligible:`, shortQuizCount);
    
    questionsCache = questions;
    return questions;
  } catch (error) {
    debugError('Error loading questions from TSV:', error);
    return new Map();
  }
}

// Get Phase 1 core questions
export async function getPhase1Questions(): Promise<Question[]> {
  const allQuestions = await loadAllQuestions();
  const phase1 = [];
  
  for (const [id, question] of allQuestions) {
    if (question.phase === 1 && question.qType === 'core') {
      phase1.push(question);
    }
  }
  
  // Sort by ID to maintain order
  phase1.sort((a, b) => a.id - b.id);
  return phase1;
}

// Get tiebreaker questions for specific boundaries
export async function getTiebreakerQuestions(boundaries: string[]): Promise<Question[]> {
  const allQuestions = await loadAllQuestions();
  const tiebreakers = [];
  
  // Debug: Count all tiebreaker questions
  let allTiebreakerCount = 0;
  for (const [id, question] of allQuestions) {
    if (question.qType === 'tiebreaker') {
      allTiebreakerCount++;
      debugLog(`🔍 Found tiebreaker: ${id} - boundary: ${question.boundary}`);
    }
  }
  debugLog(`📊 Total tiebreaker questions in TSV: ${allTiebreakerCount}`);
  
  for (const [id, question] of allQuestions) {
    if (question.qType === 'tiebreaker' && 
        question.boundary && 
        boundaries.includes(question.boundary)) {
      tiebreakers.push(question);
      debugLog(`✅ Including tiebreaker for ${question.boundary}: ${id}`);
    }
  }
  
  return tiebreakers;
}

// Get Phase 2 questions for a specific macro cell
export async function getPhase2QuestionsUnshuffled(macroCell: string): Promise<any[]> {
  const allQuestions = await loadAllQuestions();
  const phase2 = [];

  debugLog(`🔍 Looking for Phase 2 questions for macro cell: ${macroCell}`);

  // Count all phase 2 questions for debugging
  let allPhase2Count = 0;
  let macroCellCounts: Record<string, number> = {};

  for (const [id, question] of allQuestions) {
    if (question.phase === 2) {
      allPhase2Count++;
      const cell = question.macroCell || 'NONE';
      macroCellCounts[cell] = (macroCellCounts[cell] || 0) + 1;

      if (question.macroCell === macroCell) {
        // Transform to match the expected Phase2Question interface from app/quiz/questions.ts
        phase2.push({
          id: question.id,
          question: question.text, // Map 'text' to 'question'
          axis: 'social' as any, // Phase 2 uses supplementary axes, but interface expects PoliticalAxis
          agreeDir: question.agreeDir,
          originalId: question.originalId,
          supplementAxis: question.axisCode, // Add the supplementary axis code
          phase: 2
        });
      }
    }
  }

  debugLog(`📊 Total Phase 2 questions loaded: ${allPhase2Count}`);
  debugLog(`📊 Phase 2 questions by macro cell:`, macroCellCounts);
  debugLog(`✅ Found ${phase2.length} Phase 2 questions for macro cell ${macroCell}`);

  return phase2;
}