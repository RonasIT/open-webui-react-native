// NOTE: `type` of an item inside a completion's `output` array (Responses API format). Only the
// types the client acts on are listed — anything else is carried through untouched.
export enum ChatCompletionOutputItemType {
  MESSAGE = 'message',
  FUNCTION_CALL = 'function_call',
  FUNCTION_CALL_OUTPUT = 'function_call_output',
}
