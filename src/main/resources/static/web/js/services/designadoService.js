import api from "../api.js";

const getByDesignacion = (idDesignacion) =>
  api.get("/designados", { params: { idDesignacion } }).then((r) => r.data);

const eliminarDesignado = (idDesignacion, idDesignado) =>
  api
    .delete("/designados/eliminar-designado", {
      params: { idDesignacion, idDesignado },
    })
    .then((r) => r.data);

const actualizarMontoPercibido = (idDesignado, nuevoMonto) =>
  api
    .put(`/designados/${idDesignado}/actualizar-monto-percibido`, null, {
      params: { nuevoMonto },
    })
    .then((r) => r.data);

const actualizarMontoATodos = (idDesignacion, montoPorArbitro) =>
  api
    .put("/designados/actualizar-monto-a-designados", null, {
      params: { idDesignacion, montoPorArbitro },
    })
    .then((r) => r.data);

const actualizarCantidadPartidos = (idDesignacion, idDesignado, cantidad) =>
  api
    .put("/designados/actualizar-cantidad-partidos", null, {
      params: { idDesignacion, idDesignado, cantidad },
    })
    .then((r) => r.data);

export default {
  getByDesignacion,
  eliminarDesignado,
  actualizarMontoPercibido,
  actualizarMontoATodos,
  actualizarCantidadPartidos,
};
