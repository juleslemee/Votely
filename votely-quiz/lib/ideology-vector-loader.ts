// Loads the 6-axis ideology vector map for calculating closest ideology
import { fetchTSVWithCache } from './tsv-cache';
import { debugError, debugWarn, debugLog } from './debug-logger';

export interface IdeologyVector {
  ideology: string;
  macroCell: string;
  axes: {
    axis: string;
    code: string;
    score: number;
  }[];
}

let vectorCache: Map<string, IdeologyVector[]> | null = null;

export async function loadIdeologyVectors(): Promise<Map<string, IdeologyVector[]>> {
  if (vectorCache) {
    return vectorCache;
  }

  try {
    const text = await fetchTSVWithCache('/VotelyGridIdeology-vector-map.tsv');
    const lines = text.trim().split('\n');
    
    // Skip header
    const dataLines = lines.slice(1);
    
    const vectorsByMacroCell = new Map<string, IdeologyVector[]>();
    
    dataLines.forEach(line => {
      const parts = line.split('\t');
      if (parts.length < 20) return; // Need all columns
      
      const ideology = parts[0];
      const macroCell = parts[1];
      
      // Parse the 6 axes (3 columns per axis: Axis name, Code, Score)
      const axes = [];
      for (let i = 0; i < 6; i++) {
        const baseIndex = 2 + (i * 3);
        axes.push({
          axis: parts[baseIndex],
          code: parts[baseIndex + 1],
          score: parseFloat(parts[baseIndex + 2])
        });
      }
      
      const vector: IdeologyVector = {
        ideology,
        macroCell,
        axes
      };
      
      if (!vectorsByMacroCell.has(macroCell)) {
        vectorsByMacroCell.set(macroCell, []);
      }
      
      vectorsByMacroCell.get(macroCell)!.push(vector);
    });
    
    vectorCache = vectorsByMacroCell;
    return vectorsByMacroCell;
  } catch (error) {
    debugError('Error loading ideology vectors:', error);
    return new Map();
  }
}

// Calculate Euclidean distance using only the 6 supplementary axes
// This is the core calculation: sqrt(sum((user_score - ideology_score)^2))
export function calculatePure6AxisDistance(
  userScores: Record<string, number>,
  ideologyVector: IdeologyVector
): number {
  let sumSquaredDiff = 0;
  
  // For each of the 6 axes, calculate (user_score - ideology_score)^2
  ideologyVector.axes.forEach(axis => {
    const userScore = userScores[axis.code] || 0; // User's score on this axis (-100 to +100)
    const diff = userScore - axis.score;           // Difference from ideology's position
    sumSquaredDiff += diff * diff;                 // Square the difference and add to sum
  });
  
  return Math.sqrt(sumSquaredDiff); // Return Euclidean distance
}

// Find closest ideology using pure 6-axis distance
export async function findClosestIdeologyPure6Axis(
  macroCellCode: string,
  userSupplementaryScores: Record<string, number>
): Promise<string | null> {
  // Load all ideology vectors from the TSV file
  const ideologyVectors = await loadIdeologyVectors();
  // Get only the ideologies in the user's macro cell (usually 9 ideologies)
  const macroIdeologies = ideologyVectors.get(macroCellCode);
  
  if (!macroIdeologies || macroIdeologies.length === 0) {
    debugWarn(`No ideologies found for macro cell ${macroCellCode}`);
    return null;
  }
  
  let closestIdeology = macroIdeologies[0].ideology;
  let minDistance = Infinity;
  
  // Compare user's 6-axis scores to each ideology's 6-axis vector
  for (const ideology of macroIdeologies) {
    const distance = calculatePure6AxisDistance(userSupplementaryScores, ideology);
    
    // Keep track of the ideology with minimum distance
    if (distance < minDistance) {
      minDistance = distance;
      closestIdeology = ideology.ideology;
    }
  }
  
  debugLog(`Closest ideology in ${macroCellCode}: ${closestIdeology} (distance: ${minDistance.toFixed(2)})`);
  return closestIdeology;
}