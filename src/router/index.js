import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import DashboardView from '../views/DashboardView.vue';
import StationsView from '../views/StationsView.vue';
import SupportView from '../views/SupportView.vue';
import TariffsView from '../views/TariffsView.vue';
import ReportsView from '../views/ReportsView.vue';
import { sessionState } from '@/utils/session';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginView },
  { path: '/dashboard', component: DashboardView },
  { path: '/stations', component: StationsView },
  { path: '/support', component: SupportView },
  { path: '/tariffs', component: TariffsView },
  { path: '/reports', component: ReportsView },
  { path: '/:pathMatch(.*)*', redirect: '/login' } // Cambiar a /login para evitar loops
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Guard global: requiere autenticación para rutas protegidas
router.beforeEach((to, from, next) => {
  const publicPages = ['/login'];
  const authRequired = !publicPages.includes(to.path);

  // Verificar autenticación desde sessionState Y localStorage como fallback
  const isAuthenticated = sessionState.isAuthenticated || 
                          (localStorage.getItem('evconnect_token') && localStorage.getItem('evconnect_user'));

  if (authRequired && !isAuthenticated) {
    return next('/login');
  }

  if (to.path === '/login' && isAuthenticated) {
    return next('/dashboard');
  }

  next();
});

export default router;
