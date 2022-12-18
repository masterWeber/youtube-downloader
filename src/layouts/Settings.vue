<template>
  <el-container class="common-layout is-vertical">
    <el-header>
      <el-space>
        <el-button :icon="Back" circle @click="() => $router.push('/')"/>
        <h1>Настройки</h1>
      </el-space>
    </el-header>
    <el-main>
      <el-form label-width="auto" label-position="left" v-model="settingsStore">
        <el-form-item label="Сохранить в папку">
          <el-input v-model="settingsStore.destination">
            <template #append>
              <el-button :icon="Folder" @click="openSelectDirDialog"/>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item
            label="Макс. количество активных загрузок"
        >
          <el-input-number
              v-model="settingsStore.maxActiveDownloads"
              :min="1"
              :max="10"
          />
        </el-form-item>
        <el-form-item>
          <el-checkbox
              v-model="settingsStore.autoDownloadSubtitles"
              label="Автоматическая загрузка субтитров"
          />
        </el-form-item>
        <el-form-item>
          <el-checkbox
              v-model="settingsStore.autoResumeDownloadOnStartup"
              label="Автоматически возобновлять загрузку при запуске"
          />
        </el-form-item>
      </el-form>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import {Back, Folder} from '@element-plus/icons-vue'
import {ElCheckbox, ElContainer, ElHeader, ElInputNumber, ElMain, ElSpace} from 'element-plus'
import {watch} from 'vue'
import {useSettingsStore} from '../stores/settings'
import {api} from '../api'

const settingsStore = useSettingsStore()

watch(() => settingsStore.maxActiveDownloads, (value) => {
  api.changeMaxActiveDownloads(value)
})

watch(() => settingsStore.autoDownloadSubtitles, (value) => {
  api.setAutoDownloadSubtitles(value)
})

const openSelectDirDialog = () => {
  const result = api.showSelectDirDialog()

  watch(result, (result) => {
    if (result?.canceled === false) {
      settingsStore.destination = result.path ?? ''
    }
  })
}
</script>