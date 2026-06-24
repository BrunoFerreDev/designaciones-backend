// Redirección si no hay sesión iniciada (excepto en login.html)
const token = localStorage.getItem("jwt");
const isLoginPage = window.location.pathname.endsWith("login.html");

if (!token && !isLoginPage) {
  window.location.href = "login.html";
}

// Inicialización común de página
async function initPage() {
  if (isLoginPage) return; // No inicializar en página de login
  try {
    await Promise.all([
      window.loadCanchas(),
      window.loadArbitros(),
      window.loadArbitrosNoDisponibles(),
      window.loadSuspensiones(),
      window.reloadAllDesignaciones()
    ]);
  } catch(e) {
    console.error("Error loading page data.", e);
  }
}

// Stub for retrocompatibility
window.renderView = async function() {};

if (!isLoginPage) {
  document.addEventListener("DOMContentLoaded", initPage);
}
