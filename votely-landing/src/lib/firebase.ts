import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Test environment variables
console.log('Firebase Config:', {
  hasApiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
  hasAuthDomain: !!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  hasProjectId: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
  hasStorageBucket: !!import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  hasMessagingSenderId: !!import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  hasAppId: !!import.meta.env.VITE_FIREBASE_APP_ID,
  hasMeasurementId: !!import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Helper function to add email to waitlist
export const addToWaitlist = async (email: string) => {
  try {
    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    
    const waitlistRef = collection(db, 'waitlist');
    await addDoc(waitlistRef, {
      email,
      source: 'landing_page',
      timestamp: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    return { success: false, error };
  }
};

export { app }; 