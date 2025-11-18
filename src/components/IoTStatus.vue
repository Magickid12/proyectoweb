<template>
  <div class="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium" :class="statusClass">
    <span class="relative flex h-2 w-2">
      <span v-if="connected" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
      <span class="relative inline-flex rounded-full h-2 w-2" :class="dotClass"></span>
    </span>
    <span>{{ statusText }}</span>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  props: {
    connected: {
      type: Boolean,
      default: false
    },
    showLabel: {
      type: Boolean,
      default: true
    }
  },
  setup(props) {
    const statusText = computed(() => {
      if (!props.showLabel) return '';
      return props.connected ? 'IoT Online' : 'IoT Offline';
    });

    const statusClass = computed(() => {
      return props.connected 
        ? 'bg-green-100 text-green-800 border border-green-200' 
        : 'bg-red-100 text-red-800 border border-red-200';
    });

    const dotClass = computed(() => {
      return props.connected ? 'bg-green-500' : 'bg-red-500';
    });

    return {
      statusText,
      statusClass,
      dotClass
    };
  }
};
</script>
