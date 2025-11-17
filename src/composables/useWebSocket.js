/**
 * Composable para usar WebSocket en componentes Vue
 */
import { onMounted, onUnmounted } from 'vue';
import { websocketService } from '@/services/websocketService';

export function useWebSocket() {
  /**
   * Conecta al WebSocket con el token del usuario
   * @param {string} token - JWT token
   */
  const connect = (token) => {
    websocketService.connect(token);
  };

  /**
   * Desconecta el WebSocket
   */
  const disconnect = () => {
    websocketService.disconnect();
  };

  /**
   * Envía un mensaje
   * @param {object} message - Mensaje a enviar
   */
  const send = (message) => {
    websocketService.send(message);
  };

  /**
   * Escucha un evento
   * @param {string} event - Nombre del evento
   * @param {function} callback - Callback a ejecutar
   */
  const on = (event, callback) => {
    websocketService.on(event, callback);
  };

  /**
   * Deja de escuchar un evento
   * @param {string} event - Nombre del evento
   * @param {function} callback - Callback a eliminar
   */
  const off = (event, callback) => {
    websocketService.off(event, callback);
  };

  /**
   * Verifica si hay conexión
   * @returns {boolean}
   */
  const isConnected = () => {
    return websocketService.isConnectionOpen();
  };

  return {
    connect,
    disconnect,
    send,
    on,
    off,
    isConnected
  };
}

/**
 * Composable que conecta/desconecta automáticamente al montar/desmontar
 * @param {string} token - JWT token
 * @param {object} handlers - Objeto con handlers de eventos { event: callback }
 */
export function useWebSocketAuto(token, handlers = {}) {
  const ws = useWebSocket();

  onMounted(() => {
    // Conectar al WebSocket
    ws.connect(token);

    // Registrar handlers
    Object.keys(handlers).forEach(event => {
      ws.on(event, handlers[event]);
    });
  });

  onUnmounted(() => {
    // Limpiar handlers
    Object.keys(handlers).forEach(event => {
      ws.off(event, handlers[event]);
    });

    // Desconectar
    ws.disconnect();
  });

  return ws;
}
