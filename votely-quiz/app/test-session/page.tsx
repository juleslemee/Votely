'use client';

import { useState } from 'react';
import { 
  generateSessionId, 
  saveQuizSession, 
  getCurrentSession,
  getSessionById,
  QuizSession,
  QuizQuestion 
} from '@/lib/quiz-session';

export default function TestSessionPage() {
  const [result, setResult] = useState<string>('');
  const [sessions, setSessions] = useState<any[]>([]);

  const checkStorage = () => {
    // Check sessionStorage
    const sessionData = typeof window !== 'undefined' ? sessionStorage.getItem('votely_quiz_session') : null;
    
    // Check localStorage  
    const allSessions = typeof window !== 'undefined' ? localStorage.getItem('votely_quiz_session_all') : null;
    
    let output = 'Storage Check:\n\n';
    
    if (sessionData) {
      try {
        const parsed = JSON.parse(sessionData);
        output += `SessionStorage: Found session ${parsed.sessionId}\n`;
      } catch (e) {
        output += `SessionStorage: Error parsing\n`;
      }
    } else {
      output += 'SessionStorage: Empty\n';
    }
    
    if (allSessions) {
      try {
        const parsed = JSON.parse(allSessions);
        const count = Object.keys(parsed).length;
        output += `\nLocalStorage: ${count} sessions found\n`;
        Object.keys(parsed).forEach(id => {
          output += `  - ${id}\n`;
        });
        setSessions(Object.entries(parsed));
      } catch (e) {
        output += `\nLocalStorage: Error parsing\n`;
      }
    } else {
      output += '\nLocalStorage: Empty\n';
    }
    
    setResult(output);
  };

  const createTestSession = () => {
    const sessionId = generateSessionId();
    
    // Your answer values from the legacy URL
    const answerValues = [
      0.54, 0.26, 0.65, 0.63, 1.00, 0.02, 0.68, 0.23, 0.97, 0.99,
      0.98, 0.66, 0.37, 0.51, 0.56, 0.51, 0.02, 0.76, 0.90, 0.76,
      0.63, 0.64, 0.53, 0.66, 0.50, 0.76, 0.75, 0.58, 0.74, 0.99,
      // Phase 2 answers
      0.65, 0.57, 0.72, 0.24, 0.63, 0.64, 0.65, 0.60, 0.73, 0.57,
      0.98, 0.50, 0.71, 0.63, 0.72, 0.73, 0.74, 0.72, 0.99, 0.60
    ];

    // Create Phase 1 questions (simplified)
    const phase1Questions: QuizQuestion[] = [];
    for (let i = 1; i <= 30; i++) {
      phase1Questions.push({
        id: i,
        originalId: `P${i.toString().padStart(2, '0')}`,
        text: `Question ${i}`,
        axis: i % 3 === 0 ? 'cultural' : i % 3 === 1 ? 'economic' : 'authority',
        agreeDir: i % 2 === 0 ? 1 : -1,
        phase: 1,
        qType: 'core'
      });
    }

    // Create Phase 2 questions with supplementary axes
    const phase2Questions: QuizQuestion[] = [];
    const supplementAxes = ['EMGM-A', 'EMGM-B', 'EMGM-C', 'EMGM-D'];
    for (let i = 0; i < 20; i++) {
      phase2Questions.push({
        id: 1001 + i,
        originalId: `${supplementAxes[Math.floor(i / 5)]}-${(i % 5) + 1}`,
        text: `Phase 2 Question ${i + 1}`,
        axis: 'cultural',
        agreeDir: i % 2 === 0 ? 1 : -1,
        phase: 2,
        qType: 'refine',
        supplementAxis: supplementAxes[Math.floor(i / 5)]
      });
    }

    // Combine all questions
    const allQuestions = [...phase1Questions, ...phase2Questions];

    // Create answers object
    const answers: Record<number, number> = {};
    allQuestions.forEach((q, index) => {
      answers[q.id] = answerValues[index];
    });

    // Create session
    const session: QuizSession = {
      sessionId: sessionId,
      type: 'long',
      questions: allQuestions,
      answers: answers,
      phase1Scores: {
        economic: 5.2,
        authority: 8.7,
        cultural: -2.1
      },
      macroCellCode: 'EM-GM',
      createdAt: Date.now()
    };

    // Save session
    saveQuizSession(session);
    
    const url = `/quiz/results?sessionId=${sessionId}&type=long`;
    
    setResult(`✅ Session Created!\n\nSession ID: ${sessionId}\nQuestions: ${allQuestions.length}\n\nURL: ${url}\n\nClick the link below to test.`);
    
    // Add link to DOM
    setTimeout(() => {
      const container = document.getElementById('test-link');
      if (container) {
        container.innerHTML = `<a href="${url}" target="_blank" class="text-primary hover:underline">Open Results Page →</a>`;
      }
    }, 100);
    
    // Refresh storage check
    setTimeout(checkStorage, 500);
  };

  const clearStorage = () => {
    if (confirm('Clear all session storage?')) {
      sessionStorage.clear();
      localStorage.removeItem('votely_quiz_session_all');
      setResult('Storage cleared!');
      setSessions([]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/25 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🧪 Test Session Manager</h1>
        
        <div className="space-x-4 mb-8">
          <button 
            onClick={checkStorage}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Check Storage
          </button>
          <button 
            onClick={createTestSession}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Create Test Session
          </button>
          <button 
            onClick={clearStorage}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Clear Storage
          </button>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg mb-8">
          <pre className="whitespace-pre-wrap font-mono text-sm">{result || 'Click a button to start...'}</pre>
          <div id="test-link" className="mt-4"></div>
        </div>

        {sessions.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Stored Sessions:</h2>
            {sessions.map(([id, session]) => (
              <div key={id} className="bg-white dark:bg-gray-900 p-4 rounded-lg border">
                <p className="font-mono text-sm mb-2">{id}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Type: {session.type} | Questions: {session.questions?.length || 0} | 
                  Answers: {Object.keys(session.answers || {}).length}
                </p>
                <a 
                  href={`/quiz/results?sessionId=${id}&type=${session.type}`}
                  target="_blank"
                  className="text-primary hover:underline text-sm"
                >
                  Open Results →
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}