import designacionService from "../../services/designacionService.js";
import arbitroService from "../../services/arbitroService.js";
import designadoService from "../../services/designadoService.js";
import { formatFecha, getDayOfWeekLocal, getDayOfWeekName, addToast, minArbitros } from "../../helpers.js";

let modalEl = null;
let currentDesignationId = null;
let currentDesignationData = null;
let manageAssignedList = [];
let allArbitrosCache = [];
let onUpdateCallback = null;

export function initManageRefereesModal(onUpdate) {
  onUpdateCallback = onUpdate;
  if (document.getElementById("manage-referees-modal")) {
    modalEl = document.getElementById("manage-referees-modal");
    bindEvents();
    return;
  }

  const div = document.createElement("div");
  div.id = "manage-referees-modal";
  div.className = "modal-overlay hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4";
  div.innerHTML = `
    <div class="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[92vh]">
      <div class="px-6 py-4 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
        <div>
          <h3 class="font-bold text-slate-800 text-base">Asignar y Gestionar Árbitros</h3>
          <div class="text-xs text-slate-500 mt-0.5">
            🏟️ <strong id="manage-cancha-name" class="text-slate-700">Cancha</strong> · 📅 <span id="manage-fecha-val">Fecha</span>
          </div>
        </div>
        <button type="button" class="modal-close-btn p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 cursor-pointer">
          <i class="ti ti-x text-lg"></i>
        </button>
      </div>

      <div class="p-6 overflow-y-auto flex flex-col gap-5 flex-1">
        <input type="hidden" id="manage-designacion-id" />

        <div id="manage-status-alert" class="p-3.5 rounded-2xl flex items-center justify-between text-xs border bg-amber-50/70 border-amber-200 text-amber-900">
          <div class="flex items-center gap-2.5">
            <i id="manage-status-icon" class="ti ti-alert-circle text-lg"></i>
            <div>
              <span id="manage-status-title" class="font-bold">Designación Incompleta</span>
              <div class="text-[11px] opacity-80 mt-0.5">
                Mínimo requerido: <strong id="manage-status-required">1</strong> árbitros · Asignados: <strong id="manage-status-assigned">0</strong>
              </div>
            </div>
          </div>
        </div>

        <div id="manage-feedback" class="hidden p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <i class="ti ti-info-circle text-base"></i>
          <span id="manage-feedback-text">Mensaje</span>
        </div>

        <div class="flex flex-col gap-2.5">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <i class="ti ti-users text-slate-400"></i>
              <span>Árbitros Asignados Actualmente</span>
            </span>
            <span id="count-assigned" class="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">0</span>
          </div>

          <div id="assigned-loader" class="text-center py-6 text-xs text-slate-400 hidden">
            <i class="ti ti-loader spin-icon text-xl text-emerald-600 block mb-1.5 mx-auto"></i>
            <span>Cargando árbitros asignados...</span>
          </div>

          <div id="assigned-empty" class="bg-slate-50 border border-dashed border-slate-200 rounded-2xl py-6 text-center text-slate-400 text-xs hidden">
            No hay árbitros asignados todavía. Utiliza el buscador inferior para agregar árbitros.
          </div>

          <div id="assigned-list" class="flex flex-col gap-2"></div>
        </div>

        <div class="border-t border-slate-100 pt-4 flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <i class="ti ti-user-plus text-emerald-600"></i>
              <span>Asignar Nuevo Árbitro</span>
            </span>
            <label class="flex items-center gap-1.5 text-xs text-slate-600 font-semibold cursor-pointer">
              <input type="checkbox" id="manage-filter-by-day" class="w-3.5 h-3.5 accent-emerald-600 rounded" checked />
              <span>Filtrar disponibles <span id="manage-day-label" class="text-emerald-700 font-bold">(Día)</span></span>
            </label>
          </div>

          <div class="flex gap-2">
            <select id="manage-available-select" class="flex-1 h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs outline-none focus:border-emerald-500 focus:bg-white">
              <option value="" disabled selected>Seleccione un árbitro disponible...</option>
            </select>
            <button type="button" id="btn-assign-referee" class="btn primary px-4 text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50" disabled>
              <i class="ti ti-plus"></i>
              <span>Asignar</span>
            </button>
          </div>

          <div id="manage-force-box" class="hidden p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs animate-slide-up">
            <div class="flex items-start gap-2.5 text-amber-900 min-w-0">
              <i class="ti ti-alert-triangle text-base text-amber-600 flex-shrink-0 mt-0.5"></i>
              <div>
                <span class="font-bold text-amber-950 block">Incompatibilidad de Categoría/Etapa</span>
                <span id="manage-force-msg" class="text-[11px] text-amber-900/90 leading-tight block mt-0.5">El árbitro no cumple la categoría para esta etapa. ¿Deseas forzar su designación?</span>
              </div>
            </div>
            <button type="button" id="btn-force-assign-referee" class="flex-shrink-0 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-[11px] shadow-sm flex items-center gap-1.5 transition cursor-pointer">
              <i class="ti ti-bolt"></i>
              <span>Designar igualmente</span>
            </button>
          </div>
        </div>
      </div>

      <div class="px-6 py-4 bg-slate-50 border-t border-slate-150 flex items-center justify-between">
        <button type="button" id="btn-manage-to-fees" class="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer">
          <i class="ti ti-cash"></i>
          <span>Configurar Aranceles de Cancha</span>
        </button>
        <button type="button" class="modal-close-btn px-5 py-2 bg-slate-800 text-white rounded-xl font-semibold text-xs shadow-md hover:bg-slate-700 transition cursor-pointer">
          Cerrar
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(div);
  modalEl = div;
  bindEvents();
}

function bindEvents() {
  if (!modalEl) return;
  modalEl.querySelectorAll(".modal-close-btn").forEach((btn) => {
    btn.addEventListener("click", closeManageRefereesModal);
  });
  modalEl.addEventListener("click", (e) => {
    if (e.target === modalEl) closeManageRefereesModal();
  });

  const filterCheckbox = modalEl.querySelector("#manage-filter-by-day");
  if (filterCheckbox) {
    filterCheckbox.addEventListener("change", renderAvailableReferees);
  }

  const select = modalEl.querySelector("#manage-available-select");
  const btnAssign = modalEl.querySelector("#btn-assign-referee");
  const btnForce = modalEl.querySelector("#btn-force-assign-referee");

  if (select && btnAssign) {
    select.addEventListener("change", () => {
      btnAssign.disabled = !select.value;
      hideForceBox();
    });
    btnAssign.addEventListener("click", assignReferee);
  }

  if (btnForce) {
    btnForce.addEventListener("click", forceAssignReferee);
  }

  const btnFees = modalEl.querySelector("#btn-manage-to-fees");
  if (btnFees) {
    btnFees.addEventListener("click", () => {
      if (currentDesignationId) {
        closeManageRefereesModal();
        document.dispatchEvent(new CustomEvent("open-fees-modal", { detail: { id: currentDesignationId } }));
      }
    });
  }
}

export async function openManageRefereesModal(id, onUpdate) {
  if (onUpdate) onUpdateCallback = onUpdate;
  if (!modalEl) initManageRefereesModal(onUpdateCallback);

  currentDesignationId = id;
  const manageDesignacionId = modalEl.querySelector("#manage-designacion-id");
  if (manageDesignacionId) manageDesignacionId.value = id;

  const assignedLoader = modalEl.querySelector("#assigned-loader");
  const assignedList = modalEl.querySelector("#assigned-list");
  const assignedEmpty = modalEl.querySelector("#assigned-empty");

  if (assignedLoader) assignedLoader.classList.remove("hidden");
  if (assignedList) assignedList.innerHTML = "";
  if (assignedEmpty) assignedEmpty.classList.add("hidden");
  modalEl.classList.remove("hidden");

  try {
    const [desigRes, allArbRes] = await Promise.all([
      designacionService.getById(id),
      allArbitrosCache.length ? Promise.resolve(allArbitrosCache) : arbitroService.getAll(),
    ]);

    allArbitrosCache = Array.isArray(allArbRes) ? allArbRes : (allArbRes.data || []);
    currentDesignationData = desigRes.data || desigRes;

    const fechaVal = currentDesignationData.fecha || currentDesignationData.fechaYHora;
    modalEl.querySelector("#manage-cancha-name").textContent = currentDesignationData.cancha ? (currentDesignationData.cancha.nombreCancha || currentDesignationData.cancha.nombre) : "Cancha";
    modalEl.querySelector("#manage-fecha-val").textContent = formatFecha(fechaVal);

    const dayName = getDayOfWeekName(fechaVal);
    modalEl.querySelector("#manage-day-label").textContent = `(${dayName || "Día"})`;

    await reloadAssignedReferees();
  } catch (err) {
    console.error(err);
    addToast("Error al cargar la información de designación.", "error");
  } finally {
    if (assignedLoader) assignedLoader.classList.add("hidden");
  }
}

async function reloadAssignedReferees() {
  const assignedLoader = modalEl.querySelector("#assigned-loader");
  const assignedEmpty = modalEl.querySelector("#assigned-empty");

  try {
    const res = await designadoService.getByDesignacion(currentDesignationId);
    manageAssignedList = Array.isArray(res) ? res : (res.data || []);

    modalEl.querySelector("#count-assigned").textContent = manageAssignedList.length;

    renderAssignedReferees();
    updateStatusAlert();
    renderAvailableReferees();
  } catch (err) {
    console.error(err);
  } finally {
    if (assignedLoader) assignedLoader.classList.add("hidden");
  }
}

function updateStatusAlert() {
  const isFueraDeJuego = currentDesignationData && currentDesignationData.cancha && currentDesignationData.cancha.fueraDeJuego;
  const minRequired = minArbitros(isFueraDeJuego);
  const count = manageAssignedList.length;

  const alertEl = modalEl.querySelector("#manage-status-alert");
  const titleEl = modalEl.querySelector("#manage-status-title");
  const iconEl = modalEl.querySelector("#manage-status-icon");

  modalEl.querySelector("#manage-status-required").textContent = minRequired;
  modalEl.querySelector("#manage-status-assigned").textContent = count;

  if (count >= minRequired) {
    alertEl.className = "p-3.5 rounded-2xl flex items-center justify-between text-xs border bg-emerald-50/70 border-emerald-200 text-emerald-900";
    titleEl.textContent = "Designación Completa";
    iconEl.className = "ti ti-circle-check text-lg text-emerald-600";
  } else {
    alertEl.className = "p-3.5 rounded-2xl flex items-center justify-between text-xs border bg-amber-50/70 border-amber-200 text-amber-900";
    titleEl.textContent = "Designación Incompleta";
    iconEl.className = "ti ti-alert-circle text-lg text-amber-600";
  }
}

function renderAssignedReferees() {
  const assignedList = modalEl.querySelector("#assigned-list");
  const assignedEmpty = modalEl.querySelector("#assigned-empty");

  if (!manageAssignedList.length) {
    assignedList.innerHTML = "";
    assignedEmpty.classList.remove("hidden");
    return;
  }

  assignedEmpty.classList.add("hidden");
  assignedList.innerHTML = manageAssignedList.map((item) => {
    const a = item.arbitro || {};
    const n = a.nombre ? a.nombre[0] : "";
    const ap = a.apellido ? a.apellido[0] : "";
    const initials = (n + ap).toUpperCase();
    const monto = item.monto ? `$${item.monto.toLocaleString("es-AR")}` : "Sin honorario";

    return `
      <div class="p-3 bg-slate-50 border border-slate-150 rounded-2xl flex items-center justify-between gap-3 hover:border-slate-300 transition">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
            ${initials}
          </div>
          <div class="min-w-0">
            <div class="text-xs font-bold text-slate-800 truncate">${a.nombre || ""} ${a.apellido || ""}</div>
            <div class="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
              <span>Arancel: <strong class="text-emerald-700 font-semibold">${monto}</strong></span>
              <span class="text-slate-300">·</span>
              <span class="badge ${a.categoria === 'ELITE' ? 'badge-green' : 'badge-gray'} text-[9px] px-1.5 py-0.2">${a.categoria || "Árbitro"}</span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-1.5">
          <button type="button" class="btn-remove-assigned text-xs text-rose-600 hover:text-rose-800 p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer" data-id="${item.idDesignado}" title="Quitar">
            <i class="ti ti-trash text-base"></i>
          </button>
        </div>
      </div>
    `;
  }).join("");

  assignedList.querySelectorAll(".btn-remove-assigned").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const idDesignado = parseInt(btn.dataset.id);
      if (!confirm("¿Quitar este árbitro de la designación?")) return;
      try {
        await designadoService.eliminarDesignado(currentDesignationId, idDesignado);
        addToast("Árbitro quitado de la designación.");
        await reloadAssignedReferees();
        if (onUpdateCallback) onUpdateCallback(currentDesignationId);
      } catch (err) {
        console.error(err);
        addToast("Error al quitar el árbitro.", "error");
      }
    });
  });
}

function renderAvailableReferees() {
  const select = modalEl.querySelector("#manage-available-select");
  const filterByDay = modalEl.querySelector("#manage-filter-by-day").checked;

  const assignedArbitroIds = new Set(manageAssignedList.map((d) => (d.arbitro ? d.arbitro.idArbitro : null)).filter(Boolean));
  const fechaVal = currentDesignationData ? (currentDesignationData.fecha || currentDesignationData.fechaYHora) : null;
  const dayIndex = fechaVal ? getDayOfWeekLocal(fechaVal) : -1;

  const available = allArbitrosCache.filter((a) => {
    if (!a.estadoSistema) return false;
    if (assignedArbitroIds.has(a.idArbitro)) return false;

    if (filterByDay) {
      if (dayIndex === 6) return a.disponibleSabado;
      if (dayIndex === 0) return a.disponibleDomingo;
    }
    return true;
  });

  select.innerHTML = `
    <option value="" disabled selected>Seleccione un árbitro disponible (${available.length})...</option>
    ${available.map((a) => `<option value="${a.idArbitro}">${a.nombre} ${a.apellido} (${a.categoria || "N/A"})</option>`).join("")}
  `;
}

function hideForceBox() {
  if (!modalEl) return;
  const forceBox = modalEl.querySelector("#manage-force-box");
  if (forceBox) forceBox.classList.add("hidden");
}

function showForceBox(message) {
  if (!modalEl) return;
  const forceBox = modalEl.querySelector("#manage-force-box");
  const forceMsg = modalEl.querySelector("#manage-force-msg");
  if (forceBox) {
    if (forceMsg && message) forceMsg.textContent = message;
    forceBox.classList.remove("hidden");
  }
}

async function assignReferee() {
  const select = modalEl.querySelector("#manage-available-select");
  const btnAssign = modalEl.querySelector("#btn-assign-referee");
  const idArbitro = parseInt(select.value);
  if (!idArbitro || !currentDesignationId) return;

  hideForceBox();
  btnAssign.disabled = true;
  btnAssign.innerHTML = `<i class="ti ti-loader spin-icon"></i> <span>Asignando...</span>`;

  try {
    await designacionService.asignarArbitroManual(currentDesignationId, idArbitro);
    addToast("Árbitro asignado con éxito.");
    await reloadAssignedReferees();
    if (onUpdateCallback) onUpdateCallback(currentDesignationId);
  } catch (err) {
    console.error(err);
    const errorMsg = (err.response && err.response.data && err.response.data.message) || err.message || "";
    
    // Check if error is related to category / stage mismatch
    if (errorMsg.toLowerCase().includes("no es apta para la etapa") || errorMsg.toLowerCase().includes("categoría")) {
      showForceBox(errorMsg);
      addToast("La categoría no es apta para la etapa. Puedes forzar la designación si es necesario.", "warning");
    } else {
      addToast(errorMsg || "Error al asignar el árbitro.", "error");
    }
  } finally {
    btnAssign.disabled = false;
    btnAssign.innerHTML = `<i class="ti ti-plus"></i> <span>Asignar</span>`;
  }
}

async function forceAssignReferee() {
  const select = modalEl.querySelector("#manage-available-select");
  const btnForce = modalEl.querySelector("#btn-force-assign-referee");
  const idArbitro = parseInt(select.value);
  if (!idArbitro || !currentDesignationId) return;

  btnForce.disabled = true;
  btnForce.innerHTML = `<i class="ti ti-loader spin-icon"></i> <span>Forzando...</span>`;

  try {
    await designacionService.forzarAsignarArbitroManual(currentDesignationId, idArbitro);
    addToast("Árbitro asignado (forzado) con éxito.");
    hideForceBox();
    await reloadAssignedReferees();
    if (onUpdateCallback) onUpdateCallback(currentDesignationId);
  } catch (err) {
    console.error(err);
    const errorMsg = (err.response && err.response.data && err.response.data.message) || err.message || "Error al forzar asignación.";
    addToast(errorMsg, "error");
  } finally {
    btnForce.disabled = false;
    btnForce.innerHTML = `<i class="ti ti-bolt"></i> <span>Designar igualmente?</span>`;
  }
}

export function closeManageRefereesModal() {
  if (modalEl) {
    modalEl.classList.add("hidden");
    hideForceBox();
  }
}
