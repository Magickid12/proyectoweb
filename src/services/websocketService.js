/**
 * Servicio de WebSocket para actualizaciones en tiempo real
 * Se conecta al backend según la documentación
 */

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:4000';

class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.listeners = {};
    this.isConnected = false;
  }

  /**
   * Conecta al WebSocket del backend
   * @param {string} token - JWT token para autenticación
   */
  connect(token) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('[WS] Ya hay una conexión activa');
      return;
    }

    try {
      // Construir URL con token si es necesario
      const wsUrl = token ? `${WS_URL}?token=${token}` : WS_URL;
      
      console.log('[WS] Conectando a:', wsUrl);
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[WS] Conexión establecida');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[WS] Mensaje recibido:', data);
          
          // Emitir evento según el tipo de mensaje
          if (data.type) {
            this.emit(data.type, data.payload);
          }
          
          // Emitir evento genérico
          this.emit('message', data);
        } catch (error) {
          console.error('[WS] Error al parsear mensaje:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('[WS] Error de conexión:', error);
        this.emit('error', error);
      };

      this.ws.onclose = () => {
        console.log('[WS] Conexión cerrada');
        this.isConnected = false;
        this.emit('disconnected');
        
        // Intentar reconectar
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`[WS] Reintentando conexión (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
          setTimeout(() => this.connect(token), this.reconnectDelay);
        } else {
          console.log('[WS] Máximo de reintentos alcanzado');
        }
      };
    } catch (error) {
      console.error('[WS] Error al crear WebSocket:', error);
    }
  }

  /**
   * Desconecta el WebSocket
   */
  disconnect() {
    if (this.ws) {
      console.log('[WS] Desconectando...');
      this.reconnectAttempts = this.maxReconnectAttempts; // Evitar reconexión automática
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }
  }

  /**
   * Envía un mensaje al servidor
   * @param {object} message - Mensaje a enviar
   */
  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('[WS] No hay conexión activa para enviar mensaje');
    }
  }

  /**
   * Registra un listener para eventos
   * @param {string} event - Nombre del evento
   * @param {function} callback - Función callback
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  /**
   * Elimina un listener
   * @param {string} event - Nombre del evento
   * @param {function} callback - Función callback a eliminar
   */
  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  /**
   * Emite un evento a todos los listeners
   * @param {string} event - Nombre del evento
   * @param {any} data - Datos del evento
   */
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  /**
   * Verifica si hay conexión activa
   * @returns {boolean}
   */
  isConnectionOpen() {
    return this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}

// Exportar instancia singleton
export const websocketService = new WebSocketService();

export default websocketService;
