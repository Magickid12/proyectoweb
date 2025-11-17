/**
 * Servicio de Estaciones
 * Gestiona las estaciones de carga
 */

import { get } from '@/utils/http';
import { API_ENDPOINTS } from '@/config/api';

/**
 * Obtiene la lista de estaciones de la franquicia
 * @returns {Promise<Array>} - Lista de estaciones con sus cargadores
 */
export async function getStationsByFranchise() {
  try {
    const response = await get(API_ENDPOINTS.STATIONS.FRANCHISE);
    
    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al obtener estaciones');
  } catch (error) {
    throw {
      message: error.message || 'Error al cargar estaciones',
      status: error.status,
    };
  }
}

/**
 * Obtiene todas las estaciones disponibles (para app móvil)
 * @returns {Promise<Array>} - Lista de estaciones activas
 */
export async function getStations() {
  try {
    const response = await get(API_ENDPOINTS.STATIONS.BASE);
    
    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al obtener estaciones');
  } catch (error) {
    throw {
      message: error.message || 'Error al cargar estaciones',
      status: error.status,
    };
  }
}

export default {
  getStationsByFranchise,
  getStations,
};
