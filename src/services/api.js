const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

export const registerCompany = async (userData) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error en el registro');
  return data;
};

export const loginCompany = async (credentials) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error al iniciar sesión');
  return data;
};

export const createIdea = async (ideaData) => {
  const res = await fetch(`${API_URL}/ideas`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(ideaData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error al guardar la idea');
  return data;
};

export const getMyIdeas = async () => {
  const res = await fetch(`${API_URL}/ideas`, {
    method: 'GET',
    headers: getHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error al obtener ideas');
  return data;
};

export const deleteIdea = async (id) => {
  const res = await fetch(`${API_URL}/ideas/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error al eliminar la idea');
  return data;
};