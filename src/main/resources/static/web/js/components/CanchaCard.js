export class CanchaCard extends HTMLElement {
  static get observedAttributes() {
    return ["cancha-data"];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const dataStr = this.getAttribute("cancha-data");
    if (!dataStr) return;

    let cancha;
    try {
      cancha = JSON.parse(dataStr);
    } catch (e) {
      console.error("Invalid cancha-data", e);
      return;
    }

    const isInactive = !cancha.estado;
    const cardClass = isInactive 
      ? "card transition-all duration-200 hover:shadow-md hover:border-slate-350 opacity-65 bg-slate-50 border-dashed border-slate-300"
      : "card transition-all duration-200 hover:shadow-md hover:border-slate-300";

    const nameClass = isInactive ? "line-through text-slate-400" : "font-semibold text-slate-800";
    const statusBadge = isInactive 
      ? `<span class="text-[10px] bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded font-medium uppercase tracking-wider">Inactiva</span>`
      : "";

    this.className = "block card p-4 rounded-xl border border-slate-150 mb-3 shadow-sm";
    this.innerHTML = `
      <div class="${cardClass} p-3 rounded-lg border border-slate-100">
        <div class="card-header flex items-center justify-between">
          <div class="card-title flex items-center gap-2">
            <span class="text-lg">🏟️</span>
            <span class="${nameClass} text-sm font-bold">
              ${cancha.nombre || cancha.nombreCancha}
            </span>
            ${statusBadge}
          </div>
          <div class="flex gap-2">
            <button class="btn btn-edit-cancha" style="padding: 5px 9px" title="Editar cancha">
              <i class="ti ti-edit text-blue-600"></i>
            </button>
            <button class="btn btn-delete-cancha ${cancha.estado ? 'danger' : 'success'}" style="padding: 5px 9px" title="${cancha.estado ? 'Desactivar cancha' : 'Activar cancha'}">
              <i class="ti ${cancha.estado ? 'ti-trash text-red-600' : 'ti-circle-check text-emerald-600'}"></i>
            </button>
          </div>
        </div>

        <div class="flex items-center gap-3 mt-3 mb-2 flex-wrap">
          <span class="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
            Categoría: <strong>${cancha.categoria || "N/A"}</strong>
          </span>
          <span class="text-xs font-semibold px-2 py-1 rounded-md ${cancha.fueraDeJuego ? 'text-amber-800 bg-amber-50' : 'text-blue-800 bg-blue-50'}">
            Fuera de juego: ${cancha.fueraDeJuego ? "Sí" : "No"}
          </span>
          <span class="text-xs font-semibold px-2 py-1 rounded-md ${cancha.necesitaViaje ? 'text-purple-800 bg-purple-50' : 'text-slate-500 bg-slate-100'}">
            🚗 Viaje: ${cancha.necesitaViaje ? "Sí" : "No"}
          </span>
        </div>

        <div class="flex items-center justify-between text-xs bg-slate-50 rounded-lg p-2.5 mt-3 border border-slate-100">
          <span class="text-slate-600">
            Estado: 
            <span class="font-semibold ${cancha.estado ? 'text-emerald-600' : 'text-slate-400'}">
              ${cancha.estado ? "Activa" : "Inactiva"}
            </span>
          </span>
          ${cancha.ciudad ? `<span class="text-slate-500">📍 ${cancha.ciudad}</span>` : ""}
        </div>
      </div>
    `;

    // Listeners
    const editBtn = this.querySelector(".btn-edit-cancha");
    if (editBtn) {
      editBtn.addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("edit", { detail: { id: cancha.id } }));
      });
    }

    const deleteBtn = this.querySelector(".btn-delete-cancha");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("delete", { detail: { id: cancha.id } }));
      });
    }
  }
}

customElements.define("cancha-card", CanchaCard);
