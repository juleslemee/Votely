import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// Lazy initialization variables
let adminApp: any;
let _adminDb: Firestore | null = null;
let initializationError: Error | null = null;
let isInitialized = false;

// Initialize Firebase Admin SDK
const initializeFirebaseAdmin = () => {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set');
  }

  try {
    let serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    
    // Fix common issue with escaped newlines in private key
    if (serviceAccount.private_key && serviceAccount.private_key.includes('\\n')) {
      console.log('Fixing escaped newlines in private key');
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }
    
    // Log some debug info (without exposing sensitive data)
    console.log('Firebase Admin Init - Service Account Info:', {
      hasProjectId: !!serviceAccount.project_id,
      hasPrivateKey: !!serviceAccount.private_key,
      hasClientEmail: !!serviceAccount.client_email,
      projectId: serviceAccount.project_id,
      privateKeyFormat: serviceAccount.private_key ? 
        `${serviceAccount.private_key.substring(0, 50)}... (length: ${serviceAccount.private_key.length})` : 
        'missing'
    });
    
    return initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id,
      // Explicitly set the database URL to ensure proper connection
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
    });
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    console.error('Environment variable length:', process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.length);
    throw error;
  }
};

// Lazy initialization function
const ensureInitialized = () => {
  if (isInitialized) {
    return _adminDb;
  }

  if (initializationError) {
    throw initializationError;
  }

  try {
    console.log('Initializing Firebase Admin SDK...');
    adminApp = initializeFirebaseAdmin();
    _adminDb = getFirestore(adminApp);
    isInitialized = true;
    console.log('Firebase Admin SDK initialized successfully');
    return _adminDb;
  } catch (error: any) {
    console.error('Failed to initialize Firebase Admin:', error);
    initializationError = error;
    throw error;
  }
};

// Export a getter function for adminDb
export const getAdminDb = () => {
  return ensureInitialized();
};

// Helper function to get server timestamp
export const serverTimestamp = () => {
  return new Date().toISOString();
};

// For backward compatibility, export adminDb as a getter
export const adminDb = new Proxy({} as Firestore, {
  get(target, prop) {
    const db = ensureInitialized();
    if (!db) {
      throw new Error('Firebase Admin SDK not initialized');
    }
    return (db as any)[prop];
  },
  apply(target, thisArg, argArray) {
    const db = ensureInitialized();
    if (!db) {
      throw new Error('Firebase Admin SDK not initialized');
    }
    return (db as any).apply(thisArg, argArray);
  }
});