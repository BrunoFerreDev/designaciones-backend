import designacionService from "../services/designacionService.js";
import arbitroService from "../services/arbitroService.js";
import canchaService from "../services/canchaService.js";
import designadoService from "../services/designadoService.js";
import { formatFecha, getDayOfWeekLocal, addToast, minArbitros } from "../helpers.js";
import { state, updateState } from "../store.js";

document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const historyFecha = document.getElementById("history-fecha");
  const step2Card = document.getElementById("step2-card");
  const btnSelectAllCanchas = document.getElementById("btn-select-all-canchas");
  const btnClearCanchas = document.getElementById("btn-clear-canchas");
  const canchasConfigsGrid = document.getElementById("canchas-configs-grid");
  const btnRegisterHistorical = document.getElementById("btn-register-historical");
  const countSelectedHistorical = document.getElementById("count-selected-historical");

  const existingListSection = document.getElementById("existing-list-section");
  const labelSelectedDate = document.getElementById("label-selected-date");
  const btnHistorySummary = document.getElementById("btn-history-summary");
  const btnHistoryRefresh = document.getElementById("btn-history-refresh");
  const listLoading = document.getElementById("list-loading");
  const listEmpty = document.getElementById("list-empty");
  const historyResultsGrid = document.getElementById("history-results-grid");

  // Modals overlays
  const editDesignationModal = document.getElementById("edit-designation-modal");
  const editDesignationForm = document.getElementById("edit-designation-form");
  const editFormId = document.getElementById("edit-form-id");
  const editFormCancha = document.getElementById("edit-form-cancha");
  const editFormFecha = document.getElementById("edit-form-fecha");
  const editFormEtapa = document.getElementById("edit-form-etapa");
  const editFormCantidad = document.getElementById("edit-form-cantidad");
  const editFormDetalle = document.getElementById("edit-form-detalle");

  const manageRefereesModal = document.getElementById("manage-referees-modal");
  const manageDesignacionId = document.getElementById("manage-designacion-id");
  const manageCanchaName = document.getElementById("manage-cancha-name");
  const manageFechaVal = document.getElementById("manage-fecha-val");
  const manageStatusAlert = document.getElementById("manage-status-alert");
  const manageStatusIcon = document.getElementById("manage-status-icon");
  const manageStatusTitle = document.getElementById("manage-status-title");
  const manageStatusRequired = document.getElementById("manage-status-required");
  const manageStatusAssigned = document.getElementById("manage-status-assigned");
  const manageFeedback = document.getElementById("manage-feedback");
  const manageFeedbackText = document.getElementById("manage-feedback-text");
  const countAssigned = document.getElementById("count-assigned");
  const assignedLoader = document.getElementById("assigned-loader");
  const assignedEmpty = document.getElementById("assigned-empty");
  const assignedList = document.getElementById("assigned-list");
  const manageFilterByDay = document.getElementById("manage-filter-by-day");
  const manageDayLabel = document.getElementById("manage-day-label");
  const manageAvailableSelect = document.getElementById("manage-available-select");
  const btnAssignReferee = document.getElementById("btn-assign-referee");

  const updateFeesModal = document.getElementById("update-fees-modal");
  const feesDesignacionId = document.getElementById("fees-designacion-id");
  const feesCanchaName = document.getElementById("fees-cancha-name");
  const feesBulkAmount = document.getElementById("fees-bulk-amount");
  const btnApplyBulkFee = document.getElementById("btn-apply-bulk-fee");
  const feesLoader = document.getElementById("fees-loader");
  const feesEmpty = document.getElementById("fees-empty");
  const feesList = document.getElementById("fees-list");

  const refereesByDayModal = document.getElementById("referees-by-day-modal");
  const daySaturdayList = document.getElementById("day-saturday-list");
  const daySundayList = document.getElementById("day-sunday-list");

  // Local State
  let allArbitros = [];
  let allCanchas = [];
  let existingDesignaciones = [];

  // Selection map: key = canchaId, value = boolean (selected or not)
  let selectedCanchasMap = {};

  // Configs map: key = canchaId, value = { hora, cantidadPartidos, etapaCampeonato }
  let canchasConfigsMap = {};

  let manageAssignedList = [];

  // Init Form date
  initDefaultDate();
  fetchInitialOptions();

  // Date select change trigger
  historyFecha.addEventListener("change", () => {
    onDateChanged();
  });

  // Select / Deselect all
  btnSelectAllCanchas.addEventListener("click", () => {
    allCanchas.forEach(c => {
      if (c.estado !== false) {
        selectedCanchasMap[c.id] = true;
      }
    });
    renderCanchasGrid();
    updateHistoricalSelectionCount();
  });

  btnClearCanchas.addEventListener("click", () => {
    selectedCanchasMap = {};
    renderCanchasGrid();
    updateHistoricalSelectionCount();
  });

  // Register click submit
  btnRegisterHistorical.addEventListener("click", registerHistoricalDesignations);

  // Refresh existing list
  btnHistoryRefresh.addEventListener("click", () => {
    loadExistingDesignations(true);
  });

  btnHistorySummary.addEventListener("click", openRefereesByDay);

  // Close modals
  document.querySelectorAll(".modal-close-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.target.closest(".modal-overlay").classList.add("hidden");
    });
  });
  document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.classList.add("hidden");
      }
    });
  });

  // Modal 1: Edit Designation Submit
  editDesignationForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = parseInt(editFormId.value);

    let formattedFecha = editFormFecha.value;
    if (formattedFecha && !formattedFecha.includes("T")) {
      formattedFecha = formattedFecha + "T00:00:00";
    } else if (formattedFecha && formattedFecha.includes("T") && formattedFecha.split(":").length === 2) {
      formattedFecha = formattedFecha + ":00";
    }

    const dto = {
      idCancha: parseInt(editFormCancha.value),
      fecha: formattedFecha,
      cantidadPartidos: parseInt(editFormCantidad.value),
      etapaCampeonato: editFormEtapa.value,
      detalle: editFormDetalle.value.trim(),
    };

    try {
      await designacionService.actualizarDesignacion(id, dto);
      addToast("Designación histórica actualizada con éxito.");
      editDesignationModal.classList.add("hidden");
      await loadExistingDesignations(true);
    } catch (err) {
      console.error(err);
      addToast("Error al actualizar la designación.", "error");
    }
  });

  // Modal 2: Manage Referees available filter & assign
  manageFilterByDay.addEventListener("change", () => {
    renderManageAvailableReferees();
  });

  btnAssignReferee.addEventListener("click", assignRefereeToDesignation);

  // Modal 3: Update Fees bulk apply
  btnApplyBulkFee.addEventListener("click", async () => {
    const id = parseInt(feesDesignacionId.value);
    const amount = parseFloat(feesBulkAmount.value);
    if (isNaN(amount) || amount < 0) {
      addToast("Ingrese un monto de arancel válido.", "error");
      return;
    }

    if (!confirm(`¿Actualizar el arancel de todos los asignados a $${amount}?`)) return;

    try {
      await designadoService.actualizarMontoATodos(id, amount);
      addToast("Montos de arancel actualizados.");
      feesBulkAmount.value = "";
      await openUpdateFeesModal(id);
      await loadExistingDesignations(true);
    } catch (err) {
      console.error(err);
      addToast("Error al actualizar montos.", "error");
    }
  });

  // Default date setup to yesterday or today
  function initDefaultDate() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    historyFecha.value = `${yyyy}-${mm}-${dd}`;
  }

  // Fetch canchas and arbitros
  async function fetchInitialOptions() {
    try {
      // 1. Fetch Arbitros
      let cachedRefs = sessionStorage.getItem("cached_arbitros");
      if (cachedRefs) {
        allArbitros = JSON.parse(cachedRefs);
      } else {
        const refs = await arbitroService.getAll(0, 100, { showLoader: false });
        allArbitros = Array.isArray(refs) ? refs : refs.content || [];
        sessionStorage.setItem("cached_arbitros", JSON.stringify(allArbitros));
      }
      state.arbitros = allArbitros;
      updateState("arbitros", allArbitros);

      // 2. Fetch Canchas
      const cachedCanchas = state.canchas;
      if (cachedCanchas && cachedCanchas.length > 0) {
        allCanchas = cachedCanchas;
      } else {
        const courts = await canchaService.getAll(0, 100);
        const courtsList = Array.isArray(courts) ? courts : courts.content || [];
        allCanchas = courtsList.map(c => ({
          id: c.idCancha || c.id,
          nombre: c.nombreCancha || c.nombre,
          ciudad: c.ciudad || "",
        }));
        state.canchas = allCanchas;
        updateState("canchas", allCanchas);
      }

      // Initialize configs
      allCanchas.forEach(c => {
        canchasConfigsMap[c.id] = {
          hora: "08:00",
          cantidadPartidos: 1,
          etapaCampeonato: "FECHA_NORMAL"
        };
      });

      onDateChanged();
    } catch (err) {
      console.error(err);
    }
  }

  // Date picker changed trigger
  function onDateChanged() {
    const val = historyFecha.value;
    if (val) {
      step2Card.classList.remove("hidden");
      existingListSection.classList.remove("hidden");

      const parts = val.split("-");
      labelSelectedDate.textContent = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : val;

      renderCanchasGrid();
      updateHistoricalSelectionCount();
      loadExistingDesignations();
    } else {
      step2Card.classList.add("hidden");
      existingListSection.classList.add("hidden");
    }
  }

  // Render Canchas configs checklist grid
  function renderCanchasGrid() {
    canchasConfigsGrid.innerHTML = "";

    // Filter active canchas and sort
    const sortedCanchas = [...allCanchas].sort((a, b) => a.nombre.localeCompare(b.nombre));

    sortedCanchas.forEach(c => {
      const isSelected = selectedCanchasMap[c.id] || false;
      const config = canchasConfigsMap[c.id] || { hora: "08:00", cantidadPartidos: 1, etapaCampeonato: "FECHA_NORMAL" };

      const item = document.createElement("div");
      item.className = `p-4 border rounded-xl bg-slate-50 transition flex flex-col gap-3 relative ${isSelected ? 'border-emerald-600 bg-emerald-50/20 shadow-sm' : 'border-slate-200 bg-slate-50'}`;

      let nestedConfigHTML = "";
      if (isSelected) {
        nestedConfigHTML = `
          <div class="border-t border-slate-200/60 pt-3 mt-1 flex flex-col gap-2 animate-fade-in text-xs">
            <div class="flex flex-col">
              <label class="text-[10px] font-bold text-slate-400 mb-1">Hora de Inicio</label>
              <input type="time" class="cancha-config-time h-8 bg-white border border-slate-200 rounded-lg px-2 text-xs outline-none" value="${config.hora}">
            </div>
            <div class="flex flex-col">
              <label class="text-[10px] font-bold text-slate-400 mb-1">Cantidad de Partidos</label>
              <input type="number" min="1" max="20" class="cancha-config-qty h-8 bg-white border border-slate-200 rounded-lg px-2 text-xs outline-none" value="${config.cantidadPartidos}">
            </div>
            <div class="flex flex-col">
              <label class="text-[10px] font-bold text-slate-400 mb-1">Etapa</label>
              <select class="cancha-config-stage h-8 bg-white border border-slate-200 rounded-lg px-2 text-xs outline-none">
                <option value="FECHA_NORMAL" ${config.etapaCampeonato === 'FECHA_NORMAL' ? 'selected' : ''}>Fecha normal</option>
                <option value="FECHA_PICANTE" ${config.etapaCampeonato === 'FECHA_PICANTE' ? 'selected' : ''}>Fecha picante</option>
                <option value="CLASIFICACION" ${config.etapaCampeonato === 'CLASIFICACION' ? 'selected' : ''}>Clasificación</option>
                <option value="CRUCES" ${config.etapaCampeonato === 'CRUCES' ? 'selected' : ''}>Cruces</option>
                <option value="SEMIFINAL" ${config.etapaCampeonato === 'SEMIFINAL' ? 'selected' : ''}>Semifinales</option>
                <option value="FINAL" ${config.etapaCampeonato === 'FINAL' ? 'selected' : ''}>Final</option>
              </select>
            </div>
          </div>
        `;
      }

      item.innerHTML = `
        <label class="flex gap-2.5 items-start cursor-pointer select-none">
          <input type="checkbox" class="cancha-chk-val mt-1" ${isSelected ? 'checked' : ''}>
          <div class="min-w-0 flex-1">
            <div class="text-xs font-bold text-slate-800 truncate">🏟️ ${c.nombre}</div>
            <div class="text-[10px] text-slate-400 mt-0.5 truncate">${c.ciudad || 'Sin ubicación'} · ${c.categoria || 'Sin Cat.'}</div>
          </div>
        </label>
        ${nestedConfigHTML}
      `;

      const chk = item.querySelector(".cancha-chk-val");
      chk.addEventListener("change", (e) => {
        selectedCanchasMap[c.id] = e.target.checked;
        renderCanchasGrid();
        updateHistoricalSelectionCount();
      });

      if (isSelected) {
        // config updates
        const timeInput = item.querySelector(".cancha-config-time");
        const qtyInput = item.querySelector(".cancha-config-qty");
        const stageInput = item.querySelector(".cancha-config-stage");

        timeInput.addEventListener("change", () => {
          config.hora = timeInput.value;
        });
        qtyInput.addEventListener("change", () => {
          config.cantidadPartidos = parseInt(qtyInput.value || 1);
        });
        stageInput.addEventListener("change", () => {
          config.etapaCampeonato = stageInput.value;
        });
      }

      canchasConfigsGrid.appendChild(item);
    });
  }

  function updateHistoricalSelectionCount() {
    const selectedIds = Object.keys(selectedCanchasMap).filter(id => selectedCanchasMap[id] === true);
    countSelectedHistorical.textContent = selectedIds.length;
    btnRegisterHistorical.disabled = selectedIds.length === 0;
  }

  // Register multiple historical designaciones
  async function registerHistoricalDesignations() {
    const valDate = historyFecha.value;
    if (!valDate) return;

    const selectedIds = Object.keys(selectedCanchasMap).filter(id => selectedCanchasMap[id] === true);
    if (selectedIds.length === 0) return;

    btnRegisterHistorical.disabled = true;
    btnRegisterHistorical.innerHTML = `<i class="ti ti-loader spin-icon"></i> <span>Registrando...</span>`;

    const promises = selectedIds.map(canchaId => {
      const config = canchasConfigsMap[canchaId] || { hora: "08:00", cantidadPartidos: 1, etapaCampeonato: "FECHA_NORMAL" };
      const formattedFecha = `${valDate}T${config.hora}:00`;

      const dto = {
        idCancha: parseInt(canchaId),
        fecha: formattedFecha,
        cantidadPartidos: config.cantidadPartidos || 1,
        etapaCampeonato: config.etapaCampeonato || "FECHA_NORMAL",
        detalle: "",
        editable: true,
        estadoDesignacion: 0,
      };

      return designacionService.createDesignacion(dto);
    });

    try {
      await Promise.all(promises);
      addToast("Designaciones históricas registradas exitosamente.");

      // Reset checklist selection
      selectedCanchasMap = {};
      renderCanchasGrid();
      updateHistoricalSelectionCount();

      // Refresh existing list
      await loadExistingDesignations(true);
    } catch (err) {
      console.error(err);
      addToast("Ocurrió un error al registrar las designaciones.", "error");
    } finally {
      btnRegisterHistorical.disabled = false;
      btnRegisterHistorical.innerHTML = `<i class="ti ti-check"></i> <span>Registrar Designaciones (${Object.keys(selectedCanchasMap).filter(id => selectedCanchasMap[id] === true).length})</span>`;
    }
  }

  // Fetch list of existing designations for date
  async function loadExistingDesignations(silent = false) {
    const valDate = historyFecha.value;
    if (!valDate) {
      existingDesignaciones = [];
      return;
    }

    if (!silent) {
      listLoading.classList.remove("hidden");
      listEmpty.classList.add("hidden");
      historyResultsGrid.innerHTML = "";
    }

    try {
      const res = await designacionService.buscarPorFecha(valDate);
      existingDesignaciones = res || [];

      // Mapear detalles de árbitros
      for (const d of existingDesignaciones) {
        const id = d.idDesignacion || d.id;
        const assigned = d.arbitrosDesignados || d.arbitros || [];
        if (assigned.length > 0) {
          state.arbitrosDesignadosMap[id] = assigned;
        }
      }

      listLoading.classList.add("hidden");

      if (existingDesignaciones.length === 0) {
        listEmpty.classList.remove("hidden");
      } else {
        renderExistingGrid();
      }
    } catch (err) {
      console.error(err);
      listLoading.classList.add("hidden");
      addToast("Error al obtener designaciones.", "error");
    }
  }

  // Draw existing designations list
  function renderExistingGrid() {
    historyResultsGrid.innerHTML = "";

    // Sort chronological: oldest to newest
    const sorted = [...existingDesignaciones].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

    sorted.forEach(d => {
      const id = d.idDesignacion || d.id;
      const c = allCanchas.find(item => item.id === (d.idCancha || d.canchaId || (d.cancha ? (d.cancha.idCancha || d.cancha.id) : null)));
      const canchaName = c ? c.nombre : "Cancha Desconocida";
      const city = c ? c.ciudad : "";

      const isMutable = d.estadoDesignacion === 0 || d.estadoDesignacion === 1;
      const assigned = state.arbitrosDesignadosMap[id] || [];
      const assignedCount = assigned.length;
      const minReq = minArbitros(d.cantidadPartidos || 1);

      // Card wrapper with status border color
      let borderStyle = "border-l-4 border-l-amber-500";
      if (d.estadoDesignacion === 1) borderStyle = "border-l-4 border-l-emerald-500";
      else if (d.estadoDesignacion === 2) borderStyle = "border-l-4 border-l-blue-600";
      else if (d.estadoDesignacion === 3) borderStyle = "border-l-4 border-l-red-500";
      else if (d.estadoDesignacion === 4) borderStyle = "border-l-4 border-l-purple-500";

      // Badge HTML
      let badgeHTML = `<span class="badge bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">Pendiente</span>`;
      if (d.estadoDesignacion === 1) badgeHTML = `<span class="badge bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">✓ Completa</span>`;
      else if (d.estadoDesignacion === 2) badgeHTML = `<span class="badge bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-semibold">Finalizada</span>`;
      else if (d.estadoDesignacion === 3) badgeHTML = `<span class="badge bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full font-semibold">Cancelada</span>`;
      else if (d.estadoDesignacion === 4) badgeHTML = `<span class="badge bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full font-semibold">Suspendida</span>`;

      // Warning alert if incomplete
      let incompleteAlert = "";
      if (d.estadoDesignacion === 0) {
        incompleteAlert = `
          <div class="text-[10px] text-amber-800 bg-amber-50 border border-amber-100 rounded-lg p-2 mb-3 flex items-center gap-1 font-semibold">
            <i class="ti ti-alert-circle text-amber-500 text-xs"></i>
            <span>Requiere min: <strong>${minReq}</strong> (Asignados: ${assignedCount})</span>
          </div>
        `;
      }

      // Dynamic assigned referees container (always present)
      const assignedRefereesHTML = `
        <div class="assigned-section hidden mt-3 p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
          <div class="text-[10px] font-bold text-slate-400 mb-1.5 uppercase flex items-center gap-1"><i class="ti ti-users"></i> Árbitros Asignados:</div>
          <div class="assigned-refs-container flex flex-col gap-1"></div>
        </div>
      `;

      // Create Actions buttons
      let actionButtons = "";
      if (isMutable) {
        actionButtons += `
          <button class="btn btn-sparkles-des btn-xs" style="padding: 5px 8px; border-color: #bcd1e6; color: #185fa5; bg: #f6fafd;" title="Asignación Automática">
            <i class="ti ti-sparkles text-amber-500"></i>
          </button>
          <button class="btn btn-people-des btn-xs" style="padding: 5px 8px;" title="Asignar Árbitros">
            <i class="ti ti-users text-emerald-600"></i>
            <span class="text-[10px] ml-0.5">${assignedCount}</span>
          </button>
          <button class="btn btn-dollar-des btn-xs" style="padding: 5px 8px;" title="Aranceles">
            <i class="ti ti-currency-dollar text-slate-500"></i>
          </button>
          <button class="btn btn-edit-des btn-xs" style="padding: 5px 8px;" title="Editar">
            <i class="ti ti-edit"></i>
          </button>
        `;
      }

      if (d.estadoDesignacion === 0 || d.estadoDesignacion === 1) {
        actionButtons += `
          <button class="btn btn-finish-des btn-xs primary" style="padding: 5px 8px;" title="Finalizar Jornada">
            <i class="ti ti-checkbox"></i>
            <span class="text-[10px] ml-0.5 font-bold">Finalizar</span>
          </button>
          <button class="btn btn-cancel-des btn-xs danger" style="padding: 5px 8px;" title="Cancelar Jornada">
            <i class="ti ti-circle-x"></i>
          </button>
        `;
      } else if (d.estadoDesignacion === 2) {
        actionButtons += `
          <button class="btn btn-reprogram-des btn-xs" style="padding: 5px 8px; border-color: #cbd5e1; color: #475569;" title="Reprogramar/Habilitar">
            <i class="ti ti-reload"></i>
            <span class="text-[10px] ml-0.5">Habilitar</span>
          </button>
        `;
      }

      if (d.estadoDesignacion === 3 || d.estadoDesignacion === 4) {
        actionButtons += `
          <button class="btn btn-reprogram-des btn-xs" style="padding: 5px 8px; border-color: #cbd5e1; color: #475569;" title="Reprogramar">
            <i class="ti ti-reload"></i>
          </button>
        `;
      }

      actionButtons += `
        <button class="btn btn-delete-des btn-xs danger" style="padding: 5px 8px;" title="Eliminar definitivamente">
          <i class="ti ti-trash"></i>
        </button>
      `;

      const card = document.createElement("div");
      card.className = `card bg-white rounded-2xl border border-slate-150 p-4 shadow-sm relative flex flex-col justify-between ${borderStyle}`;
      card.innerHTML = `
        <div>
          <div class="card-header flex items-start justify-between flex-wrap gap-2 pb-2">
            <div>
              <div class="card-title text-sm font-bold text-slate-800 flex items-center gap-1">
                <span>🏟️</span>
                <span>${canchaName}</span>
              </div>
              <div class="card-sub text-[10px] text-slate-400 mt-0.5 uppercase font-medium">
                ${city ? `${city} · ` : ""}${d.cantidadPartidos} partidos · <strong class="text-slate-600 font-semibold normal-case">${formatFecha(d.fecha)}</strong>
              </div>
            </div>
            ${badgeHTML}
          </div>
          
          <div class="text-[10px] text-slate-500 mt-1 mb-3">
            <span class="font-semibold text-slate-600">Etapa:</span>
            <span class="ml-1 bg-slate-100 px-1.5 py-0.5 rounded font-bold">${d.etapaCampeonato || "FECHA_NORMAL"}</span>
          </div>

          ${incompleteAlert}
          
          <button class="btn-toggle-assigned w-full border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 transition text-[10px] font-bold text-slate-600 py-1 rounded-lg flex items-center justify-center gap-1 mt-1">
              <i class="ti ti-eye"></i>
              <span>Ver árbitros asignados</span>
            </button>
          
          ${assignedRefereesHTML}
        </div>

        <div class="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5 justify-end">
          ${actionButtons}
        </div>
      `;

      // Event bindings on card
      const toggleAssignedBtn = card.querySelector(".btn-toggle-assigned");
      if (toggleAssignedBtn) {
        const section = card.querySelector(".assigned-section");
        const container = card.querySelector(".assigned-refs-container");

        const drawReferees = (list) => {
          if (!list || list.length === 0) {
            container.innerHTML = `<div class="text-[10px] text-slate-400 text-center py-2">Sin árbitros asignados.</div>`;
            return;
          }
          container.innerHTML = list.map(asg => {
            const a = asg.arbitro || {};
            return `<div class="text-[11px] py-1 px-2 bg-white border border-slate-100 rounded-lg flex items-center justify-between">
              <span class="font-semibold text-slate-700 truncate">${a.nombre || ''} ${a.apellido || ''}</span>
              <span class="text-[10px] text-slate-400">${a.categoria || ''} · ${asg.partidosDirigidos ?? 0} PD</span>
            </div>`;
          }).join("");
        };

        toggleAssignedBtn.addEventListener("click", async () => {
          const isHidden = section.classList.contains("hidden");
          if (isHidden) {
            section.classList.remove("hidden");
            toggleAssignedBtn.querySelector("span").textContent = "Ocultar árbitros";
            toggleAssignedBtn.querySelector("i").className = "ti ti-eye-off";

            const currentRefs = state.arbitrosDesignadosMap[id];
            if (!currentRefs || currentRefs.length === 0) {
              container.innerHTML = `<div class="text-center py-3"><i class="ti ti-loader spin-icon text-slate-400"></i></div>`;
              try {
                const refsList = await designacionService.getArbitrosDesignados(id);
                const refsArr = Array.isArray(refsList) ? refsList : [];
                state.arbitrosDesignadosMap[id] = refsArr;
                updateState("arbitrosDesignadosMap", state.arbitrosDesignadosMap);
                drawReferees(refsArr);
              } catch (e) {
                console.error("Error al obtener árbitros:", e);
                container.innerHTML = `<div class="text-[10px] text-rose-500 text-center py-2">Fallo al cargar árbitros.</div>`;
              }
            } else {
              drawReferees(currentRefs);
            }
          } else {
            section.classList.add("hidden");
            toggleAssignedBtn.querySelector("span").textContent = "Ver árbitros asignados";
            toggleAssignedBtn.querySelector("i").className = "ti ti-eye";
          }
        });
      }

      // Auto assign
      const sparklesBtn = card.querySelector(".btn-sparkles-des");
      if (sparklesBtn) {
        sparklesBtn.addEventListener("click", async () => {
          sparklesBtn.disabled = true;
          try {
            await designacionService.asignarArbitrosAutomaticamente(id);
            addToast("Asignación automática de árbitros finalizada.");
            await loadExistingDesignations(true);
          } catch (err) {
            console.error(err);
            addToast("Fallo al asignar árbitros automáticamente.", "error");
          } finally {
            sparklesBtn.disabled = false;
          }
        });
      }

      // Manage Referees Modal
      const peopleBtn = card.querySelector(".btn-people-des");
      if (peopleBtn) {
        peopleBtn.addEventListener("click", () => {
          openManageRefereesModal(id);
        });
      }

      // Update Fees Modal
      const dollarBtn = card.querySelector(".btn-dollar-des");
      if (dollarBtn) {
        dollarBtn.addEventListener("click", () => {
          openUpdateFeesModal(id);
        });
      }

      // Edit designation
      const editBtn = card.querySelector(".btn-edit-des");
      if (editBtn) {
        editBtn.addEventListener("click", () => {
          openEditModal(d);
        });
      }

      // Finish designation
      const finishBtn = card.querySelector(".btn-finish-des");
      if (finishBtn) {
        finishBtn.addEventListener("click", async () => {
          if (!confirm("¿Deseas finalizar la jornada de esta designación?")) return;
          try {
            await designacionService.finalizarDesignacion(id);
            addToast("Designación finalizada.");
            await loadExistingDesignations(true);
          } catch (err) {
            console.error(err);
            addToast("Error al finalizar la designación.", "error");
          }
        });
      }

      // Cancel designation
      const cancelBtn = card.querySelector(".btn-cancel-des");
      if (cancelBtn) {
        cancelBtn.addEventListener("click", async () => {
          const reason = prompt("Ingrese el motivo de la cancelación/suspensión:");
          if (reason === null) return;
          try {
            await designacionService.cancelarDesignacion(id, reason.trim());
            addToast("Designación cancelada con éxito.");
            await loadExistingDesignations(true);
          } catch (err) {
            console.error(err);
            addToast("Error al cancelar la designación.", "error");
          }
        });
      }

      // Reprogram designation
      const reprogramBtn = card.querySelector(".btn-reprogram-des");
      if (reprogramBtn) {
        reprogramBtn.addEventListener("click", async () => {
          if (!confirm("¿Reprogramar esta designación? Volverá al estado editable.")) return;
          try {
            await designacionService.reprogramarDesignacion(id);
            addToast("Designación habilitada para edición.");
            await loadExistingDesignations(true);
          } catch (err) {
            console.error(err);
            addToast("Error al reprogramar la designación.", "error");
          }
        });
      }

      // Delete designation
      const deleteBtn = card.querySelector(".btn-delete-des");
      if (deleteBtn) {
        deleteBtn.addEventListener("click", async () => {
          if (!confirm("¿Eliminar definitivamente esta designación de los registros? Esta acción no se puede deshacer.")) return;
          try {
            await designacionService.deleteDesignacion(id);
            addToast("Designación histórica eliminada con éxito.");
            await loadExistingDesignations(true);
          } catch (err) {
            console.error(err);
            addToast("Error al eliminar la designación.", "error");
          }
        });
      }

      historyResultsGrid.appendChild(card);
    });
  }

  // Open Edit Designation modal
  function openEditModal(d) {
    editFormId.value = d.idDesignacion || d.id;

    // Populate Canchas select
    editFormCancha.innerHTML = "";
    allCanchas.forEach(c => {
      const option = document.createElement("option");
      option.value = c.id;
      option.textContent = `${c.nombre} (${c.ciudad || "Rosario"})`;
      editFormCancha.appendChild(option);
    });

    const activeCanchaId = d.idCancha || d.canchaId || (d.cancha ? (d.cancha.idCancha || d.cancha.id) : null);
    editFormCancha.value = activeCanchaId;

    // Dates formatter for input
    let valFecha = d.fecha || "";
    if (valFecha && valFecha.includes("T")) {
      valFecha = valFecha.split(":").slice(0, 2).join(":");
    }
    editFormFecha.value = valFecha;
    editFormEtapa.value = d.etapaCampeonato || "FECHA_NORMAL";
    editFormCantidad.value = d.cantidadPartidos || 1;
    editFormDetalle.value = d.detalle || "";

    editDesignationModal.classList.remove("hidden");
  }

  // Open Manage Referees manual modal
  async function openManageRefereesModal(id) {
    manageDesignacionId.value = id;
    manageFeedback.classList.add("hidden");
    btnAssignReferee.disabled = true;

    const d = existingDesignaciones.find(item => (item.idDesignacion || item.id) === id);
    if (!d) return;

    const c = allCanchas.find(item => item.id === (d.idCancha || d.canchaId || (d.cancha ? (d.cancha.idCancha || d.cancha.id) : null)));
    manageCanchaName.textContent = c ? c.nombre : "Cancha Desconocida";
    manageFechaVal.textContent = formatFecha(d.fecha);

    // Setup day filter label (Sáb/Dom)
    const dayVal = getDayOfWeekLocal(d.fecha);
    const isSat = dayVal === 6;
    const isSun = dayVal === 0;

    manageFilterByDay.checked = isSat || isSun;
    manageDayLabel.textContent = isSat ? "Sábado" : isSun ? "Domingo" : "Otro";

    manageRefereesModal.classList.remove("hidden");

    await fetchAssignedReferees(id);
  }

  async function fetchAssignedReferees(id) {
    assignedLoader.classList.remove("hidden");
    assignedEmpty.classList.add("hidden");
    assignedList.innerHTML = "";

    try {
      const res = await designacionService.getArbitrosDesignados(id);
      manageAssignedList = Array.isArray(res) ? res : [];

      // Update cache map in state
      state.arbitrosDesignadosMap[id] = manageAssignedList;
      updateState("arbitrosDesignadosMap", state.arbitrosDesignadosMap);

      assignedLoader.classList.add("hidden");
      countAssigned.textContent = manageAssignedList.length;

      // Status requirements alert update
      const d = existingDesignaciones.find(item => (item.idDesignacion || item.id) === id);
      const req = minArbitros(d.cantidadPartidos || 1);
      manageStatusRequired.textContent = req;
      manageStatusAssigned.textContent = manageAssignedList.length;

      if (manageAssignedList.length >= req) {
        manageStatusAlert.className = "alert bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 py-2.5 px-3 rounded-r-xl flex items-center gap-2 text-xs";
        manageStatusIcon.className = "ti ti-check text-emerald-600 text-base";
        manageStatusTitle.textContent = "Designación Completa";
      } else {
        manageStatusAlert.className = "alert bg-amber-50 border-l-4 border-amber-500 text-amber-800 py-2.5 px-3 rounded-r-xl flex items-center gap-2 text-xs";
        manageStatusIcon.className = "ti ti-alert-triangle text-amber-600 text-base";
        manageStatusTitle.textContent = "Designación Incompleta";
      }

      if (manageAssignedList.length === 0) {
        assignedEmpty.classList.remove("hidden");
      } else {
        // Draw assigned list
        manageAssignedList.forEach(asg => {
          const arb = asg.arbitro || asg;
          const initials = `${arb.nombre ? arb.nombre[0] : ''}${arb.apellido ? arb.apellido[0] : ''}`.toUpperCase().slice(0, 2);

          const item = document.createElement("div");
          item.className = "card border border-slate-150 p-2.5 rounded-xl flex items-center justify-between shadow-sm bg-white";
          item.innerHTML = `
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="w-7 h-7 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center">${initials}</div>
              <div class="truncate">
                <div class="text-xs font-bold text-slate-800">${arb.nombre} ${arb.apellido}</div>
                <div class="text-[9px] text-slate-400 mt-0.5">
                  <span class="badge bg-slate-150 px-1 py-0.2 rounded font-bold">${arb.categoria}</span> · ${asg.partidosDirigidos || 0} part.
                </div>
              </div>
            </div>
            <button class="btn danger btn-xs p-1" title="Quitar">
              <i class="ti ti-trash text-xs"></i>
            </button>
          `;

          item.querySelector("button").addEventListener("click", () => {
            removeRefereeFromDesignation(id, arb.idArbitro || arb.id);
          });

          assignedList.appendChild(item);
        });
      }

      // Refresh list of available referees
      renderManageAvailableReferees();
    } catch (err) {
      console.error(err);
      assignedLoader.classList.add("hidden");
      addToast("Error al cargar árbitros asignados.", "error");
    }
  }

  function renderManageAvailableReferees() {
    const id = parseInt(manageDesignacionId.value);
    const d = existingDesignaciones.find(item => (item.idDesignacion || item.id) === id);
    if (!d) return;

    // Filter available referees
    const assignedIds = manageAssignedList.map(asg => asg.arbitro?.idArbitro || asg.idArbitro || asg.arbitro?.id || asg.id);

    const isSat = getDayOfWeekLocal(d.fecha) === 6;
    const isSun = getDayOfWeekLocal(d.fecha) === 0;
    const dayFilterChecked = manageFilterByDay.checked;

    const available = allArbitros.filter(arb => {
      if (arb.estadoSistema === false) return false;
      if (assignedIds.includes(arb.idArbitro)) return false;

      if (dayFilterChecked) {
        if (isSat && !arb.disponibleSabado) return false;
        if (isSun && !arb.disponibleDomingo) return false;
      }

      return true;
    });

    manageAvailableSelect.innerHTML = '<option value="" disabled selected>Selecciona un árbitro disponible...</option>';

    const orderCat = { AVANZADO: 1, INTERMEDIO: 2, PRINCIPAL_1: 3, PRINCIPAL_2: 4, PRINCIPAL_3: 5, PRINCIPAL_4: 6, ASISTENTE: 7, INCIAL: 8 };
    const sorted = [...available].sort((a, b) => {
      const valA = orderCat[a.categoria] || 99;
      const valB = orderCat[b.categoria] || 99;
      if (valA !== valB) return valA - valB;
      return a.apellido.localeCompare(b.apellido);
    });

    sorted.forEach(arb => {
      const option = document.createElement("option");
      option.value = arb.idArbitro;

      let dayText = "Ninguno";
      if (arb.disponibleSabado && arb.disponibleDomingo) dayText = "Sáb y Dom";
      else if (arb.disponibleSabado) dayText = "Sáb";
      else if (arb.disponibleDomingo) dayText = "Dom";

      option.textContent = `${arb.nombre} ${arb.apellido} (${arb.categoria}) · [${dayText}]`;
      manageAvailableSelect.appendChild(option);
    });

    btnAssignReferee.disabled = true;
    manageAvailableSelect.addEventListener("change", () => {
      btnAssignReferee.disabled = !manageAvailableSelect.value;
    });
  }

  // Remove referee from designation
  async function removeRefereeFromDesignation(idDesignacion, idArbitro) {
    if (!confirm("¿Quitar este árbitro de la designación?")) return;
    try {
      await designacionService.quitarArbitroManual(idDesignacion, idArbitro);
      addToast("Árbitro desasignado con éxito.");
      await fetchAssignedReferees(idDesignacion);
      await loadExistingDesignations(true);
    } catch (err) {
      console.error(err);
      addToast("Fallo al desasignar árbitro.", "error");
    }
  }

  // Assign referee manually
  async function assignRefereeToDesignation() {
    const idDesignacion = parseInt(manageDesignacionId.value);
    const idArbitro = parseInt(manageAvailableSelect.value);
    if (!idArbitro) return;

    manageFeedback.classList.add("hidden");
    btnAssignReferee.disabled = true;
    btnAssignReferee.innerHTML = `<i class="ti ti-loader spin-icon"></i>`;

    try {
      await designacionService.assignArbitroADesignacionManual(idDesignacion, idArbitro);
      addToast("Árbitro asignado con éxito.");
      manageAvailableSelect.value = "";
      await fetchAssignedReferees(idDesignacion);
      await loadExistingDesignations(true);
    } catch (err) {
      console.error(err);
      let msg = "Error al asignar árbitro.";
      if (err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      manageFeedbackText.textContent = msg;
      manageFeedback.classList.remove("hidden");
    } finally {
      btnAssignReferee.disabled = false;
      btnAssignReferee.textContent = "Asignar";
    }
  }

  // Open Update Fees Modal
  async function openUpdateFeesModal(id) {
    feesDesignacionId.value = id;
    feesLoader.classList.remove("hidden");
    feesEmpty.classList.add("hidden");
    feesList.innerHTML = "";

    const d = existingDesignaciones.find(item => (item.idDesignacion || item.id) === id);
    const c = allCanchas.find(item => item.id === (d.idCancha || d.canchaId || (d.cancha ? (d.cancha.idCancha || d.cancha.id) : null)));
    feesCanchaName.textContent = c ? c.nombre : "Cancha Desconocida";

    updateFeesModal.classList.remove("hidden");

    try {
      const res = await designacionService.getArbitrosDesignados(id);
      const list = Array.isArray(res) ? res : [];

      feesLoader.classList.add("hidden");

      if (list.length === 0) {
        feesEmpty.classList.remove("hidden");
      } else {
        list.forEach(asg => {
          const arb = asg.arbitro || asg;
          const initials = `${arb.nombre ? arb.nombre[0] : ''}${arb.apellido ? arb.apellido[0] : ''}`.toUpperCase().slice(0, 2);

          const item = document.createElement("div");
          item.className = "card border border-slate-150 p-3 rounded-xl flex items-center justify-between shadow-sm bg-white gap-4";
          item.innerHTML = `
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="w-8 h-8 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0">${initials}</div>
              <div class="truncate">
                <div class="text-xs font-bold text-slate-800">${arb.nombre} ${arb.apellido}</div>
                <div class="text-[9px] text-slate-400 mt-0.5">
                  <span class="badge bg-slate-150 px-1 py-0.2 rounded font-bold">${arb.categoria}</span>
                </div>
              </div>
            </div>
            
            <div class="flex items-center gap-1.5 flex-shrink-0">
              <span class="text-xs text-slate-400 font-bold">$</span>
              <input type="number" class="fee-input-val w-24 h-8 bg-slate-50 border border-slate-200 rounded-lg px-2 text-xs outline-none focus:border-emerald-500 focus:bg-white text-right font-bold text-slate-700" value="${asg.montoPercibido || 0}" min="0">
              <button class="btn btn-save-fee btn-xs px-2.5 h-8 bg-emerald-50 text-emerald-700 border-emerald-200" title="Guardar">
                <i class="ti ti-check text-xs font-bold"></i>
              </button>
            </div>
          `;

          const saveBtn = item.querySelector(".btn-save-fee");
          const input = item.querySelector(".fee-input-val");

          saveBtn.addEventListener("click", async () => {
            const amount = parseFloat(input.value);
            if (isNaN(amount) || amount < 0) {
              addToast("Ingrese un monto de arancel válido.", "error");
              return;
            }
            saveBtn.disabled = true;
            try {
              const designadosId = asg.idDesignados || asg.id;
              await designadoService.actualizarMontoPercibido(designadosId, amount);
              addToast("Arancel de árbitro histórico actualizado.");
              await loadExistingDesignations(true);
            } catch (err) {
              console.error(err);
              addToast("Error al guardar arancel.", "error");
            } finally {
              saveBtn.disabled = false;
            }
          });

          feesList.appendChild(item);
        });
      }
    } catch (err) {
      console.error(err);
      feesLoader.classList.add("hidden");
      addToast("Error al cargar aranceles.", "error");
    }
  }

  // Open Referees by Day list matrix
  function openRefereesByDay() {
    daySaturdayList.innerHTML = "";
    daySundayList.innerHTML = "";

    let satMap = new Map();
    let sunMap = new Map();

    existingDesignaciones.forEach(d => {
      const dayVal = getDayOfWeekLocal(d.fecha);
      const assigned = state.arbitrosDesignadosMap[d.idDesignacion || d.id] || [];
      const c = allCanchas.find(item => item.id === (d.idCancha || d.canchaId || (d.cancha ? (d.cancha.idCancha || d.cancha.id) : null)));
      const canchaName = c ? c.nombre : "Cancha";

      const targetMap = (dayVal === 0) ? sunMap : satMap;

      assigned.forEach(asg => {
        const arb = asg.arbitro || asg;
        const id = arb.idArbitro || arb.id;

        let info = targetMap.get(id);
        if (!info) {
          info = { name: `${arb.apellido}, ${arb.nombre}`, courts: [] };
          targetMap.set(id, info);
        }
        info.courts.push(`${canchaName} (${asg.partidosDirigidos}p)`);
      });
    });

    const drawList = (map, container) => {
      if (map.size === 0) {
        container.innerHTML = '<div class="text-slate-400 italic py-2">Sin asignaciones para este día.</div>';
        return;
      }

      const sorted = [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
      sorted.forEach(item => {
        const row = document.createElement("div");
        row.className = "p-2 bg-white rounded-lg border border-slate-100 shadow-sm flex items-center justify-between gap-4";
        row.innerHTML = `
          <span class="font-bold text-slate-800">${item.name}</span>
          <span class="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-medium text-right">${item.courts.join(" y ")}</span>
        `;
        container.appendChild(row);
      });
    };

    drawList(satMap, daySaturdayList);
    drawList(sunMap, daySundayList);

    refereesByDayModal.classList.remove("hidden");
  }
});
