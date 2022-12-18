import {DownloadStatus} from './DownloadStatus'
import {VideoInfo} from './VideoInfo'
import {api} from '../api'

export class Task {
  public id: string
  public streamId: string
  public url: string
  public videoInfo: VideoInfo
  public destination: string
  private _output: string | null = null

  get output(): string | null {
    return this._output
  }

  set output(value: string | null) {
    if (this.isDownloaded() && value) {
      this.status = DownloadStatus.FINISHED
    }
    this._output = value
  }

  private _progress: number
  get progress(): number {
    return this._progress
  }

  set progress(value: number) {
    this._progress = value
    if (this.status === DownloadStatus.WAIT_PROGRESS) {
      this.status = DownloadStatus.DOWNLOAD
    }
    if (value >= 100) this.status = DownloadStatus.DOWNLOADED
  }

  public status: DownloadStatus

  private _manager

  constructor(
      id: string,
      streamId: string,
      url: string,
      videoInfo: VideoInfo,
      destination: string,
      progress: number = 0,
      status: DownloadStatus = DownloadStatus.DOWNLOAD,
      output: string | null = null,
  ) {
    this.id = id
    this.streamId = streamId
    this.url = url
    this.destination = destination
    this.videoInfo = videoInfo
    this._progress = progress
    this.status = status
    this.output = output
    this._manager = {
      pause: api.pauseDownloading,
      start: api.startDownloading,
      stop: api.stopDownloading,
    }
  }

  public start(): void {
    this._manager.start(this)
    this.status = DownloadStatus.WAIT_PROGRESS
  }

  public isDownload(): boolean {
    return this.status === DownloadStatus.DOWNLOAD
  }

  public isStarted(): boolean {
    return this.isDownload() || this.isWaitProgress()
  }

  public isWaitProgress(): boolean {
    return this.status === DownloadStatus.WAIT_PROGRESS
  }

  public pause(): void {
    this._manager.pause(this.id)
    this.status = DownloadStatus.PAUSE
  }

  public isPaused(): boolean {
    return this.status === DownloadStatus.PAUSE
  }

  public isDownloaded(): boolean {
    return this.status === DownloadStatus.DOWNLOADED
  }

  public stop(): void {
    this._manager.stop(this.id)
    this.status = DownloadStatus.STOPPED
    this._progress = 0
  }

  public isStopped(): boolean {
    return this.status === DownloadStatus.STOPPED
  }

  public isFinished(): boolean {
    return this.status === DownloadStatus.FINISHED
  }

  public static create(
      url: string,
      videoInfo: VideoInfo,
      destination: string,
  ): Task {
    let streamIds = []
    if (videoInfo.streamInfo.video) {
      streamIds.push(videoInfo.streamInfo.video.id)
    }
    if (videoInfo.streamInfo.audio) {
      streamIds.push(videoInfo.streamInfo.audio.id)
    }

    const streamId = streamIds.join('+')
    const id = videoInfo.id + '|' + streamId

    return new Task(id, streamId, url, videoInfo, destination)
  }
}