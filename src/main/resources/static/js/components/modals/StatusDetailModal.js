let modalEl = null;
let titleEl = null;
let descEl = null;
let textareaEl = null;
let submitBtnEl = null;
let iconContainerEl = null;
let currentResolve = null;

export function initStatusDetailModal() {
  if (document.getElementById("status-detail-modal")) {
    modalEl = document.getElementById("status-detail-modal");
    return;
  }

  const div = document.createElement("div");
  div.id = "status-detail-modal";
  div.className = "modal-overlay hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4";
  div.innerHTML = `
    <div class="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-slide-up">
      <div class="px-6 py-4 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div id="status-detail-icon" class="w-8 h-8 rounded-xl flex items-center justify-center text-base">
            <i class="ti ti-notes"></i>
          </div>
          <h3 id="status-detail-title" class="font-bold text-slate-800 text-base">Cambiar Estado</h3>
        </div>
        <button type="button" class="modal-close-btn p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 cursor-pointer">
          <i class="ti ti-x text-lg"></i>
        </button>
      </div>

      <form id="status-detail-form" class="p-6 flex flex-col gap-4">
        <p id="status-detail-desc" class="text-xs text-slate-600 font-medium leading-relaxed"></p>

        <div class="flex flex-col">
          <label for="status-detail-input" class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
            Motivo / Detalle adicional (Opcional)
          </label>
          <textarea
            id="status-detail-input"
            rows="3"
            class="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-emerald-500 focus:bg-white resize-none text-slate-800"
            placeholder="Escribe aquí el motivo o nota..."
          ></textarea>
        </div>

        <div class="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-1">
          <button type="button" class="modal-close-btn px-4 py-2 border rounded-xl font-semibold text-xs text-slate-500 hover:bg-slate-50 transition cursor-pointer">
            Cancelar
          </button>
          <button type="submit" id="status-detail-submit" class="px-5 py-2 text-white rounded-xl font-semibold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5">
            <i class="ti ti-check"></i>
            <span id="status-detail-submit-text">Confirmar</span>
          </button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(div);
  modalEl = div;
  titleEl = div.querySelector("#status-detail-title");
  descEl = div.querySelector("#status-detail-desc");
  textareaEl = div.querySelector("#status-detail-input");
  submitBtnEl = div.querySelector("#status-detail-submit");
  iconContainerEl = div.querySelector("#status-detail-icon");

  modalEl.querySelectorAll(".modal-close-btn").forEach((btn) => {
    btn.addEventListener("click", () => handleClose(null));
  });

  modalEl.addEventListener("click", (e) => {
    if (e.target === modalEl) handleClose(null);
  });

  div.querySelector("#status-detail-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const detailValue = textareaEl.value.trim();
    handleClose(detailValue || "");
  });
}

function handleClose(result) {
  if (modalEl) modalEl.classList.add("hidden");
  if (currentResolve) {
    currentResolve(result);
    currentResolve = null;
  }
}

/**
 * Prompts user for a note/detail when changing status.
 * @param {"FINALIZADA"|"CANCELADA"|"SUSPENDIDA"} status
 * @returns {Promise<string|null>} returns string detail (can be empty string) or null if cancelled.
 */
export function promptStatusDetail(status) {
  if (!modalEl) initStatusDetailModal();

  textareaEl.value = "";

  if (status === "FINALIZADA") {
    titleEl.textContent = "Finalizar Designación";
    descEl.textContent = "Indica si deseas agregar observaciones sobre el cierre de la jornada (ej. pagos, incidencias):";
    iconContainerEl.className = "w-8 h-8 rounded-xl flex items-center justify-center text-base bg-emerald-100 text-emerald-700";
    iconContainerEl.innerHTML = `<i class="ti ti-flag-checkered"></i>`;
    submitBtnEl.className = "px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5";
    divSubmitText("Finalizar");
  } else if (status === "SUSPENDIDA") {
    titleEl.textContent = "Suspender Designación";
    descEl.textContent = "¿Deseas agregar una nota o motivo sobre la suspensión en cancha (ej. lluvia, incidentes)?:";
    iconContainerEl.className = "w-8 h-8 rounded-xl flex items-center justify-center text-base bg-purple-100 text-purple-700";
    iconContainerEl.innerHTML = `<i class="ti ti-player-pause"></i>`;
    submitBtnEl.className = "px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5";
    divSubmitText("Suspender");
  } else if (status === "CANCELADA") {
    titleEl.textContent = "Cancelar Designación";
    descEl.textContent = "Indica el motivo de la cancelación de la designación:";
    iconContainerEl.className = "w-8 h-8 rounded-xl flex items-center justify-center text-base bg-rose-100 text-rose-700";
    iconContainerEl.innerHTML = `<i class="ti ti-ban"></i>`;
    submitBtnEl.className = "px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-semibold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5";
    divSubmitText("Cancelar Designación");
  } else {
    titleEl.textContent = `Cambiar a ${status}`;
    descEl.textContent = "Puedes agregar una nota para este cambio de estado:";
    iconContainerEl.className = "w-8 h-8 rounded-xl flex items-center justify-center text-base bg-slate-100 text-slate-700";
    iconContainerEl.innerHTML = `<i class="ti ti-notes"></i>`;
    submitBtnEl.className = "px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5";
    divSubmitText("Confirmar");
  }

  modalEl.classList.remove("hidden");
  textareaEl.focus();

  return new Promise((resolve) => {
    currentResolve = resolve;
  });
}

function divSubmitText(txt) {
  const el = modalEl.querySelector("#status-detail-submit-text");
  if (el) el.textContent = txt;
}
