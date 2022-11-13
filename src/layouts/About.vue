<script setup lang="ts">
import {useSettingsStore} from '../stores/settings';
import {ElCheckbox, ElContainer, ElFooter, ElForm, ElFormItem, ElHeader, ElLink, ElMain, ElRow} from 'element-plus';

const settingsStore = useSettingsStore()
</script>

<template>
  <el-container class="common-layout is-vertical">
    <el-header>
      <el-row justify="center">
        <h1>YouTube Downloader v0.2.0</h1>
      </el-row>
    </el-header>
    <el-main style="text-align: center">
      <p>Загружает самые качественные аудио и видео с YouTube</p>
      <p>
        Лицензия: MIT (Free & Open Source)<br>
        Автор: Master Weber<br>
        Сайт:
        <el-link
            type="primary"
            target="_blank"
            href="https://github.com/masterWeber"
        >
          https://github.com/masterWeber
        </el-link>
      </p>
    </el-main>
    <el-footer>
      <el-form v-model="settingsStore">
        <el-form-item>
          <el-checkbox
              v-model="settingsStore.showAboutOnStartup"
              label="Показывать это окно при запуске"
          />
        </el-form-item>
      </el-form>
    </el-footer>
  </el-container>
</template>
