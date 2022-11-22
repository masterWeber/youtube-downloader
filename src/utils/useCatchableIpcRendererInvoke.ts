import {isString} from '@vueuse/shared'
import type {IpcRenderer} from 'electron'
import {Ref, shallowRef} from 'vue';

export function useCatchableIpcRendererInvoke<T>(ipcRenderer: IpcRenderer, channel: string, handleErrors: (reason: any) => void, ...args: any[]): Ref<T | null>

export function useCatchableIpcRendererInvoke<T>(channel: string, handleErrors: (reason: any) => void, ...args: any[]): Ref<T | null>

export function useCatchableIpcRendererInvoke<T>(...args: any[]): Ref<T | null> {
  let ipcRenderer: IpcRenderer | undefined
  let channel: string
  let handleErrors: (reason: any) => void
  let invokeArgs: any[]

  if (isString(args[0])) {
    [channel, handleErrors, ...invokeArgs] = args
    ipcRenderer = window.require ? window.require('electron').ipcRenderer : undefined
  } else {
    [ipcRenderer, handleErrors, channel, ...invokeArgs] = args
  }

  if (!ipcRenderer)
    throw new Error('please provide IpcRenderer module or enable nodeIntegration')

  const result = shallowRef<T | null>(null)

  ipcRenderer.invoke(channel, ...invokeArgs).then((response) => {
    result.value = response
  }).catch(handleErrors)

  return result
}