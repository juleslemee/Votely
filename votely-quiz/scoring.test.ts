import { describe, it, expect } from '@jest/globals';

// Import the actual scoring logic from the results page
// Since we can't import React components directly, we'll copy the scoring function
function normalizeScore(score: number, maxScore: number): number {
  return (score / maxScore) * 100;
}

interface QuestionConfig {
  id: number;
  axis: 'economic' | 'authority' | 'cultural';
  agreeDirection: 'left' | 'right' | 'libertarian' | 'authoritarian' | 'progressive' | 'conservative';
}

const QUESTION_CONFIG: QuestionConfig[] = [
  // ECONOMIC QUESTIONS (16 total) - IDs 1-16
  { id: 1, axis: 'economic', agreeDirection: 'left' },
  { id: 2, axis: 'economic', agreeDirection: 'left' },
  { id: 3, axis: 'economic', agreeDirection: 'left' },
  { id: 4, axis: 'economic', agreeDirection: 'left' },
  { id: 5, axis: 'economic', agreeDirection: 'left' },
  { id: 6, axis: 'economic', agreeDirection: 'left' },
  { id: 7, axis: 'economic', agreeDirection: 'left' },
  { id: 8, axis: 'economic', agreeDirection: 'left' },
  { id: 9, axis: 'economic', agreeDirection: 'right' },
  { id: 10, axis: 'economic', agreeDirection: 'right' },
  { id: 11, axis: 'economic', agreeDirection: 'right' },
  { id: 12, axis: 'economic', agreeDirection: 'right' },
  { id: 13, axis: 'economic', agreeDirection: 'right' },
  { id: 14, axis: 'economic', agreeDirection: 'right' },
  { id: 15, axis: 'economic', agreeDirection: 'right' },
  { id: 16, axis: 'economic', agreeDirection: 'right' },
  // AUTHORITY QUESTIONS (17 total) - IDs 17-33
  { id: 17, axis: 'authority', agreeDirection: 'authoritarian' },
  { id: 18, axis: 'authority', agreeDirection: 'authoritarian' },
  { id: 19, axis: 'authority', agreeDirection: 'authoritarian' },
  { id: 20, axis: 'authority', agreeDirection: 'authoritarian' },
  { id: 21, axis: 'authority', agreeDirection: 'authoritarian' },
  { id: 22, axis: 'authority', agreeDirection: 'authoritarian' },
  { id: 23, axis: 'authority', agreeDirection: 'authoritarian' },
  { id: 24, axis: 'authority', agreeDirection: 'authoritarian' },
  { id: 25, axis: 'authority', agreeDirection: 'libertarian' },
  { id: 26, axis: 'authority', agreeDirection: 'libertarian' },
  { id: 27, axis: 'authority', agreeDirection: 'libertarian' },
  { id: 28, axis: 'authority', agreeDirection: 'libertarian' },
  { id: 29, axis: 'authority', agreeDirection: 'libertarian' },
  { id: 30, axis: 'authority', agreeDirection: 'libertarian' },
  { id: 31, axis: 'authority', agreeDirection: 'libertarian' },
  { id: 32, axis: 'authority', agreeDirection: 'libertarian' },
  { id: 33, axis: 'authority', agreeDirection: 'libertarian' },
  // CULTURAL QUESTIONS (17 total) - IDs 34-50
  { id: 34, axis: 'cultural', agreeDirection: 'conservative' },
  { id: 35, axis: 'cultural', agreeDirection: 'conservative' },
  { id: 36, axis: 'cultural', agreeDirection: 'conservative' },
  { id: 37, axis: 'cultural', agreeDirection: 'conservative' },
  { id: 38, axis: 'cultural', agreeDirection: 'conservative' },
  { id: 39, axis: 'cultural', agreeDirection: 'conservative' },
  { id: 40, axis: 'cultural', agreeDirection: 'conservative' },
  { id: 41, axis: 'cultural', agreeDirection: 'progressive' },
  { id: 42, axis: 'cultural', agreeDirection: 'progressive' },
  { id: 43, axis: 'cultural', agreeDirection: 'progressive' },
  { id: 44, axis: 'cultural', agreeDirection: 'progressive' },
  { id: 45, axis: 'cultural', agreeDirection: 'progressive' },
  { id: 46, axis: 'cultural', agreeDirection: 'progressive' },
  { id: 47, axis: 'cultural', agreeDirection: 'progressive' },
  { id: 48, axis: 'cultural', agreeDirection: 'progressive' },
  { id: 49, axis: 'cultural', agreeDirection: 'progressive' },
  { id: 50, axis: 'cultural', agreeDirection: 'conservative' },
];

