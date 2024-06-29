
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

export async function CreateUser(auth: Auth, email: string, password: string) {
    await createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log(userCredential.user)
    })
    .catch((error) => {
      if (error.message === "auth/email-already-in-use") {
        throw new Error("Email already in use")
      }
      console.log(error)
      console.log(error.code)
      console.log(error.message)
    })
  }

export async function signInUser(auth: Auth, email: string, password: string) {
  signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    console.log(userCredential)
  })
  .catch((error) => {
    if (error.code === "auth/invalid-credential") {
      alert("Incorrect email address")
    }
  })
  // try {
  // } catch(error) {
  //   console.log(error)
    
  // }
}

export async function signOutUser(auth: Auth) {
    signOut(auth)
}
