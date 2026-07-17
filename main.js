import { createApp } from 'vue'
import App from './App.vue'

// Cria a instância da aplicação Vue, usando o componente 'App.vue' como raiz.
const app = createApp(App)

// Monta a aplicação no elemento com o id="app" no seu index.html.
app.mount('#app')