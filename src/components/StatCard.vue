<template>
  <div class="bg-white p-5 rounded-xl shadow-lg transform hover:scale-[1.02] transition duration-300 border-b-4" :class="borderClass">
    <div class="flex items-center">
      <div class="p-3 rounded-full mr-4" :class="bgClass">
        <font-awesome-icon :icon="iconName" class="w-6 h-6" />
      </div>
      <div>
        <p class="text-sm font-medium text-gray-500">{{title}}</p>
        <p class="text-2xl font-bold text-gray-900">{{value}}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['title','value','icon','color'],
  computed: {
    bgClass() {
      switch(this.color){
        case 'green': return 'stat-card-green';
        case 'teal': return 'stat-card-teal'; // Para usar #37A686
        case 'light': return 'stat-card-light'; // Para usar #52F2B8
        case 'yellow': return 'bg-yellow-100 text-yellow-600';
        case 'red': return 'bg-red-100 text-red-600';
        default: return 'bg-gray-100 text-gray-600';
      }
    },
    borderClass(){
      switch(this.color){
        case 'green': return 'border-green-400';
        case 'teal': return 'stat-border-teal';
        case 'light': return 'stat-border-light';
        case 'yellow': return 'border-yellow-400';
        case 'red': return 'border-red-400';
        default: return 'border-gray-200';
      }
    },
    iconName(){
      // Retorna array para Font Awesome
      switch(this.icon){
        case 'map': return ['fas', 'map-marker-alt'];
        case 'dollar': return ['fas', 'dollar-sign'];
        case 'zap': return ['fas', 'faBolt'];
        case 'charging': return ['fas', 'charging-station'];
        case 'users': return ['fas', 'users'];
        case 'chart': return ['fas', 'chart-bar'];
        default: return ['fas', 'circle'];
      }
    }
  }
}
</script>

<style scoped>
/* Paleta: #2C403A (oscuro), #37A686 (medio), #52F2B8 (claro) */
.stat-card-green {
  background-color: #D5F2E6;
  color: #2C403A;
}

.stat-card-teal {
  background-color: #D9EEE7;
  color: #2C403A;
}

.stat-card-light {
  background-color: #E0F9F2;
  color: #2C403A;
}

.stat-border-teal {
  border-color: #37A686;
}

.stat-border-light {
  border-color: #52F2B8;
}
</style>
