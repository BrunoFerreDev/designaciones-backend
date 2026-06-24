(function() {
const { createApp, ref, computed } = Vue;

const app = createApp({
  setup() {
    const state = window.state;
    const searchQuery = ref(state.searchQueryRef || "");

    const onSearchInput = (e) => {
      searchQuery.value = e.target.value;
      state.searchQueryRef = e.target.value;
    };

    const totalArbitros = computed(() => {
      return new Set([
        ...state.arbitros.map((a) => a.idArbitro),
        ...(state.arbitrosNoDisponibles || []).map((a) => a.idArbitro),
      ]).size;
    });

    const disponiblesCount = computed(() => {
      return state.arbitros.filter((a) => a.disponibleSabado || a.disponibleDomingo).length;
    });

    const noDisponiblesCount = computed(() => {
      return (state.arbitrosNoDisponibles || []).length;
    });

    const disponiblesSabadoCount = computed(() => {
      return state.arbitros.filter((a) => a.disponibleSabado).length;
    });

    const disponiblesDomingoCount = computed(() => {
      return state.arbitros.filter((a) => a.disponibleDomingo).length;
    });

    const filteredArbitros = computed(() => {
      return state.arbitros.filter((a) => {
        const nombreCompleto = `${a.nombre || ""} ${a.apellido || ""}`.toLowerCase();
        const query = (state.searchQueryRef || "").toLowerCase().trim();
        const coincideBusqueda = !query || nombreCompleto.includes(query);
        const coincideCategoria =
          !state.filterCategoryRef ||
          a.categoria === state.filterCategoryRef;
        return coincideBusqueda && coincideCategoria;
      });
    });

    const disponibles = computed(() => {
      return filteredArbitros.value.filter((a) => a.disponibleSabado || a.disponibleDomingo);
    });

    const noDisponibles = computed(() => {
      return (state.arbitrosNoDisponibles || []).filter((a) => {
        const nombreCompleto = `${a.nombre || ""} ${a.apellido || ""}`.toLowerCase();
        const query = (state.searchQueryRef || "").toLowerCase().trim();
        const coincideBusqueda = !query || nombreCompleto.includes(query);
        const coincideCategoria =
          !state.filterCategoryRef ||
          a.categoria === state.filterCategoryRef;
        return coincideBusqueda && coincideCategoria;
      });
    });

    const markAllNoDisp = () => {
      if (!confirm("¿Estás seguro de que deseas marcar a todos los árbitros como no disponibles?")) return;
      window.arbitroService.updateDisponibilidadTotal().then(() => {
        state.arbitros.forEach((a) => {
          a.estado = false;
        });
        Promise.all([
          window.loadArbitros(),
          window.loadArbitrosNoDisponibles(),
        ]);
      });
    };

    const toggleAvailability = (id, key) => {
      const aVal = window.getArbitro(id);
      if (!aVal) return;
      const updatedValue = !aVal[key];
      const dto = {
        estado: key === "estado" ? updatedValue : aVal.estado !== undefined ? aVal.estado : true,
        disponibleSabado: key === "disponibleSabado" ? updatedValue : aVal.disponibleSabado !== undefined ? aVal.disponibleSabado : true,
        disponibleDomingo: key === "disponibleDomingo" ? updatedValue : aVal.disponibleDomingo !== undefined ? aVal.disponibleDomingo : true,
      };
      window.arbitroService.updateDisponibilidad(id, dto).then((res) => {
        Object.assign(aVal, res || { idArbitro: id, ...dto });
        Promise.all([
          window.loadArbitros(),
          window.loadArbitrosNoDisponibles(),
        ]);
      });
    };

    return {
      state,
      searchQuery,
      onSearchInput,
      totalArbitros,
      disponiblesCount,
      noDisponiblesCount,
      disponiblesSabadoCount,
      disponiblesDomingoCount,
      disponibles,
      noDisponibles,
      markAllNoDisp,
      toggleAvailability,
      openModal: window.openModal,
      deleteArbitro: window.deleteArbitro
    };
  }
});

app.component('app-sidebar', window.SidebarComponent);
app.component('app-modal', window.ModalComponent);
app.mount('#app');
})();
