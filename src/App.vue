
<template>
  <div class="font-inter h-screen bg-gray-50 overflow-hidden">
    <!-- Solo mostrar el layout con sidebar si el usuario está logueado -->
    <div v-if="isLogged" class="flex h-full">
      <!-- Sidebar -->
      <Sidebar />
      
      <!-- Contenedor principal -->
      <div class="flex-1 flex flex-col h-full overflow-hidden">
        <!-- Header móvil (SOLO en pantallas pequeñas) -->
        <header v-if="!isLargeScreen" class="bg-white p-4 flex justify-between items-center shadow-sm z-20 flex-shrink-0">
          <button @click="toggleSidebar" class="p-2 rounded-lg mobile-menu-btn">
            <font-awesome-icon :icon="['fas', 'bars']" class="text-xl" />
          </button>
          <h1 class="text-lg font-semibold">EVCONNECT</h1>
          <div class="w-10"></div>
        </header>
        
        <!-- Overlay móvil cuando sidebar abierto -->
        <div 
          v-if="sidebarOpen && !isLargeScreen" 
          class="fixed inset-0 bg-black bg-opacity-50 z-30" 
          @click="closeSidebar"
        ></div>
        
        <!-- Contenido con scroll -->
        <main class="flex-1 overflow-y-auto">
          <router-view />
        </main>
      </div>
    </div>
    
    <!-- Vista de login sin sidebar -->
    <div v-else class="h-full overflow-y-auto">
      <router-view />
    </div>
  </div>
</template>

<script>
import Sidebar from './components/Sidebar.vue';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { isLogged } from '@/stores/auth';
import { sidebarOpen, openSidebar, closeSidebar, toggleSidebar } from '@/stores/ui';

export default {
  components: { Sidebar },
  setup(){
    const router = useRouter();
    const isLargeScreen = ref(window.innerWidth >= 1024);

    // Actualizar isLargeScreen en resize
    const onResize = () => {
      isLargeScreen.value = window.innerWidth >= 1024;
    };

    onMounted(() => {
      if (isLogged.value && isLargeScreen.value) {
        openSidebar();
      }
      
      // Listener para resize
      window.addEventListener('resize', onResize);
      
      // Cerrar sidebar en navegación (móvil)
      router.afterEach(() => {
        if (!isLargeScreen.value) {
          closeSidebar();
        }
      });
    });

    return { isLogged, sidebarOpen, toggleSidebar, isLargeScreen, closeSidebar };
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
.font-inter { font-family: 'Inter', sans-serif; }

/* Paleta de colores: #2C403A (oscuro), #37A686 (medio), #52F2B8 (claro) */
.mobile-menu-btn {
  color: #37A686;
}

.mobile-menu-btn:hover {
  color: #2C403A;
}
</style>
