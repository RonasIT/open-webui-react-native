import { AttachedImageWithIndex } from '@open-webui-react-native/mobile/shared/features/image-preview-modal';
import { getToolCalls, Message, ToolCallState } from '@open-webui-react-native/shared/data-access/api';
import { FileType } from '@open-webui-react-native/shared/data-access/common';
import { ChatCompletionOutputFile } from '@open-webui-react-native/shared/data-access/websocket';
import { getApiUrl } from '@open-webui-react-native/shared/utils/config';
import { normalizeToolInput, normalizeToolOutput, PayloadContentType } from './normalize-tool-payload';
import { ToolData } from './parse-response-message-content';

const IMAGE_FILE_TYPE = 'image';
const IMAGE_MIME_TYPE_PREFIX = 'image/';
const DATA_URI_PREFIX = 'data:';
const UNKNOWN_FILE_TYPE = 'file';

export interface ToolCallFile {
  key: string;
  name: string;
  source: string;
  mimeType?: string;
}

export interface ToolCallView {
  key: string;
  toolName: string;
  state: ToolCallState;
  input?: string;
  output?: string;
  outputContentType: PayloadContentType;
  images: Array<AttachedImageWithIndex>;
  files: Array<ToolCallFile>;
}

// An uploaded file comes as a relative path that needs the server prefix and the auth header the
// attached-image view already sends; a small one the tool inlined comes as a data URI instead.
const getSource = (file: ChatCompletionOutputFile): string | undefined => {
  const source = file.url ?? file.content;

  if (!source) {
    return undefined;
  }

  return source.startsWith(DATA_URI_PREFIX) || source.startsWith('http') ? source : `${getApiUrl()}${source}`;
};

const getMimeType = (file: ChatCompletionOutputFile, source: string): string | undefined => {
  if (file.contentType) {
    return file.contentType;
  }

  if (!source.startsWith(DATA_URI_PREFIX)) {
    return undefined;
  }

  const mimeType = source.slice(DATA_URI_PREFIX.length).split(/[;,]/)[0];

  return mimeType || undefined;
};

// `image/svg+xml` → `svg`. Crude, but the alternative is a mime table for types the app has no
// other use for, and the share sheet falls back on the mime type anyway.
const getExtension = (mimeType?: string): string | undefined => mimeType?.split('/')[1]?.split('+')[0] || undefined;

interface ToolCallAttachments {
  images: Array<AttachedImageWithIndex>;
  files: Array<ToolCallFile>;
}

// NOTE: Images are shown inline; everything else a tool produced — audio, or a binary an OpenAPI
// tool inlined — gets a row the user can save or open elsewhere, since the app cannot display it.
const getAttachments = (files: Array<ChatCompletionOutputFile>): ToolCallAttachments =>
  files.reduce<ToolCallAttachments>(
    (attachments, file, index) => {
      const source = getSource(file);

      if (!source) {
        return attachments;
      }

      const mimeType = getMimeType(file, source);

      if (file.type === IMAGE_FILE_TYPE || mimeType?.startsWith(IMAGE_MIME_TYPE_PREFIX)) {
        attachments.images.push({ type: FileType.IMAGE, url: source, index: attachments.images.length });

        return attachments;
      }

      const extension = getExtension(mimeType);
      const name = `${file.type ?? UNKNOWN_FILE_TYPE}-${index + 1}${extension ? `.${extension}` : ''}`;

      attachments.files.push({ key: `${name}-${index}`, name, source, mimeType });

      return attachments;
    },
    { images: [], files: [] },
  );

interface RawToolCall {
  key: string;
  toolName: string;
  state: ToolCallState;
  rawArguments?: string;
  rawOutput?: string;
  attachments: Array<ChatCompletionOutputFile>;
}

// NOTE: Assistant messages reach the app in two shapes. Since Open WebUI 0.11.0 tool calls live in
// the message `output`, which is the only source that carries call state and tool-produced files.
// Chats stored before that keep them inline in the text as `<details type="tool_calls">`, so the
// legacy parse stays as a fallback — those blocks only ever describe a finished call.
const getRawToolCalls = (message: Message, legacyToolsData: Array<ToolData>): Array<RawToolCall> => {
  const toolCalls = getToolCalls(message);

  if (toolCalls.length) {
    return toolCalls.map((toolCall) => ({
      key: toolCall.callId,
      toolName: toolCall.toolName,
      state: toolCall.state,
      rawArguments: toolCall.toolArguments,
      rawOutput: toolCall.output,
      attachments: toolCall.files,
    }));
  }

  return legacyToolsData.map((tool, index) => ({
    key: tool.id ?? `${tool.toolName}-${index}`,
    toolName: tool.toolName,
    state: ToolCallState.COMPLETED,
    rawArguments: tool.rawArguments,
    rawOutput: tool.rawOutput,
    attachments: [],
  }));
};

export const buildToolCallViews = (message: Message, legacyToolsData: Array<ToolData>): Array<ToolCallView> =>
  getRawToolCalls(message, legacyToolsData).map(({ key, toolName, state, rawArguments, rawOutput, attachments }) => ({
    key,
    toolName,
    state,
    input: normalizeToolInput(rawArguments),
    ...(rawOutput
      ? normalizeToolOutput(rawOutput)
      : { output: undefined, outputContentType: 'text' as PayloadContentType }),
    ...getAttachments(attachments),
  }));
