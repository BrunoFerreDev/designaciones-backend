import api from "../api.js";

const getAll = (page = 0, size = 30) =>
  api.get("/aranceles", { params: { page, size } }).then((r) => r.data);

const createArancel = (dto) =>
  api.post("/aranceles", dto).then((r) => r.data);

const updateArancel = (idArancel, dto) =>
  api.put("/aranceles/actualizar", dto, { params: { idArancel } }).then((r) => r.data);

const getByCancha = (idCancha) =>
  api.get(`/aranceles/cancha/${idCancha}`).then((r) => r.data);

const calcularArancel = (idCancha, cantidadPartidos) =>
  api
    .get("/aranceles/calcular", { params: { idCancha, cantidadPartidos } })
    .then((r) => r.data);

export default {
  getAll,
  createArancel,
  updateArancel,
  getByCancha,
  calcularArancel,
};
