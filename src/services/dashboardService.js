/**
 * Servicio de Dashboard
 * Obtiene estadísticas y datos del dashboard de franquicia
 */

import { get } from '@/utils/http';
import { API_ENDPOINTS } from '@/config/api';

/**
 * Obtiene las estadísticas del dashboard de la franquicia
 * @returns {Promise<object>} - Estadísticas completas
 */
export async function getStats() {
  try {
    const response = await get(API_ENDPOINTS.DASHBOARD.STATS);
    
    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al obtener estadísticas');
  } catch (error) {
    throw {
      message: error.message || 'Error al cargar estadísticas',
      status: error.status,
    };
  }
}

export default {
  getStats,
};
