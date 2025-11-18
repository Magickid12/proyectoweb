<template>
  <div class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
    <!-- Header -->
    <div class="flex items-start justify-between mb-3">
      <div>
        <div class="font-semibold text-gray-900">Cargador #{{ charger.id_cargador }}</div>
        <div class="text-xs text-gray-500 mt-1">{{ formatDate(charger.fecha_instalacion) }}</div>
      </div>
      <StatusBadge :status="displayState" />
    </div>

    <!-- WebSocket Status -->
    <div v-if="hasWebSocketSupport" class="mb-3 space-y-2">
      <WebSocketStatus :status="wsStatus" />
      <IoTStatus :connected="iotConnected" />
    </div>
    <div v-else class="mb-3">
      <div class="text-xs text-gray-500 italic">
        ⚠️ WebSocket no disponible
      </div>
    </div>

    <!-- Charger Info -->
    <div class="space-y-2 text-sm mb-4">
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
        <span class="text-gray-600">Firmware:</span>
        <span class="text-xs text-gray-500">{{ charger.firmware_version || 'N/A' }}</span>
      </div>
    </div>

    <!-- Telemetry (solo si está conectado Y el IoT está online) -->
    <div v-if="hasWebSocketSupport && wsStatus === 'conectado' && iotConnected && telemetry" class="mb-4 p-3 bg-gray-50 rounded-lg">
      <div class="text-xs font-semibold text-gray-700 mb-2">📊 Telemetría en Tiempo Real</div>
      <div class="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span class="text-gray-600">Voltaje:</span>
          <span class="font-semibold ml-1">{{ telemetry.voltaje_v?.toFixed(1) || 0 }} V</span>
        </div>
        <div>
          <span class="text-gray-600">Corriente:</span>
          <span class="font-semibold ml-1">{{ telemetry.corriente_a?.toFixed(1) || 0 }} A</span>
        </div>
        <div>
          <span class="text-gray-600">Potencia:</span>
          <span class="font-semibold ml-1">{{ telemetry.potencia_w?.toFixed(0) || 0 }} W</span>
        </div>
        <div>
          <span class="text-gray-600">Temp:</span>
          <span class="font-semibold ml-1">{{ telemetry.temperatura_c?.toFixed(1) || 0 }} °C</span>
        </div>
      </div>
    </div>

    <!-- Warning cuando IoT está offline -->
    <div v-if="hasWebSocketSupport && wsStatus === 'conectado' && !iotConnected" class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div class="flex items-center gap-2 text-xs text-yellow-800">
        <span>⚠️</span>
        <span>El cargador IoT no está conectado. Los controles están deshabilitados.</span>
      </div>
    </div>

    <!-- Action Buttons -->
    <div v-if="showActions && hasWebSocketSupport" class="space-y-2">
      <!-- Maintenance Button (StationsView) -->
      <button 
        v-if="showMaintenanceButton"
        @click="handleMaintenanceClick"
        :disabled="!canSendCommands || changingState"
        class="w-full px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center justify-center gap-2"
        :title="!canSendCommands ? 'IoT no disponible' : ''"
      >
        <span v-if="!changingState">🔧 Cambiar a Mantenimiento</span>
        <span v-else>⏳ Cambiando estado...</span>
      </button>

      <!-- Emergency Stop Button (DashboardView) -->
      <button 
        v-if="showEmergencyButton"
        @click="handleEmergencyClick"
        :disabled="!canSendCommands || changingState"
        class="w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center justify-center gap-2"
        :title="!canSendCommands ? 'IoT no disponible' : ''"
      >
        <span v-if="!changingState">🚨 PARO DE EMERGENCIA</span>
        <span v-else>⏳ Ejecutando...</span>
      </button>
    </div>

    <!-- Placeholder for non-WebSocket chargers -->
    <div v-if="!hasWebSocketSupport" class="p-3 bg-gray-100 rounded-lg text-center text-xs text-gray-600">
      Este cargador no tiene monitoreo en tiempo real disponible
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import StatusBadge from './StatusBadge.vue';
import WebSocketStatus from './WebSocketStatus.vue';
import IoTStatus from './IoTStatus.vue';

export default {
  components: {
    StatusBadge,
    WebSocketStatus,
    IoTStatus
  },
  props: {
    charger: {
      type: Object,
      required: true
    },
    wsStatus: {
      type: String,
      default: 'desconectado'
    },
    currentState: {
      type: String,
      default: null
    },
    telemetry: {
      type: Object,
      default: null
    },
    iotConnected: {
      type: Boolean,
      default: false
    },
    hasWebSocketSupport: {
      type: Boolean,
      default: false
    },
    showActions: {
      type: Boolean,
      default: false
    },
    showMaintenanceButton: {
      type: Boolean,
      default: false
    },
    showEmergencyButton: {
      type: Boolean,
      default: false
    }
  },
  emits: ['maintenance', 'emergency'],
  setup(props, { emit }) {
    const changingState = ref(false);

    // Estado a mostrar: priorizar currentState (WebSocket) sobre charger.estado (API)
    const displayState = computed(() => {
      if (props.hasWebSocketSupport && props.wsStatus === 'conectado' && props.currentState) {
        return props.currentState;
      }
      return props.charger.estado || 'desconocido';
    });

    // Los comandos solo se pueden enviar si WebSocket está conectado Y el IoT está conectado
    const canSendCommands = computed(() => {
      return props.wsStatus === 'conectado' && props.iotConnected;
    });

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('es-MX');
    };

    const handleMaintenanceClick = () => {
      if (!canSendCommands.value) {
        alert('⚠️ No se puede cambiar el estado: El cargador IoT no está conectado.');
        return;
      }

      if (confirm(`¿Seguro que deseas cambiar el Cargador #${props.charger.id_cargador} a estado de mantenimiento?`)) {
        changingState.value = true;
        emit('maintenance');
        // Reset después de 2 segundos
        setTimeout(() => {
          changingState.value = false;
        }, 2000);
      }
    };

    const handleEmergencyClick = () => {
      if (!canSendCommands.value) {
        alert('⚠️ No se puede ejecutar el paro de emergencia: El cargador IoT no está conectado.');
        return;
      }

      if (confirm(`⚠️ ¿SEGURO que deseas activar el PARO DE EMERGENCIA en el Cargador #${props.charger.id_cargador}?\n\nEsta acción detendrá inmediatamente el suministro de energía y pondrá el cargador FUERA DE SERVICIO.`)) {
        changingState.value = true;
        emit('emergency');
        // Reset después de 2 segundos
        setTimeout(() => {
          changingState.value = false;
        }, 2000);
      }
    };

    return {
      displayState,
      changingState,
      canSendCommands,
      formatDate,
      handleMaintenanceClick,
      handleEmergencyClick
    };
  }
};
</script>
