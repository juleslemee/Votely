// Quiz session management - handles complex quiz state
// This solves the problem of maintaining quiz context across pages

export interface QuizQuestion {
  id: number;
  originalId: string;
  text: string;
  axis: 'economic' | 'authority' | 'cultural';
  agreeDir: -1 | 1;
  phase: 1 | 2;
  qType: 'core' | 'tiebreaker' | 'refine';
  boundary?: string;
  supplementAxis?: string;
}

export interface QuizSession {
  sessionId: string;
  type: 'short' | 'long';
  questions: QuizQuestion[];
  answers: Record<number, number>;
  phase1Scores?: {
    economic: number;
    authority: number;
    cultural: number;
  };
  macroCellCode?: string;
  tiebreakerBoundaries?: string[];
  createdAt: number;
  completedAt?: number;
}

// Store session in sessionStorage only (tab-specific, ephemeral)
const STORAGE_KEY = 'votely_quiz_session';

export function generateSessionId(): string {
  return `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function saveQuizSession(session: QuizSession): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Only store in sessionStorage for current tab/session
    // No localStorage persistence - each visit is a fresh start
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    
    // Also store in localStorage but ONLY for results page access
    // This allows sharing results but not resuming quizzes
    const allSessions = getAllSessions();
    allSessions[session.sessionId] = session;
    
    // Keep only recent completed sessions for results viewing
    cleanupOldSessions(allSessions);
    
    localStorage.setItem(STORAGE_KEY + '_all', JSON.stringify(allSessions));
  } catch (error) {
    console.error('Failed to save quiz session:', error);
  }
}

export function getCurrentSession(): QuizSession | null {
  if (typeof window === 'undefined') return null;
  
  try {
    // First check sessionStorage for current tab
    const sessionData = sessionStorage.getItem(STORAGE_KEY);
    if (sessionData) {
      return JSON.parse(sessionData);
    }
    
    // Fall back to most recent session in localStorage
    const allSessions = getAllSessions();
    const sessionIds = Object.keys(allSessions).sort((a, b) => 
      allSessions[b].createdAt - allSessions[a].createdAt
    );
    
    if (sessionIds.length > 0) {
      return allSessions[sessionIds[0]];
    }
  } catch (error) {
    console.error('Failed to load quiz session:', error);
  }
  
  return null;
}

export function getSessionById(sessionId: string): QuizSession | null {
  if (typeof window === 'undefined') return null;
  
  try {
    // First check sessionStorage for current session
    const currentSession = sessionStorage.getItem(STORAGE_KEY);
    if (currentSession) {
      const parsed = JSON.parse(currentSession);
      if (parsed.sessionId === sessionId) {
        console.log('Found session in sessionStorage');
        return parsed;
      }
    }
    
    // Then check localStorage
    const allSessions = getAllSessions();
    const session = allSessions[sessionId];
    if (session) {
      console.log('Found session in localStorage');
      return session;
    }
    
    console.log('Session not found:', sessionId);
    return null;
  } catch (error) {
    console.error('Failed to get session by ID:', error);
    return null;
  }
}

function getAllSessions(): Record<string, QuizSession> {
  try {
    const data = localStorage.getItem(STORAGE_KEY + '_all');
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function cleanupOldSessions(sessions: Record<string, QuizSession>): void {
  // Remove incomplete sessions only - keep ALL completed sessions for debugging
  Object.keys(sessions).forEach(id => {
    const session = sessions[id];
    const isIncomplete = !session.completedAt;
    
    if (isIncomplete) {
      delete sessions[id];
    }
  });
  
  // Keep up to 100 completed sessions (reasonable limit for localStorage)
  // This allows plenty of history for debugging while preventing storage bloat
  const sortedSessions = Object.entries(sessions)
    .filter(([_, s]) => s.completedAt)
    .sort((a, b) => b[1].completedAt! - a[1].completedAt!)
    .slice(0, 100);
  
  // Clear and rebuild with only kept sessions
  Object.keys(sessions).forEach(key => delete sessions[key]);
  sortedSessions.forEach(([id, session]) => {
    sessions[id] = session;
  });
}

// Update session with answers
export function updateSessionAnswers(answers: Record<number, number>): void {
  const session = getCurrentSession();
  if (!session) return;
  
  session.answers = { ...session.answers, ...answers };
  saveQuizSession(session);
}

// Update session with Phase 1 scores and macro cell
export function updateSessionPhase1Results(
  scores: { economic: number; authority: number; cultural: number },
  macroCellCode: string,
  tiebreakerBoundaries?: string[]
): void {
  const session = getCurrentSession();
  if (!session) return;
  
  session.phase1Scores = scores;
  session.macroCellCode = macroCellCode;
  session.tiebreakerBoundaries = tiebreakerBoundaries;
  saveQuizSession(session);
}

// Add Phase 2 questions to session
export function addPhase2Questions(questions: QuizQuestion[]): void {
  const session = getCurrentSession();
  if (!session) return;
  
  session.questions = [...session.questions, ...questions];
  saveQuizSession(session);
}

// Complete session
export function completeSession(): void {
  const session = getCurrentSession();
  if (!session) return;
  
  session.completedAt = Date.now();
  saveQuizSession(session);
}

// Generate shareable results URL with session ID
export function generateShareableUrl(sessionId: string): string {
  // For sharing, we'll create a compressed version
  const session = getSessionById(sessionId);
  if (!session) return '';
  
  // Create minimal data for URL
  const shareData = {
    s: sessionId, // session ID for lookup
    a: Object.values(session.answers).map(v => Math.round(v * 100)), // answers as integers 0-100
    t: session.type === 'long' ? 'l' : 's',
    m: session.macroCellCode || '',
    p: session.phase1Scores ? [
      Math.round(session.phase1Scores.economic),
      Math.round(session.phase1Scores.authority),
      Math.round(session.phase1Scores.cultural)
    ] : []
  };
  
  // Compress to base64
  const compressed = btoa(JSON.stringify(shareData));
  return `/quiz/results?share=${encodeURIComponent(compressed)}`;
}

// Parse shareable URL data
export function parseShareableUrl(shareParam: string): {
  sessionId: string;
  answers: number[];
  type: 'short' | 'long';
  macroCellCode?: string;
  phase1Scores?: { economic: number; authority: number; cultural: number };
} | null {
  try {
    const decoded = JSON.parse(atob(decodeURIComponent(shareParam)));
    return {
      sessionId: decoded.s,
      answers: decoded.a.map((v: number) => v / 100), // Convert back to 0-1 range
      type: decoded.t === 'l' ? 'long' : 'short',
      macroCellCode: decoded.m || undefined,
      phase1Scores: decoded.p?.length === 3 ? {
        economic: decoded.p[0],
        authority: decoded.p[1],
        cultural: decoded.p[2]
      } : undefined
    };
  } catch (error) {
    console.error('Failed to parse shareable URL:', error);
    return null;
  }
}

// Clear current session
export function clearCurrentSession(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(STORAGE_KEY);
}

// Export session for debugging
export function exportSession(): string {
  const session = getCurrentSession();
  return JSON.stringify(session, null, 2);
}