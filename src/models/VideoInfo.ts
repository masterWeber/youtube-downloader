export interface VideoInfo {
  id: string,
  title: string,
  description: string,
  thumbnail: string,
  video: {
    codec: string,
    fileSize: number,
    formatNote: string,
  },
  audio: {
    codec: string,
    fileSize: number,
    bitRate: number,
  }
}