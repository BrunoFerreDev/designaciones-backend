import arbitroService from "../services/arbitroService.js";
import { addToast } from "../helpers.js";
import { state, updateState } from "../store.js";

// Make sure ArbitroCard element is registered
import "../components/ArbitroCard.js";

document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const topbarCount = document.getElementById("topbar-count");
  const btnMarkAllUnavailable = document.getElementById("btn-mark-all-unavailable");
  const btnNewReferee = document.getElementById("btn-new-referee");

  const statTotal = document.getElementById("stat-total");
  const statAvailable = document.getElementById("stat-available");
  const statUnavailable = document.getElementById("stat-unavailable");
  const statSaturday = document.getElementById("stat-saturday");
  const statSunday = document.getElementById("stat-sunday");

  const searchQueryInput = document.getElementById("search-query");
  const filterCategorySelect = document.getElementById("filter-category");
  const btnToggleSort = document.getElementById("btn-toggle-sort");
  const sortLabel = document.getElementById("sort-label");

  const tabDisponibilidad = document.getElementById("tab-disponibilidad");
  const tabTodos = document.getElementById("tab-todos");
  
  const viewDisponibilidad = document.getElementById("view-disponibilidad");
  const viewTodos = document.getElementById("view-todos");

  const listDisponibles = document.getElementById("list-disponibles");
  const listNoDisponibles = document.getElementById("list-no-disponibles");
  const listTodosSistema = document.getElementById("list-todos-sistema");
  const listTodosFuera = document.getElementById("list-todos-fuera");

  const emptyDisponibles = document.getElementById("empty-disponibles");
  const emptyNoDisponibles = document.getElementById("empty-no-disponibles");
  const emptyTodosSistema = document.getElementById("empty-todos-sistema");
  const emptyTodosFuera = document.getElementById("empty-todos-fuera");

  const badgeDisponibles = document.getElementById("badge-disponibles");
  const badgeNoDisponibles = document.getElementById("badge-no-disponibles");
  const badgeTodosSistema = document.getElementById("badge-todos-sistema");
  const badgeTodosFuera = document.getElementById("badge-todos-fuera");

  // Modal elements
  const refereeModal = document.getElementById("referee-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalClose = document.getElementById("modal-close");
  const refereeForm = document.getElementById("referee-form");
  const formId = document.getElementById("form-id");
  const formNombre = document.getElementById("form-nombre");
  const formApellido = document.getElementById("form-apellido");
  const formWhatsapp = document.getElementById("form-whatsapp");
  const formCategoria = document.getElementById("form-categoria");
  const formTalleCamiseta = document.getElementById("form-talle-camiseta");
  const formTalleShort = document.getElementById("form-talle-short");
  const formSabado = document.getElementById("form-sabado");
  const formDomingo = document.getElementById("form-domingo");
  const formEstado = document.getElementById("form-estado");
  const formSistema = document.getElementById("form-sistema");
  const formCancel = document.getElementById("form-cancel");

  // Local State
  let allArbitros = [];
  let activeTab = "disponibilidad";
  let searchQuery = "";
  let filterCategory = "";
  let sortDirection = "asc"; // 'asc' = Avanzado -> Inicial, 'desc' = Inicial -> Avanzado

  const orderCat = {
    AVANZADO: 1,
    INTERMEDIO: 2,
    PRINCIPAL_1: 3,
    PRINCIPAL_2: 4,
    PRINCIPAL_3: 5,
    PRINCIPAL_4: 6,
    ASISTENTE: 7,
    INCIAL: 8,
  };

  // Initialize
  fetchArbitros();

  // Event Listeners for Filters
  searchQueryInput.addEventListener("input", (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    renderAll();
  });

  filterCategorySelect.addEventListener("change", (e) => {
    filterCategory = e.target.value;
    renderAll();
  });

  btnToggleSort.addEventListener("click", () => {
    sortDirection = sortDirection === "asc" ? "desc" : "asc";
    
    // Update sort icon & label
    const icon = btnToggleSort.querySelector("i");
    if (sortDirection === "asc") {
      icon.className = "ti ti-sort-ascending";
      sortLabel.textContent = "Avanzado → Inicial";
    } else {
      icon.className = "ti ti-sort-descending";
      sortLabel.textContent = "Inicial → Asistente...";
    }
    renderAll();
  });

  // Tab switching
  tabDisponibilidad.addEventListener("click", () => {
    activeTab = "disponibilidad";
    tabDisponibilidad.classList.add("active");
    tabTodos.classList.remove("active");
    viewDisponibilidad.classList.remove("hidden");
    viewTodos.classList.add("hidden");
    renderAll();
  });

  tabTodos.addEventListener("click", () => {
    activeTab = "todos";
    tabTodos.classList.add("active");
    tabDisponibilidad.classList.remove("active");
    viewTodos.classList.remove("hidden");
    viewDisponibilidad.classList.add("hidden");
    renderAll();
  });

  // Action: Mark all unavailable
  btnMarkAllUnavailable.addEventListener("click", async () => {
    if (!confirm("¿Estás seguro de que deseas marcar a todos los árbitros como no disponibles?")) {
      return;
    }
    try {
      await arbitroService.updateDisponibilidadTotal({ loaderType: "global" });
      addToast("Todos los árbitros marcados como no disponibles.");
      await fetchArbitros(true);
    } catch (err) {
      console.error(err);
      addToast("Error al actualizar la disponibilidad de los árbitros.", "error");
    }
  });

  // Modal triggers
  btnNewReferee.addEventListener("click", () => {
    openModalForCreate();
  });

  modalClose.addEventListener("click", closeModal);
  formCancel.addEventListener("click", closeModal);

  refereeForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    await saveReferee();
  });

  // Fetch data
  async function fetchArbitros(force = false) {
    const cacheKey = "cached_arbitros";
    const cached = sessionStorage.getItem(cacheKey);

    if (!force && cached) {
      try {
        allArbitros = JSON.parse(cached);
        syncStoreState(allArbitros);
        renderAll();
        return;
      } catch (e) {
        console.warn("Error reading cached arbitros", e);
      }
    }

    try {
      const data = await arbitroService.getAll(0, 100, { loaderType: "global" });
      allArbitros = Array.isArray(data) ? data : data.content || [];
      sessionStorage.setItem(cacheKey, JSON.stringify(allArbitros));
      syncStoreState(allArbitros);
      renderAll();
    } catch (e) {
      console.error(e);
      addToast("Error al cargar la lista de árbitros.", "error");
    }
  }

  function syncStoreState(list) {
    // Keep central store in-sync
    state.arbitros = list.filter((a) => a.disponibleSabado || a.disponibleDomingo);
    state.arbitrosNoDisponibles = list.filter((a) => !a.disponibleSabado && !a.disponibleDomingo);
    updateState("arbitros", state.arbitros);
    updateState("arbitrosNoDisponibles", state.arbitrosNoDisponibles);
  }

  // Sorting helper
  function sortReferees(list) {
    return [...list].sort((a, b) => {
      const catA = orderCat[a.categoria] !== undefined ? orderCat[a.categoria] : 99;
      const catB = orderCat[b.categoria] !== undefined ? orderCat[b.categoria] : 99;
      return sortDirection === "asc" ? catA - catB : catB - catA;
    });
  }

  // Render method
  function renderAll() {
    // Compute total metrics (filtered only by system status, not inputs)
    const activeRefs = allArbitros.filter(a => a.estadoSistema !== false);
    const disponiblesTotal = activeRefs.filter(a => a.disponibleSabado || a.disponibleDomingo);
    const noDisponiblesTotal = activeRefs.filter(a => !a.disponibleSabado && !a.disponibleDomingo);
    const sabadoTotal = activeRefs.filter(a => a.disponibleSabado);
    const sundayTotal = activeRefs.filter(a => a.disponibleDomingo);

    // Update stats cards
    statTotal.textContent = allArbitros.length;
    statAvailable.textContent = disponiblesTotal.length;
    statUnavailable.textContent = noDisponiblesTotal.length;
    statSaturday.textContent = sabadoTotal.length;
    statSunday.textContent = sundayTotal.length;

    // Header count text
    topbarCount.textContent = `${disponiblesTotal.length} disponibles de ${allArbitros.length}`;
    btnMarkAllUnavailable.disabled = disponiblesTotal.length === 0;

    // Apply filters (search & category)
    const filteredList = allArbitros.filter((a) => {
      const nombreCompleto = `${a.nombre || ""} ${a.apellido || ""}`.toLowerCase();
      const matchesSearch = !searchQuery || nombreCompleto.includes(searchQuery);
      const matchesCategory = !filterCategory || a.categoria === filterCategory;
      return matchesSearch && matchesCategory;
    });

    const sortedList = sortReferees(filteredList);

    if (activeTab === "disponibilidad") {
      // 1. Filter active refs in system
      const systemRefs = sortedList.filter(a => a.estadoSistema !== false);
      const dispList = systemRefs.filter(a => a.disponibleSabado || a.disponibleDomingo);
      const noDispList = systemRefs.filter(a => !a.disponibleSabado && !a.disponibleDomingo);

      renderCardList(listDisponibles, dispList, emptyDisponibles);
      renderCardList(listNoDisponibles, noDispList, emptyNoDisponibles);

      badgeDisponibles.textContent = dispList.length;
      badgeNoDisponibles.textContent = noDispList.length;
    } else {
      // 2. Tab: All referees (including inactive ones)
      const inSystemList = sortedList.filter(a => a.estadoSistema !== false);
      const outSystemList = sortedList.filter(a => a.estadoSistema === false);

      renderCardList(listTodosSistema, inSystemList, emptyTodosSistema);
      renderCardList(listTodosFuera, outSystemList, emptyTodosFuera);

      badgeTodosSistema.textContent = inSystemList.length;
      badgeTodosFuera.textContent = outSystemList.length;
    }
  }

  function renderCardList(container, list, emptyState) {
    container.innerHTML = "";
    if (list.length === 0) {
      emptyState.classList.remove("hidden");
    } else {
      emptyState.classList.add("hidden");
      list.forEach((arbitro) => {
        const card = document.createElement("arbitro-card");
        card.setAttribute("arbitro-data", JSON.stringify(arbitro));
        
        // Listen to events from card component
        card.addEventListener("edit", (e) => openModalForEdit(e.detail.id));
        card.addEventListener("toggle-day", (e) => toggleDayAvailability(e.detail.id, e.detail.day));
        card.addEventListener("toggle-system", (e) => toggleSystemStatus(e.detail.id));
        card.addEventListener("delete", (e) => deleteReferee(e.detail.id));

        container.appendChild(card);
      });
    }
  }

  // Toggle Day Availability
  async function toggleDayAvailability(id, key) {
    const arb = allArbitros.find(a => a.idArbitro === id);
    if (!arb) return;

    const previousValue = arb[key];
    const updatedValue = !previousValue;

    // Optimistic Update
    arb[key] = updatedValue;
    renderAll();

    const dto = {
      estado: arb.estado !== undefined ? arb.estado : true,
      disponibleSabado: arb.disponibleSabado,
      disponibleDomingo: arb.disponibleDomingo,
    };

    try {
      const res = await arbitroService.updateDisponibilidad(id, dto, { loaderType: "silent" });
      if (res) {
        Object.assign(arb, res);
      }
      sessionStorage.setItem("cached_arbitros", JSON.stringify(allArbitros));
      syncStoreState(allArbitros);
      addToast("Disponibilidad de árbitro actualizada.");
      renderAll();
    } catch (err) {
      console.warn("Falla de red, revirtiendo disponibilidad optimista", err);
      arb[key] = previousValue;
      renderAll();
      addToast("Error al guardar disponibilidad en el servidor.", "error");
    }
  }

  // Toggle System Status
  async function toggleSystemStatus(id) {
    const arb = allArbitros.find(a => a.idArbitro === id);
    if (!arb) return;

    const previousValue = arb.estadoSistema !== false;
    const updatedValue = !previousValue;

    // Optimistic Update
    arb.estadoSistema = updatedValue;
    renderAll();

    const dto = {
      nombre: arb.nombre,
      apellido: arb.apellido,
      rol: arb.rol || "Árbitro Principal",
      whatsapp: arb.whatsapp || "",
      estado: arb.estado !== undefined ? arb.estado : true,
      disponibleSabado: arb.disponibleSabado !== undefined ? arb.disponibleSabado : true,
      disponibleDomingo: arb.disponibleDomingo !== undefined ? arb.disponibleDomingo : true,
      categoria: arb.categoria || "INCIAL",
      talleCamiseta: arb.talleCamiseta || "M",
      talleShort: arb.talleShort || "M",
      estadoSistema: updatedValue,
    };

    try {
      const res = await arbitroService.updateArbitro(id, dto, { loaderType: "silent" });
      if (res) {
        Object.assign(arb, res);
      }
      sessionStorage.setItem("cached_arbitros", JSON.stringify(allArbitros));
      syncStoreState(allArbitros);
      addToast("Estado en el sistema actualizado.");
      renderAll();
    } catch (err) {
      console.warn("Reverting system toggle due to error", err);
      arb.estadoSistema = previousValue;
      renderAll();
      addToast("Error al cambiar estado en sistema.", "error");
    }
  }

  // Delete Referee
  async function deleteReferee(id) {
    if (!confirm("¿Eliminar este árbitro?")) return;
    try {
      await arbitroService.deleteArbitro(id, { loaderType: "global" });
      allArbitros = allArbitros.filter(a => a.idArbitro !== id);
      sessionStorage.setItem("cached_arbitros", JSON.stringify(allArbitros));
      syncStoreState(allArbitros);
      addToast("Árbitro eliminado con éxito.");
      renderAll();
    } catch (err) {
      console.error(err);
      addToast("Error al eliminar árbitro.", "error");
    }
  }

  // Modals operations
  function openModalForCreate() {
    modalTitle.textContent = "Nuevo Árbitro";
    formId.value = "";
    formNombre.value = "";
    formApellido.value = "";
    formWhatsapp.value = "";
    formCategoria.value = "INCIAL";
    formTalleCamiseta.value = "M";
    formTalleShort.value = "M";
    formSabado.checked = true;
    formDomingo.checked = true;
    formEstado.checked = true;
    formSistema.checked = true;

    refereeModal.classList.remove("hidden");
  }

  function openModalForEdit(id) {
    const arb = allArbitros.find(a => a.idArbitro === id);
    if (!arb) return;

    modalTitle.textContent = "Editar Árbitro";
    formId.value = arb.idArbitro;
    formNombre.value = arb.nombre || "";
    formApellido.value = arb.apellido || "";
    formWhatsapp.value = arb.whatsapp || "";
    formCategoria.value = arb.categoria || "INCIAL";
    formTalleCamiseta.value = arb.talleCamiseta || "M";
    formTalleShort.value = arb.talleShort || "M";
    formSabado.checked = arb.disponibleSabado !== false;
    formDomingo.checked = arb.disponibleDomingo !== false;
    formEstado.checked = arb.estado !== false;
    formSistema.checked = arb.estadoSistema !== false;

    refereeModal.classList.remove("hidden");
  }

  function closeModal() {
    refereeModal.classList.add("hidden");
    refereeForm.reset();
  }

  async function saveReferee() {
    const id = formId.value;
    const isEdit = !!id;

    const dto = {
      nombre: formNombre.value.trim(),
      apellido: formApellido.value.trim(),
      rol: "Árbitro Principal",
      whatsapp: formWhatsapp.value.trim(),
      categoria: formCategoria.value,
      talleCamiseta: formTalleCamiseta.value,
      talleShort: formTalleShort.value,
      disponibleSabado: formSabado.checked,
      disponibleDomingo: formDomingo.checked,
      estado: formEstado.checked,
      estadoSistema: formSistema.checked,
    };

    if (!dto.nombre || !dto.apellido) {
      addToast("Ingresá nombre y apellido.", "error");
      return;
    }

    try {
      if (isEdit) {
        const updated = await arbitroService.updateArbitro(id, dto, { loaderType: "global" });
        const index = allArbitros.findIndex(a => String(a.idArbitro) === String(id));
        if (index !== -1) {
          allArbitros[index] = { ...allArbitros[index], ...dto, ...(updated || {}) };
        }
        addToast("Árbitro actualizado con éxito.");
      } else {
        const created = await arbitroService.createArbitro(dto, { loaderType: "global" });
        if (created && (created.idArbitro || created.id)) {
          allArbitros.push({ idArbitro: created.idArbitro || created.id, ...created });
        } else {
          allArbitros.push({ idArbitro: Date.now(), ...dto });
        }
        addToast("Árbitro creado con éxito.");
      }
      sessionStorage.setItem("cached_arbitros", JSON.stringify(allArbitros));
      syncStoreState(allArbitros);
      closeModal();
      renderAll();
    } catch (err) {
      console.error(err);
      addToast("Error al guardar cambios en el servidor.", "error");
    }
  }
});
