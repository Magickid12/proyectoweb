<template>
  <span :class="cls" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
    {{ label }}
  </span>
</template>

<script>
export default {
  props: ['status'],
  computed: {
    label() {
      // Normalizar el status
      const normalized = String(this.status).toLowerCase().trim();
      
      // Mapeo de estados
      const labelMap = {
        // Estados de estaciones
        'activa': 'Activa',
        'en_construccion': 'En Construcción',
        'mantenimiento': 'Mantenimiento',
        'inactiva': 'Inactiva',
        
        // Estados de cargadores
        'disponible': 'Disponible',
        'ocupado': 'Ocupado',
        'reservado': 'Reservado',
        'fuera_servicio': 'Fuera de Servicio',
        'fuera de servicio': 'Fuera de Servicio',
        'fuera_de_servicio': 'Fuera de Servicio',
        
        // Estados de sesiones
        'pendiente': 'Pendiente',
        'en_progreso': 'En Progreso',
        'finalizada': 'Finalizada',
        'finalizado': 'Finalizada', // Alternativa del backend
        'cancelada': 'Cancelada',
        'error': 'Error',
        
        // Estados legacy
        'cargando': 'Cargando',
        'falla': 'Falla',
      };
      
      return labelMap[normalized] || this.status;
    },
    
    cls() {
      const normalized = String(this.status).toLowerCase().trim();
      
      // Estados de estaciones
      if (normalized === 'activa') return 'bg-green-100 text-green-800';
      if (normalized === 'en_construccion') return 'bg-yellow-100 text-yellow-800';
      if (normalized === 'inactiva') return 'bg-gray-100 text-gray-800';
      
      // Estados de cargadores
      if (normalized === 'disponible') return 'bg-green-100 text-green-800';
      if (normalized === 'ocupado') return 'status-ocupado';
      if (normalized === 'reservado') return 'bg-blue-100 text-blue-800';
      if (normalized === 'fuera_servicio' || normalized === 'fuera de servicio' || normalized === 'fuera_de_servicio') return 'bg-red-100 text-red-800';
      
      // Estados de sesiones
      if (normalized === 'pendiente') return 'bg-gray-100 text-gray-800';
      if (normalized === 'en_progreso' || normalized === 'cargando') return 'status-cargando';
      if (normalized === 'finalizada' || normalized === 'finalizado') return 'bg-green-100 text-green-800';
      if (normalized === 'cancelada') return 'bg-orange-100 text-orange-800';
      if (normalized === 'error' || normalized === 'falla') return 'bg-red-100 text-red-800';
      
      // Mantenimiento (común a estaciones y cargadores)
      if (normalized === 'mantenimiento') return 'bg-yellow-100 text-yellow-800';
      
      // Default
      return 'bg-gray-100 text-gray-800';
    }
  }
}
</script>

<style scoped>
/* Usar el verde claro #52F2B8 de la paleta para estados en progreso */
.status-cargando,
.status-ocupado {
  background-color: #E0F9F2;
  color: #2C403A;
}
</style>
