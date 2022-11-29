import {AudioStreamInfo} from './AudioStreamInfo';
import {VideoStreamInfo} from './VideoStreamInfo';

export class StreamQueryInfo {

  public video: VideoStreamInfo | null
  public audio: AudioStreamInfo | null
}