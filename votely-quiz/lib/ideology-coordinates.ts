// Ideology coordinate data for Euclidean distance calculation
// Each ideology has coordinates on 6 dimensions:
// - X, Y (from Phase 1)
// - A, B, C, D (from Phase 2 supplementary axes)

import { fetchTSVWithCache } from './tsv-cache';

export interface IdeologyCoordinates {
  ideology: string;
  macroCellCode: string;
  x: number; // Economic axis (-100 to +100)
  y: number; // Authority axis (-100 to +100)
  // Supplementary axes will be loaded dynamically based on macro cell
  supplementaryCoordinates?: Record<string, number>;
}

// Cache for loaded ideology coordinates
let coordinatesCache: Map<string, IdeologyCoordinates[]> | null = null;

export async function loadIdeologyCoordinates(): Promise<Map<string, IdeologyCoordinates[]>> {
  if (coordinatesCache) {
    return coordinatesCache;
  }

  try {
    // Load from grid-details.tsv which contains all 81 ideologies
    // Use cached fetch to avoid repeated requests
    const text = await fetchTSVWithCache('/grid-details.tsv');
    const lines = text.trim().split('\n');
    
    // Skip header
    const dataLines = lines.slice(1);
    
    const coordinatesByMacroCell = new Map<string, IdeologyCoordinates[]>();
    
    dataLines.forEach(line => {
      const [
        macroCellCode,
        macroCellLabel,
        coordinateRange,
        ideology,
        // ... other fields we don't need for coordinates
      ] = line.split('\t');
      
      // Parse coordinate range to get center point
      const coordMatch = coordinateRange.match(/x:\s*(-?\d+\.?\d*)\s*to\s*(-?\d+\.?\d*),\s*y:\s*(-?\d+\.?\d*)\s*to\s*(-?\d+\.?\d*)/);
      if (!coordMatch) return;
      
      const [, xMinStr, xMaxStr, yMinStr, yMaxStr] = coordMatch;
      const xMin = parseFloat(xMinStr);
      const xMax = parseFloat(xMaxStr);
      const yMin = parseFloat(yMinStr);
      const yMax = parseFloat(yMaxStr);
      
      // Use center of cell as ideology position
      const centerX = (xMin + xMax) / 2;
      const centerY = (yMin + yMax) / 2;
      
      // Convert from -10..10 to -100..100 scale
      const ideologyCoords: IdeologyCoordinates = {
        ideology,
        macroCellCode,
        x: centerX * 10,
        y: centerY * 10
      };
      
      if (!coordinatesByMacroCell.has(macroCellCode)) {
        coordinatesByMacroCell.set(macroCellCode, []);
      }
      
      coordinatesByMacroCell.get(macroCellCode)!.push(ideologyCoords);
    });
    
    coordinatesCache = coordinatesByMacroCell;
    return coordinatesByMacroCell;
  } catch (error) {
    console.error('Error loading ideology coordinates:', error);
    return new Map();
  }
}

// Load supplementary axis coordinates for ideologies in a macro cell
// These would need to be defined based on the specific characteristics of each ideology
export async function loadSupplementaryCoordinates(macroCellCode: string): Promise<Map<string, Record<string, number>>> {
  // For now, we'll create placeholder coordinates
  // In a real implementation, these would be loaded from a data file
  const supplementaryCoords = new Map<string, Record<string, number>>();
  
  // Example for EL-GL macro cell
  if (macroCellCode === 'EL-GL') {
    supplementaryCoords.set('Bolshevik Marxism', {
      'ELGL-A': 100,  // Vanguard party directs
      'ELGL-B': 0,    // Balanced national/international
      'ELGL-C': -50,  // Industrial workers focus
      'ELGL-D': -100  // Pure class struggle
    });
    supplementaryCoords.set('Maoism', {
      'ELGL-A': 80,   // Strong party leadership
      'ELGL-B': 50,   // Nation-first
      'ELGL-C': 100,  // Peasant/agrarian base
      'ELGL-D': -50   // Some ethnic considerations
    });
    // ... other ideologies
  }
  
  return supplementaryCoords;
}

// Calculate weighted Euclidean distance
export function calculateWeightedDistance(
  userX: number,
  userY: number,
  userSupplementary: Record<string, number>,
  ideologyX: number,
  ideologyY: number,
  ideologySupplementary: Record<string, number>
): number {
  // Phase 1 axes with half weight
  const xDistance = 0.5 * Math.pow(userX - ideologyX, 2);
  const yDistance = 0.5 * Math.pow(userY - ideologyY, 2);
  
  // Phase 2 axes with full weight
  let supplementaryDistance = 0;
  Object.keys(userSupplementary).forEach(axis => {
    if (ideologySupplementary[axis] !== undefined) {
      supplementaryDistance += 1.0 * Math.pow(userSupplementary[axis] - ideologySupplementary[axis], 2);
    }
  });
  
  return Math.sqrt(xDistance + yDistance + supplementaryDistance);
}

// Find closest ideology using weighted distance
export async function findClosestIdeology(
  macroCellCode: string,
  userX: number,
  userY: number,
  userSupplementary: Record<string, number>
): Promise<string | null> {
  const ideologyCoords = await loadIdeologyCoordinates();
  const macroIdeologies = ideologyCoords.get(macroCellCode);
  
  if (!macroIdeologies || macroIdeologies.length === 0) {
    return null;
  }
  
  const supplementaryCoords = await loadSupplementaryCoordinates(macroCellCode);
  
  let closestIdeology = macroIdeologies[0].ideology;
  let minDistance = Infinity;
  
  for (const ideology of macroIdeologies) {
    const ideologySupp = supplementaryCoords.get(ideology.ideology) || {};
    const distance = calculateWeightedDistance(
      userX,
      userY,
      userSupplementary,
      ideology.x,
      ideology.y,
      ideologySupp
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      closestIdeology = ideology.ideology;
    }
  }
  
  return closestIdeology;
}