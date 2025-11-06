<template>
    <div>
        <!-- Sidebar: en pantallas grandes se muestra como columna fija; en móviles se convierte en panel deslizable -->
        <aside :class="[
            'text-white min-h-screen z-40 transform transition-all duration-300 ease-in-out flex flex-col',
            isLarge && sidebarCollapsed ? 'w-20 p-3' : 'w-64 p-6',
            isLarge ? 'block relative translate-x-0' : 'fixed top-0 left-0 h-full',
            !isLarge && sidebarOpen ? 'translate-x-0' : (!isLarge ? '-translate-x-full' : '')
        ]" style="background-color: #2C403A;">
            <!-- Header con logo y título -->
            <div :class="[
                'flex items-center mb-8',
                sidebarCollapsed && isLarge ? 'flex-col gap-2 justify-center' : 'gap-3'
            ]">
                <img src="/icons/logo.png" alt="EVCONNECT" :class="[
                    'rounded object-cover transition-all duration-300',
                    sidebarCollapsed && isLarge ? 'w-8 h-8' : 'w-10 h-10'
                ]" />
                <div v-if="!sidebarCollapsed || !isLarge" class="text-2xl font-extrabold">EVCONNECT</div>
                <button 
                    v-if="isLarge" 
                    @click="toggleCollapse" 
                    :class="[
                        'text-sm hover:text-white p-1 transition-colors',
                        sidebarCollapsed ? 'mt-2' : 'ml-auto'
                    ]" 
                    style="color: #52F2B8;"
                    :title="sidebarCollapsed ? 'Expandir' : 'Colapsar'"
                >
                    <font-awesome-icon :icon="['fas', sidebarCollapsed ? 'caret-right' : 'caret-left']" />
                </button>
            </div>

            <!-- Navegación -->
            <nav class="space-y-2 flex-grow">
                <router-link 
                    to="/dashboard" 
                    :class="[
                        'flex items-center rounded-lg transition-colors duration-200',
                        sidebarCollapsed && isLarge ? 'justify-center p-3' : 'justify-start p-3'
                    ]"
                    active-class="sidebar-active"
                    :title="sidebarCollapsed && isLarge ? 'Dashboard' : ''"
                >
                    <font-awesome-icon :icon="['fas', 'home']" class="w-5 h-5 shrink-0" />
                    <span v-if="!sidebarCollapsed || !isLarge" class="ml-4 whitespace-nowrap overflow-hidden">Dashboard</span>
                </router-link>
                <router-link 
                    to="/stations" 
                    :class="[
                        'flex items-center rounded-lg transition-colors duration-200',
                        sidebarCollapsed && isLarge ? 'justify-center p-3' : 'justify-start p-3'
                    ]"
                    active-class="sidebar-active"
                    :title="sidebarCollapsed && isLarge ? 'Estaciones' : ''"
                >
                    <font-awesome-icon :icon="['fas', 'map-marker-alt']" class="w-5 h-5 shrink-0" />
                    <span v-if="!sidebarCollapsed || !isLarge" class="ml-4 whitespace-nowrap overflow-hidden">Estaciones</span>
                </router-link>
                <router-link 
                    to="/tariffs" 
                    :class="[
                        'flex items-center rounded-lg transition-colors duration-200',
                        sidebarCollapsed && isLarge ? 'justify-center p-3' : 'justify-start p-3'
                    ]"
                    active-class="sidebar-active"
                    :title="sidebarCollapsed && isLarge ? 'Tarifas' : ''"
                >
                    <font-awesome-icon :icon="['fas', 'dollar-sign']" class="w-5 h-5 shrink-0" />
                    <span v-if="!sidebarCollapsed || !isLarge" class="ml-4 whitespace-nowrap overflow-hidden">Tarifas</span>
                </router-link>
                <router-link 
                    to="/reports" 
                    :class="[
                        'flex items-center rounded-lg transition-colors duration-200',
                        sidebarCollapsed && isLarge ? 'justify-center p-3' : 'justify-start p-3'
                    ]"
                    active-class="sidebar-active"
                    :title="sidebarCollapsed && isLarge ? 'Reportes' : ''"
                >
                    <font-awesome-icon :icon="['fas', 'chart-bar']" class="w-5 h-5 shrink-0" />
                    <span v-if="!sidebarCollapsed || !isLarge" class="ml-4 whitespace-nowrap overflow-hidden">Reportes</span>
                </router-link>
                <router-link 
                    to="/users" 
                    :class="[
                        'flex items-center rounded-lg transition-colors duration-200',
                        sidebarCollapsed && isLarge ? 'justify-center p-3' : 'justify-start p-3'
                    ]"
                    active-class="sidebar-active"
                    :title="sidebarCollapsed && isLarge ? 'Usuarios' : ''"
                >
                    <font-awesome-icon :icon="['fas', 'users']" class="w-5 h-5 shrink-0" />
                    <span v-if="!sidebarCollapsed || !isLarge" class="ml-4 whitespace-nowrap overflow-hidden">Usuarios</span>
                </router-link>
            </nav>

            <!-- Botón de Cerrar Sesión -->
            <div class="mt-auto pt-6" style="border-top: 1px solid #37A686;">
                <button 
                    @click="logout" 
                    :class="[
                        'w-full p-3 rounded-lg transition-colors duration-200 flex items-center hover-logout',
                        sidebarCollapsed && isLarge ? 'justify-center' : 'justify-start'
                    ]"
                    :title="sidebarCollapsed && isLarge ? 'Cerrar Sesión' : ''"
                >
                    <font-awesome-icon :icon="['fas', 'sign-out-alt']" class="w-5 h-5 shrink-0" />
                    <span v-if="!sidebarCollapsed || !isLarge" class="ml-4">Cerrar Sesión</span>
                </button>
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

        const toggleCollapse = () => {
            sidebarCollapsed.value = !sidebarCollapsed.value
        }

        const logout = () => {
            authLogout();
            // cerrar sidebar
            sidebarOpen.value = false
            router.push('/login');
        }
        return { logout, sidebarOpen, isLarge, open, sidebarCollapsed, toggleCollapse }
    }
};
</script>

<style scoped>
/* Paleta de colores: #2C403A (oscuro), #37A686 (medio), #52F2B8 (claro), #F2F2F2 (blanco/gris), #0D0D0D (negro) */

nav a {
    transition: background-color 0.2s ease-in-out;
}

nav a:hover {
    background-color: #37A686 !important;
}

.sidebar-active {
    background-color: #37A686 !important;
}

.hover-logout:hover {
    background-color: #37A686 !important;
}
</style>
