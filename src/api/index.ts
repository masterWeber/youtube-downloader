import {useIpcRenderer} from '@vueuse/electron';
import {Ref} from 'vue';
import {VideoInfo} from '../models/VideoInfo';
import {DownloadOptions} from '../models/DownloadOptions';
import {SelectDirResult} from '../models/SelectDirResult';
import {useCatchableIpcRendererInvoke} from '../utils/useCatchableIpcRendererInvoke';

const ipcRenderer = useIpcRenderer()

export const api = {
  showAbout(): void {
    ipcRenderer.send('show-about');
  },
  selectDirDialog(): Ref<SelectDirResult | null> {
    return ipcRenderer.invoke<SelectDirResult>('open-directory')
  },
  getPath(name: string): Ref<string | null> {
    return ipcRenderer.invoke<string | null>('get-path', name)
  },
  getVideoInfo(downloadOptions: DownloadOptions, handleErrors: (reason: any) => void): Ref<VideoInfo | null> {
    return useCatchableIpcRendererInvoke<VideoInfo | null>('get-video-info', handleErrors, downloadOptions);
  },
  downloadVideo(options: DownloadOptions): void {
    ipcRenderer.send('download-video', options);
  }
}