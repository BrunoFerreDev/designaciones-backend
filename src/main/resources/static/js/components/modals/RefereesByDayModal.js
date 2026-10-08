import designadoService from "../../services/designadoService.js";
import arbitroService from "../../services/arbitroService.js";
import { formatFecha, getDayOfWeekLocal, addToast } from "../../helpers.js";

let modalEl = null;
let allArbitrosCache = [];
let lastCalculatedData = null;
let currentTab = "todos"; // 'todos', 'ambos', 'sabado', 'domingo', 'sinDesignar'

export function initRefereesByDayModal() {
  if (document.getElementById("referees-by-day-modal")) {
    modalEl = document.getElementById("referees-by-day-modal");
    bindEvents();
    return;
  }

  const div = document.createElement("div");
  div.id = "referees-by-day-modal";
  div.className = "modal-overlay hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4";
  div.innerHTML = `
    <div class="bg-white rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[92vh]">
      <!-- Header -->
      <div class="px-6 py-4 bg-slate-50 border-b border-slate-150 flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shadow-2xs">
            <i class="ti ti-users text-xl"></i>
          </div>
          <div>
            <h3 class="font-extrabold text-slate-800 text-base">Árbitros Designados por Día</h3>
            <div class="text-xs text-slate-500 font-medium">Resumen de árbitros asignados para el fin de semana (excluye finalizadas)</div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button type="button" id="btn-print-referees-by-day" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs">
            <i class="ti ti-printer text-sm"></i>
            <span>Imprimir Listado</span>
          </button>
          <button type="button" class="modal-close-btn p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition cursor-pointer">
            <i class="ti ti-x text-lg"></i>
          </button>
        </div>
      </div>

      <!-- Resumen Estadístico (4 Cards) -->
      <div class="px-6 pt-5 bg-white">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="card p-3 rounded-2xl border-l-4 border-l-blue-500 bg-blue-50/70 border border-blue-100 flex flex-col justify-between cursor-pointer hover:shadow-xs transition" data-filter="ambos">
            <div class="text-[9px] font-bold text-blue-900 uppercase tracking-wider">Ambos Días</div>
            <div id="stat-ambos-count" class="text-2xl font-black text-blue-900 my-1">0</div>
            <div class="text-[10px] text-blue-700 font-semibold">Sábado y Domingo</div>
          </div>

          <div class="card p-3 rounded-2xl border-l-4 border-l-emerald-500 bg-emerald-50/70 border border-emerald-100 flex flex-col justify-between cursor-pointer hover:shadow-xs transition" data-filter="sabado">
            <div class="text-[9px] font-bold text-emerald-900 uppercase tracking-wider">Sólo Sábado</div>
            <div id="stat-sabado-count" class="text-2xl font-black text-emerald-900 my-1">0</div>
            <div class="text-[10px] text-emerald-700 font-semibold">Sólo jornada Sáb.</div>
          </div>

          <div class="card p-3 rounded-2xl border-l-4 border-l-amber-500 bg-amber-50/70 border border-amber-100 flex flex-col justify-between cursor-pointer hover:shadow-xs transition" data-filter="domingo">
            <div class="text-[9px] font-bold text-amber-900 uppercase tracking-wider">Sólo Domingo</div>
            <div id="stat-domingo-count" class="text-2xl font-black text-amber-900 my-1">0</div>
            <div class="text-[10px] text-amber-700 font-semibold">Sólo jornada Dom.</div>
          </div>

          <div class="card p-3 rounded-2xl border-l-4 border-l-rose-500 bg-rose-50/70 border border-rose-100 flex flex-col justify-between cursor-pointer hover:shadow-xs transition" data-filter="sinDesignar">
            <div class="text-[9px] font-bold text-rose-900 uppercase tracking-wider">Sin Designar</div>
            <div id="stat-sindesignar-count" class="text-2xl font-black text-rose-900 my-1">0</div>
            <div class="text-[10px] text-rose-700 font-semibold">Sin partidos asignados</div>
          </div>
        </div>
      </div>

      <!-- Filter Tabs Navigation -->
      <div class="px-6 py-3 bg-white border-b border-slate-150 flex items-center gap-2 overflow-x-auto">
        <div class="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
          <button type="button" class="ref-tab-btn px-4 py-1.5 rounded-xl text-xs font-bold transition bg-white text-slate-800 shadow-2xs flex items-center gap-1.5 cursor-pointer" data-tab="todos">
            <span>Todos Desig.</span>
            <span id="tab-count-todos" class="bg-slate-200 text-slate-800 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">0</span>
          </button>
          <button type="button" class="ref-tab-btn px-4 py-1.5 rounded-xl text-xs font-bold transition text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 flex items-center gap-1.5 cursor-pointer" data-tab="ambos">
            <span>Ambos Días</span>
            <span id="tab-count-ambos" class="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">0</span>
          </button>
          <button type="button" class="ref-tab-btn px-4 py-1.5 rounded-xl text-xs font-bold transition text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 flex items-center gap-1.5 cursor-pointer" data-tab="sabado">
            <span>Sólo Sábado</span>
            <span id="tab-count-sabado" class="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">0</span>
          </button>
          <button type="button" class="ref-tab-btn px-4 py-1.5 rounded-xl text-xs font-bold transition text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 flex items-center gap-1.5 cursor-pointer" data-tab="domingo">
            <span>Sólo Domingo</span>
            <span id="tab-count-domingo" class="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">0</span>
          </button>
          <button type="button" class="ref-tab-btn px-4 py-1.5 rounded-xl text-xs font-bold transition text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 flex items-center gap-1.5 cursor-pointer" data-tab="sinDesignar">
            <span>Sin Designar</span>
            <span id="tab-count-sindesignar" class="bg-rose-100 text-rose-800 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">0</span>
          </button>
        </div>
      </div>

      <!-- Main Body List Container -->
      <div class="p-6 overflow-y-auto flex-1 bg-slate-50/50">
        <div id="ref-list-loading" class="hidden text-center py-16 text-slate-500">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mb-2 border border-emerald-100">
            <i class="ti ti-loader spin-icon text-2xl"></i>
          </div>
          <p class="text-xs font-bold text-slate-700">Cargando árbitros y partidos...</p>
        </div>

        <div id="ref-list-container" class="flex flex-col gap-3"></div>
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
    btn.addEventListener("click", closeRefereesByDayModal);
  });
  modalEl.addEventListener("click", (e) => {
    if (e.target === modalEl) closeRefereesByDayModal();
  });

  const tabBtns = modalEl.querySelectorAll(".ref-tab-btn");
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      switchTab(btn.dataset.tab);
    });
  });

  const statCards = modalEl.querySelectorAll("[data-filter]");
  statCards.forEach((card) => {
    card.addEventListener("click", () => {
      switchTab(card.dataset.filter);
    });
  });

  const btnPrint = modalEl.querySelector("#btn-print-referees-by-day");
  if (btnPrint) {
    btnPrint.addEventListener("click", printRefereesByDayReport);
  }
}

function switchTab(tab) {
  currentTab = tab;
  if (!modalEl) return;

  modalEl.querySelectorAll(".ref-tab-btn").forEach((btn) => {
    if (btn.dataset.tab === tab) {
      btn.className = "ref-tab-btn px-4 py-1.5 rounded-xl text-xs font-bold transition bg-white text-slate-800 shadow-2xs flex items-center gap-1.5 cursor-pointer";
    } else {
      btn.className = "ref-tab-btn px-4 py-1.5 rounded-xl text-xs font-bold transition text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 flex items-center gap-1.5 cursor-pointer";
    }
  });

  renderRefereesList();
}

export async function openRefereesByDayModal(designationsList) {
  if (!modalEl) initRefereesByDayModal();

  const loadingEl = modalEl.querySelector("#ref-list-loading");
  const containerEl = modalEl.querySelector("#ref-list-container");

  if (loadingEl) loadingEl.classList.remove("hidden");
  if (containerEl) containerEl.innerHTML = "";
  modalEl.classList.remove("hidden");

  try {
    if (!allArbitrosCache.length) {
      const arbRes = await arbitroService.getAll();
      allArbitrosCache = Array.isArray(arbRes) ? arbRes : (arbRes.data || []);
    }

    // Exclude finalized (state 2) and cancelled/suspended (state 3/4)
    const activeList = (designationsList || []).filter((d) => {
      const st = d.estadoDesignacion !== undefined ? d.estadoDesignacion : d.estado;
      const isFinalizada = st === 2 || st === "FINALIZADA";
      const isCancelada = st === 3 || st === "CANCELADA" || st === "SUSPENDIDA" || st === 4;
      return !isFinalizada && !isCancelada;
    });

    const arbMap = {};

    await Promise.all(
      activeList.map(async (desig) => {
        const id = desig.idDesignacion || desig.id;
        const fechaVal = desig.fecha || desig.fechaYHora || "";
        const dayIndex = getDayOfWeekLocal(fechaVal);
        const isSunday = dayIndex === 0;

        const res = desig.designados && Array.isArray(desig.designados)
          ? desig.designados
          : await designadoService.getByDesignacion(id);
        const designados = Array.isArray(res) ? res : (res && res.data ? res.data : []);
        const canchaName = desig.cancha ? (desig.cancha.nombreCancha || desig.cancha.nombre) : "Cancha";
        const cantPartidos = desig.cantidadPartidos || 1;

        let hora = "Horario a confirmar";
        if (fechaVal.includes("T")) {
          const timePart = fechaVal.split("T")[1];
          if (timePart) {
            const parts = timePart.split(":");
            const hh = Number(parts[0]);
            const min = Number(parts[1]);
            hora = hh === 0 && min === 0 ? "Horario a confirmar" : (min === 0 ? `${hh}hs` : `${parts[0]}:${parts[1]}hs`);
          }
        }

        designados.forEach((item) => {
          const a = item.arbitro || {};
          const arbId = a.idArbitro || a.id;
          if (!arbId) return;

          if (!arbMap[arbId]) {
            arbMap[arbId] = {
              idArbitro: arbId,
              nombre: a.nombre || "",
              apellido: a.apellido || "",
              rol: a.rol || "Árbitro",
              categoria: a.categoria || "N/A",
              saturday: [],
              sunday: [],
            };
          }

          const matchDetail = {
            id,
            cancha: canchaName,
            hora,
            cantidadPartidos: cantPartidos,
            estadoDesignacion: desig.estadoDesignacion !== undefined ? desig.estadoDesignacion : desig.estado,
          };

          if (isSunday) {
            if (!arbMap[arbId].sunday.some((m) => m.id === id)) {
              arbMap[arbId].sunday.push(matchDetail);
            }
          } else {
            if (!arbMap[arbId].saturday.some((m) => m.id === id)) {
              arbMap[arbId].saturday.push(matchDetail);
            }
          }
        });
      })
    );

    const arbitrosResumen = Object.values(arbMap);

    const ambosDias = arbitrosResumen.filter((a) => {
      const hasSat = a.saturday.some((m) => m.estadoDesignacion !== 3 && m.estadoDesignacion !== "CANCELADA");
      const hasSun = a.sunday.some((m) => m.estadoDesignacion !== 3 && m.estadoDesignacion !== "CANCELADA");
      return hasSat && hasSun;
    });

    const soloSabado = arbitrosResumen.filter((a) => {
      const hasSat = a.saturday.some((m) => m.estadoDesignacion !== 3 && m.estadoDesignacion !== "CANCELADA");
      const hasSun = a.sunday.some((m) => m.estadoDesignacion !== 3 && m.estadoDesignacion !== "CANCELADA");
      return hasSat && !hasSun;
    });

    const soloDomingo = arbitrosResumen.filter((a) => {
      const hasSat = a.saturday.some((m) => m.estadoDesignacion !== 3 && m.estadoDesignacion !== "CANCELADA");
      const hasSun = a.sunday.some((m) => m.estadoDesignacion !== 3 && m.estadoDesignacion !== "CANCELADA");
      return !hasSat && hasSun;
    });

    const assignedIds = new Set(arbitrosResumen.map((a) => a.idArbitro));
    const sinDesignar = allArbitrosCache
      .filter((arb) => arb.estadoSistema && !assignedIds.has(arb.idArbitro))
      .map((arb) => ({
        idArbitro: arb.idArbitro,
        nombre: arb.nombre || "",
        apellido: arb.apellido || "",
        rol: arb.rol || "Árbitro",
        categoria: arb.categoria || "N/A",
        disponibleSabado: arb.disponibleSabado,
        disponibleDomingo: arb.disponibleDomingo,
        saturday: [],
        sunday: [],
      }));

    lastCalculatedData = {
      todos: arbitrosResumen,
      ambos: ambosDias,
      sabado: soloSabado,
      domingo: soloDomingo,
      sinDesignar,
    };

    // Update counts on cards and tabs
    modalEl.querySelector("#stat-ambos-count").textContent = ambosDias.length;
    modalEl.querySelector("#stat-sabado-count").textContent = soloSabado.length;
    modalEl.querySelector("#stat-domingo-count").textContent = soloDomingo.length;
    modalEl.querySelector("#stat-sindesignar-count").textContent = sinDesignar.length;

    modalEl.querySelector("#tab-count-todos").textContent = arbitrosResumen.length;
    modalEl.querySelector("#tab-count-ambos").textContent = ambosDias.length;
    modalEl.querySelector("#tab-count-sabado").textContent = soloSabado.length;
    modalEl.querySelector("#tab-count-domingo").textContent = soloDomingo.length;
    modalEl.querySelector("#tab-count-sindesignar").textContent = sinDesignar.length;

    switchTab("todos");
  } catch (err) {
    console.error(err);
    addToast("Error al cargar datos del resumen de árbitros.", "error");
  } finally {
    if (loadingEl) loadingEl.classList.add("hidden");
  }
}

function renderRefereesList() {
  const container = modalEl.querySelector("#ref-list-container");
  if (!container || !lastCalculatedData) return;

  const list = lastCalculatedData[currentTab] || lastCalculatedData.todos;
  const sorted = [...list].sort((a, b) => a.nombre.localeCompare(b.nombre));

  if (!sorted.length) {
    container.innerHTML = `
      <div class="bg-white border border-dashed border-slate-200 rounded-3xl p-8 text-center text-slate-400 text-xs">
        <i class="ti ti-users-minus text-2xl block mb-1 text-slate-300"></i>
        No hay árbitros en esta categoría.
      </div>
    `;
    return;
  }

  container.innerHTML = sorted
    .map((arb) => {
      const n = arb.nombre ? arb.nombre[0] : "";
      const ap = arb.apellido ? arb.apellido[0] : "";
      const initials = (n + ap).toUpperCase();

      const isSinDesignar = currentTab === "sinDesignar";

      // Badges
      let dayBadgesHTML = "";
      if (!isSinDesignar) {
        if (arb.saturday && arb.saturday.length > 0) {
          dayBadgesHTML += `<span class="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-lg">Sábado</span> `;
        }
        if (arb.sunday && arb.sunday.length > 0) {
          dayBadgesHTML += `<span class="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-lg">Domingo</span>`;
        }
      } else {
        dayBadgesHTML = `<span class="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-lg">Sin Asignar</span>`;
      }

      // Match details or availability
      let detailsHTML = "";
      if (!isSinDesignar) {
        let satMatchesHTML = "";
        if (arb.saturday && arb.saturday.length > 0) {
          satMatchesHTML = `
            <div class="mb-1.5">
              <div class="font-bold text-emerald-800 text-[11px] flex items-center gap-1.5 mb-1">
                <span>⚽ Sábado:</span>
              </div>
              <div class="flex flex-col gap-1 pl-2">
                ${arb.saturday.map((m) => `
                  <div class="text-xs text-slate-700 flex items-center gap-2">
                    <span class="font-semibold text-slate-800">🏟️ ${m.cancha}</span>
                    <span class="text-slate-300">·</span>
                    <span class="text-slate-500">⏰ ${m.hora}</span>
                    <span class="text-slate-300">·</span>
                    <span class="bg-slate-200/70 text-slate-700 font-bold px-1.5 py-0.2 rounded text-[10px]">${m.cantidadPartidos} part.</span>
                  </div>
                `).join("")}
              </div>
            </div>
          `;
        }

        let sunMatchesHTML = "";
        if (arb.sunday && arb.sunday.length > 0) {
          sunMatchesHTML = `
            <div>
              <div class="font-bold text-blue-800 text-[11px] flex items-center gap-1.5 mb-1">
                <span>⚽ Domingo:</span>
              </div>
              <div class="flex flex-col gap-1 pl-2">
                ${arb.sunday.map((m) => `
                  <div class="text-xs text-slate-700 flex items-center gap-2">
                    <span class="font-semibold text-slate-800">🏟️ ${m.cancha}</span>
                    <span class="text-slate-300">·</span>
                    <span class="text-slate-500">⏰ ${m.hora}</span>
                    <span class="text-slate-300">·</span>
                    <span class="bg-slate-200/70 text-slate-700 font-bold px-1.5 py-0.2 rounded text-[10px]">${m.cantidadPartidos} part.</span>
                  </div>
                `).join("")}
              </div>
            </div>
          `;
        }

        detailsHTML = `
          <div class="bg-slate-50 border border-slate-200/70 rounded-xl p-3 mt-2 flex flex-col gap-1">
            ${satMatchesHTML}
            ${sunMatchesHTML}
          </div>
        `;
      } else {
        detailsHTML = `
          <div class="bg-slate-50 border border-slate-200/70 rounded-xl p-2.5 mt-2 text-[11px] text-slate-500 flex items-center gap-3">
            <span class="font-bold text-slate-700">Disponibilidad declarada:</span>
            <span class="px-2 py-0.5 rounded-md font-semibold ${arb.disponibleSabado ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}">
              Sáb: ${arb.disponibleSabado ? 'Disponible' : 'No disponible'}
            </span>
            <span class="px-2 py-0.5 rounded-md font-semibold ${arb.disponibleDomingo ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}">
              Dom: ${arb.disponibleDomingo ? 'Disponible' : 'No disponible'}
            </span>
          </div>
        `;
      }

      return `
        <div class="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition flex flex-col">
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-9 h-9 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-2xs">
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
            <div class="flex items-center gap-1 flex-shrink-0">
              ${dayBadgesHTML}
            </div>
          </div>
          ${detailsHTML}
        </div>
      `;
    })
    .join("");
}

function printRefereesByDayReport() {
  if (!lastCalculatedData) {
    addToast("No hay datos para imprimir.", "error");
    return;
  }

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Por favor, permite las ventanas emergentes para imprimir.");
    return;
  }

  const { todos, ambos, sabado, domingo, sinDesignar } = lastCalculatedData;

  const renderSectionTable = (list, title) => {
    if (!list.length) return "";
    return `
      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 13px; border-bottom: 1.5px solid #333; padding-bottom: 3px; margin-bottom: 6px; color: #111;">
          ${title} (${list.length} árbitros)
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 10px;">
          <thead>
            <tr style="background: #f4f4f4;">
              <th style="border: 1px solid #ddd; padding: 5px; text-align: left; width: 30%;">Árbitro</th>
              <th style="border: 1px solid #ddd; padding: 5px; text-align: left; width: 35%;">Partidos Sábado</th>
              <th style="border: 1px solid #ddd; padding: 5px; text-align: left; width: 35%;">Partidos Domingo</th>
            </tr>
          </thead>
          <tbody>
            ${list.map((a) => {
              const satStr = (a.saturday || []).map((m) => `• ${m.cancha} (${m.hora}, ${m.cantidadPartidos}p)`).join("<br>") || "-";
              const sunStr = (a.sunday || []).map((m) => `• ${m.cancha} (${m.hora}, ${m.cantidadPartidos}p)`).join("<br>") || "-";
              return `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 5px;"><strong>${a.nombre} ${a.apellido}</strong><br><span style="font-size: 9px; color: #666;">${a.categoria}</span></td>
                  <td style="border: 1px solid #ddd; padding: 5px;">${satStr}</td>
                  <td style="border: 1px solid #ddd; padding: 5px;">${sunStr}</td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    `;
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Reporte de Árbitros por Día</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 30px; color: #222; }
        h1 { font-size: 18px; margin-bottom: 4px; }
        .sub { font-size: 11px; color: #666; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <h1>Reporte de Árbitros Designados por Día</h1>
      <div class="sub">Distribución de árbitros para las jornadas del fin de semana (excluye designaciones finalizadas)</div>
      ${renderSectionTable(ambos, "1. Árbitros que dirigen Ambos Días (Sábado y Domingo)")}
      ${renderSectionTable(sabado, "2. Árbitros que dirigen Sólo Sábado")}
      ${renderSectionTable(domingo, "3. Árbitros que dirigen Sólo Domingo")}
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 400);
}

export function closeRefereesByDayModal() {
  if (modalEl) modalEl.classList.add("hidden");
}
