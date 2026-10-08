import { login } from "../services/authService.js";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const whatsappInput = document.getElementById("whatsapp");
  const passwordInput = document.getElementById("password");
  const passwordToggle = document.getElementById("password-toggle");
  const submitBtn = document.getElementById("submit-btn");
  const btnSpinner = document.getElementById("btn-spinner");
  const btnText = document.getElementById("btn-text");
  
  const errorAlert = document.getElementById("error-alert");
  const errorText = document.getElementById("error-text");
  const infoAlert = document.getElementById("info-alert");
  const infoText = document.getElementById("info-text");

  // Display current year in branding footer
  const currentYearSpan = document.getElementById("current-year");
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }

  // Check for session timeout messages
  const sessionMsg = localStorage.getItem("session_timeout_message");
  if (sessionMsg) {
    infoText.textContent = sessionMsg;
    infoAlert.classList.remove("hidden");
    localStorage.removeItem("session_timeout_message");
  }

  // Toggle Password visibility
  let showPassword = false;
  passwordToggle.addEventListener("click", () => {
    showPassword = !showPassword;
    passwordInput.type = showPassword ? "text" : "password";
    passwordToggle.querySelector("span").textContent = showPassword ? "visibility_off" : "visibility";
  });

  // Handle Submit
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Reset messages
    errorAlert.classList.add("hidden");
    
    const whatsapp = whatsappInput.value.trim();
    const contrasenia = passwordInput.value;

    // Loading state
    submitBtn.disabled = true;
    btnSpinner.classList.remove("hidden");
    btnText.textContent = "Verificando...";

    try {
      const response = await login(whatsapp, contrasenia);
      if (response && response.jwt) {
        // Save auth data
        localStorage.setItem("jwt_token", response.jwt);
        localStorage.setItem("user", JSON.stringify({ username: response.username }));
        localStorage.setItem("session_start_time", Date.now().toString());

        // Redirect to arbitros list
        window.location.replace("arbitros.html");
      } else {
        showError(response.message || "Error en el inicio de sesión");
      }
    } catch (err) {
      console.error(err);
      let errMsg = "Ocurrió un error inesperado al conectar con el servidor";
      if (err.response && err.response.data && err.response.data.message) {
        errMsg = err.response.data.message;
      }
      showError(errMsg);
    } finally {
      // Clear loading state
      submitBtn.disabled = false;
      btnSpinner.classList.add("hidden");
      btnText.textContent = "Entrar al Sistema";
    }
  });

  function showError(msg) {
    errorText.textContent = msg;
    errorAlert.classList.remove("hidden");
    
    // Shake animation reset
    errorAlert.classList.remove("animate-shake");
    void errorAlert.offsetWidth; // Trigger reflow to restart animation
    errorAlert.classList.add("animate-shake");
  }
});
