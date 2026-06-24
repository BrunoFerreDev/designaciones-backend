(function() {
const { createApp, ref, computed, watch, onMounted } = Vue;

const app = createApp({
  setup() {
    const state = window.state;

    // Local Stats View Variables
    const activeTab = ref("global"); // 'global' | 'arbitro'
    const tipoFiltro = ref("rango"); // 'rango' | 'mes' | 'intervalo' | 'anio'
    const busquedaLocal = ref("");
    const selectedArbitroId = ref("");
    const selectedArbitroNombre = ref("");
    const cargando = ref(false);
    const cargandoDetalle = ref(false);
    const errorMsg = ref("");
    const globalStats = ref({});
    const arbitroStats = ref({});

    // Filter Form Controls
    const formFechaInicio = ref("");
    const formFechaFin = ref("");
    const formMesSelect = ref(new Date().getMonth() + 1);
    const formMesAnioSelect = ref(new Date().getFullYear());
    const formIntMesIni = ref(new Date().getMonth() + 1);
    const formIntAnioIni = ref(new Date().getFullYear());
    const formIntMesFin = ref(new Date().getMonth() + 1);
    const formIntAnioFin = ref(new Date().getFullYear());
    const formAnioSelect = ref(new Date().getFullYear());

    // Consts
    const MESES = [
      { val: 1, label: "Enero" },
      { val: 2, label: "Febrero" },
      { val: 3, label: "Marzo" },
      { val: 4, label: "Abril" },
      { val: 5, label: "Mayo" },
      { val: 6, label: "Junio" },
      { val: 7, label: "Julio" },
      { val: 8, label: "Agosto" },
      { val: 9, label: "Septiembre" },
      { val: 10, label: "Octubre" },
      { val: 11, label: "Noviembre" },
      { val: 12, label: "Diciembre" },
    ];
    const ANIOS = [2024, 2025, 2026, 2027, 2028];

    const inicializarFechas = () => {
      const d = new Date();
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const lastDay = new Date(year, month, 0).getDate();
      const monthStr = String(month).padStart(2, "0");

      formFechaInicio.value = `${year}-${monthStr}-01`;
      formFechaFin.value = `${year}-${monthStr}-${String(lastDay).padStart(2, "0")}`;
    };

    // Load detailed data
    const cargarDatosDetalle = async () => {
      if (!selectedArbitroId.value) return;
      cargandoDetalle.value = true;
      try {
        const res = await window.estadisticasService.getEstadisticasArbitro(selectedArbitroId.value, formFechaInicio.value, formFechaFin.value);
        arbitroStats.value = res || {};
      } catch (err) {
        console.warn("Error al cargar estadísticas de árbitro. Usando fallback local.", err);
        arbitroStats.value = calculateLocalArbitroStats(selectedArbitroId.value, formFechaInicio.value, formFechaFin.value);
      } finally {
        cargandoDetalle.value = false;
      }
    };

    // Load global statistics
    const cargarDatos = async () => {
      cargando.value = true;
      errorMsg.value = "";
      try {
        const res = await window.estadisticasService.getEstadisticas(formFechaInicio.value, formFechaFin.value);
        globalStats.value = res || {};
      } catch (err) {
        console.warn("Backend offline o error al cargar estadísticas. Usando fallback local.", err);
        errorMsg.value = "Servidor desconectado. Visualizando datos calculados localmente en caché.";
        globalStats.value = calculateLocalGlobalStats(formFechaInicio.value, formFechaFin.value);
      } finally {
        cargando.value = false;
      }
    };

    // Change Filter Type (Tabs)
    const changeFilterType = (type) => {
      tipoFiltro.value = type;
    };

    // Reset Filters
    const reiniciarFiltros = async () => {
      tipoFiltro.value = "rango";
      inicializarFechas();
      selectedArbitroId.value = "";
      selectedArbitroNombre.value = "";
      busquedaLocal.value = "";
      await cargarDatos();
      if (activeTab.value === "arbitro") {
        arbitroStats.value = {};
      }
    };

    // Apply Filter
    const aplicarFiltro = async () => {
      if (tipoFiltro.value === "rango") {
        // Form states are already bound via v-model
      } else if (tipoFiltro.value === "mes") {
        const m = Number(formMesSelect.value);
        const y = Number(formMesAnioSelect.value);
        const lastDay = new Date(y, m, 0).getDate();
        const mStr = String(m).padStart(2, "0");
        formFechaInicio.value = `${y}-${mStr}-01`;
        formFechaFin.value = `${y}-${mStr}-${String(lastDay).padStart(2, "0")}`;
      } else if (tipoFiltro.value === "intervalo") {
        const mIni = Number(formIntMesIni.value);
        const yIni = Number(formIntAnioIni.value);
        const mFin = Number(formIntMesFin.value);
        const yFin = Number(formIntAnioFin.value);
        const lastDay = new Date(yFin, mFin, 0).getDate();
        formFechaInicio.value = `${yIni}-${String(mIni).padStart(2, "0")}-01`;
        formFechaFin.value = `${yFin}-${String(mFin).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
      } else if (tipoFiltro.value === "anio") {
        const y = Number(formAnioSelect.value);
        formFechaInicio.value = `${y}-01-01`;
        formFechaFin.value = `${y}-12-31`;
      }

      await cargarDatos();
      if (selectedArbitroId.value) {
        await cargarDatosDetalle();
      }
    };

    // Set tab
    const setTab = (tab) => {
      activeTab.value = tab;
      if (tab === "arbitro" && selectedArbitroId.value && !cargandoDetalle.value) {
        cargarDatosDetalle();
      }
    };

    // Select referee and show details
    const seleccionarYVerDetalle = (id, nombre) => {
      selectedArbitroId.value = id;
      selectedArbitroNombre.value = nombre;
      activeTab.value = "arbitro";
      cargarDatosDetalle();
    };

    const seleccionarArbitroDetalle = () => {
      if (!selectedArbitroId.value) return;
      const list = getListaArbitrosCompletos();
      const match = list.find(a => Number(a.idArbitro || a.id) === Number(selectedArbitroId.value));
      selectedArbitroNombre.value = match ? `${match.nombre} ${match.apellido}` : "Árbitro";
      cargarDatosDetalle();
    };

    // --- local fallback stats calculators ---
    const calculateLocalGlobalStats = (start, end) => {
      const allDes = [
        ...(state.designaciones || []),
        ...(state.designacionesIncompletas || []),
        ...(state.designacionesFinalizadas || []),
        ...(state.designacionesAConfirmar || []),
        ...(state.designacionesAceptadas || [])
      ];

      const filtered = allDes.filter(d => {
        if (!d.fecha) return false;
        const dDate = d.fecha.split("T")[0];
        return dDate >= start && dDate <= end;
      });

      const totalPartidosDirigidos = filtered.reduce((sum, d) => sum + (Number(d.cantidadPartidos) || 1), 0);

      const canchasMap = {};
      filtered.forEach(d => {
        const canchaId = d.idCancha || d.canchaId || d.cancha?.idCancha || d.cancha?.id;
        if (!canchaId) return;
        const cancha = state.canchas.find(c => c.id === Number(canchaId)) || d.cancha;
        if (!cancha) return;
        const cName = cancha.nombre || cancha.nombreCancha || "Cancha";
        if (!canchasMap[canchaId]) {
          canchasMap[canchaId] = {
            idCancha: canchaId,
            nombreCancha: cName,
            totalDesignaciones: 0,
            totalPartidos: 0
          };
        }
        canchasMap[canchaId].totalDesignaciones += 1;
        canchasMap[canchaId].totalPartidos += (Number(d.cantidadPartidos) || 1);
      });
      const estadisticasCanchas = Object.values(canchasMap).sort((a, b) => b.totalPartidos - a.totalPartidos);

      const arbitrosMap = {};
      filtered.forEach(d => {
        const dId = d.idDesignacion || d.id;
        const assigned = state.arbitrosDesignadosMap[dId] || d.arbitros || [];
        assigned.forEach(asg => {
          const arb = asg.arbitro || window.getArbitro(asg.idArbitro);
          if (!arb) return;
          const arbId = arb.idArbitro || arb.id;
          const fullName = `${arb.nombre} ${arb.apellido}`;
          if (!arbitrosMap[arbId]) {
            arbitrosMap[arbId] = {
              idArbitro: arbId,
              nombreCompleto: fullName,
              totalDesignaciones: 0,
              totalPartidosDirigidos: 0
            };
          }
          arbitrosMap[arbId].totalDesignaciones += 1;
          arbitrosMap[arbId].totalPartidosDirigidos += (Number(d.cantidadPartidos) || 1);
        });
      });
      const estadisticasArbitros = Object.values(arbitrosMap).sort((a, b) => b.totalPartidosDirigidos - a.totalPartidosDirigidos);

      const designacionesPorEstado = {};
      filtered.forEach(d => {
        let estado = "Incompleta";
        if (state.designacionesFinalizadas.some(x => (x.id || x.idDesignacion) === (d.id || d.idDesignacion))) estado = "Finalizada";
        else if (state.designacionesAceptadas.some(x => (x.id || x.idDesignacion) === (d.id || d.idDesignacion))) estado = "Cancelada";
        else if (state.designaciones.some(x => (x.id || x.idDesignacion) === (d.id || d.idDesignacion))) estado = "Completa";
        else if (state.designacionesAConfirmar.some(x => (x.id || x.idDesignacion) === (d.id || d.idDesignacion))) estado = "A Confirmar";
        else if (state.designacionesIncompletas.some(x => (x.id || x.idDesignacion) === (d.id || d.idDesignacion))) estado = "Incompleta";
        else if (d.estado) estado = d.estado;

        const mapping = { 'INCOMPLETA': 'Incompleta', 'COMPLETA': 'Completa', 'FINALIZADA': 'Finalizada', 'A_CONFIRMAR': 'A Confirmar', 'CANCELADA': 'Cancelada', 'ACEPTADA': 'Cancelada' };
        const norm = mapping[estado.toUpperCase()] || estado;
        designacionesPorEstado[norm] = (designacionesPorEstado[norm] || 0) + 1;
      });

      const designacionesPorCategoriaArbitro = {};
      filtered.forEach(d => {
        const dId = d.idDesignacion || d.id;
        const assigned = state.arbitrosDesignadosMap[dId] || d.arbitros || [];
        assigned.forEach(asg => {
          const arb = asg.arbitro || window.getArbitro(asg.idArbitro);
          if (!arb) return;
          const cat = arb.categoria || "INICIAL";
          designacionesPorCategoriaArbitro[cat] = (designacionesPorCategoriaArbitro[cat] || 0) + 1;
        });
      });

      return {
        totalDesignaciones: filtered.length,
        totalPartidosDirigidos,
        estadisticasCanchas,
        estadisticasArbitros,
        designacionesPorEstado,
        designacionesPorCategoriaArbitro
      };
    };

    const calculateLocalArbitroStats = (arbId, start, end) => {
      const allDes = [
        ...(state.designaciones || []),
        ...(state.designacionesIncompletas || []),
        ...(state.designacionesFinalizadas || []),
        ...(state.designacionesAConfirmar || []),
        ...(state.designacionesAceptadas || [])
      ];

      const filtered = allDes.filter(d => {
        if (!d.fecha) return false;
        const dDate = d.fecha.split("T")[0];
        if (dDate < start || dDate > end) return false;

        const dId = d.idDesignacion || d.id;
        const assigned = state.arbitrosDesignadosMap[dId] || d.arbitros || [];
        return assigned.some(asg => Number(asg.idArbitro || asg.arbitro?.idArbitro || asg.arbitro?.id) === Number(arbId));
      });

      let totalMontoPercibido = 0;
      filtered.forEach(d => {
        const dId = d.idDesignacion || d.id;
        const assigned = state.arbitrosDesignadosMap[dId] || d.arbitros || [];
        const match = assigned.find(asg => Number(asg.idArbitro || asg.arbitro?.idArbitro || asg.arbitro?.id) === Number(arbId));
        if (match) totalMontoPercibido += (Number(match.montoPercibido) || 0);
      });

      const totalDesignaciones = filtered.length;
      const totalPartidosDirigidos = filtered.reduce((sum, d) => sum + (Number(d.cantidadPartidos) || 1), 0);

      const canchasMap = {};
      filtered.forEach(d => {
        const canchaId = d.idCancha || d.canchaId || d.cancha?.idCancha || d.cancha?.id;
        if (!canchaId) return;
        const cancha = state.canchas.find(c => c.id === Number(canchaId)) || d.cancha;
        if (!cancha) return;
        const cName = cancha.nombre || cancha.nombreCancha || "Cancha";
        if (!canchasMap[canchaId]) {
          canchasMap[canchaId] = {
            idCancha: canchaId,
            nombreCancha: cName,
            totalDesignaciones: 0,
            totalPartidos: 0
          };
        }
        canchasMap[canchaId].totalDesignaciones += 1;
        canchasMap[canchaId].totalPartidos += (Number(d.cantidadPartidos) || 1);
      });
      const estadisticasCanchas = Object.values(canchasMap).sort((a, b) => b.totalPartidos - a.totalPartidos);

      const designacionesPorEstado = {};
      filtered.forEach(d => {
        let estado = "Incompleta";
        if (state.designacionesFinalizadas.some(x => (x.id || x.idDesignacion) === (d.id || d.idDesignacion))) estado = "Finalizada";
        else if (state.designacionesAceptadas.some(x => (x.id || x.idDesignacion) === (d.id || d.idDesignacion))) estado = "Cancelada";
        else if (state.designaciones.some(x => (x.id || x.idDesignacion) === (d.id || d.idDesignacion))) estado = "Completa";
        else if (state.designacionesAConfirmar.some(x => (x.id || x.idDesignacion) === (d.id || d.idDesignacion))) estado = "A Confirmar";
        else if (state.designacionesIncompletas.some(x => (x.id || x.idDesignacion) === (d.id || d.idDesignacion))) estado = "Incompleta";
        else if (d.estado) estado = d.estado;

        const mapping = { 'INCOMPLETA': 'Incompleta', 'COMPLETA': 'Completa', 'FINALIZADA': 'Finalizada', 'A_CONFIRMAR': 'A Confirmar', 'CANCELADA': 'Cancelada', 'ACEPTADA': 'Cancelada' };
        const norm = mapping[estado.toUpperCase()] || estado;
        designacionesPorEstado[norm] = (designacionesPorEstado[norm] || 0) + 1;
      });

      const designacionesPorCategoria = {};
      filtered.forEach(d => {
        const canchaId = d.idCancha || d.canchaId || d.cancha?.idCancha || d.cancha?.id;
        const cancha = state.canchas.find(c => c.id === Number(canchaId)) || d.cancha;
        const cat = cancha?.categoria || "FUTBOL_11";
        designacionesPorCategoria[cat] = (designacionesPorCategoria[cat] || 0) + (Number(d.cantidadPartidos) || 1);
      });

      return {
        totalMontoPercibido,
        totalPartidosDirigidos,
        totalDesignaciones,
        estadisticasCanchas,
        designacionesPorEstado,
        designacionesPorCategoria
      };
    };

    const getListaArbitrosCompletos = () => {
      const list = [...(state.arbitros || []), ...(state.arbitrosNoDisponibles || [])];
      const unique = [];
      const mapSet = new Set();
      for (const item of list) {
        const id = item.idArbitro || item.id;
        if (id && !mapSet.has(id)) {
          mapSet.add(id);
          unique.push(item);
        }
      }
      return unique.sort((a, b) => (a.apellido || "").localeCompare(b.apellido || ""));
    };

    const getPorcentaje = (parcial, total) => {
      if (!total) return 0;
      return Math.round((parcial / total) * 100);
    };

    const getEstadoColor = (estado) => {
      const norm = String(estado).toLowerCase();
      if (norm.includes("incompleta")) return "#ef4444";
      if (norm.includes("completa")) return "#16a34a";
      if (norm.includes("cancelada")) return "#f43f5e";
      if (norm.includes("confirmar")) return "#facc15";
      if (norm.includes("finalizada")) return "#6366f1";
      return "#94a3b8";
    };

    const getCategoryLabel = (cat) => {
      const map = {
        AVANZADO: "Avanzado",
        INTERMEDIO: "Intermedio",
        PRINCIPAL_1: "Principal 1",
        PRINCIPAL_2: "Principal 2",
        PRINCIPAL_3: "Principal 3",
        PRINCIPAL_4: "Principal 4",
        ASISTENTE: "Asistente",
        INICIAL: "Inicial",
      };
      return map[cat] || cat || "Inicial";
    };

    const getCategoryProgressBarClass = (cat) => {
      const map = {
        AVANZADO: "bg-blue-600",
        INTERMEDIO: "bg-amber-500",
        PRINCIPAL_1: "bg-emerald-600",
        PRINCIPAL_2: "bg-teal-600",
        PRINCIPAL_3: "bg-cyan-600",
        PRINCIPAL_4: "bg-sky-500",
        ASISTENTE: "bg-slate-400",
        INICIAL: "bg-rose-500",
      };
      return map[cat] || "bg-slate-400";
    };

    const formatMonto = (valor) => {
      if (valor === undefined || valor === null) return "$0,00";
      return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 2,
      }).format(valor);
    };

    // Computed Lists
    const listaArbitros = computed(() => getListaArbitrosCompletos());

    const arbitrosFiltrados = computed(() => {
      return (globalStats.value.estadisticasArbitros || []).filter(a => {
        const query = busquedaLocal.value.toLowerCase().trim();
        return !query || (a.nombreCompleto || "").toLowerCase().includes(query);
      });
    });

    const sugeridos = computed(() => {
      return (state.arbitros || []).slice(0, 4);
    });

    const promedio = computed(() => {
      if (!selectedArbitroId.value || !arbitroStats.value.totalPartidosDirigidos) return 0;
      return (arbitroStats.value.totalMontoPercibido || 0) / arbitroStats.value.totalPartidosDirigidos;
    });

    onMounted(async () => {
      inicializarFechas();
      await cargarDatos();
    });

    return {
      state,
      activeTab,
      tipoFiltro,
      busquedaLocal,
      selectedArbitroId,
      selectedArbitroNombre,
      cargando,
      cargandoDetalle,
      errorMsg,
      globalStats,
      arbitroStats,

      formFechaInicio,
      formFechaFin,
      formMesSelect,
      formMesAnioSelect,
      formIntMesIni,
      formIntAnioIni,
      formIntMesFin,
      formIntAnioFin,
      formAnioSelect,

      MESES,
      ANIOS,
      listaArbitros,
      arbitrosFiltrados,
      sugeridos,
      promedio,

      changeFilterType,
      reiniciarFiltros,
      aplicarFiltro,
      setTab,
      seleccionarYVerDetalle,
      seleccionarArbitroDetalle,
      getPorcentaje,
      getEstadoColor,
      getCategoryLabel,
      getCategoryProgressBarClass,
      formatMonto
    };
  }
});

app.component('app-sidebar', window.SidebarComponent);
app.component('app-modal', window.ModalComponent);
app.mount('#app');
})();
