// Grid data loader for dynamic ideology information

import { fetchTSVWithCache } from './tsv-cache';

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
    // Use absolute URL in production to avoid issues
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${baseUrl}/${filename}`;
    
    // Use cached fetch to avoid repeated requests
    const content = await fetchTSVWithCache(url);
    return parseTSV(content);
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    // Return empty array to prevent app from crashing
    return [];
  }
}

// Find ideology data by macro cell position
export function findIdeologyByPosition(
  gridData: GridCellData[],
  economicScore: number,
  socialScore: number
): GridCellData | null {
  // Convert normalized scores (-100 to 100) to macro cell codes
  let econCode: 'EL' | 'EM' | 'ER';
  if (economicScore < -33) econCode = 'EL';
  else if (economicScore > 33) econCode = 'ER';
  else econCode = 'EM';
  
  let authCode: 'GL' | 'GM' | 'GR';
  if (socialScore > 33) authCode = 'GL'; // More authoritarian
  else if (socialScore < -33) authCode = 'GR'; // More libertarian
  else authCode = 'GM';
  
  const macroCellCode = `${econCode}-${authCode}`;
  
  // Find the matching cell data
  return gridData.find(cell => cell.macroCellCode === macroCellCode) || null;
}

// For detailed 9x9 grid, find more specific ideology based on exact position
export function findDetailedIdeology(
  gridData: GridCellData[],
  economicScore: number,
  socialScore: number,
  progressiveScore: number = 0
): GridCellData | null {
  // First determine which macro cell the user falls into
  const macroCellIdeology = findIdeologyByPosition(gridData, economicScore, socialScore);
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
      Math.pow(socialScore - centerY, 2)
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      closestIdeology = ideology;
    }
  }
  
  return closestIdeology;
}

// New function to find ideology using weighted distance with supplementary scores
export async function findDetailedIdeologyWithSupplementary(
  gridData: GridCellData[],
  economicScore: number,
  socialScore: number,
  supplementaryScores: Record<string, number>
): Promise<GridCellData | null> {
  // Import the weighted distance calculation
  const { findClosestIdeology } = await import('./ideology-coordinates');
  
  // First determine macro cell
  const macroCellIdeology = findIdeologyByPosition(gridData, economicScore, socialScore);
  if (!macroCellIdeology) return null;
  
  const macroCellCode = macroCellIdeology.macroCellCode;
  
  // Find closest ideology using weighted distance
  const closestIdeologyName = await findClosestIdeology(
    macroCellCode,
    economicScore,
    socialScore,
    supplementaryScores
  );
  
  if (!closestIdeologyName) {
    return macroCellIdeology; // Fallback to macro cell
  }
  
  // Find the full ideology data
  return gridData.find(cell => cell.ideology === closestIdeologyName) || macroCellIdeology;
}