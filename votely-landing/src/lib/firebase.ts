import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

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

// Test environment variables (updated for production deployment)
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
let app;
let db;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  
  // Connect to emulator if in development
  if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
    connectFirestoreEmulator(db, 'localhost', 8080);
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
}

export { db };

// Helper function to add email to waitlist
export const addToWaitlist = async (email: string) => {
  if (!db) {
    console.error('Firebase not initialized');
    return { success: false, error: 'Firebase not initialized' };
  }
  
  try {
    const { collection, addDoc, serverTimestamp, query, where, getDocs } = await import('firebase/firestore');
    
    // Check if email already exists
    const waitlistRef = collection(db, 'waitlist');
    const q = query(waitlistRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return { success: false, error: 'Email already on waitlist' };
    }
    
    // Add new email
    await addDoc(waitlistRef, {
      email,
      source: 'landing_page',
      timestamp: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    return { success: false, error: error.message || 'Failed to add to waitlist' };
  }
};

// Helper function to get waitlist count
export const getWaitlistCount = async () => {
  if (!db) {
    console.error('Firebase not initialized');
    return 0;
  }
  
  try {
    const { collection, getCountFromServer } = await import('firebase/firestore');
    const waitlistRef = collection(db, 'waitlist');
    const snapshot = await getCountFromServer(waitlistRef);
    return snapshot.data().count;
  } catch (error) {
    console.error('Error getting waitlist count:', error);
    // Fallback to getting all documents if count aggregation fails
    try {
      const { collection, getDocs } = await import('firebase/firestore');
      const waitlistRef = collection(db, 'waitlist');
      const snapshot = await getDocs(waitlistRef);
      return snapshot.size;
    } catch (fallbackError) {
      console.error('Fallback count error:', fallbackError);
      return 0;
    }
  }
};

export { app }; 