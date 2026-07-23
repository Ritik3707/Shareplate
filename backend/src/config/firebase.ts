import admin from 'firebase-admin';

/**
 * Firebase Admin Configuration
 * Handles push notifications and FCM
 */
let firebaseApp: admin.app.App | null = null;

const initializeFirebase = (): admin.app.App | null => {
  if (firebaseApp) return firebaseApp;

  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\n/g, '\n');
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

    if (!projectId || !privateKey || !clientEmail) {
      console.warn('Firebase credentials not configured. Push notifications disabled.');
      return null;
    }

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        privateKey,
        clientEmail,
      }),
    });

    console.log('Firebase Admin initialized successfully');
    return firebaseApp;
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return null;
  }
};

export const firebase = initializeFirebase();
export default firebase;
