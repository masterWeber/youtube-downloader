import {StreamQueryInfo} from './StreamQueryInfo';

export class Info {
  id: string
  title: string
  description: string
  thumbnail: string
  streamInfo: StreamQueryInfo

  constructor(
      id: string,
      title: string,
      description: string,
      thumbnail: string,
      streamInfo: StreamQueryInfo
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.thumbnail = thumbnail;
    this.streamInfo = streamInfo;
  }
}