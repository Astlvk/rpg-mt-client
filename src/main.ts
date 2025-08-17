import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import { registerVMdEditor } from '@/plugins/v-md-editor'

const app = createApp(App)

app.use(createPinia())
app.use(router)
registerVMdEditor(app)

app.mount('#app')
