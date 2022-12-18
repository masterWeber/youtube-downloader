import {VideoInfo} from './VideoInfo'
import {DownloadStatus} from './DownloadStatus'

export interface TaskData {
  id: string
  streamId: string
  url: string
  videoInfo: VideoInfo
  destination: string
  output: string | null
  progress: number
  status: DownloadStatus
}