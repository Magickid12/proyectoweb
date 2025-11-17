# 🔄 Flujo Completo del Login - Análisis Detallado

## 📊 Diagrama del Flujo

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USUARIO PRESIONA "Iniciar sesión"                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. LoginView.vue - handleLogin()                                │
│    • @submit.prevent="handleLogin"                              │
│    • Activa loading = true                                      │
│    • Limpia error = null                                        │
│    • Llama: login(email.value, password.value)                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. authService.js - login(email, password)                      │
│    • Importa: post() de http.js                                 │
│    • Importa: API_ENDPOINTS de config/api.js                    │
│    • Importa: setSession() de session.js                        │
│    • Llama: post(API_ENDPOINTS.AUTH.LOGIN, { email, password }) │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. config/api.js - API_ENDPOINTS.AUTH.LOGIN                     │
│    • API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000' │
│    • LOGIN = `${API_URL}/api/admin/login`                       │
│    • Resultado: "http://localhost:4000/api/admin/login"         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. http.js - post(url, data)                                    │
│    • Construye headers con buildHeaders()                       │
│    • Ejecuta: fetch(url, { method: 'POST', headers, body })     │
│    • Espera respuesta del servidor                              │
│    • Timeout: 30 segundos (API_CONFIG.TIMEOUT)                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. SERVIDOR (Backend en localhost:4000)                         │
│    • POST http://localhost:4000/api/admin/login                 │
│    • Body: { "email": "...", "password": "..." }                │
│    • Valida credenciales                                        │
│    • Responde con JSON                                          │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
┌──────────────────────┐         ┌──────────────────────┐
│ ✅ ÉXITO (200)       │         │ ❌ ERROR (401, 500)  │
│ {                    │         │ {                    │
│   success: true,     │         │   success: false,    │
│   data: {            │         │   message: "...",    │
│     user: {...},     │         │   error: "..."       │
│     token: "..."     │         │ }                    │
│   }                  │         └──────────────────────┘
│ }                    │                   │
└──────────────────────┘                   │
              │                             │
              ▼                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7. http.js - handleResponse(response)                           │
│    • Parsea JSON                                                │
│    • Si response.ok === false → lanza error                     │
│    • Si response.ok === true → retorna data                     │
└─────────────────────────────────────────────────────────────────┘
              │                             │
              ▼                             ▼
┌──────────────────────┐         ┌──────────────────────┐
│ ✅ RETORNA DATA      │         │ ❌ LANZA ERROR       │
│ {                    │         │ throw {              │
│   success: true,     │         │   status: 401,       │
│   data: {...}        │         │   message: "...",    │
│ }                    │         │   data: {...}        │
└──────────────────────┘         │ }                    │
              │                  └──────────────────────┘
              ▼                             │
┌─────────────────────────────────────────────────────────────────┐
│ 8. authService.js - Recibe respuesta                            │
│    • Si response.success && response.data → Extrae user y token │
│    • Llama: setSession(token, user)                             │
│    • Retorna: { user, token }                                   │
│    • Si error → throw error                                     │
└─────────────────────────────────────────────────────────────────┘
              │                             │
              ▼                             ▼
┌──────────────────────┐         ┌──────────────────────┐
│ ✅ ÉXITO             │         │ ❌ ERROR             │
│ return { user, token }│        │ throw error         │
└──────────────────────┘         └──────────────────────┘
              │                             │
              ▼                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 9. session.js - setSession(token, user)                         │
│    • sessionState.token = token                                 │
│    • sessionState.user = user                                   │
│    • sessionState.isAuthenticated = true                        │
│    • localStorage.setItem('evconnect_token', token)             │
│    • localStorage.setItem('evconnect_user', JSON.stringify(user))│
└─────────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 10. LoginView.vue - Recibe resultado                            │
│     • const result = await login(...)                           │
│     • Verifica $session.isAuthenticated                         │
│     • Verifica $session.user                                    │
│     • Llama: openSidebar()                                      │
│     • Llama: router.push('/dashboard')                          │
│     • loading = false                                           │
└─────────────────────────────────────────────────────────────────┘
              │                             │
              ▼                             ▼
┌──────────────────────┐         ┌──────────────────────┐
│ ✅ REDIRIGE A        │         │ ❌ MUESTRA ERROR     │
│ /dashboard           │         │ error.value = "..."  │
│                      │         │ loading = false      │
└──────────────────────┘         └──────────────────────┘
```

## 🔍 Análisis de Cada Paso

### Paso 1-2: Interfaz de Usuario (LoginView.vue)
```vue
<form @submit.prevent="handleLogin">
  <input v-model="email" type="email" />
  <input v-model="password" type="password" />
  <button type="submit">Iniciar sesión</button>
</form>
```

**Qué hace:**
- Captura email y password del usuario
- Al hacer submit, previene el comportamiento por defecto
- Llama a `handleLogin()`

**Variables involucradas:**
- `email` (ref)
- `password` (ref)
- `loading` (ref)
- `error` (ref)

### Paso 3: Servicio de Autenticación (authService.js)
```javascript
export async function login(email, password) {
  const response = await post(API_ENDPOINTS.AUTH.LOGIN, {
    email,
    password,
  });
  
  if (response.success && response.data) {
    const { user, token } = response.data;
    setSession(token, user);
    return { user, token };
  }
}
```

**Qué hace:**
- Recibe email y password
- Llama a `post()` con el endpoint y los datos
- Espera la respuesta del servidor
- Si es exitosa, guarda la sesión
- Retorna user y token

### Paso 4: Configuración de API (config/api.js)
```javascript
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_URL}/api/admin/login`
  }
};
```

