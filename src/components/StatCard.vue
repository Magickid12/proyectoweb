<template>
  <div class="bg-white p-5 rounded-xl shadow-lg transform hover:scale-[1.02] transition duration-300 border-b-4" :class="borderClass">
    <div class="flex items-center">
      <div class="p-3 rounded-full mr-4" :class="bgClass">
        <i :class="iconClass"></i>
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
        case 'green': return 'bg-green-100 text-green-600';
        case 'indigo': return 'bg-indigo-100 text-indigo-600';
        case 'yellow': return 'bg-yellow-100 text-yellow-600';
        case 'red': return 'bg-red-100 text-red-600';
        default: return 'bg-gray-100 text-gray-600';
      }
    },
    borderClass(){
      switch(this.color){
        case 'green': return 'border-green-400';
        case 'indigo': return 'border-indigo-500';
        case 'yellow': return 'border-yellow-400';
        case 'red': return 'border-red-400';
        default: return 'border-gray-200';
      }
    },
    iconClass(){
      // Using Font Awesome class names placeholders
      switch(this.icon){
        case 'map': return 'fas fa-map-marker-alt w-6 h-6';
        case 'dollar': return 'fas fa-dollar-sign w-6 h-6';
        case 'zap': return 'fas fa-bolt w-6 h-6';
        case 'settings': return 'fas fa-cog w-6 h-6';
        default: return 'fas fa-circle w-6 h-6';
      }
    }
  }
}
</script>

<style scoped>
.fas{ font-size: 1rem; }
</style>
