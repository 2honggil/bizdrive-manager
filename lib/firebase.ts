import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAaedrC8QUI2dFQculUcg9mjrb4kJ-RFyA",
    authDomain: "bizdrive-manager.firebaseapp.com",
    projectId: "bizdrive-manager",
    storageBucket: "bizdrive-manager.firebasestorage.app",
    messagingSenderId: "1081961166109",
    appId: "1:1081961166109:web:dca8089b0a14eb9acdddf4"
};

// Initialize Firebase (SSR safe)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
