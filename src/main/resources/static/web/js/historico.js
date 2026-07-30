(function() {
const { createApp, ref, computed } = Vue;

const app = createApp({
  setup() {
    const state = window.state;

    // Local operations state
    const registering = ref(false);

    // Initial check for configs setup
    if (!state.selectedCanchasHistorico) state.selectedCanchasHistorico = {};
    if (!state.canchaConfigsHistorico) state.canchaConfigsHistorico = {};
    if (!state.designacionesExistentesHistorico) state.designacionesExistentesHistorico = [];

    const getCanchaName = (cId) => {
      return window.getCancha(cId)?.nombre || '—';
    };

    const fetchExistentes = async () => {
      if (state.fechaHistorico) {
        state.designacionesExistentesHistorico = [];
        try {
          const res = await window.designacionService.buscarPorFecha(state.fechaHistorico);
          state.designacionesExistentesHistorico = Array.isArray(res) ? res : res.content || res || [];
        } catch(e) {
          console.warn("Failed fetching historical designaciones", e);
        }
      }
    };

    const selectAll = () => {
      state.canchas.forEach(c => {
        state.selectedCanchasHistorico[c.id] = true;
        if (!state.canchaConfigsHistorico[c.id]) {
          state.canchaConfigsHistorico[c.id] = { hora: '08:00', cantidadPartidos: 1, etapaCampeonato: 'FECHA_NORMAL' };
        }
      });
    };

    const deselectAll = () => {
      state.selectedCanchasHistorico = {};
      state.canchaConfigsHistorico = {};
    };

    const toggleCancha = (id) => {
      if (state.selectedCanchasHistorico[id]) {
        delete state.selectedCanchasHistorico[id];
        delete state.canchaConfigsHistorico[id];
      } else {
        state.selectedCanchasHistorico[id] = true;
        state.canchaConfigsHistorico[id] = { hora: '08:00', cantidadPartidos: 1, etapaCampeonato: 'FECHA_NORMAL' };
      }
    };

    const hasSelectedCanchas = computed(() => {
      return Object.keys(state.selectedCanchasHistorico || {}).length > 0;
    });

    const registrarHistorico = async () => {
      const selectedIds = Object.keys(state.selectedCanchasHistorico).map(Number);
      if (selectedIds.length === 0) return;

      registering.value = true;

      try {
        for (const canchaId of selectedIds) {
          const config = state.canchaConfigsHistorico[canchaId];
          const dto = {
            idCancha: canchaId,
            fecha: `${state.fechaHistorico}T${config.hora}:00`,
            cantidadPartidos: config.cantidadPartidos,
            etapaCampeonato: config.etapaCampeonato
          };
          await window.designacionService.createDesignacion(dto);
        }
        alert("Designaciones registradas con éxito.");
        state.selectedCanchasHistorico = {};
        state.canchaConfigsHistorico = {};
        await fetchExistentes();
      } catch(err) {
        console.error(err);
        alert("Error al registrar algunas de las designaciones históricas.");
      } finally {
        registering.value = false;
      }
    };

    return {
      state,
      registering,
      getCanchaName,
      fetchExistentes,
      selectAll,
      deselectAll,
      toggleCancha,
      hasSelectedCanchas,
      registrarHistorico,
      openModal: window.openModal,
      deleteDesignacion: window.deleteDesignacion,
      formatFecha: window.formatFecha
    };
  }
});

app.component('app-sidebar', window.SidebarComponent);
app.component('app-modal', window.ModalComponent);
app.mount('#app');
})();
