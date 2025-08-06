// Phase 2 question loader for scoring purposes
// This loads Phase 2 questions with their supplementary axis information

import { fetchTSVWithCache } from './tsv-cache';

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
    // Use cached fetch to avoid repeated requests
    const text = await fetchTSVWithCache('/political_quiz_final.tsv');
    const lines = text.trim().split('\n');
    
    const questionMap = new Map<number, Phase2QuestionData>();
    
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split('\t');
      const phase = row[3]; // phase column
      
      if (phase === '2') {
        const supplementAxis = row[2]; // axis code like ELGL-A
        const agreeDir = parseInt(row[6]) as -1 | 1; // agree_dir column
        
        // Generate the same numeric ID as in questions.ts
        const numericId = 1000 + i;
        
        questionMap.set(numericId, {
          id: numericId,
          supplementAxis,
          agreeDir
        });
      }
    }
    
    phase2QuestionCache = questionMap;
    return questionMap;
  } catch (error) {
    console.error('Error loading Phase 2 question data:', error);
    return new Map();
  }
}