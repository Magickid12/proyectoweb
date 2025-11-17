# Actualización Completa de API Backend

## 📋 Resumen General

Se ha realizado una actualización integral del frontend para integrar los nuevos endpoints del backend. Esta actualización incluye:

- ✅ Reestructuración completa de endpoints API
- ✅ Actualización de servicios con nuevo formato de respuestas
- ✅ Implementación de autenticación JWT con extracción de `franquiciaId`
- ✅ Actualización de todas las vistas para usar nuevos servicios
- ✅ Eliminación de funcionalidades obsoletas (gestión de usuarios)

---

## 🔄 Cambios en Configuración de API

### `src/config/api.js`

**Endpoints actualizados:**

```javascript
// Autenticación
AUTH: {
  LOGIN: '/api/admin/login',          // POST - Login
  CREATE: '/api/admin/create'         // POST - Crear admin (no implementado en UI)
}

// Dashboard
DASHBOARD: {
  STATS: '/api/franquicia/dashboard'  // GET - Estadísticas de la franquicia
}

// Estaciones
STATIONS: {
  BASE: '/api/stations',              // GET - Todas las estaciones (vista móvil)
  FRANCHISE: '/api/stations/franchise' // GET - Estaciones de la franquicia (backoffice)
}

// Tarifas
RATES: {
  BASE: '/api/admin/tarifas',         // GET/POST - Listar y crear tarifas
  BY_ID: (id) => `/api/admin/tarifas/${id}` // PUT/DELETE - Actualizar/eliminar tarifa
}

// Reportes
REPORTS: {
  SESSIONS: '/api/admin/reports/sessions',        // GET - Historial de sesiones
  SESSION_BY_ID: (id) => `/api/admin/reports/sessions/${id}` // GET - Detalle de sesión
}
```

**Endpoints eliminados:**
- `CHARGERS.*` (ya no existe endpoint de cargadores)
- `ADMIN_USERS.*` (no hay gestión de usuarios en nueva API)
- `SESSIONS.EXPORT` (exportación CSV no disponible)

---

## 🔧 Servicios Actualizados

### 1. `authService.js`

**Cambios principales:**
- Extracción de `franquiciaId` desde el payload del JWT
- Eliminación de función `register()`
- Decodificación del token para obtener datos del usuario

```javascript
// Extracción de franquiciaId del JWT
const tokenPayload = JSON.parse(atob(token.split('.')[1]));
userWithFranchise.franquiciaId = tokenPayload.franquiciaId;
```

### 2. `dashboardService.js`

**Simplificación:**
- **Eliminado:** `getActiveAlerts()`, `getEnergyChart()`
- **Mantenido:** `getStats()` → `/api/franquicia/dashboard`

**Respuesta esperada:**
```javascript
{
  energiaTotal: number,
  ingresosTotales: number,
  ingresosDiarios: number,
  sesionesActivas: number,
  estadoCargadores: [
    { estado: string, cantidad: number },
    ...
  ]
}
```

### 3. `stationsService.js`

**Nuevo método principal:**
```javascript
getStationsByFranchise() // GET /api/stations/franchise
```

**Respuesta incluye:**
```javascript
{
  id_estacion: number,
  nombre_estacion: string,
  direccion: string,
  estado_operacion: string,
  total_cargadores: number,
  cargadores: [
    {
      id_cargador: number,
      numero_serie: string,
      tipo_carga: string,
      estado: string,
      ...
    },
    ...
  ]
}
```

**Eliminado:**
- `assignRateToStation()` (tarifas se asignan por separado)

### 4. `ratesService.js`

**Actualizaciones:**
- Validación de respuesta: `response.status === 'success'` (antes `response.success`)
- Soporte para filtros en `getRates(filters)`
- Nueva función `deleteRate(id)` con método `del()`

**Filtros disponibles:**
```javascript
{
  tipo_carga: 'lenta' | 'rapida' | 'ultra_rapida',
  activa: boolean
}
```

### 5. `sessionsService.js`

**Reestructuración completa:**
```javascript
// Antes: paginación
getSessions(page, limit)

// Ahora: filtros
getSessions(filters)
```

**Filtros disponibles:**
```javascript
{
  estado: 'activa' | 'completada' | 'cancelada',
  fecha_inicio: 'YYYY-MM-DD',
  fecha_fin: 'YYYY-MM-DD'
}
```

**Eliminado:**
- `exportSessions()` (no disponible en backend)

### 6. Servicios Eliminados

- ❌ `chargersService.js` - Endpoint no existe
- ❌ `usersService.js` - Sin gestión de usuarios

---

## 🎨 Vistas Actualizadas

### 1. `DashboardView.vue`

**Cambios:**
- Usa solo `getStats()` de dashboardService
- Muestra estadísticas: energíaTotal, ingresosTotales, ingresosDiarios, sesionesActivas
- Sección "Estado de Cargadores" con agrupación por estado

