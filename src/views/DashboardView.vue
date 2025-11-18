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
        <!-- Resumen de Estados (Original) -->
        <div class="bg-white p-4 rounded-xl shadow border border-gray-100">
          <h3 class="text-xl font-semibold mb-3">Resumen General de Estados</h3>
          
          <div v-if="chargersByStatus.length === 0" class="text-center py-8 text-gray-500">
            📊 No hay datos de resumen disponibles
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

        <!-- Estado de Cargadores Agrupados por Estación (DESPLEGABLE) -->
        <div class="bg-white p-6 rounded-xl shadow border border-gray-100">
          <h3 class="text-xl font-semibold mb-4">Estado de Cargadores en Tiempo Real</h3>
          
          <div v-if="!chargersByStation || chargersByStation.length === 0" class="text-center py-8 text-gray-500">
            📊 No hay datos de cargadores disponibles
          </div>
          
          <!-- Cargadores agrupados por estación (DESPLEGABLES) -->
          <div v-else class="space-y-4">
            <div v-for="stationGroup in chargersByStation" :key="stationGroup.estacionId" class="border border-gray-200 rounded-lg overflow-hidden">
              
              <!-- Encabezado de estación (clickeable) -->
              <div 
                @click="toggleStation(stationGroup.estacionId)"
                class="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
              >
                <div class="flex items-center gap-3">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    class="h-5 w-5 transition-transform duration-200"
                    :class="expandedStations[stationGroup.estacionId] ? 'rotate-90' : ''"
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                  <h4 class="font-semibold text-lg text-gray-900">
                    📍 {{ stationGroup.estacionNombre }}
                  </h4>
                </div>
                <span class="text-sm text-gray-500 font-medium">{{ stationGroup.chargers.length }} cargadores</span>
              </div>
              
              <!-- Contenido desplegable de cargadores -->
              <div v-show="expandedStations[stationGroup.estacionId]" class="p-4 bg-white">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <ChargerCard 
                    v-for="charger in stationGroup.chargers" 
                    :key="charger.id_cargador"
                    :charger="charger"
                    :ws-status="chargerWSStates[charger.id_cargador] || 'desconectado'"
                    :current-state="chargerCurrentStates[charger.id_cargador]"
                    :telemetry="chargerTelemetry[charger.id_cargador]"
                    :iot-connected="chargerIoTStates[charger.id_cargador] || false"
                    :has-web-socket-support="hasSupport(charger.id_cargador)"
                    :show-actions="true"
                    :show-emergency-button="true"
                    @emergency="handleEmergencyStop(charger.id_cargador)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notifications -->
    <ToastNotification 
      :message="toastMessage"
      :type="toastType"
      :show="showToast"
      @close="showToast = false"
    />
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, getCurrentInstance } from 'vue';
import StatCard from '../components/StatCard.vue';
import ChargerCard from '../components/ChargerCard.vue';
import ToastNotification from '../components/ToastNotification.vue';
import { getStats } from '@/services/dashboardService';
import { useWebSocketSupport } from '@/composables/useWebSocket';
import { wsManager } from '@/services/websocketManager';

