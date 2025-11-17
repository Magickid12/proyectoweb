/**
 * Plugin de Vue para exponer la sesión globalmente
 * Permite acceder a $session desde cualquier componente
 */

import session from '@/utils/session';

export default {
  install(app) {
    // Inicializar la sesión desde localStorage al cargar la app
    session.init();

    // Exponer la sesión completa como $session (con Proxy)
    app.config.globalProperties.$session = session;
  }
};
