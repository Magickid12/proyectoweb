# 🔍 Debugging del Login

## Problema Actual
El login muestra "Credenciales incorrectas" al intentar autenticarse.

## ✅ Verificaciones Realizadas

### 1. **Código NO está hardcodeado**
- ✅ `authService.js` usa `post(API_ENDPOINTS.AUTH.LOGIN, { email, password })`
- ✅ No hay validación hardcodeada tipo `if (user === 'admin')`
- ✅ El endpoint se obtiene de `config/api.js`

### 2. **Endpoint Configurado Correctamente**
```javascript
// src/config/api.js
AUTH: {
  LOGIN: `${API_URL}/api/admin/login`,  // http://localhost:4000/api/admin/login
  REGISTER: `${API_URL}/api/admin/create`,
}
```

### 3. **Variables de Entorno**
```env
VITE_API_URL=http://localhost:4000
VITE_API_TIMEOUT=30000
```

## 🐛 Mejoras Implementadas

### 1. **Logs Detallados en authService.js**
```javascript
console.log('🔐 Iniciando login...', { email, endpoint });
console.log('✅ Respuesta del servidor:', response);
console.log('✅ Login exitoso:', { user, token });
console.error('❌ Error en login:', error);
```

### 2. **Logs Detallados en http.js**
```javascript
console.log('HTTP Response:', {
  status: response.status,
  ok: response.ok,
  data
});
```

### 3. **Manejo de Errores Mejorado**
- Protección contra 401 en la ruta de login
- Manejo de JSON inválido
- Mensajes de error específicos por código de estado

### 4. **Soporte para Múltiples Estructuras de Respuesta**
```javascript
// Estructura 1: { success: true, data: { user, token } }
if (response.success && response.data) { ... }

// Estructura 2: { user, token }
if (response.token && response.user) { ... }
```

### 5. **Panel de Debug en LoginView**
Muestra:
- API URL
- Endpoint completo de login
- Email ingresado

## 🧪 Cómo Debuggear

### Paso 1: Abre la Consola del Navegador
1. Presiona `F12` en el navegador
2. Ve a la pestaña **Console**
3. Ve a la pestaña **Network**

### Paso 2: Intenta Hacer Login
Ingresa cualquier email y contraseña, y haz clic en "Iniciar sesión"

### Paso 3: Revisa los Logs en Console
Deberías ver:
```
🔑 Intentando login con: { email: "correo123@gmail.com" }
🔐 Iniciando login... { email: "correo123@gmail.com", endpoint: "http://localhost:4000/api/admin/login" }
HTTP Response: { status: 401, ok: false, data: {...} }
❌ Error en login: { status: 401, message: "...", data: {...} }
❌ Error completo en login: { ... }
```

### Paso 4: Revisa la Pestaña Network
1. Busca la petición a `admin/login`
2. Haz clic en ella
3. Ve a **Headers**:
   - **Request URL**: Debe ser `http://localhost:4000/api/admin/login`
   - **Request Method**: Debe ser `POST`
   - **Content-Type**: Debe ser `application/json`
   
4. Ve a **Payload**:
   ```json
   {
     "email": "correo123@gmail.com",
     "password": "tu_contraseña"
   }
   ```

5. Ve a **Response**:
   - Verifica qué responde el servidor
   - Debería ser JSON con estructura `{ success, message, data }`

### Paso 5: Verifica el Backend

#### Opción A: Backend está corriendo
```powershell
# Verifica que el servidor esté corriendo en puerto 4000
curl http://localhost:4000/api/admin/login
```

Deberías ver algo como:
```json
{"success":false,"message":"Email y contraseña son requeridos"}
```

#### Opción B: Backend NO está corriendo
Si ves errores como:
- `ERR_CONNECTION_REFUSED`
- `Failed to fetch`
- `Network error`

**Solución**: Inicia el backend en `http://localhost:4000`

### Paso 6: Prueba con cURL

```powershell
# Prueba directa al endpoint
curl -X POST http://localhost:4000/api/admin/login `
  -H "Content-Type: application/json" `
  -d '{"email":"test@ejemplo.com","password":"password123"}'
```

Si el backend responde correctamente, deberías ver:
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": { "id": 1, "nombre": "...", "email": "...", "rol": "..." },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

## 🔧 Posibles Causas del Error

### 1. **Backend no está corriendo**
**Síntoma**: Error de conexión en Network
**Solución**: Inicia el backend

### 2. **Credenciales incorrectas (real)**
**Síntoma**: Status 401 con mensaje del servidor
**Solución**: Verifica las credenciales en la base de datos

### 3. **Estructura de respuesta diferente**
**Síntoma**: Login se ejecuta pero no guarda la sesión
**Solución**: El código ahora soporta múltiples estructuras

### 4. **CORS bloqueado**
**Síntoma**: Error de CORS en la consola
**Solución**: Configura CORS en el backend para permitir `http://localhost:5173`

### 5. **Puerto diferente**
**Síntoma**: Connection refused
**Solución**: Verifica que el backend esté en el puerto 4000 o actualiza `.env`

## 📊 Estructura de Respuesta Esperada del Backend

### Login Exitoso
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": {
      "id": 1,
      "nombre": "Juan Pérez",
      "email": "juan@ejemplo.com",
      "rol": "administrador",
      "franquiciaId": 5
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

O estructura alternativa:
```json
{
  "user": {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "rol": "administrador",
    "franquiciaId": 5
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login Fallido (Credenciales Incorrectas)
```json
{
  "success": false,
  "message": "Credenciales incorrectas",
  "error": "Email o contraseña inválidos"
}
```

## 🚀 Siguientes Pasos

1. **Abre el navegador en `http://localhost:5173/login`**
2. **Abre la consola del navegador (F12)**
3. **Intenta hacer login**
4. **Copia y pega TODOS los logs de la consola aquí**
5. **Copia la respuesta de la pestaña Network → Response**

Con esa información puedo identificar exactamente cuál es el problema.

## 💡 Modo de Prueba (Sin Backend)

Si quieres probar la interfaz sin el backend, puedes agregar esto temporalmente:

```javascript
// En src/services/authService.js - SOLO PARA PRUEBAS
export async function login(email, password) {
  console.log('🔐 Modo de prueba (sin backend)');
  
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simular respuesta exitosa
  const mockUser = {
    id: 1,
    nombre: 'Usuario Demo',
    email: email,
    rol: 'administrador',
    franquiciaId: 5
  };
  
  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZnJhbnF1aWNpYUlkIjo1fQ.mock';
  
  setSession(mockToken, mockUser);
  
  return { user: mockUser, token: mockToken };
}
```

**IMPORTANTE**: Esto es SOLO para probar la interfaz. Elimínalo cuando el backend esté listo.
