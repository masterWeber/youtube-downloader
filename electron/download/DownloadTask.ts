import {DownloadStatus} from './DownloadStatus'
import {ApiClient} from './client/ApiClient'
import {DownloadTaskId} from './DownloadTaskId'

export class DownloadTask {
  public id: DownloadTaskId
  public streamId: string
  public url: string
  public destination: string
  public output: string | null = null
  private _progress: number = 0

  get progress(): number {
    return this._progress
  }

  set progress(value: number) {
    this._progress = value
    if (this.onProgress) {
      this.onProgress(this.progress)
    }
    if (value >= 100) this.status = DownloadStatus.DOWNLOADED
  }

  private _status: DownloadStatus = DownloadStatus.INITIALIZATION

  private set status(value: DownloadStatus) {
    this._status = value
    if (this.onChangeStatus) {
      this.onChangeStatus(this.status)
    }
  }

  get status(): DownloadStatus {
    return this._status
  }

  private _apiClient: ApiClient

  public onProgress: (progress: number) => void | null = null
  public onChangeStatus: (status: DownloadStatus) => void | null = null
  public onFinished: (output: string) => void | null = null

  constructor(
      id: DownloadTaskId,
      streamId: string,
      url: string,
      destination: string,
      apiClient: ApiClient,
  ) {
    this.id = id
    this.streamId = streamId
    this.url = url
    this.destination = destination
    this._apiClient = apiClient

    this._apiClient.onProgress(
        (progress: number) => this.progress = progress,
    )

    this._apiClient.onFinished(
        (output: string) => {
          this.status = DownloadStatus.FINISHED
          this.output = output
          if (this.onFinished) {
            this.onFinished(output)
          }
        },
    )
  }

  public start(): void {
    if (this.isDownload() || this.isDownloaded()) {
      return
    }

    this.status = DownloadStatus.DOWNLOAD
    this._apiClient.start(
        this.streamId,
        this.url,
        this.destination,
    )
  }

  public isDownload(): boolean {
    return this.status === DownloadStatus.DOWNLOAD
  }

  public pause(): void {
    if (this.isPaused()) {
      return
    }

    this.status = DownloadStatus.PAUSE
    this._apiClient.pause()
  }

  public isPaused(): boolean {
    return this.status === DownloadStatus.PAUSE
  }

  public isDownloaded(): boolean {
    return this.status === DownloadStatus.DOWNLOADED
  }

  public stop(): void {
    if (this.isStopped() || this.isDownloaded()) {
      return
    }

    this.status = DownloadStatus.STOPPED
    this._progress = 0
    this._apiClient.stop()
  }

  public isStopped(): boolean {
    return this.status === DownloadStatus.STOPPED
  }

  public static create(
      id: string,
      streamId: string,
      url: string,
      destination: string,
      apiClient: ApiClient,
  ): DownloadTask {
    return new DownloadTask(
        new DownloadTaskId(id),
        streamId,
        url,
        destination,
        apiClient,
    )
  }
}