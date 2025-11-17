# Servicios API - EVConnect BackOffice

Esta documentación explica cómo usar los servicios de la API en el proyecto.

## Estructura de Archivos

```
src/
├── config/
│   └── api.js              # Configuración de endpoints
├── utils/
│   ├── http.js             # Cliente HTTP con autenticación
│   └── session.js          # Gestión de sesión global
├── plugins/
│   └── sessionPlugin.js    # Plugin Vue para $session
└── services/
    ├── authService.js      # Autenticación
    ├── dashboardService.js # Dashboard
    ├── chargersService.js  # Cargadores
    ├── ratesService.js     # Tarifas
    ├── stationsService.js  # Estaciones
    ├── sessionsService.js  # Sesiones/Reportes
    └── usersService.js     # Usuarios BackOffice
```

## Variables de Entorno

Copia el archivo `.env.example` a `.env` y configura las variables:

```env
VITE_API_URL=http://localhost:4000
VITE_API_TIMEOUT=30000
```

## Sesión Global ($session)

La sesión está disponible en cualquier componente Vue usando `this.$session`:

```vue
<script>
export default {
  mounted() {
    // Verificar si está autenticado
    if (this.$session.isAuthenticated) {
      console.log('Usuario:', this.$session.user);
      console.log('Token:', this.$session.token);
    }

    // Cerrar sesión
    this.$session.clearSession();
  }
}
</script>
```

### Composition API

En componentes con `<script setup>`:

```vue
<script setup>
import { getCurrentInstance } from 'vue';

const app = getCurrentInstance();
const $session = app.appContext.config.globalProperties.$session;

console.log($session.isAuthenticated);
console.log($session.user);
</script>
```

## Uso de Servicios

### 1. Autenticación (`authService.js`)

```javascript
import { login, logout, register } from '@/services/authService';

// Login
try {
  const result = await login('usuario@ejemplo.com', 'password123');
  console.log('Login exitoso:', result);
  // La sesión se guarda automáticamente en localStorage
} catch (error) {
  console.error('Error en login:', error.message);
}

// Logout
logout();

// Registro
try {
  await register({
    nombre: 'Juan Pérez',
    email: 'juan@ejemplo.com',
    password: 'password123',
    rol: 'operador',
    franquiciaId: 1
  });
} catch (error) {
  console.error('Error en registro:', error.message);
}
```

### 2. Dashboard (`dashboardService.js`)

```javascript
import { getStats, getActiveAlerts, getEnergyChart } from '@/services/dashboardService';

// Estadísticas
const stats = await getStats();
console.log('Total estaciones:', stats.totalEstaciones);

// Alertas activas
const alerts = await getActiveAlerts();
console.log('Alertas:', alerts);

// Gráfico de energía
const chartData = await getEnergyChart();
console.log('Datos del gráfico:', chartData);
```

### 3. Cargadores (`chargersService.js`)

```javascript
import { 
  getChargers, 
  getChargerById, 
  createCharger, 
  updateCharger, 
  deleteCharger,
  resetCharger 
} from '@/services/chargersService';

// Listar cargadores
const chargers = await getChargers();

// Obtener un cargador
const charger = await getChargerById(1);

// Crear cargador
const newCharger = await createCharger({
  nombre: 'Cargador 01',
  estacionId: 1,
  tipo: 'AC',
  potencia: 22
});

// Actualizar cargador
await updateCharger(1, { nombre: 'Cargador 01 Actualizado' });

// Eliminar cargador
await deleteCharger(1);

// Resetear cargador
await resetCharger(1);
```

### 4. Tarifas (`ratesService.js`)

```javascript
import { getRates, getRateById, createRate, updateRate, deleteRate } from '@/services/ratesService';

// Listar tarifas
const rates = await getRates();

// Crear tarifa
const newRate = await createRate({
  nombre: 'Tarifa Nocturna',
  precioPorkWh: 0.15,
  horario: 'nocturno'
});

// Actualizar tarifa
await updateRate(1, { precioPorkWh: 0.18 });

// Eliminar tarifa
await deleteRate(1);
```

### 5. Estaciones (`stationsService.js`)

```javascript
import { getStations, assignRateToStation } from '@/services/stationsService';

// Listar estaciones
const stations = await getStations();

// Asignar tarifa a estación
await assignRateToStation(1, { tarifaId: 3 });
```

### 6. Sesiones/Reportes (`sessionsService.js`)

```javascript
import { getSessions, exportSessionsToCSV } from '@/services/sessionsService';

// Listar sesiones con paginación
const sessions = await getSessions(1, 20); // página 1, 20 por página

// Exportar sesiones a CSV
await exportSessionsToCSV();
// Se descargará automáticamente como 'sesiones_YYYY-MM-DD.csv'
```

