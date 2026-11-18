import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
  getFirestore, collection, doc, getDoc, setDoc, updateDoc, onSnapshot, runTransaction
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDha4Us14UmKTIAzMtqLT35NFRRo5RO_po",
  authDomain: "nfl-france.firebaseapp.com",
  projectId: "nfl-france",
  storageBucket: "nfl-france.firebasestorage.app",
  messagingSenderId: "333125862638",
  appId: "1:333125862638:web:e3cef8f0b21c9e518cdfff"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

window.firebaseApp = app;
window.firebaseAuth = auth;
window.firebaseDB = db;
window.firebaseFirestore = { collection, doc, getDoc, setDoc, updateDoc, onSnapshot, runTransaction };

window.firebaseReady = signInAnonymously(auth).then(result => {
  console.log("NFL France connecté à Firebase :", result.user.uid);
  return result.user;
}).catch(error => {
  console.error("Erreur Firebase :", error);
  throw error;
});
