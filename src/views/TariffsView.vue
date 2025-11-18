<template>
  <div class="p-8">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-3xl font-bold">Gestión de Tarifas por Estación</h2>
      <button @click="loadData" class="text-gray-500 hover:text-gray-700" title="Recargar">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>

    <!-- Loading State -->
    <SkeletonLoader v-if="loading" type="tariffs" />

    <!-- Error State -->
    <div v-else-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
      {{ error }}
    </div>

    <!-- Stations List with Expandable Rates -->
    <div v-else class="space-y-4">
      <div v-if="stations.length === 0" class="text-center py-12 text-gray-500 bg-white rounded-xl shadow border border-gray-100">
        No hay estaciones registradas
      </div>
      
      <!-- Station Card -->
      <div 
        v-for="station in stations" 
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
                <h3 class="text-lg font-bold text-gray-900">#{{ station.id_estacion }} - {{ station.nombre_estacion }}</h3>
                <p class="text-sm text-gray-600">{{ station.direccion }}</p>
              </div>
            </div>
            
            <!-- Station Stats -->
            <div class="text-right">
              <div class="text-sm text-gray-500">
                {{ getTarifasCount(station.id_estacion) }} tarifas configuradas
              </div>
            </div>
          </div>
        </div>
        
        <!-- Rates List (Expandable) -->
        <div 
          v-if="expandedStations.includes(station.id_estacion)"
          class="border-t border-gray-200 bg-gray-50 p-6"
        >
          <div class="space-y-4">
            <!-- Carga Lenta -->
            <div class="bg-white rounded-lg p-5 border border-gray-200">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                  <h4 class="font-semibold text-gray-900">Carga Lenta (7-22 kW)</h4>
                </div>
                <span class="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                  lenta
                </span>
              </div>
              
              <div v-if="getStationRate(station.id_estacion, 'lenta')" class="space-y-3">
                <!-- Mostrar Valores Actuales -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Costo por kWh Actual -->
                  <div class="bg-gray-50 p-3 rounded-lg">
                    <label class="block text-xs font-medium text-gray-500 mb-1">
                      Costo por kWh (MXN)
                    </label>
                    <div class="text-2xl font-bold text-gray-900">
                      ${{ parseFloat(getStationRate(station.id_estacion, 'lenta').costo_kw_h || 0).toFixed(2) }}
                    </div>
                  </div>
                  
                  <!-- Costo por Minuto Actual -->
                  <div class="bg-gray-50 p-3 rounded-lg">
                    <label class="block text-xs font-medium text-gray-500 mb-1">
                      Costo por Minuto (MXN)
                    </label>
                    <div class="text-2xl font-bold text-gray-900">
                      ${{ parseFloat(getStationRate(station.id_estacion, 'lenta').costo_tiempo_min || 0).toFixed(2) }}
                    </div>
                  </div>
                </div>
                
                <!-- Botón Editar -->
                <div class="flex items-center justify-between pt-3 border-t">
                  <div class="text-xs text-gray-500">
                    Vigencia: {{ formatDate(getStationRate(station.id_estacion, 'lenta').fecha_inicio_vigencia) }}
                    <span v-if="getStationRate(station.id_estacion, 'lenta').fecha_fin_vigencia">
                      - {{ formatDate(getStationRate(station.id_estacion, 'lenta').fecha_fin_vigencia) }}
                    </span>
                    <span v-else class="text-green-600 font-medium">- Sin límite</span>
                  </div>
                    <button 
                    @click="openEditModal(station.id_estacion, 'lenta')"
                    class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark text-sm font-medium flex items-center"
                    >
                    <i class="fas fa-edit mr-2" aria-hidden="true"></i>
                    Editar Precios
                    </button>
                </div>
              </div>
              
              <!-- No hay tarifa -->
              <div v-else class="text-center py-4">
                <p class="text-gray-500 mb-3">No hay tarifa configurada para carga lenta</p>
                <button 
                  @click="createNewRate(station.id_estacion, 'lenta')"
                  class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark text-sm"
                >
                  + Crear Tarifa Lenta
                </button>
              </div>
            </div>
            
            <!-- Carga Rápida -->
            <div class="bg-white rounded-lg p-5 border border-gray-200">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <h4 class="font-semibold text-gray-900">Carga Rápida (50-75 kW)</h4>
                </div>
                <span class="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                  rapida
                </span>
              </div>
              
              <div v-if="getStationRate(station.id_estacion, 'rapida')" class="space-y-3">
                <!-- Mostrar Valores Actuales -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Costo por kWh Actual -->
                  <div class="bg-gray-50 p-3 rounded-lg">
                    <label class="block text-xs font-medium text-gray-500 mb-1">
                      Costo por kWh (MXN)
                    </label>
                    <div class="text-2xl font-bold text-gray-900">
                      ${{ parseFloat(getStationRate(station.id_estacion, 'rapida').costo_kw_h || 0).toFixed(2) }}
                    </div>
                  </div>
                  
                  <!-- Costo por Minuto Actual -->
                  <div class="bg-gray-50 p-3 rounded-lg">
                    <label class="block text-xs font-medium text-gray-500 mb-1">
                      Costo por Minuto (MXN)
                    </label>
                    <div class="text-2xl font-bold text-gray-900">
                      ${{ parseFloat(getStationRate(station.id_estacion, 'rapida').costo_tiempo_min || 0).toFixed(2) }}
                    </div>
                  </div>
                </div>
                
                <!-- Botón Editar -->
                <div class="flex items-center justify-between pt-3 border-t">
                  <div class="text-xs text-gray-500">
                    Vigencia: {{ formatDate(getStationRate(station.id_estacion, 'rapida').fecha_inicio_vigencia) }}
                    <span v-if="getStationRate(station.id_estacion, 'rapida').fecha_fin_vigencia">
                      - {{ formatDate(getStationRate(station.id_estacion, 'rapida').fecha_fin_vigencia) }}
                    </span>
                    <span v-else class="text-green-600 font-medium">- Sin límite</span>
                  </div>
                  <button 
                    @click="openEditModal(station.id_estacion, 'rapida')"
                    class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark text-sm font-medium flex items-center"
                  >
                    <i class="fas fa-edit mr-2" aria-hidden="true"></i>
                    Editar Precios
                  </button>
                </div>
              </div>
              
              <!-- No hay tarifa -->
              <div v-else class="text-center py-4">
                <p class="text-gray-500 mb-3">No hay tarifa configurada para carga rápida</p>
                <button 
                  @click="createNewRate(station.id_estacion, 'rapida')"
                  class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark text-sm"
                >
                  + Crear Tarifa Rápida
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Edición/Creación -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 class="text-xl font-bold mb-4">
          {{ isCreatingNew ? 'Crear Nueva Tarifa' : 'Editar Tarifa' }} - {{ editingTipoCarga === 'lenta' ? 'Carga Lenta' : 'Carga Rápida' }}
        </h3>
        
        <form @submit.prevent="isCreatingNew ? saveNewRate() : saveEditedRate()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Costo por kWh (MXN) <span class="text-red-500">*</span>
            </label>
            <input 
              v-model.number="editForm.costo_kw_h"
              type="number" 
              step="0.01" 
              min="0"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="0.00"
            />
            <p class="text-xs text-gray-500 mt-1">Precio por cada kilovatio-hora consumido</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Costo por Minuto (MXN) <span class="text-red-500">*</span>
            </label>
            <input 
              v-model.number="editForm.costo_tiempo_min"
              type="number" 
              step="0.01" 
              min="0"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="0.00"
            />
            <p class="text-xs text-gray-500 mt-1">Precio por cada minuto de carga</p>
          </div>

          <div v-if="isCreatingNew">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Inicio de Vigencia <span class="text-red-500">*</span>
            </label>
            <input 
              v-model="editForm.fecha_inicio_vigencia"
              type="date" 
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <p class="text-xs text-gray-500 mt-1">Fecha desde la cual esta tarifa será válida</p>
          </div>

          <div v-if="editError" class="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {{ editError }}
          </div>

          <div class="flex gap-3 pt-2">
            <button 
              type="button" 
              @click="closeEditModal"
              :disabled="saving"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              :disabled="saving"
              class="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ saving ? 'Guardando...' : (isCreatingNew ? 'Crear Tarifa' : 'Guardar Cambios') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de Confirmación -->
    <div v-if="showConfirmModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
        <h3 class="text-xl font-bold mb-4">{{ confirmMessage }}</h3>
        <div class="flex gap-3">
          <button 
            @click="showConfirmModal = false"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, reactive } from 'vue';
