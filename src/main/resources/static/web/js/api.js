const BASE_URL = window.location.origin;
//const BASE_URL = 'http://localhost:8080';
// Wrapper de fetch para API
async function apiCall(endpoint, options = {}) {
  const url = new URL(BASE_URL+endpoint);
  if (options.params) {
    Object.keys(options.params).forEach(key => {
      if (options.params[key] !== undefined && options.params[key] !== null) {
        url.searchParams.append(key, options.params[key]);
      }
    });
  }

  const token = localStorage.getItem("jwt");
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const fetchOptions = {
    method: options.method || 'GET',
    headers
  };

  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, fetchOptions);
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem("jwt");
    if (!window.location.pathname.endsWith("login.html")) {
      window.location.href = "login.html";
    }
    throw new Error("Sesión vencida o no autorizada");
  }
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  if (response.status === 204) return null;
  return await response.json();
}

window.authService = {
  login: (whatsapp, contrasenia) => apiCall("/auth/login", { method: 'POST', body: { whatsapp, contrasenia } }),
  logout: () => {
    const token = localStorage.getItem("jwt");
    if (token) {
      return apiCall("/auth/logout", { method: 'POST' })
        .finally(() => {
          localStorage.removeItem("jwt");
          window.location.href = "login.html";
        });
    } else {
      localStorage.removeItem("jwt");
      window.location.href = "login.html";
      return Promise.resolve();
    }
  }
};

// Servicios adjuntos al ámbito global
window.arbitroService = {
  getAll: (page = 0, size = 100) => apiCall("/arbitros", { params: { page, size } }),
  getNoDisponibles: (page = 0, size = 100) => apiCall("/arbitros/no-disponibles", { params: { page, size } }),
  createArbitro: (dto) => apiCall("/arbitros", { method: 'POST', body: dto }),
  updateArbitro: (id, dto) => apiCall(`/arbitros/${id}`, { method: 'PUT', body: dto }),
  updateDisponibilidad: (id, dto) => apiCall(`/arbitros/${id}/disponibilidad`, { method: 'PUT', body: dto }),
  updateDisponibilidadTotal: () => apiCall("/arbitros/modificar-disponibilidad-total", { method: 'PUT' }),
  deleteArbitro: (id) => apiCall(`/arbitros/${id}`, { method: 'DELETE' }),
};

window.canchaService = {
  getAll: (page = 0, size = 100) => apiCall("/canchas", { params: { page, size } }),
  createCancha: (dto) => apiCall("/canchas", { method: 'POST', body: dto }),
};

window.designacionService = {
  createDesignacion: (dto) => apiCall("/designaciones", { method: 'POST', body: dto }),
  getByEstado: (estado, page = 0, size = 100) => apiCall("/designaciones", { params: { estado, page, size } }),
  getDesignados: (idDesignacion) => apiCall("/designados", { params: { idDesignacion } }),
  deleteDesignacion: (id) => apiCall(`/designaciones/${id}`, { method: 'DELETE' }),
  actualizarDesignacion: (id, dto) => apiCall(`/designaciones/${id}`, { method: 'PUT', body: dto }),
  asignarArbitrosAutomaticamente: (id) => apiCall(`/designaciones/${id}/asignar-automatico`, { method: 'POST' }),
  asignarArbitroManual: (idDesignacion, idArbitro) => apiCall(`/designaciones/${idDesignacion}/asignar-arbitro`, { method: 'POST', params: { idArbitro } }),
  quitarArbitroManual: (idDesignacion, idArbitro) => apiCall(`/designaciones/${idDesignacion}/arbitros/${idArbitro}`, { method: 'DELETE' }),
  finalizarDesignacion: (id) => apiCall(`/designaciones/${id}/finalizar`, { method: 'PUT' }),
  aceptarDesignacion: (id) => apiCall(`/designaciones/${id}/aceptar`, { method: 'PUT' }),
  cancelarDesignacion: (id) => apiCall(`/designaciones/${id}/cambiar-cancelado`, { method: 'PUT' }),
  reprogramarDesignacion: (id) => apiCall(`/designaciones/${id}/reprogramar`, { method: 'PUT' }),
  actualizarMontoPercibido: (idDesignado, nuevoMonto) => apiCall(`/designados/${idDesignado}/actualizar-monto-percibido`, { method: 'PUT', params: { nuevoMonto } }),
  actualizarMontoATodos: (idDesignacion, montoPorArbitro) => apiCall(`/designados/actualizar-monto-a-designados`, { method: 'PUT', params: { idDesignacion, montoPorArbitro } }),
  buscarPorRango: (inicio, fin) => apiCall("/designaciones/buscar", { params: { inicio, fin } }),
  buscarPorFecha: (fecha) => apiCall("/designaciones/obtener-por-fecha", { params: { fecha } }),
  buscarPorMes: (mes, anio) => apiCall("/designaciones/mes", { params: { mes, anio } }),
  designarListaArbitrosADesignacion: (id, ids) => apiCall(`/designaciones/${id}/arbitros/bulk`, { method: 'POST', body: ids }),
};

window.estadisticasService = {
  getEstadisticas: (inicio, fin) => apiCall("/designaciones/estadisticas", { params: { inicio, fin } }),
  getEstadisticasArbitro: (id, inicio, fin) => apiCall(`/designaciones/estadisticas/arbitro/${id}`, { params: { inicio, fin } }),
};

window.suspencionService = {
  create: (dto) => apiCall("/arbitros/cargar-suspencion", { method: 'POST', body: dto }),
  getAll: (page = 0, size = 100) => apiCall("/arbitros/suspenciones", { params: { page, size } }),
  deleteSuspencion: (id) => apiCall(`/arbitros/suspenciones/${id}`, { method: 'DELETE' }),
};
