// NOTE: `type` of a file attached to a `function_call_output` item (see `process_tool_result` in
// open_webui/utils/middleware.py). MCP tools report `IMAGE`/`AUDIO`; an OpenAPI tool's inline data
// URI is always tagged `DATA` regardless of what it actually contains.
export enum ChatCompletionOutputFileType {
  IMAGE = 'image',
  AUDIO = 'audio',
  DATA = 'data',
}
