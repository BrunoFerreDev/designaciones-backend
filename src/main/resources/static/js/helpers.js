import { state, updateState } from "./store.js";

export const getCancha = (id) => state.canchas.find((c) => c.id === id);

export const getArbitro = (id) =>
  state.arbitros.find((a) => a.idArbitro === id) ||
  (state.arbitrosNoDisponibles || []).find((a) => a.idArbitro === id);

export const getDisponiblesCount = () =>
  state.arbitros.filter(
    (a) => (a.disponibleSabado || a.disponibleDomingo) && a.estadoSistema !== false
  ).length;

export const getNoDisponiblesCount = () =>
  (state.arbitrosNoDisponibles || []).filter((a) => a.estadoSistema !== false).length;

export const getDisponiblesSabadoCount = () =>
  state.arbitros.filter((a) => a.disponibleSabado && a.estadoSistema !== false).length;

export const getDisponiblesDomingoCount = () =>
  state.arbitros.filter((a) => a.disponibleDomingo && a.estadoSistema !== false).length;

export const calcStatus = (partidos) => {
  if (partidos >= 7) return { label: "Alta carga", cls: "badge-red" };
  if (partidos >= 5) return { label: "Media-alta", cls: "badge-amber" };
  if (partidos >= 3) return { label: "Normal", cls: "badge-green" };
  return { label: "Baja", cls: "badge-gray" };
};

export const minArbitros = (partidos) => (partidos >= 5 ? 4 : 3);

export const formatFecha = (fechaStr) => {
  if (!fechaStr) return "";
  try {
    const diasSemana = [
      "domingo",
      "lunes",
      "martes",
      "miércoles",
      "jueves",
      "viernes",
      "sábado",
    ];

    const meses = [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre",
    ];

    if (fechaStr.includes("T")) {
      const [datePart, timePart] = fechaStr.split("T");
      const [yyyy, mm, dd] = datePart.split("-").map(Number);
      const [hh, min] = timePart.split(":").map(Number);

      const dateObj = new Date(yyyy, mm - 1, dd);
      const nombreDia = diasSemana[dateObj.getDay()];

      const hhStr = String(hh).padStart(2, "0");
      const minStr = String(min).padStart(2, "0");

      if (hh === 0 && min === 0) {
        return `${nombreDia} ${dd} de ${meses[mm - 1]} (Horario a confirmar)`;
      }

      const timePartFormatted =
        min === 0 ? `${hhStr}hs` : `${hhStr}:${minStr}hs`;
      return `${nombreDia} ${dd} de ${meses[mm - 1]} a las ${timePartFormatted}`;
    } else {
      const parts = fechaStr.split("-").map(Number);
      if (parts.length === 3) {
        const [yyyy, mm, dd] = parts;
        const dateObj = new Date(yyyy, mm - 1, dd);
        const nombreDia = diasSemana[dateObj.getDay()];
        return `${nombreDia} ${dd} de ${meses[mm - 1]}`;
      }
    }
  } catch (e) {
    console.warn("Error formatting date", e);
  }
  return fechaStr;
};

export const sortDesignaciones = (list) => {
  if (!Array.isArray(list)) return [];
  return list.slice().sort((a, b) => {
    const timeA = a.fecha ? new Date(a.fecha).getTime() : 0;
    const timeB = b.fecha ? new Date(b.fecha).getTime() : 0;
    if (timeA !== timeB) {
      return timeB - timeA; // Most recent to oldest
    }
    const nameA = a.cancha?.nombreCancha || "";
    const nameB = b.cancha?.nombreCancha || "";
    return nameA.localeCompare(nameB);
  });
};

