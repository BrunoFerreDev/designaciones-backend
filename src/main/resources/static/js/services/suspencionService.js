import api from "../api.js";

const create = (idArbitro, dto) => {
  if (typeof idArbitro === "object") {
    dto = idArbitro;
    idArbitro = dto.idArbitro || dto.arbitro;
  }
  return api.post(`/arbitros/${idArbitro}/suspenciones`, dto).then((r) => r.data);
};

const getByArbitro = (idArbitro, page = 0, size = 10) =>
  api
    .get(`/arbitros/${idArbitro}/suspenciones`, { params: { page, size } })
    .then((r) => r.data);

const getAll = (page = 0, size = 100) =>
  api
    .get("/arbitros/suspenciones", { params: { page, size } })
    .then((r) => r.data);

const deleteSuspencion = (idSuspencion) =>
  api.delete(`/arbitros/suspenciones/${idSuspencion}`).then((r) => r.data);

export default {
  create,
  getByArbitro,
  getAll,
  deleteSuspencion,
};
