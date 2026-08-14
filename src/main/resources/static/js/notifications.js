import { state, updateState } from "./store.js";
import { addToast } from "./helpers.js";

let activeController = null;
let reconnectTimeout = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 0;

const handleIncomingNotification = (dataStr) => {
  console.log("Notificación recibida raw:", dataStr);
  let parsed;
  try {
    parsed = JSON.parse(dataStr);
  } catch (e) {
    parsed = {
      mensaje: dataStr,
      tipo: "info",
    };
  }

  const message = parsed.mensaje || parsed.message || dataStr;

  const messageLower = String(message).toLowerCase();
  if (
    messageLower.includes("conexión establecida") ||
    messageLower.includes("conexion establecida") ||
    messageLower.includes("connection established") ||
    messageLower === "ok" ||
    messageLower === "connected"
  ) {
    console.log("Ignorando mensaje de control SSE (conexión establecida).");
    return;
  }

  const rawType = parsed.tipo || parsed.type || "info";

  let type = "info";
  const typeUpper = String(rawType).toUpperCase();
  if (
    typeUpper.includes("DESASIGNACION") ||
    typeUpper.includes("DESASIGNADO") ||
    typeUpper.includes("CANCELADO") ||
    typeUpper.includes("SUSPENSION")
  ) {
    type = "warning";
  } else if (
    typeUpper.includes("CREACION") ||
    typeUpper.includes("NUEVA") ||
    typeUpper.includes("ACEPTADA") ||
    typeUpper.includes("EXITO")
  ) {
    type = "success";
  } else if (typeUpper.includes("ERROR") || typeUpper.includes("FALLO")) {
    type = "error";
  }

  let timestamp = new Date().toISOString();
  if (parsed.timestamp) {
    const d = new Date(parsed.timestamp);
    if (!isNaN(d.getTime())) {
      timestamp = d.toISOString();
    }
  }

  const newNotification = {
    id: Date.now() + Math.random(),
    title: "Notificación",
    message: message,
    type: type,
    timestamp: timestamp,
    read: false,
  };

  const currentNotifications = [...(state.notifications || [])];
  currentNotifications.unshift(newNotification);

  const trimmedNotifs = currentNotifications.slice(0, 50);
  updateState("notifications", trimmedNotifs);
  localStorage.setItem("notifications", JSON.stringify(trimmedNotifs));

  // Add temporary notifications to sidebar alerts
  const sidebarNotifs = [...(state.sidebarNotifications || [])];
  sidebarNotifs.push(newNotification);
  updateState("sidebarNotifications", sidebarNotifs);

  // Dispatch notification update event so sidebar can re-render
  document.dispatchEvent(new CustomEvent("notifications-updated"));

  // Show toast notification
  addToast(message, type);

  // Automatically remove sidebar alert after 3 seconds
  setTimeout(() => {
    const freshSidebarNotifs = (state.sidebarNotifications || []).filter(
      (n) => n.id !== newNotification.id
    );
    updateState("sidebarNotifications", freshSidebarNotifs);
    document.dispatchEvent(new CustomEvent("notifications-updated"));
  }, 3000);
};

export const connectNotifications = () => {
  if (activeController) {
    console.log("La conexión de notificaciones ya está activa o en proceso.");
    return;
  }

  const token = localStorage.getItem("jwt_token");
  if (!token) {
    console.warn("No se encontró token JWT. Abortando suscripción de notificaciones.");
    return;
  }

  const baseURL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.protocol === "file:") && window.location.port !== "8081"
    ? "http://localhost:8081"
    : "";
  const url = `${baseURL}/api/notificaciones/subscribe`;

  activeController = new AbortController();
  const { signal } = activeController;

  console.log("Conectando a notificaciones por SSE:", url);

  fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "text/event-stream",
    },
    signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Reset reconnect attempts on successful connection
      reconnectAttempts = 0;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop(); // Save incomplete line

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data:")) {
            const dataStr = trimmed.slice(5).trim();
            if (dataStr) {
              handleIncomingNotification(dataStr);
            }
          }
        }
      }
    })
    .catch((error) => {
      if (error.name === "AbortError") {
        console.log("Conexión de notificaciones cancelada (AbortError).");
      } else {
        console.error("Error en conexión SSE de notificaciones:", error);
        cleanupConnection();

        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts++;
          const delay = 5000 * reconnectAttempts; // 5s, 10s, 15s
          console.log(`Reintentando conexión SSE en ${delay / 1000}s (Intento ${reconnectAttempts} de ${MAX_RECONNECT_ATTEMPTS})...`);
          reconnectTimeout = setTimeout(() => {
            if (localStorage.getItem("jwt_token")) {
              connectNotifications();
            }
          }, delay);
        } else {
          console.warn("Límite de reintentos SSE alcanzado. No se intentará reconectar más automáticamente.");
        }
      }
    });
};

const cleanupConnection = () => {
  if (activeController) {
    activeController.abort();
    activeController = null;
  }
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
};

export const disconnectNotifications = () => {
  cleanupConnection();
  console.log("Desconectado de notificaciones SSE.");
};

export const markAsRead = (id) => {
  const notifs = (state.notifications || []).map(n => n.id === id ? { ...n, read: true } : n);
  updateState("notifications", notifs);
  localStorage.setItem("notifications", JSON.stringify(notifs));
  document.dispatchEvent(new CustomEvent("notifications-updated"));
};

export const markAllAsRead = () => {
  const notifs = (state.notifications || []).map(n => ({ ...n, read: true }));
  updateState("notifications", notifs);
  localStorage.setItem("notifications", JSON.stringify(notifs));
  document.dispatchEvent(new CustomEvent("notifications-updated"));
};

export const deleteNotification = (id) => {
  const notifs = (state.notifications || []).filter((n) => n.id !== id);
  updateState("notifications", notifs);
  localStorage.setItem("notifications", JSON.stringify(notifs));
  document.dispatchEvent(new CustomEvent("notifications-updated"));
};

export const clearAllNotifications = () => {
  updateState("notifications", []);
  localStorage.setItem("notifications", "[]");
  document.dispatchEvent(new CustomEvent("notifications-updated"));
};
