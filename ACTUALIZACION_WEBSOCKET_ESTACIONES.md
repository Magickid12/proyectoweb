# Actualización WebSocket - Arquitectura por Estación

## 📋 Resumen de Cambios

Se ha migrado exitosamente la arquitectura WebSocket de **conexiones por cargador** a **conexiones por estación**, siguiendo los cambios implementados en el backend.

---

## 🔄 Modelo Anterior vs Nuevo

### Modelo Anterior (Per-Charger)
```javascript
// URL: ws://...?cargadorId=2&role=client
// Una conexión por cada cargador
wsManager.connect(cargadorId)
```

### Modelo Nuevo (Per-Station)
```javascript
// URL: ws://...?estacionId=1&role=monitor
// Una conexión por estación (múltiples cargadores)
wsManager.connect(estacionId)
```

---

## 📁 Archivos Modificados

### 1. `src/services/websocketManager.js`

#### Cambios principales:
- ✅ Constante `CARGADORES_CON_WS` → `ESTACIONES_CON_WS` [1, 2]
- ✅ Método `connect(estacionId)` con URL actualizada a `?estacionId=X&role=monitor`
- ✅ Estructura de datos de conexión actualizada para almacenar múltiples cargadores por estación
- ✅ Método `_processMessage()` completamente reescrito para manejar nuevos tipos de mensaje:
  - `estado_sincronizado`: Estado inicial de todos los cargadores al conectar
  - `estado_estacion`: Actualizaciones en tiempo real de cargadores
- ✅ Métodos `sendCommand()`, `cambiarEstado()`, `detenerEnergia()` actualizados con firma `(estacionId, cargadorId, ...)`
- ✅ **NUEVO**: Método `detenerEnergiaEstacion(estacionId)` para paro de emergencia de toda la estación
- ✅ Métodos helper actualizados:
  - `getStatus(estacionId)`: Devuelve estado de la estación y mapa de cargadores
  - `isConnected(estacionId)`: Verifica conexión de estación
  - `isChargerConnected(estacionId, cargadorId)`: Verifica estado IoT de cargador específico
  - `getConnectedStations()`: Lista estaciones conectadas
  - `getStationChargers(estacionId)`: Obtiene todos los cargadores de una estación

#### Tipos de mensaje manejados:
```javascript
// Mensaje inicial al conectar
{
  type: 'estado_sincronizado',
  cargadores: [
    {
      id_cargador: 1,
      nombre_cargador: "Cargador A",
      estado: "disponible",
      iot_conectado: true,
      sesion_activa: { ... }
    },
    // ... más cargadores
  ],
  timestamp: "2025-01-08T10:30:00Z"
}

// Actualizaciones en tiempo real
{
  type: 'estado_estacion',
  cargadores: [ /* mismo formato */ ],
  timestamp: "2025-01-08T10:35:00Z"
}
```

---

### 2. `src/views/DashboardView.vue`

#### Cambios principales:
- ✅ Import actualizado: removido `useWebSocketSupport`, ahora usa `wsManager` directamente
- ✅ Función `connectStationWS(stationId, stationName)`: Conecta a toda una estación en lugar de cargadores individuales
- ✅ Handler de mensajes actualizado para procesar arrays de cargadores:
  - `estado_sincronizado`: Inicializa estados de todos los cargadores
  - `estado_estacion`: Actualiza estados y notifica cambios significativos
- ✅ Función `connectSupportedStations()`: Conecta todas las estaciones con soporte WebSocket
- ✅ Función `handleEmergencyStop(chargerId)`: Paro de emergencia individual (determina estación automáticamente)
- ✅ **NUEVO**: Función `handleStationEmergencyStop(stationId)`: Paro de emergencia para TODA la estación con confirmación
- ✅ **NUEVO**: Botón UI "PARO DE EMERGENCIA" en header de cada estación
- ✅ `ChargerCard` recibe prop `hasSupport(estacionId)` en lugar de `hasSupport(cargadorId)`
- ✅ Limpieza en `onUnmounted`: Llama a `disconnectAllStations()`

#### UI Nuevo Elemento:
```vue
<!-- Botón de paro de emergencia para toda la estación -->
<button
  @click.stop="handleStationEmergencyStop(stationGroup.estacionId)"
  class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg..."
>
  <i class="fas fa-exclamation-triangle"></i>
  <span>PARO DE EMERGENCIA</span>
</button>
```

---

## 🆕 Nueva Funcionalidad

### Paro de Emergencia de Estación Completa

**Ubicación**: Encabezado de cada estación en Dashboard

**Comportamiento**:
1. Usuario hace clic en "PARO DE EMERGENCIA"
2. Aparece confirmación: "¿Está seguro de ejecutar PARO DE EMERGENCIA en TODA la [Nombre Estación]?"
3. Si confirma:
   - Envía comando `detener_energia_estacion` al WebSocket
   - Backend detiene todos los cargadores de la estación
   - Frontend recibe mensaje `estado_estacion` con todos los cargadores en `fuera_de_servicio`
   - Notificaciones toast informan del cambio

