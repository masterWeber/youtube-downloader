<template>
  <el-container class="common-layout is-vertical">
    <el-main>
      <el-form :model="mainStore" ref="formRef">
        <ToolBar/>
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
              @click="addTask(mainStore.videoInfo)"
              :disabled="invalidYoutubeUrl"
          >
            Загрузить
          </el-button>
        </el-form-item>
      </el-form>

      <VideoInfoCard :data="mainStore.videoInfo"/>

      <transition name="el-fade-in">
        <el-table :data="tasks" :show-header="false" scrollbar-always-on v-if="tasks.length > 0">
          <el-table-column :min-width="50">
            <template #default="{row: task, column, $index}">
              <ScrollableString :value="task.videoInfo.title"/>
            </template>
          </el-table-column>
          <el-table-column :min-width="20" align="center">
            <template #default="{row: task, column, $index}">
              <transition name="el-fade-in">
                <el-progress
                    v-if="task.id && !task.isStopped() && !task.isDownloaded()"
                    :text-inside="true"
                    :stroke-width="26"
                    :format="format"
                    :percentage="task.progress"
                    :status="task.isPaused() ? 'warning' : ''"
                />
              </transition>
            </template>
          </el-table-column>
          <el-table-column :width="120" align="right">
            <template #default="{row: task, column, $index}">
              <el-button-group v-if="!task.isDownloaded()">
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

const tasks = reactive<Task[]>([]);

function addTask(info: VideoInfo): void {
  const task = Task.create(info)
  tasks.push(task)
}

const ipcRenderer = useIpcRenderer()
ipcRenderer.on('download-process', (event, line) => {
  console.log(line)
})

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