import designadoService from "../../services/designadoService.js";
import { formatFecha, getDayOfWeekLocal, addToast } from "../../helpers.js";

let modalEl = null;
let currentList = [];

export function initWhatsappModal() {
  if (document.getElementById("whatsapp-modal")) {
    modalEl = document.getElementById("whatsapp-modal");
    bindEvents();
    return;
  }

  const div = document.createElement("div");
  div.id = "whatsapp-modal";
  div.className = "modal-overlay hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4";
  div.innerHTML = `
    <div class="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
      <div class="px-6 py-4 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
        <h3 class="font-bold text-slate-800 text-base flex items-center gap-2">
          <i class="ti ti-brand-whatsapp text-emerald-600"></i>
          <span>Compartir Designaciones</span>
        </h3>
        <button type="button" class="modal-close-btn p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 cursor-pointer">
          <i class="ti ti-x text-lg"></i>
        </button>
      </div>

      <div class="p-6 overflow-y-auto flex flex-col gap-4 flex-1">
        <div class="flex flex-col">
          <label for="whatsapp-day-select" class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Seleccionar Jornada</label>
          <select id="whatsapp-day-select" class="h-10 bg-slate-50 border border-slate-200 rounded-xl px-2 text-sm outline-none focus:border-emerald-500 focus:bg-white">
            <option value="ALL">Todo el Fin de Semana</option>
            <option value="SABADO">Solo Sábado</option>
            <option value="DOMINGO">Solo Domingo</option>
          </select>
        </div>

        <div class="flex flex-col">
          <label for="whatsapp-textarea" class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Texto Generado</label>
          <textarea id="whatsapp-textarea" rows="10" class="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-emerald-500 focus:bg-white font-mono leading-relaxed resize-none"></textarea>
        </div>
      </div>

      <div class="px-6 py-4 bg-slate-50 border-t border-slate-150 flex items-center justify-end gap-2">
        <button type="button" id="btn-copy-whatsapp" class="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold text-xs transition cursor-pointer flex items-center gap-1.5">
          <i class="ti ti-copy"></i>
          <span>Copiar</span>
        </button>
        <button type="button" id="btn-send-whatsapp-all" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5">
          <i class="ti ti-brand-whatsapp"></i>
          <span>Abrir WhatsApp</span>
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
    btn.addEventListener("click", closeWhatsappModal);
  });
  modalEl.addEventListener("click", (e) => {
    if (e.target === modalEl) closeWhatsappModal();
  });

  const select = modalEl.querySelector("#whatsapp-day-select");
  if (select) {
    select.addEventListener("change", generateReport);
  }

  const btnCopy = modalEl.querySelector("#btn-copy-whatsapp");
  if (btnCopy) {
    btnCopy.addEventListener("click", () => {
      const textarea = modalEl.querySelector("#whatsapp-textarea");
      textarea.select();
      navigator.clipboard.writeText(textarea.value);
      addToast("Mensaje copiado al portapapeles.");
    });
  }

  const btnSend = modalEl.querySelector("#btn-send-whatsapp-all");
  if (btnSend) {
    btnSend.addEventListener("click", () => {
      const text = modalEl.querySelector("#whatsapp-textarea").value;
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
      window.open(url, "_blank");
    });
  }
}

export async function openWhatsappModal(designationsList) {
  if (!modalEl) initWhatsappModal();
  currentList = designationsList || [];
  modalEl.classList.remove("hidden");
  await generateReport();
}

async function generateReport() {
  const textarea = modalEl.querySelector("#whatsapp-textarea");
  const filter = modalEl.querySelector("#whatsapp-day-select").value;

  textarea.value = "Generando resumen de designaciones...";

  try {
    const active = currentList.filter((d) => d.estado !== "CANCELADA");

    const filtered = active.filter((d) => {
      const fechaVal = d.fecha || d.fechaYHora;
      const dayIndex = getDayOfWeekLocal(fechaVal);
      if (filter === "SABADO") return dayIndex === 6;
      if (filter === "DOMINGO") return dayIndex === 0;
      return true;
    });

    if (!filtered.length) {
      textarea.value = "No hay designaciones para la jornada seleccionada.";
      return;
    }

    let report = `📋 *DESIGNACIONES ARBDESIG*\n`;
    report += `=========================\n\n`;

    for (const desig of filtered) {
      const cancha = desig.cancha ? (desig.cancha.nombreCancha || desig.cancha.nombre) : "Cancha";
      const fecha = formatFecha(desig.fecha || desig.fechaYHora);
      const res = await designadoService.getByDesignacion(desig.idDesignacion);
      const designados = Array.isArray(res) ? res : (res && res.data ? res.data : []);

      report += `🏟️ *${cancha.toUpperCase()}*\n`;
      report += `📅 ${fecha} | ⚽ ${desig.cantidadPartidos || 1} partido(s)\n`;

      if (desig.detalle) {
        report += `📝 _Nota: ${desig.detalle}_\n`;
      }

      if (!designados.length) {
        report += `⚠️ Sin árbitros asignados\n`;
      } else {
        report += `👤 Árbitros:\n`;
        designados.forEach((item, idx) => {
          const a = item.arbitro || {};
          report += `   ${idx + 1}. ${a.nombre || ""} ${a.apellido || ""}\n`;
        });
      }
      report += `\n-------------------------\n\n`;
    }

    textarea.value = report;
  } catch (err) {
    console.error(err);
    textarea.value = "Error al generar el reporte.";
  }
}

export function closeWhatsappModal() {
  if (modalEl) modalEl.classList.add("hidden");
}
