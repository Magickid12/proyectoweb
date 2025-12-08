<template>
  <div class="p-8">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-3xl font-bold">Gestión de Estaciones y Cargadores</h2>
      <button @click="refreshStations" class="text-gray-500 hover:text-gray-700" title="Recargar y Reconectar WebSocket">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>

    <!-- Loading State con Skeleton -->
    <SkeletonLoader v-if="loading" type="stations" />

    <!-- Error State -->
    <div v-else-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
      {{ error }}
    </div>

    <!-- Stations List with Expandable Chargers -->
    <div v-else class="space-y-4">
      <div v-if="stationsData.length === 0" class="text-center py-12 text-gray-500 bg-white rounded-xl shadow border border-gray-100">
        <i class="fas fa-building text-4xl mb-3"></i>
        <div>No hay estaciones registradas</div>
      </div>
      
      <!-- Station Card -->
      <div 
        v-for="station in stationsData" 
        :key="station.id_estacion" 
        class="bg-white rounded-xl shadow border border-gray-100 overflow-hidden"
      >
        <!-- Station Header -->
        <div 
          @click="toggleStation(station.id_estacion)"
          class="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4 flex-1">
              <!-- Toggle Icon -->
              <div class="text-primary text-xl">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  class="h-6 w-6 transform transition-transform duration-200"
                  :class="{ 'rotate-90': expandedStations.includes(station.id_estacion) }"
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
              
              <!-- Station Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-3 mb-1">
                  <h3 class="text-lg font-bold text-gray-900">#{{ station.id_estacion }} - {{ station.nombre_estacion }}</h3>
                  <StatusBadge :status="station.estado_operacion" />
                </div>
                <p class="text-sm text-gray-600 flex items-center gap-1">
                  <i class="fas fa-map-marker-alt text-primary"></i>
                  {{ station.direccion }}
                </p>
              </div>
            </div>
            
            <!-- Station Stats -->
            <div class="flex items-center gap-6">
              <div class="text-center">
                <div class="text-2xl font-bold text-primary">{{ station.total_cargadores || 0 }}</div>
                <div class="text-xs text-gray-500">Cargadores</div>
              </div>
              
              <!-- <div class="flex items-center gap-2 text-sm text-gray-600">
                <i class="fas fa-calendar-alt"></i>
                <span>{{ formatDate(station.fecha_registro) }}</span>
              </div> -->
            </div>
          </div>
        </div>
        
        <!-- Chargers List (Expandable) -->
        <div 
          v-if="expandedStations.includes(station.id_estacion)"
          class="border-t border-gray-200 bg-gray-50"
        >
          <div v-if="loadingChargers[station.id_estacion]" class="p-8 text-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p class="text-sm text-gray-500 mt-2">Cargando cargadores...</p>
          </div>
          
          <div v-else-if="!stationChargers[station.id_estacion] || stationChargers[station.id_estacion].length === 0" class="p-8 text-center text-gray-500">
            <i class="fas fa-plug text-3xl mb-2"></i>
            <div>No hay cargadores en esta estación</div>
          </div>
          
          <div v-else class="p-6">
            <h4 class="text-sm font-semibold text-gray-700 uppercase mb-4">Cargadores de la estación</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <ChargerCard 
                v-for="charger in stationChargers[station.id_estacion]" 
                :key="charger.id_cargador"
                :charger="charger"
                :ws-status="chargerWSStates[charger.id_cargador] || 'desconectado'"
                :current-state="chargerCurrentStates[charger.id_cargador]"
                :telemetry="chargerTelemetry[charger.id_cargador]"
                :iot-connected="chargerIoTStates[charger.id_cargador] || false"
                :has-web-socket-support="hasSupport(station.id_estacion)"
                :show-actions="true"
                :show-maintenance-button="true"
                @maintenance="handleMaintenanceChange(charger.id_cargador)"
              />
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
import { ref, onMounted, onUnmounted } from 'vue';
import StatusBadge from '../components/StatusBadge.vue';
import ChargerCard from '../components/ChargerCard.vue';
import ToastNotification from '../components/ToastNotification.vue';
import SkeletonLoader from '../components/SkeletonLoader.vue';
import { getStationsByFranchise } from '@/services/stationsService';
import { stopChargerByMonitor } from '@/services/sessionsService';
import { wsManager } from '@/services/websocketManager';

