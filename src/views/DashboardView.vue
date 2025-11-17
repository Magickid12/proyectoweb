<template>
  <div class="p-8">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-3xl font-bold">Dashboard de Operaciones</h2>
        <p v-if="$session.isAuthenticated" class="text-gray-600 mt-1">
          Bienvenido, <span class="font-semibold text-primary">{{ $session.nombre || $session.email }}</span>
          <span v-if="$session.rol" class="ml-2 text-xs px-2 py-1 bg-primary-light rounded-full">{{ $session.rol }}</span>
        </p>
      </div>
      <button @click="loadDashboardData" class="text-gray-500 hover:text-gray-700" title="Recargar datos">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
      {{ error }}
    </div>

    <!-- Dashboard Content -->
    <div v-else>
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard 
          title="Energía Total" 
          :value="stats ? `${parseFloat(stats.energiaTotal || 0).toFixed(2)} kWh` : '0.00 kWh'" 
          icon="bolt" 
          color="light" 
        />
        <StatCard 
          title="Ingresos Totales" 
          :value="stats ? `$${parseFloat(stats.ingresosTotales || 0).toFixed(2)} MXN` : '$0.00 MXN'" 
          icon="dollar" 
          color="green" 
        />
        <StatCard 
          title="Ingresos (Hoy)" 
          :value="stats ? `$${parseFloat(stats.ingresosDiarios || 0).toFixed(2)} MXN` : '$0.00 MXN'" 
          icon="chart" 
          color="teal" 
        />
        <StatCard 
          title="Sesiones Activas" 
          :value="stats ? stats.sesionesActivas : 0" 
          icon="charging-station" 
          color="red" 
        />
      </div>

      <div class="grid grid-cols-1 gap-6">
        <!-- Estado de Cargadores -->
        <div class="bg-white p-4 rounded-xl shadow border border-gray-100">
          <h3 class="text-xl font-semibold mb-3">Estado de Cargadores</h3>
          
          <div v-if="chargersByStatus.length === 0" class="text-center py-8 text-gray-500">
            📊 No hay datos de cargadores disponibles
          </div>
          
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div v-for="statusGroup in chargersByStatus" :key="statusGroup.estado" 
                 class="p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center gap-3 mb-2">
                <span 
                  class="h-3 w-3 rounded-full" 
                  :class="getStatusColor(statusGroup.estado)"
                ></span>
                <span class="font-semibold capitalize">{{ statusGroup.estado }}</span>
              </div>
              <div class="text-3xl font-bold text-primary">
                {{ statusGroup.cantidad }}
              </div>
              <div class="text-sm text-gray-500">cargadores</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, getCurrentInstance } from 'vue';
import StatCard from '../components/StatCard.vue';
import { getStats } from '@/services/dashboardService';
import { useWebSocketAuto } from '@/composables/useWebSocket';

export default { 
  components: { StatCard },
  setup() {
    const loading = ref(true);
    const error = ref(null);
    
    const stats = ref(null);
    const chargersByStatus = ref([]);
    
    // Acceder a $session
    const app = getCurrentInstance();
    const $session = app?.appContext.config.globalProperties.$session;
    
    // Conectar WebSocket para actualizaciones en tiempo real
    const ws = useWebSocketAuto(
      localStorage.getItem('evconnect_token'),
      {
        // Handler para actualizaciones del dashboard
        'dashboard:update': (data) => {
          console.log('[Dashboard] Actualización recibida:', data);
          if (data) {
            stats.value = data;
            if (data.estadoCargadores && Array.isArray(data.estadoCargadores)) {
              chargersByStatus.value = data.estadoCargadores;
            }
          }
        },
        // Handler para cambios de estado de cargadores
        'charger:statusChanged': (data) => {
          console.log('[Dashboard] Estado de cargador cambió:', data);
          // Recargar datos
          loadDashboardData();
        },
        // Handler de conexión
        'connected': () => {
          console.log('[Dashboard] WebSocket conectado');
        },
        // Handler de desconexión
        'disconnected': () => {
          console.log('[Dashboard] WebSocket desconectado');
        }
      }
    );
    
    const loadDashboardData = async () => {
      try {
        loading.value = true;
        error.value = null;
        
        // Cargar stats desde /api/franquicia/dashboard
        const data = await getStats();
        stats.value = data;
        
        // Procesar cargadores por estado - Agrupar por estado
        if (data.estadoCargadores && Array.isArray(data.estadoCargadores)) {
          // Agrupar cargadores por estado
          const grouped = data.estadoCargadores.reduce((acc, cargador) => {
            const estado = cargador.estado || 'desconocido';
            const existing = acc.find(item => item.estado === estado);
            
            if (existing) {
              existing.cantidad++;
            } else {
              acc.push({
                estado: estado,
                cantidad: 1
              });
            }
            
            return acc;
          }, []);
          
          chargersByStatus.value = grouped;
        }
        
      } catch (err) {
        error.value = err.message || 'Error al cargar datos del dashboard';
        console.error('Error en dashboard:', err);
      } finally {
        loading.value = false;
      }
    };
    
    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };
    
    const getStatusColor = (estado) => {
      const statusMap = {
        'disponible': 'bg-green-500',
        'ocupado': 'bg-yellow-500',
        'fuera de servicio': 'bg-red-500',
        'mantenimiento': 'bg-gray-500'
      };
      return statusMap[estado?.toLowerCase()] || 'bg-gray-500';
    };
    
    onMounted(() => {
      loadDashboardData();
    });
    
    return { 
      loading,
      error,
      stats,
      chargersByStatus,
      loadDashboardData,
      formatDate,
      getStatusColor
    };
  }
};
</script>

<style scoped>
/* Paleta de colores: #2C403A (oscuro), #37A686 (medio), #52F2B8 (claro) */
.btn-link {
  color: #37A686;
  font-weight: 600;
}

.btn-link:hover {
  color: #2C403A;
  text-decoration: underline;
}

.text-primary {
  color: #37A686;
}

.bg-primary-light {
  background-color: #52F2B8;
  color: #2C403A;
}
</style>
