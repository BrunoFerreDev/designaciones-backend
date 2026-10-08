import designacionService from "../../services/designacionService.js";
import canchaService from "../../services/canchaService.js";
import { formatFecha, getLocalDateString, addToast } from "../../helpers.js";

let modalEl = null;
let allCanchas = [];
let pastDesignationsList = [];
let cloneSelectedIds = [];
let onCreateCallback = null;

export function initWizardModal(onCreate) {
  onCreateCallback = onCreate;
  if (document.getElementById("wizard-modal")) {
    modalEl = document.getElementById("wizard-modal");
    bindEvents();
    return;
  }

  const div = document.createElement("div");
  div.id = "wizard-modal";
  div.className = "modal-overlay hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4";
  div.innerHTML = `
    <div class="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-slide-up">
      <div class="px-6 py-4 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
        <h3 class="font-bold text-slate-800 text-base">Crear Designaciones</h3>
        <button type="button" class="modal-close-btn p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 cursor-pointer">
          <i class="ti ti-x text-lg"></i>
        </button>
      </div>

      <div class="p-6">
        <div class="bg-slate-100 p-1.5 rounded-2xl flex gap-1 border border-slate-200/40 mb-6">
          <button type="button" id="wizard-tab-manual" class="wizard-tab-btn flex-1 py-2 px-3 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-all rounded-xl flex items-center justify-center gap-1.5 active">
            <i class="ti ti-plus text-sm"></i>
            <span>Nueva individual</span>
          </button>
          <button type="button" id="wizard-tab-clone" class="wizard-tab-btn flex-1 py-2 px-3 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-all rounded-xl flex items-center justify-center gap-1.5">
            <i class="ti ti-history text-sm"></i>
            <span>Importar Finde Anterior</span>
          </button>
        </div>

        <!-- Flow 1: Manual -->
        <div id="wizard-view-manual" class="flex flex-col gap-4">
          <div id="manual-step-1" class="flex flex-col gap-4">
            <div class="text-xs font-bold text-slate-600 uppercase">Paso 1 de 2: Cancha</div>
            <div class="flex flex-col">
              <label for="wizard-cancha" class="text-xs font-semibold text-slate-500 mb-2">Cancha (Habilitadas)</label>
              <select id="wizard-cancha" class="h-10 bg-slate-50 border border-slate-200 rounded-xl px-2 text-sm outline-none focus:border-emerald-500 focus:bg-white">
                <option value="" disabled selected>Seleccione una cancha...</option>
              </select>
            </div>
            <div id="wizard-cancha-info" class="hidden text-xs bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl p-3 flex flex-col gap-1">
              <strong id="wizard-cancha-name">Cancha</strong>
              <div id="wizard-cancha-detail" class="text-[11px] text-emerald-600 mt-1">Cargando datos...</div>
            </div>
            <div class="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-2">
              <button type="button" class="modal-close-btn px-5 py-2 border rounded-xl font-semibold text-sm hover:bg-slate-50 transition cursor-pointer">Cancelar</button>
              <button type="button" id="wizard-btn-step1-next" class="px-5 py-2 bg-emerald-600 text-white rounded-xl font-semibold text-sm shadow-md hover:bg-emerald-500 transition cursor-pointer" disabled>Siguiente</button>
            </div>
          </div>

          <div id="manual-step-2" class="flex flex-col gap-4 hidden">
            <div class="text-xs font-bold text-slate-600 uppercase">Paso 2 de 2: Fecha y Partidos</div>
            <div class="bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs text-slate-700">
              🏟️ Cancha: <strong id="step2-cancha-name">Cancha</strong>
            </div>
            <div class="flex flex-col">
              <label for="wizard-fecha" class="text-xs font-semibold text-slate-500 mb-1.5">Fecha y hora del primer partido</label>
              <input type="datetime-local" id="wizard-fecha" class="h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-sm outline-none focus:border-emerald-500 focus:bg-white" />
            </div>
            <div class="flex flex-col">
              <label for="wizard-etapa" class="text-xs font-semibold text-slate-500 mb-1.5">Etapa del Campeonato</label>
              <select id="wizard-etapa" class="h-10 bg-slate-50 border border-slate-200 rounded-xl px-2 text-sm outline-none focus:border-emerald-500 focus:bg-white">
                <option value="FECHA_NORMAL">Fecha Normal</option>
                <option value="FECHA_PICANTE">Fecha Picante</option>
                <option value="CLASIFICACION">Clasificación</option>
                <option value="CRUCES">Cruces</option>
                <option value="SEMIFINAL">Semifinal</option>
                <option value="FINAL">Final</option>
              </select>
            </div>
            <div class="flex flex-col">
              <label for="wizard-cantidad" class="text-xs font-semibold text-slate-500 mb-1.5">Cantidad de partidos a jugar</label>
              <div class="flex items-center gap-2">
                <input type="number" id="wizard-cantidad" min="1" max="20" value="1" class="h-10 w-24 bg-slate-50 border border-slate-200 rounded-xl px-3 text-sm outline-none focus:border-emerald-500 focus:bg-white" />
                <span class="text-xs text-slate-500 font-medium">partidos</span>
              </div>
            </div>
            <div class="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-2">
              <button type="button" id="wizard-btn-step2-back" class="px-5 py-2 border rounded-xl font-semibold text-sm hover:bg-slate-50 transition cursor-pointer">Atrás</button>
              <button type="button" id="wizard-btn-step2-submit" class="px-5 py-2 bg-emerald-600 text-white rounded-xl font-semibold text-sm shadow-md hover:bg-emerald-500 transition cursor-pointer" disabled>Crear designación</button>
            </div>
          </div>
        </div>

        <!-- Flow 2: Clone -->
        <div id="wizard-view-clone" class="flex flex-col gap-4 hidden">
          <div class="text-xs text-slate-500 leading-relaxed mb-1">
            Detecta y clona las designaciones que fueron <strong>finalizadas</strong> el fin de semana pasado (+7 días).
          </div>
          <div id="clone-loader" class="text-center py-8 text-xs text-slate-500 hidden">
            <i class="ti ti-loader text-2xl text-emerald-600 spin-icon block mb-2 mx-auto"></i>
            Buscando designaciones finalizadas...
          </div>
          <div id="clone-empty" class="text-center py-6 text-slate-500 text-xs hidden border border-dashed rounded-xl">
            <div class="text-2xl mb-1">📋</div>
            <strong class="text-slate-700">No hay designaciones finalizadas</strong>
            <p class="mt-1 text-[11px]">No se encontraron designaciones del fin de semana pasado (<span id="clone-range-date"></span>).</p>
          </div>
          <div id="clone-list-wrapper" class="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto hidden">
            <label class="flex items-center gap-2 text-xs font-semibold text-slate-600 mb-1 cursor-pointer">
              <input type="checkbox" id="clone-select-all" class="w-4 h-4 accent-emerald-600 rounded" />
              <span>Seleccionar todas (<span id="clone-select-count">0</span>)</span>
            </label>
            <div id="clone-list" class="flex flex-col gap-2"></div>
          </div>
          <div class="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-2">
            <button type="button" class="modal-close-btn px-5 py-2 border rounded-xl font-semibold text-sm hover:bg-slate-50 transition cursor-pointer">Cancelar</button>
            <button type="button" id="wizard-btn-clone-submit" class="px-5 py-2 bg-emerald-600 text-white rounded-xl font-semibold text-sm shadow-md hover:bg-emerald-500 transition cursor-pointer flex items-center gap-1.5" disabled>
              <i class="ti ti-download"></i>
              <span>Importar seleccionadas</span>
            </button>
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
    btn.addEventListener("click", closeWizardModal);
  });
  modalEl.addEventListener("click", (e) => {
    if (e.target === modalEl) closeWizardModal();
  });

  const tabManual = modalEl.querySelector("#wizard-tab-manual");
  const tabClone = modalEl.querySelector("#wizard-tab-clone");
  const viewManual = modalEl.querySelector("#wizard-view-manual");
  const viewClone = modalEl.querySelector("#wizard-view-clone");

  tabManual.addEventListener("click", () => {
    tabManual.classList.add("active");
    tabClone.classList.remove("active");
    viewManual.classList.remove("hidden");
    viewClone.classList.add("hidden");
  });

  tabClone.addEventListener("click", () => {
    tabClone.classList.add("active");
    tabManual.classList.remove("active");
    viewClone.classList.remove("hidden");
    viewManual.classList.add("hidden");
    loadCloneOptions();
  });

  const selectCancha = modalEl.querySelector("#wizard-cancha");
  const btnStep1Next = modalEl.querySelector("#wizard-btn-step1-next");
  const step1 = modalEl.querySelector("#manual-step-1");
  const step2 = modalEl.querySelector("#manual-step-2");
  const btnStep2Back = modalEl.querySelector("#wizard-btn-step2-back");
  const btnStep2Submit = modalEl.querySelector("#wizard-btn-step2-submit");
  const inputFecha = modalEl.querySelector("#wizard-fecha");

  selectCancha.addEventListener("change", () => {
    const canchaId = parseInt(selectCancha.value);
    const cancha = allCanchas.find((c) => (c.id || c.idCancha) === canchaId);
    if (cancha) {
      modalEl.querySelector("#wizard-cancha-name").textContent = cancha.nombreCancha || cancha.nombre;
      modalEl.querySelector("#wizard-cancha-detail").textContent = `Categoría: ${cancha.categoria || "N/A"} · Fuera de juego: ${cancha.fueraDeJuego ? "Sí" : "No"}`;
      modalEl.querySelector("#wizard-cancha-info").classList.remove("hidden");
      btnStep1Next.disabled = false;
    }
  });

  btnStep1Next.addEventListener("click", () => {
    const canchaId = parseInt(selectCancha.value);
    const cancha = allCanchas.find((c) => (c.id || c.idCancha) === canchaId);
    if (cancha) {
      modalEl.querySelector("#step2-cancha-name").textContent = cancha.nombreCancha || cancha.nombre;
      step1.classList.add("hidden");
      step2.classList.remove("hidden");
    }
  });

  btnStep2Back.addEventListener("click", () => {
    step2.classList.add("hidden");
    step1.classList.remove("hidden");
  });

  inputFecha.addEventListener("input", () => {
    btnStep2Submit.disabled = !inputFecha.value;
  });

  btnStep2Submit.addEventListener("click", submitManual);

  const selectAllCheck = modalEl.querySelector("#clone-select-all");
  selectAllCheck.addEventListener("change", () => {
    const checks = modalEl.querySelectorAll(".clone-item-check");
    checks.forEach((c) => (c.checked = selectAllCheck.checked));
    updateCloneSelection();
  });

  const btnCloneSubmit = modalEl.querySelector("#wizard-btn-clone-submit");
  btnCloneSubmit.addEventListener("click", submitClone);
}

export async function openWizardModal(canchasList, onCreate) {
  if (onCreate) onCreateCallback = onCreate;
  if (!modalEl) initWizardModal(onCreateCallback);

  allCanchas = canchasList || [];
  if (!allCanchas.length) {
    const res = await canchaService.getAll();
    const canchasRaw = Array.isArray(res) ? res : (res.data || []);
    allCanchas = canchasRaw.filter((c) => c.estado);
  }

  // Populate canchas select
  const selectCancha = modalEl.querySelector("#wizard-cancha");
  selectCancha.innerHTML = `
    <option value="" disabled selected>Seleccione una cancha...</option>
    ${allCanchas.map((c) => `<option value="${c.id || c.idCancha}">${c.nombreCancha || c.nombre}</option>`).join("")}
  `;

  modalEl.querySelector("#manual-step-1").classList.remove("hidden");
  modalEl.querySelector("#manual-step-2").classList.add("hidden");
  modalEl.querySelector("#wizard-cancha-info").classList.add("hidden");
  modalEl.querySelector("#wizard-btn-step1-next").disabled = true;

  modalEl.classList.remove("hidden");
}

async function submitManual() {
  const canchaId = parseInt(modalEl.querySelector("#wizard-cancha").value);
  const fecha = modalEl.querySelector("#wizard-fecha").value;
  const etapa = modalEl.querySelector("#wizard-etapa").value;
  const cantidad = parseInt(modalEl.querySelector("#wizard-cantidad").value) || 1;

  if (!canchaId || !fecha) {
    addToast("Complete fecha y cancha.", "error");
    return;
  }

  const btn = modalEl.querySelector("#wizard-btn-step2-submit");
  btn.disabled = true;
  btn.innerHTML = `<i class="ti ti-loader spin-icon"></i> <span>Creando...</span>`;

  try {
    const payload = {
      idCancha: canchaId,
      fechaYHora: fecha,
      etapa: etapa,
      cantidadPartidos: cantidad,
      detalle: "",
    };

    const res = await designacionService.createDesignacion(payload);
    const createdId = res ? (res.idDesignacion || (res.data && res.data.idDesignacion)) : null;
    addToast("Designación creada con éxito.");
    closeWizardModal();
    if (onCreateCallback) await onCreateCallback(createdId);
  } catch (err) {
    console.error(err);
    addToast("Error al crear la designación.", "error");
  } finally {
    btn.disabled = false;
    btn.innerHTML = `Crear designación`;
  }
}

async function loadCloneOptions() {
  const loader = modalEl.querySelector("#clone-loader");
  const empty = modalEl.querySelector("#clone-empty");
  const wrapper = modalEl.querySelector("#clone-list-wrapper");
  const listEl = modalEl.querySelector("#clone-list");

  loader.classList.remove("hidden");
  empty.classList.add("hidden");
  wrapper.classList.add("hidden");

  try {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const lastSat = new Date(now);
    lastSat.setDate(now.getDate() - ((dayOfWeek + 1) % 7) - 6);
    const lastSun = new Date(lastSat);
    lastSun.setDate(lastSat.getDate() + 1);

    const satStr = getLocalDateString(lastSat);
    const sunStr = getLocalDateString(lastSun);

    modalEl.querySelector("#clone-range-date").textContent = `${satStr} al ${sunStr}`;

    const res = await designacionService.buscarPorRango(satStr, sunStr);
    const raw = Array.isArray(res) ? res : (res.data || []);
    pastDesignationsList = raw.filter((d) => d.estado === "FINALIZADA" || d.estado === "CONFIRMADA" || d.estado === "COMPLETA" || d.estado === 1 || d.estado === 2);

    if (!pastDesignationsList.length) {
      empty.classList.remove("hidden");
      return;
    }

    wrapper.classList.remove("hidden");
    listEl.innerHTML = pastDesignationsList.map((d) => {
      const cancha = d.cancha ? (d.cancha.nombreCancha || d.cancha.nombre) : "Cancha";
      return `
        <label class="p-3 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-between cursor-pointer hover:bg-slate-100 transition text-xs">
          <div class="flex items-center gap-2.5">
            <input type="checkbox" class="clone-item-check w-4 h-4 accent-emerald-600 rounded" value="${d.idDesignacion}" checked />
            <div>
              <div class="font-bold text-slate-800">${cancha}</div>
              <div class="text-[10px] text-slate-500">${formatFecha(d.fechaYHora)} · ${d.cantidadPartidos || 1} partido(s)</div>
            </div>
          </div>
          <span class="badge badge-green text-[9px]">${d.etapa || "Normal"}</span>
        </label>
      `;
    }).join("");

    listEl.querySelectorAll(".clone-item-check").forEach((c) => {
      c.addEventListener("change", updateCloneSelection);
    });

    updateCloneSelection();
  } catch (err) {
    console.error(err);
  } finally {
    loader.classList.add("hidden");
  }
}

function updateCloneSelection() {
  const checks = modalEl.querySelectorAll(".clone-item-check:checked");
  cloneSelectedIds = Array.from(checks).map((c) => parseInt(c.value));
  modalEl.querySelector("#clone-select-count").textContent = cloneSelectedIds.length;
  modalEl.querySelector("#wizard-btn-clone-submit").disabled = !cloneSelectedIds.length;
}

async function submitClone() {
  if (!cloneSelectedIds.length) return;

  const btn = modalEl.querySelector("#wizard-btn-clone-submit");
  btn.disabled = true;
  btn.innerHTML = `<i class="ti ti-loader spin-icon"></i> <span>Importando...</span>`;

  try {
    for (const id of cloneSelectedIds) {
      const orig = pastDesignationsList.find((d) => d.idDesignacion === id);
      if (!orig) continue;

      const origDate = new Date(orig.fechaYHora);
      origDate.setDate(origDate.getDate() + 7);

      const payload = {
        idCancha: orig.cancha ? (orig.cancha.id || orig.cancha.idCancha) : null,
        fechaYHora: origDate.toISOString().slice(0, 16),
        etapa: orig.etapa || "FECHA_NORMAL",
        cantidadPartidos: orig.cantidadPartidos || 1,
        detalle: orig.detalle || "",
      };

      if (payload.idCancha) {
        await designacionService.createDesignacion(payload);
      }
    }

    addToast(`Se importaron ${cloneSelectedIds.length} designaciones.`);
    closeWizardModal();
    if (onCreateCallback) await onCreateCallback();
  } catch (err) {
    console.error(err);
    addToast("Error al importar designaciones.", "error");
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i class="ti ti-download"></i> <span>Importar seleccionadas</span>`;
  }
}

export function closeWizardModal() {
  if (modalEl) modalEl.classList.add("hidden");
}
