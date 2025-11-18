<template>
  <div class="skeleton-container">
    <!-- Skeleton para Dashboard -->
    <div v-if="type === 'dashboard'" class="p-8">
      <!-- Header -->
      <div class="mb-6">
        <div class="skeleton skeleton-title w-64 h-8 mb-2"></div>
        <div class="skeleton skeleton-text w-48 h-4"></div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div v-for="n in 4" :key="n" class="skeleton-card">
          <div class="skeleton skeleton-circle w-12 h-12 mb-3"></div>
          <div class="skeleton skeleton-text w-24 h-4 mb-2"></div>
          <div class="skeleton skeleton-text w-32 h-6"></div>
        </div>
      </div>

      <!-- Resumen de Estados -->
      <div class="skeleton-card mb-6">
        <div class="skeleton skeleton-title w-64 h-6 mb-4"></div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="n in 3" :key="n" class="p-4">
            <div class="skeleton skeleton-text w-24 h-4 mb-2"></div>
            <div class="skeleton skeleton-text w-16 h-8 mb-1"></div>
            <div class="skeleton skeleton-text w-20 h-3"></div>
          </div>
        </div>
      </div>

      <!-- Cargadores -->
      <div class="skeleton-card">
        <div class="skeleton skeleton-title w-72 h-6 mb-4"></div>
        <div class="space-y-4">
          <div v-for="n in 2" :key="n">
            <div class="skeleton skeleton-text w-48 h-5 mb-3"></div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="m in 3" :key="m" class="skeleton-charger-card">
                <div class="skeleton skeleton-text w-32 h-5 mb-2"></div>
                <div class="skeleton skeleton-text w-24 h-4 mb-3"></div>
                <div class="space-y-2">
                  <div class="skeleton skeleton-text w-full h-3"></div>
                  <div class="skeleton skeleton-text w-full h-3"></div>
                  <div class="skeleton skeleton-text w-3/4 h-3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Skeleton para Stations -->
    <div v-else-if="type === 'stations'" class="p-8">
      <div class="mb-6">
        <div class="skeleton skeleton-title w-96 h-8"></div>
      </div>
      <div class="space-y-4">
        <div v-for="n in 3" :key="n" class="skeleton-card">
          <div class="skeleton skeleton-text w-48 h-6 mb-4"></div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="m in 3" :key="m" class="skeleton-charger-card">
              <div class="skeleton skeleton-text w-32 h-5 mb-2"></div>
              <div class="skeleton skeleton-text w-24 h-4"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Skeleton para Tarifas -->
    <div v-else-if="type === 'tariffs'" class="p-8">
      <div class="mb-6">
        <div class="skeleton skeleton-title w-64 h-8"></div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="n in 6" :key="n" class="skeleton-card">
          <div class="skeleton skeleton-text w-32 h-6 mb-3"></div>
          <div class="skeleton skeleton-text w-40 h-8 mb-4"></div>
          <div class="space-y-2">
            <div class="skeleton skeleton-text w-full h-3"></div>
            <div class="skeleton skeleton-text w-full h-3"></div>
            <div class="skeleton skeleton-text w-2/3 h-3"></div>
          </div>
          <div class="mt-4 skeleton skeleton-button w-full h-10"></div>
        </div>
      </div>
    </div>

    <!-- Skeleton para Reportes -->
    <div v-else-if="type === 'reports'" class="p-8">
      <div class="mb-6">
        <div class="skeleton skeleton-title w-64 h-8 mb-4"></div>
        <div class="flex gap-4 mb-6">
          <div class="skeleton skeleton-button w-32 h-10"></div>
          <div class="skeleton skeleton-button w-32 h-10"></div>
          <div class="skeleton skeleton-button w-32 h-10"></div>
        </div>
      </div>
      
      <!-- Tabla de reportes -->
      <div class="skeleton-card">
        <div class="skeleton skeleton-text w-48 h-6 mb-4"></div>
        <div class="space-y-3">
          <div class="grid grid-cols-4 gap-4 pb-3 border-b">
            <div class="skeleton skeleton-text w-full h-4"></div>
            <div class="skeleton skeleton-text w-full h-4"></div>
            <div class="skeleton skeleton-text w-full h-4"></div>
            <div class="skeleton skeleton-text w-full h-4"></div>
          </div>
          <div v-for="n in 8" :key="n" class="grid grid-cols-4 gap-4 py-2">
            <div class="skeleton skeleton-text w-full h-3"></div>
            <div class="skeleton skeleton-text w-full h-3"></div>
            <div class="skeleton skeleton-text w-full h-3"></div>
            <div class="skeleton skeleton-text w-20 h-3"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Skeleton para Soporte -->
    <div v-else-if="type === 'support'" class="p-8">
      <div class="mb-6">
        <div class="skeleton skeleton-title w-48 h-8 mb-2"></div>
        <div class="skeleton skeleton-text w-64 h-4"></div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Formulario de contacto -->
        <div class="lg:col-span-2 skeleton-card">
          <div class="skeleton skeleton-text w-48 h-6 mb-6"></div>
          <div class="space-y-4">
            <div>
              <div class="skeleton skeleton-text w-32 h-4 mb-2"></div>
              <div class="skeleton skeleton-input w-full h-12"></div>
            </div>
            <div>
              <div class="skeleton skeleton-text w-32 h-4 mb-2"></div>
              <div class="skeleton skeleton-input w-full h-12"></div>
            </div>
            <div>
              <div class="skeleton skeleton-text w-32 h-4 mb-2"></div>
              <div class="skeleton skeleton-input w-full h-32"></div>
            </div>
            <div class="skeleton skeleton-button w-40 h-12"></div>
          </div>
        </div>

        <!-- Información de contacto -->
        <div class="space-y-4">
          <div class="skeleton-card">
            <div class="skeleton skeleton-circle w-12 h-12 mb-3"></div>
            <div class="skeleton skeleton-text w-32 h-5 mb-2"></div>
            <div class="skeleton skeleton-text w-full h-3"></div>
          </div>
          <div class="skeleton-card">
            <div class="skeleton skeleton-circle w-12 h-12 mb-3"></div>
            <div class="skeleton skeleton-text w-32 h-5 mb-2"></div>
            <div class="skeleton skeleton-text w-full h-3"></div>
          </div>
          <div class="skeleton-card">
            <div class="skeleton skeleton-circle w-12 h-12 mb-3"></div>
            <div class="skeleton skeleton-text w-32 h-5 mb-2"></div>
            <div class="skeleton skeleton-text w-full h-3"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Skeleton genérico -->
    <div v-else class="p-8">
      <div class="skeleton skeleton-title w-64 h-8 mb-6"></div>
      <div class="space-y-4">
        <div v-for="n in 5" :key="n" class="skeleton skeleton-text w-full h-4"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SkeletonLoader',
  props: {
    type: {
      type: String,
      default: 'default',
      validator: (value) => ['dashboard', 'stations', 'tariffs', 'reports', 'support', 'default'].includes(value)
    }
  }
}
</script>

<style scoped>
.skeleton-container {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s ease-in-out infinite;
  border-radius: 4px;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.skeleton-title {
  height: 2rem;
  margin-bottom: 1rem;
}

.skeleton-text {
  height: 1rem;
  margin-bottom: 0.5rem;
}

.skeleton-circle {
  border-radius: 50%;
}

.skeleton-card {
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #f0f0f0;
}

.skeleton-charger-card {
  background: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}
</style>
