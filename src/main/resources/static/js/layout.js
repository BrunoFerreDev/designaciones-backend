import { state, updateState } from "./store.js";
import { connectNotifications, disconnectNotifications, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications } from "./notifications.js";
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
  document.addEventListener("global-loader-show", (e) => {
    const textEl = globalLoader.querySelector(".global-loader-text");
    if (textEl) {
      textEl.textContent = (e && e.detail && e.detail.message) ? e.detail.message : "Cargando datos...";
    }
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

  // Notifications Modal
  const notifModalOverlay = document.createElement("div");
  notifModalOverlay.id = "notifications-modal";
  notifModalOverlay.className = "modal-overlay hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4";
  notifModalOverlay.innerHTML = `
    <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">
      <!-- Modal Header -->
      <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg shadow-sm border border-emerald-100">
            <i class="ti ti-bell"></i>
          </div>
          <div>
            <h3 class="font-bold text-slate-800 text-base leading-tight">Centro de Notificaciones</h3>
            <p class="text-xs text-slate-400 font-medium">Historial de alertas y avisos del sistema</p>
          </div>
        </div>
        <button id="notif-modal-close" class="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-xl transition cursor-pointer">
          <i class="ti ti-x text-lg"></i>
        </button>
      </div>

      <!-- Quick Action Toolbar -->
      <div class="px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
        <span id="notif-count-label" class="text-slate-500 font-medium">0 notificaciones</span>
        <div class="flex items-center gap-2">
          <button id="btn-notif-mark-all" class="text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 px-2.5 py-1 rounded-lg font-semibold transition flex items-center gap-1 cursor-pointer">
            <i class="ti ti-check-double"></i>
            <span>Marcar leídas</span>
          </button>
          <span class="text-slate-300">|</span>
          <button id="btn-notif-clear-all" class="text-slate-600 hover:text-red-700 hover:bg-red-50 px-2.5 py-1 rounded-lg font-semibold transition flex items-center gap-1 cursor-pointer">
            <i class="ti ti-trash"></i>
            <span>Limpiar todo</span>
          </button>
        </div>
      </div>

      <!-- Notifications List Container -->
      <div id="notif-modal-list" class="p-4 overflow-y-auto flex-1 space-y-2.5 min-h-[200px] max-h-[50vh]">
        <!-- Dynamic list -->
      </div>

      <!-- Modal Footer -->
      <div class="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
        <button id="notif-modal-btn-close" class="btn px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-xl text-xs transition cursor-pointer">
          Cerrar
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(notifModalOverlay);

  function formatNotifTime(isoString) {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return "";
      const now = new Date();
      const diffMs = now - date;
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 1) return "Recién";
      if (diffMin < 60) return `Hace ${diffMin} min`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `Hace ${diffHours} h`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `Hace ${diffDays} d`;
      return `${date.getDate()}/${date.getMonth() + 1} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    } catch (e) {
      return "";
    }
  }

  function renderNotificationList() {
    const listEl = notifModalOverlay.querySelector("#notif-modal-list");
    const countLabel = notifModalOverlay.querySelector("#notif-count-label");
    const btnMarkAll = notifModalOverlay.querySelector("#btn-notif-mark-all");
    const btnClearAll = notifModalOverlay.querySelector("#btn-notif-clear-all");

    const notifs = state.notifications || [];
    const unreadCount = notifs.filter(n => !n.read).length;

    countLabel.textContent = `${notifs.length} notificación${notifs.length === 1 ? '' : 'es'} (${unreadCount} sin leer)`;
    
    btnMarkAll.disabled = unreadCount === 0;
    btnMarkAll.classList.toggle("opacity-50", unreadCount === 0);
    btnMarkAll.classList.toggle("cursor-not-allowed", unreadCount === 0);

    btnClearAll.disabled = notifs.length === 0;
    btnClearAll.classList.toggle("opacity-50", notifs.length === 0);
    btnClearAll.classList.toggle("cursor-not-allowed", notifs.length === 0);

    if (notifs.length === 0) {
      listEl.innerHTML = `
        <div class="py-12 flex flex-col items-center justify-center text-center">
          <div class="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center text-2xl mb-2">
            <i class="ti ti-bell-off"></i>
          </div>
          <p class="font-bold text-slate-700 text-sm">Sin notificaciones</p>
          <p class="text-xs text-slate-400 mt-0.5">No hay avisos ni alertas registradas en este momento.</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = notifs.map(notif => {
      let icon = "ti-info-circle";
      let iconColor = "text-blue-600 bg-blue-50 border-blue-100";
      if (notif.type === "warning") {
        icon = "ti-alert-triangle";
        iconColor = "text-amber-600 bg-amber-50 border-amber-100";
      } else if (notif.type === "success") {
        icon = "ti-circle-check";
        iconColor = "text-emerald-600 bg-emerald-50 border-emerald-100";
      } else if (notif.type === "error") {
        icon = "ti-circle-x";
        iconColor = "text-red-600 bg-red-50 border-red-100";
      }

      const isUnread = !notif.read;
      const cardBg = isUnread ? "bg-emerald-50/40 border-emerald-200" : "bg-slate-50/70 border-slate-200";
      const timeStr = formatNotifTime(notif.timestamp);

      return `
        <div class="p-3 rounded-xl border ${cardBg} flex items-start gap-3 transition hover:shadow-sm">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center text-sm border flex-shrink-0 mt-0.5 ${iconColor}">
            <i class="ti ${icon}"></i>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-1.5 min-w-0">
                ${isUnread ? '<span class="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></span>' : ''}
                <span class="font-bold text-slate-800 text-xs truncate">${notif.title || 'Aviso'}</span>
              </div>
              <span class="text-[10px] text-slate-400 flex-shrink-0">${timeStr}</span>
            </div>
            <p class="text-xs text-slate-600 mt-1 leading-relaxed break-words">${notif.message}</p>
            <div class="flex items-center justify-end gap-2 mt-2 pt-1 border-t border-slate-100/60">
              ${isUnread ? `
                <button class="btn-notif-mark-single text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold px-2 py-0.5 rounded hover:bg-emerald-50 transition flex items-center gap-1 cursor-pointer" data-id="${notif.id}">
                  <i class="ti ti-check"></i>
                  <span>Marcar leída</span>
                </button>
              ` : ''}
              <button class="btn-notif-delete-single text-[11px] text-slate-400 hover:text-red-600 px-1.5 py-0.5 rounded hover:bg-red-50 transition flex items-center gap-1 cursor-pointer" data-id="${notif.id}" title="Eliminar">
                <i class="ti ti-trash"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join("");

    // Attach item action handlers
    listEl.querySelectorAll(".btn-notif-mark-single").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = parseFloat(btn.getAttribute("data-id"));
        markAsRead(id);
      });
    });

    listEl.querySelectorAll(".btn-notif-delete-single").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = parseFloat(btn.getAttribute("data-id"));
        deleteNotification(id);
      });
    });
  }

  function openNotificationsModal() {
    renderNotificationList();
    notifModalOverlay.classList.remove("hidden");
  }

  function closeNotificationsModal() {
    notifModalOverlay.classList.add("hidden");
  }

  // Open modal event listener
  document.addEventListener("open-modal", (e) => {
    if (e.detail && e.detail.modalName === "showNotifications") {
      openNotificationsModal();
    }
  });

  // Notifications updated listener to re-render modal if open
  document.addEventListener("notifications-updated", () => {
    if (!notifModalOverlay.classList.contains("hidden")) {
      renderNotificationList();
    }
  });

  // Modal header/footer close buttons and backdrop click
  notifModalOverlay.querySelector("#notif-modal-close").addEventListener("click", closeNotificationsModal);
  notifModalOverlay.querySelector("#notif-modal-btn-close").addEventListener("click", closeNotificationsModal);
  notifModalOverlay.addEventListener("click", (e) => {
    if (e.target === notifModalOverlay) {
      closeNotificationsModal();
    }
  });

  // Mark all & Clear all actions
  notifModalOverlay.querySelector("#btn-notif-mark-all").addEventListener("click", () => {
    markAllAsRead();
  });
  notifModalOverlay.querySelector("#btn-notif-clear-all").addEventListener("click", () => {
    clearAllNotifications();
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
