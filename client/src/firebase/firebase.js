// client/src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAF0CuzhYLWxa1Gw58QupQ4mYewM04zsDg",
  authDomain: "task-manager-a1316.firebaseapp.com",
  projectId: "task-manager-a1316",
  storageBucket: "task-manager-a1316.appspot.com",
  messagingSenderId: "264185181802",
  appId: "1:264185181802:web:7271bafe3e0dff43e77c13",
  measurementId: "G-ZK7ZZQVQ8Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// ✅ Add and export auth
export const auth = getAuth(app);
