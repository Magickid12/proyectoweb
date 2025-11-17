# Resumen de Correcciones - WebSocket y Configuración

## ✅ Problemas Solucionados

### 1. Error de WebSocket de Vite HMR
**Problema:** 
```
WebSocket connection to 'ws://localhost:undefined' failed
```

**Solución:**
- Configurado HMR en `vite.config.js`:
```javascript
server: {
  port: 5174,
  hmr: {
    protocol: 'ws',
    host: 'localhost',
    port: 5174
  }
}
```

### 2. WebSocket del Backend
**Problema:** No había implementación de WebSocket para conectarse al backend

**Solución:**
- ✅ Creado `src/services/websocketService.js` - Servicio singleton
- ✅ Creado `src/composables/useWebSocket.js` - Composable Vue
- ✅ Implementado en `DashboardView.vue`
- ✅ Implementado en `StationsView.vue`

### 3. Variables de Entorno
**Problema:** Faltaba configuración de URL de WebSocket

**Solución:**
- Agregado `VITE_WS_URL=ws://localhost:4000` en `.env`
- Actualizado `.env.example` con la nueva variable
- URL configurable para producción

### 4. Conexión en Login
**Problema:** WebSocket se conectaba al hacer login (no deseado)

**Solución:**
- WebSocket se conecta **solo** en vistas que lo necesitan:
  - ✅ `DashboardView.vue` - Escucha actualizaciones de estadísticas
  - ✅ `StationsView.vue` - Escucha cambios de estado de cargadores
- Desconexión automática al salir de la vista

---

## 📁 Archivos Creados

### 1. `src/services/websocketService.js`
**Características:**
- Conexión singleton al backend
- Reconexión automática (máx 5 intentos, 3s delay)
- Sistema de eventos personalizado
- Logs detallados para debugging

**Métodos:**
```javascript
connect(token)      // Conectar con JWT
disconnect()        // Desconectar
send(message)       // Enviar mensaje
on(event, callback) // Escuchar evento
off(event, callback)// Dejar de escuchar
isConnectionOpen()  // Verificar conexión
```

### 2. `src/composables/useWebSocket.js`
**Funciones:**

#### `useWebSocket()`
Uso manual con control completo:
```javascript
const ws = useWebSocket();
ws.connect(token);
ws.on('message', handler);
ws.disconnect();
```

#### `useWebSocketAuto(token, handlers)`
Uso automático (recomendado):
```javascript
const ws = useWebSocketAuto(token, {
  'dashboard:update': (data) => { /* ... */ },
  'charger:statusChanged': (data) => { /* ... */ }
});
// Conecta al montar, desconecta al desmontar
```

### 3. `WEBSOCKET_IMPLEMENTATION.md`
Documentación completa con:
- Configuración
- Arquitectura
- Ejemplos de uso
- Formato de mensajes
- Manejo de errores
- Deployment

---

## 🔄 Archivos Modificados

### 1. `.env` y `.env.example`
```bash
# Agregado
VITE_WS_URL=ws://localhost:4000
```

### 2. `vite.config.js`
```javascript
// Agregado
server: {
  port: 5174,
  hmr: {
    protocol: 'ws',
    host: 'localhost',
    port: 5174
  }
}
```

### 3. `src/views/DashboardView.vue`
```javascript
// Agregado
import { useWebSocketAuto } from '@/composables/useWebSocket';

const ws = useWebSocketAuto(
  localStorage.getItem('evconnect_token'),
  {
    'dashboard:update': (data) => { /* actualizar stats */ },
    'charger:statusChanged': (data) => { /* recargar */ }
  }
);
```

### 4. `src/views/StationsView.vue`
```javascript
// Agregado
import { useWebSocketAuto } from '@/composables/useWebSocket';

const ws = useWebSocketAuto(
  localStorage.getItem('evconnect_token'),
  {
    'station:update': (data) => { /* recargar estaciones */ },
    'charger:statusChanged': (data) => { /* actualizar en memoria */ }
  }
);
```

---

## 📡 Eventos WebSocket

