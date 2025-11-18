<template>
    <div>
        <!-- Sidebar: fijo en desktop, deslizable en móvil -->
        <aside :class="[
            'text-white z-40 transform transition-all duration-300 ease-in-out flex flex-col',
            sidebarCollapsed ? 'w-20 p-3' : 'w-64 p-6',
            // Desktop: posición fija, altura completa, siempre visible
            'lg:relative lg:translate-x-0 lg:h-screen',
            // Móvil: posición fixed, deslizable desde la izquierda
            'fixed top-0 left-0 h-full',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        ]" style="background-color: #2C403A;">
            
            <!-- Botón cerrar en móvil -->
            <button 
                @click="closeSidebar"
                class="lg:hidden absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            >
                <font-awesome-icon :icon="['fas', 'times']" class="text-xl" />
            </button>

            <!-- Header con logo y título -->
            <div class="mb-8 flex-shrink-0">
                <!-- Logo y título -->
                <div :class="[
                    'flex items-center',
                    sidebarCollapsed ? 'flex-col gap-2 justify-center' : 'gap-3 mb-3'
                ]">
                    <img 
                        src="/icons/logo.png" 
                        alt="EVCONNECT" 
                        :class="[
                            'object-contain transition-all duration-300',
                            sidebarCollapsed ? 'w-10 h-10' : 'w-12 h-12'
                        ]"
                    />
                    <div v-if="!sidebarCollapsed" class="text-2xl font-extrabold">EVCONNECT</div>
                </div>
                
                <!-- Botón colapsar (solo desktop) - En fila separada cuando expandido -->
                <div v-if="!sidebarCollapsed" class="hidden lg:flex w-full mt-2 justify-end">
                    <button 
                        @click="toggleCollapse" 
                        class="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-sm" 
                        style="color: #52F2B8;"
                        title="Colapsar menú"
                    >
                        <font-awesome-icon :icon="['fas', 'bars']" />
                    </button>
                </div>
                
                <!-- Botón colapsar cuando está colapsado - Centrado -->
                <button 
                    v-if="sidebarCollapsed"
                    @click="toggleCollapse" 
                    class="hidden lg:block w-full p-2 rounded-lg hover:bg-white/10 transition-all duration-200" 
                    style="color: #52F2B8;"
                    title="Expandir menú"
                >
                    <font-awesome-icon :icon="['fas', 'bars']" />
                </button>
            </div>

            <!-- Navegación con scroll interno si es necesario -->
            <nav class="space-y-2 flex-grow overflow-y-auto">
                <router-link 
                    to="/dashboard" 
                    :class="[
                        'flex items-center rounded-lg transition-colors duration-200',
                        sidebarCollapsed ? 'justify-center p-3' : 'justify-start p-3'
                    ]"
                    active-class="sidebar-active"
                    :title="sidebarCollapsed ? 'Dashboard' : ''"
                    @click="closeOnMobile"
                >
                    <font-awesome-icon :icon="['fas', 'home']" class="w-5 h-5 shrink-0" />
                    <span v-if="!sidebarCollapsed" class="ml-4 whitespace-nowrap overflow-hidden">Dashboard</span>
                </router-link>
                <router-link 
                    to="/stations" 
                    :class="[
                        'flex items-center rounded-lg transition-colors duration-200',
                        sidebarCollapsed ? 'justify-center p-3' : 'justify-start p-3'
                    ]"
                    active-class="sidebar-active"
                    :title="sidebarCollapsed ? 'Estaciones' : ''"
                    @click="closeOnMobile"
                >
                    <font-awesome-icon :icon="['fas', 'map-marker-alt']" class="w-5 h-5 shrink-0" />
                    <span v-if="!sidebarCollapsed" class="ml-4 whitespace-nowrap overflow-hidden">Estaciones</span>
                </router-link>
                <router-link 
                    to="/tariffs" 
                    :class="[
                        'flex items-center rounded-lg transition-colors duration-200',
                        sidebarCollapsed ? 'justify-center p-3' : 'justify-start p-3'
                    ]"
                    active-class="sidebar-active"
                    :title="sidebarCollapsed ? 'Tarifas' : ''"
                    @click="closeOnMobile"
                >
                    <font-awesome-icon :icon="['fas', 'dollar-sign']" class="w-5 h-5 shrink-0" />
                    <span v-if="!sidebarCollapsed" class="ml-4 whitespace-nowrap overflow-hidden">Tarifas</span>
                </router-link>
                <router-link 
                    to="/reports" 
                    :class="[
                        'flex items-center rounded-lg transition-colors duration-200',
                        sidebarCollapsed ? 'justify-center p-3' : 'justify-start p-3'
                    ]"
                    active-class="sidebar-active"
                    :title="sidebarCollapsed ? 'Reportes' : ''"
                    @click="closeOnMobile"
                >
                    <font-awesome-icon :icon="['fas', 'chart-bar']" class="w-5 h-5 shrink-0" />
                    <span v-if="!sidebarCollapsed" class="ml-4 whitespace-nowrap overflow-hidden">Reportes</span>
                </router-link>
                <router-link 
                    to="/support" 
                    :class="[
                        'flex items-center rounded-lg transition-colors duration-200',
                        sidebarCollapsed ? 'justify-center p-3' : 'justify-start p-3'
                    ]"
                    active-class="sidebar-active"
                    :title="sidebarCollapsed ? 'Soporte' : ''"
                    @click="closeOnMobile"
                >
                    <font-awesome-icon :icon="['fas', 'headset']" class="w-5 h-5 shrink-0" />
                    <span v-if="!sidebarCollapsed" class="ml-4 whitespace-nowrap overflow-hidden">Soporte</span>
                </router-link>
            </nav>

            <!-- Info del Usuario y Botón de Cerrar Sesión -->
            <div class="mt-auto pt-6 flex-shrink-0" style="border-top: 1px solid #37A686;">
                <!-- Info del usuario (solo cuando está expandido) -->
                <div v-if="!sidebarCollapsed && $session.isAuthenticated" class="mb-4 pb-4" style="border-bottom: 1px solid rgba(55, 166, 134, 0.3);">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style="background-color: #37A686;">
                            {{ getUserInitials() }}
                        </div>
                        <div class="flex-1 overflow-hidden">
                            <p class="font-semibold text-sm truncate">{{ $session.nombre || 'Usuario' }}</p>
                            <p class="text-xs truncate" style="color: #52F2B8;">{{ $session.email || '' }}</p>
                        </div>
                    </div>
                </div>
                
                <button 
                    @click="logout" 
                    :class="[
                        'w-full p-3 rounded-lg transition-colors duration-200 flex items-center hover-logout',
                        sidebarCollapsed ? 'justify-center' : 'justify-start'
                    ]"
                    :title="sidebarCollapsed ? 'Cerrar Sesión' : ''"
                >
                    <font-awesome-icon :icon="['fas', 'sign-out-alt']" class="w-5 h-5 shrink-0" />
                    <span v-if="!sidebarCollapsed" class="ml-4">Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    </div>
