import {useIpcRenderer} from '@vueuse/electron';
import {Ref} from 'vue';

const ipcRenderer = useIpcRenderer()

interface SelectDirResult {
  canceled: boolean,
  path: string | null
}

export const api = {
  showAbout(): void {
    ipcRenderer.send('show-about');
  },
  selectDirDialog(): Ref<SelectDirResult | null> {
    return ipcRenderer.invoke<SelectDirResult>('open-directory')
  },
  getPath(name: string): Ref<string | null> {
    return ipcRenderer.invoke<string | null>('get-path', name)
  }
}