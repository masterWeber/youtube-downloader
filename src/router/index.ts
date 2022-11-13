import Main from '../layouts/Main.vue';
import Settings from '../layouts/Settings.vue';
import About from '../layouts/About.vue';
import {createRouter, createWebHashHistory} from 'vue-router';

const routes = [
  {
    name: 'main',
    meta: {
      transition: 'slide-right'
    },
    path: '/',
    component: Main
  },
  {
    name: 'settings',
    meta: {
      transition: 'slide-left'
    },
    path: '/settings',
    component: Settings
  },
  {
    name: 'about',
    meta: {
      transition: 'el-fade-in'
    },
    path: '/about',
    component: About
  },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
})