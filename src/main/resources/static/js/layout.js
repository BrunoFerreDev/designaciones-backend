import { state, updateState } from "./store.js";
import { connectNotifications, disconnectNotifications } from "./notifications.js";
import { removeToast } from "./helpers.js";

// Make sure sidebar element is imported and registered
import "./components/Sidebar.js";

const isLoginPage = window.location.pathname.endsWith("login.html");

// Authentication Guard
if (!isLoginPage && !state.isAuthenticated) {
  window.location.replace("login.html");
} else if (isLoginPage && state.isAuthenticated) {
  window.location.replace("arbitros.html");
}

document.addEventListener("DOMContentLoaded", () => {
  if (isLoginPage) {
    document.body.classList.remove("hidden");
    return;
  }

  // Setup main layout structure dynamically
  const originalBodyHTML = document.body.innerHTML;
  document.body.innerHTML = "";
  
  // Wrap main content
  const appContainer = document.createElement("div");
  appContainer.className = "app flex flex-row min-h-screen w-full relative";

  // Hamburger button for mobile
  const hamburgerBtn = document.createElement("button");
  hamburgerBtn.className = "hamburger-btn";
  hamburgerBtn.setAttribute("aria-label", "Toggle Menu");
  hamburgerBtn.innerHTML = `<i class="ti ti-menu-2"></i>`;
  
  let sidebarOpen = false;
  hamburgerBtn.addEventListener("click", () => {
    sidebarOpen = !sidebarOpen;
    document.dispatchEvent(new CustomEvent("sidebar-toggle", { detail: { open: sidebarOpen } }));
  });

  // Listen to sidebar changes to keep local state synced
  document.addEventListener("sidebar-toggle", (e) => {
    sidebarOpen = e.detail.open;
  });

  // App Sidebar custom element
  const appSidebar = document.createElement("app-sidebar");

  // Main content wrapper
  const mainWrapper = document.createElement("div");
  mainWrapper.className = "main flex-1 flex flex-col min-w-0";
  mainWrapper.innerHTML = originalBodyHTML;

  // Toasts container
  const toastsContainer = document.createElement("div");
  toastsContainer.className = "toasts-container";

  // Loader components
  const topProgressBar = document.createElement("div");
  topProgressBar.className = "top-progress-bar hidden";
  
  const globalLoader = document.createElement("div");
  globalLoader.className = "global-loader hidden";
  globalLoader.innerHTML = `
    <div class="global-loader-content">
      <div class="global-loader-spinner">⚽</div>
      <div class="global-loader-text">Cargando datos...</div>
    </div>
  `;

  // Assemble App
  appContainer.appendChild(hamburgerBtn);
  appContainer.appendChild(appSidebar);
  appContainer.appendChild(mainWrapper);
  
  document.body.appendChild(appContainer);
  document.body.appendChild(toastsContainer);
  document.body.appendChild(topProgressBar);
  document.body.appendChild(globalLoader);

  // Global Loaders Event Listeners
  document.addEventListener("global-loader-show", () => {
    globalLoader.classList.remove("hidden");
  });
  document.addEventListener("global-loader-hide", () => {
    globalLoader.classList.add("hidden");
  });
  document.addEventListener("topbar-loader-show", () => {
    topProgressBar.classList.remove("hidden");
  });
  document.addEventListener("topbar-loader-hide", () => {
    topProgressBar.classList.add("hidden");
  });

  // Toasts Event Listeners
  document.addEventListener("toast-message", (e) => {
    const { id, message, type } = e.detail;
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.id = `toast-${id}`;
    
    let iconClass = "ti ti-circle-check";
    if (type === "error") iconClass = "ti ti-alert-triangle";
    else if (type === "warning") iconClass = "ti ti-alert-circle";
    else if (type === "info") iconClass = "ti ti-info-circle";

    toast.innerHTML = `
      <i class="${iconClass} toast-icon"></i>
      <span class="toast-message">${message}</span>
      <i class="ti ti-x toast-close"></i>
    `;

    toast.addEventListener("click", () => {
      removeToast(id);
    });

    toastsContainer.appendChild(toast);
  });

  document.addEventListener("toast-removed", (e) => {
    const { id } = e.detail;
    const toastElement = document.getElementById(`toast-${id}`);
    if (toastElement) {
      toastElement.remove();
    }
  });

  // Show page body now that layout is constructed
  document.body.classList.remove("hidden");

  // Notifications Connection will be activated only when user clicks in sidebar.

  // Session expiry verification (1.5 hours)
  if (!localStorage.getItem("session_start_time")) {
    localStorage.setItem("session_start_time", Date.now().toString());
  }

  const sessionInterval = setInterval(() => {
    if (localStorage.getItem("jwt_token")) {
      const startTimeStr = localStorage.getItem("session_start_time");
      if (startTimeStr) {
        const startTime = parseInt(startTimeStr, 10);
        const elapsed = Date.now() - startTime;
        const timeoutLimit = 1.5 * 60 * 60 * 1000; // 1.5 hours in ms

        if (elapsed >= timeoutLimit) {
          localStorage.setItem(
            "session_timeout_message",
            "Tu sesión ha expirado automáticamente después de 1.5 horas por seguridad."
          );
          localStorage.clear();
          sessionStorage.clear();
          disconnectNotifications();
          window.location.replace("login.html");
        }
      }
    }
  }, 10000);

  window.addEventListener("beforeunload", () => {
    clearInterval(sessionInterval);
    disconnectNotifications();
  });
});
