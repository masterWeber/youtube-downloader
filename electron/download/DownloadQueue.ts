import {DownloadTaskId} from "./DownloadTaskId";
import {DownloadTask} from "./DownloadTask";

export class DownloadQueue {
  private _store: DownloadTask[] = [];

  get size(): number {
    return this._store.length
  }

  public push(item: DownloadTask): void {
    if (this._store.includes(item)) {
      return
    }

    this._store.push(item);
  }

  public pop(): DownloadTask | undefined {
    return this._store.shift();
  }

  public has(taskId: DownloadTaskId): boolean {
    return !!this._store.find((value) => {
      return value.id.equals(taskId)
    })
  }

  public extract(taskId: DownloadTaskId): DownloadTask {
    if (!this.has(taskId)) {
      return null
    }

    const task = this._store.find((value) => {
      return value.id.equals(taskId)
    })

    this._store = this._store.filter((current) => {
      return !current.id.equals(taskId)
    })

    return task
  }
}