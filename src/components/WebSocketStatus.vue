<template>
  <div class="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium" :class="statusClass">
    <span class="relative flex h-2 w-2">
      <span v-if="status === 'conectado' || status === 'conectando'" class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" :class="pingClass"></span>
      <span class="relative inline-flex rounded-full h-2 w-2" :class="dotClass"></span>
    </span>
    <span>{{ statusText }}</span>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  props: {
    status: {
      type: String,
      default: 'desconectado',
      validator: (value) => ['conectado', 'conectando', 'desconectado', 'reconectando', 'error'].includes(value)
    }
  },
  setup(props) {
    const statusConfig = {
      conectado: {
        text: 'Conectado',
        class: 'bg-green-100 text-green-800',
        dotClass: 'bg-green-500',
        pingClass: 'bg-green-400'
      },
      conectando: {
        text: 'Conectando...',
        class: 'bg-yellow-100 text-yellow-800',
        dotClass: 'bg-yellow-500',
        pingClass: 'bg-yellow-400'
      },
      reconectando: {
        text: 'Reconectando...',
        class: 'bg-orange-100 text-orange-800',
        dotClass: 'bg-orange-500',
        pingClass: 'bg-orange-400'
      },
      desconectado: {
        text: 'Desconectado',
        class: 'bg-gray-100 text-gray-800',
        dotClass: 'bg-gray-500',
        pingClass: ''
      },
      error: {
        text: 'Error',
        class: 'bg-red-100 text-red-800',
        dotClass: 'bg-red-500',
        pingClass: ''
      }
    };

    const statusText = computed(() => statusConfig[props.status]?.text || 'Desconocido');
    const statusClass = computed(() => statusConfig[props.status]?.class || 'bg-gray-100 text-gray-800');
    const dotClass = computed(() => statusConfig[props.status]?.dotClass || 'bg-gray-500');
    const pingClass = computed(() => statusConfig[props.status]?.pingClass || '');

    return {
      statusText,
      statusClass,
      dotClass,
      pingClass
    };
  }
};
</script>
