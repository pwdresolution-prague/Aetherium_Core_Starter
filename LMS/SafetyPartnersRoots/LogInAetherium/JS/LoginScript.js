const openLogIn = document.getElementById("openLogIn")
const openSignup = document.getElementById("openSignUp")
const modal = document.getElementById("loginModal")
const closeModal = document.getElementById("closeModal")
const tabLogin = document.getElementById("tabLogin")
const tabSignup = document.getElementById("tabSignup")
const loginForm = document.getElementById("loginForm")
const signUpForm = document.getElementById("signupForm")

openSignup.addEventListener("click", () => {
  modal.style.display = "block"
  tabSignup.click()
})
openLogIn.addEventListener("click", () => {
  modal.style.display = "block"
  tabLogin.click()
})

closeModal.addEventListener("click", () => {
  modal.style.display = "none"
})

//TODO: Přepínání tabů
tabLogin.addEventListener("click", () => {
  tabLogin.classList.add("active")
  tabSignup.classList.remove("active")
  loginForm.classList.add("active")
  signUpForm.classList.remove("active")
})

tabSignup.addEventListener("click", () => {
  tabSignup.classList.add("active")
  tabLogin.classList.remove("active")
  signUpForm.classList.add("active")
  loginForm.classList.remove("active")

})




