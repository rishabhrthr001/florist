import admin from "firebase-admin";
import dotenv from "dotenv";
import { createRequire } from "module";

dotenv.config();

// Initialize Firebase Admin with credentials
// You can either use a service account file or environment variables
// For simplicity in this setup, we'll assume standard Google Cloud credentials 
// or environment variables are set up.
// A common pattern is to use a service account JSON file.

const require = createRequire(import.meta.url);
let serviceAccount;

try {
    // 1. Try loading from local file (User Request)
    serviceAccount = require("./serviceAccountKey.json");
    console.log("✅ Loaded Firebase credentials from serviceAccountKey.json");
} catch (error) {
    // 2. Fallback to Environment Variable
    try {
        if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
            serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
            console.log("✅ Loaded Firebase credentials from ENV");
        }
    } catch (envError) {
        console.warn("Could not parse FIREBASE_SERVICE_ACCOUNT_KEY");
    }
}

if (!admin.apps.length) {
    if (serviceAccount) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    } else {
        // Fallback to Application Default Credentials (ADC)
        console.log("⚠️ No specific credentials found, using Application Default Credentials");
        admin.initializeApp();
    }
}

export default admin;
