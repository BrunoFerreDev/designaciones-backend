import api, { getDeduplicated } from "../api.js";

const sortReferees = (data) => {
  if (!data) return data;
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

  const getSorted = (list) => {
    if (!Array.isArray(list)) return list;
    return [...list].sort((a, b) => {
      const valA = orderCat[a.categoria] !== undefined ? orderCat[a.categoria] : 99;
      const valB = orderCat[b.categoria] !== undefined ? orderCat[b.categoria] : 99;
      return valA - valB;
    });
  };

  if (Array.isArray(data)) {
    return getSorted(data);
  }
  if (data.value && Array.isArray(data.value)) {
    return getSorted(data.value);
  }
  if (data.content && Array.isArray(data.content)) {
    return getSorted(data.content);
  }
  return data;
};

const getAll = (page = 0, size = 50, config = {}) =>
  getDeduplicated("/arbitros", { params: { page, size }, ...config }).then((r) => sortReferees(r.data));

const getDisponibles = (page = 0, size = 50, config = {}) =>
  getDeduplicated("/arbitros/traer-disponibles", { params: { page, size }, ...config })
    .then((r) => sortReferees(r.data));

const getNoDisponibles = (page = 0, size = 50, config = {}) =>
  getDeduplicated("/arbitros/no-disponibles", { params: { page, size }, ...config })
    .then((r) => sortReferees(r.data));

const createArbitro = (dto, config = {}) => api.post("/arbitros", dto, config).then((r) => r.data);

const updateArbitro = (id, dto, config = {}) =>
  api.put(`/arbitros/${id}`, dto, config).then((r) => r.data);

const updateDisponibilidad = (id, dto, config = { loaderType: "silent" }) =>
  api.put(`/arbitros/${id}/disponibilidad`, dto, config).then((r) => r.data);

const updateDisponibilidadTotal = (config = {}) =>
  api.put("/arbitros/modificar-disponibilidad-total", {}, config).then((r) => r.data);

const deleteArbitro = (id, config = {}) => api.delete(`/arbitros/${id}`, config).then((r) => r.data);

const getSuspencionesByArbitro = (idArbitro, page = 0, size = 10, config = {}) =>
  getDeduplicated(`/arbitros/${idArbitro}/suspenciones`, { params: { page, size }, ...config })
    .then((r) => r.data);

const createSuspencionByArbitro = (idArbitro, dto, config = {}) =>
  api.post(`/arbitros/${idArbitro}/suspenciones`, dto, config).then((r) => r.data);

const getSuspenciones = (page = 0, size = 10, config = {}) =>
  getDeduplicated("/arbitros/suspenciones", { params: { page, size }, ...config }).then((r) => r.data);

const deleteSuspencion = (idSuspencion, config = {}) =>
  api.delete(`/arbitros/suspenciones/${idSuspencion}`, config).then((r) => r.data);

const getDesignacionesByArbitro = (idArbitro, page = 0, size = 10, config = {}) =>
  getDeduplicated("/arbitros/designaciones", { params: { idArbitro, page, size }, ...config })
    .then((r) => r.data);

export default {
  getAll,
  getDisponibles,
  getNoDisponibles,
  createArbitro,
  updateArbitro,
  updateDisponibilidad,
  updateDisponibilidadTotal,
  deleteArbitro,
  getSuspencionesByArbitro,
  createSuspencionByArbitro,
  getSuspenciones,
  deleteSuspencion,
  getDesignacionesByArbitro,
};
