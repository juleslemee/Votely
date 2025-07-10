import { db, auth } from './firebase';
import { collection, addDoc, serverTimestamp, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

export type QuizResult = {
  answers: number[];
  result: {
    economicScore: number;
    socialScore: number;
    alignmentLabel: string;
    alignmentDescription: string;
  };
  timestamp: Timestamp;
  email?: string | null;
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

export async function updateQuizResultEmail(docId: string, email: string) {
  try {
    const docRef = doc(db, 'quizResponses', docId);
    await updateDoc(docRef, { email });
  } catch (error) {
    console.error('Error updating quiz result email:', error);
    throw error;
  }
} 