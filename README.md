# EVCONNECT - Backoffice Mock

Prototype visual del backoffice (Vue 3 + Vite) sin lógica de negocio. Contiene vistas navegables y un PWA app-shell básico.

Requisitos:
- Node.js >= 16
- npm

Comandos:

```powershell
npm install
npm run dev
```

Notas:
- El login es un mock que simula una llamada al servidor (5s) y redirige al dashboard.
- El service worker y manifest están en `public/` (registro en `src/main.js`).
- Tailwind se carga desde CDN para prototipado rápido.

Siguientes pasos sugeridos:
- Agregar Tailwind en build, integrar FontAwesome o lucide-react para iconos.
- Añadir tests y pipeline de CI.
