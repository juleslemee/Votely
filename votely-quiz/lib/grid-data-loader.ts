// Grid data loader for dynamic ideology information

import { fetchTSVWithCache } from './tsv-cache';
import { debugLog, debugWarn, debugError } from './debug-logger';

export interface GridCellData {
  macroCellCode: string;
  macroCellLabel: string;
  coordinateRange: string;
  ideology: string;
  friendlyLabel: string;
  explanation: string;
  examples: string;
  alignIdeology1: string;
  alignIdeology1Text: string;
  alignIdeology2: string;
  alignIdeology2Text: string;
  surpriseIdeology1: string;
  surpriseIdeology1Text: string;
  surpriseIdeology2: string;
  surpriseIdeology2Text: string;
}

// Parse TSV content into grid data
function parseTSV(content: string): GridCellData[] {
  const lines = content.trim().split('\n');
  const headers = lines[0].split('\t');
  const data: GridCellData[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split('\t');
    if (row.length < headers.length) continue;
    
    const cellData: GridCellData = {
      macroCellCode: row[0],
      macroCellLabel: row[1],
      coordinateRange: row[2],
      ideology: row[3],
      friendlyLabel: row[4],
      explanation: row[5],
      examples: row[6],
      alignIdeology1: row[7],
      alignIdeology1Text: row[8],
      alignIdeology2: row[9],
      alignIdeology2Text: row[10],
      surpriseIdeology1: row[11],
      surpriseIdeology1Text: row[12],
      surpriseIdeology2: row[13],
      surpriseIdeology2Text: row[14],
    };
    
    data.push(cellData);
  }
  
  return data;
}

// Load appropriate grid data based on quiz type
export async function loadGridData(quizType: 'short' | 'long'): Promise<GridCellData[]> {
  const filename = quizType === 'short' ? 'grid-3x3-details.tsv' : 'grid-details.tsv';
  
  try {
    // Use relative URL - let fetchTSVWithCache handle the normalization
    const url = `/${filename}`;
    
    // Use cached fetch to avoid repeated requests
    const content = await fetchTSVWithCache(url);
    return parseTSV(content);
  } catch (error) {
    debugError(`Error loading ${filename}:`, error);
    // Return empty array to prevent app from crashing
    return [];
  }
}

// Find ideology data by macro cell position
export function findIdeologyByPosition(
  gridData: GridCellData[],
  economicScore: number,
  governanceScore: number
): GridCellData | null {
  // Convert normalized scores (-100 to 100) to macro cell codes
  let econCode: 'EL' | 'EM' | 'ER';
  if (economicScore < -33) econCode = 'EL';
  else if (economicScore > 33) econCode = 'ER';
  else econCode = 'EM';

  let authCode: 'GL' | 'GM' | 'GA';
  if (governanceScore > 33) authCode = 'GA'; // More authoritarian
  else if (governanceScore < -33) authCode = 'GL'; // More libertarian
  else authCode = 'GM';

  const macroCellCode = `${econCode}-${authCode}`;

  // Find the matching cell data
  return gridData.find(cell => cell.macroCellCode === macroCellCode) || null;
}

// For detailed 9x9 grid, find more specific ideology based on exact position
export function findDetailedIdeology(
  gridData: GridCellData[],
  economicScore: number,
  governanceScore: number,
  socialScore: number = 0
): GridCellData | null {
  // First determine which macro cell the user falls into
  const macroCellIdeology = findIdeologyByPosition(gridData, economicScore, governanceScore);
  if (!macroCellIdeology) return null;
  
  const macroCellCode = macroCellIdeology.macroCellCode;
  
  // For short quiz or if supplementary scores not available, return macro cell result
  // The actual weighted distance calculation will be done separately when supplementary scores are available
  
  // Get all ideologies in this macro cell
  const macroIdeologies = gridData.filter(cell => cell.macroCellCode === macroCellCode);
  
  // If only one ideology in macro cell, return it
  if (macroIdeologies.length === 1) {
    return macroIdeologies[0];
  }
  
  // Find closest ideology based on Phase 1 coordinates only (for initial placement)
  let closestIdeology = macroIdeologies[0];
  let minDistance = Infinity;
  
  for (const ideology of macroIdeologies) {
    // Parse coordinate range to get center
    const coordMatch = ideology.coordinateRange.match(/x:\s*(-?\d+\.?\d*)\s*to\s*(-?\d+\.?\d*),\s*y:\s*(-?\d+\.?\d*)\s*to\s*(-?\d+\.?\d*)/);
    if (!coordMatch) continue;
    
    const [, xMinStr, xMaxStr, yMinStr, yMaxStr] = coordMatch;
    const centerX = (parseFloat(xMinStr) + parseFloat(xMaxStr)) / 2 * 10; // Convert to -100..100
    const centerY = (parseFloat(yMinStr) + parseFloat(yMaxStr)) / 2 * 10;
    
    // Simple Euclidean distance for Phase 1 only
    const distance = Math.sqrt(
      Math.pow(economicScore - centerX, 2) +
      Math.pow(governanceScore - centerY, 2)
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      closestIdeology = ideology;
    }
  }
  
  return closestIdeology;
}

// New function to find ideology using pure 6-axis distance with supplementary scores
export async function findDetailedIdeologyWithSupplementary(
  gridData: GridCellData[],
  economicScore: number,
  governanceScore: number,
  supplementaryScores: Record<string, number>
): Promise<GridCellData | null> {
  // Import the new 6-axis vector calculation
  const { findClosestIdeologyPure6Axis } = await import('./ideology-vector-loader');

  // STEP 1: First determine macro cell based on Phase 1 scores (economic and governance)
  // This determines which of the 9 macro cells the user falls into
  const macroCellIdeology = findIdeologyByPosition(gridData, economicScore, governanceScore);
  if (!macroCellIdeology) return null;
  
  const macroCellCode = macroCellIdeology.macroCellCode;
  
  // STEP 2: Within that macro cell, find the closest ideology using pure 6-axis Euclidean distance
  // This compares the user's 6 supplementary axis scores to each ideology's vector
  const closestIdeologyName = await findClosestIdeologyPure6Axis(
    macroCellCode,
    supplementaryScores
  );
  
  if (!closestIdeologyName) {
    return macroCellIdeology; // Fallback to macro cell if no specific ideology found
  }
  
  // STEP 3: Return the full ideology data for display
  return gridData.find(cell => cell.ideology === closestIdeologyName) || macroCellIdeology;
}

// Function to find ideology with a predefined macro cell (for long quiz sessions)
export async function findDetailedIdeologyWithPredefinedMacroCell(
  gridData: GridCellData[],
  macroCellCode: string,
  supplementaryScores: Record<string, number>
): Promise<GridCellData | null> {
  // Import the new 6-axis vector calculation
  const { findClosestIdeologyPure6Axis } = await import('./ideology-vector-loader');

  // Get the macro cell ideology for fallback
  const macroCellIdeology = gridData.find(cell => cell.macroCellCode === macroCellCode);
  if (!macroCellIdeology) return null;

  // Within that macro cell, find the closest ideology using pure 6-axis Euclidean distance
  const closestIdeologyName = await findClosestIdeologyPure6Axis(
    macroCellCode,
    supplementaryScores
  );

  if (!closestIdeologyName) {
    return macroCellIdeology; // Fallback to macro cell if no specific ideology found
  }

  // Return the full ideology data for display
  return gridData.find(cell => cell.ideology === closestIdeologyName) || macroCellIdeology;
}