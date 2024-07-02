
import { getAuth, Auth, createUserWithEmailAndPassword, onAuthStateChanged, signOut, signInWithEmailAndPassword } from "firebase/auth"
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCSWHHsGSKw49wX5zcM0pgVL34jWSsrKwM",
  authDomain: "that-open-project.firebaseapp.com",
  projectId: "that-open-project",
  storageBucket: "that-open-project.appspot.com",
  messagingSenderId: "43179664826",
  appId: "1:43179664826:web:257be2804c290729796983",
  measurementId: "G-3SFJBEG7YL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app)

export {auth}