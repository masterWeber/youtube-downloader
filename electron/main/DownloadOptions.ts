import {AudioStreamContainerOption} from './AudioStreamContainerOption';
import {VideoStreamContainerOption} from './VideoStreamContainerOption';

export interface DownloadOptions {
  url: string
  preferred: {
    video: VideoStreamContainerOption
    audio: AudioStreamContainerOption
  }
  maxQuality: number
  output?: string | null
}