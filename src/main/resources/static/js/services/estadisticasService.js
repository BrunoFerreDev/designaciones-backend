import api, { getDeduplicated } from "../api.js";

const getEstadisticas = (inicio, fin, orden = "DESC", config = {}) => {
  const params = {};
  if (inicio) params.inicio = inicio;
  if (fin) params.fin = fin;
  if (orden) params.orden = orden;
  return getDeduplicated("/designaciones/estadisticas", { params, loaderType: "topbar", ...config }).then((r) => r.data);
};

const getEstadisticasArbitro = async (idArbitro, inicio, fin, orden = "DESC", page = 0, size = 10, config = {}) => {
  const params = { page, size };
  if (inicio) params.inicio = inicio;
  if (fin) params.fin = fin;
  if (orden) params.orden = orden;
  return await getDeduplicated(`/designaciones/estadisticas/arbitro/${idArbitro}`, { params, loaderType: "topbar", ...config })
    .then((r) => r.data);
};

const getComparacionArbitros = (idsArbitros, mesInicio, mesFin, config = {}) => {
  const params = { idsArbitros: idsArbitros.join(",") };
  if (mesInicio !== undefined && mesInicio !== null) params.mesInicio = mesInicio;
  if (mesFin !== undefined && mesFin !== null) params.mesFin = mesFin;
  return getDeduplicated("/designaciones/estadisticas/comparacion", { params, loaderType: "topbar", ...config }).then((r) => r.data);
};

export default {
  getEstadisticas,
  getEstadisticasArbitro,
  getComparacionArbitros,
};
