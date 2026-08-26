import { formatFecha, minArbitros } from "../../helpers.js";

export function renderDesignationCard(d, handlers = {}) {
  const isFueraDeJuego = d.cancha && d.cancha.fueraDeJuego;
  const isViaje = d.cancha && d.cancha.necesitaViaje;
  const minRequired = minArbitros(isFueraDeJuego);
  const designados = d.designados || [];
  const count = designados.length;
  const canchaName = d.cancha ? (d.cancha.nombreCancha || d.cancha.nombre) : "Cancha sin asignar";

  // Total aranceles calculation
  const totalArancel = designados.reduce((acc, item) => acc + (Number(item.monto) || 0), 0);
  const arancelText = totalArancel > 0 ? `$${totalArancel.toLocaleString("es-AR")}` : "Sin liquidar";

  // Status badge config
  let statusBadgeClass = "bg-slate-50 text-slate-700 border border-slate-300";
  let statusBadgeIcon = "ti ti-info-circle";
  let statusBadgeText = d.estado || "INCOMPLETA";

  if (d.estado === "COMPLETA" || d.estado === "COMPLETADA") {
    statusBadgeClass = "bg-emerald-50 text-emerald-700 border border-emerald-300";
    statusBadgeIcon = "ti ti-check";
    statusBadgeText = "Completa";
  } else if (d.estado === "A_CONFIRMAR" || d.estado === "CONFIRMADA") {
    statusBadgeClass = "bg-sky-50 text-sky-700 border border-sky-300";
    statusBadgeIcon = "ti ti-help";
    statusBadgeText = "A Confirmar";
  } else if (d.estado === "FINALIZADA" || d.estado === 2) {
    statusBadgeClass = "bg-sky-50 text-blue-600 border border-sky-300";
    statusBadgeIcon = "";
    statusBadgeText = "Finalizada";
  } else if (d.estado === "SUSPENDIDA") {
    statusBadgeClass = "bg-purple-50 text-purple-700 border border-purple-300";
    statusBadgeIcon = "ti ti-player-pause";
    statusBadgeText = "Suspendida";
  } else if (d.estado === "CANCELADA" || d.estado === 3) {
    statusBadgeClass = "bg-rose-50 text-rose-700 border border-rose-300";
    statusBadgeIcon = "ti ti-ban";
    statusBadgeText = "Cancelada";
  } else {
    statusBadgeClass = "bg-amber-50 text-amber-800 border border-amber-300";
    statusBadgeIcon = "ti ti-alert-circle";
    statusBadgeText = "Incompleta";
  }

  const isFinalizada = d.estado === "FINALIZADA" || d.estado === 2;
  const isCancelada = d.estado === "CANCELADA" || d.estado === 3;

  // Referees list HTML
  let refereesListHTML = "";
  if (!count) {
    refereesListHTML = `
      <div class="text-xs text-amber-700 bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 flex items-center gap-2">
        <i class="ti ti-alert-triangle text-amber-600 text-base"></i>
        <span>Sin árbitros asignados. Requiere al menos <strong>${minRequired}</strong>.</span>
      </div>
    `;
  } else {
    refereesListHTML = `
      <div class="flex flex-col gap-1 divide-y divide-slate-100">
        ${designados
          .map((item) => {
            const a = item.arbitro || {};
            const rol = item.rol || "Principal";
            const montoVal = Number(item.monto) || 0;
            const montoStr = montoVal > 0 ? `$${montoVal.toLocaleString("es-AR")}` : "Sin arancel";
            const partStr = `${item.cantidadPartidos !== undefined && item.cantidadPartidos !== null ? item.cantidadPartidos : (d.cantidadPartidos || 1)} part.`;

            const badgeFeeClass = isFinalizada
              ? "bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-200 shadow-2xs"
              : "bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-bold border border-slate-200/80 hover:border-emerald-300";

            return `
              <div class="flex items-center justify-between py-2 px-1 hover:bg-slate-50/80 rounded-lg transition-colors gap-2 text-xs">
                <span class="font-bold text-slate-800 text-xs sm:text-sm truncate min-w-0">
                  ${a.nombre || ""} ${a.apellido || ""}
                </span>
                <div class="flex items-center gap-1.5 flex-shrink-0">
                  <span class="bg-slate-100 text-slate-600 font-medium text-[11px] px-2.5 py-0.5 rounded-full">${rol}</span>
                  <button type="button" class="btn-action-fees ${badgeFeeClass} text-[11px] px-2.5 py-0.5 rounded-full transition cursor-pointer" title="Modificar honorario">
                    <i class="ti ti-cash text-xs mr-0.5"></i>
                    <span>${montoStr}</span>
                  </button>
                  <span class="bg-slate-100 text-slate-600 font-medium text-[11px] px-2.5 py-0.5 rounded-full">${partStr}</span>
                </div>
              </div>
            `;
          })
          .join("")}
      </div>
    `;
  }

  // Action buttons depending on state
  let actionButtonsHTML = "";
  if (isFinalizada) {
    actionButtonsHTML = `
      <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2 flex-wrap">
        <button type="button" class="btn-action-sync-fee border border-sky-400 hover:border-sky-500 bg-sky-50/40 hover:bg-sky-100/70 text-sky-700 font-bold px-4 py-1.5 rounded-full text-xs transition flex items-center gap-1.5 cursor-pointer shadow-2xs" title="Vincular arancel oficial de la cancha">
          <span>Vincular Arancel</span>
        </button>

        <button type="button" class="btn-action-fees border border-blue-500 hover:border-blue-600 bg-blue-50/40 hover:bg-blue-100/70 text-blue-700 font-bold px-4 py-1.5 rounded-full text-xs transition flex items-center gap-1.5 cursor-pointer shadow-2xs" title="Configurar o registrar aranceles individuales y por lote">
          <i class="ti ti-currency-dollar text-sm"></i>
          <span>Aranceles</span>
        </button>

        <button type="button" class="btn-action-detail border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 font-bold px-4 py-1.5 rounded-full text-xs transition flex items-center gap-1.5 cursor-pointer shadow-2xs" title="Ver ficha de detalle">
          <span class="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block"></span>
          <span>Ver Detalle</span>
        </button>
      </div>
    `;
  } else {
    actionButtonsHTML = `
      <div class="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
        <!-- Row 1: Main Management Actions -->
        <div class="flex flex-wrap items-center gap-1.5">
          <button type="button" class="btn-action-auto-assign border border-sky-300 hover:border-sky-400 bg-sky-50/40 hover:bg-sky-100/70 text-sky-700 font-bold px-3.5 py-1.5 rounded-full text-xs transition flex items-center gap-1.5 cursor-pointer shadow-2xs" title="Asignar árbitros automáticamente">
            <span>Asignar Autom.</span>
          </button>

          <button type="button" class="btn-action-manage border border-emerald-400 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-100/70 text-emerald-700 font-bold px-3.5 py-1.5 rounded-full text-xs transition flex items-center gap-1.5 cursor-pointer shadow-2xs" title="Gestionar y editar árbitros">
            <i class="ti ti-users text-sm"></i>
            <span>Editar Árbitros</span>
          </button>

          <button type="button" class="btn-action-sync-fee border border-sky-400 hover:border-sky-500 bg-sky-50/40 hover:bg-sky-100/70 text-sky-700 font-bold px-3.5 py-1.5 rounded-full text-xs transition flex items-center gap-1.5 cursor-pointer shadow-2xs" title="Vincular / sincronizar arancel oficial de la cancha">
            <span>Vincular Arancel</span>
          </button>

          <button type="button" class="btn-action-fees border border-blue-500 hover:border-blue-600 bg-blue-50/40 hover:bg-blue-100/70 text-blue-700 font-bold px-3.5 py-1.5 rounded-full text-xs transition flex items-center gap-1.5 cursor-pointer shadow-2xs" title="Configurar o registrar aranceles individuales y por lote">
            <i class="ti ti-currency-dollar text-sm"></i>
            <span>Aranceles</span>
          </button>

          <button type="button" class="btn-action-edit border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 font-bold px-3.5 py-1.5 rounded-full text-xs transition flex items-center gap-1.5 cursor-pointer shadow-2xs" title="Editar designación / Reprogramar">
            <i class="ti ti-edit text-sm"></i>
            <span>Editar</span>
          </button>

          <button type="button" class="btn-action-finalize border border-emerald-600 hover:border-emerald-700 bg-emerald-50/40 hover:bg-emerald-100/70 text-emerald-800 font-bold px-3.5 py-1.5 rounded-full text-xs transition flex items-center gap-1.5 cursor-pointer shadow-2xs" title="Finalizar designación">
            <i class="ti ti-flag text-sm"></i>
            <span>Finalizar</span>
          </button>

          ${!isCancelada ? `
            <button type="button" class="btn-action-suspend border border-purple-500 hover:border-purple-600 bg-purple-50/40 hover:bg-purple-100/70 text-purple-700 font-bold px-3.5 py-1.5 rounded-full text-xs transition flex items-center gap-1.5 cursor-pointer shadow-2xs" title="Suspender designación">
              <i class="ti ti-player-pause text-sm"></i>
              <span>Suspender</span>
            </button>
          ` : ""}
        </div>

        <!-- Row 2: Secondary / Quick Actions (Right aligned) -->
        <div class="flex flex-wrap items-center justify-end gap-2 mt-1">
          ${!isCancelada ? `
            <button type="button" class="btn-action-cancel border border-orange-400 hover:border-orange-500 bg-white hover:bg-orange-50/70 text-orange-600 font-bold px-3.5 py-1.5 rounded-full text-xs transition flex items-center gap-1.5 cursor-pointer shadow-2xs" title="Cancelar designación">
              <span class="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span>
              <span>Cancelar</span>
            </button>
          ` : ""}

          <button type="button" class="btn-action-share border border-emerald-500 hover:border-emerald-600 bg-white hover:bg-emerald-50/70 text-emerald-700 font-bold px-3.5 py-1.5 rounded-full text-xs transition flex items-center gap-1.5 cursor-pointer shadow-2xs" title="Compartir por WhatsApp">
            <i class="ti ti-brand-whatsapp text-emerald-600 text-sm"></i>
            <span>Compartir</span>
          </button>

          <button type="button" class="btn-action-detail border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 font-bold px-3.5 py-1.5 rounded-full text-xs transition flex items-center gap-1.5 cursor-pointer shadow-2xs" title="Ver ficha de detalle">
            <span class="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block"></span>
            <span>Ver Detalle</span>
          </button>

          <button type="button" class="btn-action-delete border border-rose-300 hover:border-rose-500 bg-white hover:bg-rose-50 text-rose-600 w-8 h-8 rounded-full text-xs transition flex items-center justify-center cursor-pointer shadow-2xs" title="Eliminar definitivamente">
            <i class="ti ti-trash text-sm"></i>
          </button>
        </div>
      </div>
    `;
  }

  const card = document.createElement("div");
  card.className = "card bg-white border border-slate-200/90 rounded-3xl p-5 md:p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between relative overflow-hidden";
  card.id = `card-desig-${d.idDesignacion}`;

  card.innerHTML = `
    <div>
      <!-- Header section -->
      <div class="flex items-start justify-between gap-3 mb-2">
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2 flex-wrap">
            <h4 class="font-bold text-slate-800 text-base sm:text-lg flex items-center gap-2 truncate">
              <span>🏟️</span>
              <span class="truncate">${canchaName}</span>
            </h4>
          </div>
          <div class="text-xs text-slate-500 font-medium mt-1 flex items-center gap-2 flex-wrap">
            <span class="font-bold text-slate-700">${d.cantidadPartidos || 1} PARTIDOS</span>
            <span class="text-slate-300">·</span>
            <span>${formatFecha(d.fechaYHora)}</span>
            ${isViaje ? `<span class="badge bg-purple-50 text-purple-700 border border-purple-200 text-[10px] py-0.5 font-bold">🚗 Viaje</span>` : ""}
          </div>
          <div class="text-xs text-slate-600 mt-2 flex flex-col gap-0.5">
            <div>
              <span class="font-semibold text-slate-500">Etapa:</span>
              <span class="font-bold text-slate-700 uppercase">${d.etapa || "FECHA_NORMAL"}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="font-semibold text-slate-500">${isFinalizada ? "Liquidación Total:" : "Arancel:"}</span>
              <button type="button" class="btn-action-fees text-xs text-slate-700 hover:text-emerald-700 font-semibold flex items-center gap-1 cursor-pointer bg-transparent border-0 p-0" title="Configurar o liquidar aranceles">
                <span class="italic font-bold text-emerald-700 ${isFinalizada ? "bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200" : ""}">${arancelText}</span>
                <i class="ti ti-edit text-xs text-slate-400"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-1.5 flex-shrink-0">
          <span class="badge ${statusBadgeClass} text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-2xs">
            ${statusBadgeIcon ? `<i class="${statusBadgeIcon}"></i>` : ""}
            <span>${statusBadgeText}</span>
          </span>
        </div>
      </div>

      <!-- Collapsible button for referees -->
      <div class="my-3">
        <button type="button" class="btn-toggle-referees w-full bg-slate-50/80 hover:bg-slate-100/90 border border-slate-200/80 text-slate-600 font-bold text-xs py-1.5 px-4 rounded-full transition flex items-center justify-center gap-1.5 cursor-pointer select-none">
          <i class="btn-toggle-icon ti ti-eye-off text-slate-500 text-sm"></i>
          <span class="btn-toggle-label">Ocultar árbitros asignados</span>
        </button>
      </div>

      <!-- Referees section -->
      <div class="referees-container flex flex-col gap-1 transition-all">
        <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
          <i class="ti ti-users text-slate-400"></i>
          <span>Árbitros Asignados:</span>
        </div>
        ${refereesListHTML}
      </div>
    </div>

    <!-- Action buttons container -->
    ${actionButtonsHTML}
  `;

  // Attach Toggle Referees Listener
  const btnToggle = card.querySelector(".btn-toggle-referees");
  const refereesContainer = card.querySelector(".referees-container");
  const toggleIcon = card.querySelector(".btn-toggle-icon");
  const toggleLabel = card.querySelector(".btn-toggle-label");

  if (btnToggle && refereesContainer) {
    let isVisible = true;
    btnToggle.addEventListener("click", () => {
      isVisible = !isVisible;
      refereesContainer.classList.toggle("hidden", !isVisible);
      if (isVisible) {
        toggleIcon.className = "btn-toggle-icon ti ti-eye-off text-slate-500 text-sm";
        toggleLabel.textContent = "Ocultar árbitros asignados";
      } else {
        toggleIcon.className = "btn-toggle-icon ti ti-eye text-slate-500 text-sm";
        toggleLabel.textContent = "Mostrar árbitros asignados";
      }
    });
  }

  // Attach Action Listeners
  const btnAutoAssign = card.querySelector(".btn-action-auto-assign");
  if (btnAutoAssign && handlers.onAutoAssign) {
    btnAutoAssign.addEventListener("click", () => handlers.onAutoAssign(d.idDesignacion));
  }

  const btnManage = card.querySelector(".btn-action-manage");
  if (btnManage && handlers.onManage) {
    btnManage.addEventListener("click", () => handlers.onManage(d.idDesignacion));
  }

  const btnSyncFee = card.querySelector(".btn-action-sync-fee");
  if (btnSyncFee && handlers.onSyncFees) {
    btnSyncFee.addEventListener("click", () => handlers.onSyncFees(d.idDesignacion));
  }

  const btnFeesList = card.querySelectorAll(".btn-action-fees");
  btnFeesList.forEach((btn) => {
    if (handlers.onFees) {
      btn.addEventListener("click", () => handlers.onFees(d.idDesignacion));
    }
  });

  const btnEdit = card.querySelector(".btn-action-edit");
  if (btnEdit && handlers.onEdit) {
    btnEdit.addEventListener("click", () => handlers.onEdit(d.idDesignacion));
  }

  const btnFinalize = card.querySelector(".btn-action-finalize");
  if (btnFinalize && handlers.onStatusChange) {
    btnFinalize.addEventListener("click", () => handlers.onStatusChange(d.idDesignacion, "FINALIZADA"));
  }

  const btnSuspend = card.querySelector(".btn-action-suspend");
  if (btnSuspend && handlers.onStatusChange) {
    btnSuspend.addEventListener("click", () => handlers.onStatusChange(d.idDesignacion, "SUSPENDIDA"));
  }

  const btnCancel = card.querySelector(".btn-action-cancel");
  if (btnCancel && handlers.onCancel) {
    btnCancel.addEventListener("click", () => handlers.onCancel(d.idDesignacion));
  }

  const btnShare = card.querySelector(".btn-action-share");
  if (btnShare && handlers.onShare) {
    btnShare.addEventListener("click", () => handlers.onShare(d));
  }

  const btnDetail = card.querySelector(".btn-action-detail");
  if (btnDetail && handlers.onDetail) {
    btnDetail.addEventListener("click", () => handlers.onDetail(d.idDesignacion));
  }

  const btnDelete = card.querySelector(".btn-action-delete");
  if (btnDelete && handlers.onDelete) {
    btnDelete.addEventListener("click", () => handlers.onDelete(d.idDesignacion));
  }

  return card;
}
