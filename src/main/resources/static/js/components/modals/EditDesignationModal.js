import designacionService from "../../services/designacionService.js";
import canchaService from "../../services/canchaService.js";
import { addToast } from "../../helpers.js";

let modalEl = null;
let formEl = null;
let onSaveCallback = null;

export function initEditDesignationModal(onSave) {
  onSaveCallback = onSave;
  if (document.getElementById("edit-designation-modal")) {
    modalEl = document.getElementById("edit-designation-modal");
    formEl = document.getElementById("edit-designation-form");
    return;
  }

  const div = document.createElement("div");
  div.id = "edit-designation-modal";
  div.className = "modal-overlay hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4";
  div.innerHTML = `
    <div class="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-slide-up">
      <div class="px-6 py-4 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
        <h3 class="font-bold text-slate-800 text-base">Editar Designación</h3>
        <button type="button" class="modal-close-btn p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 cursor-pointer">
          <i class="ti ti-x text-lg"></i>
        </button>
      </div>
      <form id="edit-designation-form" class="p-6 flex flex-col gap-4">
        <input type="hidden" id="edit-form-id" />
        <div class="flex flex-col">
          <label for="edit-form-cancha" class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Cancha</label>
          <select id="edit-form-cancha" required class="h-10 bg-slate-50 border border-slate-200 rounded-xl px-2 text-sm outline-none focus:border-emerald-500 focus:bg-white"></select>
        </div>
        <div class="flex flex-col">
          <label for="edit-form-fecha" class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Fecha y hora del partido</label>
          <input type="datetime-local" id="edit-form-fecha" required class="h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-sm outline-none focus:border-emerald-500 focus:bg-white" />
        </div>
        <div class="flex flex-col">
          <label for="edit-form-etapa" class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Etapa</label>
          <select id="edit-form-etapa" required class="h-10 bg-slate-50 border border-slate-200 rounded-xl px-2 text-sm outline-none focus:border-emerald-500 focus:bg-white">
            <option value="FECHA_NORMAL">Fecha normal</option>
            <option value="FECHA_PICANTE">Fecha picante</option>
            <option value="CLASIFICACION">Clasificación</option>
            <option value="CRUCES">Cruces</option>
            <option value="SEMIFINAL">Semifinales</option>
            <option value="FINAL">Final</option>
          </select>
        </div>
        <div class="flex flex-col">
          <label for="edit-form-cantidad" class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Cantidad de partidos</label>
          <div class="flex items-center gap-2">
            <input type="number" id="edit-form-cantidad" min="1" max="20" class="h-10 w-24 bg-slate-50 border border-slate-200 rounded-xl px-3 text-sm focus:border-emerald-500 focus:bg-white outline-none" />
            <span class="text-xs text-slate-500">partidos</span>
          </div>
        </div>
        <div class="flex flex-col">
          <label for="edit-form-detalle" class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Detalle / Notas</label>
          <textarea id="edit-form-detalle" rows="2" class="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-emerald-500 focus:bg-white resize-none" placeholder="Opcional..."></textarea>
        </div>
        <div class="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-2">
          <button type="button" class="modal-close-btn px-5 py-2.5 border rounded-xl font-semibold text-sm text-slate-500 hover:bg-slate-50 transition cursor-pointer">Cancelar</button>
          <button type="submit" class="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold text-sm shadow-md hover:bg-emerald-500 transition cursor-pointer flex items-center gap-1.5">
            <i class="ti ti-check"></i>
            <span>Guardar cambios</span>
          </button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(div);
  modalEl = div;
  formEl = div.querySelector("#edit-designation-form");

  modalEl.querySelectorAll(".modal-close-btn").forEach((btn) => {
    btn.addEventListener("click", closeEditDesignationModal);
  });
  modalEl.addEventListener("click", (e) => {
    if (e.target === modalEl) closeEditDesignationModal();
  });

  formEl.addEventListener("submit", handleFormSubmit);
}

async function handleFormSubmit(e) {
  e.preventDefault();
  const id = parseInt(document.getElementById("edit-form-id").value);
  const canchaId = parseInt(document.getElementById("edit-form-cancha").value);
  const fecha = document.getElementById("edit-form-fecha").value;
  const etapa = document.getElementById("edit-form-etapa").value;
  const cantidad = parseInt(document.getElementById("edit-form-cantidad").value) || 1;
  const detalle = document.getElementById("edit-form-detalle").value.trim();

  if (!id || !canchaId || !fecha) {
    addToast("Complete todos los campos requeridos.", "error");
    return;
  }

  document.dispatchEvent(new CustomEvent("global-loader-show", { detail: { message: "Guardando cambios..." } }));

  try {
    const payload = {
      idCancha: canchaId,
      fechaYHora: fecha,
      etapa: etapa,
      cantidadPartidos: cantidad,
      detalle: detalle,
    };

    await designacionService.actualizarDesignacion(id, payload);
    addToast("Designación actualizada con éxito.");
    closeEditDesignationModal();
    if (onSaveCallback) await onSaveCallback(id);
  } catch (err) {
    console.error(err);
    addToast("Error al actualizar la designación.", "error");
  } finally {
    document.dispatchEvent(new CustomEvent("global-loader-hide"));
  }
}

export async function openEditDesignationModal(id, onSave) {
  if (onSave) onSaveCallback = onSave;
  if (!modalEl) initEditDesignationModal(onSaveCallback);

  document.dispatchEvent(new CustomEvent("global-loader-show", { detail: { message: "Cargando designación..." } }));

  try {
    const [desigRes, canchasRes] = await Promise.all([
      designacionService.getById(id),
      canchaService.getAll(),
    ]);

    const d = desigRes.data || desigRes;
    const canchasRaw = Array.isArray(canchasRes) ? canchasRes : (canchasRes.data || []);
    const canchas = canchasRaw.filter((c) => c.estado);

    const selectCancha = document.getElementById("edit-form-cancha");
    selectCancha.innerHTML = canchas
      .map((c) => `<option value="${c.id || c.idCancha}">${c.nombreCancha || c.nombre}</option>`)
      .join("");

    document.getElementById("edit-form-id").value = d.idDesignacion;
    selectCancha.value = d.cancha ? (d.cancha.id || d.cancha.idCancha) : "";
    document.getElementById("edit-form-fecha").value = d.fechaYHora ? d.fechaYHora.slice(0, 16) : "";
    document.getElementById("edit-form-etapa").value = d.etapa || "FECHA_NORMAL";
    document.getElementById("edit-form-cantidad").value = d.cantidadPartidos || 1;
    document.getElementById("edit-form-detalle").value = d.detalle || "";

    modalEl.classList.remove("hidden");
  } catch (err) {
    console.error(err);
    addToast("No se pudo cargar la información de la designación.", "error");
  } finally {
    document.dispatchEvent(new CustomEvent("global-loader-hide"));
  }
}

export function closeEditDesignationModal() {
  if (modalEl) modalEl.classList.add("hidden");
}
