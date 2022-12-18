import {defineStore} from 'pinia'
import {VideoOption} from '../models/VideoOption'
import {AudioOption} from '../models/AudioOption'
import {RemovableRef, useLocalStorage} from '@vueuse/core'
import {QualityOption} from '../models/QualityOption'
import {VideoInfo} from '../models/VideoInfo'
import {Task} from '../models/Task'
import {TaskData} from '../models/TaskData'

interface State {
  url: string
  preferred: {
    video: RemovableRef<VideoOption>
    audio: RemovableRef<AudioOption>
  }
  maxQuality: RemovableRef<QualityOption>
  videoInfo: VideoInfo | null
  downloadTasks: RemovableRef<Map<string, Task>>
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
    videoInfo: null,
    downloadTasks: useLocalStorage('main/downloadTasks', new Map<string, Task>(), {
      serializer: {
        read: (raw: string): Map<string, Task> => {
          const tasks = new Map<string, Task>()
          JSON.parse(raw).forEach((data: TaskData) => {
            const task = new Task(
                data.id,
                data.streamId,
                data.url,
                data.videoInfo,
                data.destination,
                data.progress,
                data.status,
                data.output,
            )

            tasks.set(task.id, task)
          })

          return tasks
        },
        write: (value: Map<string, Task>): string => {
          return JSON.stringify(
              Array.from(value.values()).map((task): TaskData => {
                return {
                  id: task.id,
                  streamId: task.streamId,
                  url: task.url,
                  destination: task.destination,
                  output: task.output,
                  videoInfo: task.videoInfo,
                  progress: task.progress,
                  status: task.status,
                }
              }),
          )
        },
      },
    }),
  }),
  actions: {},
})