export default { 
  components: { StatCard, ChargerCard, ToastNotification },
  setup() {
    const loading = ref(true);
    const error = ref(null);
    
    const stats = ref(null);
    const chargersByStatus = ref([]);
    const chargersByStation = ref([]);
    const expandedStations = ref({}); // NUEVO: Estado de expansión
    
    // WebSocket states
    const chargerWSStates = ref({});
    const chargerCurrentStates = ref({});
    const chargerTelemetry = ref({});
    const chargerIoTStates = ref({}); // NUEVO: Estado de conexión IoT
    
    // Toast notification
    const toastMessage = ref('');
    const toastType = ref('info');
    const showToast = ref(false);
    
    // WebSocket Support
    const { hasSupport, supportedChargers } = useWebSocketSupport();
    
    // Acceder a $session
    const app = getCurrentInstance();
    const $session = app?.appContext.config.globalProperties.$session;

    // Función para mostrar notificaciones
    const showNotification = (message, type = 'info') => {
      toastMessage.value = message;
      toastType.value = type;
      showToast.value = true;
    };

    // Conectar WebSocket para un cargador
    const connectChargerWS = (chargerId) => {
      if (!hasSupport(chargerId)) {
        return;
      }

      showNotification(`Conectando al Cargador #${chargerId}...`, 'connecting');

      wsManager.connect(chargerId, {
        onStatusChange: (status) => {
          chargerWSStates.value[chargerId] = status;
          
          if (status === 'conectado') {
            showNotification(`✅ Conectado al Cargador #${chargerId}`, 'success');
          } else if (status === 'reconectando') {
            showNotification(`🔄 Reconectando al Cargador #${chargerId}...`, 'connecting');
          } else if (status === 'error') {
            showNotification(`❌ Error de conexión con Cargador #${chargerId}`, 'error');
          }
        },
        onMessage: (data) => {
          // Estado inicial (AHORA INCLUYE ESTADO IoT)
          if (data.type === 'subscribed') {
            chargerCurrentStates.value[chargerId] = data.estado_cargador;
            chargerIoTStates.value[chargerId] = data.conectado || false;
            
            if (data.conectado === false) {
              showNotification(`⚠️ Cargador #${chargerId}: IoT no está conectado`, 'warning');
            }
          }

          // Notificación de conexión/desconexión del IoT (NUEVO)
          if (data.type === 'estado_cargador' && data.hasOwnProperty('conectado')) {
            chargerIoTStates.value[chargerId] = data.conectado;
            
            if (data.conectado === true) {
              showNotification(`✅ Cargador #${chargerId}: IoT se ha CONECTADO`, 'success');
            } else {
              showNotification(`❌ Cargador #${chargerId}: IoT se ha DESCONECTADO`, 'error');
            }
          }

          // Mensajes del publisher
          if (data.from === 'publisher' && data.payload) {
            if (data.payload.type === 'telemetria') {
              chargerTelemetry.value[chargerId] = data.payload;
            }
            if (data.payload.type === 'estado_cargador') {
              chargerCurrentStates.value[chargerId] = data.payload.estado;
              showNotification(`🔄 Cargador #${chargerId} cambió a: ${data.payload.estado}`, 'info');
            }
            if (data.payload.type === 'alerta') {
              showNotification(`🚨 Alerta en Cargador #${chargerId}: ${data.payload.descripcion}`, 'warning');
            }
          }

          // Confirmación de comando
          if (data.type === 'comando_enviado') {
            showNotification(`✅ Comando enviado al Cargador #${chargerId}`, 'success');
          }

          // Error
          if (data.type === 'error') {
            showNotification(`❌ ${data.message}`, 'error');
          }
        }
      });
    };

    // Conectar a todos los cargadores con soporte WebSocket
    const connectSupportedChargers = () => {
      supportedChargers.forEach(chargerId => {
        connectChargerWS(chargerId);
      });
    };

    // Desconectar todos los WebSocket
    const disconnectAllChargers = () => {
      wsManager.disconnectAll();
      chargerWSStates.value = {};
      chargerCurrentStates.value = {};
      chargerTelemetry.value = {};
      chargerIoTStates.value = {};
    };

    // Reconectar todos los WebSocket manualmente (para botón refresh)
    const reconnectAllChargers = () => {
      showNotification('🔄 Reiniciando conexiones WebSocket...', 'connecting');
      wsManager.reconnectAll();
    };

    // Manejar paro de emergencia (AHORA cambia a fuera_servicio)
    const handleEmergencyStop = (chargerId) => {
      showNotification(`🚨 Ejecutando paro de emergencia en Cargador #${chargerId}...`, 'warning');
      const result = wsManager.detenerEnergia(chargerId);
      
      if (!result) {
        showNotification(`❌ No se pudo enviar el comando al Cargador #${chargerId}`, 'error');
      }
    };

    // Toggle expansión de estación (NUEVO)
    const toggleStation = (stationId) => {
      expandedStations.value[stationId] = !expandedStations.value[stationId];
    };
    
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

          // Agrupar cargadores por estación y ORDENAR de menor a mayor
          const stationGroups = data.estadoCargadores.reduce((acc, cargador) => {
            const estacionId = cargador.id_estacion;
            const estacionNombre = cargador.nombre_estacion || `Estación ${estacionId}`;
            
            let group = acc.find(g => g.estacionId === estacionId);
            if (!group) {
              group = {
                estacionId,
                estacionNombre,
                chargers: []
              };
              acc.push(group);
            }
            
            group.chargers.push(cargador);
            return acc;
          }, []);

          // ORDENAR estaciones de menor a mayor por ID (Estación 1, luego 2)
          stationGroups.sort((a, b) => a.estacionId - b.estacionId);

          chargersByStation.value = stationGroups;

          // Expandir todas las estaciones por defecto
          stationGroups.forEach(group => {
            expandedStations.value[group.estacionId] = true;
          });
          
          // Conectar WebSocket a cargadores soportados
          connectSupportedChargers();
        }
        
      } catch (err) {
        error.value = err.message || 'Error al cargar datos del dashboard';
        console.error('Error en dashboard:', err);
      } finally {
        loading.value = false;
      }
    };

    // Función mejorada para recargar datos Y reconectar WebSocket
    const refreshDashboard = () => {
      // Reconectar WebSocket
      reconnectAllChargers();
      // Recargar datos
      loadDashboardData();
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
        'fuera_de_servicio': 'bg-red-500',
        'fuera_servicio': 'bg-red-500',
        'mantenimiento': 'bg-gray-500'
      };
      return statusMap[estado?.toLowerCase()] || 'bg-gray-500';
    };
    
    onMounted(() => {
      loadDashboardData();
    });

    onUnmounted(() => {
      disconnectAllChargers();
    });
    
    return { 
      loading,
      error,
      stats,
      chargersByStatus,
      chargersByStation,
      expandedStations,
      chargerWSStates,
      chargerCurrentStates,
      chargerTelemetry,
      chargerIoTStates,
      toastMessage,
      toastType,
      showToast,
      hasSupport,
      toggleStation,
      loadDashboardData: refreshDashboard, // Usar función mejorada
      formatDate,
      getStatusColor,
      handleEmergencyStop
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
