import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import registerEvents from './events'
import './assets/main.css'

const app = createApp(App)

app.use(createPinia())
registerEvents()
app.use(router)

app.mount('#app')

