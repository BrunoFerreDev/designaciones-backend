// Estado global de la aplicación
window.state = Vue.reactive({
  canchas: [],
  arbitros: [],
  arbitrosNoDisponibles: [],
  designaciones: [], // Completas
  designacionesIncompletas: [],
  designacionesFinalizadas: [],
  designacionesAConfirmar: [],
  designacionesAceptadas: [],
  designacionesArbitros: [],
  modal: null, // { type, id, data }
  nextCanchaId: 4,
  nextArbId: 9,
  nextDesId: 3,
  nextSuspId: 1,
  form: {}, // Objeto de formulario activo
  selectedArbitros: [],
  suspensiones: [],
  arbitrosDesignadosMap: {}, // idDesignacion -> list of arbitro objects
  
  // Filtros de búsqueda (Buscador general)
  searchMode: 'single', // single, range, monthly, referee, court, status
  fechaSingle: '',
  fechaInicio: '',
  fechaFin: '',
  selectedMonth: new Date().getMonth() + 1,
  selectedYear: new Date().getFullYear(),
  selectedArbitroId: '',
  selectedCanchaId: '',
  selectedStatus: '',
  
  // Filtros locales para árbitros y suspensiones
  searchQueryRef: '',
  filterCategoryRef: '',
  searchQuerySusp: '',
  filterTypeSusp: '',
  
  // Buscador de árbitros en tiempo real en Designaciones
  searchRefereeQuery: '',

  // Estado del Historial
  fechaHistorico: '',
  selectedCanchasHistorico: {}, // idCancha -> boolean
  canchaConfigsHistorico: {}, // idCancha -> { hora, cantidadPartidos, etapaCampeonato }
  designacionesExistentesHistorico: [],
  loadingListHistorico: false,
  registeringHistorico: false
});

// Roles de árbitros y colores
window.ROLES_ARB = [
  "Árbitro Principal",
  "Árbitro Asistente 1",
  "Árbitro Asistente 2",
  "Cuarto Árbitro",
  "VAR",
  "Asistente VAR",
];

window.ROLE_COLORS = [
  "#1D9E75",
  "#185FA5",
  "#BA7517",
  "#993C1D",
  "#534AB7",
  "#3B6D11",
];


// ================= HELPERS =================

window.getCancha = (id) => window.state.canchas.find((c) => c.id === id);

window.getArbitro = (id) =>
  window.state.arbitros.find((a) => a.idArbitro === id) ||
  (window.state.arbitrosNoDisponibles || []).find((a) => a.idArbitro === id);

window.calcStatus = (partidos) => {
  if (partidos >= 7) return { label: "Alta carga", cls: "badge-red" };
  if (partidos >= 5) return { label: "Media-alta", cls: "badge-amber" };
  if (partidos >= 3) return { label: "Normal", cls: "badge-green" };
  return { label: "Baja", cls: "badge-gray" };
};

window.minArbitros = (partidos) => (partidos >= 5 ? 4 : 3);