**Qué hace:**
- Lee la variable de entorno `VITE_API_URL` del archivo `.env`
- Si no existe, usa `http://localhost:4000` por defecto
- Construye la URL completa del endpoint

### Paso 5: Cliente HTTP (http.js)
```javascript
export async function post(url, data = {}, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  
  const response = await fetch(url, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(data),
    signal: controller.signal
  });
  
  return await handleResponse(response);
}
```

**Qué hace:**
- Crea un AbortController para manejar timeouts
- Construye headers (Content-Type, Authorization si existe token)
- Hace la petición fetch al servidor
- Timeout de 30 segundos
- Procesa la respuesta con `handleResponse()`

### Paso 6: Servidor Backend
**Endpoint esperado:** `POST http://localhost:4000/api/admin/login`

**Request:**
```json
{
  "email": "correo@ejemplo.com",
  "password": "password123"
}
```

**Respuesta exitosa esperada:**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": {
      "id": 1,
      "nombre": "Juan Pérez",
      "email": "correo@ejemplo.com",
      "rol": "administrador",
      "franquiciaId": 5
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Respuesta de error:**
```json
{
  "success": false,
  "message": "Credenciales incorrectas",
  "error": "Email o contraseña inválidos"
}
```

### Paso 7: Manejo de Respuesta (http.js - handleResponse)
```javascript
async function handleResponse(response) {
  const data = await response.json();
  
  if (!response.ok) {
    // Si es 401 y NO es login, limpiar sesión
    if (response.status === 401 && !response.url.includes('/login')) {
      localStorage.clear();
      window.location.href = '/login';
    }
    
    throw {
      status: response.status,
      message: data.message || data.error,
      data
    };
  }
  
  return data;
}
```

**Qué hace:**
- Parsea el JSON de la respuesta
- Si `response.ok === false` (status 4xx o 5xx)
  - Lanza un error con status, message y data
- Si `response.ok === true` (status 2xx)
  - Retorna la data parseada

### Paso 8-9: Guardar Sesión (session.js)
```javascript
export function setSession(token, user, customData = {}) {
  sessionState.token = token;
  sessionState.user = user;
  sessionState.isAuthenticated = true;
  
  localStorage.setItem('evconnect_token', token);
  localStorage.setItem('evconnect_user', JSON.stringify(user));
}
```

**Qué hace:**
- Actualiza el estado reactivo de la sesión
- Guarda token y user en localStorage
- Marca `isAuthenticated = true`

### Paso 10: Redirección (LoginView.vue)
```javascript
const result = await login(email.value, password.value);
// result = { user, token }

openSidebar();

setTimeout(() => {
  router.push('/dashboard');
}, 100);
```

**Qué hace:**
- Recibe el resultado del login
- Abre el sidebar
- Espera 100ms para asegurar que la sesión esté guardada
- Redirige al dashboard

## 🐛 Puntos de Fallo Potenciales

### 1. Backend no está corriendo
**Síntoma:** Error de conexión
```
❌ [HTTP POST] Error en fetch
💬 Error message: Failed to fetch
```

**Solución:** Iniciar el backend en puerto 4000

### 2. CORS bloqueado
**Síntoma:** Error de CORS en la consola
```
Access to fetch at 'http://localhost:4000/api/admin/login' from origin 
'http://localhost:5173' has been blocked by CORS policy
```

**Solución:** Configurar CORS en el backend

### 3. Credenciales incorrectas
**Síntoma:** Status 401
```
📋 [HTTP HANDLER] Respuesta final:
  Status: 401
  Data: { success: false, message: "Credenciales incorrectas" }
```

**Solución:** Verificar credenciales en la base de datos

### 4. Estructura de respuesta incorrecta
**Síntoma:** Login se ejecuta pero no guarda sesión
```
⚠️ [AUTH SERVICE] Respuesta no tiene la estructura esperada
```

**Solución:** El código soporta dos estructuras:
- `{ success: true, data: { user, token } }`
- `{ user, token }`

### 5. Puerto diferente
**Síntoma:** Connection refused
```
❌ [HTTP POST] Error en fetch
💬 Error message: Failed to fetch
```

**Solución:** Actualizar `.env` con el puerto correcto

## ✅ Checklist de Verificación

- [ ] Backend está corriendo en `http://localhost:4000`
- [ ] Endpoint `/api/admin/login` existe
- [ ] CORS está configurado para permitir `http://localhost:5173`
- [ ] Credenciales son válidas en la base de datos
- [ ] Archivo `.env` tiene `VITE_API_URL=http://localhost:4000`
- [ ] Respuesta del backend tiene estructura correcta

## 🧪 Comando para Probar Backend

```powershell
# Verificar que el backend responda
curl http://localhost:4000/api/admin/login

# Probar con credenciales
curl -X POST http://localhost:4000/api/admin/login `
  -H "Content-Type: application/json" `
  -d '{"email":"test@ejemplo.com","password":"password123"}'
```

## 📝 Próximo Paso

**Recarga la página e intenta hacer login.**

Los logs en la consola te dirán exactamente en qué paso falla el proceso. Comparte los logs completos para identificar el problema.
