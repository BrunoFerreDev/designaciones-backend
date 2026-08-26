import designacionService from "../../services/designacionService.js";
import designadoService from "../../services/designadoService.js";
import { formatFecha, addToast } from "../../helpers.js";

let modalEl = null;

export function initDesignationDetailModal() {
  if (document.getElementById("designation-detail-modal")) {
    modalEl = document.getElementById("designation-detail-modal");
    bindEvents();
    return;
  }

  const div = document.createElement("div");
  div.id = "designation-detail-modal";
  div.className = "modal-overlay hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4";
  div.innerHTML = `
    <div class="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
      <div class="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600"></div>
      <div class="px-6 py-4 bg-slate-50/80 border-b border-slate-150 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center text-lg shadow-sm">
            <i class="ti ti-clipboard-text"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-bold text-slate-800 text-base">Ficha de Designación</h3>
              <span id="detail-badge-status" class="badge bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-bold">Estado</span>
            </div>
            <div class="text-xs text-slate-500 mt-0.5">Detalles, observaciones y registros de jornada</div>
          </div>
        </div>
        <button type="button" class="modal-close-btn w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition cursor-pointer">
          <i class="ti ti-x text-lg"></i>
        </button>
      </div>

      <div class="p-6 overflow-y-auto flex flex-col gap-4 flex-1">
        <div class="grid grid-cols-2 gap-3">
          <div class="p-3 bg-slate-50 border border-slate-150 rounded-2xl flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-white border border-slate-200 text-emerald-600 flex items-center justify-center text-base shadow-xs">🏟️</div>
            <div class="min-w-0 flex-1">
              <div class="text-[10px] uppercase font-bold text-slate-400">Cancha</div>
              <div id="detail-cancha-name" class="text-xs font-bold text-slate-800 truncate">Cancha</div>
            </div>
          </div>

          <div class="p-3 bg-slate-50 border border-slate-150 rounded-2xl flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-white border border-slate-200 text-blue-600 flex items-center justify-center text-base shadow-xs">
              <i class="ti ti-calendar"></i>
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-[10px] uppercase font-bold text-slate-400">Fecha & Hora</div>
              <div id="detail-fecha-val" class="text-xs font-bold text-slate-800 truncate">Fecha</div>
            </div>
          </div>

          <div class="p-3 bg-slate-50 border border-slate-150 rounded-2xl flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-white border border-slate-200 text-purple-600 flex items-center justify-center text-base shadow-xs">
              <i class="ti ti-trophy"></i>
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-[10px] uppercase font-bold text-slate-400">Etapa</div>
              <div id="detail-etapa-val" class="text-xs font-bold text-slate-800 truncate">Normal</div>
            </div>
          </div>

          <div class="p-3 bg-slate-50 border border-slate-150 rounded-2xl flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-white border border-slate-200 text-amber-600 flex items-center justify-center text-base shadow-xs">
              <i class="ti ti-ball-football"></i>
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-[10px] uppercase font-bold text-slate-400">Partidos</div>
              <div id="detail-partidos-val" class="text-xs font-bold text-slate-800 truncate">1</div>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <i class="ti ti-notes text-amber-500"></i>
              <span>Observaciones y Novedades</span>
            </span>
            <button type="button" id="btn-copy-detail-text" class="text-[11px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer transition" title="Copiar texto">
              <i class="ti ti-copy"></i>
              <span>Copiar</span>
            </button>
          </div>
          <div class="bg-amber-50/50 border-l-4 border-amber-500 p-4 rounded-r-2xl border border-amber-100 shadow-2xs">
            <p id="designation-detail-text" class="text-xs text-slate-700 whitespace-pre-line leading-relaxed font-sans"></p>
          </div>
        </div>

        <div id="detail-referees-section" class="flex flex-col gap-2 pt-2 border-t border-slate-100">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <i class="ti ti-users text-slate-400"></i>
              <span>Árbitros Designados</span>
            </span>
            <span id="detail-referees-count" class="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">0</span>
          </div>
          <div id="detail-referees-container" class="flex flex-col gap-1.5 max-h-36 overflow-y-auto"></div>
        </div>
      </div>

      <div class="px-6 py-4 bg-slate-50 border-t border-slate-150 flex items-center justify-end">
        <button type="button" class="modal-close-btn px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold text-xs shadow-md hover:bg-emerald-500 transition cursor-pointer flex items-center gap-1.5">
          <i class="ti ti-check"></i>
          <span>Listo</span>
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
    btn.addEventListener("click", closeDesignationDetailModal);
  });
  modalEl.addEventListener("click", (e) => {
    if (e.target === modalEl) closeDesignationDetailModal();
  });

  const btnCopy = modalEl.querySelector("#btn-copy-detail-text");
  if (btnCopy) {
    btnCopy.addEventListener("click", () => {
      const text = modalEl.querySelector("#designation-detail-text").textContent;
      navigator.clipboard.writeText(text);
      addToast("Observaciones copiadas.");
    });
  }
}

export async function openDesignationDetailModal(id) {
  if (!modalEl) initDesignationDetailModal();

  try {
    const [desigRes, designadosRes] = await Promise.all([
      designacionService.getById(id),
      designadoService.getByDesignacion(id),
    ]);

    const d = desigRes && desigRes.data ? desigRes.data : desigRes;
    const designadosRaw = designadosRes && designadosRes.data ? designadosRes.data : designadosRes;
    const designados = Array.isArray(designadosRaw) ? designadosRaw : [];

    modalEl.querySelector("#detail-badge-status").textContent = (d && d.estado) ? d.estado : "PENDIENTE";
    modalEl.querySelector("#detail-cancha-name").textContent = (d && d.cancha) ? (d.cancha.nombreCancha || d.cancha.nombre) : "Cancha";
    modalEl.querySelector("#detail-fecha-val").textContent = (d && d.fechaYHora) ? formatFecha(d.fechaYHora) : "Fecha no disp.";
    modalEl.querySelector("#detail-etapa-val").textContent = (d && d.etapa) ? d.etapa : "Normal";
    modalEl.querySelector("#detail-partidos-val").textContent = `${(d && d.cantidadPartidos) ? d.cantidadPartidos : 1} partido(s)`;
    modalEl.querySelector("#designation-detail-text").textContent = (d && d.detalle) ? d.detalle : "Sin observaciones adicionales.";

    const countBadge = modalEl.querySelector("#detail-referees-count");
    const container = modalEl.querySelector("#detail-referees-container");

    countBadge.textContent = designados.length;

    if (!designados.length) {
      container.innerHTML = `<div class="text-xs text-slate-400 p-2 text-center">No hay árbitros asignados.</div>`;
    } else {
      const totalMonto = designados.reduce((acc, curr) => acc + (Number(curr.monto) || 0), 0);
      container.innerHTML = `
        ${designados
          .map((item) => {
            const a = item.arbitro || {};
            const montoVal = Number(item.monto) || 0;
            const montoStr = montoVal > 0 ? `$${montoVal.toLocaleString("es-AR")}` : "Sin arancel";
            return `
              <div class="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs hover:bg-slate-100/80 transition">
                <div>
                  <div class="font-bold text-slate-800">${a.nombre || ""} ${a.apellido || ""}</div>
                  <div class="text-[10px] text-slate-400 font-medium">${a.categoria || "Árbitro"}</div>
                </div>
                <span class="text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">${montoStr}</span>
              </div>
            `;
          })
          .join("")}
        <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between px-1 text-xs">
          <span class="font-bold text-slate-600 uppercase tracking-wider text-[11px]">Total Liquidación:</span>
          <span class="font-extrabold text-emerald-700 text-sm font-mono">$${totalMonto.toLocaleString("es-AR")}</span>
        </div>
      `;
    }

    modalEl.classList.remove("hidden");
  } catch (err) {
    console.error(err);
    addToast("Error al cargar detalle.", "error");
  }
}

export function closeDesignationDetailModal() {
  if (modalEl) modalEl.classList.add("hidden");
}
