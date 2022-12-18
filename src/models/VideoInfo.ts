export interface VideoInfo {
  id: string,
  title: string,
  description: string,
  thumbnail: string,
  streamInfo: {
    video: {
      id: string,
      codec: string,
      fileSize: number,
      formatNote: string,
    } | null,
    audio: {
      id: string,
      codec: string,
      fileSize: number,
      bitRate: number,
    } | null
  }
}