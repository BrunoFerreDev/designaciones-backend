import api from "../api.js";
import { normalizeDesignacion } from "../helpers.js";

const unwrap = (r) => {
  const data = r && r.data !== undefined ? r.data : r;
  if (Array.isArray(data)) {
    return data.map(normalizeDesignacion);
  }
  if (data && data.content && Array.isArray(data.content)) {
    data.content = data.content.map(normalizeDesignacion);
    return data;
  }
  if (data && typeof data === "object" && (data.idDesignacion !== undefined || data.id !== undefined)) {
    return normalizeDesignacion(data);
  }
  return data;
};

const createDesignacion = (dto) => {
  const payload = {
    idCancha: dto.idCancha || dto.canchaId || (dto.cancha ? (dto.cancha.id || dto.cancha.idCancha) : null),
    fecha: dto.fecha || dto.fechaYHora,
    cantidadPartidos: dto.cantidadPartidos !== undefined ? dto.cantidadPartidos : 1,
    etapaCampeonato: dto.etapaCampeonato || dto.etapa || "FECHA_NORMAL",
    detalle: dto.detalle !== undefined ? dto.detalle : (dto.detalleDesignacion || ""),
    editable: dto.editable !== undefined ? dto.editable : true,
    estadoDesignacion: dto.estadoDesignacion !== undefined ? dto.estadoDesignacion : 0,
  };
  return api.post("/designaciones", payload).then(unwrap);
};

const crear = (dto) => createDesignacion(dto);

const getAll = (page = 0, size = 50) =>
  api.get("/designaciones", { params: { page, size } }).then(unwrap);

const getById = (idDesignacion) =>
  api.get(`/designaciones/${idDesignacion}`).then(unwrap);

const getCompletas = (page = 0, size = 50) =>
  api.get("/designaciones/completas", { params: { page, size } }).then(unwrap);

const getDesignados = (idDesignacion, config = {}) =>
  api.get("/designados", { params: { idDesignacion }, ...config }).then((r) => r.data || r);

const getByEstado = (estado, page = 0, size = 50) => {
  let estadoNum = estado;
  if (estado === "INCOMPLETA") estadoNum = 0;
  else if (estado === "COMPLETA" || estado === "A_CONFIRMAR") estadoNum = 1;
  else if (estado === "FINALIZADA") estadoNum = 2;
  else if (estado === "CANCELADA") estadoNum = 3;
  return api.get("/designaciones", { params: { estado: estadoNum, page, size } }).then(unwrap);
};

const getIncompletas = (page = 0, size = 50) => getByEstado(0, page, size);
const getFinalizadas = (page = 0, size = 50) => getByEstado(2, page, size);

const deleteDesignacion = (id) =>
  api.delete(`/designaciones/${id}`).then((r) => r.data || r);

const eliminar = (id) => deleteDesignacion(id);

const asignarArbitrosAutomaticamente = (id) =>
  api.post(`/designaciones/${id}/asignar-automatico`).then(unwrap);

const getArbitrosDesignados = (id) =>
  api.get("/designados", { params: { idDesignacion: id } }).then((r) => r.data || r);

const asignarArbitroManual = (idDesignacion, idArbitro) =>
  api.post(`/designaciones/${idDesignacion}/arbitros`, null, { params: { idArbitro } }).then(unwrap);

const forzarAsignarArbitroManual = (idDesignacion, idArbitro) =>
  api.post(`/designaciones/${idDesignacion}/arbitros`, null, { params: { idArbitro, forzar: true } }).then(unwrap);

const asignarArbitroHistorico = (idDesignacion, idArbitro) =>
  api.post(`/designaciones/${idDesignacion}/arbitros`, null, { params: { idArbitro, historico: true } }).then(unwrap);

const quitarArbitroManual = (idDesignacion, idArbitro) =>
  api.delete(`/designaciones/${idDesignacion}/arbitros/${idArbitro}`).then(unwrap);

const finalizarDesignacion = (idDesignacion, detalle) =>
  api.put(`/designaciones/${idDesignacion}/finalizar`, null, {
    params: detalle ? { detalle } : undefined,
  }).then(unwrap);

const aceptarDesignacion = (idDesignacion) =>
  api.put(`/designaciones/${idDesignacion}/aceptar`).then(unwrap);

const reprogramarDesignacion = (idDesignacion) =>
  api.put(`/designaciones/${idDesignacion}/reprogramar`).then(unwrap);

const cancelarDesignacion = (idDesignacion, detalle) =>
  api.put(`/designaciones/${idDesignacion}/cambiar-cancelado`, null, {
    params: detalle ? { detalle } : undefined,
  }).then(unwrap);