window.formatFecha = (fechaStr) => {
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

window.sortDesignaciones = (list) => {
  if (!Array.isArray(list)) return [];
  return list.slice().sort((a, b) => {
    const timeA = a.fecha ? new Date(a.fecha).getTime() : 0;
    const timeB = b.fecha ? new Date(b.fecha).getTime() : 0;
    if (timeA !== timeB) return timeB - timeA;
    const nameA = a.cancha?.nombreCancha || "";
    const nameB = b.cancha?.nombreCancha || "";
    return nameA.localeCompare(nameB);
  });
};

window.getLocalDateString = (fechaStr) => {
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
    const separator = datePart.includes("-") ? "-" : datePart.includes("/") ? "/" : "";
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
  const hasTimezone = str.includes("Z") || str.includes("+") || (str.split("T")[1] && str.split("T")[1].includes("-"));
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

window.getDayOfWeekLocal = (fechaStr) => {
  if (!fechaStr) return -1;
  try {
    if (fechaStr instanceof Date) {
      return fechaStr.getDay();
    }
    const localDateStr = window.getLocalDateString(fechaStr);
    const parts = localDateStr.split("-").map(Number);
    if (parts.length === 3) {
      const [yyyy, mm, dd] = parts;
      const dateObj = new Date(yyyy, mm - 1, dd);
      return dateObj.getDay();
    }
  } catch (e) {
    console.warn("Error parsing date in getDayOfWeekLocal", e);
  }
  return -1;
};

window.getMostRecentSaturday = () => {
  const referenceDate = new Date();
  const day = referenceDate.getDay();
  const daysToSaturday = day + 1;
  const satDate = new Date(referenceDate);
  satDate.setDate(referenceDate.getDate() - daysToSaturday);

  const yyyy = satDate.getFullYear();
  const mm = String(satDate.getMonth() + 1).padStart(2, "0");
  const dd = String(satDate.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

window.isRefereeAssignedToDifferentCourtOnSameDay = (idArbitro, targetDes) => {
  const targetDateStr = targetDes.fecha ? targetDes.fecha.split("T")[0] : "";
  const targetCanchaId = targetDes.idCancha || targetDes.canchaId || targetDes.cancha?.idCancha || targetDes.cancha?.id;

  if (!targetDateStr) return false;

  const allLists = [
    ...window.state.designacionesIncompletas,
    ...window.state.designaciones,
    ...window.state.designacionesFinalizadas,
    ...window.state.designacionesAConfirmar,
    ...(window.state.designacionesAceptadas || []),
  ];

  for (const otherD of allLists) {
    const otherId = otherD.idDesignacion || otherD.id;
    const targetId = targetDes.idDesignacion || targetDes.id;
    if (otherId !== targetId) {
      const otherDateStr = otherD.fecha ? otherD.fecha.split("T")[0] : "";
      if (otherDateStr && otherDateStr === targetDateStr) {
        const assigned = window.state.arbitrosDesignadosMap[otherId] || [];
        const isAssigned = assigned.some(
          (asg) => (asg.arbitro?.idArbitro || asg.idArbitro) === idArbitro,
        );
        if (isAssigned) {
          const otherCanchaId = otherD.idCancha || otherD.canchaId || otherD.cancha?.idCancha || otherD.cancha?.id;
          if (String(otherCanchaId) !== String(targetCanchaId)) {
            return true;
          }
        }
      }
    }
  }
  return false;
};

// ================= ACTIONS =================

window.loadCanchas = async () => {
  try {
    const res = await window.canchaService.getAll();
    let canchas = Array.isArray(res) ? res : res.content || res || [];
    window.state.canchas = canchas.map((c) => ({
      id: c.idCancha || c.id,
      nombre: c.nombreCancha || c.nombre,
      ciudad: c.ciudad || "",
      partidos: c.partidos || 0,
      capacidad: c.capacidad || 0,
      categoria: c.categoria || "",
      fueraDeJuego: c.fueraDeJuego || false,
      estado: c.estado !== undefined ? c.estado : true,
      ...c,
    }));
  } catch (e) {
    console.warn("Failed to load canchas, using local storage fallback", e);
  }
};

window.loadArbitros = async () => {
  try {
    const res = await window.arbitroService.getAll();
    window.state.arbitros = Array.isArray(res) ? res : res.content || res || [];
  } catch (e) {
    console.warn("Failed to load arbitros", e);
  }
};

window.loadArbitrosNoDisponibles = async () => {
  try {
    const res = await window.arbitroService.getNoDisponibles();
    window.state.arbitrosNoDisponibles = Array.isArray(res) ? res : res.content || res || [];
  } catch (e) {
    console.warn("Failed to load arbitros no disponibles", e);
  }
};

window.loadSuspensiones = async () => {
  try {
    const res = await window.suspencionService.getAll();
    window.state.suspensiones = Array.isArray(res) ? res : res.content || res || [];
  } catch (e) {
    console.warn("Failed to load suspensiones", e);
  }
};

window.loadArbitrosDesignados = async (idDesignacion) => {
  if (window.state.arbitrosDesignadosMap[idDesignacion]) {
    return window.state.arbitrosDesignadosMap[idDesignacion];
  }
  try {
    const res = await window.designacionService.getDesignados(idDesignacion);
    const data = Array.isArray(res) ? res : res.data || res || [];
    window.state.arbitrosDesignadosMap[idDesignacion] = data;
    return data;
  } catch (e) {
    console.warn("Failed to load arbitros designados", e);
    return [];
  }
};

window.loadDesignacionesIncompletas = async () => {
  try {
    const res0 = await window.designacionService.getByEstado(0);
    let list = Array.isArray(res0) ? res0 : res0.content || res0 || [];
    const limitDate = window.getMostRecentSaturday();
    list = list.filter((d) => d.fecha && d.fecha.split("T")[0] >= limitDate);
    window.state.designacionesIncompletas = window.sortDesignaciones(list);

    list.forEach(async (d) => {
      const id = d.idDesignacion || d.id;
      if (d.arbitrosDesignados && d.arbitrosDesignados.length > 0) {
        window.state.arbitrosDesignadosMap[id] = d.arbitrosDesignados;
      } else {
        const refs = await window.loadArbitrosDesignados(id);
        window.state.arbitrosDesignadosMap[id] = refs;
      }
    });
  } catch (e) {
    console.warn("Failed to load designaciones incompletas", e);
  }
};

window.loadDesignacionesAceptadas = async () => {
  try {
    const res = await window.designacionService.getByEstado(3);
    let list = Array.isArray(res) ? res : res.content || res || [];
    const limitDate = window.getMostRecentSaturday();
    list = list.filter((d) => d.fecha && d.fecha.split("T")[0] >= limitDate);
    window.state.designacionesAceptadas = window.sortDesignaciones(list);

    list.forEach(async (d) => {
      const id = d.idDesignacion || d.id;
      if (d.arbitrosDesignados && d.arbitrosDesignados.length > 0) {
        window.state.arbitrosDesignadosMap[id] = d.arbitrosDesignados;
      } else {
        const refs = await window.loadArbitrosDesignados(id);
        window.state.arbitrosDesignadosMap[id] = refs;
      }
    });
  } catch (e) {
    console.warn("Failed to load designaciones aceptadas", e);
  }
};

window.loadDesignacionesCompletas = async () => {
  try {
    const res = await window.designacionService.getByEstado(1);
    let list = Array.isArray(res) ? res : res.content || res || [];
    const limitDate = window.getMostRecentSaturday();
    list = list.filter((d) => d.fecha && d.fecha.split("T")[0] >= limitDate);
    window.state.designaciones = window.sortDesignaciones(list);

    list.forEach(async (d) => {
      const id = d.idDesignacion || d.id;
      if (d.arbitrosDesignados && d.arbitrosDesignados.length > 0) {
        window.state.arbitrosDesignadosMap[id] = d.arbitrosDesignados;
      } else {
        const refs = await window.loadArbitrosDesignados(id);
        window.state.arbitrosDesignadosMap[id] = refs;
      }
    });
  } catch (e) {
    console.warn("Failed to load designaciones completas", e);
  }
};

window.loadDesignacionesFinalizadas = async () => {
  try {
    const res = await window.designacionService.getByEstado(2);
    let list = Array.isArray(res) ? res : res.content || res || [];
    const limitDate = window.getMostRecentSaturday();
    list = list.filter((d) => d.fecha && d.fecha.split("T")[0] >= limitDate);
    window.state.designacionesFinalizadas = window.sortDesignaciones(list);

    list.forEach(async (d) => {
      const id = d.idDesignacion || d.id;
      if (d.arbitrosDesignados && d.arbitrosDesignados.length > 0) {
        window.state.arbitrosDesignadosMap[id] = d.arbitrosDesignados;
      } else {
        const refs = await window.loadArbitrosDesignados(id);
        window.state.arbitrosDesignadosMap[id] = refs;
      }
    });
  } catch (e) {
    console.warn("Failed to load designaciones finalizadas", e);
  }
};

window.reloadAllDesignaciones = async () => {
  await Promise.all([
    window.loadDesignacionesIncompletas(),
    window.loadDesignacionesCompletas(),
    window.loadDesignacionesAceptadas(),
    window.loadDesignacionesFinalizadas(),
  ]);
};

window.updateDesignacionStateLocal = function(idDesignacion) {
  let des = null;
  let fromList = null;
  let idx = -1;

  idx = window.state.designacionesIncompletas.findIndex((d) => (d.idDesignacion || d.id) === idDesignacion);
  if (idx !== -1) {
    des = window.state.designacionesIncompletas[idx];
    fromList = "incompleta";
  } else {
    idx = window.state.designaciones.findIndex((d) => (d.idDesignacion || d.id) === idDesignacion);
    if (idx !== -1) {
      des = window.state.designaciones[idx];
      fromList = "completa";
    } else {
      idx = window.state.designacionesAConfirmar.findIndex((d) => (d.idDesignacion || d.id) === idDesignacion);
      if (idx !== -1) {
        des = window.state.designacionesAConfirmar[idx];
        fromList = "confirmar";
      }
    }
  }

  if (!des) return;

  const req = window.minArbitros(des.cantidadPartidos);
  const assigned = window.state.arbitrosDesignadosMap[idDesignacion] || [];
  const count = assigned.length;

  if (count >= req) {
    des.estadoDesignacion = 1; // Cambia a completa
    if (fromList === "incompleta") {
      window.state.designacionesIncompletas.splice(idx, 1);
      window.state.designaciones.push(des);
    }
  } else {
    des.estadoDesignacion = 0; // Cambia a incompleta
    if (fromList === "completa") {
      window.state.designaciones.splice(idx, 1);
      window.state.designacionesIncompletas.push(des);
    } else if (fromList === "confirmar") {
      window.state.designacionesAConfirmar.splice(idx, 1);
      window.state.designacionesIncompletas.push(des);
    }
  }

  window.state.designacionesIncompletas = window.sortDesignaciones(window.state.designacionesIncompletas);
  window.state.designaciones = window.sortDesignaciones(window.state.designaciones);
  window.state.designacionesAConfirmar = window.sortDesignaciones(window.state.designacionesAConfirmar);
};

window.deleteCancha = function(id) {
  if (!confirm("¿Eliminar esta cancha?")) return;
  window.state.canchas = window.state.canchas.filter((c) => c.id !== id);
  window.state.designaciones = window.state.designaciones.filter((d) => d.canchaId !== id);
  if (window.renderView) window.renderView();
};

window.deleteArbitro = function(id) {
  if (!confirm("¿Eliminar este árbitro?")) return;
  window.arbitroService.deleteArbitro(id)
    .then(() => {
      window.state.arbitros = window.state.arbitros.filter((a) => a.idArbitro !== id);
      window.state.arbitrosNoDisponibles = (window.state.arbitrosNoDisponibles || []).filter((a) => a.idArbitro !== id);
      if (window.renderView) window.renderView();
    })
    .catch((err) => {
      console.error("deleteArbitro failed", err);
      alert("No se pudo eliminar el árbitro: " + err.message);
    });
};

window.deleteDesignacion = function(id) {
  if (!confirm("¿Eliminar esta designación?")) return;
  window.designacionService.deleteDesignacion(id)
    .then(() => {
      window.reloadAllDesignaciones().then(() => {
        if (window.renderView) window.renderView();
      });
    })
    .catch((err) => {
      console.error("deleteDesignacion failed", err);
      alert("No se pudo eliminar la designación: " + err.message);
    });
};

window.finalizarJornada = function(id) {
  if (!confirm("¿Seguro que desea finalizar esta jornada/designación?")) return;
  window.designacionService.finalizarDesignacion(id)
    .then(() => {
      window.reloadAllDesignaciones().then(() => {
        if (window.renderView) window.renderView();
      });
    })
    .catch((err) => {
      console.error("finalizarJornada failed", err);
      alert("No se pudo finalizar la designación: " + err.message);
    });
};

window.cancelarJornada = function(id) {
  if (!confirm("¿Seguro que desea cancelar esta jornada/designación?")) return;
  window.designacionService.cancelarDesignacion(id)
    .then(() => {
      window.reloadAllDesignaciones().then(() => {
        if (window.renderView) window.renderView();
      });
    })
    .catch((err) => {
      console.error("cancelarJornada failed", err);
      alert("No se pudo cancelar la designación: " + err.message);
    });
};

window.reprogramarJornada = function(id) {
  if (!confirm("¿Seguro que desea reprogramar esta jornada/designación?")) return;
  window.designacionService.reprogramarDesignacion(id)
    .then(() => {
      window.reloadAllDesignaciones().then(() => {
        if (window.renderView) window.renderView();
      });
    })
    .catch((err) => {
      console.error("reprogramarJornada failed", err);
      alert("No se pudo reprogramar la designación: " + err.message);
    });
};

const buildRefereeStats = (listLast, listThis) => {
  const refereeStats = {};
  
  const processList = (list, isThisWeekend) => {
    for (const d of list) {
      const dId = d.idDesignacion || d.id;
      const day = window.getDayOfWeekLocal(d.fecha);
      const canchaObj = d.cancha || window.getCancha(d.idCancha || d.canchaId);
      const cancha = canchaObj?.nombreCancha || canchaObj?.nombre || "—";
      const parts = d.fecha?.split("T")[1]?.split(":");
      const hora = parts ? `${parts[0]}:${parts[1]}hs` : "A confirmar";
      
      const refs = window.state.arbitrosDesignadosMap[dId] || d.arbitrosDesignados || d.arbitros || [];
      for (const r of refs) {
        const arb = r.arbitro || window.getArbitro(r.idArbitro);
        if (!arb) continue;
        const id = Number(arb.idArbitro);
        if (!refereeStats[id]) {
          refereeStats[id] = {
            idArbitro: id,
            nombre: arb.nombre,
            apellido: arb.apellido,
            rol: arb.rol || "Árbitro",
            categoria: arb.categoria || "INICIAL",
            lastSaturday: [],
            lastSunday: [],
            thisSaturday: [],
            thisSunday: [],
            last: [],
            this: [],
            lastWeekendCount: 0,
            thisWeekendCount: 0
          };
        }
        
        const stats = refereeStats[id];
        if (isThisWeekend) {
          if (day === 6) {
            stats.thisSaturday.push({ cancha, hora });
            stats.this.push({ dia: "Sábado", cancha, hora });
          } else if (day === 0) {
            stats.thisSunday.push({ cancha, hora });
            stats.this.push({ dia: "Domingo", cancha, hora });
          }
        } else {
          if (day === 6) {
            stats.lastSaturday.push({ cancha, hora });
            stats.last.push({ dia: "Sábado", cancha, hora });
          } else if (day === 0) {
            stats.lastSunday.push({ cancha, hora });
            stats.last.push({ dia: "Domingo", cancha, hora });
          }
        }
      }
    }
  };

  processList(listLast, false);
  processList(listThis, true);

  const allStats = Object.values(refereeStats);
  for (const stats of allStats) {
    stats.lastWeekendCount = stats.lastSaturday.length + stats.lastSunday.length;
    stats.thisWeekendCount = stats.thisSaturday.length + stats.thisSunday.length;
  }
  
  return allStats;
};

window.getRepitenAmbosSabDom = function (listLast, listThis) {
  const stats = buildRefereeStats(listLast, listThis);
  return stats.filter(s => s.thisSaturday.length > 0 && s.thisSunday.length > 0);
};

window.getRepitenSabado = function (listLast, listThis) {
  const stats = buildRefereeStats(listLast, listThis);
  return stats.filter(s => s.lastSaturday.length > 0 && s.thisSaturday.length > 0);
};

window.getRepitenDomingo = function (listLast, listThis) {
  const stats = buildRefereeStats(listLast, listThis);
  return stats.filter(s => s.lastSunday.length > 0 && s.thisSunday.length > 0);
};

window.getSoloFindePasado = function (listLast, listThis) {
  const stats = buildRefereeStats(listLast, listThis);
  return stats.filter(s => s.lastWeekendCount > 0 && s.thisWeekendCount === 0);
};

window.getSoloEsteFinde = function (listLast, listThis) {
  const stats = buildRefereeStats(listLast, listThis);
  return stats.filter(s => s.thisWeekendCount > 0 && s.lastWeekendCount === 0);
};

window.printComparativaReport = ({
  datesLast,
  datesThis,
  repitenAmbosSabDom,
  repitenSabado,
  repitenDomingo,
  soloFindePasado,
  soloEsteFinde,
}) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Por favor, permite las ventanas emergentes para poder imprimir el reporte.");
    return;
  }

  const formatDateStr = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) return `${parts[2]}/${parts[1]}`;
    return dateStr;
  };

  const rangeLastStr = `${formatDateStr(datesLast.saturday)} al ${formatDateStr(datesLast.sunday)}`;
  const rangeThisStr = `${formatDateStr(datesThis.saturday)} al ${formatDateStr(datesThis.sunday)}`;

  const renderArbRows = (list) => {
    if (list.length === 0)
      return '<tr><td colspan="5" style="text-align: center; color: #666; font-style: italic; padding: 10px;">No hay árbitros en esta categoría.</td></tr>';

    return list
      .map((arb) => {
        const renderMatches = (matches) => {
          if (matches.length === 0) return "Sin partidos";
          return matches.map((m) => `• ${m.cancha} (${m.hora})`).join("<br>");
        };

        const lastSaturdayStr = renderMatches(arb.lastSaturday);
        const lastSundayStr = renderMatches(arb.lastSunday);
        const thisSaturdayStr = renderMatches(arb.thisSaturday);
        const thisSundayStr = renderMatches(arb.thisSunday);

        let lastFindeCell = "";
        if (arb.lastSaturday.length > 0)
          lastFindeCell += `<strong>Sáb:</strong><br>${lastSaturdayStr}<br>`;
        if (arb.lastSunday.length > 0)
          lastFindeCell += `<strong>Dom:</strong><br>${lastSundayStr}`;
        if (!lastFindeCell) lastFindeCell = "Sin partidos";

        let thisFindeCell = "";
        if (arb.thisSaturday.length > 0)
          thisFindeCell += `<strong>Sáb:</strong><br>${thisSaturdayStr}<br>`;
        if (arb.thisSunday.length > 0)
          thisFindeCell += `<strong>Dom:</strong><br>${thisSundayStr}`;
        if (!thisFindeCell) thisFindeCell = "Sin partidos";

        return `
        <tr>
          <td>
            <strong>${arb.nombre} ${arb.apellido}</strong>
            <div style="font-size: 10px; color: #666;">${arb.rol} · ${arb.categoria}</div>
          </td>
          <td style="text-align: center; font-weight: bold;">${arb.lastWeekendCount}</td>
          <td>${lastFindeCell}</td>
          <td style="text-align: center; font-weight: bold;">${arb.thisWeekendCount}</td>
          <td>${thisFindeCell}</td>
        </tr>
      `;
      })
      .join("");
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Reporte de Comparativa de Fines de Semana</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #333;
          margin: 30px;
          line-height: 1.4;
        }
        h1 {
          font-size: 20px;
          margin-bottom: 5px;
          color: #111;
        }
        .subtitle {
          font-size: 13px;
          color: #666;
          margin-bottom: 20px;
          border-bottom: 2px solid #333;
          padding-bottom: 8px;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 10px;
          margin-bottom: 30px;
        }
        .summary-card {
          border: 1px solid #ccc;
          border-radius: 6px;
          padding: 10px;
          background: #fafafa;
        }
        .summary-card.alert {
          border-left: 4px solid #ef4444;
          background: #fef2f2;
        }
        .summary-card.warn {
          border-left: 4px solid #f59e0b;
          background: #fffbeb;
        }
        .summary-card.info {
          border-left: 4px solid #3b82f6;
          background: #f0f7ff;
        }
        .summary-card.success {
          border-left: 4px solid #10b981;
          background: #ecfdf5;
        }
        .summary-title {
          font-size: 9px;
          text-transform: uppercase;
          font-weight: bold;
          color: #666;
        }
        .summary-value {
          font-size: 20px;
          font-weight: bold;
          margin-top: 5px;
        }
        h2 {
          font-size: 14px;
          border-bottom: 1px solid #eee;
          padding-bottom: 5px;
          margin-top: 25px;
          margin-bottom: 10px;
          color: #000;
          page-break-after: avoid;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          font-size: 11px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
          vertical-align: top;
        }
        th {
          background-color: #f5f5f5;
          font-weight: bold;
        }
        @media print {
          body {
            margin: 15px;
          }
          .summary-card {
            background: #fff !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
        }
      </style>
    </head>
    <body>
      <h1>Comparativa de Fines de Semana</h1>
      <div class="subtitle">
        Reporte de asignaciones: <strong>Fin de semana pasado (${rangeLastStr})</strong> vs <strong>Este fin de semana (${rangeThisStr})</strong>
      </div>

      <div class="summary-grid">
        <div class="summary-card alert">
          <div class="summary-title" style="color: #991b1b;">Repiten Ambos</div>
          <div class="summary-value" style="color: #991b1b;">${repitenAmbosSabDom.length}</div>
        </div>
        <div class="summary-card warn" style="border-left: 4px solid #0f6e56; background: #e6f9f4;">
          <div class="summary-title" style="color: #0f6e56;">Repiten Sábado</div>
          <div class="summary-value" style="color: #0f6e56;">${repitenSabado.length}</div>
        </div>
        <div class="summary-card warn" style="border-left: 4px solid #185fa5; background: #f0f7ff;">
          <div class="summary-title" style="color: #185fa5;">Repiten Domingo</div>
          <div class="summary-value" style="color: #185fa5;">${repitenDomingo.length}</div>
        </div>
        <div class="summary-card info">
          <div class="summary-title" style="color: #1e3a8a;">Sólo Pasado</div>
          <div class="summary-value" style="color: #1e3a8a;">${soloFindePasado.length}</div>
        </div>
        <div class="summary-card success">
          <div class="summary-title" style="color: #065f46;">Sólo Este</div>
          <div class="summary-value" style="color: #065f46;">${soloEsteFinde.length}</div>
        </div>
      </div>

      <h2>1. Repiten Ambos Sábado y Domingo (Alerta carga doble)</h2>
      <table>
        <thead>
          <tr>
            <th style="width: 25%;">Árbitro</th>
            <th style="width: 10%; text-align: center;">Partidos Pasado</th>
            <th style="width: 27%;">Detalle Pasado</th>
            <th style="width: 10%; text-align: center;">Partidos Este</th>
            <th style="width: 28%;">Detalle Este</th>
          </tr>
        </thead>
        <tbody>
          ${renderArbRows(repitenAmbosSabDom)}
        </tbody>
      </table>

      <h2>2. Repiten Sábado (Sábado pasado y este Sábado)</h2>
      <table>
        <thead>
          <tr>
            <th style="width: 25%;">Árbitro</th>
            <th style="width: 10%; text-align: center;">Partidos Pasado</th>
            <th style="width: 27%;">Detalle Pasado</th>
            <th style="width: 10%; text-align: center;">Partidos Este</th>
            <th style="width: 28%;">Detalle Este</th>
          </tr>
        </thead>
        <tbody>
          ${renderArbRows(repitenSabado)}
        </tbody>
      </table>

      <h2>3. Repiten Domingo (Domingo pasado y este Domingo)</h2>
      <table>
        <thead>
          <tr>
            <th style="width: 25%;">Árbitro</th>
            <th style="width: 10%; text-align: center;">Partidos Pasado</th>
            <th style="width: 27%;">Detalle Pasado</th>
            <th style="width: 10%; text-align: center;">Partidos Este</th>
            <th style="width: 28%;">Detalle Este</th>
          </tr>
        </thead>
        <tbody>
          ${renderArbRows(repitenDomingo)}
        </tbody>
      </table>

      <h2>4. Sólo Fin de Semana Pasado (No dirigen este fin de semana)</h2>
      <table>
        <thead>
          <tr>
            <th style="width: 25%;">Árbitro</th>
            <th style="width: 10%; text-align: center;">Partidos Pasado</th>
            <th style="width: 27%;">Detalle Pasado</th>
            <th style="width: 10%; text-align: center;">Partidos Este</th>
            <th style="width: 28%;">Detalle Este</th>
          </tr>
        </thead>
        <tbody>
          ${renderArbRows(soloFindePasado)}
        </tbody>
      </table>

      <h2>5. Sólo Este Fin de Semana (No dirigieron el fin de semana anterior)</h2>
      <table>
        <thead>
          <tr>
            <th style="width: 25%;">Árbitro</th>
            <th style="width: 10%; text-align: center;">Partidos Pasado</th>
            <th style="width: 27%;">Detalle Pasado</th>
            <th style="width: 10%; text-align: center;">Partidos Este</th>
            <th style="width: 28%;">Detalle Este</th>
          </tr>
        </thead>
        <tbody>
          ${renderArbRows(soloEsteFinde)}
        </tbody>
      </table>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
  }, 500);
};

