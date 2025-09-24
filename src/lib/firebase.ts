// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyANy4MnKd9304s7cHX5e6Vc2l96vnssLMY",
  authDomain: "brasil-3m-91243.firebaseapp.com",
  projectId: "brasil-3m-91243",
  storageBucket: "brasil-3m-91243.firebasestorage.app",
  messagingSenderId: "945185087634",
  appId: "1:945185087634:web:32996170fc8b147cfb464b",
  measurementId: "G-2S4G3N50GD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Exporte os serviços que for usar
export default app;
export { analytics, auth, db };