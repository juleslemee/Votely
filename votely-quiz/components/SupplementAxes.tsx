'use client';

import { SupplementAxis } from '@/lib/supplement-axes-loader';

interface SupplementAxesProps {
  axes: SupplementAxis[];
  scores: Record<string, number>;
  macroCell: string;
  macroCellColor?: string;
}

// Function to ensure color has sufficient contrast
function ensureContrast(color: string): string {
  // Map of light colors to darker alternatives
  const colorMap: Record<string, string> = {
    '#e5e5e5': '#6b7280', // Gray centrist -> darker gray
    '#ffcfa1': '#ea580c', // Light peach -> darker orange
    '#9ffffe': '#0891b2', // Light cyan -> darker cyan
    '#d4fe9a': '#65a30d', // Light green -> darker green
    '#ffff9f': '#ca8a04', // Light yellow -> darker yellow/amber
    '#ff9ea0': '#dc2626', // Light red -> darker red
    '#ff9fff': '#c026d3', // Light purple -> darker purple
    '#9f9fff': '#7c3aed', // Light blue-purple -> darker purple
    '#9fff9e': '#16a34a', // Light green -> darker green
  };
  
  return colorMap[color.toLowerCase()] || color;
}

export default function SupplementAxes({ axes, scores, macroCell, macroCellColor = '#B07DD5' }: SupplementAxesProps) {
  const displayColor = ensureContrast(macroCellColor);
  
  // Get the cell label from the first axis (they all have the same label for a given macro cell)
  const cellLabel = axes[0]?.cellLabel;

  return (
    <div className="mt-8 pt-8 border-t">
      <h3 className="text-lg sm:text-2xl font-bold text-foreground mb-2">
        <span className="mr-1 sm:mr-2">🎯</span><span className="text-base sm:text-2xl">Your Detailed Position</span>
      </h3>
      <p className="text-xs sm:text-sm text-foreground/60 mb-4 sm:mb-6">
        These axes show nuanced dimensions specific to your ideology grouping:<br />
        <span className="font-medium">{cellLabel || macroCell}</span>
      </p>
      
      <div className="space-y-6">
        {axes.map((axis) => {
          const score = scores[axis.code] || 0;
          const isNegative = score < 0;
          const displayScore = Math.abs(score);
          
          return (
            <div 
              key={axis.code}
              className="relative"
            >
              <div className="flex justify-between mb-2 gap-1">
                <span className="text-xs md:text-sm font-medium whitespace-nowrap" style={{ color: displayColor }}>
                  {axis.axis}
                </span>
                <span className="text-xs md:text-sm text-foreground/60 whitespace-nowrap">
                  {isNegative ? axis.negativeAnchor : axis.positiveAnchor} ({displayScore.toFixed(1)}%)
                </span>
              </div>
              
              <div className="relative">
                <div className="w-full bg-gray-200 rounded-full h-2.5 relative">
                  <div 
                    className="h-2.5 rounded-full transition-all duration-500"
                    style={{ 
                      backgroundColor: displayColor,
                      width: `${displayScore / 2}%`,
                      marginLeft: isNegative ? `${50 - displayScore / 2}%` : '50%'
                    }}
                  />
                </div>
                {/* Center line */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 h-2.5 bg-gray-400"></div>
                <span className="absolute top-full left-1/2 transform -translate-x-1/2 text-xs text-gray-500 mt-1">Center</span>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <p className="text-xs text-gray-700">
          <strong>Note:</strong> These dimensions are specific to your political region and help distinguish 
          between different ideologies within the {macroCell} grouping.
        </p>
      </div>
    </div>
  );
}