// ================= MODAL ACTIONS =================

window.openModal = function (type, id = null, data = null) {
  window.state.modal = { type, id, data };
  window.state.selectedArbitros = [];
  
  if (type === "editCancha" && id) {
    const cancha = window.getCancha(id);
    window.state.form = {
      nombreCancha: cancha.nombreCancha || cancha.nombre || "",
      categoria: cancha.categoria || "FUTBOL_11",
      fueraDeJuego: cancha.fueraDeJuego || false,
      estado: cancha.estado !== undefined ? cancha.estado : true,
      ...cancha,
    };
  } else if (type === "addCancha") {
    window.state.form = {
      nombreCancha: "",
      categoria: "FUTBOL_11",
      fueraDeJuego: false,
      estado: true,
    };
  } else if (type === "editArbitro" && id) {
    window.state.form = { ...window.getArbitro(id) };
  } else if (type === "addArbitro") {
    window.state.form = {
      rol: window.ROLES_ARB[0],
      categoria: "INICIAL",
      talleCamiseta: "M",
      talleShort: "M",
      estado: true,
      disponibleSabado: true,
      disponibleDomingo: true,
      nombre: "",
      apellido: "",
      whatsapp: "",
    };
  } else if (type === "addDesignacion") {
    window.state.form = {
      canchaId: "",
      fecha: "",
      cantidadPartidos: 1,
      etapaCampeonato: "FECHA_NORMAL",
    };
  } else if ((type === "manageReferees" || type === "updateFees") && id) {
    window.state.form = { idDesignacion: id };
  } else if (type === "editDesignacion" && id) {
    const list = [
      ...window.state.designacionesIncompletas,
      ...window.state.designaciones,
      ...window.state.designacionesFinalizadas,
      ...window.state.designacionesAConfirmar,
    ];
    let des = list.find((d) => (d.idDesignacion || d.id) === id);
    if (!des && data) des = data;
    if (des) {
      const canchaId = des.idCancha || des.canchaId || (des.cancha ? des.cancha.idCancha || des.cancha.id : null);
      let formattedFecha = des.fecha || "";
      if (formattedFecha && formattedFecha.includes("T")) {
        const parts = formattedFecha.split(":");
        if (parts.length > 2) {
          formattedFecha = parts.slice(0, 2).join(":");
        }
      }
      window.state.form = {
        idDesignacion: id,
        canchaId: canchaId,
        fecha: formattedFecha,
        cantidadPartidos: des.cantidadPartidos || 1,
        etapaCampeonato: des.etapaCampeonato || des.etapaTorneo || "FECHA_NORMAL",
      };
    } else {
      window.state.form = {};
    }
  } else {
    window.state.form = {};
  }
};

window.closeModal = function () {
  window.state.modal = null;
  window.state.form = {};
};

window.saveSuspencion = async function (dto) {
  const res = await window.suspencionService.create(dto);
  await window.loadSuspensiones();
  return res;
};

window.deleteSuspencion = async function (id) {
  await window.suspencionService.deleteSuspencion(id);
  await window.loadSuspensiones();
};


