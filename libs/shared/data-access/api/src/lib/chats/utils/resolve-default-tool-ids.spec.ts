import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { AIModel } from '../../ai-models/models/model';
import { Tool } from '../../tools/models/tool';
import { UiSettings } from '../../users/models/ui-settings';
import { resolveDefaultToolIds } from './resolve-default-tool-ids';

const createTools = (): Array<Tool> =>
  plainToInstance(Tool, [
    { id: 'weather', name: 'Weather' },
    { id: 'server:mcp:github', name: 'GitHub', authenticated: true },
    { id: 'server:mcp:jira', name: 'Jira', authenticated: false },
  ]);

const createModel = (toolIds?: Array<string>): AIModel =>
  plainToInstance(AIModel, { id: 'coder', name: 'Coder', info: { meta: { toolIds } } });

const createUiSettings = (tools?: Array<string>): UiSettings => plainToInstance(UiSettings, { tools });

describe('resolveDefaultToolIds', () => {
  it('returns the default tools of the model', () => {
    const toolIds = resolveDefaultToolIds({
      model: createModel(['weather', 'server:mcp:github']),
      tools: createTools(),
    });

    expect(toolIds).toEqual(['weather', 'server:mcp:github']);
  });

  it('drops a default the user has no tool for', () => {
    const toolIds = resolveDefaultToolIds({
      model: createModel(['weather', 'removed-tool']),
      tools: createTools(),
    });

    expect(toolIds).toEqual(['weather']);
  });

  it('drops an OAuth server the user has not signed into', () => {
    const toolIds = resolveDefaultToolIds({
      model: createModel(['server:mcp:jira']),
      tools: createTools(),
    });

    expect(toolIds).toEqual([]);
  });

  it('deduplicates repeated defaults', () => {
    const toolIds = resolveDefaultToolIds({
      model: createModel(['weather', 'weather']),
      tools: createTools(),
    });

    expect(toolIds).toEqual(['weather']);
  });

  it('falls back to the default tools of the user when the model defines none', () => {
    const toolIds = resolveDefaultToolIds({
      model: createModel(),
      tools: createTools(),
      uiSettings: createUiSettings(['weather']),
    });

    expect(toolIds).toEqual(['weather']);
  });

  it('prefers the defaults of the model over those of the user', () => {
    const toolIds = resolveDefaultToolIds({
      model: createModel(['server:mcp:github']),
      tools: createTools(),
      uiSettings: createUiSettings(['weather']),
    });

    expect(toolIds).toEqual(['server:mcp:github']);
  });

  it('returns an empty array when nothing is loaded yet', () => {
    expect(resolveDefaultToolIds({})).toEqual([]);
  });
});