**Comando enviado**:
```javascript
{
  command: 'detener_energia_estacion'
}
```

---

## 🔌 Flujo de Conexión Actualizado

### Al cargar Dashboard:

1. **Cargar datos**:
   - GET `/api/franquicia/dashboard` → Stats y estado de cargadores
   - GET `/api/stations/franchise` → Info completa de estaciones y cargadores

2. **Conectar WebSocket**:
   ```javascript
   // Por cada estación con soporte (IDs 1, 2):
   wsManager.connect(estacionId, {
     onStatusChange: (status) => { /* ... */ },
     onMessage: (data) => {
       // Mensaje inicial: estado_sincronizado
       // Actualizaciones: estado_estacion
     }
   });
   ```

3. **Recibir estado inicial**:
   - Mensaje `estado_sincronizado` con array de cargadores
   - Actualizar `chargerCurrentStates`, `chargerIoTStates`, `chargerWSStates`

4. **Escuchar actualizaciones**:
   - Mensajes `estado_estacion` con cargadores modificados
   - Comparar estados anteriores y notificar cambios

---

## 🧪 Testing Recomendado

### Casos de prueba:

1. **Conexión inicial**:
   - [ ] Dashboard carga y conecta a Estación 1 y 2
   - [ ] Estados de cargadores se muestran correctamente
   - [ ] Indicadores IoT reflejan estado real

2. **Actualizaciones en tiempo real**:
   - [ ] Cambio de estado de cargador se refleja en UI
   - [ ] Conexión/desconexión de IoT muestra notificación
   - [ ] Sesión activa actualiza información

3. **Paro de emergencia individual**:
   - [ ] Botón en ChargerCard envía comando correcto
   - [ ] Estado cambia a `fuera_de_servicio`
   - [ ] Notificación aparece

4. **Paro de emergencia de estación** (NUEVO):
   - [ ] Confirmación aparece antes de ejecutar
   - [ ] Comando `detener_energia_estacion` se envía
   - [ ] TODOS los cargadores de la estación cambian a `fuera_de_servicio`
   - [ ] Notificaciones adecuadas aparecen

5. **Reconexión**:
   - [ ] Botón refresh reconecta correctamente
   - [ ] Estados se sincronizan tras reconexión

---

## 🐛 Notas de Depuración

### Logs de consola útiles:

```javascript
// Conexión exitosa
[WS Manager] ✅ Conectado a estación 1

// Estado inicial sincronizado
[WS Manager] 📡 Estado sincronizado inicial para estación 1: [...]

// Actualización recibida
[WS Manager] 🔄 Estado actualizado para estación 1: [...]

// Paro de emergencia
[WS Manager] 🚨 PARO DE EMERGENCIA enviado a estación 1
```

### Verificar en DevTools:

```javascript
// Verificar conexiones activas
wsManager.getConnectedStations()
// Retorna: [1, 2]

// Ver estado de estación
wsManager.getStatus(1)
// Retorna: { conectado: true, estado: 'conectado', cargadores: {...} }

// Ver cargadores de estación
wsManager.getStationChargers(1)
// Retorna: { 1: {...}, 2: {...}, ... }

// Verificar si cargador específico está online
wsManager.isChargerConnected(1, 2)
// Retorna: true/false
```

---

## ✅ Checklist de Migración Completa

- [x] `websocketManager.js` refactorizado completamente
- [x] `DashboardView.vue` actualizado con conexiones por estación
- [x] Botón de paro de emergencia de estación agregado
- [x] Handlers de mensajes actualizados para nuevos tipos
- [x] Limpieza de imports innecesarios
- [x] Sin errores de linting/compilación
- [ ] `StationsView.vue` pendiente de actualización (si usa WebSocket)
- [ ] `useWebSocket.js` composable pendiente de refactorización (si se requiere)

---

## 📚 Próximos Pasos

1. **StationsView.vue**: Aplicar mismos cambios que Dashboard si usa WebSocket
2. **Testing E2E**: Probar todos los casos de uso con backend real
3. **Documentación**: Actualizar README.md con nueva arquitectura
4. **Monitoreo**: Agregar métricas de conexión y latencia si es necesario

---

## 🔗 Referencias

- Backend WebSocket API: `wss://evconnect-3ydy.onrender.com/ws`
- Endpoint Dashboard: `/api/franquicia/dashboard`
- Endpoint Estaciones: `/api/stations/franchise`
- Rol de conexión: `monitor` (backoffice)
- Estaciones con WebSocket: [1, 2]

---

**Fecha de actualización**: 2025-01-08  
**Versión**: 2.0 - Arquitectura por Estación
