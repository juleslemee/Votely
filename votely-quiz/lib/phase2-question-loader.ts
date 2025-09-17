// Phase 2 question loader for scoring purposes
// This loads Phase 2 questions with their supplementary axis information
// Updated to use the new unified question format from 'VotelyQuestionsNewestQuestions.tsv'

import { loadAllQuestions } from './question-loader';
import { debugLog, debugWarn, debugError } from './debug-logger';

export interface Phase2QuestionData {
  id: number;
  supplementAxis: string;
  agreeDir: -1 | 1;
}

// Cache for loaded Phase 2 questions
let phase2QuestionCache: Map<number, Phase2QuestionData> | null = null;

export async function loadPhase2QuestionData(): Promise<Map<number, Phase2QuestionData>> {
  if (phase2QuestionCache) {
    return phase2QuestionCache;
  }

  try {
    // Load all questions from the unified question loader (uses new TSV format)
    const allQuestions = await loadAllQuestions();
    const questionMap = new Map<number, Phase2QuestionData>();
    
    // Filter for Phase 2 questions and extract needed data for scoring
    for (const [originalId, question] of allQuestions) {
      if (question.phase === 2 && question.axisCode) {
        questionMap.set(question.id, {
          id: question.id,
          supplementAxis: question.axisCode, // e.g., 'ELGA-A', 'EMGM-B', etc.
          agreeDir: question.agreeDir
        });
      }
    }
    
    debugLog(`📦 Phase 2 question loader: ${questionMap.size} Phase 2 questions loaded for scoring (from new TSV format)`);
    
    phase2QuestionCache = questionMap;
    return questionMap;
  } catch (error) {
    debugError('Error loading Phase 2 question data from new format:', error);
    return new Map();
  }
}