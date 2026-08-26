import api from "../api.js";

const unwrap = (r) => {
  const data = r && r.data !== undefined ? r.data : r;
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.content)) return data.content;
  return data || [];
};

const getAll = (page = 0, size = 100) =>
  api.get("/canchas", { params: { page, size } }).then(unwrap);

const getActive = (page = 0, size = 100) =>
  api.get("/canchas/activas", { params: { page, size } }).then(unwrap);

const toggleEstado = (id) =>
  api.put(`/canchas/${id}/toggle`, null).then((r) => r.data || r);

const createCancha = (dto) => api.post("/canchas", dto).then((r) => r.data || r);
const updateCancha = (id, dto) =>
  api.put(`/canchas/actualizar/${id}`, dto).then((r) => r.data || r);

const getDesignacionesByCancha = (idCancha, page = 0, size = 50) =>
  api
    .get("/canchas/designaciones", { params: { idCancha, page, size } })
    .then((r) => r.data || r);

export default {
  getAll,
  getActive,
  toggleEstado,
  createCancha,
  updateCancha,
  getDesignacionesByCancha,
};
