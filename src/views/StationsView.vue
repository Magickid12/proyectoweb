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

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
      {{ error }}
    </div>

    <!-- Stations List with Expandable Chargers -->
    <div v-else class="space-y-4">
      <div v-if="stationsData.length === 0" class="text-center py-12 text-gray-500 bg-white rounded-xl shadow border border-gray-100">
        📍 No hay estaciones registradas
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
                <p class="text-sm text-gray-600">📍 {{ station.direccion }}</p>
              </div>
            </div>
            
            <!-- Station Stats -->
            <div class="flex items-center gap-6">
              <div class="text-center">
                <div class="text-2xl font-bold text-primary">{{ station.total_cargadores || 0 }}</div>
                <div class="text-xs text-gray-500">Cargadores</div>
              </div>
              
              <div class="flex flex-col gap-2">
                <a 
                  v-if="station.ubicacion_lat && station.ubicacion_lon"
                  :href="`https://www.google.com/maps?q=${station.ubicacion_lat},${station.ubicacion_lon}`"
                  target="_blank"
                  @click.stop
                  class="text-primary hover:text-primary-dark text-sm font-medium"
                >
                  📍 Ver en mapa
                </a>
                <button 
                  @click.stop="openAssignRateModal(station)"
                  class="text-primary hover:text-primary-dark text-sm font-medium"
                >
                  💰 Asignar Tarifa
                </button>
              </div>
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
            🔌 No hay cargadores en esta estación
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

    <!-- Modal Asignar Tarifa -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 class="text-xl font-bold mb-4">Asignar Tarifa a {{ selectedStation?.nombre_estacion }}</h3>
        
        <form @submit.prevent="assignRate" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Carga</label>
            <select v-model="rateForm.tipo_carga" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
              <option value="">Seleccionar...</option>
              <option value="lenta">Lenta (7-22 kW)</option>
              <option value="normal">Normal</option>
              <option value="rapida">Rápida (50-75 kW)</option>
              <option value="ultrarapida">Ultra Rápida (>150 kW)</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Costo por kWh (MXN)</label>
            <input 
              v-model.number="rateForm.costo_kw_h" 
              type="number" 
              step="0.01" 
              min="0"
              required 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="0.45"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Costo por Minuto (MXN)</label>
            <input 
              v-model.number="rateForm.costo_tiempo_min" 
              type="number" 
              step="0.01" 
              min="0"
              required 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="0.10"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio Vigencia</label>
            <input 
              v-model="rateForm.fecha_inicio_vigencia" 
              type="date" 
              required 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Fin Vigencia (Opcional)</label>
            <input 
              v-model="rateForm.fecha_fin_vigencia" 
              type="date" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div v-if="modalError" class="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {{ modalError }}
          </div>

          <div class="flex gap-3 pt-2">
            <button 
              type="button" 
              @click="closeModal"
              :disabled="savingRate"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              :disabled="savingRate"
              class="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ savingRate ? 'Guardando...' : 'Asignar Tarifa' }}
            </button>
          </div>
        </form>
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
import { getStationsByFranchise } from '@/services/stationsService';
import { useChargerWebSocket, useWebSocketSupport } from '@/composables/useWebSocket';
import { wsManager } from '@/services/websocketManager';

export default {
  components: { StatusBadge, ChargerCard, ToastNotification },
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
    
    const showModal = ref(false);
    const selectedStation = ref(null);
    const savingRate = ref(false);
    const modalError = ref(null);
    
    const rateForm = ref({
      tipo_carga: '',
      costo_kw_h: null,
      costo_tiempo_min: null,
      fecha_inicio_vigencia: new Date().toISOString().split('T')[0],
      fecha_fin_vigencia: ''
    });

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
      showNotification('🔄 Reiniciando conexiones WebSocket...', 'connecting');
      
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
      showNotification(`🔧 Cambiando Cargador #${chargerId} a mantenimiento...`, 'info');
      wsManager.cambiarEstado(chargerId, 'mantenimiento');
    };
    
    const getChargerRate = (charger) => {
      // Aquí podrías obtener la tarifa real del cargador si está disponible
      // Por ahora mostramos un valor simulado basado en el tipo
      const rates = {
        'lenta': '$3.50/kWh',
        'rapida': '$5.00/kWh',
        'ultra_rapida': '$7.50/kWh'
      };
      return rates[charger.tipo_carga] || 'N/A';
    };
    
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('es-MX');
    };
    
    const openAssignRateModal = (station) => {
      selectedStation.value = station;
      showModal.value = true;
      modalError.value = null;
      
      // Reset form
      rateForm.value = {
        tipo_carga: '',
        costo_kw_h: null,
        costo_tiempo_min: null,
        fecha_inicio_vigencia: new Date().toISOString().split('T')[0],
        fecha_fin_vigencia: ''
      };
    };
    
    const closeModal = () => {
      showModal.value = false;
      selectedStation.value = null;
      modalError.value = null;
    };
    
    const assignRate = async () => {
      try {
        savingRate.value = true;
        modalError.value = null;
        
        const payload = {
          tipo_carga: rateForm.value.tipo_carga,
          costo_kw_h: parseFloat(rateForm.value.costo_kw_h),
          costo_tiempo_min: parseFloat(rateForm.value.costo_tiempo_min),
          fecha_inicio_vigencia: rateForm.value.fecha_inicio_vigencia
        };
        
        if (rateForm.value.fecha_fin_vigencia) {
          payload.fecha_fin_vigencia = rateForm.value.fecha_fin_vigencia;
        }
        
        // await assignRateToStation(selectedStation.value.id_estacion, payload);
        
        alert(`✅ Tarifa asignada exitosamente a ${selectedStation.value.nombre_estacion}`);
        closeModal();
        
      } catch (err) {
        modalError.value = err.message || 'Error al asignar tarifa';
        console.error('Error asignando tarifa:', err);
      } finally {
        savingRate.value = false;
      }
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
      showModal,
      selectedStation,
      savingRate,
      modalError,
      rateForm,
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
      getChargerRate,
      formatDate,
      openAssignRateModal,
      closeModal,
      assignRate,
      handleMaintenanceChange
    };
  }
};
</script>
