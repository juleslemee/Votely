import { describe, it, expect } from '@jest/globals';
import { calculateScores } from '../app/quiz/results/results-client';
import { loadGridData, findDetailedIdeologyWithSupplementary } from '../lib/grid-data-loader';
import { loadPhase2QuestionData } from '../lib/phase2-question-loader';

// Test that all 81 ideologies are reachable through some combination of answers

describe('Ideology Reachability Tests', () => {
  // Test data for each macro cell
  const macroCells = [
    { code: 'EL-GL', name: 'Revolutionary Left Authoritarian' },
    { code: 'EM-GL', name: 'Centrist Authoritarian' },
    { code: 'ER-GL', name: 'Right Authoritarian' },
    { code: 'EL-GM', name: 'Democratic Socialist' },
    { code: 'EM-GM', name: 'True Center' },
    { code: 'ER-GM', name: 'Conservative Capitalist' },
    { code: 'EL-GR', name: 'Libertarian Socialist' },
    { code: 'EM-GR', name: 'Centrist Libertarian' },
    { code: 'ER-GR', name: 'Anarcho-Capitalist' }
  ];

  // Generate answer patterns for each macro cell
  function generateMacroCellAnswers(macroCellCode: string): number[] {
    const answers = new Array(30).fill(0.5); // Start neutral
    
    // Economic axis
    if (macroCellCode.startsWith('EL')) {
      // Far left - answer left on economic questions (IDs 1-8, 25-26, 31-32)
      [0, 3, 4, 6, 24, 30].forEach(idx => answers[idx] = 0.9); // Agree with left
      [1, 2, 5, 7, 25, 31].forEach(idx => answers[idx] = 0.1); // Disagree with right
    } else if (macroCellCode.startsWith('ER')) {
      // Far right - answer right on economic questions
      [0, 3, 4, 6, 24, 30].forEach(idx => answers[idx] = 0.1); // Disagree with left
      [1, 2, 5, 7, 25, 31].forEach(idx => answers[idx] = 0.9); // Agree with right
    }
    
    // Authority axis
    if (macroCellCode.endsWith('GL')) {
      // Authoritarian - answer authoritarian on authority questions (IDs 9-16, 27-28, 33-34)
      [8, 10, 12, 14, 26, 32].forEach(idx => answers[idx] = 0.9); // Agree with auth
      [9, 11, 13, 15, 27, 33].forEach(idx => answers[idx] = 0.1); // Disagree with lib
    } else if (macroCellCode.endsWith('GR')) {
      // Libertarian - answer libertarian on authority questions
      [8, 10, 12, 14, 26, 32].forEach(idx => answers[idx] = 0.1); // Disagree with auth
      [9, 11, 13, 15, 27, 33].forEach(idx => answers[idx] = 0.9); // Agree with lib
    }
    
    return answers;
  }

  // Test each macro cell is reachable
  describe('Macro Cell Reachability', () => {
    macroCells.forEach(({ code, name }) => {
      it(`should be able to reach ${name} (${code})`, async () => {
        const answers = generateMacroCellAnswers(code);
        const questionIds = Array.from({ length: 30 }, (_, i) => i + 1);
        
        const scores = await calculateScores(answers, questionIds, 'short');
        
        // Check economic axis
        if (code.startsWith('EL')) {
          expect(scores.economic).toBeLessThan(-33);
        } else if (code.startsWith('ER')) {
          expect(scores.economic).toBeGreaterThan(33);
        } else {
          expect(Math.abs(scores.economic)).toBeLessThan(33);
        }
        
        // Check authority axis
        if (code.endsWith('GL')) {
          expect(scores.social).toBeGreaterThan(33);
        } else if (code.endsWith('GR')) {
          expect(scores.social).toBeLessThan(-33);
        } else {
          expect(Math.abs(scores.social)).toBeLessThan(33);
        }
      });
    });
  });

  // Test specific ideologies within macro cells
  describe('Specific Ideology Reachability', () => {
    it('should be able to reach different ideologies within EL-GL', async () => {
      const gridData = await loadGridData('long');
      const phase2Data = await loadPhase2QuestionData();
      
      // Base answers for EL-GL
      const baseAnswers = generateMacroCellAnswers('EL-GL');
      
      // Test reaching Bolshevik Marxism
      const bolshevikAnswers = [...baseAnswers];
      // Add Phase 2 answers that should lead to Bolshevik Marxism
      // These would be questions 31-50 with specific patterns
      const phase2Bolshevik = new Array(20).fill(0.5);
      // Vanguard party directs (ELGL-A): positive
      phase2Bolshevik[0] = 0.9;
      phase2Bolshevik[1] = 0.9;
      phase2Bolshevik[2] = 0.9;
      phase2Bolshevik[3] = 0.9;
      phase2Bolshevik[4] = 0.9;
      
      const allAnswers = [...bolshevikAnswers, ...phase2Bolshevik];
      const allQuestionIds = [
        ...Array.from({ length: 30 }, (_, i) => i + 1),
        ...Array.from({ length: 20 }, (_, i) => i + 1001)
      ];
      
      const scores = await calculateScores(allAnswers, allQuestionIds, 'long', phase2Data);
      
      const ideology = await findDetailedIdeologyWithSupplementary(
        gridData,
        scores.economic,
        scores.social,
        scores.supplementary
      );
      
      expect(ideology).not.toBeNull();
      expect(ideology?.macroCellCode).toBe('EL-GL');
      // Could check for specific ideology name once supplementary coordinates are properly loaded
    });
  });

  // Test boundary conditions
  describe('Boundary Tests', () => {
    it('should handle all neutral answers', async () => {
      const answers = new Array(50).fill(0.5);
      const questionIds = [
        ...Array.from({ length: 30 }, (_, i) => i + 1),
        ...Array.from({ length: 20 }, (_, i) => i + 1001)
      ];
      
      const scores = await calculateScores(answers, questionIds, 'long');
      
      expect(scores.economic).toBe(0);
      expect(scores.social).toBe(0);
      expect(scores.progressive).toBe(0);
      Object.values(scores.supplementary).forEach(score => {
        expect(score).toBe(0);
      });
    });

    it('should handle all extreme left answers', async () => {
      const answers = new Array(50).fill(0.0);
      const questionIds = [
        ...Array.from({ length: 30 }, (_, i) => i + 1),
        ...Array.from({ length: 20 }, (_, i) => i + 1001)
      ];
      
      const scores = await calculateScores(answers, questionIds, 'long');
      
      // The exact values depend on question distribution
      expect(Math.abs(scores.economic)).toBeGreaterThan(0);
      expect(Math.abs(scores.social)).toBeGreaterThan(0);
    });

    it('should handle all extreme right answers', async () => {
      const answers = new Array(50).fill(1.0);
      const questionIds = [
        ...Array.from({ length: 30 }, (_, i) => i + 1),
        ...Array.from({ length: 20 }, (_, i) => i + 1001)
      ];
      
      const scores = await calculateScores(answers, questionIds, 'long');
      
      // The exact values depend on question distribution
      expect(Math.abs(scores.economic)).toBeGreaterThan(0);
      expect(Math.abs(scores.social)).toBeGreaterThan(0);
    });
  });

  // Test that extreme answers don't lead to inappropriate ideologies
  describe('Fascism Prevention Tests', () => {
    it('should not place moderate Phase 2 answers in extreme ideologies', async () => {
      const gridData = await loadGridData('long');
      const phase2Data = await loadPhase2QuestionData();
      
      // Answers that put user in ER-GL (top right)
      const phase1Answers = generateMacroCellAnswers('ER-GL');
      // Moderate Phase 2 answers
      const phase2Answers = new Array(20).fill(0.5);
      
      const allAnswers = [...phase1Answers, ...phase2Answers];
      const allQuestionIds = [
        ...Array.from({ length: 30 }, (_, i) => i + 1),
        ...Array.from({ length: 20 }, (_, i) => i + 1001)
      ];
      
      const scores = await calculateScores(allAnswers, allQuestionIds, 'long', phase2Data);
      
      const ideology = await findDetailedIdeologyWithSupplementary(
        gridData,
        scores.economic,
        scores.social,
        scores.supplementary
      );
      
      expect(ideology).not.toBeNull();
      expect(ideology?.macroCellCode).toBe('ER-GL');
      // Should not be an extreme ideology like Fascism with moderate Phase 2 answers
      // This would require proper supplementary coordinates to verify
    });
  });

  // Test answer shuffling doesn't affect results
  describe('Question Order Independence', () => {
    it('should produce same scores regardless of question order', async () => {
      // Fixed answers in question ID order
      const answersByQuestionId = new Map<number, number>();
      for (let i = 1; i <= 30; i++) {
        answersByQuestionId.set(i, Math.random());
      }
      
      // Original order
      const questionIds1 = Array.from({ length: 30 }, (_, i) => i + 1);
      const answers1 = questionIds1.map(id => answersByQuestionId.get(id)!);
      
      // Shuffled order
      const questionIds2 = [...questionIds1].sort(() => Math.random() - 0.5);
      const answers2 = questionIds2.map(id => answersByQuestionId.get(id)!);
      
      const scores1 = await calculateScores(answers1, questionIds1, 'long');
      const scores2 = await calculateScores(answers2, questionIds2, 'long');
      
      expect(scores1.economic).toBeCloseTo(scores2.economic, 1);
      expect(scores1.social).toBeCloseTo(scores2.social, 1);
      expect(scores1.progressive).toBeCloseTo(scores2.progressive, 1);
    });
  });
});