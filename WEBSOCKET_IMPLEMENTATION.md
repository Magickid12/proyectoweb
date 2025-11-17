# Implementación de WebSocket

## 📡 Configuración

### Variables de Entorno

El WebSocket se configura a través de variables de entorno en el archivo `.env`:

```bash
# URL del servidor WebSocket
VITE_WS_URL=ws://localhost:4000
```

**Producción:**
```bash
VITE_WS_URL=wss://tu-dominio.com
```

---

## 🏗️ Arquitectura

### 1. Servicio WebSocket (`src/services/websocketService.js`)

Clase singleton que gestiona la conexión WebSocket:

```javascript
import { websocketService } from '@/services/websocketService';

// Conectar
websocketService.connect(token);

// Enviar mensaje
websocketService.send({ type: 'ping' });

// Escuchar eventos
websocketService.on('message', (data) => {
  console.log('Mensaje recibido:', data);
});

// Desconectar
websocketService.disconnect();
```

**Características:**
- ✅ Reconexión automática (máximo 5 intentos)
- ✅ Sistema de eventos personalizado
- ✅ Manejo de errores
- ✅ Estado de conexión

### 2. Composable (`src/composables/useWebSocket.js`)

Facilita el uso en componentes Vue:

#### Uso Manual
```javascript
import { useWebSocket } from '@/composables/useWebSocket';

export default {
  setup() {
    const ws = useWebSocket();
    
    onMounted(() => {
      ws.connect(token);
      ws.on('message', handleMessage);
    });
    
    onUnmounted(() => {
      ws.disconnect();
    });
  }
}
```

#### Uso Automático (Recomendado)
```javascript
import { useWebSocketAuto } from '@/composables/useWebSocket';

export default {
  setup() {
    const ws = useWebSocketAuto(
      localStorage.getItem('evconnect_token'),
      {
        'connected': () => console.log('Conectado'),
        'message': (data) => console.log('Mensaje:', data),
        'disconnected': () => console.log('Desconectado')
      }
    );
    
    // Conecta automáticamente al montar
    // Desconecta automáticamente al desmontar
  }
}
```

---

## 🎯 Implementación en Vistas

### DashboardView.vue

**Eventos escuchados:**
- `dashboard:update` - Actualización completa de estadísticas
- `charger:statusChanged` - Cambio de estado de un cargador

```javascript
const ws = useWebSocketAuto(
  localStorage.getItem('evconnect_token'),
  {
    'dashboard:update': (data) => {
      stats.value = data;
      if (data.estadoCargadores) {
        chargersByStatus.value = data.estadoCargadores;
      }
    },
    'charger:statusChanged': (data) => {
      // Recargar dashboard completo
      loadDashboardData();
    }
  }
);
```

### StationsView.vue

**Eventos escuchados:**
- `station:update` - Actualización de una estación
- `charger:statusChanged` - Cambio de estado de un cargador

```javascript
const ws = useWebSocketAuto(
  localStorage.getItem('evconnect_token'),
  {
    'station:update': (data) => {
      loadData(); // Recargar todas las estaciones
    },
    'charger:statusChanged': (data) => {
      // Actualizar cargador específico en memoria
      const station = stationsData.value.find(s => s.id_estacion === data.id_estacion);
      if (station) {
        const charger = station.cargadores.find(c => c.id_cargador === data.id_cargador);
        if (charger) charger.estado = data.estado;
      }
    }
  }
);
```

---

## 📨 Formato de Mensajes

### Mensajes del Servidor → Cliente

Todos los mensajes tienen la estructura:
```json
{
  "type": "evento",
  "payload": { ... }
}
```

**Ejemplos:**

#### 1. Actualización de Dashboard
```json
{
  "type": "dashboard:update",
  "payload": {
    "energiaTotal": 1500.50,
    "ingresosTotales": 25000.00,
    "ingresosDiarios": 1200.00,
    "sesionesActivas": 5,
    "estadoCargadores": [
      { "estado": "disponible", "cantidad": 10 },
      { "estado": "ocupado", "cantidad": 3 },
      { "estado": "fuera de servicio", "cantidad": 1 }
    ]
  }
}
```

#### 2. Cambio de Estado de Cargador
```json
{
  "type": "charger:statusChanged",
  "payload": {
    "id_cargador": 5,
    "id_estacion": 2,
    "estado": "ocupado",
    "timestamp": "2024-12-01T10:30:00Z"
  }
}
```

