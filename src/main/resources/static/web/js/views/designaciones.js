import designacionService from "../services/designacionService.js";
import arbitroService from "../services/arbitroService.js";
import canchaService from "../services/canchaService.js";
import designadoService from "../services/designadoService.js";
import { printComparativaReport } from "../services/printComparativaService.js";
import { formatFecha, getDayOfWeekLocal, getLocalDateString, addToast, minArbitros } from "../helpers.js";
import { state, updateState } from "../store.js";

document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const designationsEmpty = document.getElementById("designations-empty");
  const designationsContainer = document.getElementById("designations-container");
  const refereeSearch = document.getElementById("referee-search");

  // Sections & Grids
  const sectionIncompletas = document.getElementById("section-incompletas");
  const countIncompletas = document.getElementById("count-incompletas");
  const gridIncompletas = document.getElementById("grid-incompletas");

  const sectionCompletas = document.getElementById("section-completas");
  const countCompletas = document.getElementById("count-completas");
  const gridCompletas = document.getElementById("grid-completas");

  const sectionAconfirmar = document.getElementById("section-aconfirmar");
  const gridAconfirmar = document.getElementById("grid-aconfirmar");

  const sectionCanceladas = document.getElementById("section-canceladas");
  const gridCanceladas = document.getElementById("grid-canceladas");

  const sectionFinalizadas = document.getElementById("section-finalizadas");
  const countFinalizadas = document.getElementById("count-finalizadas");
  const gridFinalizadas = document.getElementById("grid-finalizadas");
  const btnToggleFinalized = document.getElementById("btn-toggle-finalized");

  // Topbar triggers
  const btnRefereesByDay = document.getElementById("btn-referees-by-day");
  const btnWeekendComparative = document.getElementById("btn-weekend-comparative");
  const btnWhatsappShareAll = document.getElementById("btn-whatsapp-share-all");
  const btnNewDesignation = document.getElementById("btn-new-designation");
  const btnCreateFirst = document.getElementById("btn-create-first");

  // Modal 1: Wizard (Create Designation)
  const wizardModal = document.getElementById("wizard-modal");
  const wizardTabManual = document.getElementById("wizard-tab-manual");
  const wizardTabClone = document.getElementById("wizard-tab-clone");
  const wizardViewManual = document.getElementById("wizard-view-manual");
  const wizardViewClone = document.getElementById("wizard-view-clone");
  const wizardCancha = document.getElementById("wizard-cancha");
  const wizardCanchaInfo = document.getElementById("wizard-cancha-info");
  const wizardCanchaName = document.getElementById("wizard-cancha-name");
  const wizardCanchaDetail = document.getElementById("wizard-cancha-detail");
  const wizardBtnStep1Next = document.getElementById("wizard-btn-step1-next");
  const manualStep1 = document.getElementById("manual-step-1");
  const manualStep2 = document.getElementById("manual-step-2");
  const step2CanchaName = document.getElementById("step2-cancha-name");
  const wizardFecha = document.getElementById("wizard-fecha");
  const wizardEtapa = document.getElementById("wizard-etapa");
  const wizardCantidad = document.getElementById("wizard-cantidad");
  const wizardBtnStep2Back = document.getElementById("wizard-btn-step2-back");
  const wizardBtnStep2Submit = document.getElementById("wizard-btn-step2-submit");
  const cloneLoader = document.getElementById("clone-loader");
  const cloneEmpty = document.getElementById("clone-empty");
  const cloneRangeDate = document.getElementById("clone-range-date");
  const cloneListWrapper = document.getElementById("clone-list-wrapper");
  const cloneSelectAll = document.getElementById("clone-select-all");
  const cloneSelectCount = document.getElementById("clone-select-count");
  const cloneList = document.getElementById("clone-list");
  const wizardBtnCloneSubmit = document.getElementById("wizard-btn-clone-submit");

  // Modal 2: Edit Designation Modal
  const editDesignationModal = document.getElementById("edit-designation-modal");
  const editDesignationForm = document.getElementById("edit-designation-form");
  const editFormId = document.getElementById("edit-form-id");
  const editFormCancha = document.getElementById("edit-form-cancha");
  const editFormFecha = document.getElementById("edit-form-fecha");
  const editFormEtapa = document.getElementById("edit-form-etapa");
  const editFormCantidad = document.getElementById("edit-form-cantidad");
  const editFormDetalle = document.getElementById("edit-form-detalle");

  // Modal 3: Manage Referees Modal
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

  // Modal 4: Update Fees Modal
  const updateFeesModal = document.getElementById("update-fees-modal");
  const feesDesignacionId = document.getElementById("fees-designacion-id");
  const feesCanchaName = document.getElementById("fees-cancha-name");
  const feesBulkAmount = document.getElementById("fees-bulk-amount");
  const btnApplyBulkFee = document.getElementById("btn-apply-bulk-fee");
  const feesLoader = document.getElementById("fees-loader");
  const feesEmpty = document.getElementById("fees-empty");
  const feesList = document.getElementById("fees-list");

  // Modal 5: Whatsapp Share Modal
  const whatsappModal = document.getElementById("whatsapp-modal");
  const whatsappDaySelect = document.getElementById("whatsapp-day-select");
  const whatsappTextarea = document.getElementById("whatsapp-textarea");
  const btnCopyWhatsapp = document.getElementById("btn-copy-whatsapp");
  const btnSendWhatsappAll = document.getElementById("btn-send-whatsapp-all");

  // Modal 6: Referees By Day Modal
  const refereesByDayModal = document.getElementById("referees-by-day-modal");
  const daySaturdayList = document.getElementById("day-saturday-list");
  const daySundayList = document.getElementById("day-sunday-list");

  // Modal 7: Comparative Weekend Modal
  const weekendComparativeModal = document.getElementById("weekend-comparative-modal");
  const compLastSat = document.getElementById("comp-last-sat");
  const compLastSun = document.getElementById("comp-last-sun");
  const compThisSat = document.getElementById("comp-this-sat");
  const compThisSun = document.getElementById("comp-this-sun");
  const btnCompGenerate = document.getElementById("btn-comp-generate");

  // State Variables
  let allDesignaciones = [];
  let allArbitros = [];
  let allCanchas = [];
  let filterSearchQuery = "";
  let showFinalized = true;

  // Wizard Clone Temp list
  let pastDesignationsList = [];
  let cloneSelectedIds = [];
  let lastWeekendRange = { saturday: "", sunday: "" };

  // Manage referees selection cache
  let manageAssignedList = [];
  let manageAvailableList = [];

  // Initial loading
  fetchInitialData();

  // Search filter
  refereeSearch.addEventListener("input", (e) => {
    filterSearchQuery = e.target.value.toLowerCase().trim();
    renderAll();
  });

  // Toggle finalized visibility
  btnToggleFinalized.addEventListener("click", () => {
    showFinalized = !showFinalized;
    const icon = btnToggleFinalized.querySelector("i");
    const label = btnToggleFinalized.querySelector("span");
    
    if (showFinalized) {
      icon.className = "ti ti-eye-off";
      label.textContent = "Ocultar";
      gridFinalizadas.classList.remove("hidden");
    } else {
      icon.className = "ti ti-eye";
      label.textContent = "Mostrar";
      gridFinalizadas.classList.add("hidden");
    }
  });

  // General Close Modals
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

  // Modal Triggers: Wizard
  btnNewDesignation.addEventListener("click", openWizard);
  btnCreateFirst.addEventListener("click", openWizard);

  wizardTabManual.addEventListener("click", () => {
    wizardTabManual.classList.add("active");
    wizardTabClone.classList.remove("active");
    wizardViewManual.classList.remove("hidden");
    wizardViewClone.classList.add("hidden");
  });

  wizardTabClone.addEventListener("click", () => {
    wizardTabClone.classList.add("active");
    wizardTabManual.classList.remove("active");
    wizardViewClone.classList.remove("hidden");
    wizardViewManual.classList.add("hidden");
    loadPastWeekendDesignations();
  });

  // Manual Wizard steps
  wizardCancha.addEventListener("change", (e) => {
    const id = parseInt(e.target.value);
    const c = allCanchas.find(item => item.id === id);
    if (c) {
      wizardCanchaName.textContent = c.nombre;
      wizardCanchaDetail.textContent = `Categoría: ${c.categoria} · Viaje: ${c.necesitaViaje ? "Sí" : "No"} · Fuera de juego: ${c.fueraDeJuego ? "Sí" : "No"}`;
      wizardCanchaInfo.classList.remove("hidden");
      wizardBtnStep1Next.disabled = false;
    } else {
      wizardCanchaInfo.classList.add("hidden");
      wizardBtnStep1Next.disabled = true;
    }
  });

  wizardBtnStep1Next.addEventListener("click", () => {
    const id = parseInt(wizardCancha.value);
    const c = allCanchas.find(item => item.id === id);
    if (c) {
      step2CanchaName.textContent = `${c.nombre} (${c.ciudad || "Sin ubicación"})`;
      manualStep1.classList.add("hidden");
      manualStep2.classList.remove("hidden");
      
      // Default Date setup: Saturday or Sunday
      const now = new Date();
      // default next Saturday at 14:00
      const daysToAdd = (6 - now.getDay() + 7) % 7;
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() + daysToAdd);
      targetDate.setHours(14, 0, 0, 0);

      const yyyy = targetDate.getFullYear();
      const mm = String(targetDate.getMonth() + 1).padStart(2, "0");
      const dd = String(targetDate.getDate()).padStart(2, "0");
      const hh = String(targetDate.getHours()).padStart(2, "0");
      const min = String(targetDate.getMinutes()).padStart(2, "0");
      
      wizardFecha.value = `${yyyy}-${mm}-${dd}T${hh}:${min}`;
      wizardBtnStep2Submit.disabled = false;
    }
  });

  wizardBtnStep2Back.addEventListener("click", () => {
    manualStep1.classList.remove("hidden");
    manualStep2.classList.add("hidden");
  });

  wizardBtnStep2Submit.addEventListener("click", createDesignationManual);

  // Clone Wizard selection
  cloneSelectAll.addEventListener("change", (e) => {
    const checked = e.target.checked;
    if (checked) {
      cloneSelectedIds = pastDesignationsList.map(d => d.idDesignacion || d.id);
    } else {
      cloneSelectedIds = [];
    }
    updateCloneSelectionHTML();
  });

  wizardBtnCloneSubmit.addEventListener("click", importDesignationsClone);

  // Modal 2: Edit designation submit
  editDesignationForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = parseInt(editFormId.value);
    
    let formattedFecha = editFormFecha.value;
    if (formattedFecha && !formattedFecha.includes("T")) {
      formattedFecha = formattedFecha + "T00:00:00";
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
      addToast("Designación actualizada con éxito.");
      editDesignationModal.classList.add("hidden");
      await fetchInitialData(true);
    } catch (err) {
      console.error(err);
      addToast("Error al actualizar la designación.", "error");
    }
  });

  // Modal 3: Manage referees available filtering & assignment
  manageFilterByDay.addEventListener("change", () => {
    renderManageAvailableReferees();
  });

  btnAssignReferee.addEventListener("click", assignRefereeToDesignation);

  // Modal 4: Update Fees (Aranceles) bulk apply
  btnApplyBulkFee.addEventListener("click", async () => {
    const id = parseInt(feesDesignacionId.value);
    const amount = parseFloat(feesBulkAmount.value);
    if (isNaN(amount) || amount < 0) {
      addToast("Ingrese un monto válido.", "error");
      return;
    }
    
    if (!confirm(`¿Actualizar el arancel de todos los asignados a $${amount}?`)) return;

    try {
      await designadoService.actualizarMontoATodos(id, amount);
      addToast("Montos actualizados correctamente.");
      feesBulkAmount.value = "";
      await openUpdateFeesModal(id);
      await fetchInitialData(true);
    } catch (err) {
      console.error(err);
      addToast("Error al actualizar montos.", "error");
    }
  });

  // Modal 5: WhatsApp message copy and share
  whatsappDaySelect.addEventListener("change", () => {
    generateWhatsappReport();
  });
  
  btnCopyWhatsapp.addEventListener("click", () => {
    whatsappTextarea.select();
    document.execCommand("copy");
    addToast("Mensaje copiado al portapapeles.");
  });

  btnSendWhatsappAll.addEventListener("click", () => {
    const text = whatsappTextarea.value;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  });

  // Modal 6: Referees by day trigger
  btnRefereesByDay.addEventListener("click", openRefereesByDay);

  // Modal 7: Comparative Weekend trigger
  btnWeekendComparative.addEventListener("click", () => {
    // Fill default dates: Saturday/Sunday of last weekend & current weekend
    const now = new Date();
    
    // This weekend
    const thisSat = new Date(now);
    thisSat.setDate(now.getDate() + ((6 - now.getDay() + 7) % 7));
    const thisSun = new Date(thisSat);
    thisSun.setDate(thisSat.getDate() + 1);

    // Last weekend
    const lastSat = new Date(thisSat);
    lastSat.setDate(thisSat.getDate() - 7);
    const lastSun = new Date(lastSat);
    lastSun.setDate(lastSat.getDate() + 1);

    compLastSat.value = getLocalDateString(lastSat);
    compLastSun.value = getLocalDateString(lastSun);
    compThisSat.value = getLocalDateString(thisSat);
    compThisSun.value = getLocalDateString(thisSun);

    weekendComparativeModal.classList.remove("hidden");
  });

  btnCompGenerate.addEventListener("click", generateComparativeReport);

  // Topbar Share WhatsApp trigger
  btnWhatsappShareAll.addEventListener("click", () => {
    generateWhatsappReport();
    whatsappModal.classList.remove("hidden");
  });

  // Initial data loading
  async function fetchInitialData(force = false) {
    try {
      // 1. Fetch Arbitros
      let cachedRefs = sessionStorage.getItem("cached_arbitros");
      if (cachedRefs && !force) {
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
      if (cachedCanchas && cachedCanchas.length > 0 && !force) {
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

      // 3. Fetch Designaciones
      const cacheKey = "cached_ultimas_designaciones";
      const cachedDesig = sessionStorage.getItem(cacheKey);

      let data = [];
      if (cachedDesig && !force) {
        data = JSON.parse(cachedDesig);
      } else {
        const res = await designacionService.ultimasDesignaciones();
        data = Array.isArray(res) ? res : res.content || [];
        sessionStorage.setItem(cacheKey, JSON.stringify(data));
      }

      allDesignaciones = data;
      
      // Parse state maps and lists
      const incompletas = [];
      const completas = [];
      const finalizadas = [];
      const canceladas = [];
      const aconfirmar = [];

      for (const d of data) {
        const rawState = d.estadoDesignacion !== undefined ? d.estadoDesignacion : d.estado;
        let numericState = 0;
        if (typeof rawState === "string") {
          const lower = rawState.toLowerCase();
          if (lower.includes("incompleta") || lower === "0") numericState = 0;
          else if (lower.includes("completa") || lower === "1") numericState = 1;
          else if (lower.includes("finalizada") || lower === "2") numericState = 2;
          else if (lower.includes("cancelada") || lower === "3") numericState = 3;
          else if (lower.includes("suspendida") || lower === "4") numericState = 4;
        } else {
          numericState = parseInt(rawState || 0);
        }
        
        d.estadoDesignacion = numericState;

        // Extract assignments
        const id = d.idDesignacion || d.id;
        const assigned = d.arbitrosDesignados || d.arbitros || [];
        if (assigned.length > 0) {
          state.arbitrosDesignadosMap[id] = assigned;
        }

        // Split lists
        if (numericState === 0) incompletas.push(d);
        else if (numericState === 1) completas.push(d);
        else if (numericState === 2) finalizadas.push(d);
        else if (numericState === 3 || numericState === 4) canceladas.push(d);
        else incompletas.push(d);
      }

      state.designacionesIncompletas = incompletas;
      state.designaciones = completas;
      state.designacionesCanceladas = canceladas;
      state.designacionesFinalizadas = finalizadas;
      state.designacionesAConfirmar = aconfirmar; // backend specific confirmation if any
      
      updateState("designacionesIncompletas", incompletas);
      updateState("designaciones", completas);
      updateState("designacionesCanceladas", canceladas);
      updateState("designacionesFinalizadas", finalizadas);
      updateState("designacionesAConfirmar", aconfirmar);

      renderAll();
    } catch (err) {
      console.error(err);
      addToast("Error al cargar datos de designaciones.", "error");
    }
  }

  function updateDesignationCacheWithReferees(id, refs) {
    const cacheKey = "cached_ultimas_designaciones";
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        const data = JSON.parse(cached);
        const updated = data.map(item => {
          const itemId = item.idDesignacion || item.id;
          if (itemId === id) {
            return { ...item, arbitrosDesignados: refs, arbitros: refs };
          }
          return item;
        });
        sessionStorage.setItem(cacheKey, JSON.stringify(updated));
      } catch (e) {
        console.error("Error updating designations cache:", e);
      }
    }
  }

  // Render designations lists
  function renderAll() {
    const incompletas = state.designacionesIncompletas || [];
    const completas = state.designaciones || [];
    const aconfirmar = state.designacionesAConfirmar || [];
    const canceladas = state.designacionesCanceladas || [];
    const finalizadas = state.designacionesFinalizadas || [];

    const hasAny = incompletas.length > 0 || completas.length > 0 || aconfirmar.length > 0 || canceladas.length > 0 || finalizadas.length > 0;
    
    if (!hasAny) {
      designationsEmpty.classList.remove("hidden");
      designationsContainer.classList.add("hidden");
      return;
    }

    designationsEmpty.classList.add("hidden");
    designationsContainer.classList.remove("hidden");

    // Helper search filter check
    const filterFn = (d) => {
      if (!filterSearchQuery) return true;
      const assigned = state.arbitrosDesignadosMap[d.idDesignacion || d.id] || [];
      return assigned.some(asg => {
        const name = `${asg.arbitro?.nombre || asg.nombre || ""} ${asg.arbitro?.apellido || asg.apellido || ""}`.toLowerCase();
        return name.includes(filterSearchQuery);
      });
    };

    // 1. Incompletas
    const filteredInc = incompletas.filter(filterFn);
    countIncompletas.textContent = filteredInc.length;
    if (filteredInc.length > 0) {
      sectionIncompletas.classList.remove("hidden");
      renderGrid(gridIncompletas, filteredInc, "incompleta");
    } else {
      sectionIncompletas.classList.add("hidden");
    }

    // 2. Completas
    const filteredComp = completas.filter(filterFn);
    countCompletas.textContent = filteredComp.length;
    if (filteredComp.length > 0) {
      sectionCompletas.classList.remove("hidden");
      renderGrid(gridCompletas, filteredComp, "completa");
    } else {
      sectionCompletas.classList.add("hidden");
    }

    // 3. A Confirmar
    const filteredAConf = aconfirmar.filter(filterFn);
    if (filteredAConf.length > 0) {
      sectionAconfirmar.classList.remove("hidden");
      renderGrid(gridAconfirmar, filteredAConf, "aconfirmar");
    } else {
      sectionAconfirmar.classList.add("hidden");
    }

    // 4. Canceladas
    const filteredCanc = canceladas.filter(filterFn);
    if (filteredCanc.length > 0) {
      sectionCanceladas.classList.remove("hidden");
      renderGrid(gridCanceladas, filteredCanc, "cancelada");
    } else {
      sectionCanceladas.classList.add("hidden");
    }

    // 5. Finalizadas
    const filteredFin = finalizadas.filter(filterFn);
    countFinalizadas.textContent = filteredFin.length;
    if (filteredFin.length > 0) {
      sectionFinalizadas.classList.remove("hidden");
      renderGrid(gridFinalizadas, filteredFin, "finalizada");
    } else {
      sectionFinalizadas.classList.add("hidden");
    }

    // Show or hide whatsapp share button
    btnWhatsappShareAll.disabled = filteredComp.length === 0;
  }

  // Render a specific list grid
  function renderGrid(container, list, listType) {
    container.innerHTML = "";
    
    // Sort chronological: oldest to newest
    const sorted = [...list].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

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

      // Draw assigned list HTML (always render the wrapper, hidden initially, container populated dynamically)
      const assignedRefereesHTML = `
        <div class="assigned-section hidden mt-3 p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
          <div class="text-[10px] font-bold text-slate-400 mb-1.5 uppercase flex items-center gap-1"><i class="ti ti-users"></i> Árbitros Asignados:</div>
          <div class="assigned-referees-container flex flex-col gap-1"></div>
        </div>
      `;

      // Create Actions buttons
      let actionButtons = "";
      if (isMutable) {
        // Asignar autom. (Sparkles)
        actionButtons += `
          <button class="btn btn-sparkles-des btn-xs" style="padding: 5px 8px; border-color: #bcd1e6; color: #185fa5; background: #f6fafd;" title="${assignedCount > 0 ? 'Reasignar árbitros' : 'Asignar automáticamente'}">
            <i class="ti ti-sparkles text-amber-500"></i>
            <span class="text-[10px] ml-0.5 font-bold">${assignedCount > 0 ? 'Reasignar' : 'Asignar Autom.'}</span>
          </button>
        `;
        
        // Editar árbitros (People)
        actionButtons += `
          <button class="btn btn-people-des btn-xs" style="padding: 5px 8px; border-color: #a7f3d0; color: #047857; background: #ecfdf5;" title="Editar árbitros manualmente">
            <i class="ti ti-users"></i>
            <span class="text-[10px] ml-0.5 font-bold">Editar Árbitros</span>
          </button>
        `;

        // Editar designación parámetros
        actionButtons += `
          <button class="btn btn-edit-des btn-xs" style="padding: 5px 8px;" title="Editar parámetros">
            <i class="ti ti-edit text-slate-600"></i>
            <span class="text-[10px] ml-0.5 font-bold">Editar</span>
          </button>
        `;
      }

      // Aceptar (Only for Pendiente 0 and assignedCount >= minReq)
      if (d.estadoDesignacion === 0 && assignedCount >= minReq) {
        actionButtons += `
          <button class="btn btn-accept-des btn-xs" style="padding: 5px 8px; border-color: #10b981; color: #0f6e56; background-color: #ecfdf5;" title="Aceptar designación">
            <i class="ti ti-check text-emerald-600"></i>
            <span class="text-[10px] ml-0.5 font-bold">Aceptar</span>
          </button>
        `;
      }

      // Finalizar, Suspender, Cancelar (Only for Completa 1)
      if (d.estadoDesignacion === 1) {
        actionButtons += `
          <button class="btn btn-finish-des btn-xs" style="padding: 5px 8px; border-color: #0f6e56; color: #0f6e56; background-color: #f0fdf4;" title="Finalizar Jornada">
            <i class="ti ti-flag"></i>
            <span class="text-[10px] ml-0.5 font-bold">Finalizar</span>
          </button>
          <button class="btn btn-suspend-des btn-xs" style="padding: 5px 8px; border-color: #7c3aed; color: #7c3aed; background-color: #f5f3ff;" title="Suspender Jornada">
            <i class="ti ti-player-pause"></i>
            <span class="text-[10px] ml-0.5 font-bold">Suspender</span>
          </button>
          <button class="btn btn-cancel-des btn-xs danger" style="padding: 5px 8px;" title="Cancelar Jornada">
            <i class="ti ti-ban"></i>
            <span class="text-[10px] ml-0.5 font-bold">Cancelar</span>
          </button>
        `;
      }

      // Compartir WhatsApp (Only for Pendiente 0 with enough refs OR Completa 1)
      if ((d.estadoDesignacion === 0 && assignedCount >= minReq) || d.estadoDesignacion === 1) {
        actionButtons += `
          <button class="btn btn-share-des btn-xs" style="padding: 5px 8px; border-color: #25d366; color: #15803d; background-color: #f0fdf4;" title="Compartir WhatsApp">
            <i class="ti ti-brand-whatsapp"></i>
            <span class="text-[10px] ml-0.5 font-bold">Compartir</span>
          </button>
        `;
      }

      // Reprogramar (Only for Cancelada 3 or Suspendida 4)
      if (d.estadoDesignacion === 3 || d.estadoDesignacion === 4) {
        actionButtons += `
          <button class="btn btn-reprogram-des btn-xs" style="padding: 5px 8px; border-color: #f59e0b; color: #d97706; background-color: #fffbeb;" title="Reprogramar Jornada">
            <i class="ti ti-reload"></i>
            <span class="text-[10px] ml-0.5 font-bold">Reprogramar</span>
          </button>
        `;
      }

      // Actualizar Aranceles (Only for Finalizada 2)
      if (d.estadoDesignacion === 2) {
        actionButtons += `
          <button class="btn btn-dollar-des btn-xs" style="padding: 5px 8px; border-color: #3b82f6; color: #1d4ed8; background-color: #eff6ff;" title="Actualizar Aranceles">
            <i class="ti ti-currency-dollar"></i>
            <span class="text-[10px] ml-0.5 font-bold">Aranceles</span>
          </button>
        `;
      }

      // Ver Detalle (if has observations)
      if (d.detalleDesignacion || d.detalle) {
        actionButtons += `
          <button class="btn btn-detail-des btn-xs" style="padding: 5px 8px; border-color: #cbd5e1; color: #475569;" title="Ver Observaciones">
            <i class="ti ti-info-circle"></i>
            <span class="text-[10px] ml-0.5 font-bold">Ver Detalle</span>
          </button>
        `;
      }

      // Eliminar (For Pendiente 0 and Completa 1)
      if (d.estadoDesignacion === 0 || d.estadoDesignacion === 1) {
        actionButtons += `
          <button class="btn btn-delete-des btn-xs danger" style="padding: 5px 8px;" title="Eliminar definitivamente">
            <i class="ti ti-trash"></i>
          </button>
        `;
      }

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
        const container = card.querySelector(".assigned-referees-container");

        // Helper to draw the list of referees
        const drawReferees = (refs) => {
          container.innerHTML = "";
          if (!refs || refs.length === 0) {
            container.innerHTML = `
              <div class="text-[10px] text-slate-400 text-center py-2 border border-dashed border-slate-200 rounded-lg">
                Sin árbitros asignados actualmente
              </div>
            `;
            return;
          }
          // Sort by role principal -> assistants
          const orderRoles = { "Árbitro Principal": 1, "Árbitro Asistente 1": 2, "Árbitro Asistente 2": 3, "Cuarto Árbitro": 4, VAR: 5, "Asistente VAR": 6 };
          const sortedAsg = [...refs].sort((a,b) => (orderRoles[a.arbitro?.rol] || 99) - (orderRoles[b.arbitro?.rol] || 99));

          container.innerHTML = sortedAsg.map(asg => `
            <div class="text-[11px] py-1 px-2 bg-white border border-slate-100 rounded-lg flex items-center justify-between">
              <span class="font-semibold text-slate-700 truncate">${asg.arbitro?.nombre || asg.nombre} ${asg.arbitro?.apellido || asg.apellido}</span>
              <div class="flex gap-1.5 flex-shrink-0 items-center">
                <span class="badge bg-slate-100 text-slate-600 px-1 py-0.5 rounded text-[8px] font-bold">${asg.arbitro?.rol || asg.rol || "Principal"}</span>
                <span class="text-[9px] text-slate-400 font-medium">${asg.partidosDirigidos || 0} part.</span>
              </div>
            </div>
          `).join("");
        };

        // If referees are already cached, pre-draw them
        const cachedRefs = state.arbitrosDesignadosMap[id];
        if (cachedRefs) {
          drawReferees(cachedRefs);
        }

        toggleAssignedBtn.addEventListener("click", async () => {
          const isHidden = section.classList.contains("hidden");
          if (isHidden) {
            section.classList.remove("hidden");
            toggleAssignedBtn.querySelector("span").textContent = "Ocultar árbitros asignados";
            toggleAssignedBtn.querySelector("i").className = "ti ti-eye-off";

            // Always fetch fresh or if not loaded yet
            const currentRefs = state.arbitrosDesignadosMap[id];
            if (!currentRefs || currentRefs.length === 0) {
              container.innerHTML = `
                <div class="text-[10px] text-slate-400 text-center py-2 flex justify-center items-center gap-1.5">
                  <i class="ti ti-loader spin-icon text-emerald-600"></i>
                  <span>Obteniendo árbitros...</span>
                </div>
              `;
              try {
                const fetchedRefs = await designacionService.getDesignados(id);
                const refsList = Array.isArray(fetchedRefs) ? fetchedRefs : [];
                state.arbitrosDesignadosMap[id] = refsList;
                updateState("arbitrosDesignadosMap", state.arbitrosDesignadosMap);
                
                // Update Cache in sessionStorage
                updateDesignationCacheWithReferees(id, refsList);
                
                drawReferees(refsList);
              } catch (e) {
                console.error("Error al obtener árbitros:", e);
                container.innerHTML = `
                  <div class="text-[10px] text-rose-500 text-center py-2">
                    Fallo al cargar árbitros.
                  </div>
                `;
              }
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
            await fetchInitialData(true);
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

      // Accept designation
      const acceptBtn = card.querySelector(".btn-accept-des");
      if (acceptBtn) {
        acceptBtn.addEventListener("click", async () => {
          acceptBtn.disabled = true;
          try {
            await designacionService.aceptarDesignacion(id);
            addToast("Designación aceptada con éxito.");
            await fetchInitialData(true);
          } catch (err) {
            console.error(err);
            addToast("Error al aceptar la designación.", "error");
          } finally {
            acceptBtn.disabled = false;
          }
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
            await fetchInitialData(true);
          } catch (err) {
            console.error(err);
            addToast("Error al finalizar la designación.", "error");
          }
        });
      }

      // Suspend designation
      const suspendBtn = card.querySelector(".btn-suspend-des");
      if (suspendBtn) {
        suspendBtn.addEventListener("click", async () => {
          const obs = prompt("Ingrese observaciones/motivo de la suspensión (opcional):", d.detalle || d.detalleDesignacion || "");
          if (obs === null) return; // user cancelled prompt
          suspendBtn.disabled = true;
          try {
            const dto = {
              idCancha: c ? c.id : null,
              fecha: d.fecha,
              cantidadPartidos: d.cantidadPartidos,
              etapaCampeonato: d.etapaCampeonato,
              detalle: obs.trim(),
              estadoDesignacion: 4 // Suspendida
            };
            await designacionService.actualizarDesignacion(id, dto);
            addToast("Jornada suspendida con éxito.");
            await fetchInitialData(true);
          } catch (err) {
            console.error(err);
            addToast("Fallo al suspender la jornada.", "error");
          } finally {
            suspendBtn.disabled = false;
          }
        });
      }
 
      // Cancel designation
      const cancelBtn = card.querySelector(".btn-cancel-des");
      if (cancelBtn) {
        cancelBtn.addEventListener("click", async () => {
          const reason = prompt("Ingrese el motivo de la cancelación/suspensión:");
          if (reason === null) return; // cancelled prompt
          try {
            await designacionService.cancelarDesignacion(id, reason.trim());
            addToast("Designación cancelada con éxito.");
            await fetchInitialData(true);
          } catch (err) {
            console.error(err);
            addToast("Error al cancelar la designación.", "error");
          }
        });
      }

      // Share WhatsApp (Individual)
      const shareBtn = card.querySelector(".btn-share-des");
      if (shareBtn) {
        shareBtn.addEventListener("click", () => {
          // Prefill text with single designation format
          const dateObj = new Date(d.fecha);
          const hh = String(dateObj.getHours()).padStart(2, "0");
          const min = String(dateObj.getMinutes()).padStart(2, "0");
          const timeStr = min === "00" ? `${hh}hs` : `${hh}:${min}hs`;
          
          let text = `📢 *DESIGNACIÓN INDIVIDUAL DE ÁRBITRO*\n\n`;
          text += `• *${canchaName}*\n`;
          text += `📅 Fecha: *${formatFecha(d.fecha)}* (${timeStr} - ${d.cantidadPartidos} partidos)\n`;
          text += `🏆 Etapa: *${d.etapaCampeonato || "FECHA_NORMAL"}*\n`;

          if (assigned.length === 0) {
            text += `_Sin árbitros asignados_\n`;
          } else {
            text += `👥 Árbitros Asignados:\n`;
            assigned.forEach(asg => {
              const arb = asg.arbitro || asg;
              text += `  - ${arb.nombre} ${arb.apellido} (${arb.rol || "Árbitro"})\n`;
            });
          }
          text += `\n⚠️ *Confirmar asistencia respondiendo este mensaje.* ¡Muchas gracias y buen partido! ⚽`;

          whatsappTextarea.value = text;
          whatsappModal.classList.remove("hidden");
        });
      }
 
      // Reprogram designation
      const reprogramBtn = card.querySelector(".btn-reprogram-des");
      if (reprogramBtn) {
        reprogramBtn.addEventListener("click", async () => {
          // Calculate +7 days date string for display
          const dateObj = new Date(d.fecha.replace(" ", "T"));
          dateObj.setDate(dateObj.getDate() + 7);
          const dayVal = String(dateObj.getDate()).padStart(2, "0");
          const monthVal = String(dateObj.getMonth() + 1).padStart(2, "0");
          const yearVal = dateObj.getFullYear();
          const hoursVal = String(dateObj.getHours()).padStart(2, "0");
          const minutesVal = String(dateObj.getMinutes()).padStart(2, "0");
          const newDateStr = `${dayVal}/${monthVal}/${yearVal} a las ${hoursVal}:${minutesVal} hs`;

          const confirmMsg = `⚠️ AVISO DE REPROGRAMACIÓN:\n\nLa designación se reprogramará automáticamente para dentro de 7 días:\n📅 Nueva fecha: ${newDateStr}\n\n¿Confirmar reprogramación?`;
          if (!confirm(confirmMsg)) return;

          reprogramBtn.disabled = true;
          try {
            await designacionService.reprogramarDesignacion(id);
            addToast("Designación reprogramada con éxito.");
            await fetchInitialData(true);
          } catch (err) {
            console.error(err);
            addToast("Error al reprogramar la designación.", "error");
          } finally {
            reprogramBtn.disabled = false;
          }
        });
      }

      // View detail/observations
      const detailBtn = card.querySelector(".btn-detail-des");
      if (detailBtn) {
        detailBtn.addEventListener("click", () => {
          const detailText = document.getElementById("designation-detail-text");
          detailText.textContent = d.detalle || d.detalleDesignacion || "Sin observaciones registradas.";
          document.getElementById("designation-detail-modal").classList.remove("hidden");
        });
      }
 
      // Delete designation
      const deleteBtn = card.querySelector(".btn-delete-des");
      if (deleteBtn) {
        deleteBtn.addEventListener("click", async () => {
          if (!confirm("¿Eliminar definitivamente esta designación de los registros? Esta acción no se puede deshacer.")) return;
          try {
            await designacionService.deleteDesignacion(id);
            addToast("Designación eliminada con éxito.");
            await fetchInitialData(true);
          } catch (err) {
            console.error(err);
            addToast("Error al eliminar la designación.", "error");
          }
        });
      }
      container.appendChild(card);
    });
  }

  // Open designation creator Wizard
  function openWizard() {
    // Populate Canchas select in step 1
    wizardCancha.innerHTML = '<option value="" disabled selected>Seleccione una cancha...</option>';
    const sortedCanchas = [...allCanchas].filter(c => c.estado !== false).sort((a,b) => a.nombre.localeCompare(b.nombre));
    sortedCanchas.forEach(c => {
      const option = document.createElement("option");
      option.value = c.id;
      option.textContent = `${c.nombre} (${c.ciudad || "Rosario"})`;
      wizardCancha.appendChild(option);
    });

    wizardCanchaInfo.classList.add("hidden");
    wizardBtnStep1Next.disabled = true;

    // Reset steps
    manualStep1.classList.remove("hidden");
    manualStep2.classList.add("hidden");

    // Reset Tab
    wizardTabManual.click();

    wizardModal.classList.remove("hidden");
  }

  // Create manual designation
  async function createDesignationManual() {
    const canchaId = parseInt(wizardCancha.value);
    
    let formattedFecha = wizardFecha.value;
    if (formattedFecha && !formattedFecha.includes("T")) {
      formattedFecha = formattedFecha + "T00:00:00";
    } else if (formattedFecha && formattedFecha.includes("T") && formattedFecha.split(":").length === 2) {
      formattedFecha = formattedFecha + ":00";
    }

    const dto = {
      idCancha: canchaId,
      fecha: formattedFecha,
      cantidadPartidos: parseInt(wizardCantidad.value),
      etapaCampeonato: wizardEtapa.value,
      detalle: "",
      editable: true,
      estadoDesignacion: 0,
    };

    try {
      await designacionService.createDesignacion(dto);
      addToast("Designación creada con éxito.");
      wizardModal.classList.add("hidden");
      await fetchInitialData(true);
    } catch (err) {
      console.error(err);
      addToast("Error al crear la designación.", "error");
    }
  }

  // Load last weekend designations for import clone
  async function loadPastWeekendDesignations() {
    cloneLoader.classList.remove("hidden");
    cloneEmpty.classList.add("hidden");
    cloneListWrapper.classList.add("hidden");
    wizardBtnCloneSubmit.disabled = true;

    // Calculate last weekend sat/sun dates
    const now = new Date();
    const day = now.getDay();
    const daysToSaturday = day + 1; // Sat was days ago

    const satDate = new Date(now);
    satDate.setDate(now.getDate() - daysToSaturday);
    const sunDate = new Date(satDate);
    sunDate.setDate(satDate.getDate() + 1);

    const satStr = getLocalDateString(satDate);
    const sunStr = getLocalDateString(sunDate);

    lastWeekendRange = { saturday: satStr, sunday: sunStr };
    
    // Format simple text Sat DD/MM to Sun DD/MM
    const fmtSimple = (str) => {
      const parts = str.split("-");
      return parts.length === 3 ? `${parts[2]}/${parts[1]}` : str;
    };
    cloneRangeDate.textContent = `${fmtSimple(satStr)} al ${fmtSimple(sunStr)}`;

    try {
      const data = await designacionService.buscarPorRango(satStr, sunStr);
      // Filter finished (state 2) only
      pastDesignationsList = (data || []).filter(d => {
        const rawState = d.estadoDesignacion !== undefined ? d.estadoDesignacion : d.estado;
        return parseInt(rawState) === 2;
      });

      cloneLoader.classList.add("hidden");

      if (pastDesignationsList.length === 0) {
        cloneEmpty.classList.remove("hidden");
      } else {
        cloneSelectedIds = pastDesignationsList.map(d => d.idDesignacion || d.id);
        
        renderCloneList();
        updateCloneSelectionHTML();
        cloneListWrapper.classList.remove("hidden");
        wizardBtnCloneSubmit.disabled = false;
      }
    } catch (err) {
      console.error(err);
      cloneLoader.classList.add("hidden");
      addToast("Error al buscar designaciones del fin de semana pasado.", "error");
    }
  }

  // Draw list to clone
  function renderCloneList() {
    cloneList.innerHTML = "";
    
    pastDesignationsList.forEach(d => {
      const id = d.idDesignacion || d.id;
      const c = allCanchas.find(item => item.id === (d.idCancha || d.canchaId || (d.cancha ? (d.cancha.idCancha || d.cancha.id) : null)));
      const name = c ? c.nombre : "Cancha Desconocida";
      
      // Calculate shifted new date (original + 7 days)
      const dateObj = new Date(d.fecha);
      dateObj.setDate(dateObj.getDate() + 7);
      
      const formatTime = (dateObj) => {
        const hh = String(dateObj.getHours()).padStart(2, "0");
        const min = String(dateObj.getMinutes()).padStart(2, "0");
        return min === "00" ? `${hh}hs` : `${hh}:${min}hs`;
      };
      
      const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
      const originalLabel = `${days[new Date(d.fecha).getDay()]} ${new Date(d.fecha).getDate()}/${new Date(d.fecha).getMonth()+1}`;
      const newLabel = `${days[dateObj.getDay()]} ${dateObj.getDate()}/${dateObj.getMonth()+1} a las ${formatTime(dateObj)}`;

      const isSelected = cloneSelectedIds.includes(id);
      
      const item = document.createElement("div");
      item.className = `p-3 border rounded-xl flex gap-3 items-start cursor-pointer transition ${isSelected ? 'border-emerald-600 bg-emerald-50/20' : 'border-slate-200 bg-slate-50'}`;
      item.innerHTML = `
        <input type="checkbox" class="mt-1" ${isSelected ? 'checked' : ''}>
        <div class="flex-1 min-w-0 text-xs">
          <div class="font-bold text-slate-800 flex items-center gap-1">🏟️ ${name}</div>
          <div class="text-[10px] text-slate-400 mt-1">Original: <span class="line-through">${originalLabel}</span></div>
          <div class="text-[10px] text-emerald-700 font-bold mt-0.5">Nueva fecha: <span>${newLabel}</span></div>
          <div class="flex gap-2 mt-2 text-[9px] text-slate-400 font-bold">
            <span class="bg-slate-200/50 px-1.5 py-0.5 rounded">⚽ ${d.cantidadPartidos} partidos</span>
            <span class="bg-slate-200/50 px-1.5 py-0.5 rounded">🏆 ${d.etapaCampeonato || "FECHA_NORMAL"}</span>
          </div>
        </div>
      `;

      item.addEventListener("click", (e) => {
        if (e.target.tagName === "INPUT") return;
        const input = item.querySelector("input");
        input.checked = !input.checked;
        toggleCloneItemSelection(id, input.checked);
      });

      item.querySelector("input").addEventListener("change", (e) => {
        toggleCloneItemSelection(id, e.target.checked);
      });

      cloneList.appendChild(item);
    });
  }

  function toggleCloneItemSelection(id, isSelected) {
    if (isSelected) {
      if (!cloneSelectedIds.includes(id)) cloneSelectedIds.push(id);
    } else {
      cloneSelectedIds = cloneSelectedIds.filter(itemId => itemId !== id);
    }
    updateCloneSelectionHTML();
    renderCloneList(); // re-draw classes
  }

  function updateCloneSelectionHTML() {
    cloneSelectCount.textContent = cloneSelectedIds.length;
    cloneSelectAll.checked = pastDesignationsList.length > 0 && cloneSelectedIds.length === pastDesignationsList.length;
    wizardBtnCloneSubmit.disabled = cloneSelectedIds.length === 0;
  }

  // Run clone import cloning designaciones
  async function importDesignationsClone() {
    const toClone = pastDesignationsList.filter(d => cloneSelectedIds.includes(d.idDesignacion || d.id));
    if (toClone.length === 0) return;

    wizardBtnCloneSubmit.disabled = true;
    wizardBtnCloneSubmit.innerHTML = `<i class="ti ti-loader spin-icon"></i> <span>Clonando...</span>`;

    const promises = toClone.map(d => {
      // shift date + 7 days
      const dateObj = new Date(d.fecha);
      dateObj.setDate(dateObj.getDate() + 7);
      
      const yyyy = dateObj.getFullYear();
      const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
      const dd = String(dateObj.getDate()).padStart(2, "0");
      const hh = String(dateObj.getHours()).padStart(2, "0");
      const min = String(dateObj.getMinutes()).padStart(2, "0");
      const ss = String(dateObj.getSeconds()).padStart(2, "0");
      const newFecha = `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}`;

      const idCancha = d.idCancha || d.canchaId || (d.cancha ? (d.cancha.idCancha || d.cancha.id) : null);

      const dto = {
        idCancha,
        fecha: newFecha,
        cantidadPartidos: d.cantidadPartidos,
        etapaCampeonato: d.etapaCampeonato || "FECHA_NORMAL",
        detalle: d.detalle || "",
        editable: true,
        estadoDesignacion: 0,
      };

      return designacionService.createDesignacion(dto);
    });

    try {
      await Promise.all(promises);
      addToast("Designaciones clonadas con éxito.");
      wizardModal.classList.add("hidden");
      await fetchInitialData(true);
    } catch (err) {
      console.error(err);
      addToast("Hubo un error al clonar algunas designaciones.", "error");
    } finally {
      wizardBtnCloneSubmit.disabled = false;
      wizardBtnCloneSubmit.innerHTML = `<i class="ti ti-download"></i> <span>Importar seleccionadas</span>`;
    }
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

    const d = allDesignaciones.find(item => (item.idDesignacion || item.id) === id);
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
      const d = allDesignaciones.find(item => (item.idDesignacion || item.id) === id);
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
    const d = allDesignaciones.find(item => (item.idDesignacion || item.id) === id);
    if (!d) return;

    // Filter available referees by general availability, category etc
    // Exclude referees already assigned to THIS designation
    const assignedIds = manageAssignedList.map(asg => asg.arbitro?.idArbitro || asg.idArbitro || asg.arbitro?.id || asg.id);

    // Build set of referee IDs busy on the same day (assigned to OTHER designations on a different court)
    const targetDateStr = d.fecha ? d.fecha.split("T")[0] : "";
    const targetCanchaId = d.idCancha || d.canchaId || (d.cancha ? (d.cancha.idCancha || d.cancha.id) : null);
    const busyOnSameDayIds = new Set();

    if (targetDateStr) {
      for (const otherD of allDesignaciones) {
        const otherId = otherD.idDesignacion || otherD.id;
        if (otherId === id) continue; // skip current designation
        const otherDateStr = otherD.fecha ? otherD.fecha.split("T")[0] : "";
        if (otherDateStr !== targetDateStr) continue; // different day
        const otherCanchaId = otherD.idCancha || otherD.canchaId || (otherD.cancha ? (otherD.cancha.idCancha || otherD.cancha.id) : null);
        if (String(otherCanchaId) === String(targetCanchaId)) continue; // same court is fine
        const otherAssigned = state.arbitrosDesignadosMap[otherId] || [];
        for (const asg of otherAssigned) {
          const arbId = asg.arbitro?.idArbitro || asg.idArbitro;
          if (arbId) busyOnSameDayIds.add(arbId);
        }
      }
    }

    const isSat = getDayOfWeekLocal(d.fecha) === 6;
    const isSun = getDayOfWeekLocal(d.fecha) === 0;
    const dayFilterChecked = manageFilterByDay.checked;

    const available = allArbitros.filter(arb => {
      // active in system
      if (arb.estadoSistema === false) return false;
      // not already assigned to this designation
      if (assignedIds.includes(arb.idArbitro)) return false;
      // not busy on same day at a different court
      if (busyOnSameDayIds.has(arb.idArbitro)) return false;
      
      // Filter by day availability if enabled
      if (dayFilterChecked) {
        if (isSat && !arb.disponibleSabado) return false;
        if (isSun && !arb.disponibleDomingo) return false;
      }

      return true;
    });

    // Populate Available Select dropdown
    manageAvailableSelect.innerHTML = '<option value="" disabled selected>Selecciona un árbitro disponible...</option>';
    
    // Sort category elite -> inicial, then alphabetical name
    const orderCat = { AVANZADO: 1, INTERMEDIO: 2, PRINCIPAL_1: 3, PRINCIPAL_2: 4, PRINCIPAL_3: 5, PRINCIPAL_4: 6, ASISTENTE: 7, INCIAL: 8 };
    
    const sorted = [...available].sort((a,b) => {
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
      await fetchInitialData(true);
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

    // Warnings verify: check if assigned to different court on same day
    const arb = allArbitros.find(a => a.idArbitro === idArbitro);
    const targetDes = allDesignaciones.find(item => (item.idDesignacion || item.id) === idDesignacion);

    const isAssignedElsewhere = isRefereeAssignedToDifferentCourtOnSameDay(idArbitro, targetDes);
    if (isAssignedElsewhere) {
      if (!confirm(`⚠️ Advertencia: ${arb.nombre} ${arb.apellido} ya está asignado a otra cancha en esta misma fecha. ¿Deseas asignarlo igualmente?`)) {
        btnAssignReferee.disabled = false;
        btnAssignReferee.textContent = "Asignar";
        return;
      }
    }

    try {
      await designacionService.asignarArbitroManual(idDesignacion, idArbitro);
      addToast("Árbitro asignado con éxito.");
      manageAvailableSelect.value = "";
      await fetchAssignedReferees(idDesignacion);
      await fetchInitialData(true);
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

  // Check double assignment helper
  function isRefereeAssignedToDifferentCourtOnSameDay(idArbitro, targetDes) {
    const targetDateStr = targetDes.fecha ? targetDes.fecha.split("T")[0] : "";
    const targetCanchaId = targetDes.idCancha || targetDes.canchaId || (targetDes.cancha ? (targetDes.cancha.idCancha || targetDes.cancha.id) : null);

    if (!targetDateStr) return false;

    for (const otherD of allDesignaciones) {
      const otherId = otherD.idDesignacion || otherD.id;
      const targetId = targetDes.idDesignacion || targetDes.id;
      
      if (otherId !== targetId) {
        const otherDateStr = otherD.fecha ? otherD.fecha.split("T")[0] : "";
        
        if (otherDateStr === targetDateStr) {
          const assigned = state.arbitrosDesignadosMap[otherId] || [];
          const isAssigned = assigned.some(asg => (asg.arbitro?.idArbitro || asg.idArbitro) === idArbitro);
          
          if (isAssigned) {
            const otherCanchaId = otherD.idCancha || otherD.canchaId || (otherD.cancha ? (otherD.cancha.idCancha || otherD.cancha.id) : null);
            if (String(otherCanchaId) !== String(targetCanchaId)) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  // Open Update Fees Modal
  async function openUpdateFeesModal(id) {
    feesDesignacionId.value = id;
    feesLoader.classList.remove("hidden");
    feesEmpty.classList.add("hidden");
    feesList.innerHTML = "";

    const d = allDesignaciones.find(item => (item.idDesignacion || item.id) === id);
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
              addToast("Ingrese un monto válido.", "error");
              return;
            }
            saveBtn.disabled = true;
            try {
              // designados ID is asg.idDesignados or asg.id
              const designadosId = asg.idDesignados || asg.id;
              await designadoService.actualizarMontoPercibido(designadosId, amount);
              addToast("Arancel del árbitro actualizado.");
              await fetchInitialData(true);
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

  // Generate WhatsApp Message report
  function generateWhatsappReport() {
    const day = whatsappDaySelect.value;
    const completas = state.designaciones || [];
    
    // Filter chronologically
    const sorted = [...completas].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

    let satList = [];
    let sunList = [];

    sorted.forEach(d => {
      const dayVal = getDayOfWeekLocal(d.fecha);
      if (dayVal === 0) sunList.push(d);
      else satList.push(d);
    });

    let text = `📢 *DESIGNACIONES DE ÁRBITROS*\n\n`;

    if (day === "both" || day === "saturday") {
      if (satList.length > 0) {
        text += `🗓️ *SÁBADO*\n`;
        text += buildWhatsAppDayText(satList);
        text += `\n`;
      }
    }

    if (day === "both" || day === "sunday") {
      if (sunList.length > 0) {
        text += `🗓️ *DOMINGO*\n`;
        text += buildWhatsAppDayText(sunList);
        text += `\n`;
      }
    }

    text += `⚠️ *Confirmar asistencia respondiendo este mensaje.* ¡Muchas gracias y buen partido! ⚽`;

    whatsappTextarea.value = text;
  }

  function buildWhatsAppDayText(list) {
    let str = "";
    list.forEach(d => {
      const c = allCanchas.find(item => item.id === (d.idCancha || d.canchaId || (d.cancha ? (d.cancha.idCancha || d.cancha.id) : null)));
      const name = c ? c.nombre : "Cancha Desconocida";
      
      const timeObj = new Date(d.fecha);
      const hh = String(timeObj.getHours()).padStart(2, "0");
      const min = String(timeObj.getMinutes()).padStart(2, "0");
      const time = min === "00" ? `${hh}hs` : `${hh}:${min}hs`;

      str += `• *${name}* (${time} - ${d.cantidadPartidos} part):\n`;

      const assigned = state.arbitrosDesignadosMap[d.idDesignacion || d.id] || [];
      if (assigned.length === 0) {
        str += `  _Sin árbitros asignados_\n`;
      } else {
        // Sort by role principal -> assistants
        const orderRoles = { "Árbitro Principal": 1, "Árbitro Asistente 1": 2, "Árbitro Asistente 2": 3, "Cuarto Árbitro": 4, VAR: 5, "Asistente VAR": 6 };
        const sortedAsg = [...assigned].sort((a,b) => (orderRoles[a.arbitro?.rol] || 99) - (orderRoles[b.arbitro?.rol] || 99));

        sortedAsg.forEach(asg => {
          const arb = asg.arbitro || asg;
          str += `  - ${arb.nombre} ${arb.apellido} (${arb.rol || "Árbitro"})\n`;
        });
      }
    });
    return str;
  }

  // Open Referees by Day list matrix
  function openRefereesByDay() {
    daySaturdayList.innerHTML = "";
    daySundayList.innerHTML = "";

    const completas = state.designaciones || [];
    const incompletas = state.designacionesIncompletas || [];
    const allActive = [...completas, ...incompletas];

    let satMap = new Map();
    let sunMap = new Map();

    allActive.forEach(d => {
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
      
      const sorted = [...map.values()].sort((a,b) => a.name.localeCompare(b.name));
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

  // Trigger comparative weekend report
  async function generateComparativeReport() {
    btnCompGenerate.disabled = true;
    btnCompGenerate.innerHTML = `<i class="ti ti-loader spin-icon"></i> <span>Procesando...</span>`;

    const lastRange = { saturday: compLastSat.value, sunday: compLastSun.value };
    const thisRange = { saturday: compThisSat.value, sunday: compThisSun.value };

    try {
      // 1. Fetch designations of last weekend
      const lastData = await designacionService.buscarPorRango(lastRange.saturday, lastRange.sunday);
      
      // 2. Fetch designations of this weekend
      const thisData = await designacionService.buscarPorRango(thisRange.saturday, thisRange.sunday);

      // Calculations: Repiten, Solo Pasado, Solo Este, details
      // Compile referees maps
      const getRefereesMap = async (list) => {
        const map = new Map();
        for (const d of list) {
          const id = d.idDesignacion || d.id;
          const rawState = d.estadoDesignacion !== undefined ? d.estadoDesignacion : d.estado;
          if (parseInt(rawState) === 3) continue; // skip cancelled

          const c = allCanchas.find(item => item.id === (d.idCancha || d.canchaId || (d.cancha ? (d.cancha.idCancha || d.cancha.id) : null)));
          const canchaName = c ? c.nombre : "Cancha";

          let assigned = state.arbitrosDesignadosMap[id];
          if (!assigned) {
            assigned = await designacionService.getArbitrosDesignados(id);
          }

          assigned.forEach(asg => {
            const arb = asg.arbitro || asg;
            const arbId = arb.idArbitro || arb.id;
            
            let info = map.get(arbId);
            if (!info) {
              info = {
                nombre: arb.nombre,
                apellido: arb.apellido,
                rol: arb.rol || asg.rol || "Principal",
                categoria: arb.categoria || "INCIAL",
                saturday: [],
                sunday: []
              };
              map.set(arbId, info);
            }

            const dayVal = getDayOfWeekLocal(d.fecha);
            const detailMatch = { cancha: canchaName, hora: d.fecha.split("T")[1]?.slice(0,5) || "00:00" };
            
            if (dayVal === 0) info.sunday.push(detailMatch);
            else info.saturday.push(detailMatch);
          });
        }
        return map;
      };

      const lastRefsMap = await getRefereesMap(lastData);
      const thisRefsMap = await getRefereesMap(thisData);

      const repitenAmbosSabDom = [];
      const repitenSabado = [];
      const repitenDomingo = [];
      const soloFindePasado = [];
      const soloEsteFinde = [];

      // Loop last weekend to classify
      lastRefsMap.forEach((lastInfo, id) => {
        const thisInfo = thisRefsMap.get(id);

        const lastSatCount = lastInfo.saturday.length;
        const lastSunCount = lastInfo.sunday.length;
        const lastTotal = lastSatCount + lastSunCount;

        const infoReport = {
          nombre: lastInfo.nombre,
          apellido: lastInfo.apellido,
          rol: lastInfo.rol,
          categoria: lastInfo.categoria,
          lastSaturday: lastInfo.saturday,
          lastSunday: lastInfo.sunday,
          lastWeekendCount: lastTotal,
          thisSaturday: [],
          thisSunday: [],
          thisWeekendCount: 0
        };

        if (thisInfo) {
          const thisSatCount = thisInfo.saturday.length;
          const thisSunCount = thisInfo.sunday.length;
          const thisTotal = thisSatCount + thisSunCount;

          infoReport.thisSaturday = thisInfo.saturday;
          infoReport.thisSunday = thisInfo.sunday;
          infoReport.thisWeekendCount = thisTotal;

          const workedLastSat = lastSatCount > 0;
          const workedLastSun = lastSunCount > 0;
          const workedThisSat = thisSatCount > 0;
          const workedThisSun = thisSunCount > 0;

          if (workedLastSat && workedLastSun && workedThisSat && workedThisSun) {
            repitenAmbosSabDom.push(infoReport);
          } else if (workedLastSat && workedThisSat) {
            repitenSabado.push(infoReport);
          } else if (workedLastSun && workedThisSun) {
            repitenDomingo.push(infoReport);
          } else {
            // Worked both, but in different days configuration
            repitenAmbosSabDom.push(infoReport);
          }
        } else {
          soloFindePasado.push(infoReport);
        }
      });

      // Loop this weekend to find solo este weekend
      thisRefsMap.forEach((thisInfo, id) => {
        if (!lastRefsMap.has(id)) {
          const thisSatCount = thisInfo.saturday.length;
          const thisSunCount = thisInfo.sunday.length;
          const thisTotal = thisSatCount + thisSunCount;

          soloEsteFinde.push({
            nombre: thisInfo.nombre,
            apellido: thisInfo.apellido,
            rol: thisInfo.rol,
            categoria: thisInfo.categoria,
            lastSaturday: [],
            lastSunday: [],
            lastWeekendCount: 0,
            thisSaturday: thisInfo.saturday,
            thisSunday: thisInfo.sunday,
            thisWeekendCount: thisTotal
          });
        }
      });

      // Invoke printable report helper
      printComparativaReport({
        datesLast: { saturday: lastRange.saturday, sunday: lastRange.sunday },
        datesThis: { saturday: thisRange.saturday, sunday: thisRange.sunday },
        repitenAmbosSabDom,
        repitenSabado,
        repitenDomingo,
        soloFindePasado,
        soloEsteFinde
      });

      weekendComparativeModal.classList.add("hidden");
    } catch (err) {
      console.error(err);
      addToast("Error al procesar el informe de comparación.", "error");
    } finally {
      btnCompGenerate.disabled = false;
      btnCompGenerate.innerHTML = `<i class="ti ti-printer"></i> <span>Generar Reporte</span>`;
    }
  }
});
