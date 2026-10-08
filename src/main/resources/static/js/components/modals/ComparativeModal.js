import designacionService from "../../services/designacionService.js";
import designadoService from "../../services/designadoService.js";
import { printComparativaReport } from "../../services/printComparativaService.js";
import { getLocalDateString, addToast } from "../../helpers.js";

let modalEl = null;
let currentComparativaData = null;
let activeCompTab = "summary"; // 'summary', 'both', 'sat', 'sun', 'lastOnly', 'thisOnly'

export function initComparativeModal() {
  if (document.getElementById("weekend-comparative-modal")) {
    modalEl = document.getElementById("weekend-comparative-modal");
    bindEvents();
    return;
  }

  const div = document.createElement("div");
  div.id = "weekend-comparative-modal";
  div.className = "modal-overlay hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4";
  div.innerHTML = `
    <div class="bg-white rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[92vh]">
      <!-- Header -->
      <div class="px-6 py-4 bg-slate-50 border-b border-slate-150 flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shadow-2xs">
            <i class="ti ti-git-compare text-xl"></i>
          </div>
          <div>
            <h3 class="font-extrabold text-slate-800 text-base">Comparativa de Fines de Semana</h3>
            <div class="text-xs text-slate-500 font-medium">Cruce de árbitros entre el fin de semana anterior y el actual</div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button type="button" id="btn-comp-print-direct" class="hidden px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs">
            <i class="ti ti-printer text-sm"></i>
            <span>Imprimir Reporte</span>
          </button>
          <button type="button" class="modal-close-btn p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition cursor-pointer">
            <i class="ti ti-x text-lg"></i>
          </button>
        </div>
      </div>

      <!-- Controls & Date Selectors -->
      <div class="px-6 py-3 bg-white border-b border-slate-150 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
          <div class="flex flex-col">
            <label for="comp-last-sat" class="text-[10px] font-bold text-slate-400 uppercase mb-1">Sáb. Anterior</label>
            <input type="date" id="comp-last-sat" class="h-9 bg-slate-50 border border-slate-200 rounded-xl px-2.5 text-xs outline-none focus:border-emerald-500 focus:bg-white" />
          </div>
          <div class="flex flex-col">
            <label for="comp-last-sun" class="text-[10px] font-bold text-slate-400 uppercase mb-1">Dom. Anterior</label>
            <input type="date" id="comp-last-sun" class="h-9 bg-slate-50 border border-slate-200 rounded-xl px-2.5 text-xs outline-none focus:border-emerald-500 focus:bg-white" />
          </div>
          <div class="flex flex-col">
            <label for="comp-this-sat" class="text-[10px] font-bold text-slate-400 uppercase mb-1">Este Sábado</label>
            <input type="date" id="comp-this-sat" class="h-9 bg-slate-50 border border-slate-200 rounded-xl px-2.5 text-xs outline-none focus:border-emerald-500 focus:bg-white" />
          </div>
          <div class="flex flex-col">
            <label for="comp-this-sun" class="text-[10px] font-bold text-slate-400 uppercase mb-1">Este Domingo</label>
            <input type="date" id="comp-this-sun" class="h-9 bg-slate-50 border border-slate-200 rounded-xl px-2.5 text-xs outline-none focus:border-emerald-500 focus:bg-white" />
          </div>
        </div>

        <div class="flex items-end">
          <button type="button" id="btn-comp-generate" class="w-full md:w-auto h-9 px-5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer">
            <i class="ti ti-refresh text-sm"></i>
            <span>Actualizar Comparativa</span>
          </button>
        </div>
      </div>

      <!-- Navigation Tabs (Visible when data loaded) -->
      <div id="comp-tabs-bar" class="px-6 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-2 overflow-x-auto">
        <button type="button" class="comp-tab-btn px-4 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-800 shadow-2xs cursor-pointer flex items-center gap-1.5 flex-shrink-0" data-tab="summary">
          <span>Resumen General</span>
        </button>
        <button type="button" class="comp-tab-btn px-4 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/60 cursor-pointer flex items-center gap-1.5 flex-shrink-0" data-tab="both">
          <span class="w-2 h-2 rounded-full bg-rose-500"></span>
          <span>Repiten Ambos</span>
          <span id="tab-count-both" class="bg-rose-100 text-rose-800 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">0</span>
        </button>
        <button type="button" class="comp-tab-btn px-4 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/60 cursor-pointer flex items-center gap-1.5 flex-shrink-0" data-tab="sat">
          <span class="w-2 h-2 rounded-full bg-blue-500"></span>
          <span>Repiten Sábado</span>
          <span id="tab-count-sat" class="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">0</span>
        </button>
        <button type="button" class="comp-tab-btn px-4 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/60 cursor-pointer flex items-center gap-1.5 flex-shrink-0" data-tab="sun">
          <span class="w-2 h-2 rounded-full bg-purple-500"></span>
          <span>Repiten Domingo</span>
          <span id="tab-count-sun" class="bg-purple-100 text-purple-800 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">0</span>
        </button>
        <button type="button" class="comp-tab-btn px-4 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/60 cursor-pointer flex items-center gap-1.5 flex-shrink-0" data-tab="lastOnly">
          <span>Sólo Pasado</span>
          <span id="tab-count-last" class="bg-slate-200 text-slate-800 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">0</span>
        </button>
        <button type="button" class="comp-tab-btn px-4 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/60 cursor-pointer flex items-center gap-1.5 flex-shrink-0" data-tab="thisOnly">
          <span>Sólo Este</span>
          <span id="tab-count-this" class="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">0</span>
        </button>
      </div>

      <!-- Main Body Container -->
      <div id="comp-body-content" class="p-6 overflow-y-auto flex-1 bg-slate-50/50">
        <div id="comp-loading-state" class="hidden text-center py-16 text-slate-500">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mb-2 border border-emerald-100">
            <i class="ti ti-loader spin-icon text-2xl"></i>
          </div>
          <p class="text-xs font-bold text-slate-700">Analizando designaciones de las 4 jornadas...</p>
        </div>

        <div id="comp-view-container"></div>
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
    btn.addEventListener("click", closeComparativeModal);
  });
  modalEl.addEventListener("click", (e) => {
    if (e.target === modalEl) closeComparativeModal();
  });

  const btnGen = modalEl.querySelector("#btn-comp-generate");
  if (btnGen) {
    btnGen.addEventListener("click", generateReport);
  }

  const btnPrintDirect = modalEl.querySelector("#btn-comp-print-direct");
  if (btnPrintDirect) {
    btnPrintDirect.addEventListener("click", () => {
      if (currentComparativaData) printComparativaReport(currentComparativaData);
    });
  }

  const tabBtns = modalEl.querySelectorAll(".comp-tab-btn");
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      switchCompTab(tab);
    });
  });
}

function switchCompTab(tab) {
  activeCompTab = tab;
  if (!modalEl) return;

  modalEl.querySelectorAll(".comp-tab-btn").forEach((btn) => {
    if (btn.dataset.tab === tab) {
      btn.className = "comp-tab-btn px-4 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-800 shadow-2xs cursor-pointer flex items-center gap-1.5 flex-shrink-0";
    } else {
      btn.className = "comp-tab-btn px-4 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/60 cursor-pointer flex items-center gap-1.5 flex-shrink-0";
    }
  });

  renderActiveTabContent();
}

export async function openComparativeModal(designationsList) {
  if (!modalEl) initComparativeModal();

  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -1 : 6 - day;

  const thisSat = new Date(now);
  thisSat.setDate(now.getDate() + diff);
  const thisSun = new Date(thisSat);
  thisSun.setDate(thisSat.getDate() + 1);

  const lastSat = new Date(thisSat);
  lastSat.setDate(thisSat.getDate() - 7);
  const lastSun = new Date(lastSat);
  lastSun.setDate(lastSat.getDate() + 1);

  modalEl.querySelector("#comp-last-sat").value = getLocalDateString(lastSat);
  modalEl.querySelector("#comp-last-sun").value = getLocalDateString(lastSun);
  modalEl.querySelector("#comp-this-sat").value = getLocalDateString(thisSat);
  modalEl.querySelector("#comp-this-sun").value = getLocalDateString(thisSun);

  modalEl.classList.remove("hidden");
  await generateReport();
}

async function fetchDayDesignationsWithReferees(dateStr) {
  if (!dateStr) return [];
  try {
    let list = [];
    try {
      const desigsRes = await designacionService.getByFecha(dateStr);
      list = Array.isArray(desigsRes) ? desigsRes : (desigsRes && desigsRes.data ? desigsRes.data : []);
    } catch (e) {
      console.warn("getByFecha failed, trying buscarPorRango:", e);
    }

    if (!list || list.length === 0) {
      try {
        const nextDay = new Date(dateStr + "T12:00:00");
        nextDay.setDate(nextDay.getDate() + 1);
        const nextDayStr = getLocalDateString(nextDay);
        const rangeRes = await designacionService.buscarPorRango(dateStr, nextDayStr);
        const rawRange = Array.isArray(rangeRes) ? rangeRes : (rangeRes && rangeRes.data ? rangeRes.data : []);
        list = rawRange.filter((d) => getLocalDateString(d.fecha || d.fechaYHora) === dateStr);
      } catch (errRange) {
        console.warn("buscarPorRango failed as well:", errRange);
      }
    }

    const activeList = (list || []).filter((d) => {
      const st = d.estadoDesignacion !== undefined ? d.estadoDesignacion : d.estado;
      return st !== 3 && st !== "CANCELADA" && st !== "SUSPENDIDA" && st !== 4;
    });

    return await Promise.all(
      activeList.map(async (d) => {
        const id = d.idDesignacion || d.id;
        try {
          const refsRes = d.designados && Array.isArray(d.designados)
            ? d.designados
            : await designadoService.getByDesignacion(id);
          d.designados = Array.isArray(refsRes) ? refsRes : (refsRes && refsRes.data ? refsRes.data : []);
        } catch (e) {
          d.designados = [];
        }
        return d;
      })
    );
  } catch (err) {
    console.warn("Error fetching date for comparativa:", dateStr, err);
    return [];
  }
}

function extractMatchesInfo(designation) {
  const canchaName = designation.cancha ? (designation.cancha.nombreCancha || designation.cancha.nombre) : "Cancha";
  const fechaStr = designation.fecha || designation.fechaYHora || "";
  let horaStr = "";
  if (fechaStr.includes("T")) {
    const timePart = fechaStr.split("T")[1];
    if (timePart) {
      const [hh, mm] = timePart.split(":");
      horaStr = `${hh}:${mm}hs`;
    }
  }
  return {
    cancha: canchaName,
    hora: horaStr || "Horario a conf.",
  };
}

async function generateReport() {
  const lastSat = modalEl.querySelector("#comp-last-sat").value;
  const lastSun = modalEl.querySelector("#comp-last-sun").value;
  const thisSat = modalEl.querySelector("#comp-this-sat").value;
  const thisSun = modalEl.querySelector("#comp-this-sun").value;

  if (!lastSat || !lastSun || !thisSat || !thisSun) {
    addToast("Complete todas las fechas.", "error");
    return;
  }

  const btnGen = modalEl.querySelector("#btn-comp-generate");
  const loading = modalEl.querySelector("#comp-loading-state");
  const viewContainer = modalEl.querySelector("#comp-view-container");
  const btnPrintDirect = modalEl.querySelector("#btn-comp-print-direct");

  btnGen.disabled = true;
  btnGen.innerHTML = `<i class="ti ti-loader spin-icon"></i> <span>Calculando...</span>`;
  if (loading) loading.classList.remove("hidden");
  if (viewContainer) viewContainer.innerHTML = "";

  try {
    const [lastSatDesigs, lastSunDesigs, thisSatDesigs, thisSunDesigs] = await Promise.all([
      fetchDayDesignationsWithReferees(lastSat),
      fetchDayDesignationsWithReferees(lastSun),
      fetchDayDesignationsWithReferees(thisSat),
      fetchDayDesignationsWithReferees(thisSun),
    ]);

    const arbMap = {};

    const processList = (desigs, dayField) => {
      desigs.forEach((desig) => {
        const matchInfo = extractMatchesInfo(desig);
        (desig.designados || []).forEach((item) => {
          const a = item.arbitro || item;
          const arbId = a.idArbitro || a.id || item.idArbitro;
          if (!arbId) return;

          if (!arbMap[arbId]) {
            arbMap[arbId] = {
              idArbitro: arbId,
              nombre: a.nombre || "",
              apellido: a.apellido || "",
              rol: a.rol || "Árbitro",
              categoria: a.categoria || "N/A",
              lastSaturday: [],
              lastSunday: [],
              thisSaturday: [],
              thisSunday: [],
            };
          }

          arbMap[arbId][dayField].push(matchInfo);
        });
      });
    };

    processList(lastSatDesigs, "lastSaturday");
    processList(lastSunDesigs, "lastSunday");
    processList(thisSatDesigs, "thisSaturday");
    processList(thisSunDesigs, "thisSunday");

    const allArbitros = Object.values(arbMap).map((arb) => {
      const lastWeekendCount = arb.lastSaturday.length + arb.lastSunday.length;
      const thisWeekendCount = arb.thisSaturday.length + arb.thisSunday.length;
      return {
        ...arb,
        lastWeekendCount,
        thisWeekendCount,
      };
    });

    const repitenAmbosSabDom = allArbitros.filter(
      (a) => (a.lastSaturday.length > 0 || a.lastSunday.length > 0) && (a.thisSaturday.length > 0 && a.thisSunday.length > 0)
    );

    const repitenSabado = allArbitros.filter(
      (a) => a.lastSaturday.length > 0 && a.thisSaturday.length > 0 && !(a.thisSaturday.length > 0 && a.thisSunday.length > 0)
    );

    const repitenDomingo = allArbitros.filter(
      (a) => a.lastSunday.length > 0 && a.thisSunday.length > 0 && !(a.thisSaturday.length > 0 && a.thisSunday.length > 0)
    );

    const soloFindePasado = allArbitros.filter(
      (a) => a.lastWeekendCount > 0 && a.thisWeekendCount === 0
    );

    const soloEsteFinde = allArbitros.filter(
      (a) => a.lastWeekendCount === 0 && a.thisWeekendCount > 0
    );

    currentComparativaData = {
      datesLast: { saturday: lastSat, sunday: lastSun },
      datesThis: { saturday: thisSat, sunday: thisSun },
      repitenAmbosSabDom,
      repitenSabado,
      repitenDomingo,
      soloFindePasado,
      soloEsteFinde,
    };

    // Update badges
    modalEl.querySelector("#tab-count-both").textContent = repitenAmbosSabDom.length;
    modalEl.querySelector("#tab-count-sat").textContent = repitenSabado.length;
    modalEl.querySelector("#tab-count-sun").textContent = repitenDomingo.length;
    modalEl.querySelector("#tab-count-last").textContent = soloFindePasado.length;
    modalEl.querySelector("#tab-count-this").textContent = soloEsteFinde.length;

    if (btnPrintDirect) btnPrintDirect.classList.remove("hidden");

    renderActiveTabContent();
  } catch (err) {
    console.error(err);
    addToast("Error al procesar la comparativa.", "error");
  } finally {
    btnGen.disabled = false;
    btnGen.innerHTML = `<i class="ti ti-refresh text-sm"></i> <span>Actualizar Comparativa</span>`;
    if (loading) loading.classList.add("hidden");
  }
}

function renderActiveTabContent() {
  const container = modalEl.querySelector("#comp-view-container");
  if (!container || !currentComparativaData) return;

  const { repitenAmbosSabDom, repitenSabado, repitenDomingo, soloFindePasado, soloEsteFinde } = currentComparativaData;

  if (activeCompTab === "summary") {
    container.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div class="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex flex-col justify-between cursor-pointer hover:shadow-sm transition" onclick="document.querySelector('.comp-tab-btn[data-tab=both]').click()">
          <span class="text-[10px] font-bold text-rose-800 uppercase tracking-wider">Repiten Ambos</span>
          <span class="text-2xl font-black text-rose-900 mt-2">${repitenAmbosSabDom.length}</span>
          <span class="text-[10px] text-rose-700 mt-1">Carga doble fin de semana</span>
        </div>
        <div class="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex flex-col justify-between cursor-pointer hover:shadow-sm transition" onclick="document.querySelector('.comp-tab-btn[data-tab=sat]').click()">
          <span class="text-[10px] font-bold text-blue-800 uppercase tracking-wider">Repiten Sábado</span>
          <span class="text-2xl font-black text-blue-900 mt-2">${repitenSabado.length}</span>
          <span class="text-[10px] text-blue-700 mt-1">Sáb. pasado y este Sáb.</span>
        </div>
        <div class="bg-purple-50 border border-purple-200 p-4 rounded-2xl flex flex-col justify-between cursor-pointer hover:shadow-sm transition" onclick="document.querySelector('.comp-tab-btn[data-tab=sun]').click()">
          <span class="text-[10px] font-bold text-purple-800 uppercase tracking-wider">Repiten Domingo</span>
          <span class="text-2xl font-black text-purple-900 mt-2">${repitenDomingo.length}</span>
          <span class="text-[10px] text-purple-700 mt-1">Dom. pasado y este Dom.</span>
        </div>
        <div class="bg-slate-100 border border-slate-200 p-4 rounded-2xl flex flex-col justify-between cursor-pointer hover:shadow-sm transition" onclick="document.querySelector('.comp-tab-btn[data-tab=lastOnly]').click()">
          <span class="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Sólo Pasado</span>
          <span class="text-2xl font-black text-slate-800 mt-2">${soloFindePasado.length}</span>
          <span class="text-[10px] text-slate-500 mt-1">Descansan este finde</span>
        </div>
        <div class="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex flex-col justify-between cursor-pointer hover:shadow-sm transition" onclick="document.querySelector('.comp-tab-btn[data-tab=thisOnly]').click()">
          <span class="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Sólo Este</span>
          <span class="text-2xl font-black text-emerald-900 mt-2">${soloEsteFinde.length}</span>
          <span class="text-[10px] text-emerald-700 mt-1">No dirigieron el anterior</span>
        </div>
      </div>

      <div class="flex flex-col gap-4">
        <h4 class="font-extrabold text-slate-800 text-sm flex items-center gap-2">
          <span>⚠️</span>
          <span>Árbitros con mayor carga (Repiten Ambos Días):</span>
        </h4>
        ${renderRefereeTable(repitenAmbosSabDom)}
      </div>
    `;
    return;
  }

  const tabMap = {
    both: { title: "Repiten Ambos Sábado y Domingo", list: repitenAmbosSabDom, badgeColor: "bg-rose-100 text-rose-800" },
    sat: { title: "Repiten Sábado", list: repitenSabado, badgeColor: "bg-blue-100 text-blue-800" },
    sun: { title: "Repiten Domingo", list: repitenDomingo, badgeColor: "bg-purple-100 text-purple-800" },
    lastOnly: { title: "Sólo Fin de Semana Pasado", list: soloFindePasado, badgeColor: "bg-slate-100 text-slate-800" },
    thisOnly: { title: "Sólo Este Fin de Semana", list: soloEsteFinde, badgeColor: "bg-emerald-100 text-emerald-800" },
  };

  const current = tabMap[activeCompTab] || tabMap.both;
  container.innerHTML = `
    <div class="flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <h4 class="font-extrabold text-slate-800 text-sm flex items-center gap-2">
          <span>${current.title}</span>
          <span class="${current.badgeColor} text-xs font-black px-2.5 py-0.5 rounded-full">${current.list.length} árbitros</span>
        </h4>
      </div>
      ${renderRefereeTable(current.list)}
    </div>
  `;
}

