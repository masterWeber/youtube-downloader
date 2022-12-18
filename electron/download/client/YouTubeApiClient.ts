import {ApiClient} from './ApiClient'
import youtubeDl from 'youtube-dl-exec'
import {ExecaChildProcess} from 'execa'
import {isJSON} from '../../utils/isJSON'
import * as fs from 'fs'

export class YouTubeApiClient implements ApiClient {
  private _youtubeDl: typeof youtubeDl
  private _process: ExecaChildProcess | null = null
  private _progress: Map<string, number> = new Map<string, number>()
  private _tempFiles: string[] = []
  private _output: string | null = null

  get output(): string | null {
    return this._output
  }

  set output(value: string | null) {
    this._output = value
  }

  constructor(ytDl: typeof youtubeDl) {
    this._youtubeDl = ytDl
  }

  private _onProgress: (progress: number) => void | null = null
  private _onFinished: (output: string) => void | null = null

  public start(streamId: string, url: string, destination: string, downloadSubtitles: boolean): void {
    if (this._process) {
      this.resume()
      return
    }

    this._progress.clear()
    streamId.split('+').forEach(id => {
      this._progress.set(id, 0)
    })

    let options = {
      format: streamId,
      output: `%(title)s [%(id)s] [${streamId}].%(ext)s`,
      paths: destination,
      progressTemplate: 'download:{"format_id":%(info.format_id)j,"progress":%(progress._percent_str)j}',
      newline: true,
      embedThumbnail: true,
    }

    if (downloadSubtitles) {
      options = {
        ...options,
        ...{
          subFormat: 'best',
          subLang: 'en,ru',
          embedSubs: true,
          writeAutoSub: true,
        },
      }
    }

    this._process = this._youtubeDl.exec(url, options)

    this._process.stdout.addListener('data', this.onData.bind(this))
    this._process.on('exit', (exitCode) => {
      if (exitCode === 0) {
        this._onFinished(this.output)
      }
    })
  }

  private onData(chunk: string): void {
    chunk = chunk.toString()

    if (chunk.match(/\[download] Destination: /)) {
      const tempFile = chunk.match(/\[download] Destination: (.+)/)[1]
      this._tempFiles.push(tempFile)
      this._tempFiles.push(`${tempFile}.part`)
    }

    if (chunk.match(/\[Merger] Merging formats into "(.+)"/)) {
      this.output = chunk.match(/\[Merger] Merging formats into "(.+)"/)[1]
    }

    if (chunk.match('already been downloaded') && this._onProgress) {
      this._onProgress(100)
    }

    if (!isJSON(chunk)) {
      return
    }

    const data = JSON.parse(chunk)
    if (!data.format_id || data.format_id === 'NA' || !data.progress) {
      return
    }

    this._progress.set(data.format_id, parseFloat(data.progress))

    // @ts-ignore
    const overallProgress = Array.from(this._progress.values())
        .reduce((acc: number, value: number): number => acc + value, 0) / this._progress.size

    if (this._onProgress) {
      this._onProgress(overallProgress)
    }
  }

  public resume(): void {
    this._process.kill('SIGCONT')
  }

  public pause(): void {
    this._process.kill('SIGSTOP')
  }

  public stop(): void {
    this._progress.clear()
    this._process.kill()
    this.deleteFiles()
    this._process = null
  }

  private deleteFiles(): void {
    if (fs.existsSync(this.output)) {
      fs.unlinkSync(this.output)
    }

    this._tempFiles.forEach(path => {
      if (fs.existsSync(path)) {
        fs.unlinkSync(path)
      }
    })
  }

  public onProgress(cb: (progress: number) => void | null): void {
    this._onProgress = cb
  }

  public onFinished(cb: (output: string) => void | null): void {
    this._onFinished = cb
  }
}