### Eventos del Sistema
- `connected` - Conexión establecida
- `disconnected` - Conexión cerrada
- `error` - Error en la conexión
- `message` - Mensaje genérico

### Eventos de Negocio
Según documentación del backend:

#### Dashboard
- `dashboard:update` - Actualización completa de estadísticas
  ```json
  {
    "type": "dashboard:update",
    "payload": {
      "energiaTotal": 1500.50,
      "ingresosTotales": 25000.00,
      "ingresosDiarios": 1200.00,
      "sesionesActivas": 5,
      "estadoCargadores": [...]
    }
  }
  ```

#### Estaciones
- `station:update` - Cambio en una estación
  ```json
  {
    "type": "station:update",
    "payload": {
      "id_estacion": 2,
      "estado_operacion": "activa"
    }
  }
  ```

#### Cargadores
- `charger:statusChanged` - Cambio de estado de cargador
  ```json
  {
    "type": "charger:statusChanged",
    "payload": {
      "id_cargador": 5,
      "id_estacion": 2,
      "estado": "ocupado"
    }
  }
  ```

---

## 🔐 Autenticación WebSocket

El token JWT se envía en la URL:
```
ws://localhost:4000?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

El backend:
1. Valida el token
2. Extrae `franquiciaId`
3. Filtra eventos automáticamente por franquicia

---

## 🎯 Flujo de Uso

### 1. Usuario hace login
- Se guarda token en localStorage
- **NO se conecta WebSocket**

### 2. Usuario entra a Dashboard
- `DashboardView.vue` se monta
- `useWebSocketAuto()` conecta automáticamente
- Escucha eventos de dashboard y cargadores

### 3. Usuario navega a Estaciones
- `DashboardView.vue` se desmonta → desconecta WS
- `StationsView.vue` se monta → conecta WS nuevamente
- Escucha eventos de estaciones y cargadores

### 4. Usuario navega a Tarifas/Reportes
- `StationsView.vue` se desmonta → desconecta WS
- **NO se conecta WebSocket** (no lo necesitan)

### 5. Usuario cierra sesión
- Si hay conexión activa, se desconecta automáticamente

---

## 🚀 Deployment

### Desarrollo
```bash
VITE_API_URL=http://localhost:4000
VITE_WS_URL=ws://localhost:4000
```

### Producción
```bash
VITE_API_URL=https://api.evconnect.com
VITE_WS_URL=wss://api.evconnect.com
```

⚠️ **Importante:** En producción usar `wss://` (WebSocket Secure)

---

## 🧪 Testing

### Verificar Conexión
1. Abrir Dashboard
2. Abrir DevTools → Console
3. Buscar logs: `[WS] Conectando a: ws://localhost:4000?token=...`
4. Verificar: `[WS] Conexión establecida`

### Simular Eventos
Desde el backend, enviar:
```json
{
  "type": "charger:statusChanged",
  "payload": {
    "id_cargador": 1,
    "id_estacion": 1,
    "estado": "ocupado"
  }
}
```

El frontend debe actualizar automáticamente.

---

## ✨ Mejoras Implementadas

1. **Conexión Inteligente**: Solo cuando se necesita
2. **Reconexión Automática**: Si se pierde conexión
3. **Desconexión Automática**: Al cambiar de vista
4. **Logs Detallados**: Para debugging
5. **Variable de Entorno**: Fácil cambio en producción
6. **Composable Reutilizable**: Fácil agregar a nuevas vistas
7. **Sistema de Eventos**: Flexible y escalable

---

## 📚 Documentación

- `WEBSOCKET_IMPLEMENTATION.md` - Guía completa
- `ACTUALIZACION_API_BACKEND.md` - Endpoints REST
- Comentarios en código para cada función

---

## 🎉 Estado Final

✅ **Todos los errores solucionados**
✅ **WebSocket funcional**
✅ **Configuración con variables de entorno**
✅ **Implementado en vistas correctas**
✅ **Documentación completa**
✅ **Sin errores de compilación**

---

**Fecha:** 16 de noviembre de 2025  
**Versión:** 2.1.0
