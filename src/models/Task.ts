import {DownloadStatus} from './DownloadStatus';
import {VideoInfo} from './VideoInfo';

export class Task {
  id: string
  streamId: string
  url: string
  videoInfo: VideoInfo
  output: string
  private _progress: number
  get progress(): number {
    return this._progress
  }

  set progress(value: number) {
    this._progress = value
    if (value >= 100) this.status = DownloadStatus.DOWNLOADED
  }

  status: DownloadStatus

  constructor(
      id: string,
      streamId: string,
      url: string,
      videoInfo: VideoInfo,
      output: string,
      progress: number = 0,
      status: DownloadStatus = DownloadStatus.DOWNLOAD
  ) {
    this.id = id;
    this.streamId = streamId;
    this.url = url;
    this.output = output;
    this.videoInfo = videoInfo;
    this._progress = progress;
    this.status = status;
  }

  public start(): void {
    this.status = DownloadStatus.DOWNLOAD;
  }

  public isDownload(): boolean {
    return this.status === DownloadStatus.DOWNLOAD
  }

  public pause(): void {
    this.status = DownloadStatus.PAUSE;
  }

  public isPaused(): boolean {
    return this.status === DownloadStatus.PAUSE
  }

  public isDownloaded(): boolean {
    return this.status === DownloadStatus.DOWNLOADED
  }

  public stop(): void {
    this.status = DownloadStatus.STOPPED;
    this._progress = 0
  }

  public static create(
      url: string,
      videoInfo: VideoInfo,
      output: string
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

    return new Task(id, streamId, url, videoInfo, output)
  }

  public isStopped(): boolean {
    return this.status === DownloadStatus.STOPPED
  }
}