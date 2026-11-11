import { uniq } from 'lodash-es';
import { AIModel } from '../../ai-models/models/model';
import { Tool } from '../../tools/models/tool';
import { UiSettings } from '../../users/models/ui-settings';

export interface ResolveDefaultToolIdsArgs {
  model?: AIModel;
  tools?: Array<Tool>;
  uiSettings?: UiSettings;
}

// Tools a chat starts with when the user has not picked any, mirroring the web interface: the
// model's own list wins, even an empty one, and the user's default tools apply only when the model
// has no list at all.
export function resolveDefaultToolIds({ model, tools, uiSettings }: ResolveDefaultToolIdsArgs): Array<string> {
  const defaultToolIds = model?.info?.meta?.toolIds ?? uiSettings?.tools ?? [];

  return uniq(defaultToolIds).filter((toolId) => {
    const tool = tools?.find(({ id }) => id === toolId);

    // A default can outlive the tool itself, or the access to it. Sending an id the server cannot
    // resolve fails the whole completion, so only ids present in the user's own tool list survive.
    // An OAuth server the user has not signed into is dropped for the same reason — signing in
    // happens in the web interface.
    return Boolean(tool) && tool?.authenticated !== false;
  });
}
