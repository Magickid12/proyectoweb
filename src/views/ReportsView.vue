<template>
  <div class="p-8">
    <h2 class="text-3xl font-bold mb-4">Reportes y Sesiones de Carga</h2>
    <div class="bg-white p-4 rounded-xl shadow border border-gray-100">
      <h3 class="text-xl font-semibold mb-4">Historial de Sesiones (RB1)</h3>
      <div class="flex justify-end mb-4">
        <button class="bg-green-500 text-white px-4 py-2 rounded">Exportar CSV</button>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead class="text-left text-sm text-gray-500 border-b">
            <tr>
              <th class="py-3 px-4">ID Sesión</th>
              <th class="py-3 px-4">Estación</th>
              <th class="py-3 px-4">Usuario</th>
              <th class="py-3 px-4">kWh</th>
              <th class="py-3 px-4">Costo Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in sessions" :key="s.id" class="hover:bg-gray-50">
              <td class="py-3 px-4 font-medium">{{s.id}}</td>
              <td class="py-3 px-4 text-gray-600">{{s.station}}</td>
              <td class="py-3 px-4 text-gray-600">{{s.user}}</td>
              <td class="py-3 px-4 text-gray-600">{{s.kwh}}</td>
              <td class="py-3 px-4 font-bold">{{s.cost}}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default { data(){ return { sessions: [
  { id: 'S1001', station: 'EV002', user: 'Maria G.', kwh: '15.5', cost: '$38.75' },
  { id: 'S1002', station: 'EV001', user: 'Carlos R.', kwh: '8.2', cost: '$20.50' },
  { id: 'S1003', station: 'EV008', user: 'Juan P.', kwh: '45.0', cost: '$216.00' }
] } } };
</script>
