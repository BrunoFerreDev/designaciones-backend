import api from "../api.js";

const getAll = (page = 0, size = 30) =>
  api.get("/aranceles", { params: { page, size } }).then((r) => r.data);

const createArancel = (dto) =>
  api.post("/aranceles", dto).then((r) => r.data);

const updateArancel = (idArancel, dto) =>
  api.put("/aranceles/actualizar", dto, { params: { idArancel } }).then((r) => r.data);

export default {
  getAll,
  createArancel,
  updateArancel,
};
