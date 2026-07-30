// Redirección si no hay sesión iniciada (excepto en login.html)
const token = localStorage.getItem("jwt");
const isLoginPage = window.location.pathname.endsWith("login.html");

if (!token && !isLoginPage) {
  window.location.href = "login.html";
}

// Conexión a Notificaciones SSE en tiempo real
function initSseNotifications() {
  if (!window.EventSource || isLoginPage) return;

  try {
    const sseUrl = `${window.location.origin}/api/notificaciones/subscribe`;
    const eventSource = new EventSource(sseUrl);

    eventSource.addEventListener("desasignacion", (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("[SSE NOTIFICATION]", data);

        if (data && data.mensaje) {
          alert("Notificación: " + data.mensaje);
        }

        // Refrescar datos en pantalla automáticamente
        initPage();
      } catch (err) {
        console.error("Error al procesar notificación SSE", err);
      }
    });

    eventSource.onerror = (e) => {
      console.warn("Conexión a notificaciones SSE interrumpida.", e);
    };
  } catch (e) {
    console.error("No se pudo iniciar el servicio de notificaciones SSE.", e);
  }
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
  document.addEventListener("DOMContentLoaded", () => {
    initPage();
    initSseNotifications();
  });
}
