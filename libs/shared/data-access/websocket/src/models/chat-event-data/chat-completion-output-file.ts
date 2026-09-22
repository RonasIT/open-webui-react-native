import { Expose } from 'class-transformer';
import { ChatCompletionOutputFileType } from '../../enums/chat-completion-output-file-type';

// NOTE: Attached by the backend to a `function_call_output` item for everything a tool produced
// that is meant for the user rather than for the model — MCP images and audio are uploaded and
// referenced by a relative `url`, while an OpenAPI tool's binary comes back inline in `content`
// as a data URI (see `process_tool_result` in open_webui/utils/middleware.py).
export class ChatCompletionOutputFile {
  @Expose()
  public type?: ChatCompletionOutputFileType;

  @Expose()
  public url?: string;

  @Expose()
  public content?: string;

  @Expose({ name: 'content_type' })
  public contentType?: string;
}