const cambiarEstado = (idDesignacion, nuevoEstado, detalle) => {
  if (nuevoEstado === "FINALIZADA" || nuevoEstado === 2) return finalizarDesignacion(idDesignacion, detalle);
  if (nuevoEstado === "CONFIRMADA" || nuevoEstado === "A_CONFIRMAR" || nuevoEstado === "ACEPTADA" || nuevoEstado === 1) return aceptarDesignacion(idDesignacion);
  if (nuevoEstado === "CANCELADA" || nuevoEstado === "SUSPENDIDA" || nuevoEstado === 3 || nuevoEstado === 4) return cancelarDesignacion(idDesignacion, detalle);
  if (nuevoEstado === "REPROGRAMAR") return reprogramarDesignacion(idDesignacion);
  return Promise.resolve();
};

const designarListaArbitrosADesignacion = (idDesignacion, idsArbitros) =>
  api.post(`/designaciones/${idDesignacion}/arbitros/bulk`, idsArbitros).then(unwrap);

const getEstadisticasComparacion = (idsArbitros, mesInicio = 1, mesFin = 12) =>
  api.get("/designaciones/estadisticas/comparacion", {
    params: { idsArbitros, mesInicio, mesFin },
  }).then((r) => r.data || r);

const buscarPorRango = (inicio, fin) =>
  api.get("/designaciones/buscar", { params: { inicio, fin } }).then(unwrap);

const getByFechaRange = (inicio, fin) => buscarPorRango(inicio, fin);

const buscarPorFecha = (fecha) =>
  api.get("/designaciones/buscar", { params: { fecha } }).then(unwrap);

const getByFecha = (fecha) => buscarPorFecha(fecha);

const buscarPorMes = (mes, anio) =>
  api.get("/designaciones/mes", { params: { mes, anio } }).then(unwrap);

const getByMes = (mes, anio) => buscarPorMes(mes, anio);

const getByArbitro = (idArbitro, page = 0, size = 20) =>
  api.get("/arbitros/designaciones", { params: { idArbitro, page, size } }).then(unwrap);

const getByCancha = (idCancha, page = 0, size = 20) =>
  api.get("/canchas/designaciones", { params: { idCancha, page, size } }).then(unwrap);

const actualizarDesignacion = (idDesignacion, dto) => {
  const payload = {
    idCancha: dto.idCancha || dto.canchaId || (dto.cancha ? (dto.cancha.id || dto.cancha.idCancha) : null),
    fecha: dto.fecha || dto.fechaYHora,
    cantidadPartidos: dto.cantidadPartidos !== undefined ? dto.cantidadPartidos : 1,
    etapaCampeonato: dto.etapaCampeonato || dto.etapa || "FECHA_NORMAL",
    detalle: dto.detalle !== undefined ? dto.detalle : (dto.detalleDesignacion || ""),
    editable: dto.editable !== undefined ? dto.editable : true,
    estadoDesignacion: dto.estadoDesignacion !== undefined ? dto.estadoDesignacion : 0,
  };
  return api.put(`/designaciones/${idDesignacion}`, payload).then(unwrap);
};

const actualizar = (idDesignacion, dto) => actualizarDesignacion(idDesignacion, dto);

const actualizarMontoPercibido = (idDesignado, nuevoMonto) =>
  api.put(`/designados/${idDesignado}/actualizar-monto-percibido`, null, {
    params: { nuevoMonto },
  }).then((r) => r.data || r);

const actualizarMontoATodos = (idDesignacion, montoPorArbitro) =>
  api.put(`/designados/actualizar-monto-a-designados`, null, {
    params: { idDesignacion, montoPorArbitro },
  }).then((r) => r.data || r);

const ultimasDesignaciones = () =>
  api.get("/designaciones/ultimas-designaciones").then(unwrap);

const getUltimas = () => ultimasDesignaciones();

const vincularArancel = (idDesignacion) =>
  api.post(`/designaciones/${idDesignacion}/sincronizar-arancel`).then((r) => r.data || r);

export default {
  createDesignacion,
  crear,
  getAll,
  getById,
  getByEstado,
  getIncompletas,
  getCompletas,
  getFinalizadas,
  getDesignados,
  deleteDesignacion,
  eliminar,
  asignarArbitrosAutomaticamente,
  getArbitrosDesignados,
  asignarArbitroManual,
  forzarAsignarArbitroManual,
  asignarArbitroHistorico,
  quitarArbitroManual,
  finalizarDesignacion,
  aceptarDesignacion,
  reprogramarDesignacion,
  cancelarDesignacion,
  cambiarEstado,
  designarListaArbitrosADesignacion,
  buscarPorRango,
  getByFechaRange,
  buscarPorFecha,
  getByFecha,
  buscarPorMes,
  getByMes,
  getByArbitro,
  getByCancha,
  actualizarDesignacion,
  actualizar,
  actualizarMontoPercibido,
  actualizarMontoATodos,
  getEstadisticasComparacion,
  ultimasDesignaciones,
  getUltimas,
  vincularArancel,
};
