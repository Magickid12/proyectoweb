# EVCONNECT Backoffice - AI Coding Instructions

## Architecture Overview

This is a **Vue 3 + Vite** PWA for managing EV charging stations. Key architectural decision: **Station-based WebSocket connections** (one WS per station, receives updates for all chargers in that station).

### Major Components
- **WebSocket Manager** (`src/services/websocketManager.js`): Singleton managing station-level WS connections
- **Views** (`src/views/`): Dashboard, Stations, Reports, etc. with real-time updates
- **Services** (`src/services/`): API clients (dashboard, stations, rates, sessions) + WebSocket manager
- **Stores** (`src/stores/`): Pinia stores for auth and UI state (sidebar, theme)

### Data Flow
```
Backend WS → websocketManager.connect(estacionId) → onMessage callback → View updates reactive refs → Components render
API REST → Service layer → View processes → Store/Local state
```

## WebSocket Integration (CRITICAL)

### Connection Model
- **Connect by station ID**, NOT by charger ID: `wsManager.connect(estacionId, callbacks)`
- Supported stations: `ESTACIONES_CON_WS = [1, 2]` (defined in websocketManager.js)
- Role: `monitor` (backoffice, not IoT device)
- URL: `wss://evconnect-3ydy.onrender.com/ws?estacionId=X&role=monitor`
- **WebSocket is READ-ONLY** - only for receiving real-time updates, NOT for sending commands

### Message Structure (FROM BACKEND)
```json
{
  "type": "estado_estacion",
  "estacionId": 1,
  "cargadores": [
    {
      "id_cargador": 2,
      "tipo_carga": "lenta",
      "capacidad_kw": 11,
      "estado": "disponible",
      "conectado": true,  // ⚠️ IoT device connection status
      "sesion_activa": null
    }
  ],
  "timestamp": "2025-12-08T05:38:56.540Z"
}
```

**Key Fields:**
- `estado`: Charger business state (`disponible`, `ocupado`, `mantenimiento`, `fuera_de_servicio`)
- `conectado`: IoT hardware connection status (true/false)
- **NO `iot_conectado`** - use `conectado` field

### Commands (TO BACKEND via REST API)
**IMPORTANT**: All state changes go through REST API endpoints, NOT WebSocket.

- Emergency stop: `POST /api/sessions/stop-by-charger/{id_cargador}` (from sessionsService.js)
- This endpoint:
  - Changes charger state to `fuera_de_servicio`
  - Backend sends WebSocket update to all monitors
  - Frontend receives update via WebSocket and updates UI reactively
  
**Example flow:**
```javascript
// 1. User clicks emergency stop
await stopChargerByMonitor(chargerId);

// 2. Backend processes and broadcasts via WebSocket
// 3. Frontend receives estado_estacion message
// 4. UI updates automatically via reactive refs
```

## Developer Workflows

### Development
```powershell
npm install
npm run dev  # Vite dev server on http://localhost:5173
```

### Key Files to Check for Patterns
- `src/views/DashboardView.vue`: Full WebSocket integration example (station connection, state management, UI updates)
- `src/services/websocketManager.js`: WS lifecycle, reconnection logic, message processing
- `src/components/ChargerCard.vue`: Component receiving WS data as props

## Project-Specific Conventions

### State Management in Views
- Use **reactive refs** for component state, NOT computed properties for WS data
- Pattern: `chargerWSStates.value[cargadorId]`, `chargerIoTStates.value[cargadorId]`, `chargerCurrentStates.value[cargadorId]`
- **IMPORTANT**: Update `chargerWSStates` in `onStatusChange`, NOT in `onMessage` (ensures immediate UI feedback on connection)

### WebSocket State Updates
```javascript
// ✅ CORRECT - Update WS state immediately on connection
onStatusChange: (status) => {
  const station = chargersByStation.value.find(s => s.estacionId === stationId);
  if (station) {
    station.chargers.forEach(charger => {
      chargerWSStates.value[charger.id_cargador] = status; // Immediate
    });
  }
}

// ❌ WRONG - Don't update WS state in onMessage (causes delay)
onMessage: (data) => {
  chargerWSStates.value[cargadorId] = 'conectado'; // Too late!
}
```

### Toast Notifications
Use `showNotification(message, type)` where type: `'info' | 'success' | 'error' | 'warning' | 'connecting'`

### API Endpoints
- Dashboard stats: `GET /api/franquicia/dashboard`
- Stations full data: `GET /api/stations/franchise`
- Emergency stop: `POST /api/sessions/stop-by-charger/{id_cargador}` (changes state to `fuera_de_servicio`)
- Merge data: Dashboard provides current states, Stations provides full charger metadata

### Session Plugin
Global `$session` available in components via `getCurrentInstance()`:
```javascript
const app = getCurrentInstance();
const $session = app?.appContext.config.globalProperties.$session;
```

## Critical Patterns to Follow

1. **One WS per station** - Never create per-charger connections
2. **Field naming** - Backend uses `conectado`, NOT `iot_conectado`
3. **Message type** - Only `estado_estacion` (no `estado_sincronizado`)
4. **WebSocket is READ-ONLY** - Use REST API for all commands (emergency stop, state changes)
5. **Emergency stop flow** - REST API → Backend updates DB → WebSocket broadcast → UI updates
6. **Charger state vs Connection** - `estado` (business) ≠ `conectado` (hardware IoT link)

## Testing Considerations

When testing WebSocket features:
- Check `chargerWSStates` reflects connection immediately (not after first message)
- Verify `conectado` field updates `IoTStatus` component correctly
- Test station-wide emergency stop affects ALL chargers in that station
- Individual emergency stop affects ONLY specified charger

## Color Palette
Custom Tailwind palette (in `src/assets/palette.css`):
- Primary: `#37A686` (medium green)
- Primary dark: `#2C403A`
- Primary light: `#52F2B8`
- Use semantic classes: `.text-primary`, `.bg-primary-light`

## Common Pitfalls
- ❌ Don't connect by `cargadorId` - always use `estacionId`
- ❌ Don't look for `iot_conectado` field - use `conectado`
- ❌ Don't expect `estado_sincronizado` message - only `estado_estacion`
- ❌ Don't update charger WS state in `onMessage` - do it in `onStatusChange`
- ❌ Don't send commands via WebSocket - use REST API (`stopChargerByMonitor()`)
- ❌ Don't wait for WebSocket confirmation - REST API handles it, WS notifies changes
