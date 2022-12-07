import {defineStore} from 'pinia';
import {RemovableRef, useLocalStorage} from '@vueuse/core';

interface State {
  output: RemovableRef<string>,
  maxActiveDownloads: RemovableRef<number>,
  autoDownloadSubtitle: RemovableRef<boolean>,
  autoResumeDownloadOnStartup: RemovableRef<boolean>,
  showAboutOnStartup: RemovableRef<boolean>,
}

export const useSettingsStore = defineStore('settings', {
  state: (): State => ({
    output: useLocalStorage('settings/output', ''),
    maxActiveDownloads: useLocalStorage('settings/maxActiveDownloads', 6),
    autoDownloadSubtitle: useLocalStorage('settings/autoDownloadSubtitle', true),
    autoResumeDownloadOnStartup: useLocalStorage('settings/autoResumeDownloadOnStartup', false),
    showAboutOnStartup: useLocalStorage('settings/showAboutOnStartup', true),
  }),
  actions: {},
})