export const getLocalDateString = (fechaStr) => {
  if (!fechaStr) return "";
  if (fechaStr instanceof Date) {
    const yyyy = fechaStr.getFullYear();
    const mm = String(fechaStr.getMonth() + 1).padStart(2, "0");
    const dd = String(fechaStr.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }
  const str = String(fechaStr);
  if (!str.includes("T") && !str.includes(" ")) {
    const datePart = str;
    const separator = datePart.includes("-")
      ? "-"
      : datePart.includes("/")
        ? "/"
        : "";
    if (separator) {
      const parts = datePart.split(separator).map(Number);
      if (parts.length === 3) {
        let yyyy, mm, dd;
        if (parts[0] > 1000) {
          [yyyy, mm, dd] = parts;
        } else {
          [dd, mm, yyyy] = parts;
        }
        return `${yyyy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
      }
    }
    return str;
  }
  const hasTimezone =
    str.includes("Z") ||
    str.includes("+") ||
    (str.split("T")[1] && str.split("T")[1].includes("-"));
  if (hasTimezone) {
    const date = new Date(str);
    if (!isNaN(date.getTime())) {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    }
  }
  return str.split(/[T ]/)[0];
};

export const getDayOfWeekLocal = (fechaStr) => {
  if (!fechaStr) return -1;
  try {
    if (fechaStr instanceof Date) {
      return fechaStr.getDay();
    }
    const localDateStr = getLocalDateString(fechaStr);
    const parts = localDateStr.split("-").map(Number);
    if (parts.length === 3) {
      const [yyyy, mm, dd] = parts;
      const dateObj = new Date(yyyy, mm - 1, dd);
      return dateObj.getDay(); // 0 = Sunday, 6 = Saturday
    }
  } catch (e) {
    console.warn("Error parsing date in getDayOfWeekLocal", e);
  }
  return -1;
};

export const getDayOfWeekName = (fechaStr) => {
  const dayIndex = getDayOfWeekLocal(fechaStr);
  const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  return dayIndex >= 0 && dayIndex < dias.length ? dias[dayIndex] : "";
};

export const normalizeDesignacion = (d) => {
  if (!d) return d;
  const fechaVal = d.fecha || d.fechaYHora || "";
  const etapaVal = d.etapaCampeonato || d.etapa || "FECHA_NORMAL";
  const detalleVal = d.detalleDesignacion !== undefined ? d.detalleDesignacion : (d.detalle || "");
  const cantPartidos = d.cantidadPartidos !== undefined ? d.cantidadPartidos : 1;

  let estadoNum = 0;
  let estadoStr = "INCOMPLETA";

  if (d.estadoDesignacion !== undefined && d.estadoDesignacion !== null) {
    estadoNum = Number(d.estadoDesignacion);
  } else if (typeof d.estado === "number") {
    estadoNum = d.estado;
  } else if (typeof d.estado === "string") {
    if (d.estado === "FINALIZADA") estadoNum = 2;
    else if (d.estado === "CANCELADA" || d.estado === "SUSPENDIDA") estadoNum = 3;
    else if (d.estado === "COMPLETA" || d.estado === "COMPLETADA" || d.estado === "CONFIRMADA" || d.estado === "A_CONFIRMAR") estadoNum = 1;
    else estadoNum = 0;
  }

  if (estadoNum === 2) estadoStr = "FINALIZADA";
  else if (estadoNum === 3) estadoStr = "CANCELADA";
  else if (estadoNum === 1) estadoStr = "COMPLETA";
  else estadoStr = "INCOMPLETA";

  const canchaObj = d.cancha ? {
    id: d.cancha.id || d.cancha.idCancha,
    idCancha: d.cancha.idCancha || d.cancha.id,
    nombre: d.cancha.nombreCancha || d.cancha.nombre || "Cancha",
    nombreCancha: d.cancha.nombreCancha || d.cancha.nombre || "Cancha",
    ciudad: d.cancha.ciudad || "",
    categoria: d.cancha.categoria || "FUTBOL_11",
    fueraDeJuego: !!d.cancha.fueraDeJuego,
    necesitaViaje: !!d.cancha.necesitaViaje,
    estado: d.cancha.estado !== false,
  } : null;

  return {
    ...d,
    idDesignacion: d.idDesignacion || d.id,
    fecha: fechaVal,
    fechaYHora: fechaVal,
    etapa: etapaVal,
    etapaCampeonato: etapaVal,
    detalle: detalleVal,
    detalleDesignacion: detalleVal,
    cantidadPartidos: cantPartidos,
    estadoDesignacion: estadoNum,
    estado: estadoStr,
    cancha: canchaObj,
    designados: Array.isArray(d.designados) ? d.designados.map(normalizeDesignado) : [],
  };
};

export const normalizeDesignado = (item) => {
  if (!item) return item;
  const montoVal = item.monto !== undefined ? item.monto : (item.montoPercibido !== undefined ? item.montoPercibido : 0);
  const idVal = item.idDesignado || item.idDesignados || item.id;
  const partidosVal = item.cantidadPartidos !== undefined ? item.cantidadPartidos : (item.partidosDirigidos !== undefined ? item.partidosDirigidos : 1);

  return {
    ...item,
    idDesignado: idVal,
    idDesignados: idVal,
    monto: Number(montoVal) || 0,
    montoPercibido: Number(montoVal) || 0,
    cantidadPartidos: partidosVal,
    partidosDirigidos: partidosVal,
    arbitro: item.arbitro || {},
  };
};

export const isRefereeAssignedToDifferentCourtOnSameDay = (
  idArbitro,
  targetDes,
) => {
  const targetDateStr = targetDes.fecha ? targetDes.fecha.split("T")[0] : "";
  const targetCanchaId =
    targetDes.idCancha ||
    targetDes.canchaId ||
    targetDes.cancha?.idCancha ||
    targetDes.cancha?.id;

  if (!targetDateStr) return false;

  const allLists = [
    ...state.designacionesIncompletas,
    ...state.designaciones,
    ...state.designacionesFinalizadas,
    ...state.designacionesAConfirmar,
    ...(state.designacionesCanceladas || []),
  ];

  for (const otherD of allLists) {
    const otherId = otherD.idDesignacion || otherD.id;
    const targetId = targetDes.idDesignacion || targetDes.id;
    if (otherId !== targetId) {
      const otherDateStr = otherD.fecha ? otherD.fecha.split("T")[0] : "";
      if (otherDateStr && otherDateStr === targetDateStr) {
        const assigned = state.arbitrosDesignadosMap[otherId] || [];
        const isAssigned = assigned.some(
          (asg) => (asg.arbitro?.idArbitro || asg.idArbitro) === idArbitro,
        );
        if (isAssigned) {
          const otherCanchaId =
              otherD.idCancha ||
              otherD.canchaId ||
              otherD.cancha?.idCancha ||
              otherD.cancha?.id;
          if (String(otherCanchaId) !== String(targetCanchaId)) {
            return true;
          }
        }
      }
    }
  }
  return false;
};

export const addToast = (message, type = "success") => {
  const id = Date.now() + Math.random();
  const toasts = [...(state.toasts || [])];
  toasts.push({ id, message, type });
  updateState("toasts", toasts);
  
  // Dispatch dynamic event so UI can display toasts
  document.dispatchEvent(new CustomEvent("toast-message", { detail: { id, message, type } }));

  setTimeout(() => {
    removeToast(id);
  }, 4000);
};

export const removeToast = (id) => {
  if (!state.toasts) return;
  const toasts = state.toasts.filter((t) => t.id !== id);
  updateState("toasts", toasts);
  document.dispatchEvent(new CustomEvent("toast-removed", { detail: { id } }));
};

export const formatMonto = (monto) => {
  const num = Number(monto) || 0;
  return `$${num.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};
