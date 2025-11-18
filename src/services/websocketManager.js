/**
 * WebSocket Manager - Gestor de múltiples conexiones WebSocket
 * Permite conectar múltiples cargadores simultáneamente
 */

const WS_BASE_URL = 'wss://evconnect-3ydy.onrender.com/ws';
const CARGADORES_CON_WS = [2, 3]; // Solo estos cargadores tienen WebSocket disponible

class WebSocketManager {
  constructor() {
    // Mapa de conexiones: { cargadorId: { ws, estado, listeners, reconnectAttempts, iotConectado } }
    this.connections = new Map();
    this.maxReconnectAttempts = 10; // Aumentado de 5 a 10
    this.reconnectDelay = 5000; // Aumentado de 3s a 5s
    this.globalListeners = []; // Listeners globales para todas las conexiones
    this.reconnectTimers = new Map(); // Timers de reconexión por cargador
  }

  /**
   * Verifica si un cargador tiene WebSocket disponible
   */
  hasWebSocketSupport(cargadorId) {
    return CARGADORES_CON_WS.includes(parseInt(cargadorId));
  }

  /**
   * Conecta a un cargador específico
   */
  connect(cargadorId, callbacks = {}) {
    const id = parseInt(cargadorId);
    
    if (!this.hasWebSocketSupport(id)) {
      console.warn(`[WS Manager] Cargador ${id} no tiene soporte WebSocket`);
      return false;
    }

    // Si ya existe una conexión activa, no crear otra
    if (this.connections.has(id)) {
      const conn = this.connections.get(id);
      if (conn.estado === 'conectado' || conn.estado === 'conectando') {
        console.log(`[WS Manager] Ya existe conexión activa para cargador ${id}`);
        return true;
      }
    }

    const url = `${WS_BASE_URL}?cargadorId=${id}&role=client`;
    console.log(`[WS Manager] Conectando al cargador ${id}...`);

    const ws = new WebSocket(url);
    
    const connectionData = {
      ws,
      estado: 'conectando',
      listeners: [],
      reconnectAttempts: 0,
      lastTelemetry: null,
      currentState: null,
      iotConectado: false, // Estado de conexión del IoT físico
      callbacks: callbacks || {}
    };

    this.connections.set(id, connectionData);
    this._notifyGlobalListeners('status', { cargadorId: id, estado: 'conectando' });

    // Ejecutar callback de estado si existe
    if (callbacks.onStatusChange) {
      callbacks.onStatusChange('conectando');
    }

    ws.onopen = () => {
      console.log(`[WS Manager] ✅ Conectado al cargador ${id}`);
      connectionData.estado = 'conectado';
      connectionData.reconnectAttempts = 0;
      
      this._notifyGlobalListeners('status', { cargadorId: id, estado: 'conectado' });
      
      if (callbacks.onStatusChange) {
        callbacks.onStatusChange('conectado');
      }
      if (callbacks.onConnect) {
        callbacks.onConnect();
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log(`[WS Manager] 📨 Mensaje del cargador ${id}:`, data);

        // Procesar mensaje según el tipo
        this._processMessage(id, data);

        // Notificar a listeners específicos del cargador
        connectionData.listeners.forEach(listener => {
          if (listener.callback) {
            listener.callback(data);
          }
        });

        // Notificar a listeners globales
        this._notifyGlobalListeners('message', { cargadorId: id, data });

        // Ejecutar callback de mensaje si existe
        if (callbacks.onMessage) {
          callbacks.onMessage(data);
        }

      } catch (error) {
        console.error(`[WS Manager] Error al parsear mensaje del cargador ${id}:`, error);
      }
    };

    ws.onerror = (error) => {
      console.error(`[WS Manager] ❌ Error en cargador ${id}:`, error);
      connectionData.estado = 'error';
      
      this._notifyGlobalListeners('status', { cargadorId: id, estado: 'error' });
      
      if (callbacks.onStatusChange) {
        callbacks.onStatusChange('error');
      }
      if (callbacks.onError) {
        callbacks.onError(error);
      }
    };

    ws.onclose = () => {
      console.log(`[WS Manager] 🔌 Desconectado del cargador ${id}`);
      connectionData.estado = 'desconectado';
      
      this._notifyGlobalListeners('status', { cargadorId: id, estado: 'desconectado' });
      
      if (callbacks.onStatusChange) {
        callbacks.onStatusChange('desconectado');
      }
      if (callbacks.onDisconnect) {
        callbacks.onDisconnect();
      }

      // Intentar reconectar si no se ha alcanzado el máximo
      if (connectionData.reconnectAttempts < this.maxReconnectAttempts) {
        connectionData.reconnectAttempts++;
        connectionData.estado = 'reconectando';
        
        this._notifyGlobalListeners('status', { 
          cargadorId: id, 
          estado: 'reconectando', 
          intento: connectionData.reconnectAttempts,
          maxIntentos: this.maxReconnectAttempts
        });
        
        if (callbacks.onStatusChange) {
          callbacks.onStatusChange('reconectando');
        }

        console.log(`[WS Manager] 🔄 Reconectando al cargador ${id} (${connectionData.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        
        // Guardar timer de reconexión
        const timer = setTimeout(() => {
          if (this.connections.has(id)) {
            // No eliminar la conexión, solo reconectar
            const savedCallbacks = connectionData.callbacks;
            const savedAttempts = connectionData.reconnectAttempts;
            
            this.connections.delete(id);
            this.connect(id, savedCallbacks);
            
            // Restaurar el contador de intentos
            const newConn = this.connections.get(id);
            if (newConn) {
              newConn.reconnectAttempts = savedAttempts;
            }
          }
        }, this.reconnectDelay);
        
        this.reconnectTimers.set(id, timer);
      } else {
        console.log(`[WS Manager] ⚠️ Máximo de reintentos alcanzado para cargador ${id}`);
        this._notifyGlobalListeners('maxReconnectReached', { cargadorId: id });
      }
    };

    return true;
  }

  /**
   * Desconecta de un cargador específico
   */
  disconnect(cargadorId) {
    const id = parseInt(cargadorId);
    const conn = this.connections.get(id);

    if (!conn) {
      return;
    }

    console.log(`[WS Manager] Desconectando del cargador ${id}...`);
    
    // Limpiar timer de reconexión si existe
    if (this.reconnectTimers.has(id)) {
      clearTimeout(this.reconnectTimers.get(id));
      this.reconnectTimers.delete(id);
    }
    
    // Evitar reconexión automática
    conn.reconnectAttempts = this.maxReconnectAttempts;
    
    if (conn.ws && conn.ws.readyState === WebSocket.OPEN) {
      conn.ws.close();
    }

    this.connections.delete(id);
    this._notifyGlobalListeners('status', { cargadorId: id, estado: 'desconectado' });
  }

  /**
   * Desconecta todos los cargadores
   */
  disconnectAll() {
    console.log('[WS Manager] Desconectando todos los cargadores...');
    const ids = Array.from(this.connections.keys());
    ids.forEach(id => this.disconnect(id));
    
    // Limpiar todos los timers
    this.reconnectTimers.clear();
  }

  /**
   * Reconecta manualmente un cargador (útil para botón refresh)
   */
  reconnect(cargadorId) {
    const id = parseInt(cargadorId);
    const conn = this.connections.get(id);
    
    if (conn) {
      const savedCallbacks = conn.callbacks;
      console.log(`[WS Manager] 🔄 Reconexión manual del cargador ${id}...`);
      
      // Resetear contador de intentos
      this.disconnect(id);
      
      // Reconectar inmediatamente
      setTimeout(() => {
        this.connect(id, savedCallbacks);
      }, 500);
    } else {
      console.warn(`[WS Manager] No hay conexión previa para el cargador ${id}`);
    }
  }

  /**
   * Reconecta todos los cargadores manualmente
   */
  reconnectAll() {
    console.log('[WS Manager] 🔄 Reconexión manual de todos los cargadores...');
    const ids = Array.from(this.connections.keys());
    const callbacks = {};
    
    // Guardar callbacks de cada conexión
    ids.forEach(id => {
      const conn = this.connections.get(id);
      if (conn) {
        callbacks[id] = conn.callbacks;
      }
    });
    
    // Desconectar todos
    this.disconnectAll();
    
    // Reconectar después de un momento
    setTimeout(() => {
      ids.forEach(id => {
        if (callbacks[id]) {
          this.connect(id, callbacks[id]);
        }
      });
    }, 1000);
  }

  /**
   * Envía un comando a un cargador específico
   */
  sendCommand(cargadorId, command, params = {}) {
    const id = parseInt(cargadorId);
    const conn = this.connections.get(id);

    if (!conn) {
      console.warn(`[WS Manager] No hay conexión para el cargador ${id}`);
      return false;
    }

    if (conn.ws.readyState !== WebSocket.OPEN) {
      console.warn(`[WS Manager] La conexión al cargador ${id} no está abierta (estado: ${conn.estado})`);
      return false;
    }

    const message = {
      command,
      ...params
    };

    try {
      conn.ws.send(JSON.stringify(message));
      console.log(`[WS Manager] 📤 Comando enviado al cargador ${id}:`, message);
      
      this._notifyGlobalListeners('commandSent', { cargadorId: id, command: message });
      
      return true;
    } catch (error) {
      console.error(`[WS Manager] Error al enviar comando al cargador ${id}:`, error);
      return false;
    }
  }

  /**
   * Cambia el estado de un cargador
   */
  cambiarEstado(cargadorId, nuevoEstado) {
    const estadosValidos = ['disponible', 'ocupado', 'mantenimiento', 'fuera_de_servicio', 'reservado'];
    
    if (!estadosValidos.includes(nuevoEstado)) {
      console.error(`[WS Manager] Estado inválido: ${nuevoEstado}`);
      return false;
    }

    return this.sendCommand(cargadorId, 'cambiar_estado', { estado: nuevoEstado });
  }

  /**
   * Detiene la energía (paro de emergencia)
   */
  detenerEnergia(cargadorId) {
    return this.sendCommand(cargadorId, 'detener_energia');
  }

  /**
   * Obtiene el estado actual de un cargador
   */
  getStatus(cargadorId) {
    const id = parseInt(cargadorId);
    const conn = this.connections.get(id);

    if (!conn) {
      return {
        conectado: false,
        estado: 'desconectado',
        currentState: null,
        lastTelemetry: null,
        iotConectado: false
      };
    }

    return {
      conectado: conn.estado === 'conectado',
      estado: conn.estado,
      currentState: conn.currentState,
      lastTelemetry: conn.lastTelemetry,
      iotConectado: conn.iotConectado
    };
  }

  /**
   * Verifica si hay conexión activa con un cargador
   */
  isConnected(cargadorId) {
    const id = parseInt(cargadorId);
    const conn = this.connections.get(id);
    return conn && conn.estado === 'conectado' && conn.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Verifica si el IoT del cargador está conectado
   */
  isIoTConnected(cargadorId) {
    const id = parseInt(cargadorId);
    const conn = this.connections.get(id);
    return conn && conn.iotConectado === true;
  }

  /**
   * Obtiene todos los cargadores conectados
   */
  getConnectedChargers() {
    const connected = [];
    this.connections.forEach((conn, id) => {
      if (conn.estado === 'conectado') {
        connected.push(id);
      }
    });
    return connected;
  }

  /**
   * Registra un listener global para todos los cargadores
   */
  onGlobal(callback) {
    this.globalListeners.push(callback);
    return () => {
      this.globalListeners = this.globalListeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Registra un listener específico para un cargador
   */
  on(cargadorId, callback) {
    const id = parseInt(cargadorId);
    const conn = this.connections.get(id);

    if (!conn) {
      console.warn(`[WS Manager] No hay conexión para el cargador ${id}`);
      return () => {};
    }

    const listener = { callback };
    conn.listeners.push(listener);

    // Retornar función para eliminar el listener
    return () => {
      conn.listeners = conn.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Procesa un mensaje recibido
   */
  _processMessage(cargadorId, data) {
    const conn = this.connections.get(cargadorId);
    if (!conn) return;

    // Mensaje de suscripción inicial (AHORA INCLUYE ESTADO IoT)
    if (data.type === 'subscribed') {
      conn.currentState = data.estado_cargador;
      conn.iotConectado = data.conectado || false; // Nuevo campo
      console.log(`[WS Manager] Estado inicial del cargador ${cargadorId}: ${data.estado_cargador}, IoT: ${conn.iotConectado ? 'CONECTADO' : 'DESCONECTADO'}`);
      
      // Notificar cambio de estado IoT
      this._notifyGlobalListeners('iotStatus', { 
        cargadorId, 
        iotConectado: conn.iotConectado 
      });
    }

    // Mensajes del publisher (IoT)
    if (data.from === 'publisher' && data.payload) {
      const payload = data.payload;

      // Telemetría
      if (payload.type === 'telemetria') {
        conn.lastTelemetry = payload;
      }

      // Cambio de estado del cargador
      if (payload.type === 'estado_cargador') {
        conn.currentState = payload.estado;
        console.log(`[WS Manager] Estado actualizado del cargador ${cargadorId}: ${payload.estado}`);
      }

      // Alerta
      if (payload.type === 'alerta') {
        console.warn(`[WS Manager] 🚨 Alerta en cargador ${cargadorId}:`, payload);
      }
    }

    // NUEVO: Manejar mensaje directo de estado_cargador (detener_energia)
    if (data.type === 'estado_cargador' && data.command) {
      // Actualizar estado del cargador si viene en el mensaje
      if (data.estado) {
        conn.currentState = data.estado;
        console.log(`[WS Manager] 🔄 Estado actualizado por comando ${data.command}: ${data.estado}`);
        
        // Notificar a listeners globales del cambio de estado
        this._notifyGlobalListeners('stateChanged', { 
          cargadorId, 
          estado: data.estado,
          command: data.command,
          timestamp: data.timestamp 
        });
      }
    }

    // Notificación de conexión/desconexión del IoT (NUEVO)
    if (data.type === 'estado_cargador' && data.hasOwnProperty('conectado')) {
      const iotConectado = data.conectado;
      conn.iotConectado = iotConectado;
      
      console.log(`[WS Manager] ${iotConectado ? '✅ IoT CONECTADO' : '❌ IoT DESCONECTADO'} - Cargador ${cargadorId}`);
      
      // Notificar a listeners globales
      this._notifyGlobalListeners('iotStatus', { 
        cargadorId, 
        iotConectado,
        timestamp: data.timestamp 
      });
    }

    // Confirmación de comando
    if (data.type === 'comando_enviado') {
      console.log(`[WS Manager] ✅ Comando confirmado para cargador ${cargadorId}: ${data.command}`);
    }

    // Error
    if (data.type === 'error') {
      console.error(`[WS Manager] ❌ Error del servidor para cargador ${cargadorId}:`, data.message);
    }
  }

  /**
   * Notifica a todos los listeners globales
   */
  _notifyGlobalListeners(event, data) {
    this.globalListeners.forEach(callback => {
      try {
        callback({ event, ...data });
      } catch (error) {
        console.error('[WS Manager] Error en listener global:', error);
      }
    });
  }
}

// Exportar instancia singleton
export const wsManager = new WebSocketManager();
export default wsManager;
