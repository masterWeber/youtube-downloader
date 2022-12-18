import {defineStore} from 'pinia'
import {RemovableRef, useLocalStorage} from '@vueuse/core'
import {api} from '../api'
import {watch} from 'vue'

interface State {
  destination: RemovableRef<string>,
  maxActiveDownloads: RemovableRef<number>,
  autoDownloadSubtitles: RemovableRef<boolean>,
  autoResumeDownloadOnStartup: RemovableRef<boolean>,
  showAboutOnStartup: RemovableRef<boolean>,
}

export const useSettingsStore = defineStore('settings', {
  state: (): State => ({
    destination: useLocalStorage('settings/destination', ''),
    maxActiveDownloads: useLocalStorage('settings/maxActiveDownloads', 10),
    autoDownloadSubtitles: useLocalStorage('settings/autoDownloadSubtitle', true),
    autoResumeDownloadOnStartup: useLocalStorage('settings/autoResumeDownloadOnStartup', false),
    showAboutOnStartup: useLocalStorage('settings/showAboutOnStartup', true),
  }),
  actions: {
    reset() {
      this.setDefaultDownloadDirectory()
      this.maxActiveDownloads = 10
      this.autoDownloadSubtitles = true
      this.autoResumeDownloadOnStartup = false
      this.showAboutOnStartup = true
    },
    setDefaultDownloadDirectory() {
      const result = api.getSystemPath('downloads')
      watch(result, (path) => {
        if (path) {
          this.destination = path ?? ''
        }
      })
    },
  },
})