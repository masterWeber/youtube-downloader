<template>
  <el-container class="common-layout is-vertical">
    <el-main>
      <el-form :model="mainStore" ref="formRef">
        <ToolBar />
        <el-form-item
            label="URL для скачивания"
            prop="url"
            :rules="[{
              type: 'string',
              trigger: 'blur',
              pattern: /^(https?:\/\/)?((www\.)?youtube\.com|youtu\.be)\/.+$/,
              message: 'Недопустимый URL',
            }]"
        >
          <el-input v-model="mainStore.url" spellcheck="false">
            <template #suffix>
              <transition name="el-fade-in">
                <el-icon v-if="loadingVideoInfo">
                  <Loading class="video-info-loading-spinner"/>
                </el-icon>
              </transition>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button
              type="primary"
              style="margin-left: auto;"
              :icon="Download"
              @click="() => api.downloadVideo({
              url: mainStore.url,
              preferred: {
                video: mainStore.preferred.video,
                audio: mainStore.preferred.audio,
              },
              maxQuality: mainStore.maxQuality,
              output: settingsStore.downloadDirectory
            })"
              :disabled="invalidYoutubeUrl"
          >
            Загрузить
          </el-button>
        </el-form-item>
      </el-form>

      <VideoInfoCard :data="mainStore.videoInfo"/>

      <el-collapse-transition>
        <el-table :data="tableData" :show-header="false" scrollbar-always-on v-if="tableData.length > 0">
          <el-table-column prop="title" :min-width="60"/>
          <el-table-column :min-width="20" align="center">
            <template #default="scope">
              <transition name="el-fade-in">
                <el-progress
                    v-show="scope.row.status !== DownloadStatus.STOPPED && scope.row.status !== DownloadStatus.DOWNLOADED"
                    :text-inside="true"
                    :stroke-width="26"
                    :format="format"
                    :percentage="scope.row.progress"
                    :status="scope.row.status === DownloadStatus.PAUSE ? 'warning' : ''"
                />
              </transition>
            </template>
          </el-table-column>
          <el-table-column :min-width="20" align="right">
            <template #default="scope">
              <el-button-group v-if="scope.row.status !== DownloadStatus.DOWNLOADED">
                <el-button
                    :icon="scope.row.status !== DownloadStatus.DOWNLOAD ? PlayArrowFilled : PauseFilled"
                    @click="() => {
                    if (scope.row.status !== DownloadStatus.DOWNLOAD) {
                      startDownload(scope.row)
                    } else {
                      pauseDownload(scope.row)
                    }
                  }"
                    plain round :circle="scope.row.status === DownloadStatus.STOPPED"
                >
                </el-button>
                <el-button
                    v-if="scope.row.status !== DownloadStatus.STOPPED"
                    type="danger"
                    :icon="StopFilled"
                    @click="stop(scope.row)"
                    plain round/>
              </el-button-group>
              <el-icon
                  v-else
                  :size="24"
                  color="var(--el-color-success)"
              >
                <SuccessFilled/>
              </el-icon>
            </template>
          </el-table-column>
        </el-table>
      </el-collapse-transition>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import {
  ElButton,
  ElButtonGroup,
  ElCol,
  ElCollapseTransition,
  ElContainer,
  ElForm,
  ElFormItem,
  ElIcon,
  ElInput,
  ElMain,
  ElMessage,
  ElOption,
  ElProgress,
  ElRow,
  ElSelect,
  ElTable,
  ElTooltip,
  FormInstance
} from 'element-plus';
import {reactive, ref, watch} from 'vue'
import {Download, InfoFilled, Loading, Setting, SuccessFilled} from '@element-plus/icons-vue';
import {useDark, useDebounceFn, useToggle} from '@vueuse/core';
import Dark from '../components/icons/Dark.vue';
import Light from '../components/icons/Light.vue';
import PlayArrowFilled from '../components/icons/PlayArrowFilled.vue';
import StopFilled from '../components/icons/StopFilled.vue';
import PauseFilled from '../components/icons/PauseFilled.vue';
import {api} from '../api';
import {useIpcRenderer} from '@vueuse/electron';
import {useSettingsStore} from '../stores/settings';
import {DownloadStatus} from '../models/DownloadStatus';
import VideoInfoCard from '../components/VideoInfoCard.vue';
import {useMainStore} from '../stores/main';
import {VideoOption} from '../models/VideoOption';
import {AudioOption} from '../models/AudioOption';
import {QualityOption} from '../models/QualityOption';
import ToolBar from '../components/ToolBar.vue';

const mainStore = useMainStore();

const formRef = ref<FormInstance>()

const loadingVideoInfo = ref<boolean>(false)
const invalidYoutubeUrl = ref<boolean>(true)

const urlInputHandler = async (url: string) => {
  if (!formRef.value) return
  const formEl = formRef.value;

  try {
    invalidYoutubeUrl.value = true
    await formEl.validate()
  } catch (exception) {
    return
  }

  if (url.trim().length === 0) return

  mainStore.videoInfo = null
  loadingVideoInfo.value = true
  const options = {
    url,
    preferred: {
      video: mainStore.preferred.video,
      audio: mainStore.preferred.audio,
    },
    maxQuality: mainStore.maxQuality,
  }

  const result = api.getVideoInfo(options,
      (reason: any): void => {
        loadingVideoInfo.value = false
        invalidYoutubeUrl.value = true

        console.log(reason.message)

        ElMessage({
          message: 'Не удалось найти видео, проверьте URL.',
          type: 'error',
        })
      })
  watch(result, (result) => {
    if (null !== result) {
      invalidYoutubeUrl.value = false
      loadingVideoInfo.value = false
      mainStore.videoInfo = result;
    }
  })
}

watch(() => mainStore.url, useDebounceFn(urlInputHandler, 500))

watch(() => [mainStore.preferred, mainStore.maxQuality], () => {
  if (mainStore.videoInfo !== null)
    urlInputHandler(mainStore.url)
}, {deep: true})

const settingsStore = useSettingsStore()

interface Row {
  title: string;
  progress: number;
  status: DownloadStatus;
}

const tableData = reactive<Row[]>([
  {
    title: 'Как фильмы 2000–2010-х отражали реальность и что ждет наш кинематограф',
    progress: 26,
    status: DownloadStatus.PAUSE,
  },
  {
    title: 'Как фильмы 2000–2010-х отражали реальность и что ждет наш кинематограф',
    progress: 99,
    status: DownloadStatus.PAUSE,
  },
]);

function stop(row: Row) {
  row.status = DownloadStatus.STOPPED;
  row.progress = 0
}

function startDownload(row: Row) {
  row.status = DownloadStatus.DOWNLOAD;

  watch(
      () => row.progress,
      value => {
        if (value >= 100) row.status = DownloadStatus.DOWNLOADED
      }
  )
}

const ipcRenderer = useIpcRenderer()
ipcRenderer.on('download-process', (event, line) => {
  console.log(line)
})

const format = (percentage: number): string => `${percentage.toFixed(1)}%`

function pauseDownload(row: Row): void {
  row.status = DownloadStatus.PAUSE;
}
</script>

<style scoped>
.video-info-loading-spinner {
  color: var(--el-color-primary);
  animation-name: rotating;
  animation-duration: 1s;
  animation-iteration-count: infinite;
}
</style>