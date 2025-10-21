import { ref } from 'vue'

export const sidebarOpen = ref(false)

// cuando true, el sidebar está en modo 'icon-only' (colapsado) en pantallas grandes
export const sidebarCollapsed = ref(false)

export function toggleSidebar(){ sidebarOpen.value = !sidebarOpen.value }
export function openSidebar(){ sidebarOpen.value = true }
export function closeSidebar(){ sidebarOpen.value = false }
export function toggleCollapsed(){ sidebarCollapsed.value = !sidebarCollapsed.value }
export function setCollapsed(v){ sidebarCollapsed.value = !!v }
export function openCollapsed(){ sidebarCollapsed.value = true }
export function closeCollapsed(){ sidebarCollapsed.value = false }
