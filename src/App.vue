<script setup lang="ts">
import {RouterView} from 'vue-router';
import {useDark} from '@vueuse/core';
import {useSettingsStore} from './stores/settings';
import {onMounted, watch} from 'vue';
import {api} from './api';

const isDark = useDark()
const settingsStore = useSettingsStore()

onMounted(() => {
  if (settingsStore.showAboutOnStartup) {
    api.showAbout()
  }
})

const setDefaultDownloadDirectory = () => {
  const result = api.getPath('downloads')
  watch(result, (path) => {
    if (path) {
      settingsStore.output = path ?? ''
    }
  })
}

if (settingsStore.output === '') {
  setDefaultDownloadDirectory()
}
</script>

<template>
  <router-view v-slot="{ Component, route }">
    <transition :name="route.meta.transition || 'el-fade-in'" mode="out-in">
      <component :is="Component"/>
    </transition>
  </router-view>
</template>

<style>

html {
  height: 100%;
  display: flex;
}

body {
  margin: 0;
  font-family: 'Open Sans', sans-serif;
  user-select: none;
  width: 100%;
}

#app {
  height: 100%;
  overflow: hidden;
}

.common-layout {
  height: 100%;
  overflow: hidden;
}

.el-container.is-vertical {
  flex-direction: column;
}

.el-main {
  display: flex !important;
  flex-direction: column;
  overflow: hidden !important;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.25s ease-out;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.25s ease-out;
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
