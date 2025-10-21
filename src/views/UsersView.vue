<template>
  <div class="p-8">
    <h2 class="text-3xl font-bold mb-4">Administración de Usuarios</h2>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white p-4 rounded-xl shadow border border-gray-100">
        <h3 class="text-xl font-semibold mb-4">Usuarios Operadores</h3>
        <table class="min-w-full">
          <thead class="text-left text-sm text-gray-500 border-b">
            <tr>
              <th class="py-3 px-4">Nombre</th>
              <th class="py-3 px-4">Rol</th>
              <th class="py-3 px-4 text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="o in operators" :key="o.name">
              <td class="py-3 px-4 font-medium">{{o.name}}</td>
              <td class="py-3 px-4 text-gray-600">{{o.role}}</td>
              <td class="py-3 px-4 text-right"><button class="text-indigo-600">Editar</button></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="bg-white p-4 rounded-xl shadow border border-gray-100">
        <h3 class="text-xl font-semibold mb-4">Usuarios Clientes</h3>
        <div class="space-y-3">
          <div class="p-3 border rounded flex justify-between items-center">
            <span>user_id_12345678... (Activo)</span>
            <button class="text-red-600">Suspender</button>
          </div>
          <div class="p-3 border rounded flex justify-between items-center bg-red-50">
            <span>user_id_00000000... (Suspendido)</span>
            <button class="text-green-600">Reactivar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data(){
    return { operators: [
      { name: 'Admin Principal', role: 'Administrador' },
      { name: 'Ana Sofía', role: 'Financiero' },
      { name: 'Roberto J.', role: 'Soporte Técnico' }
    ] }
  }
}
</script>
