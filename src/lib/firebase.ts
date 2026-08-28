import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  Auth,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

export function isFirebaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );
}

export function getFirebaseAuth(): Auth | null {
  if (typeof window === "undefined") return null;
  if (!isFirebaseConfigured()) return null;

  if (!app) {
    const existingApps = getApps();
    app = existingApps.length > 0 ? existingApps[0] : initializeApp(firebaseConfig);
  }

  if (!auth && app) {
    auth = getAuth(app);
  }

  return auth;
}

let recaptchaVerifier: RecaptchaVerifier | null = null;

export function setupRecaptcha(containerId: string = "recaptcha-container"): RecaptchaVerifier | null {
  const authInstance = getFirebaseAuth();
  if (!authInstance || typeof window === "undefined") return null;

  try {
    if (!recaptchaVerifier) {
      recaptchaVerifier = new RecaptchaVerifier(authInstance, containerId, {
        size: "invisible",
        callback: () => {
          // reCAPTCHA solved
        },
        "expired-callback": () => {
          recaptchaVerifier?.clear();
          recaptchaVerifier = null;
        },
      });
    }
    return recaptchaVerifier;
  } catch (error) {
    console.warn("⚠️ Failed to initialize Firebase RecaptchaVerifier:", error);
    return null;
  }
}

export async function sendFirebasePhoneOtp(
  fullPhoneNumber: string,
  containerId: string = "recaptcha-container"
): Promise<ConfirmationResult | null> {
  const authInstance = getFirebaseAuth();
  if (!authInstance) return null;

  const verifier = setupRecaptcha(containerId);
  if (!verifier) return null;

  return signInWithPhoneNumber(authInstance, fullPhoneNumber, verifier);
}