import { getRates, createRate, updateRate } from '@/services/ratesService';
import { getStationsByFranchise } from '@/services/stationsService';
import SkeletonLoader from '@/components/SkeletonLoader.vue';

export default {
  components: { SkeletonLoader },
  setup() {
    const loading = ref(true);
    const error = ref(null);
    const rates = ref([]);
    const stations = ref([]);
    const expandedStations = ref([]);
    
    // Modal de Confirmación
    const showConfirmModal = ref(false);
    const confirmMessage = ref('');
    
    // Modal de Edición/Creación
    const showEditModal = ref(false);
    const isCreatingNew = ref(false);
    const editingStationId = ref(null);
    const editingTipoCarga = ref(null);
    const editingRateId = ref(null);
    const editForm = reactive({
      costo_kw_h: 0,
      costo_tiempo_min: 0,
      fecha_inicio_vigencia: ''
    });
    const editError = ref(null);
    const saving = ref(false);
    
    const loadData = async () => {
      try {
        loading.value = true;
        error.value = null;
        
        // Cargar estaciones y tarifas
        const [stationsData, ratesData] = await Promise.all([
          getStationsByFranchise(),
          getRates()
        ]);
        
        stations.value = stationsData;
        rates.value = Array.isArray(ratesData) ? ratesData : [];
        
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
    
    const getStationRate = (stationId, tipoCarga) => {
      return rates.value.find(
        rate => rate.id_estacion === stationId && rate.tipo_carga === tipoCarga
      );
    };
    
    const getTarifasCount = (stationId) => {
      return rates.value.filter(rate => rate.id_estacion === stationId).length;
    };
    
    
    const openEditModal = (stationId, tipoCarga) => {
      const rate = getStationRate(stationId, tipoCarga);
      
      if (!rate) {
        confirmMessage.value = 'Error: No se encontró la tarifa';
        showConfirmModal.value = true;
        return;
      }
      
      // Modo edición
      isCreatingNew.value = false;
      
      // Guardar información de la tarifa a editar
      editingStationId.value = stationId;
      editingTipoCarga.value = tipoCarga;
      editingRateId.value = rate.id_tarifa;
      
      // Cargar valores actuales en el formulario
      editForm.costo_kw_h = parseFloat(rate.costo_kw_h) || 0;
      editForm.costo_tiempo_min = parseFloat(rate.costo_tiempo_min) || 0;
      editForm.fecha_inicio_vigencia = '';
      
      // Limpiar error y mostrar modal
      editError.value = null;
      showEditModal.value = true;
    };
    
    const openCreateModal = (stationId, tipoCarga) => {
      // Modo creación
      isCreatingNew.value = true;
      
      // Guardar información de la nueva tarifa
      editingStationId.value = stationId;
      editingTipoCarga.value = tipoCarga;
      editingRateId.value = null;
      
      // Limpiar formulario y establecer fecha actual
      editForm.costo_kw_h = 0;
      editForm.costo_tiempo_min = 0;
      editForm.fecha_inicio_vigencia = new Date().toISOString().split('T')[0];
      
      // Limpiar error y mostrar modal
      editError.value = null;
      showEditModal.value = true;
    };
    
    const closeEditModal = () => {
      showEditModal.value = false;
      isCreatingNew.value = false;
      editingStationId.value = null;
      editingTipoCarga.value = null;
      editingRateId.value = null;
      editForm.costo_kw_h = 0;
      editForm.costo_tiempo_min = 0;
      editForm.fecha_inicio_vigencia = '';
      editError.value = null;
    };
    
    const saveEditedRate = async () => {
      try {
        saving.value = true;
        editError.value = null;
        
        // Validaciones
        if (editForm.costo_kw_h < 0 || editForm.costo_tiempo_min < 0) {
          editError.value = 'Los valores no pueden ser negativos';
          return;
        }
        
        const rate = getStationRate(editingStationId.value, editingTipoCarga.value);
        
        // Preparar payload
        const payload = {
          tipo_carga: editingTipoCarga.value,
          costo_kw_h: parseFloat(editForm.costo_kw_h),
          costo_tiempo_min: parseFloat(editForm.costo_tiempo_min),
          fecha_inicio_vigencia: rate.fecha_inicio_vigencia ? rate.fecha_inicio_vigencia.split('T')[0] : new Date().toISOString().split('T')[0]
        };
        
        // Si tiene fecha fin, incluirla
        if (rate.fecha_fin_vigencia) {
          payload.fecha_fin_vigencia = rate.fecha_fin_vigencia.split('T')[0];
        }
        
        await updateRate(editingRateId.value, payload);
        
        // Cerrar modal y mostrar confirmación
        closeEditModal();
        confirmMessage.value = 'Tarifa actualizada exitosamente!';
        showConfirmModal.value = true;
        
        // Recargar datos
        await loadData();
        
      } catch (err) {
        editError.value = err.message || 'No se pudo actualizar la tarifa';
        console.error('Error guardando tarifa:', err);
      } finally {
        saving.value = false;
      }
    };
    
    const saveNewRate = async () => {
      try {
        saving.value = true;
        editError.value = null;
        
        // Validaciones
        if (editForm.costo_kw_h < 0 || editForm.costo_tiempo_min < 0) {
          editError.value = 'Los valores no pueden ser negativos';
          return;
        }
        
        if (!editForm.fecha_inicio_vigencia) {
          editError.value = 'La fecha de inicio de vigencia es requerida';
          return;
        }
        
        if (editForm.costo_kw_h === 0 && editForm.costo_tiempo_min === 0) {
          editError.value = 'Al menos uno de los costos debe ser mayor a 0';
          return;
        }
        
        // Preparar payload para crear
        const payload = {
          id_estacion: editingStationId.value,
          tipo_carga: editingTipoCarga.value,
          costo_kw_h: parseFloat(editForm.costo_kw_h),
          costo_tiempo_min: parseFloat(editForm.costo_tiempo_min),
          fecha_inicio_vigencia: editForm.fecha_inicio_vigencia
        };
        
        await createRate(payload);
        
        // Cerrar modal y mostrar confirmación
        closeEditModal();
        confirmMessage.value = `Tarifa de carga ${editingTipoCarga.value} creada exitosamente!`;
        showConfirmModal.value = true;
        
        // Recargar datos
        await loadData();
        
      } catch (err) {
        editError.value = err.message || 'No se pudo crear la tarifa';
        console.error('Error creando tarifa:', err);
      } finally {
        saving.value = false;
      }
    };
    
    const createNewRate = async (stationId, tipoCarga) => {
      // Abrir modal de creación en lugar de crear directamente
      openCreateModal(stationId, tipoCarga);
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
      stations,
      rates,
      expandedStations,
      showConfirmModal,
      confirmMessage,
      showEditModal,
      isCreatingNew,
      editingTipoCarga,
      editForm,
      editError,
      saving,
      loadData,
      toggleStation,
      getStationRate,
      getTarifasCount,
      openEditModal,
      openCreateModal,
      closeEditModal,
      saveEditedRate,
      saveNewRate,
      createNewRate,
      formatDate
    };
  }
};
</script>

<style scoped>
.text-primary {
  color: #37A686;
}

.bg-primary {
  background-color: #37A686;
}

.bg-primary-dark,
.bg-primary:hover {
  background-color: #2C403A;
}

.border-primary {
  border-color: #37A686;
}

.focus\:ring-primary:focus {
  --tw-ring-color: #37A686;
}
</style>
