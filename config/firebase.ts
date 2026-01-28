// config/firebase.ts
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// TODO: Replace with your Firebase config from Firebase Console
// Get this from: Firebase Console → Project Settings → General → Your apps → SDK setup and configuration
const firebaseConfig = {
  apiKey: "AIzaSyB6eMD6HSRw-HmbdHWUSnuNrPYIepykaEg",
  authDomain: "hajj-group-tracker.firebaseapp.com",
  projectId: "hajj-group-tracker",
  storageBucket: "hajj-group-tracker.firebasestorage.app",
  messagingSenderId: "667027372517",
  appId: "1:667027372517:web:510b10c52f3d32818d170c",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app);

export default app;
