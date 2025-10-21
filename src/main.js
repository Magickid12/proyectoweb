import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import VueCookies from 'vue-cookies'

const app = createApp(App);
app.use(router);
app.use(VueCookies);
app.mount('#app');

// Register service worker (only in production-like env or when available)
// Only register the service worker in production to avoid interfering with dev server fetches
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('SW registration failed:', err);
    });
  });
}

export { app };
