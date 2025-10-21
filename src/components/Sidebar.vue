<template>
  <div>
    <!-- Collapsed indicator on large screens when sidebar is closed -->
  <div v-if="isLarge && (sidebarCollapsed || !sidebarOpen)" class="fixed left-0 top-1/4 z-40">
      <!-- Icon-only collapsed bar -->
      <div class="w-12 bg-indigo-800 rounded-r-lg shadow-lg flex flex-col items-center py-4 space-y-3">
        <button @click="expandFromCollapsed" class="text-white text-lg p-2"><i class="fas fa-chevron-right"></i></button>
        <button @click.prevent="expandFromCollapsed" class="text-white p-2"><i class="fas fa-home"></i></button>
        <button @click.prevent="expandFromCollapsed" class="text-white p-2"><i class="fas fa-map-marker-alt"></i></button>
        <button @click.prevent="expandFromCollapsed" class="text-white p-2"><i class="fas fa-dollar-sign"></i></button>
      </div>
    </div>

    <!-- Sidebar: en pantallas grandes se muestra como columna fija; en móviles se convierte en panel deslizable -->
    <aside v-else :class="[
      'bg-indigo-800 text-white min-h-screen p-6 z-40 transform transition-transform duration-300',
      isLarge ? 'w-64 block relative translate-x-0' : 'w-64 fixed top-0 left-0 h-full',
      !isLarge && sidebarOpen ? 'translate-x-0' : (!isLarge ? '-translate-x-full' : '')
    ]">
    <div class="flex items-center gap-3 mb-8">
      <img src="/icons/logo.png" alt="EVCONNECT" class="w-10 h-10 rounded object-cover" />
      <div class="text-2xl font-extrabold">EVCONNECT</div>
      <button v-if="isLarge" @click="toggleCollapse" class="ml-auto text-sm text-indigo-200 hover:text-white p-1">{{ sidebarCollapsed ? 'Expandir' : 'Colapsar' }}</button>
    </div>

    <nav class="space-y-2">
  <router-link to="/dashboard" class="flex items-center p-3 rounded-lg hover:bg-indigo-700" active-class="bg-indigo-700"><i class="fas fa-home w-4 mr-3"></i><span v-if="!sidebarCollapsed">Dashboard</span></router-link>
  <router-link to="/stations" class="flex items-center p-3 rounded-lg hover:bg-indigo-700"><i class="fas fa-map-marker-alt w-4 mr-3"></i><span v-if="!sidebarCollapsed">Estaciones</span></router-link>
  <router-link to="/tariffs" class="flex items-center p-3 rounded-lg hover:bg-indigo-700"><i class="fas fa-dollar-sign w-4 mr-3"></i><span v-if="!sidebarCollapsed">Tarifas</span></router-link>
  <router-link to="/reports" class="flex items-center p-3 rounded-lg hover:bg-indigo-700"><i class="fas fa-chart-bar w-4 mr-3"></i><span v-if="!sidebarCollapsed">Reportes</span></router-link>
  <router-link to="/users" class="flex items-center p-3 rounded-lg hover:bg-indigo-700"><i class="fas fa-users w-4 mr-3"></i><span v-if="!sidebarCollapsed">Usuarios</span></router-link>
    </nav>

    <div class="mt-6 pt-6 border-t border-indigo-700">
      <button @click="logout" class="w-full text-left p-3 rounded-lg hover:bg-indigo-700"><i class="fas fa-sign-out-alt mr-2"></i>Cerrar Sesión</button>
    </div>
  </aside>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';
import { isLogged, logout as authLogout } from '@/stores/auth'
import { sidebarOpen, openSidebar, sidebarCollapsed } from '@/stores/ui'
import { ref, onMounted } from 'vue'

export default {
  name: 'Sidebar',
  setup(){
    const router = useRouter();
    const isLarge = ref(window.innerWidth >= 1024)

  const onResize = () => { isLarge.value = window.innerWidth >= 1024 }
  onMounted(()=> window.addEventListener('resize', onResize))

    const open = () => { sidebarOpen.value = true }
    const expandFromCollapsed = () => {
      // si está colapsado, primero abrir y des-colapsar
      sidebarCollapsed.value = false
      sidebarOpen.value = true
    }

    const toggleCollapse = () => {
      sidebarCollapsed.value = !sidebarCollapsed.value
    }

    const logout = () => {
      authLogout();
      // cerrar sidebar
      sidebarOpen.value = false
      router.push('/login');
    }
    return { logout, sidebarOpen, isLarge, open, sidebarCollapsed, expandFromCollapsed, toggleCollapse }
  }
};
</script>

<style scoped>
</style>
