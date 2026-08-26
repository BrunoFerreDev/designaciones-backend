import designadoService from "../../services/designadoService.js";
import { formatFecha, getDayOfWeekLocal, addToast } from "../../helpers.js";

let modalEl = null;

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
    <div class="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
      <div class="px-6 py-4 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
        <h3 class="font-bold text-slate-800 text-base">📅 Árbitros Designados por Día</h3>
        <button type="button" class="modal-close-btn p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 cursor-pointer">
          <i class="ti ti-x text-lg"></i>
        </button>
      </div>
      <div class="p-6 overflow-y-auto flex flex-col gap-4 flex-1">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-slate-50 p-4 rounded-2xl border border-slate-150">
            <h4 class="font-bold text-slate-800 text-sm mb-3 flex items-center gap-1.5">
              <i class="ti ti-calendar text-blue-600"></i> Sábado
            </h4>
            <div id="day-saturday-list" class="flex flex-col gap-2 text-xs"></div>
          </div>
          <div class="bg-slate-50 p-4 rounded-2xl border border-slate-150">
            <h4 class="font-bold text-slate-800 text-sm mb-3 flex items-center gap-1.5">
              <i class="ti ti-calendar text-purple-600"></i> Domingo
            </h4>
            <div id="day-sunday-list" class="flex flex-col gap-2 text-xs"></div>
          </div>
        </div>
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
}

export async function openRefereesByDayModal(designationsList) {
  if (!modalEl) initRefereesByDayModal();

  const satList = modalEl.querySelector("#day-saturday-list");
  const sunList = modalEl.querySelector("#day-sunday-list");

  satList.innerHTML = `<div class="text-slate-400">Cargando sábado...</div>`;
  sunList.innerHTML = `<div class="text-slate-400">Cargando domingo...</div>`;
  modalEl.classList.remove("hidden");

  try {
    const activeList = (designationsList || []).filter((d) => d.estado !== "CANCELADA");

    const satMap = {};
    const sunMap = {};

    await Promise.all(
      activeList.map(async (desig) => {
        const fechaVal = desig.fecha || desig.fechaYHora;
        const dayIndex = getDayOfWeekLocal(fechaVal);
        const isSat = dayIndex === 6;
        const isSun = dayIndex === 0;

        if (!isSat && !isSun) return;

        const res = await designadoService.getByDesignacion(desig.idDesignacion);
        const designados = Array.isArray(res) ? res : (res && res.data ? res.data : []);
        const canchaName = desig.cancha ? (desig.cancha.nombreCancha || desig.cancha.nombre) : "Cancha";

        designados.forEach((item) => {
          const arb = item.arbitro;
          if (!arb) return;
          const key = arb.idArbitro;
          const targetMap = isSat ? satMap : sunMap;

          if (!targetMap[key]) {
            targetMap[key] = {
              nombre: `${arb.nombre} ${arb.apellido}`,
              canchas: [canchaName],
            };
          } else {
            targetMap[key].canchas.push(canchaName);
          }
        });
      })
    );

    renderDayColumn(satList, satMap, "Sábado");
    renderDayColumn(sunList, sunMap, "Domingo");
  } catch (err) {
    console.error(err);
    addToast("Error al cargar lista por día.", "error");
  }
}

function renderDayColumn(container, dataMap, dayLabel) {
  const keys = Object.keys(dataMap);
  if (!keys.length) {
    container.innerHTML = `<div class="text-slate-400 p-3 bg-white rounded-xl border border-slate-100 text-center">No hay designaciones asignadas para el ${dayLabel}.</div>`;
    return;
  }

  container.innerHTML = keys
    .map((k) => {
      const item = dataMap[k];
      return `
        <div class="p-2.5 bg-white border border-slate-100 rounded-xl flex items-center justify-between shadow-2xs">
          <span class="font-bold text-slate-800">${item.nombre}</span>
          <span class="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">${item.canchas.join(", ")}</span>
        </div>
      `;
    })
    .join("");
}

export function closeRefereesByDayModal() {
  if (modalEl) modalEl.classList.add("hidden");
}
