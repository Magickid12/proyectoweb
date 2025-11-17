<template>
  <div class="p-8 h-screen flex flex-col">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-3xl font-bold">Soporte Técnico</h2>
        <p class="text-gray-600 mt-1">Centro de ayuda y asistencia técnica de la plataforma</p>
      </div>
      <div class="flex items-center gap-3">
        <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
          ✓ Sistema Operativo
        </span>
      </div>
    </div>

    <!-- Chat Container -->
    <div class="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
      <!-- Sidebar - Lista de Conversaciones -->
      <div class="lg:col-span-1 bg-white rounded-xl shadow border border-gray-100 overflow-hidden flex flex-col">
        <div class="p-4 border-b border-gray-200 bg-gray-50">
          <h3 class="font-semibold text-gray-900">Conversaciones</h3>
          <div class="mt-3 relative">
            <input 
              type="text" 
              v-model="searchQuery"
              placeholder="Buscar conversaciones..."
              class="w-full px-3 py-2 pl-9 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <svg class="absolute left-3 top-2.5 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <div class="flex-1 overflow-y-auto">
          <div 
            v-for="conversation in filteredConversations" 
            :key="conversation.id"
            @click="selectConversation(conversation)"
            :class="[
              'p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors',
              selectedConversation?.id === conversation.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''
            ]"
          >
            <div class="flex items-start gap-3">
              <div 
                class="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
                :style="{ backgroundColor: conversation.color }"
              >
                {{ conversation.initials }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-1">
                  <h4 class="font-semibold text-sm text-gray-900 truncate">{{ conversation.name }}</h4>
                  <span class="text-xs text-gray-500">{{ conversation.time }}</span>
                </div>
                <p class="text-xs text-gray-600 truncate">{{ conversation.lastMessage }}</p>
                <div class="flex items-center gap-2 mt-1">
                  <span 
                    class="text-xs px-2 py-0.5 rounded-full"
                    :class="{
                      'bg-red-100 text-red-800': conversation.priority === 'alta',
                      'bg-yellow-100 text-yellow-800': conversation.priority === 'media',
                      'bg-green-100 text-green-800': conversation.priority === 'baja'
                    }"
                  >
                    {{ conversation.priority }}
                  </span>
                  <span v-if="conversation.unread" class="text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                    {{ conversation.unread }} nuevos
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Main Chat Area -->
      <div class="lg:col-span-2 bg-white rounded-xl shadow border border-gray-100 overflow-hidden flex flex-col">
        <div v-if="!selectedConversation" class="flex-1 flex items-center justify-center text-gray-400">
          <div class="text-center">
            <svg class="mx-auto h-16 w-16 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p class="text-lg font-medium">Selecciona una conversación</p>
            <p class="text-sm mt-2">Elige una conversación de la lista para comenzar</p>
          </div>
        </div>
        
        <template v-else>
          <!-- Chat Header -->
          <div class="p-4 border-b border-gray-200 bg-gray-50">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div 
                  class="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                  :style="{ backgroundColor: selectedConversation.color }"
                >
                  {{ selectedConversation.initials }}
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900">{{ selectedConversation.name }}</h3>
                  <p class="text-xs text-gray-600">{{ selectedConversation.email }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button class="p-2 hover:bg-gray-200 rounded-lg transition-colors" title="Videollamada">
                  <svg class="h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                <button class="p-2 hover:bg-gray-200 rounded-lg transition-colors" title="Más opciones">
                  <svg class="h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <!-- Messages -->
          <div class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            <div 
              v-for="message in selectedConversation.messages" 
              :key="message.id"
              :class="[
                'flex',
                message.sender === 'support' ? 'justify-end' : 'justify-start'
              ]"
            >
              <div 
                :class="[
                  'max-w-[70%] rounded-lg p-3 shadow-sm',
                  message.sender === 'support' 
                    ? 'bg-primary text-white' 
                    : 'bg-white text-gray-900 border border-gray-200'
                ]"
              >
                <p class="text-sm">{{ message.text }}</p>
                <span 
                  :class="[
                    'text-xs mt-1 block',
                    message.sender === 'support' ? 'text-primary-light' : 'text-gray-500'
                  ]"
                >
                  {{ message.time }}
                </span>
              </div>
            </div>
          </div>
          
          <!-- Message Input -->
          <div class="p-4 border-t border-gray-200 bg-white">
            <div class="flex items-end gap-3">
              <button class="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Adjuntar archivo">
                <svg class="h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>
              
              <div class="flex-1 relative">
                <textarea 
                  v-model="newMessage"
                  @keydown.enter.prevent="sendMessage"
                  placeholder="Escribe tu mensaje..."
                  rows="1"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                ></textarea>
              </div>
              
              <button 
                @click="sendMessage"
                class="p-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                title="Enviar"
              >
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            
            <!-- Quick Actions -->
            <div class="flex gap-2 mt-3">
              <button 
                v-for="action in quickActions" 
                :key="action.text"
                @click="insertQuickAction(action.text)"
                class="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
              >
                {{ action.text }}
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  setup() {
    const searchQuery = ref('');
    const selectedConversation = ref(null);
    const newMessage = ref('');
    
    const quickActions = [
      { text: '¿Cómo puedo ayudarte?' },
      { text: 'Estoy revisando tu caso...' },
      { text: 'Gracias por tu paciencia' },
      { text: 'Problema resuelto ✓' }
    ];
    
    const conversations = ref([
      {
        id: 1,
        name: 'Juan Pérez',
        email: 'juan.perez@example.com',
        initials: 'JP',
        color: '#37A686',
        lastMessage: 'El cargador #5 no funciona correctamente',
        time: '10:30',
        priority: 'alta',
        unread: 2,
        messages: [
          { id: 1, sender: 'user', text: 'Hola, tengo un problema con el cargador #5', time: '10:25' },
          { id: 2, sender: 'support', text: 'Hola Juan, ¿podrías darme más detalles sobre el problema?', time: '10:26' },
          { id: 3, sender: 'user', text: 'No inicia la sesión de carga cuando conecto mi vehículo', time: '10:28' },
          { id: 4, sender: 'support', text: 'Entendido, voy a revisar el estado del cargador ahora mismo.', time: '10:29' },
          { id: 5, sender: 'user', text: 'El cargador #5 no funciona correctamente', time: '10:30' }
        ]
      },
      {
        id: 2,
        name: 'María González',
        email: 'maria.gonzalez@example.com',
        initials: 'MG',
        color: '#52F2B8',
        lastMessage: '¿Pueden cambiar mi tarifa?',
        time: '09:15',
        priority: 'media',
        unread: 0,
        messages: [
          { id: 1, sender: 'user', text: 'Buenos días, quisiera cambiar mi plan de tarifas', time: '09:10' },
          { id: 2, sender: 'support', text: 'Buenos días María, claro que sí. ¿A qué plan te gustaría cambiar?', time: '09:12' },
          { id: 3, sender: 'user', text: '¿Pueden cambiar mi tarifa?', time: '09:15' }
        ]
      },
      {
        id: 3,
        name: 'Carlos Rodríguez',
        email: 'carlos.rodriguez@example.com',
        initials: 'CR',
        color: '#2C403A',
        lastMessage: 'Gracias por la ayuda',
        time: 'Ayer',
        priority: 'baja',
        unread: 0,
        messages: [
          { id: 1, sender: 'user', text: 'Hola, no puedo acceder a mi historial de cargas', time: 'Ayer 16:20' },
          { id: 2, sender: 'support', text: 'Hola Carlos, voy a revisar tu cuenta. Un momento por favor.', time: 'Ayer 16:22' },
          { id: 3, sender: 'support', text: 'Ya solucioné el problema. Deberías poder ver tu historial ahora.', time: 'Ayer 16:25' },
          { id: 4, sender: 'user', text: 'Gracias por la ayuda', time: 'Ayer 16:26' }
        ]
      },
      {
        id: 4,
        name: 'Ana Martínez',
        email: 'ana.martinez@example.com',
        initials: 'AM',
        color: '#F59E0B',
        lastMessage: 'Error en la facturación',
        time: 'Ayer',
        priority: 'alta',
        unread: 1,
        messages: [
          { id: 1, sender: 'user', text: 'Hola, hay un error en mi última factura', time: 'Ayer 14:30' },
          { id: 2, sender: 'support', text: 'Hola Ana, ¿me puedes dar tu número de factura?', time: 'Ayer 14:32' },
          { id: 3, sender: 'user', text: 'Error en la facturación', time: 'Ayer 14:35' }
        ]
      },
      {
        id: 5,
        name: 'Luis Hernández',
        email: 'luis.hernandez@example.com',
        initials: 'LH',
        color: '#8B5CF6',
        lastMessage: 'Perfecto, muchas gracias',
        time: '2 días',
        priority: 'baja',
        unread: 0,
        messages: [
          { id: 1, sender: 'user', text: '¿Cómo puedo agregar una nueva tarjeta de pago?', time: 'Hace 2 días 11:00' },
          { id: 2, sender: 'support', text: 'Puedes agregarla desde el menú de Configuración > Métodos de pago', time: 'Hace 2 días 11:05' },
          { id: 3, sender: 'user', text: 'Perfecto, muchas gracias', time: 'Hace 2 días 11:10' }
        ]
      }
    ]);
    
    const filteredConversations = computed(() => {
      if (!searchQuery.value) return conversations.value;
      
      const query = searchQuery.value.toLowerCase();
      return conversations.value.filter(conv => 
        conv.name.toLowerCase().includes(query) ||
        conv.lastMessage.toLowerCase().includes(query) ||
        conv.email.toLowerCase().includes(query)
      );
    });
    
    const selectConversation = (conversation) => {
      selectedConversation.value = conversation;
      // Marcar como leídos
      conversation.unread = 0;
    };
    
    const sendMessage = () => {
      if (!newMessage.value.trim() || !selectedConversation.value) return;
      
      const message = {
        id: selectedConversation.value.messages.length + 1,
        sender: 'support',
        text: newMessage.value.trim(),
        time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
      };
      
      selectedConversation.value.messages.push(message);
      selectedConversation.value.lastMessage = newMessage.value.trim();
      selectedConversation.value.time = message.time;
      
      newMessage.value = '';
      
      // Scroll to bottom
      setTimeout(() => {
        const chatContainer = document.querySelector('.overflow-y-auto');
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }, 100);
    };
    
    const insertQuickAction = (text) => {
      newMessage.value = text;
    };
    
    return {
      searchQuery,
      conversations,
      filteredConversations,
      selectedConversation,
      newMessage,
      quickActions,
      selectConversation,
      sendMessage,
      insertQuickAction
    };
  }
};
</script>

<style scoped>
.primary-light {
  color: rgba(255, 255, 255, 0.8);
}
</style>
