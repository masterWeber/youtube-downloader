export class AudioStreamInfo {
  id: string
  codec: string
  fileSize: number
  bitRate: number

  constructor(id: string, codec: string, fileSize: number, bitRate: number) {
    this.id = id;
    this.codec = codec;
    this.fileSize = fileSize;
    this.bitRate = bitRate;
  }
}