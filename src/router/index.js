import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import DashboardView from '../views/DashboardView.vue';
import StationsView from '../views/StationsView.vue';
import TariffsView from '../views/TariffsView.vue';
import ReportsView from '../views/ReportsView.vue';
import UsersView from '../views/UsersView.vue';
import cookies from 'vue-cookies'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginView },
  { path: '/dashboard', component: DashboardView },
  { path: '/stations', component: StationsView },
  { path: '/tariffs', component: TariffsView },
  { path: '/reports', component: ReportsView },
  { path: '/users', component: UsersView },
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Global guard: require cookie 'evconnect_token' for protected routes
router.beforeEach((to, from, next) => {
  const publicPages = ['/login'];
  const authRequired = !publicPages.includes(to.path);

  const token = cookies.get('evconnect_token');

  if (authRequired && !token) {
    return next('/login');
  }

  if (to.path === '/login' && token) {
    return next('/dashboard');
  }

  next();
});

export default router;
