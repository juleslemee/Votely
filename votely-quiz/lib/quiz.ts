import { db, auth } from './firebase';
import { collection, addDoc, serverTimestamp, Timestamp, doc, updateDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { findVisionAlignment, alignments, toVisionScale } from '../app/quiz/results/types';

export type QuizResult = {
  answers: number[];
  result: {
    economicScore: number;
    socialScore: number;
    alignmentLabel: string;
    alignmentDescription: string;
  };
  timestamp: Timestamp;
  userId?: string | null;
};

export async function saveQuizResult(result: Omit<QuizResult, 'timestamp'>) {
  // Ensure we have an anonymous user
  if (!auth.currentUser) {
    await signInAnonymously(auth);
  }

  try {
    const docRef = await addDoc(
      collection(db, 'quizResponses'),
      {
        ...result,
        timestamp: serverTimestamp(),
        userId: auth.currentUser?.uid || null,
      }
    );
    return docRef.id;
  } catch (error) {
    console.error('Error saving quiz result:', error);
    throw error;
  }
}

export async function saveEmailToWaitlist(email: string) {
  try {
    const docRef = await addDoc(
      collection(db, 'waitlist'),
      {
        email,
        timestamp: serverTimestamp(),
        source: 'quiz_completion'
      }
    );
    return docRef.id;
  } catch (error) {
    console.error('Error saving email to waitlist:', error);
    throw error;
  }
}

// Analytics functions for the new features

// Simple test function to check Firebase connection
export async function testFirebaseConnection(): Promise<boolean> {
  try {
    console.log('Testing Firebase connection...');
    const snapshot = await getDocs(collection(db, 'quizResponses'));
    console.log('Firebase connection successful. Found', snapshot.size, 'documents');
    return true;
  } catch (error) {
    console.error('Firebase connection failed:', error);
    return false;
  }
}

export async function getAlignmentPercentage(alignmentLabel: string): Promise<number> {
  // Get all quiz responses
  const allResponsesSnapshot = await getDocs(collection(db, 'quizResponses'));
  const totalResponses = allResponsesSnapshot.size;
  
  if (totalResponses === 0) return 0;
  
  // Count responses with this alignment
  const alignmentResponsesSnapshot = await getDocs(
    query(collection(db, 'quizResponses'), where('result.alignmentLabel', '==', alignmentLabel))
  );
  const alignmentCount = alignmentResponsesSnapshot.size;
  
  return Math.round((alignmentCount / totalResponses) * 100);
}

export async function getTotalQuizCount(): Promise<number> {
  const snapshot = await getDocs(collection(db, 'quizResponses'));
  return snapshot.size;
}

export async function getPoliticalGroupMatches(userEconomic: number, userSocial: number): Promise<Array<{name: string, description: string, match: number}>> {
  // Convert user scores to vision scale
  const userX = toVisionScale(userEconomic);
  const userY = toVisionScale(userSocial);
  
  // Calculate distances to all alignments
  const alignmentDistances = alignments
    .filter(alignment => alignment.label !== findVisionAlignment(userX, userY).label) // Exclude user's own alignment
    .map(alignment => {
      // Calculate center point of alignment range
      const centerX = (alignment.xRange[0] + alignment.xRange[1]) / 2;
      const centerY = (alignment.yRange[0] + alignment.yRange[1]) / 2;
      
      // Calculate Euclidean distance
      const distance = Math.sqrt(Math.pow(userX - centerX, 2) + Math.pow(userY - centerY, 2));
      
      // Convert distance to match percentage (closer = higher match)
      // Max distance on compass is ~14.14, so we invert and scale
      const match = Math.max(0, Math.round((1 - distance / 14.14) * 100));
      
      return {
        name: alignment.label,
        description: alignment.description,
        match,
        distance
      };
    })
    .sort((a, b) => b.match - a.match) // Sort by highest match
    .slice(0, 3) // Take top 3
    .map(({ name, description, match }) => ({ name, description, match }));
  
  return alignmentDistances;
}

export async function getSurprisingAlignments(userEconomic: number, userSocial: number): Promise<Array<{group: string, commonGround: string}>> {
  const userX = toVisionScale(userEconomic);
  const userY = toVisionScale(userSocial);
  const userAlignment = findVisionAlignment(userX, userY);
  
  // Find alignments that are ideologically distant but share some common ground
  const surprisingAlignments = alignments
    .filter(alignment => {
      // Exclude user's alignment and very close ones
      const centerX = (alignment.xRange[0] + alignment.xRange[1]) / 2;
      const centerY = (alignment.yRange[0] + alignment.yRange[1]) / 2;
      const distance = Math.sqrt(Math.pow(userX - centerX, 2) + Math.pow(userY - centerY, 2));
      
      return alignment.label !== userAlignment.label && distance > 5; // Only distant alignments
    })
    .map(alignment => {
      // Generate context-aware common ground based on political positioning
      let commonGround = '';
      const centerX = (alignment.xRange[0] + alignment.xRange[1]) / 2;
      const centerY = (alignment.yRange[0] + alignment.yRange[1]) / 2;
      
      // Determine common ground based on quadrant relationships
      if (Math.abs(centerX - userX) < Math.abs(centerY - userY)) {
        // More similar economically than socially
        if (centerX < 0 && userX < 0) {
          commonGround = 'Share skepticism of unregulated markets and support for economic intervention';
        } else if (centerX > 0 && userX > 0) {
          commonGround = 'Both value market-based solutions and economic efficiency';
        } else {
          commonGround = 'Agree on the importance of evidence-based policy making';
        }
      } else {
        // More similar socially than economically
        if (centerY > 0 && userY > 0) {
          commonGround = 'Share belief in the importance of social order and institutional stability';
        } else if (centerY < 0 && userY < 0) {
          commonGround = 'Both prioritize individual autonomy and personal freedom';
        } else {
          commonGround = 'Surprisingly align on practical approaches to governance';
        }
      }
      
      return {
        group: alignment.label,
        commonGround,
        distance: Math.sqrt(Math.pow(userX - centerX, 2) + Math.pow(userY - centerY, 2))
      };
    })
    .sort((a, b) => b.distance - a.distance) // Sort by most surprising (distant)
    .slice(0, 3) // Take top 3 most surprising
    .map(({ group, commonGround }) => ({ group, commonGround }));
  
  return surprisingAlignments;
}

export async function getWaitlistCount(): Promise<number> {
  try {
    const snapshot = await getDocs(collection(db, 'waitlist'));
    return snapshot.size;
  } catch (error) {
    console.error('Error getting waitlist count:', error);
    return 0;
  }
} 