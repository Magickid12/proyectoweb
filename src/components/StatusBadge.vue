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
        case 'Cargando': return 'status-cargando'; // Verde claro de la paleta
        case 'Falla': return 'bg-red-100 text-red-800';
        case 'Mantenimiento': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    }
  }
}
</script>

<style scoped>
/* Usar el verde claro #52F2B8 de la paleta en lugar de azul */
.status-cargando {
  background-color: #E0F9F2;
  color: #2C403A;
}
</style>
