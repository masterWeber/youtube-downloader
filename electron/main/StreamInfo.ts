export interface StreamInfo {
  asr: number,
  filesize: number,
  format_id: string,
  format_note: string,
  fps: number,
  height: number,
  quality: number,
  tbr: number,
  vbr?: number,
  url: string,
  manifest_url: string,
  width: number,
  ext: string,
  vcodec: string,
  acodec: string,
  abr: number,
  downloader_options: unknown,
  container: string,
  format: string,
  protocol: string,
  http_headers: unknown
}