</template>

<script>
import { useRouter } from 'vue-router';
import { isLogged, logout as authLogout } from '@/stores/auth'
import { sidebarOpen, closeSidebar, sidebarCollapsed } from '@/stores/ui'
import { ref, onMounted, getCurrentInstance } from 'vue'

export default {
    name: 'Sidebar',
    setup(){
        const router = useRouter();
        
        // Acceder a $session
        const app = getCurrentInstance();
        const $session = app.appContext.config.globalProperties.$session;

        const toggleCollapse = () => {
            sidebarCollapsed.value = !sidebarCollapsed.value
        }
        
        // Cerrar sidebar en móvil al hacer click en un link
        const closeOnMobile = () => {
            if (window.innerWidth < 1024) {
                closeSidebar();
            }
        }
        
        const getUserInitials = () => {
            if (!$session.nombre && !$session.email) return '?';
            const name = $session.nombre || $session.email;
            const parts = name.split(' ');
            if (parts.length >= 2) {
                return (parts[0][0] + parts[1][0]).toUpperCase();
            }
            return name.substring(0, 2).toUpperCase();
        }

        const logout = () => {
            authLogout();
            // cerrar sidebar
            closeSidebar();
            router.push('/login');
        }
        
        return { 
            logout, 
            sidebarOpen, 
            sidebarCollapsed, 
            toggleCollapse, 
            closeSidebar,
            closeOnMobile,
            getUserInitials 
        }
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
