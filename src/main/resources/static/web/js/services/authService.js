import api from '../api.js';

export const login = async (whatsapp, contrasenia) => {
  const response = await api.post('/auth/login', {
    whatsapp,
    contrasenia
  });
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};
