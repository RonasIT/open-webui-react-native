import { AIModel } from '../models';

/**
 * Open WebUI treats model access and model visibility as separate concepts: `/api/models` returns
 * every model the user is authorized to use, including base models that are marked as hidden via
 * `info.meta.hidden`. Those models still have to stay resolvable, because custom models can be
 * built on top of them and existing chats may reference them.
 *
 * The Open WebUI frontend keeps the full list in its model store and filters hidden models out at
 * the selector level. Models without the flag are treated as visible.
 */
export const isModelSelectable = (model: AIModel): boolean => !model.info?.meta?.hidden;

export const getSelectableModels = (models?: Array<AIModel>): Array<AIModel> =>
  (models ?? []).filter(isModelSelectable);
