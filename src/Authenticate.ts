import { getAuth, Auth, createUserWithEmailAndPassword, onAuthStateChanged, signOut, signInWithEmailAndPassword } from "firebase/auth"
import { CreateUser, signInUser, signOutUser, auth } from "./firebase/index"
import firebase from "firebase/app"

export default () => {
    // CreateUser(auth, "dolank16@gmail.com", "dolan123")
    const loginDialog = document.getElementById("login-dialog") as HTMLDialogElement
    // onAuthStateChanged(auth, )
    const loginBtn = document.getElementById("login-btn")
    loginBtn?.addEventListener("click", () => {
        loginDialog.showModal()
    })
    
    const loginForm = document.getElementById("login-form") as HTMLFormElement
    loginForm.addEventListener("submit", (e: Event) => {
        e.preventDefault()
        const formData = new FormData(loginForm)
        const email = formData.get("email") as string
        const password = formData.get("password") as string       
        signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            document.getElementById("project-landing")?.classList.toggle("page-hidden")
            document.getElementById("bim-container")?.classList.toggle("page-hidden")
            loginDialog.close()
          })
          .catch((error) => {
            if (error.code === "auth/invalid-credential") {
              alert("Incorrect email address")
            }
          })
    })
    
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const email = user.email
        } else {
            // signInWithEmailAndPassword(auth, email, password)
        }
    })

}