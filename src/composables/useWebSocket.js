/**
 * Composable para usar WebSocket en componentes Vue
 * Soporta múltiples conexiones simultáneas a diferentes cargadores
 */
import { ref, onUnmounted } from 'vue';
import { wsManager } from '@/services/websocketManager';

/**
 * Hook para conectar a un cargador específico
 * @param {number} cargadorId - ID del cargador
 * @param {object} callbacks - Callbacks opcionales { onConnect, onMessage, onDisconnect, onStatusChange }
 */
export function useChargerWebSocket(cargadorId, callbacks = {}) {
  const estado = ref('desconectado');
  const currentState = ref(null);
  const lastTelemetry = ref(null);
  const isConnected = ref(false);

  // Callback de cambio de estado
  const onStatusChange = (newEstado) => {
    estado.value = newEstado;
    isConnected.value = newEstado === 'conectado';
    if (callbacks.onStatusChange) {
      callbacks.onStatusChange(newEstado);
    }
  };

  // Callback de mensaje
  const onMessage = (data) => {
    // Actualizar estado actual
    if (data.type === 'subscribed') {
      currentState.value = data.estado_cargador;
    }

    // Actualizar telemetría
    if (data.from === 'publisher' && data.payload) {
      if (data.payload.type === 'telemetria') {
        lastTelemetry.value = data.payload;
      }
      if (data.payload.type === 'estado_cargador') {
        currentState.value = data.payload.estado;
      }
    }

    if (callbacks.onMessage) {
      callbacks.onMessage(data);
    }
  };

  // Conectar
  const connect = () => {
    if (!wsManager.hasWebSocketSupport(cargadorId)) {
      console.warn(`[useChargerWebSocket] Cargador ${cargadorId} no tiene soporte WebSocket`);
      return false;
    }

    return wsManager.connect(cargadorId, {
      onConnect: callbacks.onConnect,
      onDisconnect: callbacks.onDisconnect,
      onError: callbacks.onError,
      onStatusChange,
      onMessage
    });
  };

  // Desconectar
  const disconnect = () => {
    wsManager.disconnect(cargadorId);
    estado.value = 'desconectado';
    isConnected.value = false;
  };

  // Cambiar estado
  const cambiarEstado = (nuevoEstado) => {
    return wsManager.cambiarEstado(cargadorId, nuevoEstado);
  };

  // Detener energía
  const detenerEnergia = () => {
    return wsManager.detenerEnergia(cargadorId);
  };

  // Limpiar al desmontar
  onUnmounted(() => {
    disconnect();
  });

  return {
    estado,
    currentState,
    lastTelemetry,
    isConnected,
    connect,
    disconnect,
    cambiarEstado,
    detenerEnergia
  };
}

/**
 * Hook para conectar múltiples cargadores
 * @param {array} cargadorIds - Array de IDs de cargadores
 * @param {function} onGlobalEvent - Callback para eventos globales
 */
export function useMultipleChargers(cargadorIds = [], onGlobalEvent = null) {
  const chargers = ref(new Map());
  
  // Conectar a todos los cargadores
  const connectAll = () => {
    cargadorIds.forEach(id => {
      if (wsManager.hasWebSocketSupport(id)) {
        chargers.value.set(id, {
          estado: 'desconectado',
          currentState: null,
          lastTelemetry: null
        });

        wsManager.connect(id, {
          onStatusChange: (newEstado) => {
            const charger = chargers.value.get(id);
            if (charger) {
              charger.estado = newEstado;
              chargers.value.set(id, { ...charger });
            }
          },
          onMessage: (data) => {
            const charger = chargers.value.get(id);
            if (!charger) return;

            if (data.type === 'subscribed') {
              charger.currentState = data.estado_cargador;
            }

            if (data.from === 'publisher' && data.payload) {
              if (data.payload.type === 'telemetria') {
                charger.lastTelemetry = data.payload;
              }
              if (data.payload.type === 'estado_cargador') {
                charger.currentState = data.payload.estado;
              }
            }

            chargers.value.set(id, { ...charger });
          }
        });
      }
    });
  };

  // Desconectar todos
  const disconnectAll = () => {
    wsManager.disconnectAll();
    chargers.value.clear();
  };

  // Registrar listener global si se proporciona
  let removeGlobalListener = null;
  if (onGlobalEvent) {
    removeGlobalListener = wsManager.onGlobal(onGlobalEvent);
  }

  // Limpiar al desmontar
  onUnmounted(() => {
    disconnectAll();
    if (removeGlobalListener) {
      removeGlobalListener();
    }
  });

  return {
    chargers,
    connectAll,
    disconnectAll,
    cambiarEstado: (cargadorId, estado) => wsManager.cambiarEstado(cargadorId, estado),
    detenerEnergia: (cargadorId) => wsManager.detenerEnergia(cargadorId),
    isConnected: (cargadorId) => wsManager.isConnected(cargadorId),
    getStatus: (cargadorId) => wsManager.getStatus(cargadorId)
  };
}

/**
 * Hook simplificado para verificar si un cargador tiene soporte WebSocket
 */
export function useWebSocketSupport() {
  return {
    hasSupport: (cargadorId) => wsManager.hasWebSocketSupport(cargadorId),
    supportedChargers: [2, 3]
  };
}
