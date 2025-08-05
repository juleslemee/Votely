// Grid data loader for dynamic ideology information

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
    const response = await fetch(`${baseUrl}/${filename}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const content = await response.text();
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
  // Parse coordinate ranges from TSV and find matching cell
  for (const cell of gridData) {
    if (!cell.coordinateRange) continue;
    
    // Parse coordinate range like "x: -10.00 to -7.78, y: 7.78 to 10.00"
    const coordMatch = cell.coordinateRange.match(/x:\s*(-?\d+\.?\d*)\s*to\s*(-?\d+\.?\d*),\s*y:\s*(-?\d+\.?\d*)\s*to\s*(-?\d+\.?\d*)/);
    if (!coordMatch) continue;
    
    const [, xMin, xMax, yMin, yMax] = coordMatch.map(Number);
    
    // Convert our -100 to +100 scores to -10 to +10 scale for comparison
    const scaledEconomic = economicScore / 10;
    const scaledSocial = socialScore / 10;
    
    // Check if the user's position falls within this cell's coordinate range
    if (scaledEconomic >= xMin && scaledEconomic <= xMax && 
        scaledSocial >= yMin && scaledSocial <= yMax) {
      return cell;
    }
  }
  
  // Fallback to macro cell logic if no exact match found
  return findIdeologyByPosition(gridData, economicScore, socialScore);
}