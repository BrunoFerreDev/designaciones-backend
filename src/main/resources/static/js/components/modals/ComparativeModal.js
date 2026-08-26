import { printComparativaReport } from "../../services/printComparativaService.js";
import { getLocalDateString, addToast } from "../../helpers.js";

let modalEl = null;

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
    <div class="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
      <div class="px-6 py-4 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
        <h3 class="font-bold text-slate-800 text-base flex items-center gap-2">
          <i class="ti ti-git-compare text-amber-600"></i>
          <span>Comparativa Fin de Semana</span>
        </h3>
        <button type="button" class="modal-close-btn p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 cursor-pointer">
          <i class="ti ti-x text-lg"></i>
        </button>
      </div>

      <div class="p-6 overflow-y-auto flex flex-col gap-4 flex-1">
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col">
            <label for="comp-last-sat" class="text-[10px] font-bold text-slate-400 uppercase mb-1">Sábado Anterior</label>
            <input type="date" id="comp-last-sat" class="h-9 bg-slate-50 border border-slate-200 rounded-xl px-2.5 text-xs outline-none" />
          </div>
          <div class="flex flex-col">
            <label for="comp-last-sun" class="text-[10px] font-bold text-slate-400 uppercase mb-1">Domingo Anterior</label>
            <input type="date" id="comp-last-sun" class="h-9 bg-slate-50 border border-slate-200 rounded-xl px-2.5 text-xs outline-none" />
          </div>
          <div class="flex flex-col">
            <label for="comp-this-sat" class="text-[10px] font-bold text-slate-400 uppercase mb-1">Este Sábado</label>
            <input type="date" id="comp-this-sat" class="h-9 bg-slate-50 border border-slate-200 rounded-xl px-2.5 text-xs outline-none" />
          </div>
          <div class="flex flex-col">
            <label for="comp-this-sun" class="text-[10px] font-bold text-slate-400 uppercase mb-1">Este Domingo</label>
            <input type="date" id="comp-this-sun" class="h-9 bg-slate-50 border border-slate-200 rounded-xl px-2.5 text-xs outline-none" />
          </div>
        </div>
      </div>

      <div class="px-6 py-4 bg-slate-50 border-t border-slate-150 flex items-center justify-end gap-2">
        <button type="button" class="modal-close-btn px-5 py-2.5 border rounded-xl font-semibold text-sm text-slate-500 hover:bg-slate-50 transition cursor-pointer">
          Cancelar
        </button>
        <button type="button" id="btn-comp-generate" class="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold text-sm shadow-md hover:bg-emerald-500 transition cursor-pointer flex items-center gap-1.5">
          <i class="ti ti-printer"></i>
          <span>Generar Reporte</span>
        </button>
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
}

export function openComparativeModal() {
  if (!modalEl) initComparativeModal();

  const now = new Date();
  const thisSat = new Date(now);
  thisSat.setDate(now.getDate() + ((6 - now.getDay() + 7) % 7));
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
  btnGen.disabled = true;
  btnGen.innerHTML = `<i class="ti ti-loader spin-icon"></i> <span>Generando...</span>`;

  try {
    await printComparativaReport({
      fechaSabadoAnterior: lastSat,
      fechaDomingoAnterior: lastSun,
      fechaSabadoActual: thisSat,
      fechaDomingoActual: thisSun,
    });
    addToast("Reporte comparativo generado.");
    closeComparativeModal();
  } catch (err) {
    console.error(err);
    addToast("Error al generar reporte comparativo.", "error");
  } finally {
    btnGen.disabled = false;
    btnGen.innerHTML = `<i class="ti ti-printer"></i> <span>Generar Reporte</span>`;
  }
}

export function closeComparativeModal() {
  if (modalEl) modalEl.classList.add("hidden");
}
