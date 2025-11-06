<template>
  <div class="p-8">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-3xl font-bold">Dashboard de Operaciones</h2>
      <div class="text-gray-500">⚙️</div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <StatCard title="Estaciones Disponibles" value="02 / 05" icon="charging" color="teal" />
      <StatCard title="Ingresos (Hoy)" value="945.00 MXN" icon="dollar" color="green" />
      <StatCard title="Energía Entregada (Hoy)" value="4,520 kWh" icon="zap" color="light" />
      <StatCard title="Fallas Activas" value="2" icon="chart" color="red" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white p-4 rounded-xl shadow border border-gray-100">
        <h3 class="text-xl font-semibold mb-3">Alertas Activas (RS2)</h3>
        <ul class="space-y-2">
          <li class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center gap-3">
              <span class="h-2 w-2 rounded-full bg-red-500 inline-block"></span>
              <div>
                <div class="font-medium">Estación 005 - Centro Histórico</div>
                <div class="text-sm text-gray-500">Falla de Comunicación OCPP (RS1)</div>
              </div>
            </div>
            <button class="text-xs btn-link">Ver Detalle</button>
          </li>
          <li class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center gap-3">
              <span class="h-2 w-2 rounded-full bg-yellow-400 inline-block"></span>
              <div>
                <div class="font-medium">Estación 012 - Zona Industrial</div>
                <div class="text-sm text-gray-500">Sesión con 12 horas de duración</div>
              </div>
            </div>
            <button class="text-xs btn-link">Ver Detalle</button>
          </li>
        </ul>
      </div>

      <div class="bg-white p-4 rounded-xl shadow border border-gray-100 h-96">
        <h3 class="text-xl font-semibold mb-3">Rendimiento (kWh)</h3>
        <p class="text-gray-500 mt-16 text-center">[ Placeholder para Gráfico de Energía Entregada ]</p>
      </div>
    </div>
  </div>
</template>

<script>
import StatCard from '../components/StatCard.vue';
export default { components: { StatCard } };
</script>

<style scoped>
/* Paleta de colores: #2C403A (oscuro), #37A686 (medio), #52F2B8 (claro) */
.btn-link {
  color: #37A686;
  font-weight: 600;
}

.btn-link:hover {
  color: #2C403A;
  text-decoration: underline;
}
</style>
