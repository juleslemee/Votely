import { fetchTSVWithCache } from './tsv-cache';

export interface SupplementAxis {
  macroCell: string;
  code: string;
  axis: string;
  negativeAnchor: string; // -100
  positiveAnchor: string; // +100
}

export async function loadSupplementAxes(): Promise<Map<string, SupplementAxis[]>> {
  try {
    // Use cached fetch to avoid repeated requests
    const text = await fetchTSVWithCache('/supplement-axes.tsv');
    const lines = text.trim().split('\n');
    
    // Skip header
    const dataLines = lines.slice(1);
    
    const axesByMacroCell = new Map<string, SupplementAxis[]>();
    
    dataLines.forEach(line => {
      const [macroCell, code, axis, negativeAnchor, positiveAnchor] = line.split('\t');
      
      const axisData: SupplementAxis = {
        macroCell,
        code,
        axis,
        negativeAnchor,
        positiveAnchor
      };
      
      if (!axesByMacroCell.has(macroCell)) {
        axesByMacroCell.set(macroCell, []);
      }
      
      axesByMacroCell.get(macroCell)!.push(axisData);
    });
    
    return axesByMacroCell;
  } catch (error) {
    console.error('Error loading supplement axes:', error);
    return new Map();
  }
}

// Calculate user's position on supplement axes based on their answers
export function calculateSupplementScores(
  answers: number[], 
  macroCell: string, 
  axes: SupplementAxis[]
): Record<string, number> {
  // For now, we'll use a simple calculation based on the user's position
  // In a real implementation, you'd map specific questions to each axis
  const scores: Record<string, number> = {};
  
  axes.forEach((axis, index) => {
    // Simple placeholder calculation - you can refine this based on actual question mapping
    const relevantAnswers = answers.slice(index * 3, (index + 1) * 3);
    const avgScore = relevantAnswers.reduce((sum, val) => sum + val, 0) / relevantAnswers.length;
    
    // Convert 0-1 to -100 to +100
    scores[axis.code] = (avgScore - 0.5) * 200;
  });
  
  return scores;
}