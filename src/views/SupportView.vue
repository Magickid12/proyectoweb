<template>
  <div class="p-8">
    <!-- Loading State con simulación -->
    <SkeletonLoader v-if="loading" type="support" />

    <!-- Contenido Principal -->
    <div v-else>
      <div class="mb-6">
        <h2 class="text-3xl font-bold mb-2">Centro de Soporte</h2>
        <p class="text-gray-600">¿Necesitas ayuda? Estamos aquí para asistirte</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Formulario de Contacto -->
        <div class="lg:col-span-2 bg-white rounded-xl shadow border border-gray-100 p-6">
          <h3 class="text-xl font-bold mb-6">Envíanos un mensaje</h3>
          
          <form @submit.prevent="submitForm" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Nombre completo <span class="text-red-500">*</span>
              </label>
              <input 
                v-model="form.nombre"
                type="text" 
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Tu nombre"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Correo electrónico <span class="text-red-500">*</span>
              </label>
              <input 
                v-model="form.email"
                type="email" 
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Asunto <span class="text-red-500">*</span>
              </label>
              <select 
                v-model="form.asunto"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Selecciona un asunto</option>
                <option value="problema_tecnico">Problema técnico</option>
                <option value="facturacion">Facturación</option>
                <option value="sugerencia">Sugerencia</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Mensaje <span class="text-red-500">*</span>
              </label>
              <textarea 
                v-model="form.mensaje"
                required
                rows="5"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                placeholder="Describe tu consulta o problema..."
              ></textarea>
            </div>

            <div v-if="submitSuccess" class="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-2">
              <i class="fas fa-check-circle"></i>
              <span>Mensaje enviado exitosamente. Te responderemos pronto.</span>
            </div>

            <div v-if="submitError" class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
              <i class="fas fa-exclamation-triangle"></i>
              <span>{{ submitError }}</span>
            </div>

            <button 
              type="submit"
              :disabled="submitting"
              class="w-full bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ submitting ? 'Enviando...' : 'Enviar mensaje' }}
            </button>
          </form>
        </div>

        <!-- Información de Contacto -->
        <div class="space-y-4">
          <!-- Email -->
          <div class="bg-white rounded-xl shadow border border-gray-100 p-6">
            <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 class="font-semibold text-gray-900 mb-2">Correo Electrónico</h4>
            <p class="text-sm text-gray-600">soporte@evconnect.com</p>
            <p class="text-xs text-gray-500 mt-1">Respuesta en 24-48 hrs</p>
          </div>

          <!-- Teléfono -->
          <div class="bg-white rounded-xl shadow border border-gray-100 p-6">
            <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h4 class="font-semibold text-gray-900 mb-2">Teléfono</h4>
            <p class="text-sm text-gray-600">+52 (55) 1234-5678</p>
            <p class="text-xs text-gray-500 mt-1">Lun-Vie 9:00 - 18:00</p>
          </div>

          <!-- WhatsApp -->
          <div class="bg-white rounded-xl shadow border border-gray-100 p-6">
            <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h4 class="font-semibold text-gray-900 mb-2">WhatsApp</h4>
            <p class="text-sm text-gray-600">+52 55 9876-5432</p>
            <p class="text-xs text-gray-500 mt-1">Respuesta inmediata</p>
          </div>
        </div>
      </div>

      <!-- Preguntas Frecuentes -->
      <div class="mt-8 bg-white rounded-xl shadow border border-gray-100 p-6">
        <h3 class="text-xl font-bold mb-6">Preguntas Frecuentes</h3>
        
        <div class="space-y-4">
          <div 
            v-for="(faq, index) in faqs" 
            :key="index"
            class="border border-gray-200 rounded-lg overflow-hidden"
          >
            <button 
              @click="toggleFaq(index)"
              class="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left transition-colors"
            >
              <span class="font-medium text-gray-900">{{ faq.pregunta }}</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                class="h-5 w-5 text-gray-500 transform transition-transform"
                :class="{ 'rotate-180': expandedFaqs.includes(index) }"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div 
              v-if="expandedFaqs.includes(index)"
              class="px-4 py-3 bg-white text-gray-600 text-sm"
            >
              {{ faq.respuesta }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import SkeletonLoader from '@/components/SkeletonLoader.vue';

export default {
  components: { SkeletonLoader },
  setup() {
    const loading = ref(true);
    const submitting = ref(false);
    const submitSuccess = ref(false);
    const submitError = ref(null);
    
    const form = ref({
      nombre: '',
      email: '',
      asunto: '',
      mensaje: ''
    });

    const expandedFaqs = ref([]);
    
    const faqs = [
      {
        pregunta: '¿Cómo inicio una sesión de carga?',
        respuesta: 'Para iniciar una sesión de carga, simplemente conecta tu vehículo al cargador y escanea el código QR o usa la aplicación móvil para autenticarte.'
      },
      {
        pregunta: '¿Cuáles son los métodos de pago aceptados?',
        respuesta: 'Aceptamos tarjetas de crédito/débito, transferencias bancarias y pagos mediante la aplicación móvil EVConnect.'
      },
      {
        pregunta: '¿Qué hago si el cargador no funciona?',
        respuesta: 'Si encuentras un cargador que no funciona, por favor repórtalo inmediatamente a través de este formulario o contacta a soporte técnico al +52 (55) 1234-5678.'
      },
      {
        pregunta: '¿Puedo ver el historial de mis cargas?',
        respuesta: 'Sí, puedes ver todo tu historial de cargas en la sección de "Reportes" del panel de administración o en la aplicación móvil.'
      },
      {
        pregunta: '¿Cómo funcionan las tarifas?',
        respuesta: 'Las tarifas varían según el tipo de carga (lenta o rápida) y se calculan por kWh consumido más un cargo por minuto. Consulta la sección de "Tarifas" para ver los precios actuales.'
      }
    ];

    const toggleFaq = (index) => {
      const faqIndex = expandedFaqs.value.indexOf(index);
      if (faqIndex > -1) {
        expandedFaqs.value.splice(faqIndex, 1);
      } else {
        expandedFaqs.value.push(index);
      }
    };

    const submitForm = async () => {
      try {
        submitting.value = true;
        submitSuccess.value = false;
        submitError.value = null;

        // Simulación de envío (2 segundos)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Simular éxito
        submitSuccess.value = true;
        
        // Limpiar formulario
        form.value = {
          nombre: '',
          email: '',
          asunto: '',
          mensaje: ''
        };

        // Ocultar mensaje de éxito después de 5 segundos
        setTimeout(() => {
          submitSuccess.value = false;
        }, 5000);

      } catch (error) {
        submitError.value = 'Error al enviar el mensaje. Por favor intenta de nuevo.';
        console.error('Error enviando formulario:', error);
      } finally {
        submitting.value = false;
      }
    };

    // Simular carga inicial de 2.5 segundos
    onMounted(() => {
      setTimeout(() => {
        loading.value = false;
      }, 2500);
    });

    return {
      loading,
      submitting,
      submitSuccess,
      submitError,
      form,
      faqs,
      expandedFaqs,
      toggleFaq,
      submitForm
    };
  }
};
</script>

<style scoped>
.text-primary {
  color: #37A686;
}

.bg-primary {
  background-color: #37A686;
}

.bg-primary-dark,
.bg-primary:hover {
  background-color: #2C403A;
}

.bg-primary\/10 {
  background-color: rgba(55, 166, 134, 0.1);
}

.ring-primary {
  --tw-ring-color: #37A686;
}

.focus\:ring-primary:focus {
  --tw-ring-color: #37A686;
}
</style>
