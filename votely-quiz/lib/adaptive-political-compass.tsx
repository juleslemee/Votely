import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

export interface CompassPoint {
  x: number; // -10 to 10
  y: number; // -10 to 10
}

interface AdaptivePoliticalCompassProps {
  point?: CompassPoint;
  animateDot?: boolean;
  quizType: 'short' | 'long';
}

// Helper to format labels with proper line breaks for cell size
function formatLabel(label: string, x: number, maxLength: number = 12): React.ReactNode {
  const words = label.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';
  
  words.forEach(word => {
    // If the word itself is too long, break it with a hyphen
    if (word.length > maxLength) {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = '';
      }
      // Break the long word
      const breakPoint = maxLength - 1; // Leave room for hyphen
      lines.push(word.substring(0, breakPoint) + '-');
      currentLine = word.substring(breakPoint);
    } else if (currentLine.length + word.length + 1 <= maxLength) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  });
  if (currentLine) lines.push(currentLine);
  
  if (lines.length === 1) return lines[0];
  
  return (
    <>
      {lines.map((line, index) => (
        <tspan key={index} x={x} dy={index === 0 ? `-${(lines.length - 1) * 0.5}em` : '1em'}>
          {line}
        </tspan>
      ))}
    </>
  );
}

// Macro-cell colors matching the 3D cube
const MACRO_CELL_COLORS = {
  topLeft: '#ff9ea0',      // Revolutionary Communism & State Socialism
  topCenter: '#ff9fff',    // Authoritarian Statist Centrism
  topRight: '#9f9fff',     // Authoritarian Right & Corporatist Monarchism
  middleLeft: '#ffcfa1',   // Democratic Socialism & Left Populism
  middleCenter: '#e5e5e5', // Mixed-Economy Liberal Center
  middleRight: '#9ffffe',  // Conservative Capitalism & National Conservatism
  bottomLeft: '#9fff9e',   // Libertarian Socialism & Anarcho-Communism
  bottomCenter: '#d4fe9a', // Social-Market Libertarianism
  bottomRight: '#ffff9f'   // Anarcho-Capitalism & Ultra-Free-Market Libertarianism
};

// 3x3 macro-cell labels
const MACRO_LABELS = [
  ['Revolutionary\nCommunism &\nState Socialism', 'Authoritarian\nStatist\nCentralism', 'Authoritarian\nRight &\nCorporatist\nMonarchism'],
  ['Democratic\nSocialism &\nLeft Populism', 'Mixed-Economy\nLiberal Center', 'Conservative\nCapitalism &\nNational\nConservatism'],
  ['Libertarian\nSocialism &\nAnarcho-\nCommunism', 'Social-Market\nLibertarianism', 'Anarcho-\nCapitalism &\nUltra-Free-Market\nLibertarianism']
];

