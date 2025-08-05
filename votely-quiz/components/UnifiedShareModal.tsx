'use client';

import React, { useState, useRef, Suspense } from 'react';
import { AdaptivePoliticalCompass } from '../lib/adaptive-political-compass';

/**
 * UnifiedShareModal - Comprehensive sharing functionality for quiz results
 * 
 * IMPORTANT: This component has THREE separate rendering contexts:
 * 
 * 1. MODAL UI (visible to user)
 *    - The actual modal dialog with download buttons
 *    - Uses standard React rendering
 * 
 * 2. STATIC SCREENSHOTS (renderLayout function)
 *    - Generates 2D grid and 3D cube static images
 *    - Uses html2canvas to capture hidden divs
 *    - Larger text sizes for readability
 * 
 * 3. GIF FRAMES (captureFrame function)  
 *    - Generates rotating 3D cube animation
 *    - Creates 36 frames for smooth rotation
 *    - Smaller text sizes to optimize file size
 * 
 * MAINTENANCE NOTES:
 * - Always update BOTH rendering contexts when changing styles
 * - Use inline styles (not Tailwind) for html2canvas compatibility
 * - Test downloads after any style changes
 * - Shared styles are defined in SHARE_STYLES constant
 */

interface UnifiedShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  alignment: {
    label: string;
    description: string;
  };
  economic: number;
  social: number;
  progressive: number;
  x: number;
  y: number;
  z: number;
  quizType: string;
  resultPercentage?: number | null;
  politicalGroups?: Array<{name: string, description: string, match: number}>;
  surprisingAlignments?: Array<{group: string, commonGround: string}>;
  ideologyData?: {
    ideology?: string;
    macroCellLabel?: string;
    explanation?: string;
    examples?: string;
    alignIdeology1?: string;
    alignIdeology1Text?: string;
    surpriseIdeology1?: string;
    surpriseIdeology1Text?: string;
    macroCellCode?: string;
  } | null;
  gridData?: Array<{
    ideology: string;
    macroCellLabel: string;
    macroCellCode: string;
    friendlyLabel: string;
  }>;
  supplementAxes?: Array<{
    macroCell: string;
    code: string;
    axis: string;
    negativeAnchor: string;
    positiveAnchor: string;
  }>;
  supplementScores?: Record<string, number>;
}

// Lazy load the 3D components
const ResultCube = React.lazy(() => import('./ResultCube'));
const ResultCubeFallback = React.lazy(() => import('./ResultCubeFallback'));

// Macro cell colors from the political compass
const MACRO_CELL_COLORS = {
  'EL-GL': '#ff9ea0',   // Revolutionary Communism & State Socialism
  'EM-GL': '#ff9fff',   // Authoritarian Statist Centrism
  'ER-GL': '#9f9fff',   // Authoritarian Right & Corporatist Monarchism
  'EL-GM': '#ffcfa1',   // Democratic Socialism & Left Populism
  'EM-GM': '#e5e5e5',   // Mixed-Economy Liberal Center
  'ER-GM': '#9ffffe',   // Conservative Capitalism & National Conservatism
  'EL-GR': '#9fff9e',   // Libertarian Socialism & Anarcho-Communism
  'EM-GR': '#d4fe9a',   // Social-Market Libertarianism
  'ER-GR': '#ffff9f'    // Anarcho-Capitalism & Ultra-Free-Market Libertarianism
};

// Helper function to get macro cell color
function getMacroCellColor(macroCellCode: string): string {
  return MACRO_CELL_COLORS[macroCellCode as keyof typeof MACRO_CELL_COLORS] || '#e5e5e5';
}

