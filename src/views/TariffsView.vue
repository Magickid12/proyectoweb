<template>
  <div class="p-8">
    <h2 class="text-3xl font-bold mb-4">Gestión de Tarifas (RO2)</h2>
    <div class="bg-white p-6 rounded-xl shadow border border-gray-100">
      <h3 class="text-xl font-semibold mb-4">Planes Tarifarios</h3>
      <div class="space-y-4">
        <div v-for="t in tariffs" :key="t.name" class="flex justify-between items-center p-4 border rounded hover:bg-gray-50">
          <div>
            <p class="font-semibold text-indigo-700">{{t.name}}</p>
            <p class="text-sm text-gray-500">Costo Base: ${{t.kwh}} / kWh</p>
          </div>
          <div>
            <button class="text-indigo-600 mr-4">Editar</button>
            <button class="text-gray-600">Asignar</button>
          </div>
        </div>
        <button class="w-full bg-green-500 text-white p-3 rounded">+ Crear Nuevo Plan</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data(){
    return { tariffs: [
      { name: 'Estándar AC', kwh: '2.50' },
      { name: 'Rápida DC Pico', kwh: '4.80' },
      { name: 'Valle Nocturno', kwh: '1.80' }
    ] }
  }
}
</script>
