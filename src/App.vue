<script setup lang="ts">
import {RouterView} from 'vue-router';</script>

<template>
  <router-view v-slot="{ Component }">
    <component :is="Component"/>
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
</style>
