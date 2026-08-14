import canchaService from "../services/canchaService.js";
import { addToast } from "../helpers.js";
import { state, updateState } from "../store.js";

// Import Web Component
import "../components/CanchaCard.js";

document.addEventListener("DOMContentLoaded", () => {
  const topbarCount = document.getElementById("topbar-count");
  const btnNewCourt = document.getElementById("btn-new-court");
  const emptyState = document.getElementById("empty-state");
  const canchasGrid = document.getElementById("canchas-grid");

  // Modal
  const courtModal = document.getElementById("court-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalClose = document.getElementById("modal-close");
  const courtForm = document.getElementById("court-form");
  const formId = document.getElementById("form-id");
  const formNombre = document.getElementById("form-nombre");
  const formCategoria = document.getElementById("form-categoria");
  const formCiudad = document.getElementById("form-ciudad");
  const formFueraDeJuego = document.getElementById("form-fuera-de-juego");
  const formNecesitaViaje = document.getElementById("form-necesita-viaje");
  const formEstado = document.getElementById("form-estado");
  const formCancel = document.getElementById("form-cancel");

  let allCanchas = [];

  fetchCanchas();

  // Listeners
  btnNewCourt.addEventListener("click", openModalForCreate);
  modalClose.addEventListener("click", closeModal);
  formCancel.addEventListener("click", closeModal);
  courtForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    await saveCourt();
  });

  async function fetchCanchas() {
    try {
      const res = await canchaService.getAll(0, 100);
      const data = Array.isArray(res) ? res : res.content || [];
      allCanchas = data.map((c) => ({
        id: c.idCancha || c.id,
        nombre: c.nombreCancha || c.nombre,
        ciudad: c.ciudad || "",
        partidos: c.partidos || 0,
        capacidad: c.capacidad || 0,
        categoria: c.categoria || "FUTBOL_11",
        fueraDeJuego: c.fueraDeJuego || false,
        necesitaViaje: c.necesitaViaje || false,
        estado: c.estado !== false,
      })).sort((a, b) => b.necesitaViaje - a.necesitaViaje);

      // Sync central store state
      state.canchas = allCanchas;
      updateState("canchas", allCanchas);

      renderAll();
    } catch (err) {
      console.error(err);
      addToast("Error al cargar la lista de canchas.", "error");
    }
  }

  function renderAll() {
    topbarCount.textContent = `${allCanchas.length} canchas registradas`;
    
    canchasGrid.innerHTML = "";
    if (allCanchas.length === 0) {
      emptyState.classList.remove("hidden");
    } else {
      emptyState.classList.add("hidden");
      allCanchas.forEach((cancha) => {
        const card = document.createElement("cancha-card");
        card.setAttribute("cancha-data", JSON.stringify(cancha));
        
        card.addEventListener("edit", (e) => openModalForEdit(e.detail.id));
        card.addEventListener("delete", (e) => toggleCourtActive(e.detail.id));

        canchasGrid.appendChild(card);
      });
    }
  }

  async function toggleCourtActive(id) {
    const cancha = allCanchas.find(c => c.id === id);
    if (!cancha) return;

    const action = cancha.estado ? "desactivar" : "activar";
    if (!confirm(`¿Estás seguro de que querés ${action} esta cancha?`)) return;

    const originalState = cancha.estado;
    cancha.estado = !cancha.estado;
    renderAll();

    try {
      const res = await canchaService.toggleEstado(id);
      cancha.estado = res && res.estado !== undefined ? res.estado : !originalState;
      addToast(`Cancha ${cancha.estado ? "activada" : "desactivada"} con éxito.`);
      renderAll();
    } catch (err) {
      console.warn("Reverting toggle due to API failure", err);
      cancha.estado = originalState;
      renderAll();
      addToast(`Cancha ${originalState ? "activada" : "desactivada"} localmente.`);
    }
  }

  function openModalForCreate() {
    modalTitle.textContent = "Nueva Cancha";
    formId.value = "";
    formNombre.value = "";
    formCategoria.value = "FUTBOL_11";
    formCiudad.value = "";
    formFueraDeJuego.checked = false;
    formNecesitaViaje.checked = false;
    formEstado.checked = true;

    courtModal.classList.remove("hidden");
  }

  function openModalForEdit(id) {
    const cancha = allCanchas.find(c => c.id === id);
    if (!cancha) return;

    modalTitle.textContent = "Editar Cancha";
    formId.value = cancha.id;
    formNombre.value = cancha.nombre || "";
    formCategoria.value = cancha.categoria || "FUTBOL_11";
    formCiudad.value = cancha.ciudad || "";
    formFueraDeJuego.checked = cancha.fueraDeJuego === true;
    formNecesitaViaje.checked = cancha.necesitaViaje === true;
    formEstado.checked = cancha.estado !== false;

    courtModal.classList.remove("hidden");
  }

  function closeModal() {
    courtModal.classList.add("hidden");
    courtForm.reset();
  }

  async function saveCourt() {
    const id = formId.value;
    const isEdit = !!id;

    const dto = {
      nombreCancha: formNombre.value.trim(),
      categoria: formCategoria.value,
      ciudad: formCiudad.value.trim(),
      fueraDeJuego: formFueraDeJuego.checked,
      necesitaViaje: formNecesitaViaje.checked,
      estado: formEstado.checked,
    };

    try {
      if (isEdit) {
        const updated = await canchaService.updateCancha(id, dto);
        const index = allCanchas.findIndex(c => c.id === id);
        if (index !== -1) {
          allCanchas[index] = { 
            ...allCanchas[index], 
            nombre: dto.nombreCancha, 
            ...dto, 
            ...(updated || {}) 
          };
        }
        addToast("Cancha actualizada con éxito.");
      } else {
        const created = await canchaService.createCancha(dto);
        const idNew = created.idCancha || created.id || Date.now();
        allCanchas.push({
          id: idNew,
          nombre: dto.nombreCancha,
          ciudad: dto.ciudad || "",
          partidos: 0,
          capacidad: 0,
          ...dto,
          ...(created || {}),
        });
        addToast("Cancha agregada con éxito.");
      }
      
      allCanchas.sort((a, b) => b.necesitaViaje - a.necesitaViaje);
      state.canchas = allCanchas;
      updateState("canchas", allCanchas);

      closeModal();
      renderAll();
    } catch (err) {
      console.error(err);
      addToast("Error al guardar la cancha en el servidor.", "error");
    }
  }
});
