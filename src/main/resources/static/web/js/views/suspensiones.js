import suspencionService from "../services/suspencionService.js";
import arbitroService from "../services/arbitroService.js";
import canchaService from "../services/canchaService.js";
import { formatFecha, addToast } from "../helpers.js";
import { state, updateState } from "../store.js";

document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const statActiveSuspensions = document.getElementById("stat-active-suspensions");
  const statActiveWarnings = document.getElementById("stat-active-warnings");
  const statSanctionedReferees = document.getElementById("stat-sanctioned-referees");
  const statTotalReferees = document.getElementById("stat-total-referees");

  // Form
  const suspensionForm = document.getElementById("suspension-form");
  const formArbitro = document.getElementById("form-arbitro");
  const formCancha = document.getElementById("form-cancha");
  const btnTypeWarning = document.getElementById("btn-type-warning");
  const btnTypeSuspension = document.getElementById("btn-type-suspension");
  const formFechaIncidente = document.getElementById("form-fecha-incidente");
  const wrapperDays = document.getElementById("wrapper-days");
  const formCantidadDias = document.getElementById("form-cantidad-dias");
  const formMotivo = document.getElementById("form-motivo");
  const btnClearForm = document.getElementById("btn-clear-form");

  // History / Table
  const historySearch = document.getElementById("history-search");
  const historyFilterType = document.getElementById("history-filter-type");
  const badgeHistoryCount = document.getElementById("badge-history-count");
  const historyEmpty = document.getElementById("history-empty");
  const historyTableWrapper = document.getElementById("history-table-wrapper");
  const historyTbody = document.getElementById("history-tbody");

  // Detail Modal
  const detailModal = document.getElementById("detail-modal");
  const detailHeader = document.getElementById("detail-header");
  const detailHeaderIcon = document.getElementById("detail-header-icon");
  const detailHeaderSubtitle = document.getElementById("detail-header-subtitle");
  const detailClose = document.getElementById("detail-close");
  const detailAvatar = document.getElementById("detail-avatar");
  const detailName = document.getElementById("detail-name");
  const detailCategory = document.getElementById("detail-category");
  const detailPhoneWrapper = document.getElementById("detail-phone-wrapper");
  const detailPhone = document.getElementById("detail-phone");
  const detailTypeBadge = document.getElementById("detail-type-badge");
  const detailDuration = document.getElementById("detail-duration");
  const detailDate = document.getElementById("detail-date");
  const detailCancha = document.getElementById("detail-cancha");
  const detailVigenciaWrapper = document.getElementById("detail-vigencia-wrapper");
  const detailEndDate = document.getElementById("detail-end-date");
  const detailStatusBadge = document.getElementById("detail-status-badge");
  const detailMotivo = document.getElementById("detail-motivo");
  const btnRevokeSancion = document.getElementById("btn-revoke-sancion");
  const btnShareWhatsapp = document.getElementById("btn-share-whatsapp");

  // Local State variables
  let allArbitros = [];
  let allCanchas = [];
  let allSuspensiones = [];
  let selectedType = 1; // 1 = Warning, 2 = Suspension
  
  let historyFilterSearch = "";
  let historyFilterTypeValue = "";
  let currentDetailSuspension = null;

  // Initialize dates
  setDefaultDate();
  fetchInitialData();

  // Listeners Form Type buttons
  btnTypeWarning.addEventListener("click", () => {
    selectedType = 1;
    btnTypeWarning.className = "flex-1 py-2 px-3 border border-emerald-500 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl transition";
    btnTypeSuspension.className = "flex-1 py-2 px-3 border border-slate-200 bg-white text-slate-600 text-xs font-semibold rounded-xl transition";
    wrapperDays.classList.add("hidden");
  });

  btnTypeSuspension.addEventListener("click", () => {
    selectedType = 2;
    btnTypeSuspension.className = "flex-1 py-2 px-3 border border-red-500 bg-red-50 text-red-700 text-xs font-semibold rounded-xl transition";
    btnTypeWarning.className = "flex-1 py-2 px-3 border border-slate-200 bg-white text-slate-600 text-xs font-semibold rounded-xl transition";
    wrapperDays.classList.remove("hidden");
  });

  // Reset form
  btnClearForm.addEventListener("click", () => {
    suspensionForm.reset();
    setDefaultDate();
    btnTypeWarning.click();
  });

  // Form submit
  suspensionForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    await createSuspension();
  });

  // History filters
  historySearch.addEventListener("input", (e) => {
    historyFilterSearch = e.target.value.toLowerCase().trim();
    renderHistory();
  });

  historyFilterType.addEventListener("change", (e) => {
    historyFilterTypeValue = e.target.value;
    renderHistory();
  });

  // Modal Close
  detailClose.addEventListener("click", closeDetailModal);

  // Detail Modal Actions
  btnRevokeSancion.addEventListener("click", async () => {
    if (!currentDetailSuspension) return;
    const id = currentDetailSuspension.id || currentDetailSuspension.idSuspencion;
    if (!confirm("¿Deseas eliminar/revocar esta sanción?")) return;
    
    try {
      await suspencionService.deleteSuspencion(id);
      allSuspensiones = allSuspensiones.filter(s => s.id !== id && s.idSuspencion !== id);
      state.suspensiones = allSuspensiones;
      updateState("suspensiones", allSuspensiones);
      
      addToast("Sanción eliminada correctamente");
      closeDetailModal();
      renderStats();
      renderHistory();
    } catch (err) {
      console.warn("Delete failed, applying locally", err);
      allSuspensiones = allSuspensiones.filter(s => s.id !== id && s.idSuspencion !== id);
      state.suspensiones = allSuspensiones;
      updateState("suspensiones", allSuspensiones);
      
      addToast("Sanción eliminada localmente");
      closeDetailModal();
      renderStats();
      renderHistory();
    }
  });

  btnShareWhatsapp.addEventListener("click", shareOnWhatsApp);

  // Set default form date to today
  function setDefaultDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    formFechaIncidente.value = `${year}-${month}-${day}`;
  }

  // Load select options and suspension list
  async function fetchInitialData() {
    try {
      // 1. Fetch Referees
      let cachedRefs = sessionStorage.getItem("cached_arbitros");
      if (cachedRefs) {
        allArbitros = JSON.parse(cachedRefs);
      } else {
        const refs = await arbitroService.getAll(0, 100, { showLoader: false });
        allArbitros = Array.isArray(refs) ? refs : refs.content || [];
        sessionStorage.setItem("cached_arbitros", JSON.stringify(allArbitros));
      }
      state.arbitros = allArbitros;
      updateState("arbitros", allArbitros);
      statTotalReferees.textContent = allArbitros.length;

      // Populate Referee Select
      formArbitro.innerHTML = '<option value="" disabled selected>Seleccione un árbitro...</option>';
      const sortedRefs = [...allArbitros].sort((a, b) => a.apellido.localeCompare(b.apellido));
      sortedRefs.forEach(a => {
        const option = document.createElement("option");
        option.value = a.idArbitro;
        
        const catLabel = a.categoria ? a.categoria.charAt(0) + a.categoria.slice(1).toLowerCase() : "Inicial";
        const availableText = a.disponibleSabado || a.disponibleDomingo ? "Disponible" : "No Disp.";
        
        option.textContent = `${a.apellido}, ${a.nombre} (${catLabel}) · [${availableText}]`;
        formArbitro.appendChild(option);
      });

      // 2. Fetch Canchas
      const cachedCanchas = state.canchas;
      if (cachedCanchas && cachedCanchas.length > 0) {
        allCanchas = cachedCanchas;
      } else {
        const courts = await canchaService.getAll(0, 100);
        const courtsList = Array.isArray(courts) ? courts : courts.content || [];
        allCanchas = courtsList.map(c => ({
          id: c.idCancha || c.id,
          nombre: c.nombreCancha || c.nombre,
          ciudad: c.ciudad || "",
        }));
        state.canchas = allCanchas;
        updateState("canchas", allCanchas);
      }

      // Populate Cancha Select
      formCancha.innerHTML = '<option value="">Ninguna / No aplica</option>';
      allCanchas.forEach(c => {
        const option = document.createElement("option");
        option.value = c.id || c.idCancha;
        option.textContent = `${c.nombre || c.nombreCancha} (${c.ciudad || "Sin ubicación"})`;
        formCancha.appendChild(option);
      });

      // 3. Fetch Suspensions
      const suspensions = await suspencionService.getAll(0, 100);
      allSuspensiones = Array.isArray(suspensions) ? suspensions : suspensions.content || [];
      state.suspensiones = allSuspensiones;
      updateState("suspensiones", allSuspensiones);

      renderStats();
      renderHistory();
    } catch (err) {
      console.error(err);
      addToast("Error al inicializar la pantalla de suspensiones.", "error");
    }
  }

  // Check if suspension is active
  function isSuspensionActive(s) {
    if (s.tipoSuspencion !== 2) return false;
    try {
      if (s.fechaFin) {
        return new Date(s.fechaFin) > new Date();
      }
      const start = new Date(s.fechaIncidente);
      const duration = parseInt(s.cantidadDias || 0);
      const end = new Date(start.getTime() + duration * 24 * 60 * 60 * 1000);
      return end > new Date();
    } catch (e) {
      return false;
    }
  }

  function getArbitroId(arbitroProp) {
    if (!arbitroProp) return null;
    if (typeof arbitroProp === "object") {
      return arbitroProp.idArbitro || arbitroProp.id;
    }
    return Number(arbitroProp);
  }

  // Render metrics
  function renderStats() {
    const activeSusp = allSuspensiones.filter(s => s.tipoSuspencion === 2 && isSuspensionActive(s)).length;
    const activeWarn = allSuspensiones.filter(s => s.tipoSuspencion === 1).length;
    
    const uniqueSanctioned = new Set(allSuspensiones.map(s => getArbitroId(s.arbitro)));

    statActiveSuspensions.textContent = activeSusp;
    statActiveWarnings.textContent = activeWarn;
    statSanctionedReferees.textContent = uniqueSanctioned.size;
  }

  // Render Table list
  function renderHistory() {
    // Filter and sort reverse (newest first)
    const filtered = allSuspensiones.filter(s => {
      const arbId = getArbitroId(s.arbitro);
      const arb = allArbitros.find(a => a.idArbitro === arbId);
      
      let arbName = "";
      if (arb) {
        arbName = `${arb.nombre} ${arb.apellido}`.toLowerCase();
      } else if (typeof s.arbitro === "object") {
        arbName = `${s.arbitro.nombre || ""} ${s.arbitro.apellido || ""}`.toLowerCase();
      } else {
        arbName = `id: ${arbId}`;
      }

      const matchesSearch = !historyFilterSearch || arbName.includes(historyFilterSearch);
      const matchesType = !historyFilterTypeValue || String(s.tipoSuspencion) === String(historyFilterTypeValue);

      return matchesSearch && matchesType;
    }).reverse();

    badgeHistoryCount.textContent = filtered.length;
    historyTbody.innerHTML = "";

    if (filtered.length === 0) {
      historyEmpty.classList.remove("hidden");
      historyTableWrapper.classList.add("hidden");
    } else {
      historyEmpty.classList.add("hidden");
      historyTableWrapper.classList.remove("hidden");

      filtered.forEach(s => {
        const arbId = getArbitroId(s.arbitro);
        const arb = allArbitros.find(a => a.idArbitro === arbId);
        
        let name = "Desconocido";
        if (arb) {
          name = `${arb.apellido}, ${arb.nombre}`;
        } else if (typeof s.arbitro === "object") {
          name = `${s.arbitro.apellido || ""}, ${s.arbitro.nombre || ""}`;
        }

        const initials = name.split(", ").map(w => w ? w[0] : "").join("").toUpperCase().slice(0, 2);

        const typeBadge = s.tipoSuspencion === 2 
          ? `<span class="badge badge-red bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full font-bold">Suspensión (${s.cantidadDias}d)</span>`
          : `<span class="badge badge-amber bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-bold">Llamado Atención</span>`;

        const statusText = s.tipoSuspencion === 2
          ? (isSuspensionActive(s)
              ? `<span class="badge badge-red bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded font-bold">Activa</span>`
              : `<span class="badge badge-gray bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded font-medium">Expirada</span>`)
          : `<span class="badge badge-gray bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded font-medium">Registrado</span>`;

        const tr = document.createElement("tr");
        tr.className = "border-b border-slate-100 hover:bg-slate-50/50";
        tr.innerHTML = `
          <td class="p-3">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-full bg-slate-200 text-slate-600 font-bold flex items-center justify-center text-[10px]">${initials}</div>
              <span class="font-bold text-slate-800">${name}</span>
            </div>
          </td>
          <td class="p-3">
            <div class="flex flex-col gap-1 items-start">
              ${typeBadge}
              <span class="text-[10px] text-slate-400 capitalize">${formatFecha(s.fechaIncidente?.split("T")[0])}</span>
            </div>
          </td>
          <td class="p-3 text-slate-700 font-medium">${s.cancha?.nombreCancha || "—"}</td>
          <td class="p-3">
            <button type="button" class="btn btn-view-detail px-2 py-1 text-[10px] border border-blue-200 text-blue-600 bg-blue-50/50 rounded-lg hover:bg-blue-50 transition cursor-pointer font-bold flex items-center gap-0.5">
              <span>👁️ Ver Detalle</span>
            </button>
          </td>
          <td class="p-3">${statusText}</td>
        `;

        tr.querySelector(".btn-view-detail").addEventListener("click", () => {
          openDetailModal(s);
        });

        historyTbody.appendChild(tr);
      });
    }
  }

  // Create suspension
  async function createSuspension() {
    const arbId = parseInt(formArbitro.value);
    const canchaId = formCancha.value ? parseInt(formCancha.value) : null;
    
    let formattedFecha = formFechaIncidente.value;
    if (formattedFecha && !formattedFecha.includes("T")) {
      formattedFecha = formattedFecha + "T00:00:00";
    }

    const dto = {
      fechaIncidente: formattedFecha,
      cantidadDias: selectedType === 2 ? parseInt(formCantidadDias.value || 1) : 0,
      motivo: formMotivo.value.trim(),
      tipoSuspencion: selectedType,
      arbitro: arbId,
      cancha: canchaId,
    };

    try {
      const created = await suspencionService.create(arbId, dto);
      const newSusp = {
        id: created?.id || created?.idSuspencion || Date.now(),
        ...dto,
        ...created,
      };

      allSuspensiones.push(newSusp);
      state.suspensiones = allSuspensiones;
      updateState("suspensiones", allSuspensiones);

      // Handle referee availability in memory if suspended
      if (selectedType === 2) {
        const arb = allArbitros.find(a => a.idArbitro === arbId);
        if (arb && arb.estado) {
          arb.estado = false;
          
          // Re-save availability on the server in background
          try {
            await arbitroService.updateDisponibilidad(arbId, {
              estado: false,
              disponibleSabado: arb.disponibleSabado,
              disponibleDomingo: arb.disponibleDomingo,
            });
          } catch (err) {
            console.warn("Could not save availability toggle on server", err);
          }
        }
        
        // Remove from session cache as they are now unavailable
        sessionStorage.removeItem("cached_arbitros");
      }

      addToast("Sanción registrada exitosamente.");
      
      // Reset form
      suspensionForm.reset();
      setDefaultDate();
      btnTypeWarning.click();

      // Refresh
      renderStats();
      renderHistory();
    } catch (err) {
      console.error(err);
      addToast("Error al registrar la sanción.", "error");
    }
  }

  // Modal actions
  function openDetailModal(s) {
    currentDetailSuspension = s;

    const arbId = getArbitroId(s.arbitro);
    const arb = allArbitros.find(a => a.idArbitro === arbId);

    let name = "Desconocido";
    let category = "Inicial";
    let phone = "";
    if (arb) {
      name = `${arb.apellido}, ${arb.nombre}`;
      category = arb.categoria ? arb.categoria.charAt(0) + arb.categoria.slice(1).toLowerCase() : "Inicial";
      phone = arb.whatsapp || "";
    } else if (typeof s.arbitro === "object") {
      name = `${s.arbitro.apellido || ""}, ${s.arbitro.nombre || ""}`;
      category = s.arbitro.categoria ? s.arbitro.categoria.charAt(0) + s.arbitro.categoria.slice(1).toLowerCase() : "Inicial";
    }

    const initials = name.split(", ").map(w => w ? w[0] : "").join("").toUpperCase().slice(0, 2);

    detailAvatar.textContent = initials;
    detailName.textContent = name;
    detailCategory.textContent = category;

    if (phone) {
      detailPhone.textContent = phone;
      detailPhoneWrapper.classList.remove("hidden");
    } else {
      detailPhoneWrapper.classList.add("hidden");
    }

    // Modal Header theme
    if (s.tipoSuspencion === 2) {
      detailHeader.className = "px-6 py-4 flex items-center justify-between text-white bg-red-600";
      detailHeaderIcon.className = "ti ti-ban text-xl";
      detailHeaderSubtitle.textContent = "Suspensión Temporal";
      
      detailTypeBadge.className = "badge text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded-md";
      detailTypeBadge.textContent = "🚫 Suspensión";
      
      detailDuration.className = "font-semibold text-red-700";
      detailDuration.textContent = `${s.cantidadDias} días`;

      // End Date period
      if (s.fechaFin) {
        detailEndDate.textContent = formatFecha(s.fechaFin?.split("T")[0]);
        detailVigenciaWrapper.classList.remove("hidden");

        const isActive = isSuspensionActive(s);
        detailStatusBadge.className = isActive 
          ? "badge text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded font-bold"
          : "badge text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded font-medium";
        detailStatusBadge.textContent = isActive ? "Activa" : "Expirada";
      } else {
        detailVigenciaWrapper.classList.add("hidden");
      }
    } else {
      detailHeader.className = "px-6 py-4 flex items-center justify-between text-white bg-amber-600";
      detailHeaderIcon.className = "ti ti-alert text-xl";
      detailHeaderSubtitle.textContent = "Llamado de Atención";
      
      detailTypeBadge.className = "badge text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-md";
      detailTypeBadge.textContent = "⚠️ Llamado Atención";
      
      detailDuration.className = "font-semibold text-slate-700";
      detailDuration.textContent = "No aplica";
      detailVigenciaWrapper.classList.add("hidden");
    }

    detailDate.textContent = formatFecha(s.fechaIncidente?.split("T")[0]);
    detailCancha.textContent = s.cancha?.nombreCancha || "—";
    detailMotivo.textContent = `"${s.motivo || "Sin descripción"}"`;

    detailModal.classList.remove("hidden");
  }

  function closeDetailModal() {
    detailModal.classList.add("hidden");
    currentDetailSuspension = null;
  }

  // Share on WhatsApp
  function shareOnWhatsApp() {
    if (!currentDetailSuspension) return;

    const s = currentDetailSuspension;
    const arbId = getArbitroId(s.arbitro);
    const arb = allArbitros.find(a => a.idArbitro === arbId);
    
    let name = "Árbitro";
    let phone = "";
    if (arb) {
      name = `${arb.nombre} ${arb.apellido}`;
      phone = arb.whatsapp || "";
    } else if (typeof s.arbitro === "object") {
      name = `${s.arbitro.nombre || ""} ${s.arbitro.apellido || ""}`;
    }

    const typeText = s.tipoSuspencion === 2
      ? `🚫 *SUSPENSIÓN TEMPORAL DE ${s.cantidadDias} DÍAS*`
      : `⚠️ *LLAMADO DE ATENCIÓN*`;

    const dateFormatted = formatFecha(s.fechaIncidente?.split("T")[0]);
    const canchaText = s.cancha?.nombreCancha || "Ninguna";

    let text = `⚠️ *NOTIFICACIÓN DISCIPLINARIA*\n\n`;
    text += `Hola *${name}*,\n\n`;
    text += `Te notificamos que se ha registrado una medida disciplinaria en el sistema:\n\n`;
    text += `*Medida:* ${typeText}\n`;
    text += `*Fecha del incidente:* ${dateFormatted}\n`;
    text += `*Cancha:* ${canchaText}\n`;
    text += `*Motivo:* "${s.motivo}"\n\n`;

    if (s.tipoSuspencion === 2 && s.fechaFin) {
      const untilFormatted = formatFecha(s.fechaFin?.split("T")[0]);
      text += `*Inhabilitación vigente hasta:* ${untilFormatted}\n\n`;
    }

    text += `Por favor, ponte en contacto con la comisión si tienes alguna consulta.`;

    const cleanPhone = phone ? phone.replace(/[^0-9]/g, "") : "";
    const url = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;

    window.open(url, "_blank");
  }
});
