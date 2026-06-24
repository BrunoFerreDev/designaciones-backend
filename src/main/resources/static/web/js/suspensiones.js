(function() {
const { createApp, ref, computed } = Vue;

const app = createApp({
  setup() {
    const state = window.state;
    const searchQuerySusp = ref(state.searchQuerySusp || "");

    const onSearchSuspInput = (e) => {
      searchQuerySusp.value = e.target.value;
      state.searchQuerySusp = e.target.value;
    };

    const activeSuspensionType = ref(1); // 1 = llamado, 2 = suspension

    // Form inputs
    const formArbitro = ref("");
    const formCancha = ref("");
    const formFecha = ref(new Date().toISOString().split('T')[0]);
    const formDias = ref(1);
    const formMotivo = ref("");

    const isSuspensionActive = (s) => {
      if (s.tipoSuspencion !== 2) return false;
      try {
        if (s.fechaFin) return new Date(s.fechaFin) > new Date();
        const start = new Date(s.fechaIncidente);
        const duration = parseInt(s.cantidadDias || 0);
        const end = new Date(start.getTime() + duration * 24 * 60 * 60 * 1000);
        return end > new Date();
      } catch (e) {
        return false;
      }
    };

    const getArbitroId = (arbitroProp) => {
      if (!arbitroProp) return null;
      if (typeof arbitroProp === "object") return arbitroProp.idArbitro || arbitroProp.id;
      return Number(arbitroProp);
    };

    const getArbitroName = (arbitroProp) => {
      const arbId = getArbitroId(arbitroProp);
      const a = window.getArbitro(Number(arbId));
      if (a) return `${a.apellido}, ${a.nombre}`;
      if (typeof arbitroProp === "object") return `${arbitroProp.apellido || ""}, ${arbitroProp.nombre || ""}`;
      return `ID: ${arbId}`;
    };

    const activeSuspensionsCount = computed(() => {
      return state.suspensiones.filter(
        (s) => s.tipoSuspencion === 2 && isSuspensionActive(s)
      ).length;
    });

    const activeWarningsCount = computed(() => {
      return state.suspensiones.filter((s) => s.tipoSuspencion === 1).length;
    });

    const totalSanctionedArbitros = computed(() => {
      return new Set(
        state.suspensiones.map((s) => getArbitroId(s.arbitro))
      ).size;
    });

    const filteredSuspensiones = computed(() => {
      const list = state.suspensiones.filter((s) => {
        const arbId = getArbitroId(s.arbitro);
        const arb = window.getArbitro(Number(arbId));
        let arbName = "";
        if (arb) arbName = `${arb.nombre} ${arb.apellido}`.toLowerCase();
        else if (typeof s.arbitro === "object") arbName = `${s.arbitro.nombre || ""} ${s.arbitro.apellido || ""}`.toLowerCase();

        const matchesSearch = !state.searchQuerySusp || arbName.includes(state.searchQuerySusp.toLowerCase().trim());
        const matchesType = !state.filterTypeSusp || String(s.tipoSuspencion) === String(state.filterTypeSusp);
        return matchesSearch && matchesType;
      });
      return [...list].reverse();
    });

    const submitSuspension = async () => {
      if (!formArbitro.value) {
        alert("Debe seleccionar un árbitro.");
        return;
      }

      let formattedFecha = formFecha.value;
      if (formattedFecha && !formattedFecha.includes("T")) {
        formattedFecha = formattedFecha + "T00:00:00";
      }

      const dto = {
        fechaIncidente: formattedFecha,
        cantidadDias: activeSuspensionType.value === 2 ? parseInt(formDias.value || 0) : 0,
        motivo: formMotivo.value.trim(),
        tipoSuspencion: parseInt(activeSuspensionType.value),
        arbitro: parseInt(formArbitro.value),
        cancha: formCancha.value ? parseInt(formCancha.value) : null,
      };

      try {
        await window.saveSuspencion(dto);
        alert("Sanción registrada exitosamente.");
        clearForm();
      } catch (err) {
        console.error(err);
      }
    };

    const clearForm = () => {
      formArbitro.value = "";
      formCancha.value = "";
      formFecha.value = new Date().toISOString().split('T')[0];
      formDias.value = 1;
      formMotivo.value = "";
      activeSuspensionType.value = 1;
    };

    return {
      state,
      activeSuspensionType,
      formArbitro,
      formCancha,
      formFecha,
      formDias,
      formMotivo,

      searchQuerySusp,
      onSearchSuspInput,
      activeSuspensionsCount,
      activeWarningsCount,
      totalSanctionedArbitros,
      filteredSuspensiones,
      
      isSuspensionActive,
      getArbitroName,
      submitSuspension,
      clearForm,
      openModal: window.openModal,
      getCancha: window.getCancha,
      formatFecha: window.formatFecha
    };
  }
});

app.component('app-sidebar', window.SidebarComponent);
app.component('app-modal', window.ModalComponent);
app.mount('#app');
})();
