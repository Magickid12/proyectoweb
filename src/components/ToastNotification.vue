<template>
  <Transition name="toast">
    <div v-if="visible" class="fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg max-w-md" :class="typeClass">
      <div class="flex-shrink-0 text-xl">
        {{ icon }}
      </div>
      <div class="flex-1 min-w-0">
        <p class="font-medium text-sm">{{ message }}</p>
      </div>
      <button @click="close" class="flex-shrink-0 text-current opacity-70 hover:opacity-100">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  </Transition>
</template>

<script>
import { ref, computed, watch } from 'vue';

export default {
  props: {
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'info',
      validator: (value) => ['success', 'error', 'warning', 'info', 'connecting'].includes(value)
    },
    duration: {
      type: Number,
      default: 3000
    },
    show: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const visible = ref(props.show);
    let timeout = null;

    const typeConfig = {
      success: {
        class: 'bg-green-50 text-green-900 border border-green-200',
        icon: '✅'
      },
      error: {
        class: 'bg-red-50 text-red-900 border border-red-200',
        icon: '❌'
      },
      warning: {
        class: 'bg-yellow-50 text-yellow-900 border border-yellow-200',
        icon: '⚠️'
      },
      info: {
        class: 'bg-blue-50 text-blue-900 border border-blue-200',
        icon: 'ℹ️'
      },
      connecting: {
        class: 'bg-gray-50 text-gray-900 border border-gray-200',
        icon: '🔄'
      }
    };

    const typeClass = computed(() => typeConfig[props.type]?.class || typeConfig.info.class);
    const icon = computed(() => typeConfig[props.type]?.icon || typeConfig.info.icon);

    const close = () => {
      visible.value = false;
      if (timeout) {
        clearTimeout(timeout);
      }
      emit('close');
    };

    const startTimer = () => {
      if (props.duration > 0) {
        timeout = setTimeout(() => {
          close();
        }, props.duration);
      }
    };

    watch(() => props.show, (newVal) => {
      visible.value = newVal;
      if (newVal) {
        startTimer();
      }
    }, { immediate: true });

    return {
      visible,
      typeClass,
      icon,
      close
    };
  }
};
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
