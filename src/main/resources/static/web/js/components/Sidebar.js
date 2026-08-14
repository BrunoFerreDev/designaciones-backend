import { state } from "../store.js";
import { logout } from "../services/authService.js";
import { connectNotifications } from "../notifications.js";

export class AppSidebar extends HTMLElement {
  constructor() {
    super();
    this.isOpen = false;
  }

  connectedCallback() {
    this.render();

    // Listen for custom events to update notification badge
    document.addEventListener("notifications-updated", () => this.updateNotifications());
    document.addEventListener("sidebar-toggle", (e) => {
      this.isOpen = e.detail.open;
      this.classList.toggle("open", this.isOpen);
      this.renderBackdrop();
    });
  }

  render() {
    const activeRoute = window.location.pathname.split("/").pop() || "arbitros.html";

    const navItems = [
      { id: "arbitros", path: "arbitros.html", icon: "ti-users", label: "Árbitros" },
      { id: "canchas", path: "canchas.html", icon: "ti-map-pin", label: "Canchas" },
      { id: "suspensiones", path: "suspensiones.html", icon: "ti-ban", label: "Suspensiones" },
      { id: "designaciones", path: "designaciones.html", icon: "ti-clipboard-list", label: "Designaciones" },
      { id: "notificaciones", path: "#", icon: "ti-bell", label: "Notificaciones" },
      { id: "buscar", path: "buscar.html", icon: "ti-search", label: "Buscador" },
      // { id: "estadisticas", path: "estadisticas.html", icon: "ti-chart-bar", label: "Estadísticas" },
      { id: "historico", path: "designaciones-viejas.html", icon: "ti-history", label: "Historial" },
    ];

    this.className = "sidebar";

    let navHTML = navItems.map(nav => {
      if (nav.id === "notificaciones") {
        const unreadCount = (state.notifications || []).filter(n => !n.read).length;
        const badgeHTML = unreadCount > 0
          ? `<span class="badge-notification">${unreadCount}</span>`
          : "";
        return `
          <button id="nav-notif-btn" class="nav-item">
            <i class="ti ${nav.icon}" aria-hidden="true"></i>
            <span>${nav.label}</span>
            ${badgeHTML}
          </button>
        `;
      }

      const isActive = activeRoute === nav.path ||
        (activeRoute === "" && nav.path === "arbitros.html") ||
        (activeRoute === "index.html" && nav.path === "arbitros.html");

      return `
        <a href="${nav.path}" class="nav-item ${isActive ? 'active' : ''}">
          <i class="ti ${nav.icon}" aria-hidden="true"></i>
          <span>${nav.label}</span>
        </a>
      `;
    }).join("");

    this.innerHTML = `
      <div class="sidebar-logo">
        <div class="logo-icon">⚽</div>
        <div>
          <div class="logo-text">ArbDesig</div>
          <div class="logo-sub font-medium">Fútbol · Árbitros</div>
        </div>
      </div>

      <div class="nav-items-container flex-1">
        ${navHTML}
      </div>

      <!-- Temporary Notification Alert Box -->
      <div id="sidebar-temp-notifs" class="sidebar-temp-notifications hidden"></div>

      <div class="mt-auto pt-4 border-t border-slate-200">
        <button id="logout-btn" class="nav-item text-red-600 hover:text-red-700 hover:bg-red-50">
          <i class="ti ti-logout" aria-hidden="true"></i>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    `;

    // Event listeners
    const notifBtn = this.querySelector("#nav-notif-btn");
    if (notifBtn) {
      notifBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.closeSidebar();
        try {
          connectNotifications();
        } catch (err) { }
        document.dispatchEvent(new CustomEvent("open-modal", { detail: { modalName: "showNotifications" } }));
      });
    }

    this.querySelector("#logout-btn").addEventListener("click", async () => {
      this.closeSidebar();
      try {
        await logout();
      } catch (err) { }
      localStorage.clear();
      sessionStorage.clear();
      window.location.replace("login.html");
    });
  }

  updateNotifications() {
    // Update badge count
    const unreadCount = (state.notifications || []).filter(n => !n.read).length;
    const notifBtn = this.querySelector("#nav-notif-btn");
    if (notifBtn) {
      const existingBadge = notifBtn.querySelector(".badge-notification");
      if (existingBadge) {
        existingBadge.remove();
      }
      if (unreadCount > 0) {
        const badgeSpan = document.createElement("span");
        badgeSpan.className = "badge-notification";
        badgeSpan.textContent = unreadCount;
        notifBtn.appendChild(badgeSpan);
      }
    }

    // Render temporary alerts if any
    const tempContainer = this.querySelector("#sidebar-temp-notifs");
    if (tempContainer && state.sidebarNotifications && state.sidebarNotifications.length > 0) {
      tempContainer.classList.remove("hidden");
      tempContainer.innerHTML = state.sidebarNotifications.map(notif => `
        <div class="sidebar-temp-notif-card notif-${notif.type}">
          <div class="sidebar-temp-notif-header">
            <i class="ti ${this.getNotifIcon(notif.type)}"></i>
            <span class="sidebar-temp-notif-title">Notificación</span>
          </div>
          <div class="sidebar-temp-notif-body">${notif.message}</div>
        </div>
      `).join("");
    } else if (tempContainer) {
      tempContainer.classList.add("hidden");
      tempContainer.innerHTML = "";
    }
  }

  getNotifIcon(type) {
    switch (type) {
      case "success": return "ti-circle-check";
      case "warning": return "ti-alert-triangle";
      case "error": return "ti-circle-x";
      case "info":
      default: return "ti-info-circle";
    }
  }

  closeSidebar() {
    this.isOpen = false;
    this.classList.remove("open");
    document.dispatchEvent(new CustomEvent("sidebar-toggle", { detail: { open: false } }));
  }

  renderBackdrop() {
    let backdrop = document.querySelector(".sidebar-backdrop");
    if (this.isOpen) {
      if (!backdrop) {
        backdrop = document.createElement("div");
        backdrop.className = "sidebar-backdrop";
        backdrop.addEventListener("click", () => this.closeSidebar());
        document.body.appendChild(backdrop);
      }
    } else {
      if (backdrop) {
        backdrop.remove();
      }
    }
  }
}

customElements.define("app-sidebar", AppSidebar);
