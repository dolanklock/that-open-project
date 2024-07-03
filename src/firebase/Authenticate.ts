import { getAuth, Auth, createUserWithEmailAndPassword, onAuthStateChanged, signOut, signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "./index"

// TODO: create register form and setup function

export default () => {
    // CreateUser(auth, "dolank16@gmail.com", "dolan123")
    const loginDialog = document.getElementById("login-dialog") as HTMLDialogElement
    const login = document.querySelector(".login") as HTMLDivElement
    const register = document.querySelector(".register") as HTMLDivElement
    const loginBtn = document.getElementById("login-btn")
    const logoutBtn = document.getElementById("logout-btn") as HTMLButtonElement
    loginBtn?.addEventListener("click", () => {
        if (login.classList.contains("page-hidden")) login.classList.remove("page-hidden")
        if (!register.classList.contains("page-hidden")) register.classList.add("page-hidden")
        loginDialog.showModal()
    })
    logoutBtn.addEventListener("click", () => {
        signOut(auth)
    })
    document.getElementById("not-member")?.addEventListener("click", () => {
        login.classList.toggle("page-hidden")
        register.classList.toggle("page-hidden")
    })
    const loginForm = document.getElementById("login-form") as HTMLFormElement
    loginForm.addEventListener("submit", (e: Event) => {
        e.preventDefault()
        const formData = new FormData(loginForm)
        const email = formData.get("email") as string
        const password = formData.get("password") as string       
        signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            document.getElementById("project-landing")?.classList.add("page-hidden")
            document.getElementById("content-projects-page")?.classList.remove("page-hidden")
            loginDialog.close()
          })
          .catch((error) => {
            if (error.code === "auth/invalid-credential") {
              alert("Incorrect email address or password. Please try again.")
            }
          })
    })
    // in order to get working again uncomment code below and add page-hidden to bim-container html
    
    // signOut(auth)
    // onAuthStateChanged(auth, (user) => {
    //     if (user) {
    //         document.getElementById("project-landing")?.classList.add("page-hidden")
    //         document.getElementById("content-projects-page")?.classList.remove("page-hidden")
    //     } else {
    //         document.getElementById("project-landing")?.classList.remove("page-hidden")
    //         document.getElementById("content-projects-page")?.classList.add("page-hidden")
    //     }
    // })


}