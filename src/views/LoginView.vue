<template>
  <div class="min-h-screen flex items-center justify-center p-6">
    <div class="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
      <div class="flex items-center gap-3 mb-6">
        <img src="/public/icons/logo.png" alt="EVCONNECT logo" class="w-12 h-12 rounded object-cover" />
        <h1 class="text-2xl font-bold">EVCONNECT</h1>
      </div>

      <p class="text-gray-600 mb-4">Inicia sesión para continuar</p>
      
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <input 
            v-model="email" 
            type="email"
            placeholder="Correo electrónico" 
            class="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            :disabled="loading"
            required
          />
        </div>
        
        <div>
          <input 
            v-model="password" 
            type="password" 
            placeholder="Contraseña" 
            class="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            :disabled="loading"
            required
          />
        </div>

        <!-- Mensaje de error -->
        <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
          {{ error }}
        </div>

        <button 
          type="submit"
          class="w-full btn-primary text-white p-3 rounded font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="loading"
        >
          {{ loading ? 'Iniciando sesión...' : 'Iniciar sesión' }}
        </button>
      </form>

      <p class="text-sm text-gray-500 mt-4 text-center">¿Olvidaste tu contraseña?</p>
      
      <!-- Indicador de carga -->
      <div v-if="loading" class="mt-4 p-4 bg-gray-50 rounded flex items-center gap-3 justify-center">
        <svg class="animate-spin h-6 w-6" style="color: #37A686;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
        <span>Autenticando...</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';
import { login } from '@/services/authService';
import { openSidebar } from '@/stores/ui';

export default {
  setup() {
    const email = ref('');
    const password = ref('');
    const router = useRouter();
    const loading = ref(false);
    const error = ref(null);
    
    // Acceder a $session
    const app = getCurrentInstance();
    const $session = app.appContext.config.globalProperties.$session;

    const handleLogin = async () => {
      // Evitar doble submit
      if (loading.value) return;
      
      try {
        loading.value = true;
        error.value = null;

        // Llamar al servicio de autenticación
        const result = await login(email.value, password.value);
        
        // Abrir sidebar
        openSidebar();
        
        // Usar replace en lugar de push para evitar historial
        await router.replace('/dashboard');
        
      } catch (err) {
        // Mostrar error más específico
        if (err.status === 401) {
          error.value = 'Credenciales incorrectas. Verifica tu email y contraseña.';
        } else if (err.status === 500) {
          error.value = 'Error del servidor. Intenta más tarde.';
        } else if (err.message && err.message.includes('tiempo')) {
          error.value = 'La conexión tardó demasiado. Verifica tu conexión a internet.';
        } else if (err.message && err.message.includes('fetch')) {
          error.value = 'No se puede conectar al servidor. Verifica que el backend esté corriendo.';
        } else {
          error.value = err.message || 'Error al iniciar sesión. Verifica tus credenciales.';
        }
      } finally {
        loading.value = false;
      }
    };

    return { 
      email, 
      password, 
      handleLogin, 
      loading, 
      error
    };
  }
};
</script>

<style scoped>
/* Paleta de colores: #2C403A (oscuro), #37A686 (medio), #52F2B8 (claro) */
.btn-primary {
  background-color: #37A686;
}

.btn-primary:hover {
  background-color: #2C403A;
}

.focus\:ring-primary:focus {
  --tw-ring-color: #37A686;
}
</style>
