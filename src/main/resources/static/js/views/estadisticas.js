import estadisticasService from "../services/estadisticasService.js";
import arbitroService from "../services/arbitroService.js";
import { formatMonto, addToast } from "../helpers.js";
import { state, updateState } from "../store.js";

document.addEventListener("DOMContentLoaded", () => {
  // Elements Filters
  const statsDateStart = document.getElementById("stats-date-start");
  const statsDateEnd = document.getElementById("stats-date-end");
  const btnStatsClear = document.getElementById("btn-stats-clear");
  const btnStatsSearch = document.getElementById("btn-stats-search");

  // Elements Tabs
  const tabGlobal = document.getElementById("tab-global");
  const tabReferee = document.getElementById("tab-referee");
  const tabComparison = document.getElementById("tab-comparison");
  
  const statsError = document.getElementById("stats-error");
  const statsErrorText = document.getElementById("stats-error-text");
  const statsLoading = document.getElementById("stats-loading");

  // PANEL 1: Global
  const panelGlobal = document.getElementById("panel-global");
  const globalTotalDesignaciones = document.getElementById("global-total-designaciones");
  const globalTotalPartidos = document.getElementById("global-total-partidos");
  const globalActiveCanchas = document.getElementById("global-active-canchas");
  const globalActiveArbitros = document.getElementById("global-active-arbitros");
  const globalStatesBars = document.getElementById("global-states-bars");
  const globalCategoriesBars = document.getElementById("global-categories-bars");
  const globalCanchasTbody = document.getElementById("global-canchas-tbody");
  const rankingLocalSearch = document.getElementById("ranking-local-search");
  const globalRankingTbody = document.getElementById("global-ranking-tbody");

  // PANEL 2: Referee Detail
  const panelReferee = document.getElementById("panel-referee");
  const detailRefereeSelect = document.getElementById("detail-referee-select");
  const detailEmptyPanel = document.getElementById("detail-empty-panel");
  const detailSuggestionsWrapper = document.getElementById("detail-suggestions-wrapper");
  const detailSuggestions = document.getElementById("detail-suggestions");
  const detailLoadingPanel = document.getElementById("detail-loading-panel");
  const detailContentPanel = document.getElementById("detail-content-panel");
  const detailTotalPaid = document.getElementById("detail-total-paid");
  const detailTotalPartidos = document.getElementById("detail-total-partidos");
  const detailTotalDesignaciones = document.getElementById("detail-total-designaciones");
  const detailAverageFee = document.getElementById("detail-average-fee");
  const detailCanchasList = document.getElementById("detail-canchas-list");
  const detailStatesList = document.getElementById("detail-states-list");
  const detailCategoriesList = document.getElementById("detail-categories-list");

  // PANEL 3: Comparison
  const panelComparison = document.getElementById("panel-comparison");
  const compCountBadge = document.getElementById("comp-count-badge");
  const compMonthStart = document.getElementById("comp-month-start");
  const compMonthEnd = document.getElementById("comp-month-end");
  const btnToggleAvailableReferees = document.getElementById("btn-toggle-available-referees");
  const btnCompClear = document.getElementById("btn-comp-clear");
  const compTotalLabel = document.getElementById("comp-total-label");
  const compAvailableWrapper = document.getElementById("comp-available-wrapper");
  const compChoiceGrid = document.getElementById("comp-choice-grid");
  const compLoadingPanel = document.getElementById("comp-loading-panel");
  const compEmptyPanel = document.getElementById("comp-empty-panel");
  const compContentPanel = document.getElementById("comp-content-panel");
  const compProfilesCards = document.getElementById("comp-profiles-cards");
  const compStatesComparison = document.getElementById("comp-states-comparison");
  const compFeesComparison = document.getElementById("comp-fees-comparison");

  // Local State
  let activeTabName = "global";
  let allArbitros = [];
  let globalStatsData = {};
  let rankingSearchQuery = "";
  
  // Referee Detail cache
  let selectedRefereeId = "";
  let selectedRefereeStats = {};

  // Comparison State
  let compSelectedIds = [];
  let comparisonStats = [];
  let showCompAvailableList = true;
  const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  // Initialize Dates
  initDateFilters();
  initComparisonMonthFilters();
  fetchInitialData();

  // Tab events
  document.querySelectorAll(".stats-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".stats-tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      activeTabName = btn.dataset.tab;
      
      // Ocultar error previo al cambiar pestaña
      statsError.classList.add("hidden");
      
      // Hide panels
      document.querySelectorAll(".stats-panel").forEach(p => p.classList.add("hidden"));
      
      // Show chosen
      document.getElementById(`panel-${activeTabName}`).classList.remove("hidden");

      if (activeTabName === "global") {
        renderGlobalDashboard();
      } else if (activeTabName === "referee") {
        renderRefereeDetailDashboard();
      } else if (activeTabName === "comparison") {
        renderComparisonDashboard();
      }
    });
  });

  // Filter actions
  btnStatsSearch.addEventListener("click", () => {
    statsError.classList.add("hidden");
    loadGlobalStats();
    if (!allArbitros || allArbitros.length === 0) {
      fetchInitialData();
    }
    if (selectedRefereeId) {
      loadRefereeDetailStats(selectedRefereeId);
    }
  });

  btnStatsClear.addEventListener("click", () => {
    statsError.classList.add("hidden");
    initDateFilters();
    loadGlobalStats();
    if (!allArbitros || allArbitros.length === 0) {
      fetchInitialData();
    }
    if (selectedRefereeId) {
      loadRefereeDetailStats(selectedRefereeId);
    }
  });

  // Global ranking local filter search
  rankingLocalSearch.addEventListener("input", (e) => {
    rankingSearchQuery = e.target.value.toLowerCase().trim();
    renderRankingTable();
  });

  // Referee detail selector change
  detailRefereeSelect.addEventListener("change", (e) => {
    const id = e.target.value;
    if (id) {
      selectedRefereeId = id;
      loadRefereeDetailStats(id);
    }
  });

  // Toggle available comparison panel
  btnToggleAvailableReferees.addEventListener("click", () => {
    showCompAvailableList = !showCompAvailableList;
    const icon = btnToggleAvailableReferees.querySelector("i");
    const label = btnToggleAvailableReferees.querySelector("span");
    
    if (showCompAvailableList) {
      icon.className = "ti ti-chevron-down text-xs";
      label.textContent = "Ocultar Árbitros Disponibles";
      compAvailableWrapper.classList.remove("hidden");
    } else {
      icon.className = "ti ti-chevron-right text-xs";
      label.textContent = "Mostrar Árbitros Disponibles";
      compAvailableWrapper.classList.add("hidden");
    }
  });

  // Comparison clear choices
  btnCompClear.addEventListener("click", () => {
    compSelectedIds = [];
    comparisonStats = [];
    renderComparisonRefereesGrid();
    updateComparisonSelectionHTML();
  });

  compMonthStart.addEventListener("change", loadComparisonStats);
  compMonthEnd.addEventListener("change", loadComparisonStats);

  // Setup Dates to current month limits
  function initDateFilters() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = now.getMonth() + 1;
    const lastDay = new Date(yyyy, mm, 0).getDate();
    const monthStr = String(mm).padStart(2, "0");

    statsDateStart.value = `${yyyy}-${monthStr}-01`;
    statsDateEnd.value = `${yyyy}-${monthStr}-${String(lastDay).padStart(2, "0")}`;
  }

  // Setup comparison Months
  function initComparisonMonthFilters() {
    compMonthStart.innerHTML = '<option value="">Todo el año (Inicio)</option>';
    compMonthEnd.innerHTML = '<option value="">Todo el año (Fin)</option>';

    meses.forEach((m, idx) => {
      const opt1 = document.createElement("option");
      opt1.value = idx + 1;
      opt1.textContent = m;
      compMonthStart.appendChild(opt1);

      const opt2 = document.createElement("option");
      opt2.value = idx + 1;
      opt2.textContent = m;
      compMonthEnd.appendChild(opt2);
    });

    compMonthStart.value = "";
    compMonthEnd.value = "";
  }

  // Fetch initial setup data
  async function fetchInitialData() {
    statsLoading.classList.remove("hidden");
    statsError.classList.add("hidden");
    
    try {
      // 1. Load Arbitros list
      let cachedRefs = sessionStorage.getItem("cached_arbitros");
      if (cachedRefs) {
        try {
          allArbitros = JSON.parse(cachedRefs) || [];
        } catch (e) {
          sessionStorage.removeItem("cached_arbitros");
          allArbitros = [];
        }
      }
      if (!allArbitros || allArbitros.length === 0) {
        const refs = await arbitroService.getAll(0, 100, { showLoader: false });
        allArbitros = Array.isArray(refs) ? refs : refs.content || [];
        sessionStorage.setItem("cached_arbitros", JSON.stringify(allArbitros));
      }
      state.arbitros = allArbitros;
      updateState("arbitros", allArbitros);

      // Populate Referee detail select dropdown options
      detailRefereeSelect.innerHTML = '<option value="" disabled selected>Seleccione un árbitro para ver sus estadísticas...</option>';
      const sortedRefs = [...allArbitros].sort((a,b) => (a.apellido || "").localeCompare(b.apellido || ""));
      sortedRefs.forEach(a => {
        const opt = document.createElement("option");
        opt.value = a.idArbitro;
        
        let catLabel = a.categoria ? a.categoria.charAt(0) + a.categoria.slice(1).toLowerCase() : "Inicial";
        opt.textContent = `${a.apellido}, ${a.nombre} (${catLabel})`;
        detailRefereeSelect.appendChild(opt);
      });

      // Quick suggestions for detail empty panel
      detailSuggestions.innerHTML = "";
      if (allArbitros.length > 0) {
        const sugList = allArbitros.slice(0, 4);
        sugList.forEach(a => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "btn px-3 py-1.5 text-xs font-semibold hover:bg-slate-100 rounded-xl cursor-pointer border border-slate-200 bg-white text-slate-700";
          btn.textContent = `${a.nombre} ${a.apellido}`;
          btn.addEventListener("click", () => {
            detailRefereeSelect.value = a.idArbitro;
            selectedRefereeId = a.idArbitro;
            loadRefereeDetailStats(a.idArbitro);
          });
          detailSuggestions.appendChild(btn);
        });
        detailSuggestionsWrapper.classList.remove("hidden");
      }

      // 2. Fetch Global stats
      await loadGlobalStats();
    } catch (err) {
      console.error(err);
      statsLoading.classList.add("hidden");
      statsErrorText.textContent = "Error de comunicación con el servidor al inicializar estadísticas.";
      statsError.classList.remove("hidden");
    }
  }

  // Load Global Stats endpoint
  async function loadGlobalStats() {
    statsLoading.classList.remove("hidden");
    statsError.classList.add("hidden");
    panelGlobal.classList.add("hidden");

    const startVal = statsDateStart.value;
    const endVal = statsDateEnd.value;

    try {
      const res = await estadisticasService.getEstadisticas(startVal, endVal);
      globalStatsData = res || {};
      
      statsLoading.classList.add("hidden");
      panelGlobal.classList.remove("hidden");

      renderGlobalDashboard();
    } catch (err) {
      console.error(err);
      statsLoading.classList.add("hidden");
      statsErrorText.textContent = "No se pudieron obtener las estadísticas generales del servidor.";
      statsError.classList.remove("hidden");
    }
  }

  // Render Global Summary Panel
  function renderGlobalDashboard() {
    globalTotalDesignaciones.textContent = globalStatsData.totalDesignaciones || 0;
    globalTotalPartidos.textContent = globalStatsData.totalPartidosDirigidos || 0;
    globalActiveCanchas.textContent = globalStatsData.estadisticasCanchas?.length || 0;
    globalActiveArbitros.textContent = globalStatsData.estadisticasArbitros?.length || 0;

    // Redraw states progress bars
    globalStatesBars.innerHTML = "";
    const statesMap = globalStatsData.designacionesPorEstado || {};
    const statesKeys = Object.keys(statesMap);

    const getEstadoColor = (estado) => {
      const norm = String(estado).toLowerCase();
      if (norm.includes("incompleta")) return "#ef4444";
      if (norm.includes("completa")) return "#10b981";
      if (norm.includes("finalizada")) return "#3b82f6";
      return "#64748b";
    };

    const getPorcentaje = (val, total) => {
      if (!total) return 0;
      return Math.round((val / total) * 100);
    };

    if (statesKeys.length === 0) {
      globalStatesBars.innerHTML = '<div class="text-xs text-slate-400 text-center py-4">No hay datos disponibles para este rango.</div>';
    } else {
      statesKeys.forEach(key => {
        const value = statesMap[key];
        const pct = getPorcentaje(value, globalStatsData.totalDesignaciones);
        const col = getEstadoColor(key);

        const row = document.createElement("div");
        row.innerHTML = `
          <div class="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1">
            <span class="capitalize flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${col}"></span>
              ${key}
            </span>
            <span>${value} (${pct}%)</span>
          </div>
          <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div class="h-2 rounded-full" style="width: ${pct}%; background-color: ${col}"></div>
          </div>
        `;
        globalStatesBars.appendChild(row);
      });
    }

    // Redraw categories progress bars
    globalCategoriesBars.innerHTML = "";
    const catMap = globalStatsData.designacionesPorCategoriaArbitro || {};
    const catKeys = Object.keys(catMap);

    const getCategoryBadgeClass = (cat) => {
      const map = { FUTBOL_11: "bg-emerald-50 text-emerald-700 border-emerald-200", FUTBOL_10: "bg-blue-50 text-blue-700 border-blue-200", FUTBOL_9: "bg-amber-50 text-amber-700 border-amber-200", FUTBOL_8: "bg-slate-50 text-slate-600 border-slate-200", FUTBOL_7: "bg-rose-50 text-rose-700 border-rose-200" };
      return map[cat] || "bg-slate-50 text-slate-600 border-slate-200";
    };

    const getCategoryProgressBarClass = (cat) => {
      const map = { FUTBOL_11: "bg-emerald-600", FUTBOL_10: "bg-blue-600", FUTBOL_9: "bg-amber-500", FUTBOL_8: "bg-slate-500", FUTBOL_7: "bg-rose-500" };
      return map[cat] || "bg-slate-500";
    };

    const getCategoryLabel = (cat) => {
      const map = { FUTBOL_11: "Fútbol 11", FUTBOL_10: "Fútbol 10", FUTBOL_9: "Fútbol 9", FUTBOL_8: "Fútbol 8", FUTBOL_7: "Fútbol 7" };
      return map[cat] || cat;
    };

    if (catKeys.length === 0) {
      globalCategoriesBars.innerHTML = '<div class="text-xs text-slate-400 text-center py-4">No hay datos disponibles para este rango.</div>';
    } else {
      catKeys.forEach(key => {
        const value = catMap[key];
        const pct = getPorcentaje(value, globalStatsData.totalDesignaciones);
        const badge = getCategoryBadgeClass(key);
        const colClass = getCategoryProgressBarClass(key);
        const label = getCategoryLabel(key);

        const row = document.createElement("div");
        row.innerHTML = `
          <div class="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1">
            <span class="badge border px-2 py-0.5 rounded-full text-[10px] ${badge}">${label}</span>
            <span>${value} partidos</span>
          </div>
          <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div class="h-2 rounded-full ${colClass}" style="width: ${pct}%"></div>
          </div>
        `;
        globalCategoriesBars.appendChild(row);
      });
    }

    // Redraw Canchas Utilizadas Table
    globalCanchasTbody.innerHTML = "";
    const canchasList = globalStatsData.estadisticasCanchas || [];

    if (canchasList.length === 0) {
      globalCanchasTbody.innerHTML = `<tr><td colspan="4" class="text-center text-slate-400 py-6 italic">No hay datos de canchas disponibles.</td></tr>`;
    } else {
      canchasList.forEach(c => {
        const pct = getPorcentaje(c.totalPartidos, globalStatsData.totalPartidosDirigidos);
        
        const tr = document.createElement("tr");
        tr.className = "border-b border-slate-100 hover:bg-slate-50/50";
        tr.innerHTML = `
          <td class="p-2.5 font-bold text-slate-700">${c.nombreCancha}</td>
          <td class="p-2.5 text-slate-600">${c.totalDesignaciones}</td>
          <td class="p-2.5"><span class="badge bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-bold">${c.totalPartidos}</span></td>
          <td class="p-2.5" style="width: 120px;">
            <div class="flex items-center gap-2">
              <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div class="bg-blue-600 h-1.5 rounded-full" style="width: ${pct}%"></div>
              </div>
              <span class="text-[9px] text-slate-400 font-bold">${pct}%</span>
            </div>
          </td>
        `;
        globalCanchasTbody.appendChild(tr);
      });
    }

    // Redraw general ranking table
    renderRankingTable();
  }

  // Draw Ranking table with query filter
  function renderRankingTable() {
    globalRankingTbody.innerHTML = "";
    const list = globalStatsData.estadisticasArbitros || [];

    const filtered = list.filter(item => {
      if (!rankingSearchQuery) return true;
      return (item.nombreCompleto || "").toLowerCase().includes(rankingSearchQuery);
    });

    if (filtered.length === 0) {
      globalRankingTbody.innerHTML = `<tr><td colspan="4" class="text-center text-slate-400 py-6 italic">Ningún árbitro coincide con la búsqueda.</td></tr>`;
    } else {
      filtered.forEach(a => {
        const tr = document.createElement("tr");
        tr.className = "border-b border-slate-100 hover:bg-slate-50/50";
        tr.innerHTML = `
          <td class="p-2.5 font-bold text-slate-700">${a.nombreCompleto}</td>
          <td class="p-2.5 text-center text-slate-600">${a.totalDesignaciones}</td>
          <td class="p-2.5 text-center"><span class="badge bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">${a.totalPartidosDirigidos}</span></td>
          <td class="p-2.5">
            <button type="button" class="btn btn-view-arb-detail py-1 px-2 text-[10px] border border-slate-200 rounded-lg hover:bg-slate-50 transition cursor-pointer font-bold flex items-center gap-0.5">
              <span>Detalles</span>
              <i class="ti ti-arrow-right"></i>
            </button>
          </td>
        `;

        tr.querySelector(".btn-view-arb-detail").addEventListener("click", () => {
          // Switch to referee tab and select
          detailRefereeSelect.value = a.idArbitro;
          selectedRefereeId = a.idArbitro;
          tabReferee.click();
        });

        globalRankingTbody.appendChild(tr);
      });
    }
  }

  // Load Referee Detail Stats endpoint
  async function loadRefereeDetailStats(id) {
    detailEmptyPanel.classList.add("hidden");
    detailContentPanel.classList.add("hidden");
    detailLoadingPanel.classList.remove("hidden");

    const startVal = statsDateStart.value;
    const endVal = statsDateEnd.value;

    try {
      const res = await estadisticasService.getEstadisticasArbitro(id, startVal, endVal);
      selectedRefereeStats = res || {};

      detailLoadingPanel.classList.add("hidden");
      detailContentPanel.classList.remove("hidden");

      renderRefereeDetailDashboard();
    } catch (err) {
      console.error(err);
      detailLoadingPanel.classList.add("hidden");
      detailEmptyPanel.classList.remove("hidden");
      addToast("No se pudieron obtener las estadísticas del árbitro seleccionado.", "error");
    }
  }

  // Draw Referee Detail Dashboard
  function renderRefereeDetailDashboard() {
    if (!selectedRefereeId) {
      detailEmptyPanel.classList.remove("hidden");
      detailContentPanel.classList.add("hidden");
      return;
    }

    const s = selectedRefereeStats;
    detailTotalPaid.textContent = formatMonto(s.totalMontoPercibido || 0);
    detailTotalPartidos.textContent = s.totalPartidosDirigidos || 0;
    detailTotalDesignaciones.textContent = s.totalDesignaciones || 0;

    const average = s.totalPartidosDirigidos ? ((s.totalMontoPercibido || 0) / s.totalPartidosDirigidos) : 0;
    detailAverageFee.textContent = formatMonto(average);

    const getPorcentaje = (val, total) => {
      if (!total) return 0;
      return Math.round((val / total) * 100);
    };

    // 1. Canchas habituales
    detailCanchasList.innerHTML = "";
    const habituales = s.estadisticasCanchas || [];
    if (habituales.length === 0) {
      detailCanchasList.innerHTML = '<div class="text-xs text-slate-400 text-center py-4">Sin partidos registrados en canchas.</div>';
    } else {
      habituales.forEach(c => {
        const pct = getPorcentaje(c.totalPartidos, s.totalPartidosDirigidos);
        const row = document.createElement("div");
        row.innerHTML = `
          <div class="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1">
            <span>${c.nombreCancha}</span>
            <span class="text-emerald-600">${c.totalDesignaciones} ${c.totalDesignaciones === 1 ? 'designación' : 'designaciones'}</span>
          </div>
          <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div class="bg-emerald-600 h-1.5 rounded-full" style="width: ${pct}%"></div>
          </div>
        `;
        detailCanchasList.appendChild(row);
      });
    }

    // 2. Estados compliance
    detailStatesList.innerHTML = "";
    const statesMap = s.designacionesPorEstado || {};
    const statesKeys = Object.keys(statesMap);

    const getEstadoColor = (estado) => {
      const norm = String(estado).toLowerCase();
      if (norm.includes("incompleta")) return "#ef4444";
      if (norm.includes("completa")) return "#10b981";
      if (norm.includes("finalizada")) return "#3b82f6";
      return "#64748b";
    };

    if (statesKeys.length === 0) {
      detailStatesList.innerHTML = '<div class="text-xs text-slate-400 text-center py-4">Sin datos de estados.</div>';
    } else {
      statesKeys.forEach(key => {
        const value = statesMap[key];
        const pct = getPorcentaje(value, s.totalDesignaciones);
        const col = getEstadoColor(key);

        const row = document.createElement("div");
        row.innerHTML = `
          <div class="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1">
            <span class="capitalize flex items-center gap-1.5">
              <span class="w-2 rounded-full h-2" style="background-color: ${col}"></span>
              ${key}
            </span>
            <span>${value} (${pct}%)</span>
          </div>
          <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div class="h-1.5 rounded-full" style="width: ${pct}%; background-color: ${col}"></div>
          </div>
        `;
        detailStatesList.appendChild(row);
      });
    }

    // 3. Categorias partidos
    detailCategoriesList.innerHTML = "";
    const catMap = s.designacionesPorCategoria || {};
    const catKeys = Object.keys(catMap);

    const getCategoryBadgeClass = (cat) => {
      const map = { FUTBOL_11: "bg-emerald-50 text-emerald-700 border-emerald-200", FUTBOL_10: "bg-blue-50 text-blue-700 border-blue-200", FUTBOL_9: "bg-amber-50 text-amber-700 border-amber-200", FUTBOL_8: "bg-slate-50 text-slate-600 border-slate-200", FUTBOL_7: "bg-rose-50 text-rose-700 border-rose-200" };
      return map[cat] || "bg-slate-50 text-slate-600 border-slate-200";
    };

    const getCategoryProgressBarClass = (cat) => {
      const map = { FUTBOL_11: "bg-emerald-600", FUTBOL_10: "bg-blue-600", FUTBOL_9: "bg-amber-500", FUTBOL_8: "bg-slate-500", FUTBOL_7: "bg-rose-500" };
      return map[cat] || "bg-slate-500";
    };

    const getCategoryLabel = (cat) => {
      const map = { FUTBOL_11: "Fútbol 11", FUTBOL_10: "Fútbol 10", FUTBOL_9: "Fútbol 9", FUTBOL_8: "Fútbol 8", FUTBOL_7: "Fútbol 7" };
      return map[cat] || cat;
    };

    if (catKeys.length === 0) {
      detailCategoriesList.innerHTML = '<div class="text-xs text-slate-400 text-center py-4">Sin categorías registradas.</div>';
    } else {
      catKeys.forEach(key => {
        const value = catMap[key];
        const pct = getPorcentaje(value, s.totalPartidosDirigidos);
        const badge = getCategoryBadgeClass(key);
        const colClass = getCategoryProgressBarClass(key);
        const label = getCategoryLabel(key);

        const row = document.createElement("div");
        row.innerHTML = `
          <div class="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1">
            <span class="badge border px-2 py-0.5 rounded-full text-[9px] ${badge}">${label}</span>
            <span>${value} partidos</span>
          </div>
          <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div class="h-1.5 rounded-full ${colClass}" style="width: ${pct}%"></div>
          </div>
        `;
        detailCategoriesList.appendChild(row);
      });
    }
  }

  // COMPARATOR ACTIONS
  function renderComparisonDashboard() {
    compTotalLabel.textContent = `${allArbitros.length} total`;
    
    // Draw choice checklists
    compChoiceGrid.innerHTML = "";
    const sorted = [...allArbitros].sort((a,b) => (a.apellido || "").localeCompare(b.apellido || ""));

    sorted.forEach(arb => {
      const isSelected = compSelectedIds.includes(arb.idArbitro);
      const initials = `${arb.nombre ? arb.nombre[0] : ''}${arb.apellido ? arb.apellido[0] : ''}`.toUpperCase().slice(0, 2);

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition border font-bold relative overflow-hidden shadow-sm cursor-pointer ${
        isSelected 
          ? 'bg-emerald-600 text-white border-emerald-700 shadow-md' 
          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
      }`;

      // Limit max 4 selection check
      if (!isSelected && compSelectedIds.length >= 4) {
        btn.disabled = true;
        btn.classList.add("opacity-40", "cursor-not-allowed");
      }

      btn.innerHTML = `
        <div class="flex items-center gap-2 truncate">
          <span class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 ${isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'}">${initials}</span>
          <span class="truncate">${arb.nombre} ${arb.apellido}</span>
        </div>
        ${isSelected ? '<i class="ti ti-check text-xs text-white shrink-0 ml-1"></i>' : `<span class="text-[9px] px-1 py-0.2 rounded bg-slate-100 text-slate-500 font-bold uppercase shrink-0">${arb.categoria ? arb.categoria.slice(0,4) : 'INIT'}</span>`}
      `;

      btn.addEventListener("click", () => {
        toggleComparisonReferee(arb.idArbitro);
      });

      compChoiceGrid.appendChild(btn);
    });

    updateComparisonSelectionHTML();
    renderComparisonRefereesGrid();
  }

  function toggleComparisonReferee(id) {
    const idx = compSelectedIds.indexOf(id);
    if (idx > -1) {
      compSelectedIds.splice(idx, 1);
    } else {
      if (compSelectedIds.length < 4) {
        compSelectedIds.push(id);
      }
    }

    renderComparisonDashboard();
    loadComparisonStats();
  }

  function updateComparisonSelectionHTML() {
    compCountBadge.textContent = `${compSelectedIds.length}/4 Árbitros`;
    
    if (compSelectedIds.length > 0) {
      btnCompClear.classList.remove("hidden");
    } else {
      btnCompClear.classList.add("hidden");
    }
  }

  // Fetch Comparison stats via API endpoint
  async function loadComparisonStats() {
    if (compSelectedIds.length < 2) {
      compEmptyPanel.classList.remove("hidden");
      compContentPanel.classList.add("hidden");
      compLoadingPanel.classList.add("hidden");
      return;
    }

    compEmptyPanel.classList.add("hidden");
    compContentPanel.classList.add("hidden");
    compLoadingPanel.classList.remove("hidden");

    const startMonth = compMonthStart.value ? parseInt(compMonthStart.value) : null;
    const endMonth = compMonthEnd.value ? parseInt(compMonthEnd.value) : null;

    try {
      const data = await estadisticasService.getComparacionArbitros(compSelectedIds, startMonth, endMonth);
      comparisonStats = data || [];

      compLoadingPanel.classList.add("hidden");
      compContentPanel.classList.remove("hidden");

      renderComparisonRefereesGrid();
    } catch (err) {
      console.error(err);
      compLoadingPanel.classList.add("hidden");
      compEmptyPanel.classList.remove("hidden");
      addToast("Error al obtener datos comparativos.", "error");
    }
  }

  // Render side-by-side comparison tables
  function renderComparisonRefereesGrid() {
    compProfilesCards.innerHTML = "";
    compStatesComparison.innerHTML = "";
    compFeesComparison.innerHTML = "";

    if (comparisonStats.length === 0) return;

    // Grid columns layout class
    const cols = comparisonStats.length;
    let gridColsClass = "grid-cols-1 md:grid-cols-2";
    if (cols === 3) gridColsClass = "grid-cols-1 md:grid-cols-3";
    else if (cols === 4) gridColsClass = "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";

    compProfilesCards.className = `grid gap-4 ${gridColsClass}`;
    compStatesComparison.className = `grid gap-6 ${cols === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`;
    compFeesComparison.className = `grid gap-6 ${cols === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`;

    // 1. Draw profiles cards
    comparisonStats.forEach(stat => {
      const initials = `${stat.nombre ? stat.nombre[0] : ''}${stat.apellido ? stat.apellido[0] : ''}`.toUpperCase().slice(0, 2);

      const card = document.createElement("div");
      card.className = "card bg-white rounded-2xl border border-slate-150 p-5 shadow-sm flex flex-col items-center text-center";
      card.innerHTML = `
        <div class="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 font-extrabold flex items-center justify-center text-sm shadow-inner mb-3">${initials}</div>
        <h4 class="font-extrabold text-slate-800 text-sm truncate w-full">${stat.nombre} ${stat.apellido}</h4>
        <span class="badge border bg-slate-50 text-slate-500 text-[9px] px-2 py-0.5 rounded-full font-semibold mt-1 uppercase">${stat.categoria || 'Inicial'}</span>
        <div class="grid grid-cols-2 gap-3 w-full border-t border-slate-100 pt-4 mt-4 text-xs font-semibold text-slate-700">
          <div>
            <div class="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Partidos</div>
            <span class="text-base font-extrabold text-emerald-600">${stat.totalPartidosDirigidos || 0}</span>
          </div>
          <div>
            <div class="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Honorarios</div>
            <span class="text-base font-extrabold text-slate-800">${formatMonto(stat.totalMontoPercibido || 0)}</span>
          </div>
        </div>
      `;
      compProfilesCards.appendChild(card);
    });

    // Helper percent
    const getPercent = (part, total) => {
      if (!total) return 0;
      return Math.round((part / total) * 100);
    };

    // 2. Draw states comparisons (States compliance list per referee)
    comparisonStats.forEach(stat => {
      const card = document.createElement("div");
      card.className = "card bg-white rounded-2xl border border-slate-150 p-5 shadow-sm";
      card.innerHTML = `
        <div class="font-bold text-slate-800 text-sm mb-1">${stat.nombre} ${stat.apellido}</div>
        <div class="text-[9px] text-slate-400 mb-4 uppercase">Porcentaje de cumplimiento de designaciones</div>
        <div class="flex flex-col gap-3">
          ${Object.entries(stat.designacionesPorEstado || {}).map(([key, val]) => {
            const pct = getPercent(val, stat.totalDesignaciones);
            let col = "#64748b";
            if (key.toLowerCase().includes("completa")) col = "#10b981";
            else if (key.toLowerCase().includes("finalizada")) col = "#3b82f6";
            else if (key.toLowerCase().includes("incompleta")) col = "#ef4444";

            return `
              <div>
                <div class="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
                  <span class="capitalize flex items-center gap-1.5"><span class="w-2 h-2 rounded-full" style="background-color: ${col}"></span> ${key}</span>
                  <span>${val} (${pct}%)</span>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div class="h-1.5 rounded-full" style="width: ${pct}%; background-color: ${col}"></div>
                </div>
              </div>
            `;
          }).join("") || '<div class="text-xs text-slate-400 italic py-2">Sin registros de estados.</div>'}
        </div>
      `;
      compStatesComparison.appendChild(card);
    });

    // 3. Draw fees comparisons (Aranceles stats per referee)
    comparisonStats.forEach(stat => {
      const avg = stat.totalPartidosDirigidos ? ((stat.totalMontoPercibido || 0) / stat.totalPartidosDirigidos) : 0;
      
      const card = document.createElement("div");
      card.className = "card bg-white rounded-2xl border border-slate-150 p-5 shadow-sm flex flex-col gap-4";
      card.innerHTML = `
        <div>
          <div class="font-bold text-slate-800 text-sm mb-1">${stat.nombre} ${stat.apellido}</div>
          <div class="text-[9px] text-slate-400 uppercase">Valores financieros y promedios percibidos</div>
        </div>
        <div class="flex flex-col gap-3 text-xs font-semibold text-slate-700">
          <div class="flex justify-between items-center py-2 border-b border-slate-50">
            <span class="text-slate-500">Monto Máximo Percibido en una Cancha</span>
            <span class="text-slate-800 font-extrabold">${formatMonto(stat.maxMontoCancha || 0)}</span>
          </div>
          <div class="flex justify-between items-center py-2 border-b border-slate-50">
            <span class="text-slate-500">Promedio de Honorario por Partido</span>
            <span class="text-emerald-700 font-extrabold">${formatMonto(avg)}</span>
          </div>
          <div class="flex justify-between items-center py-2">
            <span class="text-slate-500">Total de Ingresos del Período</span>
            <span class="text-slate-800 font-extrabold text-sm">${formatMonto(stat.totalMontoPercibido || 0)}</span>
          </div>
        </div>
      `;
      compFeesComparison.appendChild(card);
    });
  }
});
