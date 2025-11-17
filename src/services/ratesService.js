/**
 * Servicio de Tarifas
 * Gestiona las tarifas de carga
 */

import { get, post, put, del } from '@/utils/http';
import { API_ENDPOINTS } from '@/config/api';

/**
 * Obtiene la lista de todas las tarifas
 * @param {object} filters - Filtros opcionales (id_estacion, tipo_carga)
 * @returns {Promise<Array>} - Lista de tarifas
 */
export async function getRates(filters = {}) {
  try {
    let url = API_ENDPOINTS.RATES.BASE;
    
    // Construir query params si hay filtros
    const params = new URLSearchParams();
    if (filters.id_estacion) params.append('id_estacion', filters.id_estacion);
    if (filters.tipo_carga) params.append('tipo_carga', filters.tipo_carga);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await get(url);
    
    // Manejar ambos formatos: success: true O status: 'success'
    const isSuccess = response.success === true || response.status === 'success';
    
    if (isSuccess && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al obtener tarifas');
  } catch (error) {
    throw {
      message: error.message || 'Error al cargar tarifas',
      status: error.status,
    };
  }
}

/**
 * Obtiene una tarifa por ID
 * @param {number} id - ID de la tarifa
 * @returns {Promise<object>} - Tarifa
 */
export async function getRateById(id) {
  try {
    const response = await get(API_ENDPOINTS.RATES.BY_ID(id));
    
    // Manejar ambos formatos: success: true O status: 'success'
    const isSuccess = response.success === true || response.status === 'success';
    
    if (isSuccess && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al obtener tarifa');
  } catch (error) {
    throw {
      message: error.message || 'Error al cargar tarifa',
      status: error.status,
    };
  }
}

/**
 * Crea una nueva tarifa
 * @param {object} data - Datos de la tarifa
 * @returns {Promise<object>} - Tarifa creada
 */
export async function createRate(data) {
  try {
    const response = await post(API_ENDPOINTS.RATES.BASE, data);
    
    // Manejar ambos formatos: success: true O status: 'success'
    const isSuccess = response.success === true || response.status === 'success';
    
    if (isSuccess && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al crear tarifa');
  } catch (error) {
    throw {
      message: error.message || 'Error al crear tarifa',
      status: error.status,
    };
  }
}

/**
 * Actualiza una tarifa
 * @param {number} id - ID de la tarifa
 * @param {object} data - Datos a actualizar
 * @returns {Promise<object>} - Tarifa actualizada
 */
export async function updateRate(id, data) {
  try {
    const response = await put(API_ENDPOINTS.RATES.BY_ID(id), data);
    
    // Manejar ambos formatos: success: true O status: 'success'
    const isSuccess = response.success === true || response.status === 'success';
    
    if (isSuccess && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Error al actualizar tarifa');
  } catch (error) {
    throw {
      message: error.message || 'Error al actualizar tarifa',
      status: error.status,
    };
  }
}

/**
 * Elimina una tarifa
 * @param {number} id - ID de la tarifa
 * @returns {Promise<object>} - Confirmación de eliminación
 */
export async function deleteRate(id) {
  try {
    const response = await del(API_ENDPOINTS.RATES.BY_ID(id));
    
    // Manejar ambos formatos: success: true O status: 'success'
    const isSuccess = response.success === true || response.status === 'success';
    
    if (isSuccess) {
      return response.data;
    }

    throw new Error(response.message || 'Error al eliminar tarifa');
  } catch (error) {
    throw {
      message: error.message || 'Error al eliminar tarifa',
      status: error.status,
    };
  }
}

export default {
  getRates,
  getRateById,
  createRate,
  updateRate,
  deleteRate,
};
