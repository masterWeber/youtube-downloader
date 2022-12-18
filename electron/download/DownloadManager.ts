import {DownloadQueue} from './DownloadQueue'
import {DownloadTask} from './DownloadTask'
import {DownloadTaskId} from './DownloadTaskId'
import {NotFoundDownloadTaskError} from './NotFoundDownloadTaskError'
import {DownloadStatus} from './DownloadStatus'
import {InvalidArgumentError} from './InvalidArgumentError'

declare type OnChangeStatusCallBack = (status: DownloadStatus, task: DownloadTask) => void
declare type OnProgressCallBack = (progress: number, task: DownloadTask) => void
declare type OnFinishedCallBack = (output: string, task: DownloadTask) => void

export class DownloadManager {
  public autoDownloadSubtitles: boolean = false
  private _maxActiveDownloads: number
  set maxActiveDownloads(value: number) {
    if (value <= 0) {
      throw new InvalidArgumentError('The max number of concurrent downloads must be greater than 0')
    }

    this._maxActiveDownloads = value
    this.reallocate()
  }

  get maxActiveDownloads(): number {
    return this._maxActiveDownloads
  }

  private _activeDownloads: DownloadQueue = new DownloadQueue()
  private _waitingDownloads: DownloadQueue = new DownloadQueue()
  private _pool: Map<string, DownloadTask> = new Map<string, DownloadTask>()

  public onChangeStatus: OnChangeStatusCallBack | null = null
  public onProgress: OnProgressCallBack | null = null
  public onFinished: OnFinishedCallBack | null = null

  constructor(maxActiveDownloads: number) {
    this._maxActiveDownloads = maxActiveDownloads
  }

  public add(task: DownloadTask): void {
    task.onProgress = (progress) => {
      if (this.onProgress) {
        this.onProgress(progress, task)
      }
    }

    task.onChangeStatus = (status) => {
      if (status === DownloadStatus.DOWNLOADED
          || status === DownloadStatus.STOPPED) {
        this._activeDownloads.extract(task.id)
      }

      this.reallocate()

      if (this.onChangeStatus) {
        this.onChangeStatus(status, task)
      }
    }

    task.onFinished = (output) => {
      if (this.onFinished) {
        this.onFinished(output, task)
      }
    }

    task.downloadSubtitles = this.autoDownloadSubtitles

    this._pool.set(task.id.value, task)
    this.start(task.id)
  }

  public start(taskId: DownloadTaskId): void {
    if (!this._pool.has(taskId.value)) {
      throw new NotFoundDownloadTaskError()
    }

    if (this._activeDownloads.has(taskId)
        || this._waitingDownloads.has(taskId)
    ) {
      return
    }

    const task = this._pool.get(taskId.value)
    this._pool.delete(taskId.value)

    if (this._activeDownloads.size < this.maxActiveDownloads) {
      this._activeDownloads.push(task)
      task.start()
    } else {
      this._waitingDownloads.push(task)
    }
  }

  public pause(taskId: DownloadTaskId): void {
    if (!this._activeDownloads.has(taskId)
        && !this._waitingDownloads.has(taskId)
    ) {
      throw new NotFoundDownloadTaskError()
    }

    if (this._pool.has(taskId.value)) {
      return
    }

    let task: DownloadTask

    if (this._activeDownloads.has(taskId)) {
      task = this._activeDownloads.extract(taskId)
    } else {
      task = this._waitingDownloads.extract(taskId)
    }

    this._pool.set(taskId.value, task)
    task.pause()
    this.reallocate()
  }

  public stop(taskId: DownloadTaskId): void {
    if (!this._activeDownloads.has(taskId)
        && !this._waitingDownloads.has(taskId)
        && !this._pool.has(taskId.value)
    ) {
      throw new NotFoundDownloadTaskError()
    }

    let task: DownloadTask

    if (this._activeDownloads.has(taskId)) {
      task = this._activeDownloads.extract(taskId)
    } else if (this._waitingDownloads.has(taskId)) {
      task = this._waitingDownloads.extract(taskId)
    } else {
      task = this._pool.get(taskId.value)
      this._pool.delete(taskId.value)
    }

    task.stop()

    this.reallocate()
  }

  private reallocate(): void {
    if (this._activeDownloads.size === this.maxActiveDownloads) {
      return
    }

    if (this._activeDownloads.size < this.maxActiveDownloads) {
      const task = this._waitingDownloads.pop()
      if (task) {
        this._activeDownloads.push(task)
        task.start()
      }
    } else {
      const task = this._activeDownloads.pop()
      if (task) {
        this._waitingDownloads.push(task)
        task.pause()
      }
    }

    if (this._activeDownloads.size + this._waitingDownloads.size >= this.maxActiveDownloads) {
      this.reallocate()
    }
  }
}