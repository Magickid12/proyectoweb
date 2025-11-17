/**
 * Servicio de Sesiones y Reportes
 * Gestiona el historial de sesiones de carga
 */

import { get } from '@/utils/http';
import { API_ENDPOINTS } from '@/config/api';

/**
 * Obtiene el historial de sesiones con filtros opcionales
 * @param {object} filters - Filtros opcionales (estado, fecha_inicio, fecha_fin)
 * @returns {Promise<Array>} - Lista de sesiones
 */
export async function getSessions(filters = {}) {
  try {
    let url = API_ENDPOINTS.REPORTS.SESSIONS;
    
    // Construir query params si hay filtros
    const params = new URLSearchParams();
    if (filters.estado) params.append('estado', filters.estado);
    if (filters.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
    if (filters.fecha_fin) params.append('fecha_fin', filters.fecha_fin);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await get(url);
    
    // Manejar ambos formatos: success: true O status: 'success'
    const isSuccess = response.success === true || response.status === 'success';
    
    if (isSuccess && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al obtener sesiones');
  } catch (error) {
    throw {
      message: error.message || 'Error al cargar historial de sesiones',
      status: error.status,
    };
  }
}

/**
 * Obtiene el detalle de una sesión específica
 * @param {number} id - ID de la sesión
 * @returns {Promise<object>} - Detalle de la sesión
 */
export async function getSessionById(id) {
  try {
    const response = await get(API_ENDPOINTS.REPORTS.SESSION_BY_ID(id));
    
    // Manejar ambos formatos: success: true O status: 'success'
    const isSuccess = response.success === true || response.status === 'success';
    
    if (isSuccess && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al obtener sesión');
  } catch (error) {
    throw {
      message: error.message || 'Error al cargar detalle de sesión',
      status: error.status,
    };
  }
}

export default {
  getSessions,
  getSessionById,
};
