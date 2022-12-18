import {useIpcRenderer} from '@vueuse/electron'
import {useCatchableIpcRendererInvoke} from '../utils/useCatchableIpcRendererInvoke'
import {Channel} from './Channel'
import {Ref} from 'vue'
import {SelectDirResult} from '../models/SelectDirResult'
import {Task} from '../models/Task'
import {DownloadOptions} from '../models/DownloadOptions'
import {VideoInfo} from '../models/VideoInfo'

const ipcRenderer = useIpcRenderer()

export const api = {
  showAbout(): void {
    ipcRenderer.send(Channel.DIALOG_ABOUT)
  },
  showSelectDirDialog(): Ref<SelectDirResult | null> {
    return ipcRenderer.invoke(Channel.DIALOG_OPEN_DIRECTORY)
  },
  showItemInFolder(fullPath: string): void {
    ipcRenderer.send(Channel.SYSTEM_SHOW_ITEM_IN_FOLDER, fullPath)
  },
  getSystemPath(name: string): Ref<string | null> {
    return ipcRenderer.invoke(Channel.SYSTEM_GET_PATH, name)
  },
  getVideoInfo(downloadOptions: DownloadOptions, handleErrors: (reason: any) => void): Ref<VideoInfo | null> {
    return useCatchableIpcRendererInvoke(Channel.STREAM_INFO, handleErrors, downloadOptions)
  },
  startDownloading(task: Task): void {
    ipcRenderer.send(Channel.DM_START, JSON.parse(JSON.stringify(task)))
  },
  pauseDownloading(taskId: string) {
    ipcRenderer.send(Channel.DM_PAUSE, taskId)
  },
  stopDownloading(taskId: string) {
    ipcRenderer.send(Channel.DM_STOP, taskId)
  },
  changeMaxActiveDownloads(value: number): void {
    ipcRenderer.send(Channel.DM_MAX_ACTIVE_DOWNLOADS, value)
  },
  setAutoDownloadSubtitles(value: boolean): void {
    ipcRenderer.send(Channel.DM_AUTO_DOWNLOAD_SUBTITLES, value)
  },
  onProgress(cb: (progress: { id: string, value: number }) => void): void {
    ipcRenderer.on(Channel.DM_PROGRESS, (event, data) => {
      cb(data)
    })
  },
  onFinished(cb: (data: { id: string, output: string }) => void): void {
    ipcRenderer.on(Channel.DM_FINISHED, (event, data) => {
      cb(data)
    })
  },
}