**Cards actualizadas:**
- Energía Total (kWh)
- Ingresos Totales (MXN)
- Ingresos Diarios (MXN)
- Sesiones Activas

### 2. `StationsView.vue`

**Cambios:**
- Usa `getStationsByFranchise()` en lugar de `getStations()`
- Los cargadores vienen incluidos en la respuesta (no se cargan por separado)
- Muestra `numero_serie` de cada cargador
- Eliminada llamada a `chargersService`

### 3. `TariffsView.vue`

**Cambios:**
- Validación de respuesta actualizada
- Manejo correcto de `fecha_fin_vigencia` (puede ser null)
- Soporte para filtros de tarifas

### 4. `ReportsView.vue`

**Cambios importantes:**
- **Eliminado:** Paginación (currentPage, limit, pagination)
- **Eliminado:** Exportación CSV
- **Agregado:** Sistema de filtros (estado, fecha_inicio, fecha_fin)

**Nuevos controles:**
```vue
<select v-model="filters.estado">
  <option value="">Todos</option>
  <option value="activa">Activa</option>
  <option value="completada">Completada</option>
  <option value="cancelada">Cancelada</option>
</select>

<input type="date" v-model="filters.fecha_inicio">
<input type="date" v-model="filters.fecha_fin">
```

### 5. Vista Eliminada

- ❌ `UsersView.vue` - No hay gestión de usuarios

---

## 🛣️ Router Actualizado

### `src/router/index.js`

**Cambios:**
- Eliminado import de `UsersView`
- Eliminada ruta `/users`

**Rutas actuales:**
```javascript
/login          → LoginView
/dashboard      → DashboardView
/stations       → StationsView
/support        → ChargersView (chat de soporte)
/tariffs        → TariffsView
/reports        → ReportsView
```

---

## 🧩 Componentes Actualizados

### `Sidebar.vue`

**Cambios:**
- Eliminado enlace "Usuarios"
- Rutas actuales:
  - Dashboard (home)
  - Estaciones (map-marker-alt)
  - Soporte (headset)
  - Tarifas (dollar-sign)
  - Reportes (chart-bar)

---

## 🔐 Formato de Respuestas

### Antes (formato antiguo):
```javascript
{
  success: true,
  data: {...},
  message: "..."
}
```

### Ahora (nuevo formato):
```javascript
{
  status: 'success' | 'error',
  data: {...},
  message: "..."
}
```

**Validación actualizada en todos los servicios:**
```javascript
if (response.status === 'success' && response.data) {
  return response.data;
}
```

---

## 🎯 Características Clave

### 1. Autenticación JWT
- El token contiene: `id`, `rol`, `franquiciaId`
- `franquiciaId` se extrae y guarda en `$session`
- Backend filtra automáticamente por franquicia usando el token

### 2. Gestión de Sesión
- Plugin `$session` con localStorage persistente
- Propiedades dinámicas: `isAuthenticated`, `nombre`, `email`, `rol`, `franquiciaId`

### 3. Filtrado Automático
- Todos los endpoints protegidos filtran por `franquiciaId` del token
- No es necesario pasar el ID de franquicia en las peticiones

---

## 📝 Pendientes / Futuras Mejoras

1. **Exportación de datos:** Implementar si el backend lo soporta
2. **Gestión de usuarios:** Agregar si se habilita en el backend
3. **Notificaciones en tiempo real:** WebSockets para alertas
4. **Gráficos avanzados:** Charts.js o similar para visualizaciones
5. **Modo offline:** Service Worker para caché de datos

---

## 🚀 Cómo Probar

1. **Iniciar sesión:**
   - Usuario: admin de una franquicia
   - El `franquiciaId` se extrae del JWT automáticamente

2. **Dashboard:**
   - Verifica estadísticas de energía e ingresos
   - Revisa estado de cargadores agrupado

3. **Estaciones:**
   - Solo se muestran estaciones de tu franquicia
   - Los cargadores se despliegan al expandir cada estación

4. **Tarifas:**
   - CRUD completo de tarifas
   - Fecha de fin de vigencia opcional

5. **Reportes:**
   - Aplica filtros por estado y rango de fechas
   - Verifica sesiones de carga

---

## ⚠️ Notas Importantes

- **Sin registro de usuarios:** La API no expone creación de usuarios desde el frontend
- **Sin paginación:** Las sesiones se cargan todas con filtros opcionales
- **Filtrado por franquicia:** Automático en backend, no requiere código extra en frontend
- **Formato de fechas:** Usar ISO 8601 (YYYY-MM-DD) para filtros

---

## 📞 Soporte

Para reportar problemas o sugerencias, usar la sección "Soporte" del backoffice.

---

**Fecha de actualización:** Diciembre 2024  
**Versión:** 2.0.0
