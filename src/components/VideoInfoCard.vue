<template>
  <div class="video-info-card-container">
    <el-collapse-transition>
      <el-card
          class="video-info-card"
          v-if="videoInfo !== null"
          shadow="never"
      >
        <el-image
            class="video-info-card__thumbnail"
            :src="videoInfo.thumbnail"
            v-loading="imgLoading"
            @load="imgLoading = false"
            @error="imgLoading = false"
            fit="cover"
        >
          <template #placeholder>
            <div class="video-info-card__placeholder">
              <el-icon>
                <PictureFilled/>
              </el-icon>
            </div>
          </template>
          <template #error>
            <div class="video-info-card__placeholder">
              <el-icon>
                <PictureFilled/>
              </el-icon>
            </div>
          </template>
        </el-image>
        <div class="video-info-card__description">
          <el-icon
              class="video-info-card__closeBtn"
              @click="emit('close')"
          >
            <Close/>
          </el-icon>
          <h5 class="video-info-card__title">{{ videoTitle }}</h5>
          <p class="video-info-card__item" v-if="videoStreamInfo">Видео: {{ videoStreamInfo }}</p>
          <p class="video-info-card__item" v-if="audioStreamInfo">Аудио: {{ audioStreamInfo }}</p>
        </div>
      </el-card>
    </el-collapse-transition>
  </div>
</template>

<script setup lang="ts">
import {ElCard, ElCollapseTransition, ElIcon, ElImage} from 'element-plus'
import {PictureFilled, Close} from '@element-plus/icons-vue'
import {VideoInfo} from '../models/VideoInfo'
import {bit2mb} from '../utils/bit2mb'
import {computed, ref, watch} from 'vue'

const props = defineProps<{
  data: VideoInfo | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const videoInfo = computed<VideoInfo | null>(() => props.data)

const imgLoading = ref<boolean>(true)
watch(() => props.data, (value) => {
  if (value === null) {
    imgLoading.value = true
  }
})

const videoTitle = computed(() => videoInfo.value?.title)

const videoStreamInfo = computed<string | null>(() => {
  const video = videoInfo.value?.streamInfo.video
  if (video) {
    return `${video.codec} - ${video.formatNote} (${bit2mb(video.fileSize)} мб)`
  }

  return null
})

const audioStreamInfo = computed<string | null>(() => {
  const audio = videoInfo.value?.streamInfo.audio
  if (audio) {
    return `${audio.codec} - ${Math.round(audio.bitRate)}кбит/с (${bit2mb(audio.fileSize)} мб)`
  }

  return null
})
</script>

<style scoped>
* {
  --min-height: 120px;
}

.video-info-card-container {
  position: relative;
  margin-bottom: 18px;
  overflow: hidden;
}

.video-info-card :deep(.el-card__body) {
  display: flex;
  flex-direction: row;
  padding: 0;
  min-height: var(--min-height);
}

.video-info-card__thumbnail {
  width: 200px;
  min-width: 200px;
  height: var(--min-height);
}

.video-info-card__placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  font-size: 30px;
}

.video-info-card__placeholder :deep(.el-icon) {
  font-size: 30px;
}

.video-info-card__closeBtn {
  position: absolute;
  top: 8px;
  right: 8px;
  cursor: pointer;
  color: var(--el-text-color-secondary);
  font-size: var(--el-notification-close-font-size);
}

.video-info-card__closeBtn:hover {
  color: var(--el-text-color-regular);
}

.video-info-card__description {
  height: 100%;
  padding: 5px 10px;
}

.video-info-card__title {
  min-height: 44px;
  margin-top: 0;
  margin-bottom: 5px;
  font-size: var(--el-font-size-medium);
}

.video-info-card__item {
  margin-top: 0;
  margin-bottom: 5px;
  font-size: var(--el-font-size-base);
}

.video-info-card__item:last-child {
  margin-bottom: 0;
}
</style>