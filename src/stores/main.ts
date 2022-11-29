import {defineStore} from 'pinia';
import {VideoOption} from '../models/VideoOption';
import {AudioOption} from '../models/AudioOption';
import {RemovableRef, useLocalStorage} from '@vueuse/core';
import {QualityOption} from '../models/QualityOption';
import {VideoInfo} from '../models/VideoInfo';

interface State {
  url: string
  preferred: {
    video: RemovableRef<VideoOption>
    audio: RemovableRef<AudioOption>
  }
  maxQuality: RemovableRef<QualityOption>
  videoInfo: VideoInfo | null
}

const serializer = {
  read: (v: any) => v ? JSON.parse(v) : null,
  write: (v: any) => JSON.stringify(v),
}

export const useMainStore = defineStore('main', {
  state: (): State => ({
    url: '',
    preferred: {
      video: useLocalStorage('main/preferred/video', VideoOption.BEST, {serializer}),
      audio: useLocalStorage('main/preferred/audio', AudioOption.BEST, {serializer}),
    },
    maxQuality: useLocalStorage('main/maxQuality', QualityOption.MAX, {serializer}),
    videoInfo: null
  }),
  actions: {},
})