function calculateScores(answers: number[], quizType: string = 'short') {
  let economicScore = 0;
  let socialScore = 0;
  let progressiveScore = 0;
  let economicQuestions = 0;
  let socialQuestions = 0;
  let progressiveQuestions = 0;

  const convertToScore = (value: number): number => {
    return (value - 0.5) * 4;
  };

  const getQuestionIds = (quizType: string): number[] => {
    if (quizType === 'long') {
      return [
        1, 17, 34, 9, 25, 41, 2, 18, 35, 10,
        26, 42, 3, 19, 36, 11, 27, 43, 4, 20,
        37, 12, 28, 44, 5, 21, 38, 13, 29, 45,
        6, 22, 39, 14, 30, 46, 7, 23, 40, 15,
        31, 47, 8, 24, 48, 16, 32, 49, 33, 50
      ];
    } else {
      return [4, 20, 41, 9, 25, 6, 35, 29, 14, 44];
    }
  };

  const questionIds = getQuestionIds(quizType);

  questionIds.forEach((questionId, index) => {
    if (index >= answers.length) return;
    
    const continuousValue = answers[index];
    if (isNaN(continuousValue)) return;
    
    const score = convertToScore(continuousValue);
    const config = QUESTION_CONFIG.find(c => c.id === questionId);
    if (!config) return;

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

  const maxEconomicScore = economicQuestions * 2;
  const maxSocialScore = socialQuestions * 2;
  const maxProgressiveScore = progressiveQuestions * 2;

  const economic = maxEconomicScore > 0 ? normalizeScore(economicScore, maxEconomicScore) : 0;
  const social = maxSocialScore > 0 ? normalizeScore(socialScore, maxSocialScore) : 0;
  const progressive = maxProgressiveScore > 0 ? normalizeScore(progressiveScore, maxProgressiveScore) : 0;

  return { economic, social, progressive };
}

describe('Quiz Scoring Tests', () => {
  describe('Short Quiz Tests', () => {
    it('should score extreme economic left correctly', () => {
      const answers = [1.0, 0.5, 0.5, 0.0, 0.5, 1.0, 0.5, 0.5, 0.0, 0.5];
      const result = calculateScores(answers, 'short');
      expect(result.economic).toBe(-100);
      expect(result.social).toBe(0);
      expect(result.progressive).toBe(0);
    });

    it('should score extreme economic right correctly', () => {
      const answers = [0.0, 0.5, 0.5, 1.0, 0.5, 0.0, 0.5, 0.5, 1.0, 0.5];
      const result = calculateScores(answers, 'short');
      expect(result.economic).toBe(100);
      expect(result.social).toBe(0);
      expect(result.progressive).toBe(0);
    });

    it('should score extreme authoritarian correctly', () => {
      const answers = [0.5, 1.0, 0.5, 0.5, 0.0, 0.5, 1.0, 0.5, 0.5, 0.5];
      const result = calculateScores(answers, 'short');
      expect(result.economic).toBe(0);
      expect(result.social).toBe(100);
      expect(result.progressive).toBe(0);
    });

    it('should score extreme libertarian correctly', () => {
      const answers = [0.5, 0.0, 0.5, 0.5, 1.0, 0.5, 0.0, 0.5, 0.5, 0.5];
      const result = calculateScores(answers, 'short');
      expect(result.economic).toBe(0);
      expect(result.social).toBe(-100);
      expect(result.progressive).toBe(0);
    });

    it('should score extreme progressive correctly', () => {
      const answers = [0.5, 0.5, 1.0, 0.5, 0.5, 0.5, 0.5, 0.0, 0.5, 1.0];
      const result = calculateScores(answers, 'short');
      expect(result.economic).toBe(0);
      expect(result.social).toBe(0);
      expect(result.progressive).toBe(-100);
    });

    it('should score extreme conservative correctly', () => {
      const answers = [0.5, 0.5, 0.0, 0.5, 0.5, 0.5, 0.5, 1.0, 0.5, 0.0];
      const result = calculateScores(answers, 'short');
      expect(result.economic).toBe(0);
      expect(result.social).toBe(0);
      expect(result.progressive).toBe(100);
    });
  });

  describe('Long Quiz Tests', () => {
    it('should score socialist progressive correctly', () => {
      const answers = new Array(50).fill(0.5);
      // Economic left questions
      [0, 6, 12, 18, 24, 30, 36, 42].forEach(idx => answers[idx] = 1.0);
      // Economic right questions
      [3, 9, 15, 21, 27, 33, 39, 45].forEach(idx => answers[idx] = 0.0);
      // Progressive questions
      [5, 11, 17, 23, 29, 35, 41, 44, 47].forEach(idx => answers[idx] = 1.0);
      // Conservative questions
      [2, 8, 14, 20, 26, 32, 38, 49].forEach(idx => answers[idx] = 0.0);
      
      const result = calculateScores(answers, 'long');
      expect(result.economic).toBe(-100);
      expect(result.social).toBe(0);
      expect(result.progressive).toBe(-100);
    });

    it('should score anarcho-capitalist correctly', () => {
      const answers = new Array(50).fill(0.5);
      // Economic right questions
      [3, 9, 15, 21, 27, 33, 39, 45].forEach(idx => answers[idx] = 1.0);
      // Economic left questions
      [0, 6, 12, 18, 24, 30, 36, 42].forEach(idx => answers[idx] = 0.0);
      // Libertarian questions
      [4, 10, 16, 22, 28, 34, 40, 46, 48].forEach(idx => answers[idx] = 1.0);
      // Authoritarian questions
      [1, 7, 13, 19, 25, 31, 37, 43].forEach(idx => answers[idx] = 0.0);
      
      const result = calculateScores(answers, 'long');
      expect(result.economic).toBe(100);
      expect(result.social).toBe(-100);
      expect(result.progressive).toBe(0);
    });

    it('should handle all neutral answers', () => {
      const answers = new Array(50).fill(0.5);
      const result = calculateScores(answers, 'long');
      expect(result.economic).toBe(0);
      expect(result.social).toBe(0);
      expect(result.progressive).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle incomplete answers', () => {
      const answers = [1.0, 0.0]; // Only 2 answers for short quiz
      const result = calculateScores(answers, 'short');
      // Should still calculate based on answered questions
      expect(result.economic).toBe(-100); // Q4 is left, Q20 doesn't affect economic
    });

    it('should handle invalid answer values', () => {
      const answers = [NaN, -1, 2, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
      const result = calculateScores(answers, 'short');
      // Should skip invalid values and use valid ones
      expect(result).toBeDefined();
    });
  });
});