import api from "../api.js";

const getAll = (page = 0, size = 50) =>
  api.get("/canchas", { params: { page, size } }).then((r) => r.data);
const getActive = (page = 0, size = 50) =>
  api.get("/canchas/activas", { params: { page, size } }).then((r) => r.data);

const toggleEstado = (id) =>
  api.put(`/canchas/${id}/toggle`, null).then((r) => r.data);

const createCancha = (dto) => api.post("/canchas", dto).then((r) => r.data);
const updateCancha = (id, dto) =>
  api.put(`/canchas/actualizar/${id}`, dto).then((r) => r.data);
const getDesignacionesByCancha = (idCancha, page = 0, size = 10) =>
  api
    .get("/canchas/designaciones", { params: { idCancha, page, size } })
    .then((r) => r.data);

export default {
  getAll,
  getActive,
  toggleEstado,
  createCancha,
  updateCancha,
  getDesignacionesByCancha,
};
