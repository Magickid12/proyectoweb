/**
 * Sistema de Sesión Global
 * Maneja la sesión del usuario autenticado
 */

import { reactive } from 'vue';

// Estado reactivo de la sesión
const sessionState = reactive({
  user: null,
  token: null,
  isAuthenticated: false,
  // Propiedades adicionales personalizadas
  customData: {},
});

/**
 * Inicializa la sesión desde localStorage
 */
export function initSession() {
  const token = localStorage.getItem('evconnect_token');
  const userStr = localStorage.getItem('evconnect_user');
  const customDataStr = localStorage.getItem('evconnect_custom_data');

  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      sessionState.token = token;
      sessionState.user = user;
      sessionState.isAuthenticated = true;

      // Cargar datos personalizados si existen
      if (customDataStr) {
        sessionState.customData = JSON.parse(customDataStr);
      }
    } catch (error) {
      console.error('Error al cargar sesión:', error);
      clearSession();
    }
  }
}

/**
 * Establece la sesión del usuario
 */
export function setSession(token, user, customData = {}) {
  sessionState.token = token;
  sessionState.user = user;
  sessionState.isAuthenticated = true;
  sessionState.customData = { ...sessionState.customData, ...customData };

  // Guardar en localStorage
  localStorage.setItem('evconnect_token', token);
  localStorage.setItem('evconnect_user', JSON.stringify(user));
  localStorage.setItem('evconnect_custom_data', JSON.stringify(sessionState.customData));
}

/**
 * Limpia la sesión del usuario
 */
export function clearSession() {
  sessionState.token = null;
  sessionState.user = null;
  sessionState.isAuthenticated = false;
  sessionState.customData = {};

  // Limpiar localStorage
  localStorage.removeItem('evconnect_token');
  localStorage.removeItem('evconnect_user');
  localStorage.removeItem('evconnect_custom_data');
}

/**
 * Obtiene el token actual
 */
export function getToken() {
  return sessionState.token;
}

/**
 * Obtiene el usuario actual
 */
export function getUser() {
  return sessionState.user;
}

/**
 * Verifica si hay sesión activa
 */
export function isAuthenticated() {
  return sessionState.isAuthenticated;
}

/**
 * Obtiene un valor personalizado de la sesión
 */
export function get(key) {
  // Permite acceder a propiedades del usuario
  if (sessionState.user && key in sessionState.user) {
    return sessionState.user[key];
  }
  // Permite acceder a datos personalizados
  return sessionState.customData[key];
}

/**
 * Establece un valor personalizado en la sesión
 */
export function set(key, value) {
  sessionState.customData[key] = value;
  localStorage.setItem('evconnect_custom_data', JSON.stringify(sessionState.customData));
}

/**
 * Objeto de sesión exportable con Proxy para acceso dinámico
 */
export const session = new Proxy({}, {
  get(target, prop) {
    // Propiedades principales
    if (prop === 'user') return sessionState.user;
    if (prop === 'token') return sessionState.token;
    if (prop === 'isAuthenticated') return sessionState.isAuthenticated;
    
    // Métodos
    if (prop === 'set') return setSession;
    if (prop === 'clear') return clearSession;
    if (prop === 'init') return initSession;
    if (prop === 'get') return get;
    if (prop === 'setValue') return set;
    
    // Acceso dinámico a propiedades del usuario
    if (sessionState.user && prop in sessionState.user) {
      return sessionState.user[prop];
    }
    
    // Acceso a datos personalizados
    return sessionState.customData[prop];
  },
  
  set(target, prop, value) {
    // Permitir establecer valores personalizados
    sessionState.customData[prop] = value;
    localStorage.setItem('evconnect_custom_data', JSON.stringify(sessionState.customData));
    return true;
  }
});

export { sessionState };
export default session;