// Function to ensure color has sufficient contrast (matching SupplementAxes.tsx)
function ensureContrast(color: string): string {
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

// Shared styles for consistent rendering across all three contexts
// IMPORTANT: These styles are used in three different rendering contexts:
// 1. GIF frames (captureFrame function) - smaller sizes for file size optimization
// 2. Static screenshots (renderLayout function) - standard sizes
// 3. Both use inline styles for html2canvas compatibility
const SHARE_STYLES = {
  // Main score styles
  scoreContainer: {
    marginBottom: '12px'
  },
  scoreItem: {
    gif: {
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      padding: '10px',
      marginBottom: '6px',
      fontSize: '10px',
      lineHeight: '14px'
    },
    static: {
      marginBottom: '12px'
    }
  },
  scoreLabel: {
    gif: {
      fontWeight: '500',
      color: '#9333ea'
    },
    static: {
      fontSize: '12px',
      fontWeight: '500',
      color: '#9333ea',
      lineHeight: '16px'
    }
  },
  scoreValue: {
    gif: {
      color: '#4b5563'
    },
    static: {
      fontSize: '12px',
      color: '#4b5563',
      lineHeight: '16px'
    }
  },
  scoreBar: {
    height: '6px',  // Changed from 8px to match supplement axes
    backgroundColor: '#e5e7eb',
    borderRadius: '9999px'
  },
  scoreBarFill: {
    height: '6px',  // Changed from 8px to match supplement axes
    backgroundColor: '#a855f7',
    borderRadius: '9999px'
  },
  
  // Supplement axes styles
  supplementContainer: {
    gif: {
      marginBottom: '12px',
      marginTop: '6px'
    },
    static: {
      marginBottom: '12px',
      marginTop: '8px'
    }
  },
  supplementHeader: {
    gif: {
      fontSize: '10px',
      fontWeight: '600',
      color: '#111827',
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '3px',
      lineHeight: '14px'
    },
    static: {
      fontSize: '12px',
      fontWeight: '600',
      color: '#111827',
      marginBottom: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      lineHeight: '16px'
    }
  },
  supplementAxis: {
    gif: {
      paddingTop: '3px',
      paddingBottom: '3px'
    },
    static: {
      paddingTop: '4px',
      paddingBottom: '4px'
    }
  },
  supplementBar: {
    gif: {
      height: '4px',
      backgroundColor: '#e5e7eb',
      borderRadius: '9999px'
    },
    static: {
      height: '6px',
      backgroundColor: '#e5e7eb',
      borderRadius: '9999px'
    }
  },
  
  // Alignment card styles
  alignmentHeader: {
    gif: {
      fontSize: '11px',
      fontWeight: '700',
      color: '#111827',
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      lineHeight: '14px'
    },
    static: {
      fontSize: '13px',
      fontWeight: '600',
      color: '#111827',
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      lineHeight: '16px'
    }
  },
  alignmentCard: {
    gif: {
      padding: '8px 10px'
    },
    static: {
      padding: '10px 12px'
    }
  },
  alignmentTitle: {
    gif: {
      fontWeight: '600',
      color: '#111827',
      fontSize: '10px',
      lineHeight: '13px',
      marginBottom: '3px'
    },
    static: {
      fontWeight: '600',
      color: '#111827',
      fontSize: '12px',
      lineHeight: '16px',
      marginBottom: '4px'
    }
  },
  alignmentText: {
    gif: {
      fontSize: '10px',
      color: '#4b5563',
      lineHeight: '13px'
    },
    static: {
      fontSize: '11px',
      color: '#4b5563',
      lineHeight: '15px'
    }
  }
};

// Helper function to find grid data by ideology name (for alignments)
function findGridDataByIdeology(gridData: Array<{ideology: string, macroCellLabel: string, macroCellCode: string, friendlyLabel: string}>, ideologyName: string) {
  return gridData.find(cell => 
    cell.ideology === ideologyName || 
    cell.friendlyLabel === ideologyName ||
    cell.macroCellLabel.includes(ideologyName)
  ) || null;
}

export default function UnifiedShareModal({
  isOpen,
  onClose,
  alignment,
  economic,
  social,
  progressive,
  x,
  y,
  z,
  quizType,
  resultPercentage,
  politicalGroups = [],
  surprisingAlignments = [],
  ideologyData = null,
  gridData = [],
  supplementAxes = [],
  supplementScores = {}
}: UnifiedShareModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingType, setGeneratingType] = useState<'2d' | '3d' | 'gif' | null>(null);
  const [gifProgress, setGifProgress] = useState(0);
  const share2DRef = useRef<HTMLDivElement>(null);
  const share3DRef = useRef<HTMLDivElement>(null);
  const gifFrameRefs = useRef<(HTMLDivElement | null)[]>([]);

  const generateScreenshot = async (type: '2d' | '3d') => {
    const ref = type === '2d' ? share2DRef.current : share3DRef.current;
    if (!ref) return;
    
    setIsGenerating(true);
    setGeneratingType(type);
    
    try {
      // Dynamic import to avoid SSR issues
      const html2canvas = (await import('html2canvas')).default;
      
      const canvas = await html2canvas(ref, {
        width: 1080,
        height: 1080,
        scale: 2, // High DPI
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          const resultLabel = quizType === 'short' ? 
          (ideologyData?.macroCellLabel || alignment.label) : 
          (ideologyData?.ideology || alignment.label);
        link.download = `votely-${type}-${resultLabel.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, 'image/png', 1);
      
    } catch (error) {
      console.error('Error generating screenshot:', error);
    } finally {
      setIsGenerating(false);
      setGeneratingType(null);
    }
  };


  // Helper function to capture a single frame
  const captureFrame = async (frameIndex: number, rotationAngle: number, html2canvas: any): Promise<HTMLCanvasElement | null> => {
    try {
      // Create a temporary container for this frame
      const frameContainer = document.createElement('div');
      frameContainer.style.position = 'absolute';
      frameContainer.style.top = '-10000px'; // Hide off-screen
      frameContainer.style.left = '-10000px';
      frameContainer.style.width = '1080px';
      frameContainer.style.height = '1080px';
      document.body.appendChild(frameContainer);

      // Render the frame layout
      const React = await import('react');
      const ReactDOM = await import('react-dom/client');
      
      const root = ReactDOM.createRoot(frameContainer);
      
      // Create a promise that resolves when the frame is ready
      return new Promise<HTMLCanvasElement | null>((resolve) => {
        const FrameComponent = () => (
          <div className="bg-white" style={{ width: '1080px', height: '1080px' }}>
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 h-20">
              <div className="flex items-center justify-between h-full">
                <div>
                  <h1 className="text-2xl font-bold">Votely Political Quiz</h1>
                  <p className="text-purple-100 text-sm">My Political Alignment</p>
                </div>
              </div>
            </div>

            {/* Main content area */}
            <div className="p-6 h-[calc(1080px-80px-96px)] flex gap-6">
              {/* Left: 3D Cube at specific rotation angle */}
              <div className="w-[540px] flex-shrink-0 flex items-center justify-center">
                <div style={{ width: '540px', height: '540px' }}>
                  <Suspense fallback={<div className="w-full h-full bg-gray-100 rounded-lg" />}>
                    {typeof window !== 'undefined' && 'WebGLRenderingContext' in window ? (
                      <ResultCube
                        x={economic}
                        y={social}
                        z={progressive}
                        ideologyLabel={alignment.label}
                        onInteraction={() => {}}
                        hideHint={true}
                        disableAutoRotate={true}
                        fixedRotationAngle={rotationAngle}
                      />
                    ) : (
                      <ResultCubeFallback
                        x={economic}
                        y={social}
                        z={progressive}
                        ideologyLabel={alignment.label}
                      />
                    )}
                  </Suspense>
                </div>
              </div>

              {/* Right: Results panel - matching exact structure from results page */}
              <div className="w-[480px] flex-shrink-0">
                <div className="bg-white rounded-lg p-5 h-full overflow-hidden">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    {quizType === 'short' ? 
                      (ideologyData?.macroCellLabel || alignment.label) : 
                      (ideologyData?.ideology || alignment.label)
                    }
                  </h2>
                  {resultPercentage !== null && (
                    <p className="text-sm text-gray-600 mb-3">
                      {resultPercentage}% of quiz takers get this result
                    </p>
                  )}
                  
                  {/* Recent Examples Section */}
                  {ideologyData?.examples && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <h3 className="text-xs font-semibold text-gray-600 mb-1">Recent Examples</h3>
                      <p className="text-xs text-gray-700 leading-tight">{ideologyData.examples}</p>
                    </div>
                  )}
                  
                  {/* Scores */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ 
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      padding: '10px',
                      marginBottom: '6px',
                      fontSize: '10px',
                      lineHeight: '14px'
                    }}>
                      <span style={{ fontWeight: '500', color: '#9333ea' }}>Economic Score:</span> {economic < 0 ? 'Left' : 'Right'} ({Math.abs(economic).toFixed(1)}%)
                    </div>
                    <div style={{ 
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      padding: '10px',
                      marginBottom: '6px',
                      fontSize: '10px',
                      lineHeight: '14px'
                    }}>
                      <span style={{ fontWeight: '500', color: '#9333ea' }}>Governance Score:</span> {social > 0 ? 'Authoritarian' : 'Libertarian'} ({Math.abs(social).toFixed(1)}%)
                    </div>
                    <div style={{ 
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      padding: '10px',
                      fontSize: '10px',
                      lineHeight: '14px'
                    }}>
                      <span style={{ fontWeight: '500', color: '#9333ea' }}>Social Score:</span> {progressive < 0 ? 'Progressive' : 'Conservative'} ({Math.abs(progressive).toFixed(1)}%)
                    </div>
                  </div>

                  {/* Supplement Axes for Long Quiz */}
                  {quizType === 'long' && supplementAxes.length > 0 && (
                    <div style={{ marginBottom: '12px', marginTop: '6px' }}>
                      <h3 style={{ 
                        fontSize: '10px', 
                        fontWeight: '600',
                        color: '#111827',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        lineHeight: '14px'
                      }}>
                        <span style={{ fontSize: '10px' }}>🎯</span> Your Detailed Position
                      </h3>
                      <div>
                        {supplementAxes.slice(0, 4).map((axis) => {
                          const score = supplementScores[axis.code] || 0;
                          const isNegative = score < 0;
                          const displayScore = Math.abs(score);
                          const macroCellColor = getMacroCellColor(ideologyData?.macroCellCode || '');
                          const displayColor = ensureContrast(macroCellColor);
                          
                          return (
                            <div key={axis.code} style={{ 
                              paddingTop: '3px',
                              paddingBottom: '3px'
                            }}>
                              <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'flex-start',
                                gap: '6px',
                                marginBottom: '4px'
                              }}>
                                <span style={{ 
                                  fontSize: '10px', 
                                  fontWeight: '500',
                                  color: displayColor,
                                  lineHeight: '14px',
                                  display: 'block'
                                }}>{axis.axis}</span>
                                <span style={{ 
                                  fontSize: '10px', 
                                  color: '#4b5563',
                                  whiteSpace: 'nowrap',
                                  lineHeight: '14px',
                                  display: 'block'
                                }}>
                                  {isNegative ? axis.negativeAnchor : axis.positiveAnchor} ({displayScore.toFixed(1)}%)
                                </span>
                              </div>
                              <div style={{ 
                                position: 'relative',
                                height: '4px',
                                backgroundColor: '#e5e7eb',
                                borderRadius: '9999px',
                                overflow: 'visible'
                              }}>
                                <div 
                                  style={{ 
                                    position: 'absolute',
                                    height: '4px',
                                    borderRadius: '9999px',
                                    backgroundColor: displayColor,
                                    left: isNegative ? `${50 - displayScore/2}%` : '50%',
                                    width: `${displayScore/2}%`,
                                    top: '0'
                                  }}
                                />
                                <div style={{ 
                                  position: 'absolute',
                                  width: '2px',
                                  height: '6px',
                                  backgroundColor: '#9ca3af',
                                  borderRadius: '9999px',
                                  left: '50%',
                                  top: '50%',
                                  transform: 'translate(-50%, -50%)'
                                }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {(ideologyData?.explanation || alignment.description) && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-xs text-gray-700 leading-tight">
                        {ideologyData?.explanation || alignment.description}
                      </p>
                    </div>
                  )}

                  {/* You Align With - using exact card style from results page */}
                  {ideologyData?.alignIdeology1 && (
                    <div style={{ marginBottom: '12px' }}>
                      <h3 style={{ 
                        fontSize: '11px',
                        fontWeight: '700',
                        color: '#111827',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        lineHeight: '14px'
                      }}>
                        <span style={{ fontSize: '12px' }}>👥</span> You Align With
                      </h3>
                      {(() => {
                        let alignmentData = null;
                        let alignmentLabel = ideologyData.alignIdeology1;
                        let alignmentColor = '#22c55e';
                        
                        if (quizType === 'short') {
                          alignmentData = findGridDataByIdeology(gridData, ideologyData.alignIdeology1);
                          if (alignmentData) {
                            alignmentLabel = alignmentData.macroCellLabel;
                            alignmentColor = getMacroCellColor(alignmentData.macroCellCode);
                          }
                        } else {
                          alignmentData = gridData.find(cell => cell.ideology === ideologyData.alignIdeology1);
                          if (alignmentData) {
                            alignmentColor = getMacroCellColor(alignmentData.macroCellCode);
                          }
                        }
                        
                        return (
                          <table style={{ 
                            width: '100%', 
                            borderCollapse: 'collapse',
                            borderTopRightRadius: '0.5rem',
                            borderBottomRightRadius: '0.5rem',
                            borderLeft: `4px solid ${alignmentColor}`,
                            backgroundColor: '#f9fafb'
                          }}>
                            <tr>
                              <td style={{ 
                                padding: '8px 10px',
                                verticalAlign: 'top',
                                borderTopRightRadius: '0.5rem',
                                borderBottomRightRadius: '0.5rem'
                              }}>
                                <div style={{ 
                                  fontWeight: '600', 
                                  color: '#111827', 
                                  fontSize: '10px', 
                                  lineHeight: '13px',
                                  marginBottom: '3px'
                                }}>
                                  {alignmentLabel}
                                </div>
                                <div style={{ 
                                  fontSize: '10px', 
                                  color: '#4b5563', 
                                  lineHeight: '13px'
                                }}>
                                  {ideologyData.alignIdeology1Text}
                                </div>
                              </td>
                            </tr>
                          </table>
                        );
                      })()}
                    </div>
                  )}

                  {/* What Might Surprise You */}
                  {ideologyData?.surpriseIdeology1 && (
                    <div>
                      <h4 style={{ 
                        fontSize: '11px',
                        fontWeight: '600',
                        color: '#111827',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        lineHeight: '14px'
                      }}>
                        <span style={{ fontSize: '12px' }}>💭</span> What Might Surprise You
                      </h4>
                      {(() => {
                        let surpriseData = null;
                        let surpriseLabel = ideologyData.surpriseIdeology1;
                        let surpriseColor = '#f59e0b';
                        
                        if (quizType === 'short') {
                          surpriseData = findGridDataByIdeology(gridData, ideologyData.surpriseIdeology1);
                          if (surpriseData) {
                            surpriseLabel = surpriseData.macroCellLabel;
                            surpriseColor = getMacroCellColor(surpriseData.macroCellCode);
                          }
                        } else {
                          surpriseData = gridData.find(cell => cell.ideology === ideologyData.surpriseIdeology1);
                          if (surpriseData) {
                            surpriseColor = getMacroCellColor(surpriseData.macroCellCode);
                          }
                        }
                        
                        return (
                          <table style={{ 
                            width: '100%', 
                            borderCollapse: 'collapse',
                            borderTopRightRadius: '0.5rem',
                            borderBottomRightRadius: '0.5rem',
                            borderLeft: `4px solid ${surpriseColor}`,
                            backgroundColor: '#f9fafb'
                          }}>
                            <tr>
                              <td style={{ 
                                padding: '8px 10px',
                                verticalAlign: 'top',
                                borderTopRightRadius: '0.5rem',
                                borderBottomRightRadius: '0.5rem'
                              }}>
                                <div style={{ 
                                  fontWeight: '600', 
                                  color: '#111827', 
                                  fontSize: '10px', 
                                  lineHeight: '13px',
                                  marginBottom: '3px'
                                }}>
                                  {surpriseLabel}
                                </div>
                                <div style={{ 
                                  fontSize: '10px', 
                                  color: '#4b5563', 
                                  lineHeight: '13px'
                                }}>
                                  {ideologyData.surpriseIdeology1Text}
                                </div>
                              </td>
                            </tr>
                          </table>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white h-24 flex items-center justify-center px-8">
              <div className="flex items-center justify-between w-full max-w-4xl">
                <div className="flex items-center gap-4">
                  <img src="/logo.svg" alt="Votely" className="h-12 w-auto" />
                  <div>
                    <div className="text-2xl font-bold">VOTELY</div>
                    <div className="text-sm text-purple-200">Political Quiz</div>
                  </div>
                </div>
                <div className="text-lg text-purple-200 font-medium">votelyquiz.juleslemee.com</div>
              </div>
            </div>
          </div>
        );

        root.render(<FrameComponent />);
        
        // Wait for 3D rendering to complete
        setTimeout(async () => {
          try {
            const canvas = await html2canvas(frameContainer, {
              width: 1080,
              height: 1080,
              scale: 1, // Lower scale for GIF frames to reduce file size
              useCORS: true,
              allowTaint: true,
              backgroundColor: '#ffffff'
            });
            
            // Clean up
            root.unmount();
            document.body.removeChild(frameContainer);
            
            resolve(canvas);
          } catch (error) {
            console.error(`Error capturing frame ${frameIndex}:`, error);
            root.unmount();
            document.body.removeChild(frameContainer);
            resolve(null); // Continue with next frame even if this one fails
          }
        }, 400); // Slightly increased wait time for more stable rendering
      });
    } catch (error) {
      console.error(`Failed to create frame ${frameIndex}:`, error);
      return null;
    }
  };

  const generateGif = async () => {
    setIsGenerating(true);
    setGeneratingType('gif');
    setGifProgress(0);

    try {
      // Dynamic import to avoid SSR issues
      const html2canvas = (await import('html2canvas')).default;
      const GIF = (await import('gif.js')).default;

      const gif = new GIF({
        workers: 4, // Increased workers
        quality: 5, // Higher quality (lower number = better quality, 1-20 range)
        width: 1080,
        height: 1080,
        workerScript: '/gif.worker.js',
        dither: 'FloydSteinberg' // Better color dithering for smoother gradients
      });

      const totalFrames = 36; // 10-degree increments for smooth rotation
      
      console.log(`Starting GIF generation with ${totalFrames} frames...`);
      const startTime = performance.now();
      
      // Generate frames sequentially
      for (let frame = 0; frame < totalFrames; frame++) {
        const rotationAngle = (frame / totalFrames) * 360; // 0 to 360 degrees
        const canvas = await captureFrame(frame, rotationAngle, html2canvas);
        
        if (canvas) {
          gif.addFrame(canvas, { delay: 100 });
        }
        
        // Update progress
        setGifProgress(((frame + 1) / totalFrames) * 100);
      }
      
      const captureTime = performance.now() - startTime;
      console.log(`Frame capture completed in ${captureTime.toFixed(0)}ms`);


      // Generate the final GIF
      gif.on('finished', (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const resultLabel = quizType === 'short' ? 
          (ideologyData?.macroCellLabel || alignment.label) : 
          (ideologyData?.ideology || alignment.label);
        link.download = `votely-3d-rotating-${resultLabel.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}.gif`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        setIsGenerating(false);
        setGeneratingType(null);
        setGifProgress(0);
      });

      gif.render();

    } catch (error) {
      console.error('Error generating GIF:', error);
      setIsGenerating(false);
      setGeneratingType(null);
      setGifProgress(0);
    }
  };

  const handleCopyLink = () => {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('shared', 'true');
    const shareUrl = currentUrl.toString();
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    } else {
      window.prompt('Copy this link:', shareUrl);
    }
  };

  const renderLayout = (type: '2d' | '3d', ref: React.RefObject<HTMLDivElement>) => (
    <div
      ref={ref}
      className="bg-white absolute -top-[10000px] -left-[10000px]"
      style={{ width: '1080px', height: '1080px' }}
    >
      {/* Header - Smaller */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 h-20">
        <div className="flex items-center justify-between h-full">
          <div>
            <h1 className="text-2xl font-bold">Votely Political Quiz</h1>
            <p className="text-purple-100 text-sm">My Political Alignment</p>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="p-6 h-[calc(1080px-80px-96px)] flex gap-6">
        {/* Left: Visualization - Fixed size */}
        <div className="w-[540px] flex-shrink-0 flex items-center justify-center">
          <div style={{ width: '540px', height: '540px' }}>
            {type === '2d' ? (
              <AdaptivePoliticalCompass 
                point={{ x, y }} 
                quizType="long" // Always use detailed view for screenshots
              />
            ) : (
              <Suspense fallback={<div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">Loading 3D...</div>}>
                {typeof window !== 'undefined' && 'WebGLRenderingContext' in window ? (
                  <ResultCube
                    x={economic}
                    y={social}
                    z={progressive}
                    ideologyLabel={alignment.label}
                    onInteraction={() => {}} // No interaction needed for static screenshot
                    hideHint={true} // Hide the "drag to rotate" hint for screenshots
                    disableAutoRotate={true} // Keep the cube static for clean screenshots
                  />
                ) : (
                  <ResultCubeFallback
                    x={economic}
                    y={social}
                    z={progressive}  
                    ideologyLabel={alignment.label}
                  />
                )}
              </Suspense>
            )}
          </div>
        </div>

        {/* Right: Results - matching exact structure from results page */}
        <div className="w-[480px] flex-shrink-0">
          <div className="bg-white rounded-lg p-5 h-full overflow-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {quizType === 'short' ? 
                (ideologyData?.macroCellLabel || alignment.label) : 
                (ideologyData?.ideology || alignment.label)
              }
            </h2>
            {resultPercentage !== null && (
              <p className="text-sm text-gray-600 mb-3">
                {resultPercentage}% of quiz takers get this result
              </p>
            )}
            
            {/* Description - moved up to match results page */}
            {(ideologyData?.explanation || alignment.description) && (
              <p className="text-xs text-gray-700 mb-4" style={{ lineHeight: '1.4' }}>
                {ideologyData?.explanation || alignment.description}
              </p>
            )}
            
            {/* Recent Examples Section - inline style */}
            {ideologyData?.examples && (
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-gray-600 mb-1.5">Recent Examples</h3>
                <p className="text-xs text-gray-700" style={{ lineHeight: '1.4' }}>{ideologyData.examples}</p>
              </div>
            )}
            
            {/* Scores with sliders */}
            <div style={{ marginBottom: '12px' }}>
              {/* Economic Score */}
              <div style={{ 
                paddingTop: '4px',
                paddingBottom: '4px'
              }}>
                <div style={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '8px',
                  marginBottom: '6px'
                }}>
                  <span style={{ 
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#9333ea',
                    lineHeight: '16px',
                    display: 'block'
                  }}>Economic Score</span>
                  <span style={{ 
                    fontSize: '12px',
                    color: '#4b5563',
                    whiteSpace: 'nowrap',
                    lineHeight: '16px',
                    display: 'block'
                  }}>{economic < 0 ? 'Left' : 'Right'} ({Math.abs(economic).toFixed(1)}%)</span>
                </div>
                <div style={{ 
                  position: 'relative',
                  height: '6px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '9999px',
                  overflow: 'visible'
                }}>
                  <div style={{ 
                    position: 'absolute',
                    height: '6px',
                    borderRadius: '9999px',
                    backgroundColor: '#a855f7',
                    left: economic < 0 ? `${50 + economic/2}%` : '50%',
                    width: `${Math.abs(economic)/2}%`,
                    top: '0'
                  }} />
                  <div style={{ 
                    position: 'absolute',
                    width: '2px',
                    height: '8px',
                    backgroundColor: '#9ca3af',
                    borderRadius: '9999px',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)'
                  }} />
                </div>
              </div>
              
              {/* Governance Score */}
              <div style={{ 
                paddingTop: '4px',
                paddingBottom: '4px'
              }}>
                <div style={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '8px',
                  marginBottom: '6px'
                }}>
                  <span style={{ 
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#9333ea',
                    lineHeight: '16px',
                    display: 'block'
                  }}>Governance Score</span>
                  <span style={{ 
                    fontSize: '12px',
                    color: '#4b5563',
                    whiteSpace: 'nowrap',
                    lineHeight: '16px',
                    display: 'block'
                  }}>{social > 0 ? 'Authoritarian' : 'Libertarian'} ({Math.abs(social).toFixed(1)}%)</span>
                </div>
                <div style={{ 
                  position: 'relative',
                  height: '6px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '9999px',
                  overflow: 'visible'
                }}>
                  <div style={{ 
                    position: 'absolute',
                    height: '6px',
                    borderRadius: '9999px',
                    backgroundColor: '#a855f7',
                    left: social < 0 ? `${50 + social/2}%` : '50%',
                    width: `${Math.abs(social)/2}%`,
                    top: '0'
                  }} />
                  <div style={{ 
                    position: 'absolute',
                    width: '2px',
                    height: '8px',
                    backgroundColor: '#9ca3af',
                    borderRadius: '9999px',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)'
                  }} />
                </div>
              </div>
              
              {/* Social Score */}
              <div style={{ 
                paddingTop: '4px',
                paddingBottom: '4px'
              }}>
                <div style={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '8px',
                  marginBottom: '6px'
                }}>
                  <span style={{ 
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#9333ea',
                    lineHeight: '16px',
                    display: 'block'
                  }}>Social Score</span>
                  <span style={{ 
                    fontSize: '12px',
                    color: '#4b5563',
                    whiteSpace: 'nowrap',
                    lineHeight: '16px',
                    display: 'block'
                  }}>{progressive < 0 ? 'Progressive' : 'Conservative'} ({Math.abs(progressive).toFixed(1)}%)</span>
                </div>
                <div style={{ 
                  position: 'relative',
                  height: '6px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '9999px',
                  overflow: 'visible'
                }}>
                  <div style={{ 
                    position: 'absolute',
                    height: '6px',
                    borderRadius: '9999px',
                    backgroundColor: '#a855f7',
                    left: progressive < 0 ? `${50 + progressive/2}%` : '50%',
                    width: `${Math.abs(progressive)/2}%`,
                    top: '0'
                  }} />
                  <div style={{ 
                    position: 'absolute',
                    width: '2px',
                    height: '8px',
                    backgroundColor: '#9ca3af',
                    borderRadius: '9999px',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)'
                  }} />
                </div>
              </div>
            </div>

            {/* Supplement Axes for Long Quiz */}
            {quizType === 'long' && supplementAxes.length > 0 && (
              <div style={{ marginBottom: '12px', marginTop: '8px' }}>
                <h3 style={{ 
                  fontSize: '12px', 
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  lineHeight: '16px'
                }}>
                  <span>🎯</span> Your Detailed Position
                </h3>
                <div>
                  {supplementAxes.map((axis) => {
                    const score = supplementScores[axis.code] || 0;
                    const isNegative = score < 0;
                    const displayScore = Math.abs(score);
                    const macroCellColor = getMacroCellColor(ideologyData?.macroCellCode || '');
                    const displayColor = ensureContrast(macroCellColor);
                    
                    return (
                      <div key={axis.code} style={{ 
                        paddingTop: '4px',
                        paddingBottom: '4px'
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'flex-start',
                          gap: '8px',
                          marginBottom: '6px'
                        }}>
                          <span style={{ 
                            fontSize: '12px', 
                            fontWeight: '500',
                            color: displayColor,
                            lineHeight: '16px',
                            display: 'block'
                          }}>{axis.axis}</span>
                          <span style={{ 
                            fontSize: '12px', 
                            color: '#4b5563',
                            whiteSpace: 'nowrap',
                            lineHeight: '16px',
                            display: 'block'
                          }}>
                            {isNegative ? axis.negativeAnchor : axis.positiveAnchor} ({displayScore.toFixed(1)}%)
                          </span>
                        </div>
                        <div style={{ 
                          position: 'relative',
                          height: '6px',
                          backgroundColor: '#e5e7eb',
                          borderRadius: '9999px',
                          overflow: 'visible'
                        }}>
                          <div 
                            style={{ 
                              position: 'absolute',
                              height: '6px',
                              borderRadius: '9999px',
                              backgroundColor: displayColor,
                              left: isNegative ? `${50 - displayScore/2}%` : '50%',
                              width: `${displayScore/2}%`,
                              top: '0'
                            }}
                          />
                          <div style={{ 
                            position: 'absolute',
                            width: '2px',
                            height: '8px',
                            backgroundColor: '#9ca3af',
                            borderRadius: '9999px',
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)'
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* You Align With - using exact card style from results page */}
            {ideologyData?.alignIdeology1 && (
              <div style={{ marginBottom: '12px' }}>
                <h3 style={{ 
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  lineHeight: '16px'
                }}>
                  <span>👥</span> You Align With
                </h3>
                {(() => {
                  let alignmentData = null;
                  let alignmentLabel = ideologyData.alignIdeology1;
                  let alignmentColor = '#22c55e';
                  
                  if (quizType === 'short') {
                    alignmentData = findGridDataByIdeology(gridData, ideologyData.alignIdeology1);
                    if (alignmentData) {
                      alignmentLabel = alignmentData.macroCellLabel;
                      alignmentColor = getMacroCellColor(alignmentData.macroCellCode);
                    }
                  } else {
                    alignmentData = gridData.find(cell => cell.ideology === ideologyData.alignIdeology1);
                    if (alignmentData) {
                      alignmentColor = getMacroCellColor(alignmentData.macroCellCode);
                    }
                  }
                  
                  return (
                    <table style={{ 
                      width: '100%', 
                      borderCollapse: 'collapse',
                      borderTopRightRadius: '0.5rem',
                      borderBottomRightRadius: '0.5rem',
                      borderLeft: `4px solid ${alignmentColor}`,
                      backgroundColor: '#f9fafb'
                    }}>
                      <tr>
                        <td style={{ 
                          padding: '10px 12px',
                          verticalAlign: 'top',
                          borderTopRightRadius: '0.5rem',
                          borderBottomRightRadius: '0.5rem'
                        }}>
                          <div style={{ 
                            fontWeight: '600', 
                            color: '#111827', 
                            fontSize: '12px', 
                            lineHeight: '16px',
                            marginBottom: '4px'
                          }}>
                            {alignmentLabel}
                          </div>
                          <div style={{ 
                            fontSize: '11px', 
                            color: '#4b5563', 
                            lineHeight: '15px'
                          }}>
                            {ideologyData.alignIdeology1Text}
                          </div>
                        </td>
                      </tr>
                    </table>
                  );
                })()}
              </div>
            )}

            {/* What Might Surprise You */}
            {ideologyData?.surpriseIdeology1 && (
              <div>
                <h4 style={{ 
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  lineHeight: '16px'
                }}>
                  <span>💭</span> What Might Surprise You
                </h4>
                {(() => {
                  let surpriseData = null;
                  let surpriseLabel = ideologyData.surpriseIdeology1;
                  let surpriseColor = '#f59e0b';
                  
                  if (quizType === 'short') {
                    surpriseData = findGridDataByIdeology(gridData, ideologyData.surpriseIdeology1);
                    if (surpriseData) {
                      surpriseLabel = surpriseData.macroCellLabel;
                      surpriseColor = getMacroCellColor(surpriseData.macroCellCode);
                    }
                  } else {
                    surpriseData = gridData.find(cell => cell.ideology === ideologyData.surpriseIdeology1);
                    if (surpriseData) {
                      surpriseColor = getMacroCellColor(surpriseData.macroCellCode);
                    }
                  }
                  
                  return (
                    <table style={{ 
                      width: '100%', 
                      borderCollapse: 'collapse',
                      borderTopRightRadius: '0.5rem',
                      borderBottomRightRadius: '0.5rem',
                      borderLeft: `4px solid ${surpriseColor}`,
                      backgroundColor: '#f9fafb'
                    }}>
                      <tr>
                        <td style={{ 
                          padding: '10px 12px',
                          verticalAlign: 'top',
                          borderTopRightRadius: '0.5rem',
                          borderBottomRightRadius: '0.5rem'
                        }}>
                          <div style={{ 
                            fontWeight: '600', 
                            color: '#111827', 
                            fontSize: '12px', 
                            lineHeight: '16px',
                            marginBottom: '4px'
                          }}>
                            {surpriseLabel}
                          </div>
                          <div style={{ 
                            fontSize: '11px', 
                            color: '#4b5563', 
                            lineHeight: '15px'
                          }}>
                            {ideologyData.surpriseIdeology1Text}
                          </div>
                        </td>
                      </tr>
                    </table>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer - Large branding */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white h-24 flex items-center justify-center px-8">
        <div className="flex items-center justify-between w-full max-w-4xl">
          <div className="flex items-center gap-4">
            <img src="/logo.svg" alt="Votely" className="h-12 w-auto" />
            <div>
              <div className="text-2xl font-bold">VOTELY</div>
              <div className="text-sm text-purple-200">Political Quiz</div>
            </div>
          </div>
          <div className="text-lg text-purple-200 font-medium">votelyquiz.juleslemee.com</div>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Share Your Results</h2>
              <p className="text-purple-100 text-sm">Download media or share a link</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Download Options */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Download High-Quality Media</h3>
            <div className="space-y-3">
              <button
                onClick={() => generateScreenshot('2d')}
                disabled={isGenerating}
                className="w-full bg-purple-600 text-white p-4 rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
              >
                {isGenerating && generatingType === '2d' ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                    Generating 2D Image...
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 w-full">
                      <span className="text-xl flex-shrink-0">📊</span>
                      <div className="text-left">
                        <div className="font-semibold">Download 2D Political Grid</div>
                        <div className="text-sm text-purple-100">Detailed 9×9 ideology chart with all labels</div>
                      </div>
                    </div>
                  </>
                )}
              </button>

              <button
                onClick={() => generateScreenshot('3d')}
                disabled={isGenerating}
                className="w-full bg-green-600 text-white p-4 rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
              >
                {isGenerating && generatingType === '3d' ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                    Generating 3D Image...
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 w-full">
                      <span className="text-xl flex-shrink-0">🎲</span>
                      <div className="text-left">
                        <div className="font-semibold">Download 3D Political Cube</div>
                        <div className="text-sm text-green-100">3D visualization with colored 3×3 cells</div>
                      </div>
                    </div>
                  </>
                )}
              </button>

              <button
                onClick={generateGif}
                disabled={isGenerating}
                className="w-full bg-orange-600 text-white p-4 rounded-xl hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
              >
                {isGenerating && generatingType === 'gif' ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                    <div className="text-left">
                      <div className="font-semibold">Generating Rotating GIF...</div>
                      <div className="text-sm text-orange-100">{Math.round(gifProgress)}% complete</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 w-full">
                      <span className="text-xl flex-shrink-0">🎬</span>
                      <div className="text-left">
                        <div className="font-semibold">Download Rotating 3D GIF</div>
                        <div className="text-sm text-orange-100">Animated rotating cube visualization</div>
                      </div>
                    </div>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Link Sharing */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Link</h3>
            <button
              onClick={handleCopyLink}
              className="w-full bg-gray-600 text-white p-4 rounded-xl hover:bg-gray-700 font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
            >
              <div className="flex items-center gap-3 w-full">
                <span className="text-xl flex-shrink-0">🔗</span>
                <div className="text-left">
                  <div className="font-semibold">Copy Share Link</div>
                  <div className="text-sm text-gray-100">Let others view your interactive results</div>
                </div>
              </div>
            </button>
          </div>

        </div>

        {/* Hidden layouts for screenshot generation */}
        {renderLayout('2d', share2DRef)}
        {renderLayout('3d', share3DRef)}
      </div>
    </div>
  );
}