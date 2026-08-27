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
import { initStatusDetailModal, promptStatusDetail } from "../components/modals/StatusDetailModal.js";

// Card Renderer
import { renderDesignationCard } from "./designaciones/cardRenderer.js";

document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const searchForm = document.getElementById("search-form");
  const searchError = document.getElementById("search-error");
  const searchErrorText = document.getElementById("search-error-text");
  const searchLoading = document.getElementById("search-loading");
  const searchEmpty = document.getElementById("search-empty");
  const searchResultsSection = document.getElementById("search-results-section");
  const countResults = document.getElementById("count-results");
  const searchResultsGrid = document.getElementById("search-results-grid");

  // Inputs
  const searchFechaSingle = document.getElementById("search-fecha-single");
  const searchFechaInicio = document.getElementById("search-fecha-inicio");
  const searchFechaFin = document.getElementById("search-fecha-fin");
  const searchMonth = document.getElementById("search-month");
  const searchYear = document.getElementById("search-year");
  const searchRefereeSelect = document.getElementById("search-referee-select");
  const searchCourtSelect = document.getElementById("search-court-select");
  const searchStatusSelect = document.getElementById("search-status-select");

  // Pagination
  const searchPagination = document.getElementById("search-pagination");
  const paginationInfo = document.getElementById("pagination-info");
  const btnPaginationPrev = document.getElementById("btn-pagination-prev");
  const btnPaginationNext = document.getElementById("btn-pagination-next");
  const btnSearchSummary = document.getElementById("btn-search-summary");

  // Local State
  let activeSearchMode = "single";
  let searchResultsList = [];
  let currentPage = 0;
  let totalPages = 1;
  const pageSize = 10;

  // Initialize Modals
  initEditDesignationModal(refreshCurrentSearch);
  initManageRefereesModal(refreshCurrentSearch);
  initUpdateFeesModal(refreshCurrentSearch);
  initRefereesByDayModal();
  initDesignationDetailModal();
  initWhatsappModal();
  initStatusDetailModal();

  document.addEventListener("open-fees-modal", (e) => {
    if (e.detail && e.detail.id) {
      openUpdateFeesModal(e.detail.id, refreshCurrentSearch);
    }
  });

  // Init Form Fields
  initDatesAndYears();
  fetchInitOptions();

  // Tab switching
  document.querySelectorAll(".search-tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".search-tab-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      activeSearchMode = btn.dataset.mode;
      document.querySelectorAll(".filter-panel").forEach((p) => p.classList.add("hidden"));
      document.getElementById(`filter-${activeSearchMode}`).classList.remove("hidden");

      searchError.classList.add("hidden");
      searchEmpty.classList.add("hidden");
      searchResultsSection.classList.add("hidden");
      searchResultsList = [];
    });
  });

  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    currentPage = 0;
    executeSearch();
  });

  btnPaginationPrev.addEventListener("click", () => {
    if (currentPage > 0) {
      currentPage--;
      renderResults();
      window.scrollTo({ top: searchResultsSection.offsetTop - 80, behavior: "smooth" });
    }
  });

  btnPaginationNext.addEventListener("click", () => {
    if (currentPage < totalPages - 1) {
      currentPage++;
      renderResults();
      window.scrollTo({ top: searchResultsSection.offsetTop - 80, behavior: "smooth" });
    }
  });

  btnSearchSummary.addEventListener("click", () => {
    openRefereesByDayModal(searchResultsList);
  });

  function initDatesAndYears() {
    const today = new Date();
    const todayStr = getLocalDateString(today);
    searchFechaSingle.value = todayStr;
    searchFechaInicio.value = todayStr;
    searchFechaFin.value = todayStr;

    searchMonth.value = (today.getMonth() + 1).toString();
    const currentYear = today.getFullYear();
    searchYear.innerHTML = "";
    for (let y = currentYear + 1; y >= currentYear - 3; y--) {
      const opt = document.createElement("option");
      opt.value = y.toString();
      opt.textContent = y.toString();
      if (y === currentYear) opt.selected = true;
      searchYear.appendChild(opt);
    }
  }

  async function fetchInitOptions() {
    try {
      const [arbRes, canchaRes] = await Promise.all([
        arbitroService.getAll(),
        canchaService.getAll(),
      ]);

      const arbitros = Array.isArray(arbRes) ? arbRes : (arbRes && Array.isArray(arbRes.content) ? arbRes.content : (arbRes && arbRes.data ? arbRes.data : []));
      const canchasRaw = Array.isArray(canchaRes) ? canchaRes : (canchaRes && Array.isArray(canchaRes.content) ? canchaRes.content : (canchaRes && canchaRes.data ? canchaRes.data : []));
      const canchas = canchasRaw.filter((c) => c.estado !== false);

      searchRefereeSelect.innerHTML = `
        <option value="" disabled selected>Seleccione un árbitro...</option>
        ${arbitros.map((a) => `<option value="${a.idArbitro}">${a.nombre} ${a.apellido}</option>`).join("")}
      `;

      searchCourtSelect.innerHTML = `
        <option value="" disabled selected>Seleccione una cancha...</option>
        ${canchas.map((c) => `<option value="${c.id || c.idCancha}">${c.nombreCancha || c.nombre}</option>`).join("")}
      `;
    } catch (err) {
      console.error(err);
    }
  }

  async function executeSearch() {
    searchError.classList.add("hidden");
    searchEmpty.classList.add("hidden");
    searchResultsSection.classList.add("hidden");
    searchLoading.classList.remove("hidden");

    try {
      let res;
      if (activeSearchMode === "single") {
        const f = searchFechaSingle.value;
        if (!f) throw new Error("Debe seleccionar una fecha.");
        res = await designacionService.getByFecha(f);
      } else if (activeSearchMode === "range") {
        const fi = searchFechaInicio.value;
        const ff = searchFechaFin.value;
        if (!fi || !ff) throw new Error("Debe seleccionar ambas fechas.");
        res = await designacionService.getByFechaRange(fi, ff);
      } else if (activeSearchMode === "monthly") {
        const m = parseInt(searchMonth.value);
        const y = parseInt(searchYear.value);
        res = await designacionService.getByMes(m, y);
      } else if (activeSearchMode === "referee") {
        const arbId = parseInt(searchRefereeSelect.value);
        if (!arbId) throw new Error("Debe seleccionar un árbitro.");
        res = await designacionService.getByArbitro(arbId, 0, 100);
      } else if (activeSearchMode === "court") {
        const cId = parseInt(searchCourtSelect.value);
        if (!cId) throw new Error("Debe seleccionar una cancha.");
        res = await designacionService.getByCancha(cId, 0, 100);
      } else if (activeSearchMode === "status") {
        const st = searchStatusSelect.value;
        res = await designacionService.getByEstado(st, 0, 100);
      }

      let raw = [];
      if (Array.isArray(res)) {
        raw = res;
      } else if (res && Array.isArray(res.content)) {
        raw = res.content;
      } else if (res && res.data) {
        raw = Array.isArray(res.data) ? res.data : (res.data.content || []);
      }

      // Fetch referees for each
      searchResultsList = await Promise.all(
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

      renderResults();
    } catch (err) {
      console.error(err);
      searchErrorText.textContent = err.message || "Error al buscar designaciones.";
      searchError.classList.remove("hidden");
    } finally {
      searchLoading.classList.add("hidden");
    }
  }

  async function refreshCurrentSearch() {
    await executeSearch();
  }

  function renderResults() {
    if (!searchResultsList.length) {
      searchEmpty.classList.remove("hidden");
      return;
    }

    countResults.textContent = searchResultsList.length;
    searchResultsSection.classList.remove("hidden");

    // Client pagination
    totalPages = Math.ceil(searchResultsList.length / pageSize) || 1;
    const start = currentPage * pageSize;
    const paginated = searchResultsList.slice(start, start + pageSize);

    searchResultsGrid.innerHTML = "";

    const handlers = {
      onDetail: (id) => openDesignationDetailModal(id),
      onEdit: (id) => openEditDesignationModal(id, refreshCurrentSearch),
      onManage: (id) => openManageRefereesModal(id, refreshCurrentSearch),
      onFees: (id) => openUpdateFeesModal(id, refreshCurrentSearch),
      onAutoAssign: async (id) => {
        try {
          await designacionService.asignarArbitrosAutomaticamente(id);
          addToast("Árbitros asignados automáticamente con éxito.");
          await refreshCurrentSearch();
        } catch (err) {
          console.error(err);
          addToast("Error al asignar árbitros automáticamente.", "error");
        }
      },
      onSyncFees: async (id) => {
        try {
          await designacionService.vincularArancel(id);
          addToast("Aranceles sincronizados correctamente.");
          await refreshCurrentSearch();
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

    paginated.forEach((d) => {
      searchResultsGrid.appendChild(renderDesignationCard(d, handlers));
    });

    // Pagination controls
    if (totalPages > 1) {
      searchPagination.classList.remove("hidden");
      paginationInfo.textContent = `Página ${currentPage + 1} de ${totalPages} (${searchResultsList.length} total)`;
      btnPaginationPrev.disabled = currentPage === 0;
      btnPaginationNext.disabled = currentPage >= totalPages - 1;
    } else {
      searchPagination.classList.add("hidden");
    }
  }

  async function handleReprogramar(id) {
    if (!confirm("¿Deseas reprogramar esta designación? Se creará una nueva designación editable con los árbitros asignados.")) return;
    try {
      await designacionService.reprogramarDesignacion(id);
      addToast("Designación reprogramada con éxito.");
      await refreshCurrentSearch();
    } catch (err) {
      console.error(err);
      addToast("Error al reprogramar designación.", "error");
    }
  }

  async function handleStatusChange(id, newStatus) {
    const detalle = await promptStatusDetail(newStatus);
    if (detalle === null) return; // User cancelled
    try {
      await designacionService.cambiarEstado(id, newStatus, detalle);
      addToast(`Designación marcada como ${newStatus}.`);
      await refreshCurrentSearch();
    } catch (err) {
      console.error(err);
      addToast("Error al cambiar estado.", "error");
    }
  }

  async function handleCancel(id) {
    const detalle = await promptStatusDetail("CANCELADA");
    if (detalle === null) return; // User cancelled
    try {
      await designacionService.cambiarEstado(id, "CANCELADA", detalle);
      addToast("Designación cancelada.");
      await refreshCurrentSearch();
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
      await refreshCurrentSearch();
    } catch (err) {
      console.error(err);
      addToast("Error al eliminar designación.", "error");
    }
  }
});
