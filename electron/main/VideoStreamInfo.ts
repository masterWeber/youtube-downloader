export class VideoStreamInfo {
  id: string
  codec: string
  fileSize: number
  formatNote: string

  constructor(id:string, codec: string, fileSize: number, formatNote: string) {
    this.id = id;
    this.codec = codec;
    this.fileSize = fileSize;
    this.formatNote = formatNote;
  }
}