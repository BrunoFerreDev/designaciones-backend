import api from "../api.js";
import { normalizeDesignado } from "../helpers.js";

const unwrapDesignados = (r) => {
  const data = r && r.data !== undefined ? r.data : r;
  if (Array.isArray(data)) return data.map(normalizeDesignado);
  if (data && Array.isArray(data.content)) return data.content.map(normalizeDesignado);
  if (data && typeof data === "object" && (data.idDesignados !== undefined || data.idDesignado !== undefined)) {
    return normalizeDesignado(data);
  }
  return data || [];
};

const getByDesignacion = (idDesignacion) =>
  api.get("/designados", { params: { idDesignacion } }).then(unwrapDesignados);

const eliminarDesignado = (idDesignacion, idDesignado) =>
  api.delete("/designados/eliminar-designado", {
    params: { idDesignacion, idDesignado },
  }).then((r) => r.data);

const eliminar = (idDesignacion, idDesignado) => {
  if (typeof idDesignacion === "object") {
    return eliminarDesignado(idDesignacion.idDesignacion, idDesignacion.idDesignado);
  }
  if (!idDesignado) {
    // Single arg fallback: idDesignado only
    return api.delete(`/designados/${idDesignacion}`).then((r) => r.data);
  }
  return eliminarDesignado(idDesignacion, idDesignado);
};

const crear = (dto) =>
  api.post(`/designaciones/${dto.idDesignacion}/asignar-arbitro`, null, {
    params: { idArbitro: dto.idArbitro },
  }).then((r) => r.data);

const actualizarMontoPercibido = (idDesignado, nuevoMonto) =>
  api.put(`/designados/${idDesignado}/actualizar-monto-percibido`, null, {
    params: { nuevoMonto },
  }).then((r) => r.data);

const actualizarMonto = (idDesignado, nuevoMonto) =>
  actualizarMontoPercibido(idDesignado, nuevoMonto);

const actualizarMontoATodos = (idDesignacion, montoPorArbitro) =>
  api.put("/designados/actualizar-monto-a-designados", null, {
    params: { idDesignacion, montoPorArbitro },
  }).then((r) => r.data);

const actualizarCantidadPartidos = (idDesignacion, idDesignado, cantidad) =>
  api.put("/designados/actualizar-cantidad-partidos", null, {
    params: { idDesignacion, idDesignado, cantidad },
  }).then((r) => r.data);

export default {
  getByDesignacion,
  eliminarDesignado,
  eliminar,
  crear,
  actualizarMontoPercibido,
  actualizarMonto,
  actualizarMontoATodos,
  actualizarCantidadPartidos,
};
