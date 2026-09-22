// NOTE: `type` of a content part inside an output item. `INPUT_IMAGE` is the model's copy of an
// image a tool returned — it carries no text, and what the user sees comes from the item's `files`.
export enum ChatCompletionOutputPartType {
  OUTPUT_TEXT = 'output_text',
  INPUT_TEXT = 'input_text',
  INPUT_IMAGE = 'input_image',
}
