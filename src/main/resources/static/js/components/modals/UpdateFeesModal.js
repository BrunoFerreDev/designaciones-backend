import designacionService from "../../services/designacionService.js";
import designadoService from "../../services/designadoService.js";
import { addToast } from "../../helpers.js";

let modalEl = null;
let currentDesignationId = null;
let designatedList = [];
let onUpdateCallback = null;

export function initUpdateFeesModal(onUpdate) {
  onUpdateCallback = onUpdate;
  if (document.getElementById("update-fees-modal")) {
    modalEl = document.getElementById("update-fees-modal");
    bindEvents();
    return;
  }

  const div = document.createElement("div");
  div.id = "update-fees-modal";
  div.className = "modal-overlay hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4";
  div.innerHTML = `
    <div class="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
      <div class="px-6 py-4 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
        <div>
          <h3 class="font-bold text-slate-800 text-base">Aranceles y Honorarios</h3>
          <div class="text-xs text-slate-500 mt-0.5">
            🏟️ <strong id="fees-cancha-name" class="text-slate-700">Cancha</strong>
          </div>
        </div>
        <button type="button" class="modal-close-btn p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 cursor-pointer">
          <i class="ti ti-x text-lg"></i>
        </button>
      </div>

      <div class="p-6 overflow-y-auto flex flex-col gap-5 flex-1">
        <input type="hidden" id="fees-designacion-id" />

        <div class="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-4 flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-lg flex-shrink-0">
              <i class="ti ti-receipt-2"></i>
            </div>
            <div>
              <div class="text-xs font-bold text-blue-900">Arancel Oficial Sugerido</div>
              <div class="text-[11px] text-blue-700 mt-0.5">Sincroniza los honorarios según la categoría y viáticos de la cancha</div>
            </div>
          </div>
          <button type="button" id="btn-sync-auto-fees" class="btn px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer flex-shrink-0">
            <i class="ti ti-refresh"></i>
            <span>Sincronizar</span>
          </button>
        </div>

        <div class="bg-slate-50 border border-slate-150 rounded-2xl p-4 flex flex-col gap-2.5">
          <label class="text-xs font-bold text-slate-700 uppercase tracking-wider">Aplicar Monto por Lote a Todos</label>
          <div class="flex gap-2">
            <div class="relative flex-1 flex items-center">
              <span class="absolute left-3 text-xs font-bold text-slate-400">$</span>
              <input type="number" id="fees-bulk-amount" class="w-full h-10 bg-white border border-slate-200 rounded-xl pl-7 pr-3 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500" placeholder="Monto común..." min="0" />
            </div>
            <button type="button" id="btn-apply-bulk-fee" class="btn primary h-10 px-4 text-xs font-bold flex items-center gap-1.5 cursor-pointer">
              <i class="ti ti-check"></i>
              <span>Aplicar</span>
            </button>
          </div>
          <div class="flex items-center gap-1.5 flex-wrap pt-1">
            <span class="text-[10px] text-slate-400 font-semibold mr-1">Sugeridos:</span>
            <button type="button" class="btn-preset-fee text-[10px] bg-white hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 px-2 py-0.5 rounded-lg font-bold text-slate-600 transition cursor-pointer" data-amount="5000">$5.000</button>
            <button type="button" class="btn-preset-fee text-[10px] bg-white hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 px-2 py-0.5 rounded-lg font-bold text-slate-600 transition cursor-pointer" data-amount="7500">$7.500</button>
            <button type="button" class="btn-preset-fee text-[10px] bg-white hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 px-2 py-0.5 rounded-lg font-bold text-slate-600 transition cursor-pointer" data-amount="10000">$10.000</button>
            <button type="button" class="btn-preset-fee text-[10px] bg-white hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 px-2 py-0.5 rounded-lg font-bold text-slate-600 transition cursor-pointer" data-amount="15000">$15.000</button>
          </div>
        </div>

        <div class="flex flex-col gap-2.5">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <i class="ti ti-users text-slate-400"></i>
              <span>Árbitros Designados y Honorarios Individuales</span>
            </span>
            <span id="fees-list-count" class="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">0</span>
          </div>

          <div id="fees-loader" class="text-center py-6 text-xs text-slate-400 hidden">
            <i class="ti ti-loader spin-icon text-xl text-emerald-600 block mb-1.5 mx-auto"></i>
            <span>Cargando planilla de árbitros...</span>
          </div>

          <div id="fees-empty" class="bg-slate-50 border border-dashed border-slate-200 rounded-2xl py-6 text-center text-slate-400 text-xs hidden">
            No hay árbitros asignados en esta designación.
          </div>

          <div id="fees-list" class="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1"></div>

          <div id="fees-save-all-row" class="hidden flex justify-end pt-1">
            <button type="button" id="btn-save-all-fees" class="text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer">
              <i class="ti ti-device-floppy text-sm"></i>
              <span>Guardar todos los montos</span>
            </button>
          </div>
        </div>

        <div id="fees-summary-box" class="bg-emerald-50/70 border border-emerald-200/80 text-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
          <div>
            <div class="text-[10px] uppercase font-bold tracking-wider text-emerald-800 flex items-center gap-1">
              <i class="ti ti-calculator text-emerald-600 text-sm"></i>
              <span>Total Liquidación Cancha</span>
            </div>
            <div class="text-xs text-slate-500 font-medium mt-0.5">
              <span id="fees-total-arbitros" class="font-bold text-slate-700">0</span> árbitros asignados
            </div>
          </div>
          <div class="text-right">
            <div id="fees-total-sum" class="text-lg font-extrabold text-emerald-700 font-mono">$0</div>
          </div>
        </div>
      </div>

      <div class="px-6 py-4 bg-slate-50 border-t border-slate-150 flex items-center justify-end gap-2">
        <button type="button" class="modal-close-btn px-5 py-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-xs text-slate-600 hover:bg-slate-100 transition cursor-pointer">
          Listo
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
    btn.addEventListener("click", closeUpdateFeesModal);
  });
  modalEl.addEventListener("click", (e) => {
    if (e.target === modalEl) closeUpdateFeesModal();
  });

  const bulkInput = modalEl.querySelector("#fees-bulk-amount");
  modalEl.querySelectorAll(".btn-preset-fee").forEach((btn) => {
    btn.addEventListener("click", () => {
      bulkInput.value = btn.dataset.amount;
      bulkInput.focus();
    });
  });

  const btnApplyBulk = modalEl.querySelector("#btn-apply-bulk-fee");
  if (btnApplyBulk) {
    btnApplyBulk.addEventListener("click", handleApplyBulkFee);
  }

  const btnSyncAuto = modalEl.querySelector("#btn-sync-auto-fees");
  if (btnSyncAuto) {
    btnSyncAuto.addEventListener("click", handleSyncAutoFees);
  }

  const btnSaveAll = modalEl.querySelector("#btn-save-all-fees");
  if (btnSaveAll) {
    btnSaveAll.addEventListener("click", handleSaveAllFees);
  }
}

export async function openUpdateFeesModal(id, onUpdate) {
  if (onUpdate) onUpdateCallback = onUpdate;
  if (!modalEl) initUpdateFeesModal(onUpdateCallback);

  currentDesignationId = id;
  const feesDesignacionId = modalEl.querySelector("#fees-designacion-id");
  if (feesDesignacionId) feesDesignacionId.value = id;

  modalEl.classList.remove("hidden");
  await reloadFeesData();
}

async function reloadFeesData() {
  const feesLoader = modalEl.querySelector("#fees-loader");
  const feesList = modalEl.querySelector("#fees-list");
  const feesEmpty = modalEl.querySelector("#fees-empty");
  const saveAllRow = modalEl.querySelector("#fees-save-all-row");

  if (feesLoader) feesLoader.classList.remove("hidden");
  if (feesList) feesList.innerHTML = "";
  if (feesEmpty) feesEmpty.classList.add("hidden");
  if (saveAllRow) saveAllRow.classList.add("hidden");

  try {
    const [desigRes, designadosRes] = await Promise.all([
      designacionService.getById(currentDesignationId),
      designadoService.getByDesignacion(currentDesignationId),
    ]);

    const d = desigRes && desigRes.data ? desigRes.data : desigRes;
    const designadosRaw = designadosRes && designadosRes.data ? designadosRes.data : designadosRes;
    designatedList = Array.isArray(designadosRaw) ? designadosRaw : [];

    const canchaName = d && d.cancha ? (d.cancha.nombreCancha || d.cancha.nombre) : "Cancha";
    modalEl.querySelector("#fees-cancha-name").textContent = canchaName;
    modalEl.querySelector("#fees-list-count").textContent = `${designatedList.length} árbitros`;
    modalEl.querySelector("#fees-total-arbitros").textContent = designatedList.length;

    if (designatedList.length && saveAllRow) {
      saveAllRow.classList.remove("hidden");
    }

    renderFeesList();
    calculateTotal();
  } catch (err) {
    console.error(err);
    addToast("Error al cargar datos de aranceles.", "error");
  } finally {
    if (feesLoader) feesLoader.classList.add("hidden");
  }
}

function renderFeesList() {
  const feesList = modalEl.querySelector("#fees-list");
  const feesEmpty = modalEl.querySelector("#fees-empty");

  if (!designatedList.length) {
    feesList.innerHTML = "";
    feesEmpty.classList.remove("hidden");
    return;
  }

  feesEmpty.classList.add("hidden");
  feesList.innerHTML = designatedList.map((item) => {
    const a = item.arbitro || {};
    const monto = item.monto || 0;

    return `
      <div class="p-3 bg-slate-50 border border-slate-150 rounded-2xl flex items-center justify-between gap-3">
        <div class="min-w-0">
          <div class="text-xs font-bold text-slate-800 truncate">${a.nombre || ""} ${a.apellido || ""}</div>
          <div class="text-[10px] text-slate-400">${a.categoria || "Árbitro"}</div>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-xs font-bold text-slate-400">$</span>
          <input type="number" class="fee-single-input w-24 h-8 bg-white border border-slate-200 rounded-lg px-2 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500" value="${monto}" data-id="${item.idDesignado}" min="0" />
          <button type="button" class="btn-save-single-fee p-1.5 text-xs text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition cursor-pointer" data-id="${item.idDesignado}" title="Guardar monto">
            <i class="ti ti-check"></i>
          </button>
        </div>
      </div>
    `;
  }).join("");

  feesList.querySelectorAll(".fee-single-input").forEach((input) => {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const idDesignado = parseInt(input.dataset.id);
        const btn = feesList.querySelector(`.btn-save-single-fee[data-id="${idDesignado}"]`);
        if (btn) btn.click();
      }
    });
    input.addEventListener("input", () => {
      // Recalculate dynamic sum in UI
      let sum = 0;
      feesList.querySelectorAll(".fee-single-input").forEach((inp) => {
        sum += parseFloat(inp.value) || 0;
      });
      modalEl.querySelector("#fees-total-sum").textContent = `$${sum.toLocaleString("es-AR")}`;
    });
  });

  feesList.querySelectorAll(".btn-save-single-fee").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const idDesignado = parseInt(btn.dataset.id);
      const input = feesList.querySelector(`.fee-single-input[data-id="${idDesignado}"]`);
      const amount = parseFloat(input.value);
      if (isNaN(amount) || amount < 0) {
        addToast("Ingrese un monto válido.", "error");
        return;
      }
      try {
        await designadoService.actualizarMonto(idDesignado, amount);
        addToast("Monto actualizado.");
        await reloadFeesData();
        if (onUpdateCallback) onUpdateCallback(currentDesignationId);
      } catch (err) {
        console.error(err);
        addToast("Error al actualizar monto.", "error");
      }
    });
  });
}

async function handleSaveAllFees() {
  const feesList = modalEl.querySelector("#fees-list");
  const inputs = feesList.querySelectorAll(".fee-single-input");
  if (!inputs.length) return;

  const btnSaveAll = modalEl.querySelector("#btn-save-all-fees");
  btnSaveAll.disabled = true;
  btnSaveAll.innerHTML = `<i class="ti ti-loader spin-icon"></i> <span>Guardando...</span>`;

  try {
    const promises = Array.from(inputs).map((input) => {
      const idDesignado = parseInt(input.dataset.id);
      const amount = parseFloat(input.value) || 0;
      return designadoService.actualizarMonto(idDesignado, amount);
    });

    await Promise.all(promises);
    addToast("Todos los montos individuales fueron guardados.");
    await reloadFeesData();
    if (onUpdateCallback) onUpdateCallback(currentDesignationId);
  } catch (err) {
    console.error(err);
    addToast("Error al guardar algunos montos.", "error");
  } finally {
    btnSaveAll.disabled = false;
    btnSaveAll.innerHTML = `<i class="ti ti-device-floppy text-sm"></i> <span>Guardar todos los montos</span>`;
  }
}

function calculateTotal() {
  const total = designatedList.reduce((acc, curr) => acc + (curr.monto || 0), 0);
  modalEl.querySelector("#fees-total-sum").textContent = `$${total.toLocaleString("es-AR")}`;
}

async function handleApplyBulkFee() {
  const bulkInput = modalEl.querySelector("#fees-bulk-amount");
  const amount = parseFloat(bulkInput.value);
  if (isNaN(amount) || amount < 0) {
    addToast("Ingrese un monto válido.", "error");
    return;
  }

  if (!confirm(`¿Actualizar el arancel de todos los árbitros a $${amount}?`)) return;

  const btnApply = modalEl.querySelector("#btn-apply-bulk-fee");
  btnApply.disabled = true;
  btnApply.innerHTML = `<i class="ti ti-loader spin-icon"></i> <span>Aplicando...</span>`;

  try {
    await designadoService.actualizarMontoATodos(currentDesignationId, amount);
    addToast("Montos actualizados correctamente a todos los árbitros.");
    bulkInput.value = "";
    await reloadFeesData();
    if (onUpdateCallback) onUpdateCallback(currentDesignationId);
  } catch (err) {
    console.error(err);
    addToast("Error al actualizar montos.", "error");
  } finally {
    btnApply.disabled = false;
    btnApply.innerHTML = `<i class="ti ti-check"></i> <span>Aplicar</span>`;
  }
}

async function handleSyncAutoFees() {
  if (!confirm("¿Deseas sincronizar los aranceles automáticamente según la cancha y viáticos?")) return;

  const btnSync = modalEl.querySelector("#btn-sync-auto-fees");
  btnSync.disabled = true;
  btnSync.innerHTML = `<i class="ti ti-loader spin-icon"></i> <span>Sincronizando...</span>`;

  try {
    await designacionService.vincularArancel(currentDesignationId);
    addToast("Aranceles sincronizados automáticamente.");
    await reloadFeesData();
    if (onUpdateCallback) onUpdateCallback(currentDesignationId);
  } catch (err) {
    console.error(err);
    const msg = (err && err.response && err.response.data && err.response.data.message) || err.message || "Error al sincronizar aranceles.";
    addToast(msg, "error");
  } finally {
    btnSync.disabled = false;
    btnSync.innerHTML = `<i class="ti ti-refresh"></i> <span>Sincronizando</span>`;
  }
}

export function closeUpdateFeesModal() {
  if (modalEl) modalEl.classList.add("hidden");
}