### 7. Usuarios BackOffice (`usersService.js`)

```javascript
import { 
  getAdminUsers, 
  getAdminUserById, 
  updateAdminUser, 
  getClients 
} from '@/services/usersService';

// Listar usuarios operadores
const adminUsers = await getAdminUsers();

// Obtener un usuario operador
const user = await getAdminUserById(1);

// Actualizar usuario operador
await updateAdminUser(1, {
  nombre: 'Juan Pérez Actualizado',
  rol: 'administrador'
});

// Listar clientes (app móvil)
const clients = await getClients();
```

## Manejo de Errores

Todos los servicios lanzan errores con la siguiente estructura:

```javascript
{
  message: 'Mensaje descriptivo del error',
  status: 401 // Código HTTP (opcional)
}
```

Ejemplo de manejo:

```vue
<script setup>
import { ref } from 'vue';
import { login } from '@/services/authService';

const error = ref(null);
const loading = ref(false);

async function handleLogin() {
  try {
    loading.value = true;
    error.value = null;
    
    await login(email.value, password.value);
    
    // Redirigir al dashboard
    router.push('/dashboard');
  } catch (err) {
    error.value = err.message;
    
    // Manejo específico por código de estado
    if (err.status === 401) {
      console.error('Credenciales inválidas');
    } else if (err.status === 500) {
      console.error('Error del servidor');
    }
  } finally {
    loading.value = false;
  }
}
</script>
```

## Autenticación Automática

El cliente HTTP (`src/utils/http.js`) añade automáticamente el token JWT a todas las peticiones:

```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

Si el token expira (error 401), se redirige automáticamente al login y se limpia la sesión.

## LocalStorage

La sesión se guarda automáticamente en `localStorage` con las siguientes claves:

- `evconnect_token`: Token JWT
- `evconnect_user`: Datos del usuario (JSON)

No es necesario gestionarlo manualmente, los servicios lo hacen automáticamente.

## Ejemplo Completo - Vista de Login

```vue
<template>
  <div class="login-view">
    <form @submit.prevent="handleLogin">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Contraseña" required />
      
      <p v-if="error" class="error">{{ error }}</p>
      
      <button type="submit" :disabled="loading">
        {{ loading ? 'Iniciando...' : 'Iniciar Sesión' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { login } from '@/services/authService';

const router = useRouter();
const email = ref('');
const password = ref('');
const error = ref(null);
const loading = ref(false);

async function handleLogin() {
  try {
    loading.value = true;
    error.value = null;
    
    const result = await login(email.value, password.value);
    console.log('Login exitoso:', result);
    
    // Redirigir al dashboard
    router.push('/dashboard');
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}
</script>
```

## Ejemplo Completo - Vista de Dashboard

```vue
<template>
  <div class="dashboard">
    <h1>Dashboard</h1>
    
    <div v-if="loading">Cargando...</div>
    
    <div v-else-if="error" class="error">{{ error }}</div>
    
    <div v-else class="stats-grid">
      <StatCard 
        title="Total Estaciones" 
        :value="stats?.totalEstaciones || 0" 
        icon="charging-station"
      />
      <StatCard 
        title="Cargadores Activos" 
        :value="stats?.cargadoresActivos || 0" 
        icon="bolt"
      />
      <StatCard 
        title="Sesiones Hoy" 
        :value="stats?.sesionesHoy || 0" 
        icon="chart-bar"
      />
    </div>
    
    <div v-if="alerts && alerts.length > 0" class="alerts">
      <h2>Alertas Activas</h2>
      <div v-for="alert in alerts" :key="alert.id" class="alert-item">
        {{ alert.mensaje }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getStats, getActiveAlerts } from '@/services/dashboardService';
import StatCard from '@/components/StatCard.vue';

const stats = ref(null);
const alerts = ref([]);
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  try {
    loading.value = true;
    error.value = null;
    
    // Cargar datos en paralelo
    const [statsData, alertsData] = await Promise.all([
      getStats(),
      getActiveAlerts()
    ]);
    
    stats.value = statsData;
    alerts.value = alertsData;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
});
</script>
```

## Notas Importantes

1. **No consumas los endpoints en las vistas por ahora** - La estructura está lista, pero espera antes de integrar en las vistas.

2. **Sesión persistente** - La sesión se mantiene entre recargas de página gracias a `localStorage`.

3. **Token JWT** - El token incluye `franquiciaId` en el payload, se decodifica automáticamente en `session.js`.

4. **Redirección automática** - Si el token expira, se redirige al login automáticamente.

5. **Timeouts** - Las peticiones tienen un timeout de 30 segundos por defecto (configurable en `.env`).
