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
import {VideoInfo} from '../models/VideoInfo';
import {DownloadStatus} from '../models/DownloadStatus';
import VideoInfoCard from '../components/VideoInfoCard.vue';

const formRef = ref<FormInstance>()

const form = reactive({
  preferredAudio: 'best',
  preferredVideo: 'best',
  preferredQuality: 'max',
  url: '',
})

const videoInfo = ref<VideoInfo | null>(null)
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

  videoInfo.value = null
  loadingVideoInfo.value = true
  const result = api.getVideoInfo(url, (reason: any): void => {
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
      videoInfo.value = result;
    }
  })
}

watch(() => form.url, useDebounceFn(urlInputHandler, 500))

const isDark = useDark()
const toggleDark = useToggle(isDark)
const showAbout = () => api.showAbout()
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

<template>
  <el-container class="common-layout is-vertical">
    <el-main>
      <el-form :model="form" ref="formRef">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="Видео">
              <el-select v-model="form.preferredVideo" :default-first-option="true">
                <el-option label="Лучшее" value="best"/>
                <el-option label="MP4" value="mp4"/>
                <el-option label="WebM" value="webm"/>
                <el-option label="Неважно" value="none"/>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Аудио">
              <el-select v-model="form.preferredAudio" :default-first-option="true">
                <el-option label="Лучшее" value="best"/>
                <el-option label="MP4" value="mp4"/>
                <el-option label="WebM" value="webm"/>
                <el-option label="Неважно" value="none"/>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Качество">
              <el-select v-model="form.preferredQuality" :default-first-option="true">
                <el-option label="Макс." value="max"/>
                <el-option label="4320p" value="4320p"/>
                <el-option label="3072p" value="3072p"/>
                <el-option label="2160p" value="2160p"/>
                <el-option label="1440p" value="1440p"/>
                <el-option label="1080p" value="1080p"/>
                <el-option label="720p" value="720p"/>
                <el-option label="480p" value="480p"/>
                <el-option label="360p" value="360p"/>
                <el-option label="240p" value="240p"/>
                <el-option label="144p" value="144p"/>
                <el-option label="Неважно" value="none"/>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-row :gutter="5" justify="end">
              <el-tooltip
                  :content="`Включить ${isDark  ? 'светлую' : 'темную' } тему`"
                  :enterable="false"
                  :hide-after="0"
              >
                <el-button
                    :icon="isDark ? Dark : Light"
                    circle
                    @click="toggleDark()"
                />
              </el-tooltip>
              <el-tooltip
                  content="О программе"
                  :enterable="false"
                  :hide-after="0"
              >
                <el-button
                    :icon="InfoFilled"
                    circle
                    @click="showAbout"
                />
              </el-tooltip>
              <el-tooltip
                  content="Настройки"
                  :enterable="false"
                  :hide-after="0"
              >
                <el-button
                    :icon="Setting"
                    circle
                    @click="() => $router.push({name: 'settings'})"
                />
              </el-tooltip>
            </el-row>
          </el-col>
        </el-row>
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
          <el-input v-model="form.url" spellcheck="false">
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
              url: form.url,
              downloadDirectory: settingsStore.downloadDirectory
            })"
              :disabled="invalidYoutubeUrl"
          >
            Загрузить
          </el-button>
        </el-form-item>
      </el-form>

      <VideoInfoCard :data="videoInfo"/>

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
                    plain round
                >
                </el-button>
                <el-button
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

<style scoped>
.video-info-loading-spinner {
  color: var(--el-color-primary);
  animation-name: rotating;
  animation-duration: 1s;
  animation-iteration-count: infinite;
}
</style>