export default {
  components: { StatusBadge, ChargerCard, ToastNotification, SkeletonLoader },
  setup() {
    const loading = ref(true);
    const error = ref(null);
    const stationsData = ref([]);
    const expandedStations = ref([]);
    const stationChargers = ref({});
    const loadingChargers = ref({});
    
    // WebSocket states por cargador
    const chargerWSStates = ref({});
    const chargerCurrentStates = ref({});
    const chargerTelemetry = ref({});
    const chargerIoTStates = ref({});
    
    // Toast notification
    const toastMessage = ref('');
    const toastType = ref('info');
    const showToast = ref(false);

    // Función para mostrar notificaciones
    const showNotification = (message, type = 'info') => {
      toastMessage.value = message;
      toastType.value = type;
      showToast.value = true;
    };

    // Conectar WebSocket para una estación completa
    const connectStationWS = (stationId, stationName) => {
      if (!wsManager.hasWebSocketSupport(stationId)) {
        return;
      }

      showNotification(`Conectando a ${stationName}...`, 'connecting');

      wsManager.connect(stationId, {
        onStatusChange: (status) => {
          // Actualizar el estado WS de TODOS los cargadores de esta estación
          const chargers = stationChargers.value[stationId] || [];
          chargers.forEach(charger => {
            chargerWSStates.value[charger.id_cargador] = status;
          });

          if (status === 'conectado') {
            showNotification(`Conectado a ${stationName}`, 'success');
          } else if (status === 'reconectando') {
            showNotification(`Reconectando a ${stationName}...`, 'connecting');
          } else if (status === 'error') {
            showNotification(`Error de conexión con ${stationName}`, 'error');
          }
        },
        onMessage: (data) => {
          // Estado de estación (inicial o actualización)
          if (data.type === 'estado_estacion' && data.cargadores) {
            data.cargadores.forEach(cargador => {
              const cargadorId = cargador.id_cargador;
              const estadoAnterior = chargerCurrentStates.value[cargadorId];
              const conectadoAnterior = chargerIoTStates.value[cargadorId];
              
              chargerCurrentStates.value[cargadorId] = cargador.estado;
              chargerIoTStates.value[cargadorId] = cargador.conectado || false;
              
              // Notificar cambios significativos
              if (estadoAnterior && estadoAnterior !== cargador.estado) {
                showNotification(
                  `Cargador #${cargadorId} cambió a: ${cargador.estado}`,
                  cargador.estado === 'fuera_de_servicio' ? 'warning' : 'info'
                );
              }
              
              if (conectadoAnterior !== undefined && conectadoAnterior !== cargador.conectado) {
                showNotification(
                  `Cargador #${cargadorId} ${cargador.conectado ? 'conectado' : 'desconectado'}`,
                  cargador.conectado ? 'success' : 'error'
                );
              }
            });
            
            // Log solo en primer mensaje (inicial)
            const esInicial = !estadoAnterior;
            if (esInicial) {
              console.log(`[Stations] Estado inicial sincronizado para ${stationName}:`, data.cargadores);
            }
          }

          // Confirmación de comando
          if (data.type === 'comando_enviado') {
            showNotification(`Comando enviado a ${stationName}`, 'success');
          }

          // Error
          if (data.type === 'error') {
            showNotification(`Error: ${data.message}`, 'error');
          }
        }
      });
    };

    // Desconectar WebSocket de una estación
    const disconnectStationWS = (stationId) => {
      wsManager.disconnect(stationId);
      // Limpiar estados de los cargadores de esta estación
      const chargers = stationChargers.value[stationId] || [];
      chargers.forEach(charger => {
        delete chargerWSStates.value[charger.id_cargador];
        delete chargerCurrentStates.value[charger.id_cargador];
        delete chargerTelemetry.value[charger.id_cargador];
        delete chargerIoTStates.value[charger.id_cargador];
      });
    };

    // Desconectar todas las estaciones
    const disconnectAllStations = () => {
      wsManager.disconnectAll();
      chargerWSStates.value = {};
      chargerCurrentStates.value = {};
      chargerTelemetry.value = {};
      chargerIoTStates.value = {};
    };

    // Reconectar todos los WebSocket manualmente (para botón refresh)
    const reconnectAllStations = () => {
      showNotification('Reiniciando conexiones WebSocket...', 'connecting');
      wsManager.reconnectAll();
    };
    
    const loadData = async () => {
      try {
        loading.value = true;
        error.value = null;
        
        // Cargar estaciones de la franquicia (ya incluye cargadores)
        const stations = await getStationsByFranchise();
        
        stationsData.value = stations;
        
        // Organizar cargadores por estación desde los datos incluidos
        stationChargers.value = {};
        stations.forEach(station => {
          if (station.cargadores && Array.isArray(station.cargadores)) {
            stationChargers.value[station.id_estacion] = station.cargadores;
          }
        });
        
      } catch (err) {
        error.value = err.message || 'Error al cargar datos';
        console.error('Error cargando datos:', err);
      } finally {
        loading.value = false;
      }
    };

    // Función mejorada para recargar datos Y reconectar WebSocket
    const refreshStations = () => {
      // Reconectar WebSocket de estaciones activas
      reconnectAllStations();
      // Recargar datos
      loadData();
    };
    
    const toggleStation = (stationId) => {
      const index = expandedStations.value.indexOf(stationId);
      const station = stationsData.value.find(s => s.id_estacion === stationId);
      
      if (index > -1) {
        // Colapsar: desconectar estación
        expandedStations.value.splice(index, 1);
        
        if (wsManager.hasWebSocketSupport(stationId)) {
          disconnectStationWS(stationId);
        }
      } else {
        // Expandir: conectar a la estación con soporte WebSocket
        expandedStations.value.push(stationId);
        
        if (wsManager.hasWebSocketSupport(stationId) && station) {
          connectStationWS(stationId, station.nombre_estacion);
        }
      }
    };

    // Manejar cambio a mantenimiento (via REST API)
    const handleMaintenanceChange = async (chargerId) => {
      if (!confirm(`¿Está seguro de poner el Cargador #${chargerId} en mantenimiento?`)) {
        return;
      }

      showNotification(`Cambiando Cargador #${chargerId} a mantenimiento...`, 'info');
      
      try {
        // Usar el endpoint de paro de emergencia (cambia a fuera_de_servicio)
        const result = await stopChargerByMonitor(chargerId);
        
        if (result.success) {
          showNotification(
            `Cargador #${chargerId} puesto en mantenimiento`, 
            'success'
          );
          // El WebSocket notificará el cambio de estado automáticamente
        }
      } catch (error) {
        showNotification(
          error.message || `Error al cambiar estado del Cargador #${chargerId}`, 
          'error'
        );
      }
    };
    
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('es-MX');
    };
    
    onMounted(() => {
      loadData();
    });

    onUnmounted(() => {
      disconnectAllStations();
    });
    
    return {
      loading,
      error,
      stationsData,
      expandedStations,
      stationChargers,
      loadingChargers,
      chargerWSStates,
      chargerCurrentStates,
      chargerTelemetry,
      chargerIoTStates,
      toastMessage,
      toastType,
      showToast,
      hasSupport: (stationId) => wsManager.hasWebSocketSupport(stationId),
      loadData,
      refreshStations,
      toggleStation,
      formatDate,
      handleMaintenanceChange
    };
  }
};
</script>
