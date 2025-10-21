import { ref } from 'vue'
import cookies from 'vue-cookies'

const isLogged = ref(!!cookies.get('evconnect_token'))

function login(){
  isLogged.value = true
}

function logout(){
  isLogged.value = false
  if (cookies && cookies.remove) cookies.remove('evconnect_token')
}

function sync(){
  isLogged.value = !!cookies.get('evconnect_token')
}

export { isLogged, login, logout, sync }
