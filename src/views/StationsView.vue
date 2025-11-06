<template>
  <div class="p-8">
    <h2 class="text-3xl font-bold mb-4">Inventario de Cargadores (CSMS)</h2>
    <div class="flex justify-between items-center mb-4">
      <input placeholder="Buscar Cargador..." class="p-3 border rounded w-64" />
      <button class="bg-indigo-600 text-white px-4 py-2 rounded">+ Agregar Cargador</button>
    </div>

    <div class="bg-white p-4 rounded-xl shadow border border-gray-100 overflow-x-auto">
      <table class="min-w-full">
        <thead class="text-left text-sm text-gray-500 border-b">
          <tr>
            <th class="py-3 px-4">ID</th>
            <th class="py-3 px-4">Ubicación</th>
            <th class="py-3 px-4">Estado</th>
            <th class="py-3 px-4">Potencia Máx.</th>
            <th class="py-3 px-4 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr class="hover:bg-gray-50" v-for="s in stations" :key="s.id">
            <td class="py-3 px-4 font-medium">{{s.id}}</td>
            <td class="py-3 px-4 text-gray-600">{{s.location}}</td>
            <td class="py-3 px-4"><StatusBadge :status="s.status" /></td>
            <td class="py-3 px-4 text-gray-600">{{s.power}}</td>
            <td class="py-3 px-4 text-right">
              <button class="text-indigo-600 mr-3">Ver</button>
              <button class="text-red-600">Reset</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import StatusBadge from '../components/StatusBadge.vue';
export default {
  components: { StatusBadge },
  data(){
    return { stations: [
      { id: 'EV001', location: 'Carga lenta 1', status: 'Cargando', power: '22 kW AC' },
      { id: 'EV002', location: 'Carga lenta 2', status: 'Disponible', power: '50 kW DC' },
      { id: 'EV005', location: 'Carga rapida 1', status: 'Falla', power: '7 kW AC' },
      { id: 'EV008', location: 'Carga rapida 2', status: 'Mantenimiento', power: '150 kW DC' }
    ] }
  }
}
</script>

<style scoped>
</style>
