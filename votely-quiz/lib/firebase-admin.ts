import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

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

// Initialize app
let adminApp;
let adminDb;

try {
  adminApp = initializeFirebaseAdmin();
  adminDb = getFirestore(adminApp);
} catch (error) {
  console.error('Failed to initialize Firebase Admin on module load:', error);
  // Create a lazy initialization wrapper
  adminDb = new Proxy({}, {
    get(target, prop) {
      throw new Error('Firebase Admin SDK not initialized. Check FIREBASE_SERVICE_ACCOUNT_KEY environment variable.');
    }
  });
}

// Export Firestore instance
export { adminDb };

// Helper function to get server timestamp
export const serverTimestamp = () => {
  return new Date().toISOString();
};