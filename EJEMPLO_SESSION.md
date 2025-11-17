# Ejemplos de Uso de $session

## Acceso Dinámico a Cualquier Valor

El objeto `$session` ahora usa un **Proxy** que permite acceder a cualquier propiedad del usuario o datos personalizados de forma dinámica.

## 1. Propiedades Principales

```javascript
// En cualquier componente Vue
this.$session.isAuthenticated  // boolean
this.$session.user            // objeto completo del usuario
this.$session.token           // string JWT
```

## 2. Acceso a Propiedades del Usuario

Si el usuario tiene esta estructura:
```json
{
  "id": 1,
  "nombre": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "rol": "administrador",
  "franquiciaId": 5
}
```

Puedes acceder directamente a cualquier propiedad:

```javascript
this.$session.id              // 1
this.$session.nombre          // "Juan Pérez"
this.$session.email           // "juan@ejemplo.com"
this.$session.rol             // "administrador"
this.$session.franquiciaId    // 5
```

## 3. Datos Personalizados

Puedes guardar valores personalizados en la sesión:

```javascript
// Guardar valor
this.$session.miValor = 'dato personalizado';
this.$session.preferencias = { tema: 'oscuro', idioma: 'es' };

// Leer valor
console.log(this.$session.miValor);        // "dato personalizado"
console.log(this.$session.preferencias);   // { tema: 'oscuro', idioma: 'es' }
```

Los valores personalizados se guardan automáticamente en `localStorage`.

## 4. Métodos Disponibles

```javascript
// Establecer sesión (normalmente lo hace authService.login)
this.$session.set(token, userData, customData);

// Limpiar sesión
this.$session.clear();

// Reinicializar desde localStorage
this.$session.init();

// Obtener valor específico
this.$session.get('nombrePropiedad');

// Establecer valor personalizado
this.$session.setValue('clave', 'valor');
```

## 5. Ejemplos Prácticos

### Verificar Rol del Usuario

```vue
<template>
  <div>
    <button v-if="$session.rol === 'administrador'">
      Panel de Admin
    </button>
    
    <p>Bienvenido, {{ $session.nombre }}</p>
  </div>
</template>

<script>
export default {
  mounted() {
    console.log('Rol del usuario:', this.$session.rol);
    console.log('Franquicia ID:', this.$session.franquiciaId);
  }
}
</script>
```

### Guardar Preferencias del Usuario

```vue
<script>
export default {
  methods: {
    cambiarTema(tema) {
      // Guardar preferencia en la sesión
      this.$session.temaPreferido = tema;
      
      // Se guarda automáticamente en localStorage
      console.log('Tema guardado:', this.$session.temaPreferido);
    },
    
    cargarPreferencias() {
      // Leer preferencia guardada
      const tema = this.$session.temaPreferido || 'claro';
      this.aplicarTema(tema);
    }
  },
  
  mounted() {
    this.cargarPreferencias();
  }
}
</script>
```

### Composition API (script setup)

```vue
<script setup>
import { getCurrentInstance, computed } from 'vue';

const app = getCurrentInstance();
const $session = app.appContext.config.globalProperties.$session;

// Acceso a propiedades
const userName = computed(() => $session.nombre);
const userRole = computed(() => $session.rol);
const franchiseId = computed(() => $session.franquiciaId);

// Guardar datos personalizados
$session.ultimaVista = '/dashboard';
$session.filtrosActivos = { estado: 'activo', tipo: 'AC' };

console.log('Última vista:', $session.ultimaVista);
console.log('Filtros:', $session.filtrosActivos);
</script>

<template>
  <div>
    <h1>Hola, {{ userName }}</h1>
    <p>Tu rol es: {{ userRole }}</p>
    <p>Franquicia ID: {{ franchiseId }}</p>
  </div>
</template>
```

### Verificar Autenticación en Guards

```javascript
// router/index.js
import { sessionState } from '@/utils/session';

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !sessionState.isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});
```

### Mostrar Datos del Usuario en Navbar

```vue
<template>
  <nav>
    <div v-if="$session.isAuthenticated" class="user-info">
      <img :src="$session.avatar || '/default-avatar.png'" alt="Avatar" />
      <span>{{ $session.nombre }}</span>
      <span class="badge">{{ $session.rol }}</span>
      <button @click="logout">Cerrar Sesión</button>
    </div>
  </nav>
</template>

<script>
export default {
  methods: {
    logout() {
      this.$session.clear();
      this.$router.push('/login');
    }
  }
}
</script>
```

## 6. Estructura del LocalStorage

Cuando guardas datos, se crean estas claves en `localStorage`:

```javascript
// Token JWT
localStorage.getItem('evconnect_token')
// "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

// Usuario
localStorage.getItem('evconnect_user')
// {"id":1,"nombre":"Juan Pérez","email":"juan@ejemplo.com","rol":"administrador"}

// Datos personalizados
localStorage.getItem('evconnect_custom_data')
// {"miValor":"dato personalizado","temaPreferido":"oscuro"}
```

## 7. Debugging

```javascript
// Ver toda la información de la sesión
console.log('Usuario:', this.$session.user);
console.log('Token:', this.$session.token);
console.log('Autenticado:', this.$session.isAuthenticated);

// Ver todos los datos personalizados
const customData = JSON.parse(localStorage.getItem('evconnect_custom_data') || '{}');
console.log('Datos personalizados:', customData);
```

## 8. Reactivity

Todos los valores son reactivos, por lo que Vue actualiza automáticamente el DOM cuando cambian:

```vue
<script setup>
import { getCurrentInstance, watchEffect } from 'vue';

const app = getCurrentInstance();
const $session = app.appContext.config.globalProperties.$session;

// Observar cambios en la sesión
watchEffect(() => {
  console.log('Estado de autenticación cambió:', $session.isAuthenticated);
  console.log('Usuario actual:', $session.nombre);
});
</script>
```

## Resumen

- ✅ Acceso directo a cualquier propiedad: `$session.nombrePropiedad`
- ✅ Guardar valores personalizados: `$session.miClave = 'valor'`
- ✅ Persistencia automática en localStorage
- ✅ Reactividad completa con Vue
- ✅ Acceso desde Options API y Composition API
- ✅ Limpieza automática al cerrar sesión
