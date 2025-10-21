<template>
  <span :class="cls" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
    {{ status }}
  </span>
</template>

<script>
export default {
  props: ['status'],
  computed: {
    cls(){
      switch(this.status){
        case 'Disponible': return 'bg-green-100 text-green-800';
        case 'Cargando': return 'bg-blue-100 text-blue-800';
        case 'Falla': return 'bg-red-100 text-red-800';
        case 'Mantenimiento': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    }
  }
}
</script>
