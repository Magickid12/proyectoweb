import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import VueCookies from 'vue-cookies';

/* Importa la paleta de colores global */
import './assets/palette.css';

/* Importa el plugin de sesión global */
import sessionPlugin from './plugins/sessionPlugin';

/* Importa la configuración de Font Awesome */
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

/* Importa los iconos que vas a usar */
import { 
  faHome, 
  faChargingStation, 
  faDollarSign, 
  faChartBar, 
  faUsers, 
  faSignOutAlt,
  faBars,
  faChevronLeft,
  faChevronRight,
  faCaretLeft,
  faCaretRight,
  faMapMarkerAlt,
  faBolt,
  faHeadset
} from '@fortawesome/free-solid-svg-icons';

/* Añade los iconos a la librería global */
library.add(
  faHome, 
  faChargingStation, 
  faDollarSign, 
  faChartBar, 
  faUsers, 
  faSignOutAlt,
  faBars,
  faChevronLeft,
  faChevronRight,
  faCaretLeft,
  faCaretRight,
  faMapMarkerAlt,
  faBolt,
  faHeadset
);

const app = createApp(App);

/* Registra el componente de Font Awesome globalmente */
app.component('font-awesome-icon', FontAwesomeIcon);

app.use(router);
app.use(VueCookies);
app.use(sessionPlugin); // Registra el plugin de sesión global ($session)
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
