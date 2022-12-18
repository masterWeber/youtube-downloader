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
            <template #append>
              <transition name="el-fade-in">
                <el-icon
                    v-if="loadingVideoInfo"
                    style="position: absolute"
                >
                  <Loading class="video-info-loading-spinner"/>
                </el-icon>
                <el-icon
                    v-else
                    style="cursor: pointer; position: absolute"
                    @click="urlInputHandler(mainStore.url)"
                >
                  <Search/>
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

      <VideoInfoCard
          :data="mainStore.videoInfo"
          @close="mainStore.videoInfo = null"
      />

      <transition name="el-fade-in">
        <el-table
            ref="tableRef"
            :data="Array.from(downloadTasks.values())"
            :show-header="false"
            highlight-current-row
            scrollbar-always-on
            @current-change="handleCurrentChange"
            @cell-click="handleCellClick"
            v-if="downloadTasks.size > 0"
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
                    v-if="task.id && !task.isStopped()"
                    :stroke-width="8"
                    :format="task.isWaitProgress() ? () => format(task.progress) : format"
                    :percentage="task.isWaitProgress() ? 25 : task.progress"
                    :duration="1"
                    :indeterminate="task.isWaitProgress()"
                    :color="task.isDownload() || task.isDownloaded() || task.isFinished() ? colors : '#909399'"
                />
              </transition>
            </template>
          </el-table-column>
          <el-table-column :width="130" align="right">
            <template #default="{row: task}">
              <el-button-group v-if="task.id && !task.isFinished()">
                <el-button
                    :icon="task.isStarted() ? PauseFilled : PlayArrowFilled"
                    @click="() => {
                      if (task.isStarted()) {
                        task.pause()
                      } else {
                        task.start()
                      }
                    }"
                    plain
                    round
                    :circle="task.isStopped()"
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
                  <div>
                    <el-tooltip
                        content="Открыть папку назначения"
                        :enterable="false"
                        :hide-after="0"
                    >
                      <el-button
                          @click="openDestination(task)"
                          :icon="Folder"
                          circle plain
                      />
                    </el-tooltip>
                  </div>
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
  ElMessageBox,
  ElProgress,
  ElTable,
  FormInstance,
} from 'element-plus'
import {markRaw, ref, watch} from 'vue'
import {DocumentDelete, Download, Folder, Loading, Search} from '@element-plus/icons-vue'
import {useDebounceFn} from '@vueuse/core'
import PlayArrowFilled from '../components/icons/PlayArrowFilled.vue'
import PauseFilled from '../components/icons/PauseFilled.vue'
import {api} from '../api'
import VideoInfoCard from '../components/VideoInfoCard.vue'
import {useMainStore} from '../stores/main'
import ToolBar from '../components/ToolBar.vue'
import {Task} from '../models/Task'
import {VideoInfo} from '../models/VideoInfo'
import StopFilled from '../components/icons/StopFilled.vue'
import ScrollableString from '../components/ScrollableString.vue'
import {useSettingsStore} from '../stores/settings'
import {DownloadStatus} from '../models/DownloadStatus'

const mainStore = useMainStore()
const settingsStore = useSettingsStore()

const formRef = ref<FormInstance>()
const tableRef = ref<InstanceType<typeof ElTable>>()

const loadingVideoInfo = ref<boolean>(false)
const invalidYoutubeUrl = ref<boolean>(!mainStore.videoInfo)

const selectedTask = ref<Task | null>(null)

const selectTask = (task: Task | null) => {
  selectedTask.value = task
}

const showVideoInfo = (task: Task | null) => {
  if (task) {
    mainStore.videoInfo = task.videoInfo
  }
}

const handleCurrentChange = (task: Task | null) => {
  selectTask(task)
}

const handleCellClick = (task: Task | null, cell: any) => {
  if (cell.getColumnIndex() === 0) {
    selectTask(task)
    showVideoInfo(task)
  }
}

const openDestination = (task: Task) => {
  api.showItemInFolder(task.output as string)
}

document.addEventListener('keyup', (event) => {
  const task = selectedTask.value
  if (event.key === 'Delete' && task) {
    showDeleteDialog(task as Task)
  }
})

const showDeleteDialog = (task: Task): void => {
  const taskStatus = task.status

  if (task.isStarted()) {
    task.pause()
  }

  ElMessageBox.confirm(
      `Вы действительно хотите удалить "${getTaskTitle(task)}" ?`,
      {
        confirmButtonText: 'Удалить',
        confirmButtonClass: 'el-button--danger',
        cancelButtonText: 'Отменить',
        type: 'warning',
        icon: markRaw(DocumentDelete),
      },
  ).then(() => {
    if (!task.isStopped() && !task.isFinished()) {
      task.stop()
    }
    downloadTasks.delete(task.id)

    tableRef.value?.setCurrentRow(null)
    selectedTask.value = null
  }).catch((reason) => {
    console.warn(reason)
    if (taskStatus === DownloadStatus.DOWNLOAD) {
      task.start()
    }
  })
}

const colors = [
  {color: '#1989fa', percentage: 50},
  {color: '#6f7ad3', percentage: 70},
  {color: '#5cb87a', percentage: 90},
]

const urlInputHandler = async (url: string) => {
  if (!formRef.value) return
  const formEl = formRef.value

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

        ElMessage.error({
          message: 'Не удалось найти видео, проверьте URL.',
          grouping: true,
        })
      })
  watch(result, (result) => {
    if (null !== result) {
      invalidYoutubeUrl.value = false
      loadingVideoInfo.value = false
      mainStore.videoInfo = result
    }
  })
}

watch(() => mainStore.url, useDebounceFn(urlInputHandler, 500))

watch(() => [mainStore.preferred, mainStore.maxQuality], () => {
  if (mainStore.videoInfo !== null)
    urlInputHandler(mainStore.url)
}, {deep: true})

const downloadTasks = mainStore.downloadTasks

watch(downloadTasks, (downloadTasks) => {
  if (downloadTasks.size === 0 && invalidYoutubeUrl.value) {
    mainStore.videoInfo = null
  }
})

function addTask(info: VideoInfo | null): void {
  if (info === null) return
  const task = Task.create(mainStore.url, info, settingsStore.destination)

  if (downloadTasks.has(task.id)) {
    ElMessage.warning({
      message: 'Уже есть в очереди.',
      grouping: true,
    })
    return
  }

  downloadTasks.set(task.id, task)
  task.start()
}

api.onProgress((progress) => {
  const task = downloadTasks.get(progress.id)
  if (task) {
    task.progress = progress.value
  }
})

api.onFinished((data) => {
  const task = downloadTasks.get(data.id)
  if (task) {
    task.finish(data.output)
  }
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
  animation-name: rotating;
  animation-duration: 1s;
  animation-iteration-count: infinite;
}
</style>