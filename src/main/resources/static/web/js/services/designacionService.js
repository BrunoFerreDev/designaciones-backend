import api from "../api.js";

const createDesignacion = (dto) =>
  api.post("/designaciones", dto).then((r) => r.data);
const getAll = (page = 0, size = 50) =>
  api.get("/designaciones", { params: { page, size } }).then((r) => r.data);
const getCompletas = (page = 0, size = 50) =>
  api
    .get("/designaciones/completas", { params: { page, size } })
    .then((r) => r.data);
const getDesignados = (idDesignacion, config = {}) =>
  api.get("/designados", { params: { idDesignacion }, ...config }).then((r) => {
    console.log(r.data);
    return r.data;
  });
const getByEstado = (estado, page = 0, size = 50) =>
  api
    .get("/designaciones", { params: { estado, page, size } })
    .then((r) => r.data);
const getIncompletas = (page = 0, size = 50) => getByEstado(0, page, size);
const getFinalizadas = (page = 0, size = 50) => getByEstado(2, page, size);
const deleteDesignacion = (id) =>
  api.delete(`/designaciones/${id}`).then((r) => r.data);
const asignarArbitrosAutomaticamente = (id) =>
  api.post(`/designaciones/${id}/asignar-automatico`).then((r) => r.data);
const getArbitrosDesignados = (id) =>
  api.get("/designados", { params: { idDesignacion: id } }).then((r) => r.data);
const asignarArbitroManual = (idDesignacion, idArbitro, tipo = 1) =>
  api
    .post(`/designaciones/${idDesignacion}/asignar-arbitro`, null, {
      params: { idArbitro },
    })
    .then((r) => r.data);
const quitarArbitroManual = (idDesignacion, idArbitro) =>
  api
    .delete(`/designaciones/${idDesignacion}/arbitros/${idArbitro}`)
    .then((r) => r.data);
const finalizarDesignacion = (idDesignacion) =>
  api.put(`/designaciones/${idDesignacion}/finalizar`).then((r) => r.data);
const designarListaArbitrosADesignacion = (idDesignacion, idsArbitros) =>
  api
    .post(`/designaciones/${idDesignacion}/arbitros/bulk`, idsArbitros)
    .then((r) => r.data);
const asignarArbitroHistorico = (idDesignacion, idArbitro) =>
  api
    .post(`/designaciones/${idDesignacion}/asignar-arbitro/historico`, null, {
      params: { idArbitro },
    })
    .then((r) => r.data);
const cancelarDesignacion = (idDesignacion, detalle) =>
  api
    .put(`/designaciones/${idDesignacion}/cambiar-cancelado`, null, {
      params: detalle ? { detalle } : undefined,
    })
    .then((r) => r.data);
const getEstadisticasComparacion = (idsArbitros, mesInicio = 1, mesFin = 12) =>
  api
    .get("/designaciones/estadisticas/comparacion", {
      params: { idsArbitros, mesInicio, mesFin },
    })
    .then((r) => r.data);
const buscarPorRango = (inicio, fin) =>
  api
    .get("/designaciones/buscar", { params: { inicio, fin } })
    .then((r) => r.data);
const buscarPorFecha = (fecha) =>
  api
    .get("/designaciones/obtener-por-fecha", { params: { fecha } })
    .then((r) => r.data);
const buscarPorMes = (mes, anio) =>
  api.get("/designaciones/mes", { params: { mes, anio } }).then((r) => r.data);
const actualizarDesignacion = (idDesignacion, dto) =>
  api.put(`/designaciones/${idDesignacion}`, dto).then((r) => r.data);
const aceptarDesignacion = (idDesignacion) =>
  api.put(`/designaciones/${idDesignacion}/aceptar`).then((r) => r.data);
const reprogramarDesignacion = (idDesignacion) =>
  api.put(`/designaciones/${idDesignacion}/reprogramar`).then((r) => r.data);
const actualizarMontoPercibido = (idDesignado, nuevoMonto) =>
  api
    .put(`/designados/${idDesignado}/actualizar-monto-percibido`, null, {
      params: { nuevoMonto },
    })
    .then((r) => r.data);
const actualizarMontoATodos = (idDesignacion, montoPorArbitro) =>
  api
    .put(`/designados/actualizar-monto-a-designados`, null, {
      params: { idDesignacion, montoPorArbitro },
    })
    .then((r) => r.data);
const ultimasDesignaciones = () => api.get("/designaciones/ultimas-designaciones").then((r) => r.data);

export default {
  createDesignacion,
  getAll,
  getByEstado,
  getIncompletas,
  getCompletas,
  getFinalizadas,
  getDesignados,
  deleteDesignacion,
  asignarArbitrosAutomaticamente,
  getArbitrosDesignados,
  asignarArbitroManual,
  asignarArbitroHistorico,
  quitarArbitroManual,
  finalizarDesignacion,
  cancelarDesignacion,
  designarListaArbitrosADesignacion,
  buscarPorRango,
  buscarPorFecha,
  buscarPorMes,
  actualizarDesignacion,
  aceptarDesignacion,
  reprogramarDesignacion,
  actualizarMontoPercibido,
  actualizarMontoATodos,
  getEstadisticasComparacion,
  ultimasDesignaciones,
};
