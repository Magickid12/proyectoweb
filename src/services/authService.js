/**
 * Servicio de Autenticación
 * Maneja login y registro de usuarios backoffice
 */

import { post } from '@/utils/http';
import { API_ENDPOINTS } from '@/config/api';
import { setSession, clearSession } from '@/utils/session';
import { wsManager } from './websocketManager';

/**
 * Login de usuario backoffice
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña
 * @returns {Promise<object>} - { user, token }
 */
export async function login(email, password) {
  try {
    const response = await post(API_ENDPOINTS.AUTH.LOGIN, {
      email,
      password,
    });

    // Verificar ambos formatos: success: true O status: 'success'
    const isSuccess = response.success === true || response.status === 'success' || response.status === 200;
    
    if (isSuccess && response.data) {
      const { user, token } = response.data;
      
      // Decodificar el token para extraer franquiciaId
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      
      const userWithFranchise = {
        ...user,
        franquiciaId: tokenPayload.franquiciaId
      };
      
      setSession(token, userWithFranchise);
      return { user: userWithFranchise, token };
    }

    throw new Error(response.message || 'Error en el login');
  } catch (error) {
    throw {
      message: error.message || 'Error al iniciar sesión',
      status: error.status,
    };
  }
}

/**
 * Logout del usuario
 * Cierra todas las conexiones WebSocket activas antes de limpiar la sesión
 */
export function logout() {
  console.log('[Auth] Cerrando sesión y desconectando WebSockets...');
  
  // Desconectar todos los WebSocket activos
  wsManager.disconnectAll();
  
  // Limpiar la sesión
  clearSession();
  
  console.log('[Auth] Sesión cerrada exitosamente');
}

export default {
  login,
  logout,
};
