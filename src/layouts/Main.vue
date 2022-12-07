<template>
  <el-container class="common-layout is-vertical">
    <el-main>
      <el-form :model="mainStore" ref="formRef">
        <ToolBar :loading="loadingVideoInfo"/>
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
          <el-input v-model.trim="mainStore.url" spellcheck="false">
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
              @click="addTask(mainStore.videoInfo)"
              :disabled="invalidYoutubeUrl"
          >
            Загрузить
          </el-button>
        </el-form-item>
      </el-form>

      <VideoInfoCard :data="mainStore.videoInfo"/>

      <transition name="el-fade-in">
        <el-table
            :data="queue"
            :show-header="false"
            scrollbar-always-on
            v-if="queue.length > 0"
        >
          <el-table-column :min-width="50">
            <template #default="{row: task}">
              <ScrollableString :value="getTaskTitle(task)"/>
            </template>
          </el-table-column>
          <el-table-column :min-width="20" align="center">
            <template #default="{row: task}">
              <transition name="el-fade-in">
                <el-progress
                    v-if="task.id && !task.isStopped() && !task.isDownloaded()"
                    :text-inside="true"
                    :stroke-width="24"
                    :format="format"
                    :percentage="task.progress"
                    :status="task.isPaused() ? 'warning' : ''"
                />
              </transition>
            </template>
          </el-table-column>
          <el-table-column :width="130" align="right">
            <template #default="{row: task}">
              <el-button-group v-if="task.id && !task.isDownloaded()">
                <el-button
                    :icon="task.isDownload() ? PauseFilled : PlayArrowFilled"
                    @click="() => {
                    if (task.isDownload()) {
                      task.pause()
                    } else {
                      task.start()
                    }
                  }"
                    plain round :circle="task.isStopped()"
                >
                </el-button>
                <el-button
                    v-if="!task.isStopped()"
                    type="danger"
                    :icon="StopFilled"
                    @click="task.stop()"
                    plain round/>
              </el-button-group>
              <el-row v-else justify="end">
                <transition name="el-fade-in" appear>
                  <el-icon
                      :size="24"
                      style="padding: 4px 0"
                      color="var(--el-color-success)"
                  >
                    <SuccessFilled/>
                  </el-icon>
                </transition>
              </el-row>
            </template>
          </el-table-column>
        </el-table>
      </transition>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import {
  ElButton,
  ElButtonGroup,
  ElContainer,
  ElForm,
  ElFormItem,
  ElIcon,
  ElInput,
  ElMain,
  ElMessage,
  ElProgress,
  ElTable,
  FormInstance
} from 'element-plus';
import {reactive, ref, watch} from 'vue'
import {Download, Loading, SuccessFilled} from '@element-plus/icons-vue';
import {useDebounceFn} from '@vueuse/core';
import PlayArrowFilled from '../components/icons/PlayArrowFilled.vue';
import PauseFilled from '../components/icons/PauseFilled.vue';
import {api} from '../api';
import {useIpcRenderer} from '@vueuse/electron';
import VideoInfoCard from '../components/VideoInfoCard.vue';
import {useMainStore} from '../stores/main';
import ToolBar from '../components/ToolBar.vue';
import {Task} from '../models/Task';
import {VideoInfo} from '../models/VideoInfo';
import StopFilled from '../components/icons/StopFilled.vue';
import ScrollableString from '../components/ScrollableString.vue';
import {useSettingsStore} from '../stores/settings';

const mainStore = useMainStore();
const settingsStore = useSettingsStore();

const formRef = ref<FormInstance>()

const loadingVideoInfo = ref<boolean>(false)
const invalidYoutubeUrl = ref<boolean>(true)

const log = (v: any) => {
  console.log(v)
  return true
}

const urlInputHandler = async (url: string) => {
  if (!formRef.value) return
  const formEl = formRef.value;

  try {
    invalidYoutubeUrl.value = true
    await formEl.validate()
  } catch (exception) {
    return
  }

  if (url.length === 0) return

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

        ElMessage.error({
          message: 'Не удалось найти видео, проверьте URL.',
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

const queue = reactive<Task[]>([]);

function addTask(info: VideoInfo): void {
  const task = Task.create(mainStore.url, info, settingsStore.output)

  for (const existTask of queue) {
    if (existTask.id === task.id) {
      ElMessage.warning({
        message: 'Уже есть в очереди.',
      })
      return;
    }
  }

  queue.push(task)
  api.startDownloading(task)
}

const ipcRenderer = useIpcRenderer()
ipcRenderer.on('download-process', (event, progress) => {
  queue.forEach((task) => {
    if (task.id === progress.id) {
      task.progress = progress.progress
    }
  })
})

const getTaskTitle = (task: Task): string => {
  let title = task.videoInfo.title

  if (task.videoInfo.streamInfo.video) {
    title += ` [${task.videoInfo.streamInfo.video.formatNote}]`
  }

  title += ` [${task.streamId}]`

  return title
}

const format = (percentage: number): string => `${percentage.toFixed(1)}%`
</script>

<style scoped>
.video-info-loading-spinner {
  color: var(--el-color-primary);
  animation-name: rotating;
  animation-duration: 1s;
  animation-iteration-count: infinite;
}
</style>