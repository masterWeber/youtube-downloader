<template>
  <el-row :gutter="20">
    <el-col :span="6">
      <el-form-item label="Видео">
        <el-select
            v-model="mainStore.preferred.video"
            :default-first-option="true"
        >
          <el-option
              v-for="item in preferredVideoOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          />
        </el-select>
      </el-form-item>
    </el-col>
    <el-col :span="6">
      <el-form-item label="Аудио">
        <el-select
            v-model="mainStore.preferred.audio"
            :default-first-option="true">
          <el-option
              v-for="item in preferredAudioOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          />
        </el-select>
      </el-form-item>
    </el-col>
    <el-col :span="6">
      <el-form-item label="Качество">
        <el-select
            v-model="mainStore.maxQuality"
            :default-first-option="true"
        >
          <el-option
              v-for="item in preferredQualityOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          />
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
</template>

<script setup lang="ts">
import {ElRow} from 'element-plus';
import {useMainStore} from '../stores/main';
import {VideoOption} from '../models/VideoOption';
import {AudioOption} from '../models/AudioOption';
import {QualityOption} from '../models/QualityOption';
import {useDark, useToggle} from '@vueuse/core';
import Dark from './icons/Dark.vue';
import Light from './icons/Light.vue';
import {InfoFilled, Setting} from '@element-plus/icons-vue';
import {api} from '../api';

const isDark = useDark()
const toggleDark = useToggle(isDark)
const mainStore = useMainStore();

const preferredVideoOptions = [
  {
    label: 'Лучшее',
    value: VideoOption.BEST,
  },
  {
    label: 'MP4',
    value: VideoOption.MP4,
  },
  {
    label: 'WebM',
    value: VideoOption.WEBM,
  },
];
const preferredAudioOptions = [
  {
    label: 'Лучшее',
    value: AudioOption.BEST,
  },
  {
    label: 'MP4',
    value: AudioOption.MP4,
  },
  {
    label: 'WebM',
    value: AudioOption.WEBM,
  },
];
const preferredQualityOptions = [
  {
    label: 'Макс.',
    value: QualityOption.MAX,
  },
  {
    label: '4320p',
    value: QualityOption['8K'],
  },
  {
    label: '2160p',
    value: QualityOption.UHD,
  },
  {
    label: '1440p',
    value: QualityOption.QHD,
  },
  {
    label: '1080p',
    value: QualityOption.FHD,
  },
  {
    label: '720p',
    value: QualityOption.HD,
  },
  {
    label: '480p',
    value: QualityOption['480P'],
  },
  {
    label: '360p',
    value: QualityOption['360P'],
  },
  {
    label: '240p',
    value: QualityOption['240P'],
  },
  {
    label: '144p',
    value: QualityOption['144P'],
  },
];

const showAbout = () => api.showAbout()
</script>