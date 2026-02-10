// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD8kKjry60C0oN-X3Bs3MFZADdS1Mo19ME",
  authDomain: "language-learning-app-3c330.firebaseapp.com",
  projectId: "language-learning-app-3c330",
  storageBucket: "language-learning-app-3c330.firebasestorage.app",
  messagingSenderId: "153392863933",
  appId: "1:153392863933:web:dff19dbb809e6ee24935d4"
};

const app = initializeApp(firebaseConfig);

// Firebase Auth
export const auth = getAuth(app);

// Providers
export const googleProvider = new GoogleAuthProvider();

export const db = getFirestore(app);