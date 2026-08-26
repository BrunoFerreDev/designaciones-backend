import designacionService from "../services/designacionService.js";
import canchaService from "../services/canchaService.js";
import designadoService from "../services/designadoService.js";
import { addToast, minArbitros } from "../helpers.js";

// Import Modals
import { initWizardModal, openWizardModal } from "../components/modals/WizardModal.js";
import { initEditDesignationModal, openEditDesignationModal } from "../components/modals/EditDesignationModal.js";
import { initManageRefereesModal, openManageRefereesModal } from "../components/modals/ManageRefereesModal.js";
import { initUpdateFeesModal, openUpdateFeesModal } from "../components/modals/UpdateFeesModal.js";
import { initRefereesByDayModal, openRefereesByDayModal } from "../components/modals/RefereesByDayModal.js";
import { initDesignationDetailModal, openDesignationDetailModal } from "../components/modals/DesignationDetailModal.js";
import { initWhatsappModal, openWhatsappModal } from "../components/modals/WhatsappModal.js";
import { initComparativeModal, openComparativeModal } from "../components/modals/ComparativeModal.js";

// Card Renderer
import { renderDesignationCard } from "./designaciones/cardRenderer.js";

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const designationsLoading = document.getElementById("designations-loading");
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

  // Local State
  let allDesignaciones = [];
  let allCanchas = [];
  let filterSearchQuery = "";
  let showFinalized = true;

  // Initialize Modals
  initWizardModal(onDataUpdated);
  initEditDesignationModal(onDataUpdated);
  initManageRefereesModal(onDataUpdated);
  initUpdateFeesModal(onDataUpdated);
  initRefereesByDayModal();
  initDesignationDetailModal();
  initWhatsappModal();
  initComparativeModal();

  // Listen for cross-modal triggers
  document.addEventListener("open-fees-modal", (e) => {
    if (e.detail && e.detail.id) {
      openUpdateFeesModal(e.detail.id, onDataUpdated);
    }
  });

  // Attach Topbar Listeners
  btnNewDesignation.addEventListener("click", () => openWizardModal(allCanchas, onDataUpdated));
  if (btnCreateFirst) {
    btnCreateFirst.addEventListener("click", () => openWizardModal(allCanchas, onDataUpdated));
  }
  btnRefereesByDay.addEventListener("click", () => openRefereesByDayModal(allDesignaciones));
  btnWeekendComparative.addEventListener("click", openComparativeModal);
  btnWhatsappShareAll.addEventListener("click", () => openWhatsappModal(allDesignaciones));

  // Referee Search
  refereeSearch.addEventListener("input", (e) => {
    filterSearchQuery = e.target.value.toLowerCase().trim();
    renderAllGrids();
  });

  // Toggle Finalized
  btnToggleFinalized.addEventListener("click", () => {
    showFinalized = !showFinalized;
    btnToggleFinalized.innerHTML = showFinalized
      ? `<i class="ti ti-eye-off"></i> <span>Ocultar</span>`
      : `<i class="ti ti-eye"></i> <span>Mostrar</span>`;
    gridFinalizadas.classList.toggle("hidden", !showFinalized);
  });

  // Fetch Initial Data
  fetchInitialData();

  async function fetchInitialData() {
    if (designationsLoading) designationsLoading.classList.remove("hidden");
    if (designationsEmpty) designationsEmpty.classList.add("hidden");

    try {
      const [desigRes, canchasRes] = await Promise.all([
        designacionService.ultimasDesignaciones(),
        canchaService.getAll(),
      ]);

      const canchasRaw = Array.isArray(canchasRes) ? canchasRes : (canchasRes.data || []);
      allCanchas = canchasRaw.filter((c) => c.estado);

      const rawDesignaciones = Array.isArray(desigRes) ? desigRes : (desigRes.data || []);

      // Fetch designated referees for each designation
      allDesignaciones = await Promise.all(
        rawDesignaciones.map(async (d) => {
          try {
            const desigRefRes = await designadoService.getByDesignacion(d.idDesignacion);
            d.designados = Array.isArray(desigRefRes) ? desigRefRes : (desigRefRes.data || []);
          } catch (e) {
            d.designados = [];
          }
          return d;
        })
      );

      renderAllGrids();
    } catch (err) {
      console.error(err);
      addToast("Error al cargar designaciones.", "error");
    } finally {
      if (designationsLoading) designationsLoading.classList.add("hidden");
    }
  }

  async function onDataUpdated() {
    await fetchInitialData();
  }

  function renderAllGrids() {
    const filtered = allDesignaciones.filter((d) => {
      if (!filterSearchQuery) return true;
      const matchReferee = (d.designados || []).some((item) => {
        const a = item.arbitro || {};
        const fullName = `${a.nombre || ""} ${a.apellido || ""}`.toLowerCase();
        return fullName.includes(filterSearchQuery);
      });
      const matchCancha = (d.cancha ? (d.cancha.nombreCancha || d.cancha.nombre) : "").toLowerCase().includes(filterSearchQuery);
      return matchReferee || matchCancha;
    });

    if (!filtered.length) {
      designationsEmpty.classList.remove("hidden");
      sectionIncompletas.classList.add("hidden");
      sectionCompletas.classList.add("hidden");
      sectionAconfirmar.classList.add("hidden");
      sectionCanceladas.classList.add("hidden");
      sectionFinalizadas.classList.add("hidden");
      return;
    }

    designationsEmpty.classList.add("hidden");

    // Grouping by state
    const incompletas = [];
    const completas = [];
    const aConfirmar = [];
    const canceladas = [];
    const finalizadas = [];

    filtered.forEach((d) => {
      const isFueraDeJuego = d.cancha && d.cancha.fueraDeJuego;
      const minReq = minArbitros(isFueraDeJuego);
      const count = (d.designados || []).length;
      const stNum = d.estadoDesignacion !== undefined ? d.estadoDesignacion : (d.estado === "FINALIZADA" ? 2 : (d.estado === "CANCELADA" ? 3 : (d.estado === "COMPLETA" ? 1 : 0)));

      if (stNum === 2 || d.estado === "FINALIZADA") {
        finalizadas.push(d);
      } else if (stNum === 3 || d.estado === "CANCELADA" || d.estado === "SUSPENDIDA") {
        canceladas.push(d);
      } else if (d.estado === "A_CONFIRMAR" || d.estado === "CONFIRMADA") {
        aConfirmar.push(d);
      } else if (stNum === 1 || count >= minReq) {
        completas.push(d);
      } else {
        incompletas.push(d);
      }
    });

    const handlers = {
      onDetail: (id) => openDesignationDetailModal(id),
      onEdit: (id) => openEditDesignationModal(id, onDataUpdated),
      onManage: (id) => openManageRefereesModal(id, onDataUpdated),
      onFees: (id) => openUpdateFeesModal(id, onDataUpdated),
      onAutoAssign: async (id) => {
        try {
          await designacionService.asignarArbitrosAutomaticamente(id);
          addToast("Árbitros asignados automáticamente con éxito.");
          await fetchInitialData();
        } catch (err) {
          console.error(err);
          addToast("Error al asignar árbitros automáticamente.", "error");
        }
      },
      onSyncFees: async (id) => {
        try {
          await designacionService.vincularArancel(id);
          addToast("Aranceles sincronizados correctamente.");
          await fetchInitialData();
        } catch (err) {
          console.error(err);
          const msg = (err && err.response && err.response.data && err.response.data.message) || err.message || "Error al sincronizar aranceles.";
          addToast(msg, "error");
        }
      },
      onShare: (d) => openWhatsappModal([d]),
      onStatusChange: handleStatusChange,
      onCancel: handleCancel,
      onDelete: handleDelete,
    };

    // Render Incompletas
    renderSection(sectionIncompletas, gridIncompletas, countIncompletas, incompletas, handlers);
    // Render Completas
    renderSection(sectionCompletas, gridCompletas, countCompletas, completas, handlers);
    // Render A Confirmar
    renderSection(sectionAconfirmar, gridAconfirmar, null, aConfirmar, handlers);
    // Render Canceladas
    renderSection(sectionCanceladas, gridCanceladas, null, canceladas, handlers);
    // Render Finalizadas
    renderSection(sectionFinalizadas, gridFinalizadas, countFinalizadas, finalizadas, handlers);
  }

  function renderSection(sectionEl, gridEl, countEl, items, handlers) {
    if (!items.length) {
      sectionEl.classList.add("hidden");
      gridEl.innerHTML = "";
      if (countEl) countEl.textContent = "0";
      return;
    }

    sectionEl.classList.remove("hidden");
    if (countEl) countEl.textContent = items.length;

    gridEl.innerHTML = "";
    items.forEach((d) => {
      gridEl.appendChild(renderDesignationCard(d, handlers));
    });
  }

  async function handleStatusChange(id, newStatus) {
    try {
      await designacionService.cambiarEstado(id, newStatus);
      addToast(`Designación marcada como ${newStatus}.`);
      await fetchInitialData();
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
      await fetchInitialData();
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
      await fetchInitialData();
    } catch (err) {
      console.error(err);
      addToast("Error al eliminar designación.", "error");
    }
  }
});
