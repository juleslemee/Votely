"use client";

import React, { useState, useEffect } from 'react';
import { debugLog, setDebugLogCallback, setDebugMode } from '@/lib/debug-logger';

interface DebugPanelProps {
  isVisible: boolean;
  // Quiz state props
  questions: any[];
  answers: Record<number, number | null>;
  setAnswers: (answers: Record<number, number | null>) => void;
  quizType: string;
  liveScores: {economic: number, governance: number, social: number, supplementary?: Record<string, number>} | null;
  // Progress props
  numAnswered: number;
  totalExpectedQuestions: number;
  screen: number;
  totalScreens: number;
  // Validation props
  validationIssues?: string[];
}

export function DebugPanel({ 
  isVisible, 
  questions, 
  answers, 
  setAnswers, 
  quizType,
  liveScores,
  numAnswered,
  totalExpectedQuestions,
  screen,
  totalScreens,
  validationIssues = []
}: DebugPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedMacroCell, setSelectedMacroCell] = useState<string | null>(null);
  const [currentPhase, setCurrentPhase] = useState<1 | 2>(1);
  const [targetIdeology, setTargetIdeology] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('targeting');
  const [debugLogs, setDebugLogs] = useState<Array<{timestamp: string, level: string, message: string}>>([]);

  // Debug logging function
  const addDebugLog = (level: string, message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs(prev => [...prev, { timestamp, level, message }].slice(-100)); // Keep last 100 logs
  };

  // Setup debug logging when panel is visible
  useEffect(() => {
    if (!isVisible) return;

    // Activate debug mode and set up callback
    setDebugMode(true);
    setDebugLogCallback(addDebugLog);

    // Add initial log
    addDebugLog('info', '🛠️ Debug mode activated - Enhanced logging enabled');

    return () => {
      setDebugMode(false);
      setDebugLogCallback(() => {});
    };
  }, [isVisible]);

  // Determine current phase based on progress (Phase 1 = questions 1-44 including tiebreakers, Phase 2 = 45+)
  useEffect(() => {
    if (quizType === 'long') {
      setCurrentPhase(numAnswered > 44 ? 2 : 1);
    }
  }, [numAnswered, quizType]);

  const macroCells = [
    ['EL-GA', 'EM-GA', 'ER-GA'],
    ['EL-GM', 'EM-GM', 'ER-GM'],
    ['EL-GL', 'EM-GL', 'ER-GL']
  ];

  const macroCellColors = {
    'EL-GA': '#ff9ea0', 'EM-GA': '#ff9fff', 'ER-GA': '#9f9fff',
    'EL-GM': '#ffcfa1', 'EM-GM': '#e5e5e5', 'ER-GM': '#9ffffe',
    'EL-GL': '#9fff9e', 'EM-GL': '#d4fe9a', 'ER-GL': '#ffff9f'
  };

  const ideologies = {
    'EL-GA': [
      ['Bolshevik Marxism', 'Juche', 'Strasserism'],
      ['Maoism', 'National Bolshevism', 'Ba\'athism'],
      ['Trotskyism', 'Left-Wing Nationalism', 'Longism']
    ],
    'EM-GA': [
      ['Falangism', 'Autocratic Theocracy', 'Nazism'],
      ['State Socialism', 'Integralism', 'State Capitalism'],
      ['Distributism', 'State Liberalism', 'Civic Conservatism']
    ],
    'ER-GA': [
      ['Francoism', 'Fascism', 'Absolute Monarchy'],
      ['Constitutional Monarchy', 'Feudalism', 'Authoritarian Capitalism'],
      ['Right-Wing Nationalism', 'Paleo-Conservatism', 'National Capitalism']
    ],
    'EL-GM': [
      ['Posadism', 'Socialism', 'Democratic Socialism'],
      ['Orthodox Marxism', 'Market Socialism', 'Labour Liberalism'],
      ['Luxemburgism', 'Syndicalism', 'Social Democracy']
    ],
    'EM-GM': [
      ['Social Liberalism', 'Third-Way Labour', 'Neo-Conservatism'],
      ['Liberalism', 'Centrism', 'Neoliberalism'],
      ['Liberal Democracy', 'Welfare Capitalism', 'Liberal Capitalism']
    ],
    'ER-GM': [
      ['Conservatism', 'Elective Monarchy', 'Corporatism'],
      ['Liberal Conservatism', 'Traditional Conservatism', 'Capitalism'],
      ['Civil Libertarianism', 'Conservative Libertarianism', 'Libertarian Capitalism']
    ],
    'EL-GL': [
      ['Classical Marxism', 'Eco-Socialism', 'Progressivism'],
      ['Council Communism', 'Minarcho-Socialism', 'Libertarian Socialism'],
      ['Anarcho-Communism', 'Anarcho-Syndicalism', 'Anarchism']
    ],
    'EM-GL': [
      ['Nordic Liberalism', 'Social Libertarianism', 'Georgism'],
      ['Mutualism', 'Minarchism', 'Geo-Libertarianism'],
      ['Anarcho-Mutualism', 'Agorism', 'Geoanarchism']
    ],
    'ER-GL': [
      ['Classical Liberalism', 'Libertarianism', 'Paleo-Libertarianism'],
      ['National Libertarian', 'Voluntarism', 'Minarcho-Capitalism'],
      ['Objectivism', 'Anarcho-Feudalism', 'Anarcho-Capitalism']
    ]
  };

  // Calculate target scores for macro cells
  const calculateTargetScores = (macroCell: string) => {
    const [economic, governance] = macroCell.split('-');
    
    const economicTarget = economic === 'EL' ? -67 : economic === 'EM' ? 0 : 67;
    const authorityTarget = governance === 'GL' ? -67 : governance === 'GM' ? 0 : 67;
    
    return { economic: economicTarget, governance: authorityTarget };
  };

  // Calculate required answer values to achieve target scores  
  const calculateAnswerForTarget = (question: any, targetScore: number, currentContribution: number, questionsInAxis: number) => {
    const agreeDir = question.agreeDir || 1;
    
    // Convert normalized target score (-100 to 100) to raw total needed
    // normalizedScore = (rawTotal / (questionCount * 2)) * 100
    // rawTotal = (normalizedScore / 100) * (questionCount * 2)
    const rawTotalNeeded = (targetScore / 100) * (questionsInAxis * 2);
    
    // Raw contribution per question to achieve target
    const targetContribution = rawTotalNeeded / questionsInAxis;
    
    // Convert target contribution back to 0-1 answer scale
    // contribution = (answer - 0.5) * 4 * agreeDir
    // answer = (contribution / (4 * agreeDir)) + 0.5
    const targetAnswer = (targetContribution / (4 * agreeDir)) + 0.5;
    
    // Clamp to valid range
    return Math.max(0, Math.min(1, targetAnswer));
  };

  // Calculate answer values specifically for tiebreaker zones (more moderate answers)
  const calculateTiebreakerAnswer = (question: any, targetScore: number, questionsInAxis: number) => {
    const agreeDir = question.agreeDir || 1;
    const targetContribution = targetScore / questionsInAxis;
    
    // For tiebreaker zones, we want moderate answers that land in the -56 to -22 or 22 to 56 ranges
    // contribution = (answer - 0.5) * 4 * agreeDir
    // answer = (contribution / (4 * agreeDir)) + 0.5
    const targetAnswer = (targetContribution / (4 * agreeDir)) + 0.5;
    
    // Clamp to valid range but allow more moderate values
    return Math.max(0.1, Math.min(0.9, targetAnswer));
  };

  const handleMacroCellClick = (cell: string) => {
    setSelectedMacroCell(cell);
    const targets = calculateTargetScores(cell);
    
    debugLog(`🎯 Auto-filling Phase 1 questions for macro cell: ${cell}`);
    debugLog(`Target scores - Economic: ${targets.economic}, Governance: ${targets.governance}`);
    
    const newAnswers: Record<number, number> = {};
    // Filter out null values from answers
    Object.entries(answers).forEach(([key, value]) => {
      if (value !== null) {
        newAnswers[parseInt(key)] = value;
      }
    });
    
    // Get Phase 1 questions (all 36 for macro cell targeting - need extreme answers to avoid tiebreakers)
    const phase1Questions = questions.slice(0, 36);
    const economicQuestions = phase1Questions.filter(q => q.axis === 'economic');
    const governanceQuestions = phase1Questions.filter(q => q.axis === 'governance');
    const socialQuestions = phase1Questions.filter(q => q.axis === 'social');
    
    // Fill economic questions
    economicQuestions.forEach(q => {
      newAnswers[q.id] = calculateAnswerForTarget(q, targets.economic, 0, economicQuestions.length);
    });
    
    // Fill governance questions
    governanceQuestions.forEach(q => {
      newAnswers[q.id] = calculateAnswerForTarget(q, targets.governance, 0, governanceQuestions.length);
    });
    
    // Fill social questions with neutral values (to minimize cultural impact)
    socialQuestions.forEach(q => {
      newAnswers[q.id] = 0.5;
    });
    
    setAnswers(newAnswers);
  };

  const handleIdeologyClick = async (ideology: string) => {
    setTargetIdeology(ideology);
    setCurrentPhase(2);

    debugLog(`🎯 Auto-filling Phase 2 questions for ideology: ${ideology}`);

    if (!selectedMacroCell) {
      debugLog('⚠️ No macro cell selected');
      return;
    }

    try {
      // Load ideology vectors to get target scores
      const { loadIdeologyVectors } = await import('@/lib/ideology-vector-loader');
      const ideologyVectors = await loadIdeologyVectors();
      const macroIdeologies = ideologyVectors.get(selectedMacroCell);

      if (!macroIdeologies) {
        debugLog(`⚠️ No ideologies found for macro cell ${selectedMacroCell}`);
        return;
      }

      // Find the specific ideology's vector
      debugLog(`🔍 Looking for ideology "${ideology}" in macro cell ${selectedMacroCell}`);
      debugLog(`📋 Available ideologies: ${macroIdeologies.map(v => `"${v.ideology}"`).join(', ')}`);

      const targetVector = macroIdeologies.find(v => v.ideology.trim() === ideology.trim());
      if (!targetVector) {
        debugLog(`⚠️ Vector not found for ideology "${ideology}"`);
        debugLog(`🔍 Tried exact match with trimming`);
        return;
      }

      debugLog(`📊 Target vector for ${ideology}:`);
      targetVector.axes.forEach(axis => {
        debugLog(`  ${axis.code}: ${axis.score}`);
      });

      const newAnswers: Record<number, number> = {};
    // Filter out null values from answers
    Object.entries(answers).forEach(([key, value]) => {
      if (value !== null) {
        newAnswers[parseInt(key)] = value;
      }
    });

      // Get Phase 2 questions by filtering for phase property instead of slice
      const phase2Questions = questions.filter(q => q.phase === 2 || (q.axisCode || q.supplementAxis));

      debugLog(`📋 Found ${phase2Questions.length} Phase 2 questions: ${phase2Questions.map(q => `${q.id}(${q.axisCode || q.supplementAxis})`).join(', ')}`);

      // Group questions by their axis code
      const questionsByAxis = new Map<string, any[]>();
      phase2Questions.forEach(q => {
        // Phase 2 questions use 'supplementAxis' property
        const axisCode = q.axisCode || q.supplementAxis;
        if (axisCode) {
          if (!questionsByAxis.has(axisCode)) {
            questionsByAxis.set(axisCode, []);
          }
          questionsByAxis.get(axisCode)!.push(q);
        } else {
          debugLog(`❌ Question ${q.id} has no axis code: axisCode="${q.axisCode}", supplementAxis="${q.supplementAxis}"`);
        }
      });

      debugLog(`🗂️ Questions grouped by axis: ${Array.from(questionsByAxis.keys()).join(', ')}`);
      questionsByAxis.forEach((qs, axis) => {
        debugLog(`  ${axis}: ${qs.length} questions (IDs: ${qs.map(q => q.id).join(', ')})`);
      });

      // For each axis in the target vector, calculate required answers
      targetVector.axes.forEach(axis => {
        const axisQuestions = questionsByAxis.get(axis.code) || [];
        if (axisQuestions.length === 0) {
          debugLog(`⚠️ No questions found for axis ${axis.code}`);
          return;
        }

        debugLog(`📐 Calculating answers for ${axis.code} (target: ${axis.score}, ${axisQuestions.length} questions)`);

        // Target score is from -100 to +100
        // Each question contributes: (answer - 0.5) * 4 * agreeDir
        // Total raw score = sum of all contributions
        // Normalized score = (rawTotal / (questionCount * 2)) * 100

        // We need: (rawTotal / (questionCount * 2)) * 100 = targetScore
        // So: rawTotal = (targetScore / 100) * (questionCount * 2)
        const rawTotalNeeded = (axis.score / 100) * (axisQuestions.length * 2);

        // Distribute the raw score evenly across questions
        const rawPerQuestion = rawTotalNeeded / axisQuestions.length;

        axisQuestions.forEach(q => {
          // contribution = (answer - 0.5) * 4 * agreeDir
          // We want: contribution = rawPerQuestion
          // So: answer = (rawPerQuestion / (4 * agreeDir)) + 0.5
          const agreeDir = q.agreeDir || 1;
          const targetAnswer = (rawPerQuestion / (4 * agreeDir)) + 0.5;

          // Clamp to valid range [0, 1]
          const clampedAnswer = Math.max(0, Math.min(1, targetAnswer));
          newAnswers[q.id] = clampedAnswer;

          debugLog(`  Q${q.id} (agreeDir=${agreeDir}): answer=${clampedAnswer.toFixed(3)}`);
        });
      });

      setAnswers(newAnswers);
      debugLog(`✅ Set answers for ${phase2Questions.length} Phase 2 questions`);

    } catch (error) {
      debugLog(`❌ Error loading ideology vectors: ${error}`);
      console.error('Error in handleIdeologyClick:', error);
    }
  };

  const handleTiebreakerTest = (zone: string) => {
    debugLog(`🧪 Testing tiebreaker zone: ${zone}`);
    
    const newAnswers: Record<number, number> = {};
    // Filter out null values from answers
    Object.entries(answers).forEach(([key, value]) => {
      if (value !== null) {
        newAnswers[parseInt(key)] = value;
      }
    });
    const phase1Questions = questions.slice(0, 24); // Use first 24 questions only
    
    let targetEconomic = 0; // 0 means neutral/no change
    let targetAuthority = 0; // 0 means neutral/no change
    
    // Set target scores to land in specific tiebreaker zones (-39/+39 for middle of tiebreaker zones)
    switch (zone) {
      case 'LEFT_CENTER':
        targetEconomic = -39; // Middle of -56 to -22 range
        break;
      case 'CENTER_RIGHT': 
        targetEconomic = 39; // Middle of +22 to +56 range
        break;
      case 'LIB_CENTER':
        targetAuthority = -39; // Middle of -56 to -22 range  
        break;
      case 'CENTER_AUTH':
        targetAuthority = 39; // Middle of +22 to +56 range
        break;
    }
    
    const economicQuestions = phase1Questions.filter(q => q.axis === 'economic');
    const governanceQuestions = phase1Questions.filter(q => q.axis === 'governance');
    const socialQuestions = phase1Questions.filter(q => q.axis === 'social');
    
    // Fill economic questions - either with target value or neutral (only if currently neutral)
    economicQuestions.forEach(q => {
      if (targetEconomic !== 0) {
        // Targeting economic axis - always set the tiebreaker value
        if (targetEconomic < 0) {
          // Want -39: if agreeDir=1 use 0.305, if agreeDir=-1 use 0.695
          newAnswers[q.id] = q.agreeDir === 1 ? 0.305 : 0.695;
        } else if (targetEconomic > 0) {
          // Want +39: if agreeDir=1 use 0.695, if agreeDir=-1 use 0.305
          newAnswers[q.id] = q.agreeDir === 1 ? 0.695 : 0.305;
        }
      } else {
        // Not targeting economic axis - only set to neutral if no answer exists or currently neutral
        if (newAnswers[q.id] === undefined || newAnswers[q.id] === 0.5) {
          newAnswers[q.id] = 0.5; // neutral
        }
      }
    });
    
    // Fill governance questions - either with target value or neutral (only if currently neutral)
    governanceQuestions.forEach(q => {
      if (targetAuthority !== 0) {
        // Targeting governance axis - always set the tiebreaker value
        if (targetAuthority < 0) {
          // Want -39: if agreeDir=1 use 0.305, if agreeDir=-1 use 0.695
          newAnswers[q.id] = q.agreeDir === 1 ? 0.305 : 0.695;
        } else if (targetAuthority > 0) {
          // Want +39: if agreeDir=1 use 0.695, if agreeDir=-1 use 0.305
          newAnswers[q.id] = q.agreeDir === 1 ? 0.695 : 0.305;
        }
      } else {
        // Not targeting authority axis - only set to neutral if no answer exists or currently neutral
        if (newAnswers[q.id] === undefined || newAnswers[q.id] === 0.5) {
          newAnswers[q.id] = 0.5; // neutral
        }
      }
    });
    
    // Only set social questions to neutral if they don't already have answers
    socialQuestions.forEach(q => {
      if (newAnswers[q.id] === undefined) {
        newAnswers[q.id] = 0.5;
      }
    });
    
    setAnswers(newAnswers);
  };

  const calculateBoundaryDistance = () => {
    if (!liveScores) return {};
    
    return {
      leftCenter: Math.abs(liveScores.economic - (-39)),
      centerRight: Math.abs(liveScores.economic - 39),
      libCenter: Math.abs(liveScores.social - (-39)),
      centerAuth: Math.abs(liveScores.social - 39)
    };
  };

  if (!isVisible) return null;

  const progress = (numAnswered / totalExpectedQuestions) * 100;
  const boundaries = calculateBoundaryDistance();

  return (
    <div className="fixed top-4 right-4 z-50 w-96">
      <div className="bg-gray-500 text-white border border-gray-400 shadow-2xl rounded-lg">
        <div className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">🛠️</span>
              <span className="font-semibold">Debug Panel</span>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-white"
            >
              {isExpanded ? '▲' : '▼'}
            </button>
          </div>
          <div className="flex gap-2 mt-2">
            <span className={`px-2 py-1 text-xs rounded ${currentPhase === 1 ? 'bg-white text-gray-500' : 'bg-gray-600'}`}>
              Phase {currentPhase}
            </span>
            <span className={`px-2 py-1 text-xs rounded ${selectedMacroCell ? 'bg-white text-gray-500' : 'bg-gray-600 border border-gray-400'}`}>
              {selectedMacroCell || 'No Target'}
            </span>
          </div>
        </div>

        {isExpanded && (
          <div className="p-4 pt-0 space-y-4">
            <div className="flex bg-gray-600 rounded">
              {['targeting', 'scoring', 'progress', 'console'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 px-3 text-xs rounded capitalize ${
                    activeTab === tab ? 'bg-gray-400 text-white' : 'text-gray-300'
                  }`}
                >
                  {tab === 'targeting' && '🎯'} 
                  {tab === 'scoring' && '⚡'} 
                  {tab === 'progress' && '👁️'} 
                  {tab === 'console' && 'Console'}
                  {tab !== 'console' && ` ${tab}`}
                </button>
              ))}
            </div>

            {activeTab === 'targeting' && (
              <div className="space-y-4">
                {/* Macro Cell Grid */}
                <div>
                  <h4 className="mb-2 text-sm">Macro Cell Targeting</h4>
                  <div className="grid grid-cols-3 gap-1">
                    {macroCells.flat().map((cell) => {
                      const cellColor = macroCellColors[cell as keyof typeof macroCellColors];
                      const isSelected = selectedMacroCell === cell;
                      return (
                        <button
                          key={cell}
                          className={`h-8 text-xs border-2 rounded transition-all ${
                            isSelected 
                              ? 'border-white shadow-lg scale-105' 
                              : 'border-gray-300 hover:border-white'
                          }`}
                          style={{ 
                            backgroundColor: cellColor,
                            color: '#000'
                          }}
                          onClick={() => handleMacroCellClick(cell)}
                        >
                          {cell}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Ideology Grid */}
                {selectedMacroCell && (
                  <div>
                    <h4 className="mb-2 text-sm">Ideology Targeting ({selectedMacroCell})</h4>
                    <div className="grid grid-cols-3 gap-1">
                      {ideologies[selectedMacroCell as keyof typeof ideologies]?.flat().map((ideology) => {
                        const cellColor = macroCellColors[selectedMacroCell as keyof typeof macroCellColors];
                        const isSelected = targetIdeology === ideology;
                        return (
                          <button
                            key={ideology}
                            className={`h-12 text-xs p-1 border rounded transition-all ${
                              isSelected
                                ? 'border-white shadow-lg scale-105'
                                : 'border-gray-300 hover:border-white'
                            }`}
                            style={{
                              backgroundColor: cellColor,
                              color: '#000'
                            }}
                            onClick={() => handleIdeologyClick(ideology)}
                          >
                            <span className="leading-tight text-center block">{ideology}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-400 pt-4">
                  <h4 className="mb-2 text-sm">Tiebreaker Testing</h4>
                  <div className="grid grid-cols-2 gap-1">
                    {['LEFT_CENTER', 'CENTER_RIGHT', 'LIB_CENTER', 'CENTER_AUTH'].map((zone) => (
                      <button
                        key={zone}
                        className="h-8 text-xs border border-gray-300 rounded hover:border-white"
                        onClick={() => handleTiebreakerTest(zone)}
                      >
                        {zone}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'scoring' && (
              <div className="space-y-3">
                <div>
                  <h4 className="mb-2 text-sm">Current Position</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span>Economic:</span>
                      <span className={liveScores?.economic && liveScores.economic < 0 ? 'text-blue-400' : 'text-red-400'}>
                        {liveScores?.economic?.toFixed(1) || '0.0'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Authority:</span>
                      <span className={liveScores?.governance && liveScores.governance < 0 ? 'text-green-400' : 'text-purple-400'}>
                        {liveScores?.governance?.toFixed(1) || '0.0'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cultural:</span>
                      <span>{liveScores?.social?.toFixed(1) || '0.0'}</span>
                    </div>
                  </div>
                </div>

                {currentPhase === 2 && liveScores?.supplementary && (
                  <div>
                    <h4 className="mb-2 text-sm">Phase 2 Axes</h4>
                    <div className="space-y-2 text-xs">
                      {Object.entries(liveScores.supplementary).map(([axis, score]) => (
                        <div key={axis} className="flex justify-between">
                          <span>{axis}:</span>
                          <span>{score.toFixed(1)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="mb-2 text-sm">Boundary Status</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>To LEFT_CENTER:</span>
                      <span className="text-blue-400">{boundaries.leftCenter?.toFixed(0) || '∞'} pts</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>To CENTER_AUTH:</span>
                      <span className="text-purple-400">{boundaries.centerAuth?.toFixed(0) || '∞'} pts</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'progress' && (
              <div className="space-y-3">
                <div>
                  <h4 className="mb-2 text-sm">Quiz Progress</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Questions:</span>
                      <span>{numAnswered}/{totalExpectedQuestions}</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-white h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Screen:</span>
                      <span>{screen + 1}/{totalScreens}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 text-sm">Phase Status</h4>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 text-xs rounded ${numAnswered <= 44 ? 'bg-white text-gray-500' : 'bg-gray-600 border border-gray-400'}`}>
                      Phase 1 (1-44)
                    </span>
                    <span className={`px-2 py-1 text-xs rounded ${numAnswered > 44 ? 'bg-white text-gray-500' : 'bg-gray-600 border border-gray-400'}`}>
                      Phase 2 (45+)
                    </span>
                  </div>
                </div>

                {validationIssues.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm">Validation Issues</h4>
                    <div className="max-h-20 overflow-y-auto">
                      <div className="space-y-1">
                        {validationIssues.map((issue, index) => (
                          <div key={index} className="text-xs p-2 rounded bg-gray-600">
                            <span className="text-red-400">⚠️</span>
                            <span className="ml-2">{issue}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'console' && (
              <div className="space-y-3">
                <div>
                  <h4 className="mb-2 text-sm">Enhanced Logging</h4>
                  <div className="h-32 bg-gray-800 p-2 rounded text-xs font-mono overflow-y-auto">
                    <div className="space-y-1">
                      {debugLogs.length === 0 ? (
                        <div className="text-gray-400 italic">No debug logs yet. Try using macro cell targeting or tiebreaker testing.</div>
                      ) : (
                        debugLogs.map((log, index) => (
                          <div key={index} className={`${
                            log.level === 'error' ? 'text-red-400' :
                            log.level === 'warn' ? 'text-yellow-400' :
                            'text-green-400'
                          }`}>
                            <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 text-sm">Quick Actions</h4>
                  <div className="flex gap-2">
                    <button 
                      className="px-3 py-1 text-xs border border-gray-300 rounded hover:border-white"
                      onClick={() => setDebugLogs([])}
                    >
                      Clear Log
                    </button>
                    <button 
                      className="px-3 py-1 text-xs border border-gray-300 rounded hover:border-white"
                      onClick={() => {
                        const logText = debugLogs.map(log => `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}`).join('\n');
                        navigator.clipboard.writeText(logText);
                        addDebugLog('info', '📋 Debug logs copied to clipboard');
                      }}
                    >
                      Export
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}