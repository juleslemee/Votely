// Unified question loader - single source of truth from TSV
// This replaces the hardcoded questions in questions.ts

import { fetchTSVWithCache } from './tsv-cache';

export interface Question {
  id: number;
  originalId: string; // Keep track of original TSV ID
  text: string;
  axis: 'economic' | 'authority' | 'cultural';
  agreeDir: -1 | 1;
  phase: 1 | 2;
  qType: 'core' | 'tiebreaker' | 'refine';
  macroCell?: string; // For tiebreakers and phase 2
  boundary?: 'LEFT_CENTER' | 'CENTER_RIGHT' | 'LIB_CENTER' | 'CENTER_AUTH';
}

let questionsCache: Map<string, Question> | null = null;
let phase1Cache: Question[] | null = null;
let tiebreakerCache: Map<string, Question[]> | null = null;

export async function loadAllQuestions(): Promise<Map<string, Question>> {
  if (questionsCache) {
    return questionsCache;
  }

  try {
    // Use cached fetch to avoid repeated requests
    const text = await fetchTSVWithCache('/political_quiz_final.tsv');
    const lines = text.trim().split('\n');
    const headers = lines[0].split('\t');
    
    const questions = new Map<string, Question>();
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split('\t');
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      
      // Skip if no ID or phase
      if (!row.id || !row.phase) continue;
      
      // Skip phase 2 questions for now (handle separately)
      if (row.phase === '2') continue;
      
      // Parse axis
      let axis: 'economic' | 'authority' | 'cultural' | null = null;
      if (row.axis === 'econ') axis = 'economic';
      else if (row.axis === 'auth') axis = 'authority';
      else if (row.axis === 'soc') axis = 'cultural';
      
      // Skip if invalid axis for phase 1
      if (!axis) continue;
      
      // Parse phase
      const phase = parseInt(row.phase) as 1 | 2;
      
      // Create question object
      const question: Question = {
        id: row.id.startsWith('P') ? parseInt(row.id.substring(1)) : 
            row.id.startsWith('TB') ? 1000 + i : // Tiebreakers get high IDs
            2000 + i, // Phase 2 gets even higher IDs
        originalId: row.id,
        text: row.text,
        axis,
        agreeDir: parseInt(row.agree_dir) as -1 | 1,
        phase,
        qType: row.q_type as 'core' | 'tiebreaker' | 'refine',
        macroCell: row.macro_cell !== 'ALL' ? row.macro_cell : undefined
      };
      
      // Add boundary for tiebreakers
      if (question.qType === 'tiebreaker' && question.macroCell) {
        question.boundary = question.macroCell as any;
      }
      
      questions.set(row.id, question);
    }
    
    questionsCache = questions;
    return questions;
  } catch (error) {
    console.error('Error loading questions from TSV:', error);
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
  
  for (const [id, question] of allQuestions) {
    if (question.qType === 'tiebreaker' && 
        question.boundary && 
        boundaries.includes(question.boundary)) {
      tiebreakers.push(question);
    }
  }
  
  return tiebreakers;
}

// Get Phase 2 questions for a specific macro cell
export async function getPhase2Questions(macroCell: string): Promise<Question[]> {
  const allQuestions = await loadAllQuestions();
  const phase2 = [];
  
  for (const [id, question] of allQuestions) {
    if (question.phase === 2 && question.macroCell === macroCell) {
      phase2.push(question);
    }
  }
  
  return phase2;
}