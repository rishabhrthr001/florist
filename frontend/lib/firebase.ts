import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let auth: Auth;
let googleProvider: GoogleAuthProvider;

try {
    // Only initialize if we haven't already (prevent HMR issues)
    // And check if config is valid (simple check for apiKey)
    if (!getApps().length && firebaseConfig.apiKey) {
        app = initializeApp(firebaseConfig);
    } else if (getApps().length) {
        app = getApp();
    } else {
        console.warn("⚠️ Firebase Config missing in .env.local. Google Auth will not work.");
        // Create a dummy object or just let the app be undefined and handle it?
        // initializeApp will throw if config is empty.
        // If we don't initialize, we can't export valid objects.
        // Throwing here crashes the main thread -> white screen.
        // We will catch this block.
    }

    if (getApps().length) {
        // Re-fetch app in case we fell into the else if
        const validApp = getApp();
        auth = getAuth(validApp);
        googleProvider = new GoogleAuthProvider();
    } else {
        throw new Error("Firebase not initialized");
    }

} catch (e) {
    console.error("Firebase Initialization Failed:", e);
    // Provide dummy objects to prevent import crashes in components
    // These will crash if methods are called, but at least the page renders.
    auth = {} as Auth;
    googleProvider = new GoogleAuthProvider();
}

export { auth, googleProvider };