// Read the grid details for 9x9 labels (based on TSV coordinate mapping)
const DETAILED_LABELS_9x9 = [
  // Row 1 (top) - y: 7.78 to 10.00 - Most Authoritarian
  ['Bolshevik Marxism', 'Juche', 'Strasserism', 'Falangism', 'Autocratic Theocracy', 'Nazism', 'Francoism', 'Fascism', 'Absolute Monarchy'],
  // Row 2 - y: 5.56 to 7.78
  ['Maoism', 'National Bolshevism', "Ba'athism", 'State Socialism', 'Integralism', 'State Capitalism', 'Constitutional Monarchy', 'Feudalism', 'Authoritarian Capitalism'],
  // Row 3 - y: 3.33 to 5.56
  ['Trotskyism', 'Left-Wing Nationalism', 'Longism', 'Distributism', 'State Liberalism', 'Civic Conservatism', 'Right-Wing Nationalism', 'Paleoconservatism', 'National Capitalism'],
  // Row 4 - y: 1.11 to 3.33
  ['Posadism', 'Socialism', 'Democratic Socialism', 'Social Liberalism', 'Third-Way Labour', 'Neo-Conservatism', 'Conservatism', 'Elective Monarchy', 'Corporatism'],
  // Row 5 (center) - y: -1.11 to 1.11
  ['Orthodox Marxism', 'Market Socialism', 'Labour Liberalism', 'Liberalism', 'Centrism', 'Neoliberalism', 'Liberal Conservatism', 'Traditional Conservatism', 'Capitalism'],
  // Row 6 - y: -3.33 to -1.11
  ['Luxemburgism', 'Syndicalism', 'Social Democracy', 'Liberal Democracy', 'Welfare Capitalism', 'Liberal Capitalism', 'Civil Libertarianism', 'Conservative Libertarianism', 'Libertarian Capitalism'],
  // Row 7 - y: -5.56 to -3.33
  ['Classical Marxism', 'Eco-Socialism', 'Progressivism', 'Nordic Liberalism', 'Social Libertarianism', 'Georgism', 'Classical Liberalism', 'Libertarianism', 'Paleo-Libertarianism'],
  // Row 8 - y: -7.78 to -5.56
  ['Council Communism', 'Minarcho-Socialism', 'Libertarian Socialism', 'Mutualism', 'Minarchism', 'Geo-Libertarianism', 'National Libertarianism', 'Voluntarism', 'Minarcho-Capitalism'],
  // Row 9 (bottom) - y: -10.00 to -7.78 - Most Libertarian
  ['Anarcho-Communism', 'Anarcho-Syndicalism', 'Anarchism', 'Anarcho-Mutualism', 'Agorism', 'Geoanarchism', 'Objectivism', 'Anarcho-Feudalism', 'Anarcho-Capitalism']
];

