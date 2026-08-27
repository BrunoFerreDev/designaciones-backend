import designacionService from "../services/designacionService.js";
import arbitroService from "../services/arbitroService.js";
import canchaService from "../services/canchaService.js";
import designadoService from "../services/designadoService.js";
import { getLocalDateString, addToast } from "../helpers.js";

// Modals
import { initEditDesignationModal, openEditDesignationModal } from "../components/modals/EditDesignationModal.js";
import { initManageRefereesModal, openManageRefereesModal } from "../components/modals/ManageRefereesModal.js";
import { initUpdateFeesModal, openUpdateFeesModal } from "../components/modals/UpdateFeesModal.js";
import { initRefereesByDayModal, openRefereesByDayModal } from "../components/modals/RefereesByDayModal.js";
import { initDesignationDetailModal, openDesignationDetailModal } from "../components/modals/DesignationDetailModal.js";
import { initWhatsappModal, openWhatsappModal } from "../components/modals/WhatsappModal.js";

// Card Renderer
import { renderDesignationCard } from "./designaciones/cardRenderer.js";

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

  // Local State
  let allCanchas = [];
  let existingDesignaciones = [];
  let selectedCanchasMap = {};
  let canchasConfigsMap = {};

  // Initialize Modals
  initEditDesignationModal(refreshCurrentDate);
  initManageRefereesModal(refreshCurrentDate);
  initUpdateFeesModal(refreshCurrentDate);
  initRefereesByDayModal();
  initDesignationDetailModal();
  initWhatsappModal();

  document.addEventListener("open-fees-modal", (e) => {
    if (e.detail && e.detail.id) {
      openUpdateFeesModal(e.detail.id, refreshCurrentDate);
    }
  });

  // Setup Defaults
  initDefaultDate();
  fetchInitialOptions();

  // Date select change
  historyFecha.addEventListener("change", () => onDateChanged());

  // Select / Deselect all
  btnSelectAllCanchas.addEventListener("click", () => {
    allCanchas.forEach((c) => {
      selectedCanchasMap[c.id] = true;
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
  btnHistoryRefresh.addEventListener("click", () => loadExistingDesignations(true));
  btnHistorySummary.addEventListener("click", () => openRefereesByDayModal(existingDesignaciones));

  function initDefaultDate() {
    const today = new Date();
    historyFecha.value = getLocalDateString(today);
  }

  async function fetchInitialOptions() {
    try {
      const courtsRes = await canchaService.getAll();
      allCanchas = (courtsRes.data || []).filter((c) => c.estado);

      allCanchas.forEach((c) => {
        canchasConfigsMap[c.id] = {
          hora: "08:00",
          cantidadPartidos: 1,
          etapaCampeonato: "FECHA_NORMAL",
        };
      });

      onDateChanged();
    } catch (err) {
      console.error(err);
    }
  }

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

  function renderCanchasGrid() {
    canchasConfigsGrid.innerHTML = "";
    const sorted = [...allCanchas].sort((a, b) => (a.nombreCancha || a.nombre).localeCompare(b.nombreCancha || b.nombre));

    sorted.forEach((c) => {
      const isSelected = selectedCanchasMap[c.id] || false;
      const config = canchasConfigsMap[c.id] || { hora: "08:00", cantidadPartidos: 1, etapaCampeonato: "FECHA_NORMAL" };

      const item = document.createElement("div");
      item.className = `p-4 border rounded-xl bg-slate-50 transition flex flex-col gap-3 relative ${isSelected ? "border-emerald-600 bg-emerald-50/20 shadow-sm" : "border-slate-200 bg-slate-50"}`;

      let nestedHTML = "";
      if (isSelected) {
        nestedHTML = `
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
                <option value="FECHA_NORMAL" ${config.etapaCampeonato === "FECHA_NORMAL" ? "selected" : ""}>Fecha normal</option>
                <option value="FECHA_PICANTE" ${config.etapaCampeonato === "FECHA_PICANTE" ? "selected" : ""}>Fecha picante</option>
                <option value="CLASIFICACION" ${config.etapaCampeonato === "CLASIFICACION" ? "selected" : ""}>Clasificación</option>
                <option value="CRUCES" ${config.etapaCampeonato === "CRUCES" ? "selected" : ""}>Cruces</option>
                <option value="SEMIFINAL" ${config.etapaCampeonato === "SEMIFINAL" ? "selected" : ""}>Semifinales</option>
                <option value="FINAL" ${config.etapaCampeonato === "FINAL" ? "selected" : ""}>Final</option>
              </select>
            </div>
          </div>
        `;
      }

      item.innerHTML = `
        <label class="flex gap-2.5 items-start cursor-pointer select-none">
          <input type="checkbox" class="cancha-chk-val mt-1 accent-emerald-600 rounded" ${isSelected ? "checked" : ""}>
          <div class="min-w-0 flex-1">
            <div class="text-xs font-bold text-slate-800 truncate">🏟️ ${c.nombreCancha || c.nombre}</div>
            <div class="text-[10px] text-slate-400 mt-0.5 truncate">${c.categoria || "Sin Cat."}</div>
          </div>
        </label>
        ${nestedHTML}
      `;

      const chk = item.querySelector(".cancha-chk-val");
      chk.addEventListener("change", (e) => {
        selectedCanchasMap[c.id] = e.target.checked;
        renderCanchasGrid();
        updateHistoricalSelectionCount();
      });

      if (isSelected) {
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
    const selectedIds = Object.keys(selectedCanchasMap).filter((id) => selectedCanchasMap[id] === true);
    countSelectedHistorical.textContent = selectedIds.length;
    btnRegisterHistorical.disabled = selectedIds.length === 0;
  }

  async function registerHistoricalDesignations() {
    const valDate = historyFecha.value;
    if (!valDate) return;

    const selectedIds = Object.keys(selectedCanchasMap).filter((id) => selectedCanchasMap[id] === true);
    if (!selectedIds.length) return;

    btnRegisterHistorical.disabled = true;
    btnRegisterHistorical.innerHTML = `<i class="ti ti-loader spin-icon"></i> <span>Registrando...</span>`;

    const promises = selectedIds.map((canchaId) => {
      const config = canchasConfigsMap[canchaId] || { hora: "08:00", cantidadPartidos: 1, etapaCampeonato: "FECHA_NORMAL" };
      const formattedFecha = `${valDate}T${config.hora}:00`;

      const payload = {
        idCancha: parseInt(canchaId),
        fechaYHora: formattedFecha,
        cantidadPartidos: config.cantidadPartidos || 1,
        etapa: config.etapaCampeonato || "FECHA_NORMAL",
        detalle: "",
      };

      return designacionService.crear(payload);
    });

    try {
      await Promise.all(promises);
      addToast("Designaciones históricas registradas exitosamente.");
      selectedCanchasMap = {};
      renderCanchasGrid();
      updateHistoricalSelectionCount();
      await loadExistingDesignations(true);
    } catch (err) {
      console.error(err);
      addToast("Error al registrar las designaciones.", "error");
    } finally {
      btnRegisterHistorical.disabled = false;
      btnRegisterHistorical.innerHTML = `<span>Registrar (<span id="count-selected-historical">0</span>) Designaciones</span> <i class="ti ti-check"></i>`;
    }
  }

  async function loadExistingDesignations() {
    const valDate = historyFecha.value;
    if (!valDate) return;

    listLoading.classList.remove("hidden");
    listEmpty.classList.add("hidden");
    historyResultsGrid.innerHTML = "";

    try {
      const res = await designacionService.getByFecha(valDate);
      const raw = Array.isArray(res) ? res : (res && res.data ? res.data : []);

      existingDesignaciones = await Promise.all(
        raw.map(async (d) => {
          try {
            const desigRefRes = await designadoService.getByDesignacion(d.idDesignacion);
            d.designados = Array.isArray(desigRefRes) ? desigRefRes : (desigRefRes && desigRefRes.data ? desigRefRes.data : []);
          } catch (e) {
            d.designados = [];
          }
          return d;
        })
      );

      if (!existingDesignaciones.length) {
        listEmpty.classList.remove("hidden");
        return;
      }

      const handlers = {
        onDetail: (id) => openDesignationDetailModal(id),
        onEdit: (id) => openEditDesignationModal(id, refreshCurrentDate),
        onManage: (id) => openManageRefereesModal(id, refreshCurrentDate),
        onFees: (id) => openUpdateFeesModal(id, refreshCurrentDate),
        onAutoAssign: async (id) => {
          try {
            await designacionService.asignarArbitrosAutomaticamente(id);
            addToast("Árbitros asignados automáticamente con éxito.");
            await refreshCurrentDate();
          } catch (err) {
            console.error(err);
            addToast("Error al asignar árbitros automáticamente.", "error");
          }
        },
        onSyncFees: async (id) => {
          try {
            await designacionService.vincularArancel(id);
            addToast("Aranceles sincronizados correctamente.");
            await refreshCurrentDate();
          } catch (err) {
            console.error(err);
            addToast("Error al sincronizar aranceles.", "error");
          }
        },
        onShare: (d) => openWhatsappModal([d]),
        onStatusChange: handleStatusChange,
        onReprogramar: handleReprogramar,
        onCancel: handleCancel,
        onDelete: handleDelete,
      };

      existingDesignaciones.forEach((d) => {
        historyResultsGrid.appendChild(renderDesignationCard(d, handlers));
      });
    } catch (err) {
      console.error(err);
    } finally {
      listLoading.classList.add("hidden");
    }
  }

  async function refreshCurrentDate() {
    await loadExistingDesignations();
  }

  async function handleReprogramar(id) {
    if (!confirm("¿Deseas reprogramar esta designación? Se creará una nueva designación editable con los árbitros asignados.")) return;
    try {
      await designacionService.reprogramarDesignacion(id);
      addToast("Designación reprogramada con éxito.");
      await refreshCurrentDate();
    } catch (err) {
      console.error(err);
      addToast("Error al reprogramar designación.", "error");
    }
  }

  async function handleStatusChange(id, newStatus) {
    try {
      await designacionService.cambiarEstado(id, newStatus);
      addToast(`Designación marcada como ${newStatus}.`);
      await refreshCurrentDate();
    } catch (err) {
      console.error(err);
      addToast("Error al cambiar estado.", "error");
    }
  }

  async function handleCancel(id) {
    if (!confirm("¿Deseas cancelar esta designación?")) return;
    try {
      await designacionService.cambiarEstado(id, "CANCELADA");
      addToast("Designación cancelada.");
      await refreshCurrentDate();
    } catch (err) {
      console.error(err);
      addToast("Error al cancelar designación.", "error");
    }
  }

  async function handleDelete(id) {
    if (!confirm("¿Eliminar definitivamente esta designación?")) return;
    try {
      await designacionService.eliminar(id);
      addToast("Designación eliminada.");
      await refreshCurrentDate();
    } catch (err) {
      console.error(err);
      addToast("Error al eliminar designación.", "error");
    }
  }
});
