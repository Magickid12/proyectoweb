/**
 * Configuración de la API EVConnect
 */

// URL base de la API
export const API_URL = import.meta.env.VITE_API_URL || 'https://evconnect-3ydy.onrender.com';

// Endpoints de la API
export const API_ENDPOINTS = {
  // Autenticación
  AUTH: {
    LOGIN: `${API_URL}/api/admin/login`,
    CREATE: `${API_URL}/api/admin/create`,
  },

  // Dashboard (Franquicia)
  DASHBOARD: {
    STATS: `${API_URL}/api/franquicia/dashboard`,
  },

  // Tarifas
  RATES: {
    BASE: `${API_URL}/api/admin/tarifas`,
    BY_ID: (id) => `${API_URL}/api/admin/tarifas/${id}`,
  },

  // Estaciones
  STATIONS: {
    BASE: `${API_URL}/api/stations`,
    FRANCHISE: `${API_URL}/api/stations/franchise`,
  },

  // Sesiones / Reportes
  REPORTS: {
    SESSIONS: `${API_URL}/api/admin/reports/sessions`,
    SESSION_BY_ID: (id) => `${API_URL}/api/admin/reports/sessions/${id}`,
  },

  // Sesiones - Monitor
  SESSIONS: {
    STOP_BY_CHARGER: (id) => `${API_URL}/api/sessions/stop-by-charger/${id}`,
  },
};

// Configuración de timeouts y reintentos
export const API_CONFIG = {
  TIMEOUT: 30000, // 30 segundos
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 segundo
};

export default {
  API_URL,
  API_ENDPOINTS,
  API_CONFIG,
};
