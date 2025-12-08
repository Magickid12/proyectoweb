/**
 * WebSocket Manager - Gestor de conexiones WebSocket por estación
 * Conecta a estaciones completas en lugar de cargadores individuales
 */

const WS_BASE_URL = 'wss://evconnect-3ydy.onrender.com/ws';
const ESTACIONES_CON_WS = [1, 2]; // Estaciones con WebSocket disponible

class WebSocketManager {
  constructor() {
    // Mapa de conexiones: { estacionId: { ws, estado, listeners, reconnectAttempts, cargadores } }
    this.connections = new Map();
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 5000;
    this.globalListeners = [];
    this.reconnectTimers = new Map();
  }

  /**
   * Verifica si una estación tiene WebSocket disponible
   */
  hasWebSocketSupport(estacionId) {
    return ESTACIONES_CON_WS.includes(parseInt(estacionId));
  }

  /**
   * Conecta a una estación específica
   */
  connect(estacionId, callbacks = {}) {
    const id = parseInt(estacionId);
    
    if (!this.hasWebSocketSupport(id)) {
      console.warn(`[WS Manager] Estación ${id} no tiene soporte WebSocket`);
      return false;
    }

    // Si ya existe una conexión activa, no crear otra
    if (this.connections.has(id)) {
      const conn = this.connections.get(id);
      if (conn.estado === 'conectado' || conn.estado === 'conectando') {
        console.log(`[WS Manager] Ya existe conexión activa para estación ${id}`);
        return true;
      }
    }

    const url = `${WS_BASE_URL}?estacionId=${id}&role=monitor`;
    console.log(`[WS Manager] Conectando a la estación ${id}...`);

    const ws = new WebSocket(url);
    
    const connectionData = {
      ws,
      estado: 'conectando',
      listeners: [],
      reconnectAttempts: 0,
      cargadores: {}, // Mapa de estados de cargadores: { id_cargador: { estado, tipo_carga, sesion_activa, etc } }
      callbacks: callbacks || {}
    };

    this.connections.set(id, connectionData);
    this._notifyGlobalListeners('status', { estacionId: id, estado: 'conectando' });

    // Ejecutar callback de estado si existe
    if (callbacks.onStatusChange) {
      callbacks.onStatusChange('conectando');
    }

    ws.onopen = () => {
      console.log(`[WS Manager] ✅ Conectado a la estación ${id}`);
      connectionData.estado = 'conectado';
      connectionData.reconnectAttempts = 0;
      
      this._notifyGlobalListeners('status', { estacionId: id, estado: 'conectado' });
      
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
        console.log(`[WS Manager] 📨 Mensaje de la estación ${id}:`, data);

        // Procesar mensaje según el tipo
        this._processMessage(id, data);

        // Notificar a listeners específicos de la estación
        connectionData.listeners.forEach(listener => {
          if (listener.callback) {
            listener.callback(data);
          }
        });

        // Notificar a listeners globales
        this._notifyGlobalListeners('message', { estacionId: id, data });

        // Ejecutar callback de mensaje si existe
        if (callbacks.onMessage) {
          callbacks.onMessage(data);
        }

      } catch (error) {
        console.error(`[WS Manager] Error al parsear mensaje de la estación ${id}:`, error);
      }
    };

    ws.onerror = (error) => {
      console.error(`[WS Manager] ❌ Error en estación ${id}:`, error);
      connectionData.estado = 'error';
      
      this._notifyGlobalListeners('status', { estacionId: id, estado: 'error' });
      
      if (callbacks.onStatusChange) {
        callbacks.onStatusChange('error');
      }
      if (callbacks.onError) {
        callbacks.onError(error);
      }
    };

