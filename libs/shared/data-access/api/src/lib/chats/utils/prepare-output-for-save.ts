import { instanceToPlain } from 'class-transformer';
import { ChatCompletionOutputItem } from '@open-webui-react-native/shared/data-access/websocket';

// NOTE: The chat is persisted by posting the whole history back, and the request body is the model
// instances themselves — so a field the model renames (`callId` ← `call_id`, `toolArguments` ←
// `arguments`) would be written under its TypeScript name and replace the backend's own key. The
// stored call then has no `call_id`, which is what pairs a tool call with its result and what the
// backend reads to continue a response. Converting back to the wire shape before saving keeps the
// round trip honest.
export const prepareOutputForSave = (
  output?: Array<ChatCompletionOutputItem>,
): Array<ChatCompletionOutputItem> | undefined =>
  output?.map(
    (item) =>
      instanceToPlain(item, { excludeExtraneousValues: true, exposeUnsetFields: false }) as ChatCompletionOutputItem,
  );
