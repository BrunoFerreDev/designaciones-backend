export class ArbitroCard extends HTMLElement {
  static get observedAttributes() {
    return ["arbitro-data"];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const dataStr = this.getAttribute("arbitro-data");
    if (!dataStr) return;

    let arbitro;
    try {
      arbitro = JSON.parse(dataStr);
    } catch (e) {
      console.error("Invalid arbitro-data", e);
      return;
    }

    const n = arbitro.nombre ? arbitro.nombre[0] : "";
    const a = arbitro.apellido ? arbitro.apellido[0] : "";
    const initials = (n + a).toUpperCase().slice(0, 2);

    const mapLabel = {
      ELITE: "Elite",
      AVANZADO: "Avanzado",
      INTERMEDIO: "Intermedio",
      EN_FORMACION: "En Formación",
      INCIAL: "Inicial",
    };
    const categoryLabel = mapLabel[arbitro.categoria] || arbitro.categoria || "Inicial";

    const mapClass = {
      ELITE: "badge-green",
      AVANZADO: "badge-blue",
      INTERMEDIO: "badge-amber",
      EN_FORMACION: "badge-gray",
      INCIAL: "badge-red",
    };
    const categoryClass = mapClass[arbitro.categoria] || "badge-gray";

    const isAvailable = arbitro.disponibleSabado || arbitro.disponibleDomingo;
    const nameClass = !isAvailable ? "text-slate-500 line-through" : "text-slate-800";

    let availabilityBadge = "";
    if (arbitro.disponibleSabado && arbitro.disponibleDomingo) {
      availabilityBadge = `<span class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Sábado y Domingo</span>`;
    } else if (arbitro.disponibleSabado) {
      availabilityBadge = `<span class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">Sábado</span>`;
    } else if (arbitro.disponibleDomingo) {
      availabilityBadge = `<span class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">Domingo</span>`;
    } else {
      availabilityBadge = `<span class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">Ninguno</span>`;
    }

    let whatsappLinkHTML = "";
    if (arbitro.whatsapp) {
      const clean = arbitro.whatsapp.replace(/[^0-9+]/g, "");
      const color = arbitro.estado ? "#16a34a" : "#64748b";
      whatsappLinkHTML = `
        <a href="https://wa.me/${clean}" target="_blank" class="inline-flex items-center gap-1 font-semibold no-underline transition-colors" style="color: ${color};" title="Enviar WhatsApp">
          <i class="ti ti-brand-whatsapp text-xs"></i>
          <span>${arbitro.whatsapp}</span>
        </a>
      `;
    } else {
      whatsappLinkHTML = `<span class="text-slate-400 inline-flex items-center gap-1">📱 Sin número</span>`;
    }

    const talleCamiseta = arbitro.talleCamiseta || "M";
    const talleShort = arbitro.talleShort || "M";

    this.className = "block card p-4 mb-3 transition-shadow hover:shadow-md";
    this.innerHTML = `
      <div class="arb-list-item-main flex items-start gap-4">
        <!-- Avatar con Iniciales -->
        <div class="arb-avatar flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white" 
             style="background: ${arbitro.estado ? 'linear-gradient(135deg, #1d9e75, #125c44)' : 'linear-gradient(135deg, #888888, #555555)'};">
          ${initials}
        </div>

        <!-- Información del Árbitro -->
        <div class="arb-info flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="arb-name font-semibold text-sm ${nameClass}">
              ${arbitro.nombre} ${arbitro.apellido}
            </span>
            <span class="badge ${categoryClass}">${categoryLabel}</span>
          </div>

          <div class="text-xs text-slate-500 mt-1">
            Partidos: <strong class="${arbitro.estado ? 'text-slate-800' : 'text-slate-500'}">${arbitro.designaciones || 0}</strong> designaciones
          </div>

          <!-- Disponibilidad por Día -->
          <div class="flex items-center gap-1 mt-1 text-[11px]">
            <span class="text-slate-400">📅 Disponible:</span>
            ${availabilityBadge}
          </div>

          <!-- WhatsApp e Indumentaria -->
          <div class="flex items-center gap-3.5 mt-2 flex-wrap text-[11px]">
            ${whatsappLinkHTML}
            <span class="text-slate-500 inline-flex items-center gap-1">
              👕 ${talleCamiseta} · 🩳 ${talleShort}
            </span>
          </div>
        </div>
      </div>

      <!-- Acciones -->
      <div class="arb-list-actions mt-3 flex items-center justify-end gap-2 flex-wrap">
        ${arbitro.estadoSistema ? `
          <button class="btn btn-edit-arb" style="padding: 6px 10px; font-size: 12px; color: #185fa5; border-color: #bcd1e6; background: #f6fafd;" title="Editar árbitro">
            <i class="ti ti-edit"></i>
            <span>Editar</span>
          </button>

          <button class="btn btn-sab-arb" style="padding: 6px 10px; font-size: 12px; borderColor: ${arbitro.disponibleSabado ? '#bcd1e6' : '#e2e8f0'}; background: ${arbitro.disponibleSabado ? '#f0f7ff' : '#f8fafc'}; color: ${arbitro.disponibleSabado ? '#185fa5' : '#64748b'}; cursor: pointer;" title="Disponibilidad Sábado">
            <i class="${arbitro.disponibleSabado ? 'ti ti-circle-check text-emerald-600' : 'ti ti-circle-dashed text-slate-400'}"></i>
            <span>Sáb</span>
          </button>

          <button class="btn btn-dom-arb" style="padding: 6px 10px; font-size: 12px; borderColor: ${arbitro.disponibleDomingo ? '#e9d5ff' : '#e2e8f0'}; background: ${arbitro.disponibleDomingo ? '#faf5ff' : '#f8fafc'}; color: ${arbitro.disponibleDomingo ? '#7e22ce' : '#64748b'};" title="Disponibilidad Domingo">
            <i class="${arbitro.disponibleDomingo ? 'ti ti-circle-check text-emerald-600' : 'ti ti-circle-dashed text-slate-400'}"></i>
            <span>Dom</span>
          </button>

          <button class="btn danger btn-delete-arb" style="padding: 6px 10px" title="Eliminar árbitro">
            <i class="ti ti-trash"></i>
          </button>
        ` : `
          <button class="btn btn-enable-system" style="padding: 6px 10px; font-size: 12px; color: #0f6e56; border-color: #bbf7d0; background: #f0fdf4;" title="Rehabilitar en sistema">
            <i class="ti ti-circle-check"></i>
            <span>Habilitar</span>
          </button>
        `}
      </div>
    `;

    // Listeners for triggers
    const editBtn = this.querySelector(".btn-edit-arb");
    if (editBtn) {
      editBtn.addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("edit", { detail: { id: arbitro.idArbitro } }));
      });
    }

    const sabBtn = this.querySelector(".btn-sab-arb");
    if (sabBtn) {
      sabBtn.addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("toggle-day", { detail: { id: arbitro.idArbitro, day: "disponibleSabado" } }));
      });
    }

    const domBtn = this.querySelector(".btn-dom-arb");
    if (domBtn) {
      domBtn.addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("toggle-day", { detail: { id: arbitro.idArbitro, day: "disponibleDomingo" } }));
      });
    }

    const deleteBtn = this.querySelector(".btn-delete-arb");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("delete", { detail: { id: arbitro.idArbitro } }));
      });
    }

    const enableBtn = this.querySelector(".btn-enable-system");
    if (enableBtn) {
      enableBtn.addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("toggle-system", { detail: { id: arbitro.idArbitro } }));
      });
    }
  }
}

customElements.define("arbitro-card", ArbitroCard);
