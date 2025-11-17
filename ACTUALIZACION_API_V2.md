# 🔄 ACTUALIZACIÓN API BACKOFFICE V2.0

## 📅 Fecha: 16 de noviembre de 2025

---

## 📋 RESUMEN DE CAMBIOS

Esta actualización implementa completamente la nueva documentación del backend, con los siguientes cambios principales:

### ✅ Cambios Implementados

1. **Formato de Respuesta del Backend**
   - Ahora maneja ambos formatos: `success: true` y `status: 'success'`
   - Todos los servicios actualizados para compatibilidad

2. **Estados Actualizados**
   - **Sesiones**: `pendiente`, `en_progreso`, `finalizada`, `cancelada`, `error`
   - **Cargadores**: `disponible`, `ocupado`, `mantenimiento`, `reservado`, `fuera_servicio`
   - **Estaciones**: `activa`, `en_construccion`, `mantenimiento`, `inactiva`

3. **Tipos de Carga Estandarizados**
   - `lenta` (7-22 kW)
   - `normal`
   - `rapida` (50-75 kW)
   - `ultrarapida` (>150 kW)

4. **Filtrado por Franquicia**
   - Todas las vistas muestran solo datos de la franquicia del usuario autenticado
   - El `franquiciaId` se extrae automáticamente del JWT token

5. **Logs de Debugging Eliminados**
   - Código de producción limpio sin `console.log`
   - Solo se mantienen logs críticos de errores

---

## 🗂️ ARCHIVOS MODIFICADOS

### Servicios (`src/services/`)

#### `authService.js`
- ✅ Maneja respuesta: `{ success: true, status: 200, data: { user, token } }`
- ✅ Extrae `franquiciaId` del JWT token
- ✅ Logs de debugging eliminados

#### `dashboardService.js`
- ✅ Endpoint: `GET /api/franquicia/dashboard`
- ✅ Retorna: `energiaTotal`, `ingresosTotales`, `ingresosDiarios`, `sesionesActivas`, `estadoCargadores`

#### `stationsService.js`
- ✅ `getStationsByFranchise()`: `GET /api/stations/franchise`
- ✅ `getStations()`: `GET /api/stations` (para app móvil)

#### `ratesService.js`
- ✅ CRUD completo de tarifas: `GET`, `POST`, `PUT`, `DELETE /api/admin/tarifas`
- ✅ Filtros: `?id_estacion=X&tipo_carga=Y`
- ✅ Maneja ambos formatos de respuesta

#### `sessionsService.js`
- ✅ `getSessions()`: `GET /api/admin/reports/sessions`
- ✅ `getSessionById()`: `GET /api/admin/reports/sessions/{id}`
- ✅ Filtros: `?estado=X&fecha_inicio=Y&fecha_fin=Z`
- ✅ Maneja ambos formatos de respuesta

---

### Vistas (`src/views/`)

#### `DashboardView.vue`
- ✅ Agrupa cargadores por estado automáticamente
- ✅ Muestra estadísticas de la franquicia
- ✅ WebSocket para actualizaciones en tiempo real

#### `StationsView.vue`
- ✅ Lista solo estaciones de la franquicia
- ✅ Tipos de carga actualizados
- ✅ Modal para asignar tarifas

#### `TariffsView.vue`
- ✅ CRUD de tarifas
- ✅ Carga estaciones de la franquicia (`getStationsByFranchise`)
- ✅ Tipos de carga actualizados con descripciones

#### `ReportsView.vue`
- ✅ Filtros actualizados: `pendiente`, `en_progreso`, `finalizada`, `cancelada`, `error`
- ✅ Nombre de relación: `Usuario` (antes `User`)
- ✅ Solo muestra sesiones de la franquicia

#### `LoginView.vue`
- ✅ Logs de debugging eliminados
- ✅ Manejo de errores mejorado

---

### Componentes (`src/components/`)

#### `StatusBadge.vue`
- ✅ Maneja todos los estados de:
  - Estaciones (`activa`, `en_construccion`, `mantenimiento`, `inactiva`)
  - Cargadores (`disponible`, `ocupado`, `reservado`, `fuera_servicio`)
  - Sesiones (`pendiente`, `en_progreso`, `finalizada`, `cancelada`, `error`)
- ✅ Normalización automática de estados
- ✅ Colores consistentes con la paleta

---

### Utilidades (`src/utils/`)

#### `http.js`
- ✅ Logs de debugging eliminados
- ✅ Manejo de timeout (30 segundos)
- ✅ Auto-logout en 401 (excepto /login)

