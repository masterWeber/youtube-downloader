import {createApp} from 'vue'
import {createPinia} from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './assets/fonts.css'
import App from './App.vue'
import {router} from './router';
import 'reflect-metadata';

const app = createApp(App);
app.use(router)
app.use(createPinia())
app.use(ElementPlus)
    .mount('#app')
    .$nextTick(() => {
      postMessage({payload: 'removeLoading'}, '*')
    })