#### 3. Actualización de Estación
```json
{
  "type": "station:update",
  "payload": {
    "id_estacion": 2,
    "estado_operacion": "activa",
    "total_cargadores": 4
  }
}
```

### Mensajes del Cliente → Servidor

```javascript
// Ping/Pong para mantener conexión
ws.send({ type: 'ping' });

// Suscribirse a eventos específicos
ws.send({ 
  type: 'subscribe', 
  payload: { events: ['dashboard', 'stations'] } 
});
```

---

## 🔧 Configuración de Vite

Para evitar errores de HMR (Hot Module Replacement):

```javascript
// vite.config.js
export default defineConfig({
  server: {
    port: 5174,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5174
    }
  }
})
```

---

## 🛠️ Métodos del Servicio

### `connect(token)`
Conecta al servidor WebSocket.

**Parámetros:**
- `token` (string): JWT token para autenticación

**Ejemplo:**
```javascript
websocketService.connect(localStorage.getItem('evconnect_token'));
```

### `disconnect()`
Cierra la conexión WebSocket.

```javascript
websocketService.disconnect();
```

### `send(message)`
Envía un mensaje al servidor.

**Parámetros:**
- `message` (object): Mensaje a enviar

**Ejemplo:**
```javascript
websocketService.send({ type: 'ping' });
```

### `on(event, callback)`
Registra un listener para un evento.

**Parámetros:**
- `event` (string): Nombre del evento
- `callback` (function): Función a ejecutar

**Ejemplo:**
```javascript
websocketService.on('connected', () => {
  console.log('WebSocket conectado');
});
```

### `off(event, callback)`
Elimina un listener.

**Ejemplo:**
```javascript
const handler = (data) => console.log(data);
websocketService.on('message', handler);
websocketService.off('message', handler);
```

### `isConnectionOpen()`
Verifica si hay conexión activa.

**Retorna:** `boolean`

```javascript
if (websocketService.isConnectionOpen()) {
  console.log('Conexión activa');
}
```

---

## 🎨 Eventos del Sistema

### Eventos Internos
- `connected` - Conexión establecida
- `disconnected` - Conexión cerrada
- `error` - Error en la conexión
- `message` - Mensaje genérico recibido

### Eventos de Negocio
- `dashboard:update` - Actualización de estadísticas
- `station:update` - Cambio en una estación
- `charger:statusChanged` - Cambio de estado de cargador
- `session:started` - Nueva sesión iniciada
- `session:completed` - Sesión completada

---

## 🔐 Autenticación

El token JWT se envía en la URL de conexión:
```
ws://localhost:4000?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

El backend valida el token y filtra eventos por `franquiciaId`.

---

## ⚠️ Manejo de Errores

### Reconexión Automática
- Máximo 5 intentos
- 3 segundos entre intentos
- Se detiene si se llama a `disconnect()`

### Logs en Consola
```
[WS] Conectando a: ws://localhost:4000?token=...
[WS] Conexión establecida
[WS] Mensaje recibido: { type: '...', payload: {...} }
[WS] Error de conexión: ...
[WS] Conexión cerrada
[WS] Reintentando conexión (1/5)...
```

---

## 📝 Notas Importantes

1. **Conexión por Vista**: El WebSocket se conecta solo en vistas que lo necesitan (Dashboard, Estaciones)
2. **Desconexión Automática**: Al salir de la vista, la conexión se cierra automáticamente
3. **Token Refresh**: Si el token expira, actualizar y reconectar
4. **Producción**: Cambiar `VITE_WS_URL` a `wss://` con SSL

---

## 🚀 Deployment

### Desarrollo
```bash
VITE_WS_URL=ws://localhost:4000
```

### Producción
```bash
VITE_WS_URL=wss://api.evconnect.com
```

Asegurar que el backend soporte WSS (WebSocket Secure) con certificado SSL.

---

## 🧪 Testing

```javascript
// Simular conexión
websocketService.connect('fake-token');

// Simular mensaje del servidor
websocketService.emit('dashboard:update', {
  energiaTotal: 1000,
  ingresosTotales: 5000
});

// Verificar conexión
console.log(websocketService.isConnectionOpen());
```

---

**Fecha:** Diciembre 2024  
**Versión:** 1.0.0