#### `session.js`
- ✅ Logs de debugging eliminados
- ✅ Almacenamiento de `franquiciaId`

---

### Router (`src/router/`)

#### `index.js`
- ✅ Logs de debugging eliminados
- ✅ Verificación dual: `sessionState` + `localStorage`
- ✅ Catch-all redirige a `/login`

---

## 🎯 ESTRUCTURA DE RESPUESTAS DEL BACKEND

### Formato Estándar
```json
{
  "success": true,
  "status": 200,
  "message": "Mensaje descriptivo",
  "data": { ... }
}
```

### Login Exitoso
```json
{
  "success": true,
  "message": "Inicio de sesión correcto",
  "data": {
    "user": {
      "id": 7,
      "nombre": "Martin Lopez",
      "email": "martin.lopez@gmail.com",
      "rol": "Admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Token JWT Payload
```json
{
  "id": 7,
  "rol": "Admin",
  "franquiciaId": 1,
  "iat": 1763348748,
  "exp": 1763391948,
  "sub": "7"
}
```

---

## 🔒 SEGURIDAD Y PERMISOS

### Filtrado Automático
- **Dashboard**: Solo estadísticas de la franquicia del usuario
- **Estaciones**: Solo estaciones con `id_franquicia` del token
- **Sesiones**: Solo sesiones de cargadores de la franquicia
- **Tarifas**: Solo tarifas de estaciones de la franquicia

### Headers de Autenticación
```javascript
{
  "Authorization": "Bearer {token}",
  "Content-Type": "application/json"
}
```

---

## 📊 ENDPOINTS DISPONIBLES

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/admin/login` | Login backoffice | ❌ |
| GET | `/api/franquicia/dashboard` | Estadísticas franquicia | ✅ |
| GET | `/api/stations/franchise` | Estaciones de la franquicia | ✅ |
| GET | `/api/admin/tarifas` | Listar tarifas | ✅ |
| POST | `/api/admin/tarifas` | Crear tarifa | ✅ |
| PUT | `/api/admin/tarifas/{id}` | Actualizar tarifa | ✅ |
| DELETE | `/api/admin/tarifas/{id}` | Eliminar tarifa | ✅ |
| GET | `/api/admin/reports/sessions` | Historial sesiones | ✅ |
| GET | `/api/admin/reports/sessions/{id}` | Detalle sesión | ✅ |

---

## ⚙️ CONFIGURACIÓN

### Variables de Entorno (`.env`)
```bash
VITE_API_URL=http://localhost:4000
VITE_WS_URL=ws://localhost:4000
```

### Puerto de Desarrollo
```bash
npm run dev
# Servidor en http://localhost:5175
```

---

## 🧪 TESTING

### Credenciales de Prueba
```
Email: martin.lopez@gmail.com
Password: [según tu base de datos]
```

### Verificar Implementación
1. ✅ Login exitoso → Redirige a `/dashboard`
2. ✅ Dashboard muestra estadísticas de la franquicia
3. ✅ Estaciones muestra solo las de la franquicia
4. ✅ Tarifas permite CRUD completo
5. ✅ Reportes muestra sesiones filtradas
6. ✅ Estados se muestran correctamente (badges)
7. ✅ WebSocket conecta en Dashboard y Stations

---

## 🔄 PRÓXIMOS PASOS

### Opcional (No Implementado)
- ❌ Crear usuario backoffice (excluido según instrucciones)

### Recomendaciones
1. Probar todos los flujos end-to-end
2. Verificar permisos por rol (si aplica)
3. Validar WebSocket en producción
4. Configurar CORS en producción
5. Implementar rate limiting

---

## 📝 NOTAS TÉCNICAS

### Compatibilidad
- ✅ Maneja respuestas legacy: `status: 'success'`
- ✅ Maneja respuestas nuevas: `success: true, status: 200`
- ✅ Normalización automática de estados

### Performance
- ✅ Timeout HTTP: 30 segundos
- ✅ WebSocket auto-reconnect (5 intentos, 3s delay)
- ✅ Lazy loading de estaciones

### Mantenimiento
- ✅ Código limpio sin logs
- ✅ Nombres de variables descriptivos
- ✅ Comentarios en código crítico
- ✅ Estructura modular

---

## 📞 SOPORTE

Para problemas o dudas sobre esta implementación:
- Revisar logs del navegador (F12 → Console)
- Verificar logs del backend
- Confirmar que el backend está en `http://localhost:4000`
- Verificar token JWT en localStorage: `evconnect_token`

---

**Versión**: 2.0  
**Última Actualización**: 16 de noviembre de 2025  
**Estado**: ✅ Implementación Completa
