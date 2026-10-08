import designacionService from "../services/designacionService.js";
import canchaService from "../services/canchaService.js";
import designadoService from "../services/designadoService.js";
import { addToast, minArbitros, formatFecha, getDayOfWeekLocal } from "../helpers.js";

// Import Modals
import { initWizardModal, openWizardModal } from "../components/modals/WizardModal.js";
import { initEditDesignationModal, openEditDesignationModal } from "../components/modals/EditDesignationModal.js";
import { initManageRefereesModal, openManageRefereesModal } from "../components/modals/ManageRefereesModal.js";
import { initUpdateFeesModal, openUpdateFeesModal } from "../components/modals/UpdateFeesModal.js";
import { initRefereesByDayModal, openRefereesByDayModal } from "../components/modals/RefereesByDayModal.js";
import { initDesignationDetailModal, openDesignationDetailModal } from "../components/modals/DesignationDetailModal.js";
import { initWhatsappModal, openWhatsappModal } from "../components/modals/WhatsappModal.js";
import { initComparativeModal, openComparativeModal } from "../components/modals/ComparativeModal.js";
import { initStatusDetailModal, promptStatusDetail } from "../components/modals/StatusDetailModal.js";

// Card Renderer
import { renderDesignationCard } from "./designaciones/cardRenderer.js";

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const designationsLoading = document.getElementById("designations-loading");
  const designationsEmpty = document.getElementById("designations-empty");
  const designationsContainer = document.getElementById("designations-container");
  const refereeSearch = document.getElementById("referee-search");

  // Day Columns & Tab Elements
  const colSaturday = document.getElementById("col-saturday");
  const colSunday = document.getElementById("col-sunday");
  const colOther = document.getElementById("col-other");

  const gridSaturday = document.getElementById("grid-saturday");
  const gridSunday = document.getElementById("grid-sunday");
  const gridOther = document.getElementById("grid-other");

  const emptySaturday = document.getElementById("empty-saturday");
  const emptySunday = document.getElementById("empty-sunday");

  const badgeSatTotal = document.getElementById("badge-sat-total");
  const badgeSunTotal = document.getElementById("badge-sun-total");
  const badgeOtherTotal = document.getElementById("badge-other-total");

  const labelSatDate = document.getElementById("label-sat-date");
  const labelSunDate = document.getElementById("label-sun-date");

  const tabDayAll = document.getElementById("tab-day-all");
  const tabDaySat = document.getElementById("tab-day-sat");
  const tabDaySun = document.getElementById("tab-day-sun");

  const badgeCountAll = document.getElementById("badge-count-all");
  const badgeCountSat = document.getElementById("badge-count-sat");
  const badgeCountSun = document.getElementById("badge-count-sun");

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
  let activeDayTab = "all"; // 'all', 'sat', 'sun'
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
  initStatusDetailModal();

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

  // Day Filter Tabs Listeners
  if (tabDayAll && tabDaySat && tabDaySun) {
    tabDayAll.addEventListener("click", () => setDayTab("all"));
    tabDaySat.addEventListener("click", () => setDayTab("sat"));
    tabDaySun.addEventListener("click", () => setDayTab("sun"));
  }

  function setDayTab(tab) {
    activeDayTab = tab;
    const tabBtns = [
      { el: tabDayAll, id: "all" },
      { el: tabDaySat, id: "sat" },
      { el: tabDaySun, id: "sun" },
    ];

    tabBtns.forEach(({ el, id }) => {
      if (!el) return;
      if (id === tab) {
        el.className = "tab-day-btn px-5 py-2.5 text-xs font-bold rounded-xl transition bg-white text-slate-800 shadow-xs flex items-center gap-2 cursor-pointer";
      } else {
        el.className = "tab-day-btn px-5 py-2.5 text-xs font-bold rounded-xl transition text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 flex items-center gap-2 cursor-pointer";
      }
    });

    renderAllGrids();
  }

  // Referee Search
  refereeSearch.addEventListener("input", (e) => {
    filterSearchQuery = e.target.value.toLowerCase().trim();
    renderAllGrids();
  });

  // Toggle Finalized
  btnToggleFinalized.addEventListener("click", () => {
    showFinalized = !showFinalized;
    btnToggleFinalized.innerHTML = showFinalized
      ? `<i class="ti ti-eye-off text-sm"></i> <span>Ocultar Finalizadas</span>`
      : `<i class="ti ti-eye text-sm"></i> <span>Mostrar Finalizadas</span>`;
    renderAllGrids();
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
    // Chronological sort: by date & time ascending
    const sorted = [...allDesignaciones].sort((a, b) => {
      const timeA = new Date(a.fecha || a.fechaYHora || 0).getTime();
      const timeB = new Date(b.fecha || b.fechaYHora || 0).getTime();
      return timeA - timeB;
    });

    const filtered = sorted.filter((d) => {
      // Finalized filter
      const stNum = d.estadoDesignacion !== undefined ? d.estadoDesignacion : (d.estado === "FINALIZADA" ? 2 : 0);
      if (!showFinalized && (stNum === 2 || d.estado === "FINALIZADA")) {
        return false;
      }

      // Search filter
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
      designationsContainer.classList.add("hidden");
      return;
    }

    designationsEmpty.classList.add("hidden");
    designationsContainer.classList.remove("hidden");

    // Separate into Saturday, Sunday, and Other days
    const satList = [];
    const sunList = [];
    const otherList = [];

    let firstSatDate = null;
    let firstSunDate = null;

    filtered.forEach((d) => {
      const fechaVal = d.fecha || d.fechaYHora;
      const dayIndex = getDayOfWeekLocal(fechaVal);

      if (dayIndex === 6) {
        satList.push(d);
        if (!firstSatDate && fechaVal) firstSatDate = fechaVal;
      } else if (dayIndex === 0) {
        sunList.push(d);
        if (!firstSunDate && fechaVal) firstSunDate = fechaVal;
      } else {
        otherList.push(d);
      }
    });

    // Update Tab Badges
    if (badgeCountAll) badgeCountAll.textContent = filtered.length;
    if (badgeCountSat) badgeCountSat.textContent = satList.length;
    if (badgeCountSun) badgeCountSun.textContent = sunList.length;

    if (badgeSatTotal) badgeSatTotal.textContent = satList.length;
    if (badgeSunTotal) badgeSunTotal.textContent = sunList.length;
    if (badgeOtherTotal) badgeOtherTotal.textContent = otherList.length;

    // Update Date Header Labels
    if (labelSatDate) {
      labelSatDate.textContent = firstSatDate ? formatFecha(firstSatDate).split(" a las ")[0] : "Sábado";
    }
    if (labelSunDate) {
      labelSunDate.textContent = firstSunDate ? formatFecha(firstSunDate).split(" a las ")[0] : "Domingo";
    }

    const handlers = {
      onDetail: (id) => openDesignationDetailModal(id),
      onEdit: (id) => openEditDesignationModal(id, onDataUpdated),
      onManage: (id) => openManageRefereesModal(id, onDataUpdated),
      onFees: (id) => openUpdateFeesModal(id, onDataUpdated),
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
      onReprogramar: handleReprogramar,
      onCancel: handleCancel,
      onDelete: handleDelete,
    };

    // Handle Active Tab Visibility
    if (activeDayTab === "sat") {
      colSaturday.classList.remove("hidden");
      colSunday.classList.add("hidden");
      colOther.classList.add("hidden");
      designationsContainer.className = "grid grid-cols-1 gap-8";
    } else if (activeDayTab === "sun") {
      colSaturday.classList.add("hidden");
      colSunday.classList.remove("hidden");
      colOther.classList.add("hidden");
      designationsContainer.className = "grid grid-cols-1 gap-8";
    } else {
      colSaturday.classList.remove("hidden");
      colSunday.classList.remove("hidden");
      designationsContainer.className = "grid grid-cols-1 lg:grid-cols-2 gap-8";
    }

    // Render Saturday Column
    gridSaturday.innerHTML = "";
    if (satList.length === 0) {
      emptySaturday.classList.remove("hidden");
    } else {
      emptySaturday.classList.add("hidden");
      satList.forEach((d) => gridSaturday.appendChild(renderDesignationCard(d, handlers)));
    }

    // Render Sunday Column
    gridSunday.innerHTML = "";
    if (sunList.length === 0) {
      emptySunday.classList.remove("hidden");
    } else {
      emptySunday.classList.add("hidden");
      sunList.forEach((d) => gridSunday.appendChild(renderDesignationCard(d, handlers)));
    }

    // Render Other Days Column if applicable
    if (otherList.length > 0 && activeDayTab === "all") {
      colOther.classList.remove("hidden");
      gridOther.innerHTML = "";
      otherList.forEach((d) => gridOther.appendChild(renderDesignationCard(d, handlers)));
    } else {
      colOther.classList.add("hidden");
      gridOther.innerHTML = "";
    }
  }

  async function handleReprogramar(id) {
    if (!confirm("¿Deseas reprogramar esta designación? Se creará una nueva designación editable con los árbitros asignados.")) return;
    try {
      await designacionService.reprogramarDesignacion(id);
      addToast("Designación reprogramada con éxito.");
      await fetchInitialData();
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
      await fetchInitialData();
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
