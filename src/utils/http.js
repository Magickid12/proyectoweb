/**
 * Servicio HTTP Base
 * Wrapper para fetch API con manejo de autenticación y errores
 */

import { API_CONFIG } from '@/config/api';

/**
 * Obtiene el token del localStorage
 */
function getToken() {
  return localStorage.getItem('evconnect_token');
}

/**
 * Construye los headers con autenticación
 */
function buildHeaders(customHeaders = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Maneja errores de la API
 */
async function handleResponse(response) {
  let data;
  
  try {
    data = await response.json();
  } catch (e) {
    data = { message: 'Respuesta inválida del servidor' };
  }

  if (!response.ok) {
    // Si es 401 y NO es la ruta de login, limpiar sesión
    if (response.status === 401 && !response.url.includes('/login')) {
      localStorage.removeItem('evconnect_token');
      localStorage.removeItem('evconnect_user');
      localStorage.removeItem('evconnect_custom_data');
      window.location.href = '/login';
    }

    throw {
      status: response.status,
      message: data.message || data.error || 'Error en la solicitud',
      data,
    };
  }

  return data;
}

/**
 * Realiza una petición GET
 */
export async function get(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: buildHeaders(options.headers),
      signal: controller.signal,
      ...options,
    });

    clearTimeout(timeoutId);
    return await handleResponse(response);
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw { message: 'La solicitud tardó demasiado tiempo' };
    }
    throw error;
  }
}

/**
 * Realiza una petición POST
 */
export async function post(url, data = {}, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: buildHeaders(options.headers),
      body: JSON.stringify(data),
      signal: controller.signal,
      ...options,
    });

    clearTimeout(timeoutId);
    return await handleResponse(response);
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw { message: 'La solicitud tardó demasiado tiempo' };
    }
    throw error;
  }
}

/**
 * Realiza una petición PUT
 */
export async function put(url, data = {}, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: buildHeaders(options.headers),
      body: JSON.stringify(data),
      signal: controller.signal,
      ...options,
    });

    clearTimeout(timeoutId);
    return await handleResponse(response);
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw { message: 'La solicitud tardó demasiado tiempo' };
    }
    throw error;
  }
}

/**
 * Realiza una petición DELETE
 */
export async function del(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: buildHeaders(options.headers),
      signal: controller.signal,
      ...options,
    });

    clearTimeout(timeoutId);
    return await handleResponse(response);
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw { message: 'La solicitud tardó demasiado tiempo' };
    }
    throw error;
  }
}

export default {
  get,
  post,
  put,
  del,
};
