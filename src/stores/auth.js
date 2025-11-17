import { ref, computed } from 'vue';
import { sessionState } from '@/utils/session';
import { logout as authLogout } from '@/services/authService';

// Estado reactivo basado en la sesión
const isLogged = computed(() => sessionState.isAuthenticated);

/**
 * Marca el usuario como autenticado
 * (La sesión ya está gestionada por authService.login)
 */
function login() {
  // No hace falta hacer nada, el authService ya gestiona la sesión
  console.log('Usuario autenticado desde store');
}

/**
 * Cierra la sesión del usuario
 */
function logout() {
  authLogout();
}

/**
 * Sincroniza el estado de autenticación
 * (Ya no es necesario con la sesión reactiva)
 */
function sync() {
  // La sesión se sincroniza automáticamente con sessionState
  console.log('Estado de autenticación:', sessionState.isAuthenticated);
}

export { isLogged, login, logout, sync };
