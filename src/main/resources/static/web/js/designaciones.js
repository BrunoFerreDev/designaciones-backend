(function() {
const { createApp, ref, computed } = Vue;

const app = createApp({
  setup() {
    const state = window.state;
    const searchRefereeQuery = ref(state.searchRefereeQuery || "");

    const onSearchRefereeInput = (e) => {
      searchRefereeQuery.value = e.target.value;
      state.searchRefereeQuery = e.target.value;
    };

    const getDayOfWeek = (d) => {
      return window.getDayOfWeekLocal(d.fecha);
    };

    const incSabado = computed(() => {
      return state.designacionesIncompletas.filter((d) => getDayOfWeek(d) === 6);
    });
    const incDomingo = computed(() => {
      return state.designacionesIncompletas.filter((d) => getDayOfWeek(d) === 0);
    });

    const compSabado = computed(() => {
      return state.designaciones.filter((d) => getDayOfWeek(d) === 6);
    });
    const compDomingo = computed(() => {
      return state.designaciones.filter((d) => getDayOfWeek(d) === 0);
    });

    const acepSabado = computed(() => {
      return (state.designacionesAceptadas || []).filter((d) => getDayOfWeek(d) === 6);
    });
    const acepDomingo = computed(() => {
      return (state.designacionesAceptadas || []).filter((d) => getDayOfWeek(d) === 0);
    });

    const finSabado = computed(() => {
      return state.designacionesFinalizadas.filter((d) => getDayOfWeek(d) === 6);
    });
    const finDomingo = computed(() => {
      return state.designacionesFinalizadas.filter((d) => getDayOfWeek(d) === 0);
    });

    const getAssigned = (d) => {
      const id = d.idDesignacion || d.id;
      return state.arbitrosDesignadosMap[id] || d.arbitrosDesignados || d.arbitros || [];
    };

    const getAssignedCount = (d) => {
      return getAssigned(d).length;
    };

    // Real-time referee search filter
    const filteredRefMatchList = computed(() => {
      const q = (state.searchRefereeQuery || "").toLowerCase().trim();
      if (!q) return [];

      const list = [];
      const lists = [
        ...state.designacionesIncompletas,
        ...state.designaciones,
        ...state.designacionesFinalizadas,
        ...state.designacionesAConfirmar,
        ...(state.designacionesAceptadas || []),
      ];

      lists.forEach((d) => {
        const assigned = getAssigned(d);
        assigned.forEach((asg) => {
          const a = asg.arbitro || window.getArbitro(asg.idArbitro);
          if (a) {
            const name = `${a.nombre} ${a.apellido}`.toLowerCase();
            if (name.includes(q)) {
              let statusLabel = "Incompleta";
              let statusClass = "badge-amber";
              if (d.estadoDesignacion == 1) {
                statusLabel = "Completa";
                statusClass = "badge-green";
              } else if (d.estadoDesignacion == 2) {
                statusLabel = "Finalizada";
                statusClass = "badge-blue";
              } else if (d.estadoDesignacion == 3) {
                statusLabel = "Aceptada";
                statusClass = "badge-green";
              }

              list.push({
                id: `${d.id || d.idDesignacion}-${a.idArbitro}`,
                refereeName: `${a.nombre} ${a.apellido}`,
                canchaName: d.cancha?.nombreCancha || window.getCancha(d.idCancha || d.canchaId)?.nombre || "—",
                fechaFormateada: window.formatFecha(d.fecha),
                rol: asg.rol || "Árbitro",
                statusLabel,
                statusClass,
              });
            }
          }
        });
      });
      return list;
    });

    const triggerAutoAssign = async (id, event) => {
      const btn = event.currentTarget;
      const originalHtml = btn.innerHTML;
      btn.innerHTML = `<span class="material-symbols-outlined animate-spin text-sm">sync</span>`;
      btn.disabled = true;

      try {
        const list = [
          ...state.designacionesIncompletas,
          ...state.designaciones,
          ...state.designacionesAConfirmar,
        ];
        const des = list.find((d) => (d.idDesignacion || d.id) === id);
        if (!des) throw new Error("No se encontró la designación.");

        await window.loadArbitros();

        let disponibles = state.arbitros.filter((a) => {
          if (a.estado === false) return false;
          const day = window.getDayOfWeekLocal(des.fecha);
          if (day === 6 || day === 0) return a.disponibleSabado || a.disponibleDomingo;
          return true;
        });

        const isSaturday = window.getDayOfWeekLocal(des.fecha) === 6;
        const targetCanchaId = des.idCancha || des.canchaId || des.cancha?.idCancha || des.cancha?.id;

        const satRepetitionExcluded = new Set();
        if (isSaturday) {
          state.designacionesFinalizadas.forEach((finalD) => {
            const finalCanchaId = finalD.idCancha || finalD.canchaId || finalD.cancha?.idCancha || finalD.cancha?.id;
            if (String(finalCanchaId) === String(targetCanchaId) && window.getDayOfWeekLocal(finalD.fecha) === 6) {
              const assigned = finalD.arbitrosDesignados || finalD.arbitros || [];
              assigned.forEach((asg) => {
                const arbId = asg.arbitro?.idArbitro || asg.idArbitro;
                if (arbId) {
                  const arbObj = state.arbitros.find((a) => a.idArbitro === arbId);
                  if (arbObj) {
                    const nombreCompleto = `${arbObj.nombre || ""} ${arbObj.apellido || ""}`.trim();
                    const normalized = nombreCompleto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
                    satRepetitionExcluded.add(normalized);
                  }
                }
              });
            }
          });
        }

        disponibles = disponibles.filter((a) => {
          if (window.isRefereeAssignedToDifferentCourtOnSameDay(a.idArbitro, des)) return false;
          const nombreCompleto = `${a.nombre || ""} ${a.apellido || ""}`.trim();
          const normalized = nombreCompleto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
          if (isSaturday && satRepetitionExcluded.has(normalized)) return false;
          return true;
        });

        const reqCount = window.minArbitros(des.cantidadPartidos);
        if (disponibles.length < reqCount) {
          alert(`No hay suficientes árbitros disponibles (${disponibles.length} de ${reqCount} requeridos) que cumplan los criterios.`);
          return;
        }

        const priorityRoles = [...window.ROLES_ARB];
        const assignments = [];
        const selectedIds = new Set();

        for (let i = 0; i < reqCount; i++) {
          const targetRole = priorityRoles[i] || priorityRoles[1];
          const match = disponibles.find((a) => !selectedIds.has(a.idArbitro) && a.rol === targetRole);
          if (match) {
            assignments.push({ refereeId: match.idArbitro, rol: targetRole });
            selectedIds.add(match.idArbitro);
          } else {
            const fallback = disponibles.find((a) => !selectedIds.has(a.idArbitro));
            if (fallback) {
              assignments.push({ refereeId: fallback.idArbitro, rol: targetRole });
              selectedIds.add(fallback.idArbitro);
            }
          }
        }

        const idsPayload = assignments.map((a) => a.refereeId);
        try {
          await window.designacionService.designarListaArbitrosADesignacion(id, idsPayload);
          state.arbitrosDesignadosMap[id] = [];
          const res = await window.designacionService.getDesignados(id);
          state.arbitrosDesignadosMap[id] = Array.isArray(res) ? res : res.data || res || [];
          await window.reloadAllDesignaciones();
          window.updateDesignacionStateLocal(id);
        } catch (apiErr) {
          console.error("API bulk assign failed", apiErr);
          alert("No se pudo realizar la asignación automática: " + apiErr.message);
        }
      } catch (err) {
        console.error("Auto assign failed", err);
      } finally {
        btn.innerHTML = originalHtml;
        btn.disabled = false;
      }
    };

    return {
      state,
      searchRefereeQuery,
      onSearchRefereeInput,
      incSabado,
      incDomingo,
      compSabado,
      compDomingo,
      acepSabado,
      acepDomingo,
      finSabado,
      finDomingo,
      getAssigned,
      getAssignedCount,
      filteredRefMatchList,
      triggerAutoAssign,
      
      openModal: window.openModal,
      deleteDesignacion: window.deleteDesignacion,
      cancelarJornada: window.cancelarJornada,
      finalizarJornada: window.finalizarJornada,
      reprogramarJornada: window.reprogramarJornada,
      getCancha: window.getCancha,
      getArbitro: window.getArbitro,
      minArbitros: window.minArbitros,
      formatFecha: window.formatFecha
    };
  }
});

app.component('app-sidebar', window.SidebarComponent);
app.component('app-modal', window.ModalComponent);
app.mount('#app');
})();
