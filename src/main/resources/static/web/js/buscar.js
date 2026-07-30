(function() {
const { createApp, ref, computed } = Vue;

const app = createApp({
  setup() {
    const state = window.state;

    const months = [
      { val: 1, name: "Enero" },
      { val: 2, name: "Febrero" },
      { val: 3, name: "Marzo" },
      { val: 4, name: "Abril" },
      { val: 5, name: "Mayo" },
      { val: 6, name: "Junio" },
      { val: 7, name: "Julio" },
      { val: 8, name: "Agosto" },
      { val: 9, name: "Septiembre" },
      { val: 10, name: "Octubre" },
      { val: 11, name: "Noviembre" },
      { val: 12, name: "Diciembre" }
    ];

    const loading = ref(false);
    const error = ref(false);
    const searched = ref(false);
    const results = ref([]);

    const setMode = (mode) => {
      state.searchMode = mode;
      // Reset search state
      results.value = [];
      searched.value = false;
      error.value = false;
    };

    const executeSearch = async () => {
      loading.value = true;
      error.value = false;
      searched.value = true;
      results.value = [];

      try {
        let res = [];
        if (state.searchMode === "single") {
          res = await window.designacionService.buscarPorFecha(state.fechaSingle);
        } else if (state.searchMode === "range") {
          res = await window.designacionService.buscarPorRango(state.fechaInicio, state.fechaFin);
        } else if (state.searchMode === "monthly") {
          res = await window.designacionService.buscarPorMes(Number(state.selectedMonth), Number(state.selectedYear));
        } else if (state.searchMode === "referee") {
          const all = [
            ...state.designacionesIncompletas,
            ...state.designaciones,
            ...state.designacionesFinalizadas,
            ...state.designacionesAConfirmar,
            ...(state.designacionesAceptadas || []),
          ];
          res = all.filter((d) => {
            const assigned =
              state.arbitrosDesignadosMap[d.idDesignacion || d.id] ||
              d.arbitrosDesignados ||
              d.arbitros ||
              [];
            return assigned.some(
              (asg) =>
                Number(asg.idArbitro || asg.arbitro?.idArbitro) ===
                Number(state.selectedArbitroId),
            );
          });
        } else if (state.searchMode === "court") {
          const all = [
            ...state.designacionesIncompletas,
            ...state.designaciones,
            ...state.designacionesFinalizadas,
            ...state.designacionesAConfirmar,
            ...(state.designacionesAceptadas || []),
          ];
          res = all.filter(
            (d) =>
              Number(d.idCancha || d.canchaId || d.cancha?.idCancha) ===
              Number(state.selectedCanchaId),
          );
        }

        if (!Array.isArray(res)) res = res.content || [];
        results.value = res;
      } catch (err) {
        console.error(err);
        error.value = true;
      } finally {
        loading.value = false;
      }
    };

    return {
      state,
      months,
      loading,
      error,
      searched,
      results,
      setMode,
      executeSearch,
      getCancha: window.getCancha,
      formatFecha: window.formatFecha
    };
  }
});

app.component('app-sidebar', window.SidebarComponent);
app.component('app-modal', window.ModalComponent);
app.mount('#app');
})();
