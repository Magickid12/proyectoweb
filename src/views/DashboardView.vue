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

    <!-- Loading State con Skeleton -->
    <SkeletonLoader v-if="loading" type="dashboard" />

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
          <h3 class="text-xl font-semibold mb-3">Resumen General de Cargadores</h3>
          
          <div v-if="chargersByStatus.length === 0" class="text-center py-8 text-gray-500">
            <i class="fas fa-chart-bar text-3xl mb-2"></i>
            <div>No hay datos de resumen disponibles</div>
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
            <i class="fas fa-charging-station text-3xl mb-2"></i>
            <div>No hay datos de cargadores disponibles</div>
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
                  <i class="fas fa-map-marker-alt text-primary"></i>
                  <h4 class="font-semibold text-lg text-gray-900">
                    {{ stationGroup.estacionNombre }}
                  </h4>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-sm text-gray-500 font-medium">{{ stationGroup.chargers.length }} cargadores</span>
                  
                  <!-- NUEVO: Botón de paro de emergencia para toda la estación -->
                  <button
                    @click.stop="handleStationEmergencyStop(stationGroup.estacionId)"
                    class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 shadow-md"
                    title="Paro de emergencia para toda la estación"
                  >
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>PARO DE EMERGENCIA</span>
                  </button>
                </div>
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
                    :has-web-socket-support="hasSupport(stationGroup.estacionId)"
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
import SkeletonLoader from '../components/SkeletonLoader.vue';
import { getStats } from '@/services/dashboardService';
import { getStationsByFranchise } from '@/services/stationsService';
import { stopChargerByMonitor } from '@/services/sessionsService';
import { wsManager } from '@/services/websocketManager';

export default { 
  components: { StatCard, ChargerCard, ToastNotification, SkeletonLoader },
  setup() {
    const loading = ref(true);
    const error = ref(null);
    
    const stats = ref(null);
    const chargersByStatus = ref([]);
    const chargersByStation = ref([]);
    const expandedStations = ref({});
    
    // WebSocket states
    const chargerWSStates = ref({});
    const chargerCurrentStates = ref({});
    const chargerTelemetry = ref({});
    const chargerIoTStates = ref({});
    
    // Toast notification
    const toastMessage = ref('');
    const toastType = ref('info');
    const showToast = ref(false);
    
    // Acceder a $session
    const app = getCurrentInstance();
    const $session = app?.appContext.config.globalProperties.$session;

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
          const station = chargersByStation.value.find(s => s.estacionId === stationId);
          if (station) {
            station.chargers.forEach(charger => {
              chargerWSStates.value[charger.id_cargador] = status;
            });
          }

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
              chargerIoTStates.value[cargadorId] = cargador.conectado || false; // ✅ Campo correcto
              // No actualizar chargerWSStates aquí, ya se hace en onStatusChange
              
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
              console.log(`[Dashboard] Estado inicial sincronizado para ${stationName}:`, data.cargadores);
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

    // Conectar a todas las estaciones con soporte WebSocket
    const connectSupportedStations = () => {
      chargersByStation.value.forEach(stationGroup => {
        if (wsManager.hasWebSocketSupport(stationGroup.estacionId)) {
          connectStationWS(stationGroup.estacionId, stationGroup.estacionNombre);
        }
      });
    };

    // Desconectar todos los WebSocket
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

    // Manejar paro de emergencia de un cargador individual
    // Manejar paro de emergencia de un cargador individual
    const handleEmergencyStop = async (chargerId) => {
      if (!confirm(`¿Está seguro de ejecutar PARO DE EMERGENCIA en el Cargador #${chargerId}?\n\nEsto cambiará el estado a "fuera de servicio".`)) {
        return;
      }

      showNotification(`Ejecutando paro de emergencia en Cargador #${chargerId}...`, 'warning');
      
      try {
        const result = await stopChargerByMonitor(chargerId);
        
        if (result.success) {
          showNotification(
            result.message || `Cargador #${chargerId} detenido exitosamente`, 
            'success'
          );
          // El WebSocket notificará el cambio de estado automáticamente
        }
      } catch (error) {
        showNotification(
          error.message || `Error al detener Cargador #${chargerId}`, 
          'error'
        );
      }
    };

    // Manejar paro de emergencia de toda la estación
    const handleStationEmergencyStop = async (stationId) => {
      const station = chargersByStation.value.find(s => s.estacionId === stationId);
      const stationName = station?.estacionNombre || `Estación ${stationId}`;
      
      if (!confirm(`¿Está seguro de ejecutar PARO DE EMERGENCIA en TODA la ${stationName}?\n\nEsto detendrá TODOS los cargadores de la estación.`)) {
        return;
      }

      showNotification(`🚨 Ejecutando paro de emergencia en ${stationName}...`, 'warning');
      
      try {
        // Detener todos los cargadores de la estación en paralelo
        const stopPromises = station.chargers.map(charger => 
          stopChargerByMonitor(charger.id_cargador)
        );
        
        await Promise.all(stopPromises);
        
        showNotification(
          `Paro de emergencia ejecutado en todos los cargadores de ${stationName}`, 
          'success'
        );
        // El WebSocket notificará los cambios de estado automáticamente
      } catch (error) {
        showNotification(
          error.message || `Error al ejecutar paro de emergencia en ${stationName}`, 
          'error'
        );
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
        
        // Cargar stats desde /api/franquicia/dashboard para métricas
        const data = await getStats();
        stats.value = data;
        
        // Cargar estaciones con información completa de cargadores
        const stations = await getStationsByFranchise();
        
        // Crear un mapa de cargadores completos por ID para enriquecer los datos
        const chargersMap = {};
        stations.forEach(station => {
          station.cargadores.forEach(charger => {
            chargersMap[charger.id_cargador] = {
              ...charger,
              nombre_estacion: station.nombre_estacion
            };
          });
        });
        
        // Procesar cargadores por estado usando estadoCargadores del dashboard
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

          // Agrupar cargadores por estación con información completa
          const stationGroups = data.estadoCargadores.reduce((acc, cargador) => {
            const estacionId = cargador.id_estacion;
            
            // Buscar información completa del cargador
            const fullChargerInfo = chargersMap[cargador.id_cargador];
            const estacionNombre = fullChargerInfo?.nombre_estacion || `Estación ${estacionId}`;
            
            let group = acc.find(g => g.estacionId === estacionId);
            if (!group) {
              group = {
                estacionId,
                estacionNombre,
                chargers: []
              };
              acc.push(group);
            }
            
            // Mezclar datos: estado actualizado del dashboard + info completa de stations
            group.chargers.push({
              ...fullChargerInfo,
              estado: cargador.estado // Usar estado actualizado del dashboard
            });
            
            return acc;
          }, []);

          // ORDENAR estaciones de menor a mayor por ID (Estación 1, luego 2)
          stationGroups.sort((a, b) => a.estacionId - b.estacionId);

          chargersByStation.value = stationGroups;

          // Expandir todas las estaciones por defecto
          stationGroups.forEach(group => {
            expandedStations.value[group.estacionId] = true;
          });
          
          // Conectar WebSocket a estaciones soportadas
          connectSupportedStations();
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
      reconnectAllStations();
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
      disconnectAllStations();
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
      hasSupport: (stationId) => wsManager.hasWebSocketSupport(stationId),
      toggleStation,
      loadDashboardData: refreshDashboard, // Usar función mejorada
      formatDate,
      getStatusColor,
      handleEmergencyStop,
      handleStationEmergencyStop
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
