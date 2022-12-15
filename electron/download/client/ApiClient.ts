export interface ApiClient {
  start(streamId: string, url: string, destination: string): void

  pause(): void

  stop(): void

  onProgress(cb: (progress: number) => void): void

  onFinished(cb: (output: string) => void): void
}