export function AdaptivePoliticalCompass({ point, animateDot, quizType }: AdaptivePoliticalCompassProps) {
  const margin = 35;
  const size = 400;
  const graphSize = size - margin * 2;
  const center = size / 2;
  const scale = graphSize / 20;
  const labelFontSize = quizType === 'short' ? 10 : 4.5;

  function toSvg(val: number) {
    return center + val * scale;
  }

  const eerieBlack = '#1C2321';
  const antiFlashWhite = '#EEF1EF';
  const gridLine = 'rgba(0, 0, 0, 0.5)';

  if (quizType === 'short') {
    // 3x3 macro-cell view
    const cellSize = 20 / 3; // Each cell is 6.67 units
    
    return (
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-auto"
        aria-label="Political Compass - Macro-cell View"
      >
        {/* Clipping path for clean edges and shadow filter */}
        <defs>
          <clipPath id="macroGridClip">
            <rect x={toSvg(-10)} y={toSvg(-10)} width={scale * 20} height={scale * 20} />
          </clipPath>
          <filter id="subtleShadow">
            <feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity="0.15"/>
          </filter>
        </defs>
        
        {/* Background colors for 3x3 macro-cells with muted opacity */}
        <g clipPath="url(#macroGridClip)">
          {/* Top row */}
          <rect x={toSvg(-10)} y={toSvg(-10)} width={scale * cellSize} height={scale * cellSize} fill={MACRO_CELL_COLORS.topLeft} opacity={0.3} />
          <rect x={toSvg(-10 + cellSize)} y={toSvg(-10)} width={scale * cellSize} height={scale * cellSize} fill={MACRO_CELL_COLORS.topCenter} opacity={0.3} />
          <rect x={toSvg(-10 + 2*cellSize)} y={toSvg(-10)} width={scale * cellSize} height={scale * cellSize} fill={MACRO_CELL_COLORS.topRight} opacity={0.3} />
          
          {/* Middle row */}
          <rect x={toSvg(-10)} y={toSvg(-10 + cellSize)} width={scale * cellSize} height={scale * cellSize} fill={MACRO_CELL_COLORS.middleLeft} opacity={0.3} />
          <rect x={toSvg(-10 + cellSize)} y={toSvg(-10 + cellSize)} width={scale * cellSize} height={scale * cellSize} fill={MACRO_CELL_COLORS.middleCenter} opacity={0.3} />
          <rect x={toSvg(-10 + 2*cellSize)} y={toSvg(-10 + cellSize)} width={scale * cellSize} height={scale * cellSize} fill={MACRO_CELL_COLORS.middleRight} opacity={0.3} />
          
          {/* Bottom row */}
          <rect x={toSvg(-10)} y={toSvg(-10 + 2*cellSize)} width={scale * cellSize} height={scale * cellSize} fill={MACRO_CELL_COLORS.bottomLeft} opacity={0.3} />
          <rect x={toSvg(-10 + cellSize)} y={toSvg(-10 + 2*cellSize)} width={scale * cellSize} height={scale * cellSize} fill={MACRO_CELL_COLORS.bottomCenter} opacity={0.3} />
          <rect x={toSvg(-10 + 2*cellSize)} y={toSvg(-10 + 2*cellSize)} width={scale * cellSize} height={scale * cellSize} fill={MACRO_CELL_COLORS.bottomRight} opacity={0.3} />
        </g>
        
        {/* Grid lines for 3x3 - heavier weight */}
        <g filter="url(#subtleShadow)">
          {[0, 1, 2, 3].map(i => {
            const pos = -10 + i * cellSize;
            return (
              <g key={i}>
                <line x1={toSvg(pos)} y1={toSvg(-10)} x2={toSvg(pos)} y2={toSvg(10)} stroke={eerieBlack} strokeWidth={2.5} />
                <line x1={toSvg(-10)} y1={toSvg(pos)} x2={toSvg(10)} y2={toSvg(pos)} stroke={eerieBlack} strokeWidth={2.5} />
              </g>
            );
          })}
        </g>
        
        {/* Axis labels */}
        <text x={center} y={toSvg(-10) - 25} textAnchor="middle" dominantBaseline="middle" fontSize={13} fontWeight="600" fill={eerieBlack} letterSpacing="0.5">
          AUTHORITARIAN
        </text>
        <text x={center} y={toSvg(10) + 25} textAnchor="middle" dominantBaseline="middle" fontSize={13} fontWeight="600" fill={eerieBlack} letterSpacing="0.5">
          LIBERTARIAN
        </text>
        <text x={toSvg(-10) - 25} y={center} textAnchor="middle" dominantBaseline="middle" fontSize={13} fontWeight="600" fill={eerieBlack} letterSpacing="0.5" style={{ transform: `rotate(-90deg)`, transformOrigin: `${toSvg(-10) - 25}px ${center}px` }}>
          ECONOMIC LEFT
        </text>
        <text x={toSvg(10) + 25} y={center} textAnchor="middle" dominantBaseline="middle" fontSize={13} fontWeight="600" fill={eerieBlack} letterSpacing="0.5" style={{ transform: `rotate(90deg)`, transformOrigin: `${toSvg(10) + 25}px ${center}px` }}>
          ECONOMIC RIGHT
        </text>
        
        {/* Macro-cell labels */}
        {MACRO_LABELS.map((row, rowIndex) => 
          row.map((label, colIndex) => {
            const x = -10 + cellSize/2 + colIndex * cellSize;
            const y = 10 - cellSize/2 - rowIndex * cellSize;
            const lines = label.split('\n');
            const lineHeight = 1.2;
            // Calculate starting y offset to center the text block
            const totalHeight = (lines.length - 1) * lineHeight;
            const startY = -totalHeight / 2;
            
            return (
              <text
                key={`${rowIndex}-${colIndex}`}
                x={toSvg(x)}
                y={toSvg(-y)}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={9.5}
                fontWeight="600"
                fill={eerieBlack}
                style={{ pointerEvents: 'none' }}
              >
                {lines.map((line, lineIndex) => (
                  <tspan 
                    key={lineIndex} 
                    x={toSvg(x)} 
                    dy={lineIndex === 0 ? `${startY}em` : `${lineHeight}em`}
                  >
                    {line}
                  </tspan>
                ))}
              </text>
            );
          })
        )}
        
        {/* User's point */}
        {point && animateDot ? (
          <AnimatedDot x={point.x} y={point.y} toSvg={toSvg} antiFlashWhite={antiFlashWhite} />
        ) : point ? (
          <circle cx={toSvg(point.x)} cy={toSvg(-point.y)} r={8} fill="#6200B3" stroke={antiFlashWhite} strokeWidth={3} />
        ) : null}
      </svg>
    );
  } else {
    // 9x9 detailed view for longer quiz
    const cellSize = 20 / 9; // Each cell is ~2.22 units
    const macroCellSize = 20 / 3; // Each macro-cell is 6.67 units
    
    // Function to get macro-cell color based on cell position
    const getMacroCellColor = (rowIndex: number, colIndex: number) => {
      const macroRow = Math.floor(rowIndex / 3);
      const macroCol = Math.floor(colIndex / 3);
      
      const colorMap = [
        [MACRO_CELL_COLORS.topLeft, MACRO_CELL_COLORS.topCenter, MACRO_CELL_COLORS.topRight],
        [MACRO_CELL_COLORS.middleLeft, MACRO_CELL_COLORS.middleCenter, MACRO_CELL_COLORS.middleRight],
        [MACRO_CELL_COLORS.bottomLeft, MACRO_CELL_COLORS.bottomCenter, MACRO_CELL_COLORS.bottomRight]
      ];
      
      return colorMap[macroRow][macroCol];
    };
    
    return (
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-auto"
        aria-label="Political Compass - Detailed View"
      >
        {/* Create clipping path to prevent color bleeding */}
        <defs>
          <clipPath id="gridClip">
            <rect x={toSvg(-10)} y={toSvg(-10)} width={scale * 20} height={scale * 20} />
          </clipPath>
        </defs>
        
        {/* Macro-cell background colors with proper clipping */}
        <g clipPath="url(#gridClip)">
          {[0, 1, 2].map(macroRow =>
            [0, 1, 2].map(macroCol => {
              const x = -10 + macroCol * macroCellSize;
              const y = 10 - macroRow * macroCellSize;
              const colorMap = [
                [MACRO_CELL_COLORS.topLeft, MACRO_CELL_COLORS.topCenter, MACRO_CELL_COLORS.topRight],
                [MACRO_CELL_COLORS.middleLeft, MACRO_CELL_COLORS.middleCenter, MACRO_CELL_COLORS.middleRight],
                [MACRO_CELL_COLORS.bottomLeft, MACRO_CELL_COLORS.bottomCenter, MACRO_CELL_COLORS.bottomRight]
              ];
              return (
                <rect
                  key={`macro-bg-${macroRow}-${macroCol}`}
                  x={toSvg(x)}
                  y={toSvg(-y)}
                  width={scale * macroCellSize}
                  height={scale * macroCellSize}
                  fill={colorMap[macroRow][macroCol]}
                  opacity={0.3}
                />
              );
            })
          )}
        </g>
        
        {/* Grid lines for 9x9 */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => {
          const pos = -10 + i * cellSize;
          return (
            <g key={i}>
              <line x1={toSvg(pos)} y1={toSvg(-10)} x2={toSvg(pos)} y2={toSvg(10)} stroke={gridLine} strokeWidth={0.8} />
              <line x1={toSvg(-10)} y1={toSvg(pos)} x2={toSvg(10)} y2={toSvg(pos)} stroke={gridLine} strokeWidth={0.8} />
            </g>
          );
        })}
        
        {/* Thick lines for macro-cell boundaries */}
        {[0, 3, 6, 9].map(i => {
          const pos = -10 + i * cellSize;
          return (
            <g key={`thick-${i}`}>
              <line x1={toSvg(pos)} y1={toSvg(-10)} x2={toSvg(pos)} y2={toSvg(10)} stroke={eerieBlack} strokeWidth={2} />
              <line x1={toSvg(-10)} y1={toSvg(pos)} x2={toSvg(10)} y2={toSvg(pos)} stroke={eerieBlack} strokeWidth={2} />
            </g>
          );
        })}
        
        {/* Axis labels */}
        <text x={center} y={toSvg(-10) - 20} textAnchor="middle" dominantBaseline="middle" fontSize={12} fontWeight="500" fill={eerieBlack}>
          Authoritarian
        </text>
        <text x={center} y={toSvg(10) + 20} textAnchor="middle" dominantBaseline="middle" fontSize={12} fontWeight="500" fill={eerieBlack}>
          Libertarian
        </text>
        <text x={toSvg(-10) - 20} y={center} textAnchor="middle" dominantBaseline="middle" fontSize={12} fontWeight="500" fill={eerieBlack} style={{ transform: `rotate(-90deg)`, transformOrigin: `${toSvg(-10) - 20}px ${center}px` }}>
          Economic Left
        </text>
        <text x={toSvg(10) + 20} y={center} textAnchor="middle" dominantBaseline="middle" fontSize={12} fontWeight="500" fill={eerieBlack} style={{ transform: `rotate(90deg)`, transformOrigin: `${toSvg(10) + 20}px ${center}px` }}>
          Economic Right
        </text>
        
        {/* 9x9 cell labels */}
        {DETAILED_LABELS_9x9.map((row, rowIndex) =>
          row.map((label, colIndex) => {
            const x = -10 + cellSize/2 + colIndex * cellSize;
            const y = 10 - cellSize/2 - rowIndex * cellSize;
            return (
              <text
                key={`${rowIndex}-${colIndex}`}
                x={toSvg(x)}
                y={toSvg(-y)}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={4.5}
                fill={eerieBlack}
                fontWeight="600"
                style={{ pointerEvents: 'none' }}
              >
                {formatLabel(label, toSvg(x), 12)}
              </text>
            );
          })
        )}
        
        {/* User's point */}
        {point && animateDot ? (
          <AnimatedDot x={point.x} y={point.y} toSvg={toSvg} antiFlashWhite={antiFlashWhite} />
        ) : point ? (
          <circle cx={toSvg(point.x)} cy={toSvg(-point.y)} r={6} fill="#6200B3" stroke={antiFlashWhite} strokeWidth={2} />
        ) : null}
      </svg>
    );
  }
}

