import {VideoOption} from './VideoOption';
import {AudioOption} from './AudioOption';
import {QualityOption} from './QualityOption';

export interface DownloadOptions {
  url: string
  preferred: {
    video: VideoOption
    audio: AudioOption
  }
  maxQuality: QualityOption
  output?: string | null
}