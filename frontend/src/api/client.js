const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Cliente HTTP unificado para la API REST.
 * Adjunta token de localStorage y maneja redireccion en respuestas 401.
 */
async function request(endpoint, options = {}) {
  const url = new URL(
    endpoint.startsWith('/') ? `${API_URL}${endpoint}` : `${API_URL}/${endpoint}`
  );

  if (options.params) {
    Object.entries(options.params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        url.searchParams.append(key, val);
      }
    });
  }

  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const config = {
    method: options.method || 'GET',
    headers,
    ...(options.body ? { body: JSON.stringify(options.body) } : {})
  };

  try {
    const res = await fetch(url.toString(), config);

    // Manejo de token expirado o no autorizado (401)
    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth:unauthorized'));

      // Si no estamos en login, redirigir
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMessage =
        data.message || data.error || (data.details ? data.details.join(', ') : 'Error en la solicitud');
      const error = new Error(errorMessage);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    throw err;
  }
}

export const api = {
  get: (endpoint, params) => request(endpoint, { method: 'GET', params }),
  post: (endpoint, body) => request(endpoint, { method: 'POST', body }),
  put: (endpoint, body) => request(endpoint, { method: 'PUT', body }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' })
};

export default api;