// AnimatedDot component for spiral landing effect
interface AnimatedDotProps {
  x: number;
  y: number;
  toSvg: (val: number) => number;
  antiFlashWhite: string;
}

function AnimatedDot({ x, y, toSvg, antiFlashWhite }: AnimatedDotProps) {
  const controls = useAnimation();
  const center = toSvg(0);
  const finalX = toSvg(x);
  const finalY = toSvg(-y);

  useEffect(() => {
    async function sequence() {
      await controls.start({
        cx: center,
        cy: center - 180,
        scale: 0.7,
        opacity: 0.7,
        transition: { duration: 0 }
      });
      await controls.start({
        cy: center,
        scale: 1,
        opacity: 1,
        transition: { duration: 0.4, ease: 'easeIn' }
      });
      const spiralSteps = 12;
      for (let i = 0; i < spiralSteps; i++) {
        const angle = (i / spiralSteps) * 2 * Math.PI;
        const radius = 18 - i * 1.2;
        await controls.start({
          cx: center + Math.cos(angle) * radius,
          cy: center + Math.sin(angle) * radius,
          transition: { duration: 0.03, ease: 'linear' }
        });
      }
      await controls.start({
        cx: finalX,
        cy: finalY,
        scale: 1.1,
        transition: { duration: 0.5, ease: 'easeOut' }
      });
      await controls.start({
        scale: 0.92,
        transition: { duration: 0.12, ease: 'easeIn' }
      });
      await controls.start({
        scale: 1,
        transition: { duration: 0.12, ease: 'easeOut' }
      });
    }
    sequence();
  }, [center, finalX, finalY, controls]);

  return (
    <motion.circle
      initial={false}
      animate={controls}
      cx={center}
      cy={center - 180}
      r={8}
      fill="#6200B3"
      stroke={antiFlashWhite}
      strokeWidth={3}
      style={{ originX: '50%', originY: '50%' }}
    />
  );
}