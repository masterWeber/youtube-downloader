export class DownloadTaskId {
  public readonly value: string

  constructor(value: string) {
    this.value = value
  }

  public equals(other: DownloadTaskId): boolean {
    return this.value === other.value
  }
}