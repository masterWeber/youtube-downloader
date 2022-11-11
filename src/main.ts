import {createApp} from 'vue'
import {createPinia} from 'pinia'
import {createRouter, createWebHashHistory} from 'vue-router';
import ElementPlus from 'element-plus'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './assets/fonts.css'
import App from './App.vue'
import Main from './layouts/Main.vue';
import Settings from './layouts/Settings.vue';

const routes = [
  {path: '/', component: Main},
  {path: '/settings', component: Settings},
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

const app = createApp(App);
app.use(router)
app.use(createPinia())
app.use(ElementPlus)
    .mount('#app')
    .$nextTick(() => {
      postMessage({payload: 'removeLoading'}, '*')
    })