function renderRefereeTable(list) {
  if (!list || !list.length) {
    return `
      <div class="bg-white border border-dashed border-slate-200 rounded-3xl p-8 text-center text-slate-400 text-xs">
        <i class="ti ti-users-minus text-2xl block mb-1 text-slate-300"></i>
        No hay árbitros en esta categoría.
      </div>
    `;
  }

  return `
    <div class="flex flex-col gap-3">
      ${list
        .map((arb) => {
          const n = arb.nombre ? arb.nombre[0] : "";
          const ap = arb.apellido ? arb.apellido[0] : "";
          const initials = (n + ap).toUpperCase();

          const isExtremeLoad =
            arb.lastSaturday.length > 0 &&
            arb.lastSunday.length > 0 &&
            arb.thisSaturday.length > 0 &&
            arb.thisSunday.length > 0;

          const renderMatches = (matches) => {
            if (!matches.length) return `<span class="text-slate-400 text-[10px] italic">Sin partidos</span>`;
            return matches
              .map((m) => `<span class="inline-block bg-slate-100 px-2 py-0.5 rounded text-[10px] font-semibold text-slate-700 mr-1 mb-1">🏟️ ${m.cancha} · ⏰ ${m.hora}</span>`)
              .join("");
          };

          return `
            <div class="bg-white border ${isExtremeLoad ? 'border-rose-300 bg-rose-50/20 shadow-xs' : 'border-slate-200/90'} rounded-2xl p-4 shadow-2xs hover:shadow-xs transition flex flex-col gap-3">
              <!-- Top Row: Referee Info and Warning Badge -->
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-9 h-9 rounded-full ${isExtremeLoad ? 'bg-rose-600 text-white' : 'bg-slate-800 text-white'} font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-2xs">
                    ${initials}
                  </div>
                  <div class="min-w-0">
                    <h4 class="font-bold text-slate-800 text-sm truncate">${arb.nombre} ${arb.apellido}</h4>
                    <div class="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <span class="badge badge-gray text-[9px] px-1.5 py-0.2">${arb.rol}</span>
                      <span class="badge badge-gray text-[9px] px-1.5 py-0.2">${arb.categoria}</span>
                    </div>
                  </div>
                </div>
                <div>
                  ${
                    isExtremeLoad
                      ? `<span class="bg-rose-100 border border-rose-300 text-rose-800 text-[10px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1">⚠️ Carga Extrema Sáb/Dom</span>`
                      : (arb.lastWeekendCount > 0 && arb.thisWeekendCount > 0)
                      ? `<span class="bg-amber-100 border border-amber-300 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-xl">Repite Finde</span>`
                      : `<span class="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-lg">${arb.thisWeekendCount} este finde</span>`
                  }
                </div>
              </div>

              <!-- Comparative 2-Column Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <!-- Finde Pasado -->
                <div class="bg-slate-50/90 border border-slate-200/70 rounded-xl p-3 text-xs flex flex-col gap-2">
                  <div class="flex items-center justify-between border-b border-slate-200 pb-1.5 text-slate-600">
                    <span class="font-bold flex items-center gap-1">📅 Finde Pasado:</span>
                    <span class="font-black text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200">${arb.lastWeekendCount} part.</span>
                  </div>
                  <div class="flex flex-col gap-1.5 text-[11px]">
                    <div>
                      <strong class="text-emerald-800">Sáb:</strong>
                      <div class="mt-0.5 pl-1">${renderMatches(arb.lastSaturday)}</div>
                    </div>
                    <div>
                      <strong class="text-blue-800">Dom:</strong>
                      <div class="mt-0.5 pl-1">${renderMatches(arb.lastSunday)}</div>
                    </div>
                  </div>
                </div>

                <!-- Este Finde -->
                <div class="${isExtremeLoad ? 'bg-rose-50/50 border-rose-200' : 'bg-slate-50/90 border-slate-200/70'} border rounded-xl p-3 text-xs flex flex-col gap-2">
                  <div class="flex items-center justify-between border-b border-slate-200 pb-1.5 text-slate-600">
                    <span class="font-bold flex items-center gap-1">📅 Este Finde:</span>
                    <span class="font-black text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200">${arb.thisWeekendCount} part.</span>
                  </div>
                  <div class="flex flex-col gap-1.5 text-[11px]">
                    <div>
                      <strong class="text-emerald-800">Sáb:</strong>
                      <div class="mt-0.5 pl-1">${renderMatches(arb.thisSaturday)}</div>
                    </div>
                    <div>
                      <strong class="text-blue-800">Dom:</strong>
                      <div class="mt-0.5 pl-1">${renderMatches(arb.thisSunday)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

export function closeComparativeModal() {
  if (modalEl) modalEl.classList.add("hidden");
}
