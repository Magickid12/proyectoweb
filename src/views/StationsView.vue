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
                :has-web-socket-support="hasSupport(charger.id_cargador)"
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
import { ref, onMounted, getCurrentInstance } from 'vue';
import StatusBadge from '../components/StatusBadge.vue';
import ChargerCard from '../components/ChargerCard.vue';
import ToastNotification from '../components/ToastNotification.vue';
import SkeletonLoader from '../components/SkeletonLoader.vue';
import { getStationsByFranchise } from '@/services/stationsService';
import { useChargerWebSocket, useWebSocketSupport } from '@/composables/useWebSocket';
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
    const chargerIoTStates = ref({}); // NUEVO: Estado de conexión IoT
    
    // Toast notification
    const toastMessage = ref('');
    const toastType = ref('info');
    const showToast = ref(false);
    
    // WebSocket Support
    const { hasSupport } = useWebSocketSupport();

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
            showNotification(`Conectado al Cargador #${chargerId}`, 'success');
          } else if (status === 'reconectando') {
            showNotification(`Reconectando al Cargador #${chargerId}...`, 'connecting');
          } else if (status === 'error') {
            showNotification(`Error de conexión con Cargador #${chargerId}`, 'error');
          }
        },
        onMessage: (data) => {
          // Estado inicial (AHORA INCLUYE ESTADO IoT)
          if (data.type === 'subscribed') {
            chargerCurrentStates.value[chargerId] = data.estado_cargador;
            chargerIoTStates.value[chargerId] = data.conectado || false;
          }

          // Notificación de conexión/desconexión del dispositivo (NUEVO)
          if (data.type === 'estado_cargador' && data.hasOwnProperty('conectado')) {
            chargerIoTStates.value[chargerId] = data.conectado;
            
            if (data.conectado === true) {
              showNotification(`Cargador #${chargerId} se ha conectado`, 'success');
            } else {
              showNotification(`Cargador #${chargerId} se ha desconectado`, 'error');
            }
          }

          // Mensajes del publisher
          if (data.from === 'publisher' && data.payload) {
            if (data.payload.type === 'telemetria') {
              chargerTelemetry.value[chargerId] = data.payload;
            }
            if (data.payload.type === 'estado_cargador') {
              chargerCurrentStates.value[chargerId] = data.payload.estado;
              showNotification(`Cargador #${chargerId} cambió a: ${data.payload.estado}`, 'info');
            }
            if (data.payload.type === 'alerta') {
              showNotification(`Alerta en Cargador #${chargerId}: ${data.payload.descripcion}`, 'warning');
            }
          }

          // NUEVO: Manejar mensaje directo de estado_cargador (cambiar_estado, detener_energia)
          if (data.type === 'estado_cargador' && data.command && data.estado) {
            chargerCurrentStates.value[chargerId] = data.estado;
            console.log(`[Stations] Estado actualizado a ${data.estado} por comando ${data.command}`);
            
            if (data.command === 'detener_energia') {
              showNotification(`Paro de emergencia ejecutado. Cargador #${chargerId} está fuera de servicio`, 'warning');
            } else if (data.command === 'cambiar_estado') {
              showNotification(`Cargador #${chargerId} cambió a: ${data.estado}`, 'success');
            } else {
              showNotification(`Cargador #${chargerId} cambió a: ${data.estado}`, 'info');
            }
          }

          // Confirmación de comando
          if (data.type === 'comando_enviado') {
            showNotification(`Comando enviado al Cargador #${chargerId}`, 'success');
          }

          // Error
          if (data.type === 'error') {
            showNotification(`Error: ${data.message}`, 'error');
          }
        }
      });
    };

    // Desconectar WebSocket de un cargador
    const disconnectChargerWS = (chargerId) => {
      wsManager.disconnect(chargerId);
      delete chargerWSStates.value[chargerId];
      delete chargerCurrentStates.value[chargerId];
      delete chargerTelemetry.value[chargerId];
      delete chargerIoTStates.value[chargerId];
    };

    // Reconectar todos los WebSocket manualmente (para botón refresh)
    const reconnectAllChargers = () => {
      showNotification('Reiniciando conexiones WebSocket...', 'connecting');
      
      // Obtener todos los cargadores actualmente conectados
      const connectedChargers = Object.keys(chargerWSStates.value).map(id => parseInt(id));
      
      // Desconectar todos
      connectedChargers.forEach(id => disconnectChargerWS(id));
      
      // Reconectar después de un momento
      setTimeout(() => {
        connectedChargers.forEach(id => connectChargerWS(id));
      }, 1000);
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
      // Reconectar WebSocket de cargadores activos
      reconnectAllChargers();
      // Recargar datos
      loadData();
    };
    
    const toggleStation = (stationId) => {
      const index = expandedStations.value.indexOf(stationId);
      if (index > -1) {
        // Colapsar: desconectar cargadores de esta estación
        expandedStations.value.splice(index, 1);
        
        const chargers = stationChargers.value[stationId] || [];
        chargers.forEach(charger => {
          if (hasSupport(charger.id_cargador)) {
            disconnectChargerWS(charger.id_cargador);
          }
        });
      } else {
        // Expandir: conectar a cargadores con soporte WebSocket
        expandedStations.value.push(stationId);
        
        const chargers = stationChargers.value[stationId] || [];
        chargers.forEach(charger => {
          if (hasSupport(charger.id_cargador)) {
            connectChargerWS(charger.id_cargador);
          }
        });
      }
    };

    // Manejar cambio a mantenimiento
    const handleMaintenanceChange = (chargerId) => {
      showNotification(`Cambiando Cargador #${chargerId} a mantenimiento...`, 'info');
      wsManager.cambiarEstado(chargerId, 'mantenimiento');
    };
    
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('es-MX');
    };
    
    onMounted(() => {
      loadData();
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
      hasSupport,
      loadData,
      refreshStations,
      toggleStation,
      formatDate,
      handleMaintenanceChange
    };
  }
};
</script>
