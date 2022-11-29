import {StreamQueryInfo} from './StreamQueryInfo';
import {DownloadOptions} from './DownloadOptions';
import {StreamInfo} from './StreamInfo';
import {VideoStreamInfo} from './VideoStreamInfo';
import {AudioStreamInfo} from './AudioStreamInfo';
import {AudioStreamContainerOption} from './AudioStreamContainerOption';
import {AudioEncoding} from './AudioEncoding';
import {VideoStreamContainerOption} from './VideoStreamContainerOption';
import {VideoEncoding} from './VideoEncoding';

export class StreamSelector {
  public selectFormat(streams: StreamInfo[], options: DownloadOptions): StreamQueryInfo {
    const result = new StreamQueryInfo()

    result.video = this.selectBestVideo(streams, options)
    result.audio = this.selectBestAudio(streams, options)

    return result
  }

  private selectBestVideo(streams: StreamInfo[], options: DownloadOptions): VideoStreamInfo | null {
    const videoStreams = streams.filter((stream) => {
      return !stream.format.match('audio only')
    })

    if (videoStreams.length === 0) {
      return null
    }

    const ordered = videoStreams.filter((stream) => {
      return (options.maxQuality === 0 || stream.height <= options.maxQuality)
          && (options.preferred.video === VideoStreamContainerOption.Best
              || this.containerEquals(options.preferred.video, stream))
    }).sort((a, b) => {
      return b.height - a.height || b.fps - a.fps
    })

    if (ordered.length === 0) {
      return null
    }

    const maxHeight = ordered[0].height
    const candidate = ordered.filter((stream) => {
      return stream.height === maxHeight
    }).sort((a, b) => {
      return this.getVideoQuality(b) - this.getVideoQuality(a)
    }).shift()

    return new VideoStreamInfo(
        candidate.format_id,
        candidate.vcodec,
        candidate.filesize,
        candidate.format_note
    )
  }

  private selectBestAudio(streams: StreamInfo[], options: DownloadOptions): AudioStreamInfo | null {
    const onlyAudioStreams = streams.filter((stream) => {
      return stream.format.match('audio only')
    })

    const muxedStreams = streams.filter((stream) => {
      return stream.vcodec !== 'none' && stream.acodec !== 'none' && stream.abr > 0
    })

    if (onlyAudioStreams.length === 0 && muxedStreams.length === 0) {
      return null
    }

    let candidate = onlyAudioStreams.filter((stream) => {
      return options.preferred.audio === AudioStreamContainerOption.Best
          || this.containerEquals(options.preferred.audio, stream)
    }).sort((a, b) => {
      return this.getAudioQuality(b) - this.getAudioQuality(a)
    }).shift()

    if (!candidate) {
      candidate = muxedStreams.filter((stream) => {
        return options.preferred.audio === AudioStreamContainerOption.Best
            || this.containerEquals(options.preferred.audio, stream)
      }).sort((a, b) => {
        return b.filesize - a.filesize
      }).shift()
    }

    return new AudioStreamInfo(
        candidate.format_id,
        candidate.acodec,
        candidate.filesize,
        candidate.abr
    )
  }

  private containerEquals(
      option: AudioStreamContainerOption | VideoStreamContainerOption,
      streamInfo: StreamInfo
  ): boolean {
    return streamInfo.ext === option.toString()
  }

  private getAudioQuality(streamInfo: StreamInfo): number {
    let multiplier = 1;

    switch (streamInfo.acodec) {
      case AudioEncoding.Opus:
        multiplier = 1.2
        break
      case AudioEncoding.Vorbis:
        multiplier = 1.1
        break
    }

    return streamInfo.filesize * multiplier
  }

  private getVideoQuality(streamInfo: StreamInfo): number {
    let multiplier = 1;

    switch (streamInfo.vcodec) {
      case VideoEncoding.Vp9:
        multiplier = 1.3
        break
    }

    return streamInfo.filesize * multiplier
  }
}