    ws.onclose = () => {
      console.log(`[WS Manager] 🔌 Desconectado de la estación ${id}`);
      connectionData.estado = 'desconectado';
      
      this._notifyGlobalListeners('status', { estacionId: id, estado: 'desconectado' });
      
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
          estacionId: id, 
          estado: 'reconectando', 
          intento: connectionData.reconnectAttempts,
          maxIntentos: this.maxReconnectAttempts
        });
        
        if (callbacks.onStatusChange) {
          callbacks.onStatusChange('reconectando');
        }

        console.log(`[WS Manager] 🔄 Reconectando a la estación ${id} (${connectionData.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        
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
        console.log(`[WS Manager] ⚠️ Máximo de reintentos alcanzado para estación ${id}`);
        this._notifyGlobalListeners('maxReconnectReached', { estacionId: id });
      }
    };

    return true;
  }

  /**
   * Desconecta de una estación específica
   */
  disconnect(estacionId) {
    const id = parseInt(estacionId);
    const conn = this.connections.get(id);

    if (!conn) {
      return;
    }

    console.log(`[WS Manager] Desconectando de la estación ${id}...`);
    
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
    this._notifyGlobalListeners('status', { estacionId: id, estado: 'desconectado' });
  }

  /**
   * Desconecta todas las estaciones
   */
  disconnectAll() {
    console.log('[WS Manager] Desconectando todas las estaciones...');
    const ids = Array.from(this.connections.keys());
    ids.forEach(id => this.disconnect(id));
    
    // Limpiar todos los timers
    this.reconnectTimers.clear();
  }

  /**
   * Reconecta manualmente una estación (útil para botón refresh)
   */
  reconnect(estacionId) {
    const id = parseInt(estacionId);
    const conn = this.connections.get(id);
    
    if (conn) {
      const savedCallbacks = conn.callbacks;
      console.log(`[WS Manager] 🔄 Reconexión manual de la estación ${id}...`);
      
      // Resetear contador de intentos
      this.disconnect(id);
      
      // Reconectar inmediatamente
      setTimeout(() => {
        this.connect(id, savedCallbacks);
      }, 500);
    } else {
      console.warn(`[WS Manager] No hay conexión previa para la estación ${id}`);
    }
  }

  /**
   * Reconecta todas las estaciones manualmente
   */
  reconnectAll() {
    console.log('[WS Manager] 🔄 Reconexión manual de todas las estaciones...');
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
   * Obtiene el estado actual de una estación y sus cargadores
   */
  getStatus(estacionId) {
    const id = parseInt(estacionId);
    const conn = this.connections.get(id);

    if (!conn) {
      return {
        conectado: false,
        estado: 'desconectado',
        cargadores: {}
      };
    }

    return {
      conectado: conn.estado === 'conectado',
      estado: conn.estado,
      cargadores: conn.cargadores || {}
    };
  }

  /**
   * Verifica si hay conexión activa con una estación
   */
  isConnected(estacionId) {
    const id = parseInt(estacionId);
    const conn = this.connections.get(id);
    return conn && conn.estado === 'conectado' && conn.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Verifica si un cargador específico está conectado (IoT online)
   */
  isChargerConnected(estacionId, cargadorId) {
    const id = parseInt(estacionId);
    const conn = this.connections.get(id);
    if (!conn || !conn.cargadores) return false;
    
    const cargador = conn.cargadores[parseInt(cargadorId)];
    return cargador && cargador.iot_conectado === true;
  }

  /**
   * Obtiene todas las estaciones conectadas
   */
  getConnectedStations() {
    const connected = [];
    this.connections.forEach((conn, id) => {
      if (conn.estado === 'conectado') {
        connected.push(id);
      }
    });
    return connected;
  }

  /**
   * Obtiene todos los cargadores de una estación
   */
  getStationChargers(estacionId) {
    const id = parseInt(estacionId);
    const conn = this.connections.get(id);
    return conn ? conn.cargadores || {} : {};
  }

  /**
   * Registra un listener global para todas las estaciones
   */
  onGlobal(callback) {
    this.globalListeners.push(callback);
    return () => {
      this.globalListeners = this.globalListeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Registra un listener específico para una estación
   */
  on(estacionId, callback) {
    const id = parseInt(estacionId);
    const conn = this.connections.get(id);

    if (!conn) {
      console.warn(`[WS Manager] No hay conexión para la estación ${id}`);
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
   * Procesa un mensaje recibido del WebSocket
   */
  _processMessage(estacionId, data) {
    const conn = this.connections.get(estacionId);
    if (!conn) return;

    // Estado de estación (puede ser inicial o actualización)
    if (data.type === 'estado_estacion' && data.cargadores) {
      const esInicial = !conn.cargadores || Object.keys(conn.cargadores).length === 0;
      console.log(`[WS Manager] ${esInicial ? '📡 Estado inicial' : '🔄 Actualización'} para estación ${estacionId}:`, data.cargadores);
      
      // Inicializar si no existe
      if (!conn.cargadores) conn.cargadores = {};
      
      // Actualizar todos los cargadores recibidos
      data.cargadores.forEach(cargador => {
        conn.cargadores[cargador.id_cargador] = {
          id: cargador.id_cargador,
          tipo_carga: cargador.tipo_carga,
          capacidad_kw: cargador.capacidad_kw,
          estado: cargador.estado,
          conectado: cargador.conectado, // ✅ Campo correcto del backend
          sesion_activa: cargador.sesion_activa || null,
          timestamp: data.timestamp
        };

        // Notificar cambio de cargador
        this._notifyGlobalListeners('chargerUpdate', {
          estacionId,
          cargadorId: cargador.id_cargador,
          estado: cargador.estado,
          conectado: cargador.conectado, // ✅ Campo correcto
          sesion_activa: cargador.sesion_activa
        });
      });
    }

    // Confirmación de comando
    if (data.type === 'comando_enviado') {
      console.log(`[WS Manager] ✅ Comando confirmado para estación ${estacionId}: ${data.command}`);
    }

    // Error
    if (data.type === 'error') {
      console.error(`[WS Manager] ❌ Error del servidor para estación ${estacionId}:`, data.message);
      this._notifyGlobalListeners('error', { estacionId, message: data.message });
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
