export const ROLES_ARB = [
  "Árbitro Principal",
  "Árbitro Asistente 1",
  "Árbitro Asistente 2",
  "Cuarto Árbitro",
  "VAR",
  "Asistente VAR",
];

export const ROLE_COLORS = [
  "#1D9E75",
  "#185FA5",
  "#BA7517",
  "#993C1D",
  "#534AB7",
  "#3B6D11",
];

// Simple in-memory global state for the active page
export const state = {
  canchas: [],
  arbitros: [],
  arbitrosNoDisponibles: [],
  designaciones: [],
  designacionesIncompletas: [],
  designacionesFinalizadas: [],
  designacionesAConfirmar: [],
  designacionesCanceladas: [],
  designacionesArbitros: [],
  toasts: [],
  loadingDesignaciones: false,
  loading: false,
  loadingTopBar: false,
  modal: null,
  form: {},
  selectedArbitros: [],
  suspensiones: [],
  arbitrosDesignadosMap: {},
  isAuthenticated: !!localStorage.getItem("jwt_token"),
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("jwt_token") || null,
  notifications: JSON.parse(localStorage.getItem("notifications") || "[]"),
  sidebarNotifications: [],
};

// Dispatch global state change event for simple components to listen to
export function updateState(key, value) {
  state[key] = value;
  document.dispatchEvent(new CustomEvent("state-changed", { detail: { key, value } }));
}
