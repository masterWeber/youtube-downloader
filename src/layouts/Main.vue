<script setup lang="ts">
import {
  ElButton,
  ElButtonGroup,
  ElCol,
  ElContainer,
  ElDescriptions,
  ElDescriptionsItem,
  ElForm,
  ElFormItem,
  ElIcon,
  ElInput,
  ElMain,
  ElOption,
  ElProgress,
  ElRow,
  ElSelect,
  ElTable,
  ElTooltip
} from 'element-plus';
import {reactive, watch} from 'vue'
import {Download, InfoFilled, Setting, SuccessFilled} from '@element-plus/icons-vue';
import {useDark, useToggle} from '@vueuse/core';
import Dark from '../components/icons/Dark.vue';
import Light from '../components/icons/Light.vue';
import PlayArrowFilled from '../components/icons/PlayArrowFilled.vue';
import StopFilled from '../components/icons/StopFilled.vue';
import PauseFilled from '../components/icons/PauseFilled.vue';

const formInline = reactive({
  audio: 'best',
  preferredVideo: 'best',
  quality: 'max',
  url: 'https://www.youtube.com/watch?v=TfNMBlrN3Bg',
})

const isDark = useDark()
const toggleDark = useToggle(isDark)

interface Row {
  title: string;
  progress: number;
  status: DownloadStatus;
}

enum DownloadStatus {
  PAUSE,
  DOWNLOAD,
  DOWNLOADED,
  STOPPED,
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

  const intervalId = setInterval(() => {
    if (row.progress < 100) {
      row.progress += 0.1
    }
  }, 100)

  watch(
      () => row.status,
      value => {
        if (value !== DownloadStatus.DOWNLOAD) clearInterval(intervalId)
      }
  )

  watch(
      () => row.progress,
      value => {
        if (value >= 100) row.status = DownloadStatus.DOWNLOADED
      }
  )
}

const format = (percentage: number): string => `${percentage.toFixed(1)}%`

function pauseDownload(row: Row) {
  row.status = DownloadStatus.PAUSE;
}
</script>

<template>
  <el-container class="common-layout is-vertical">
    <el-main>
      <el-form>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="Видео">
              <el-select v-model="formInline.preferredVideo" :default-first-option="true">
                <el-option label="Лучшее" value="best"/>
                <el-option label="MP4" value="mp4"/>
                <el-option label="WebM" value="webm"/>
                <el-option label="Неважно" value="none"/>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Аудио">
              <el-select v-model="formInline.audio" :default-first-option="true">
                <el-option label="Лучшее" value="best"/>
                <el-option label="MP4" value="mp4"/>
                <el-option label="WebM" value="webm"/>
                <el-option label="Неважно" value="none"/>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Качество">
              <el-select v-model="formInline.quality" :default-first-option="true">
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
                <el-button :icon="isDark ? Dark : Light" circle @click="toggleDark()"/>
              </el-tooltip>
              <el-tooltip
                  content="О программе"
                  :enterable="false"
                  :hide-after="0"
              >
                <el-button :icon="InfoFilled" circle/>
              </el-tooltip>
              <el-tooltip
                  content="Настройки"
                  :enterable="false"
                  :hide-after="0"
              >
                <el-button :icon="Setting" circle @click="() => $router.push('/settings')"/>
              </el-tooltip>
            </el-row>
          </el-col>
        </el-row>
        <el-form-item label="URL для скачивания">
          <el-input v-model="formInline.url"/>
        </el-form-item>
      </el-form>

      <el-row :gutter="5" justify="end">
        <el-button type="primary" :icon="Download" @click="() => tableData.push(tableData[0])">Загрузить</el-button>
      </el-row>

      <el-descriptions
          title="Информация о видео"
          direction="horizontal"
          :column="1"
          border
      >
        <el-descriptions-item label="Название">Как фильмы 2000–2010-х отражали реальность и что ждет наш
          кинематограф
        </el-descriptions-item>
        <el-descriptions-item label="Видео">vp9 - 1080p (443.1мб)</el-descriptions-item>
        <el-descriptions-item label="Аудио">opus - 128кбит/с (44.8мб)</el-descriptions-item>
      </el-descriptions>
      <el-table :data="tableData" :show-header="false" scrollbar-always-on>
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
    </el-main>
  </el-container>
</template>