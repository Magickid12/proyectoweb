
<template>
  <div class="font-inter min-h-screen bg-gray-50">
    <div class="flex">
  <Sidebar v-if="isLogged" />
      <div class="flex-1">
        <!-- Header móvil -->
        <header class="bg-white p-4 sticky top-0 z-10 lg:hidden flex justify-between items-center">
          <button @click="toggleSidebar" class="p-2 rounded-lg mobile-menu-btn">
            <font-awesome-icon :icon="['fas', 'bars']" />
          </button>
          <h1 class="text-lg font-semibold">EVCONNECT</h1>
          <div></div>
        </header>
        <!-- Overlay móvil cuando sidebar abierto -->
        <div v-if="sidebarOpen && !isLargeScreen" class="fixed inset-0 bg-black bg-opacity-40 z-30 lg:hidden" @click="closeSidebar()"></div>
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from './components/Sidebar.vue';
import { onMounted, computed } from 'vue';
import { isLogged } from '@/stores/auth'
import { sidebarOpen, openSidebar, closeSidebar, toggleSidebar } from '@/stores/ui'

export default {
  components: { Sidebar },
  setup(){
    const isLargeScreen = window.innerWidth >= 1024;

    onMounted(()=>{
      if (isLogged.value && isLargeScreen) openSidebar();
    })

    // cerrar sidebar en navegación (móvil)
    import('vue-router').then(({ useRouter }) => {
      const router = useRouter();
      router.afterEach(() => {
        if (!isLargeScreen) closeSidebar();
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
