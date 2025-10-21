<template>
  <div class="min-h-screen flex items-center justify-center p-6">
    <div class="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-12 h-12 rounded bg-indigo-600 text-white flex items-center justify-center">⚡</div>
        <h1 class="text-2xl font-bold">EVCONNECT</h1>
      </div>

      <p class="text-gray-600 mb-4">Inicia sesión para continuar (mock — redirección inmediata)</p>
      <form @submit.prevent="doLogin" class="space-y-4">
        <input v-model="user" placeholder="Usuario" class="w-full p-3 border rounded" />
        <input v-model="pass" type="password" placeholder="Contraseña" class="w-full p-3 border rounded" />
        <button class="w-full bg-indigo-600 text-white p-3 rounded">Iniciar sesión</button>
      </form>

      <p class="text-sm text-gray-500 mt-4">Demo: el login redirige al dashboard sin validar.</p>
      <div v-if="loading" class="mt-4 p-4 bg-gray-50 rounded">Simulando carga del app-shell... ({{seconds}}s)</div>
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
        alert('Credenciales incorrectas. Usuario: admin / pass');
      }
    };

    return { user, pass, doLogin, loading, seconds };
  }
};
</script>

<style scoped>
</style>
