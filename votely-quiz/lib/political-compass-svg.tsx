import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

export interface CompassPoint {
  x: number; // -10 to 10
  y: number; // -10 to 10
}

interface PoliticalCompassSvgProps {
  point?: CompassPoint;
  animateDot?: boolean;
}

// Helper to insert line breaks for long labels
function formatLabel(label: string, x: number): React.ReactNode {
  if (label.length > 16) {
    const words = label.split(' ');
    const mid = Math.ceil(words.length / 2);
    return (
      <>
        <tspan x={x} dy="0">{words.slice(0, mid).join(' ')}</tspan>
        <tspan x={x} dy="1.1em">{words.slice(mid).join(' ')}</tspan>
      </>
    );
  }
  return label;
}

export function PoliticalCompassSvg({ point, animateDot }: PoliticalCompassSvgProps) {
  // Add margin so the point is never cut off
  const margin = 18; // px, enough for the point's radius and stroke
  const size = 400;
  const graphSize = size - margin * 2;
  const center = size / 2;
  const scale = graphSize / 20;
  const labelFontSize = 10.5;
  const labelInset = 7.5; // Inset for edge labels to avoid cutoff

  function toSvg(val: number) {
    return center + val * scale;
  }

  // Brand eerie black (use Tailwind text-foreground or #1C2321)
  const eerieBlack = '#1C2321';
  const antiFlashWhite = '#EEF1EF';
  const gridLine = '#B07DD5'; // Brand lavender

  // Zone grid: 4x4 squares, center diamond
  const squares = [];
  const labels = [
    [labelInset, -labelInset, 'Revolutionary Socialist'],
    [labelInset, -2.5, 'Welfare Commander'],
    [labelInset, 2.5, 'Homeland Defender'],
    [labelInset, labelInset, 'Order-First Conservative'],
    [2.5, -labelInset, 'Structured Progressive'],
    [2.5, -2.5, "People's Advocate"],
    [2.5, 2.5, 'Structured Capitalist'],
    [2.5, labelInset, 'Tradition Capitalist'],
    [-2.5, -labelInset, 'Cooperative Dreamer'],
    [-2.5, -2.5, 'Collective Rebel'],
    [-2.5, 2.5, 'Underground Organizer'],
    [-2.5, labelInset, 'Freedom Entrepreneur'],
    [-labelInset, -labelInset, 'Localist Organizer'],
    [-labelInset, -2.5, 'Green Radical'],
    [-labelInset, 2.5, 'Minimalist Libertarian'],
    [-labelInset, labelInset, 'Radical Capitalist'],
  ];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (row === 1 || row === 2) {
        if (col === 1 || col === 2) continue;
      }
      const x = -10 + col * 5;
      const y = 10 - row * 5;
      squares.push(
        <rect
          key={`sq-${row}-${col}`}
          x={toSvg(x)}
          y={toSvg(-y)}
          width={scale * 5}
          height={scale * 5}
          fill="none"
          stroke={gridLine}
          strokeWidth={1}
        />
      );
    }
  }
  const diamond = [
    [toSvg(0), toSvg(-2.5)],
    [toSvg(2.5), toSvg(0)],
    [toSvg(0), toSvg(2.5)],
    [toSvg(-2.5), toSvg(0)],
  ];

  // Pragmatic Moderate label with white background
  const pragmaticText = 'Pragmatic Moderate';
  const pragmaticFontSize = 13;
  const pragmaticPaddingX = 16;
  const pragmaticPaddingY = 6;
  const pragmaticWidth = pragmaticText.length * pragmaticFontSize * 0.55 + pragmaticPaddingX;
  const pragmaticHeight = pragmaticFontSize + pragmaticPaddingY;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-full h-auto"
      aria-label="Political Compass"
    >
      {/* Draw grid squares */}
      {squares}
      {/* Axes with labels */}
      <line x1={toSvg(0)} y1={toSvg(-10)} x2={toSvg(0)} y2={toSvg(10)} stroke={gridLine} strokeWidth={1.5} />
      <line x1={toSvg(-10)} y1={toSvg(0)} x2={toSvg(10)} y2={toSvg(0)} stroke={gridLine} strokeWidth={1.5} />
      
      {/* Axis labels */}
      <text
        x={center}
        y={toSvg(-10) + 15}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={12}
        fontWeight="500"
        fill={eerieBlack}
        style={{ pointerEvents: 'none' }}
      >
        Authoritarian
      </text>
      <text
        x={center}
        y={toSvg(10) - 15}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={12}
        fontWeight="500"
        fill={eerieBlack}
        style={{ pointerEvents: 'none' }}
      >
        Libertarian
      </text>
      <text
        x={toSvg(-10) + 15}
        y={center}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={12}
        fontWeight="500"
        fill={eerieBlack}
        style={{ pointerEvents: 'none', transform: `rotate(-90deg)`, transformOrigin: `${toSvg(-10) + 15}px ${center}px` }}
      >
        Economic Left
      </text>
      <text
        x={toSvg(10) - 15}
        y={center}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={12}
        fontWeight="500"
        fill={eerieBlack}
        style={{ pointerEvents: 'none', transform: `rotate(90deg)`, transformOrigin: `${toSvg(10) - 15}px ${center}px` }}
      >
        Economic Right
      </text>
      {/* Draw center diamond (above grid lines) */}
      <polygon
        points={diamond.map((p) => p.join(",")).join(" ")}
        fill="none"
        stroke={eerieBlack}
        strokeWidth={2}
      />
      {/* Draw zone labels with line breaks and inset */}
      {labels.map(([y, x, label]) => (
        <text
          key={label as string}
          x={toSvg(x as number)}
          y={toSvg(-(y as number))}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={labelFontSize}
          fill={eerieBlack}
          style={{ pointerEvents: 'none', whiteSpace: 'pre' }}
        >
          {formatLabel(label as string, toSvg(x as number))}
        </text>
      ))}
      {/* Pragmatic Moderate label on top with white background */}
      <rect
        x={center - pragmaticWidth / 2}
        y={center - pragmaticHeight / 2}
        width={pragmaticWidth}
        height={pragmaticHeight}
        fill={antiFlashWhite}
        opacity={0.96}
        rx={6}
      />
      <text
        x={center}
        y={center}
        textAnchor="middle"
        dominantBaseline="middle"
        fontWeight="bold"
        fontSize={pragmaticFontSize}
        fill={eerieBlack}
        style={{ pointerEvents: 'none' }}
      >
        Pragmatic Moderate
      </text>
      {/* User's point (always on top) */}
      {point && animateDot ? (
        <AnimatedDot
          x={point.x}
          y={point.y}
          toSvg={toSvg}
          antiFlashWhite={antiFlashWhite}
        />
      ) : point ? (
        <circle
          cx={toSvg(point.x)}
          cy={toSvg(-point.y)}
          r={10}
          fill="#6200B3"
          stroke={antiFlashWhite}
          strokeWidth={3}
        />
      ) : null}
    </svg>
  );
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
      // 1. Start above the graph
      await controls.start({
        cx: center,
        cy: center - 180,
        scale: 0.7,
        opacity: 0.7,
        transition: { duration: 0 }
      });
      // 2. Fall to center
      await controls.start({
        cy: center,
        scale: 1,
        opacity: 1,
        transition: { duration: 0.4, ease: 'easeIn' }
      });
      // 3. Spiral orbit (small circle around center)
      const spiralSteps = 12;
      for (let i = 0; i < spiralSteps; i++) {
        const angle = (i / spiralSteps) * 2 * Math.PI;
        const radius = 18 - i * 1.2; // spiral in
        await controls.start({
          cx: center + Math.cos(angle) * radius,
          cy: center + Math.sin(angle) * radius,
          transition: { duration: 0.03, ease: 'linear' }
        });
      }
      // 4. Fly to final position
      await controls.start({
        cx: finalX,
        cy: finalY,
        scale: 1.1,
        transition: { duration: 0.5, ease: 'easeOut' }
      });
      // 5. Bounce
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
      r={10}
      fill="#6200B3"
      stroke={antiFlashWhite}
      strokeWidth={3}
      style={{ originX: '50%', originY: '50%' }}
    />
  );
} 