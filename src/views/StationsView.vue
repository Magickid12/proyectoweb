<template>
  <div class="p-8">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-3xl font-bold">Gestión de Estaciones y Cargadores</h2>
      <button @click="loadData" class="text-gray-500 hover:text-gray-700" title="Recargar">
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
              <div 
                v-for="charger in stationChargers[station.id_estacion]" 
                :key="charger.id_cargador"
                class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div class="flex items-start justify-between mb-3">
                  <div>
                    <div class="font-semibold text-gray-900">Cargador #{{ charger.id_cargador }}</div>
                    <div class="text-xs text-gray-500 mt-1">{{ formatDate(charger.fecha_instalacion) }}</div>
                  </div>
                  <StatusBadge :status="charger.estado" />
                </div>
                
                <div class="space-y-2 text-sm">
                  <div class="flex items-center justify-between">
                    <span class="text-gray-600">Tipo:</span>
                    <span 
                      class="px-2 py-1 text-xs rounded-full font-medium"
                      :class="{
                        'bg-green-100 text-green-800': charger.tipo_carga === 'lenta',
                        'bg-blue-100 text-blue-800': charger.tipo_carga === 'rapida',
                        'bg-purple-100 text-purple-800': charger.tipo_carga === 'ultra_rapida'
                      }"
                    >
                      {{ charger.tipo_carga }}
                    </span>
                  </div>
                  
                  <div class="flex items-center justify-between">
                    <span class="text-gray-600">Capacidad:</span>
                    <span class="font-semibold text-gray-900">{{ parseFloat(charger.capacidad_kw).toFixed(0) }} kW</span>
                  </div>
                  
                  <div class="flex items-center justify-between">
                    <span class="text-gray-600">Precio:</span>
                    <span class="font-semibold text-primary">{{ getChargerRate(charger) }}</span>
                  </div>
                  
                  <div class="flex items-center justify-between">
                    <span class="text-gray-600">Firmware:</span>
                    <span class="text-xs text-gray-500">{{ charger.firmware_version || 'N/A' }}</span>
                  </div>
                </div>
              </div>
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
  </div>
</template>

<script>
import { ref, onMounted, getCurrentInstance } from 'vue';
import StatusBadge from '../components/StatusBadge.vue';
import { getStationsByFranchise } from '@/services/stationsService';
import { useWebSocketAuto } from '@/composables/useWebSocket';

export default {
  components: { StatusBadge },
  setup() {
    const loading = ref(true);
    const error = ref(null);
    const stationsData = ref([]);
    const expandedStations = ref([]);
    const stationChargers = ref({});
    const loadingChargers = ref({});
    
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
    
    // Conectar WebSocket para actualizaciones en tiempo real
    const ws = useWebSocketAuto(
      localStorage.getItem('evconnect_token'),
      {
        // Handler para actualizaciones de estaciones
        'station:update': (data) => {
          console.log('[Estaciones] Actualización recibida:', data);
          loadData();
        },
        // Handler para cambios de estado de cargadores
        'charger:statusChanged': (data) => {
          console.log('[Estaciones] Estado de cargador cambió:', data);
          // Actualizar el cargador específico si está en la lista
          if (data.id_estacion && data.id_cargador) {
            const station = stationsData.value.find(s => s.id_estacion === data.id_estacion);
            if (station && station.cargadores) {
              const charger = station.cargadores.find(c => c.id_cargador === data.id_cargador);
              if (charger && data.estado) {
                charger.estado = data.estado;
              }
            }
          }
        },
        // Handler de conexión
        'connected': () => {
          console.log('[Estaciones] WebSocket conectado');
        }
      }
    );
    
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
    
    const toggleStation = (stationId) => {
      const index = expandedStations.value.indexOf(stationId);
      if (index > -1) {
        expandedStations.value.splice(index, 1);
      } else {
        expandedStations.value.push(stationId);
      }
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
        
        await assignRateToStation(selectedStation.value.id_estacion, payload);
        
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
      loadData,
      toggleStation,
      getChargerRate,
      formatDate,
      openAssignRateModal,
      closeModal,
      assignRate
    };
  }
};
</script>
