<template>
  <div class="p-8">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-3xl font-bold">Reportes y Sesiones de Carga</h2>
      <button @click="loadSessions()" class="text-gray-500 hover:text-gray-700" title="Recargar">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>

    <!-- Filtros -->
    <div class="bg-white p-4 rounded-xl shadow border border-gray-100 mb-6">
      <h3 class="text-lg font-semibold mb-3">Filtros</h3>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select v-model="filters.estado" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
            <option value="">Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="en_progreso">En Progreso</option>
            <option value="finalizada">Finalizada</option>
            <option value="cancelada">Cancelada</option>
            <option value="error">Error</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
          <input type="date" v-model="filters.fecha_inicio" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
          <input type="date" v-model="filters.fecha_fin" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
        </div>
        <div class="flex items-end gap-2">
          <button @click="applyFilters" class="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark">
            Filtrar
          </button>
          <button @click="clearFilters" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Limpiar
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <SkeletonLoader v-if="loading" type="reports" />

    <!-- Error State -->
    <div v-else-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
      {{ error }}
    </div>

    <!-- Sessions Table -->
    <div v-else class="bg-white rounded-xl shadow border border-gray-100">
      <div v-if="sessions.length === 0" class="text-center py-12 text-gray-500">
         No hay sesiones registradas
      </div>
      
      <div v-else>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estación</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargador</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inicio</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fin</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Energía</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costo</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="session in sessions" :key="session.id_sesion" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{{ session.id_sesion }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {{ session.Cargador?.Estacion?.nombre_estacion || 'N/A' }}
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ session.Cargador?.Estacion?.direccion || '' }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  #{{ session.id_cargador }}
                  <span v-if="session.Cargador" class="text-xs block">
                    ({{ session.Cargador.tipo_carga }})
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {{ session.User ? `${session.User.nombre} ${session.User.apellido_paterno || ''}` : 'N/A' }}
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ session.User?.email || '' }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDateTime(session.fecha_inicio) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ session.fecha_fin ? formatDateTime(session.fecha_fin) : '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <StatusBadge :status="session.estado" />
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ parseFloat(session.energia_consumida_kwh || 0).toFixed(2) }} kWh
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  ${{ parseFloat(session.monto_final || 0).toFixed(2) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Paginación -->
        <div v-if="sessions.length > 0" class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div class="text-sm text-gray-700">
            Mostrando <span class="font-medium">{{ Math.min(1, pagination.total) }}</span>
            a <span class="font-medium">{{ pagination.total }}</span>
            de <span class="font-medium">{{ pagination.total }}</span> resultados
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import StatusBadge from '../components/StatusBadge.vue';
import { getSessions } from '@/services/sessionsService';
import SkeletonLoader from '@/components/SkeletonLoader.vue';

export default {
  components: { StatusBadge, SkeletonLoader },
  setup() {
    const loading = ref(true);
    const error = ref(null);
    const sessions = ref([]);
    const filters = ref({
      estado: '',
      fecha_inicio: '',
      fecha_fin: ''
    });
    
    // Paginación (básica, sin endpoint paginado)
    const currentPage = ref(1);
    const limit = ref(50);
    const pagination = ref({
      total: 0,
      pages: 1
    });
    
    const loadSessions = async () => {
      try {
        loading.value = true;
        error.value = null;
        
        // Construir filtros solo con valores no vacíos
        const activeFilters = {};
        if (filters.value.estado) activeFilters.estado = filters.value.estado;
        if (filters.value.fecha_inicio) activeFilters.fecha_inicio = filters.value.fecha_inicio;
        if (filters.value.fecha_fin) activeFilters.fecha_fin = filters.value.fecha_fin;
        
        const data = await getSessions(activeFilters);
        sessions.value = Array.isArray(data) ? data : [];
        
        // Actualizar paginación
        pagination.value.total = sessions.value.length;
        pagination.value.pages = Math.ceil(sessions.value.length / limit.value);
        
      } catch (err) {
        error.value = err.message || 'Error al cargar sesiones';
        console.error('Error cargando sesiones:', err);
      } finally {
        loading.value = false;
      }
    };
    
    const applyFilters = () => {
      loadSessions();
    };
    
    const clearFilters = () => {
      filters.value = {
        estado: '',
        fecha_inicio: '',
        fecha_fin: ''
      };
      loadSessions();
    };
    
    const formatDateTime = (dateString) => {
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
    
    onMounted(() => {
      loadSessions();
    });
    
    return {
      loading,
      error,
      sessions,
      filters,
      currentPage,
      limit,
      pagination,
      loadSessions,
      applyFilters,
      clearFilters,
      formatDateTime
    };
  }
};
</script>
