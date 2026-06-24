(function() {
const { createApp, computed } = Vue;

const app = createApp({
  setup() {
    const state = window.state;

    const totalPartidos = computed(() => {
      return state.canchas.reduce((s, c) => s + (c.partidos || 0), 0);
    });

    const arbDisp = computed(() => {
      return state.arbitros.filter((a) => a.disponibleSabado || a.disponibleDomingo).length;
    });

    const desPend = computed(() => {
      return state.canchas.filter(
        (c) =>
          !state.designaciones.some((d) => (d.cancha?.idCancha || d.idCancha || d.canchaId) === c.id) &&
          !state.designacionesIncompletas.some((d) => (d.cancha?.idCancha || d.idCancha || d.canchaId) === c.id)
      ).length;
    });

    const getArbCount = (c) => {
      const des =
        state.designaciones.find((d) => (d.cancha?.idCancha || d.idCancha || d.canchaId) === c.id) ||
        state.designacionesIncompletas.find((d) => (d.cancha?.idCancha || d.idCancha || d.canchaId) === c.id);
      return des ? (state.arbitrosDesignadosMap[des.idDesignacion || des.id] || des.arbitros || []).length : 0;
    };

    const isOk = (c) => {
      const des =
        state.designaciones.find((d) => (d.cancha?.idCancha || d.idCancha || d.canchaId) === c.id) ||
        state.designacionesIncompletas.find((d) => (d.cancha?.idCancha || d.idCancha || d.canchaId) === c.id);
      if (!des) return false;
      const assigned = state.arbitrosDesignadosMap[des.idDesignacion || des.id] || des.arbitros || [];
      return assigned.length >= window.minArbitros(des.cantidadPartidos || c.partidos || 0);
    };

    const recentDesignaciones = computed(() => {
      return [...state.designaciones, ...state.designacionesIncompletas];
    });

    return {
      state,
      totalPartidos,
      arbDisp,
      desPend,
      getArbCount,
      isOk,
      recentDesignaciones,
      calcStatus: window.calcStatus,
      minArbitros: window.minArbitros,
      formatFecha: window.formatFecha,
      getCancha: window.getCancha
    };
  }
});

app.component('app-sidebar', window.SidebarComponent);
app.component('app-modal', window.ModalComponent);
app.mount('#app');
})();
