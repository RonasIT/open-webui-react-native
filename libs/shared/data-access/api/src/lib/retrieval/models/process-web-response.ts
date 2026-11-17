import { Expose, Type } from 'class-transformer';

class ProcessWebFileData {
  @Expose()
  public content?: string;
}

class ProcessWebFile {
  @Expose()
  @Type(() => ProcessWebFileData)
  public data?: ProcessWebFileData;
}

// NOTE: `POST /retrieval/process/web` on Open WebUI 0.10.0–0.11.0, which has no /process/url; remove with 0.11.0 support.
export class ProcessWebResponse {
  @Expose()
  public status: boolean;

  @Expose({ name: 'collection_name' })
  public collectionName?: string | null;

  @Expose()
  @Type(() => ProcessWebFile)
  public file?: ProcessWebFile;
}
