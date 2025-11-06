<template>
  <div class="min-h-screen flex items-center justify-center p-6">
    <div class="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
      <div class="flex items-center gap-3 mb-6">
        <img src="/public/icons/logo.png" alt="EVCONNECT logo" class="w-12 h-12 rounded object-cover" />
        <h1 class="text-2xl font-bold">EVCONNECT</h1>
      </div>

      <p class="text-gray-600 mb-4">Inicia sesión para continuar</p>
      <form @submit.prevent="doLogin" class="space-y-4">
        <input v-model="user" placeholder="Usuario" class="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-primary" />
        <input v-model="pass" type="password" placeholder="Contraseña" class="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-primary" />
        <button class="w-full btn-primary text-white p-3 rounded font-semibold hover:opacity-90 transition-opacity">Iniciar sesión</button>
      </form>

      <p class="text-sm text-gray-500 mt-4 text-center">¿Olvidaste tu contraseña?</p>
    <div v-if="loading" class="mt-4 p-4 bg-gray-50 rounded flex items-center gap-3 justify-center">
        <svg class="animate-spin h-6 w-6" style="color: #37A686;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
        <span>Espere un momento...</span>
    </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import cookies from 'vue-cookies';
import { login as authLogin } from '@/stores/auth'
import { openSidebar } from '@/stores/ui'
export default {
  setup() {
    const user = ref('');
    const pass = ref('');
    const router = useRouter();
    const loading = ref(false);
    const seconds = ref(0);

    const doLogin = () => {
      // Validación hardcodeada
      if (user.value === 'admin' && pass.value === 'pass') {
        loading.value = true;
        seconds.value = 0;
        const t = setInterval(() => { seconds.value += 1; }, 1000);
        // Simula petición de app-shell (5s) antes de redirigir
        setTimeout(() => {
          clearInterval(t);
          loading.value = false;
            // Guardar cookie simple de sesión por 1 hora usando vue-cookies
            cookies.set('evconnect_token','mocked-token','1h');
            authLogin();
            openSidebar();
            router.push('/dashboard');
        }, 5000);
      } else {
        alert('Credenciales incorrectas.');
      }
    };

    return { user, pass, doLogin, loading, seconds };
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
