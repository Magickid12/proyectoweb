<template>
  <Transition name="slide-up">
    <div v-if="showPrompt" class="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50">
      <div class="bg-white rounded-lg shadow-2xl border border-gray-200 p-4">
        <div class="flex items-start gap-3">
          <div class="flex-shrink-0">
            <img src="/icons/logo.png" alt="EVCONNECT" class="w-12 h-12 object-contain" />
          </div>
          
          <div class="flex-1">
            <h3 class="font-semibold text-gray-900 mb-1">Instalar EVCONNECT</h3>
            <p class="text-sm text-gray-600 mb-3">
              Instala la aplicación para acceso rápido y usar offline
            </p>
            
            <div class="flex gap-2">
              <button 
                @click="install"
                class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors"
              >
                Instalar
              </button>
              <button 
                @click="dismiss"
                class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
              >
                Ahora no
              </button>
            </div>
          </div>
          
          <button 
            @click="dismiss"
            class="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  name: 'PWAInstallPrompt',
  setup() {
    const showPrompt = ref(false);
    let deferredPrompt = null;

    onMounted(() => {
      // Listen for the beforeinstallprompt event
      window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        // Stash the event so it can be triggered later
        deferredPrompt = e;
        
        // Check if user has dismissed the prompt before
        const dismissed = localStorage.getItem('pwa-prompt-dismissed');
        if (!dismissed) {
          // Show the install prompt after a delay
          setTimeout(() => {
            showPrompt.value = true;
          }, 5000); // Show after 5 seconds
        }
      });

      // Listen for successful installation
      window.addEventListener('appinstalled', () => {
        console.log('✅ PWA installed successfully');
        deferredPrompt = null;
        showPrompt.value = false;
      });
    });

    const install = async () => {
      if (!deferredPrompt) return;

      // Show the install prompt
      deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log(`User response: ${outcome}`);
      
      // Clear the deferredPrompt
      deferredPrompt = null;
      showPrompt.value = false;
    };

    const dismiss = () => {
      showPrompt.value = false;
      // Remember that user dismissed the prompt
      localStorage.setItem('pwa-prompt-dismissed', 'true');
    };

    return {
      showPrompt,
      install,
      dismiss
    };
  }
};
</script>

<style scoped>
.bg-primary {
  background-color: #37A686;
}

.bg-primary-dark {
  background-color: #2C403A;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(100px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(100px);
}
</style>
