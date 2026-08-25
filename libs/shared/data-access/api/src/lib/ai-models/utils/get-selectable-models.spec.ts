import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { AIModel } from '../models';
import { getSelectableModels, isModelSelectable } from './get-selectable-models';

const createModels = (): Array<AIModel> =>
  plainToInstance(AIModel, [
    { id: 'models/provider-model', name: 'Provider Model', info: { meta: { hidden: true } } },
    { id: 'coder', name: 'Coder', info: { meta: { hidden: false } } },
    { id: 'reasoning', name: 'Reasoning', info: { meta: {} } },
    { id: 'fast', name: 'Fast' },
  ]);

describe('getSelectableModels', () => {
  it('keeps a model that is explicitly not hidden', () => {
    expect(getSelectableModels(createModels()).map(({ id }) => id)).toContain('coder');
  });

  it('excludes a model marked as hidden', () => {
    expect(getSelectableModels(createModels()).map(({ id }) => id)).not.toContain('models/provider-model');
  });

  it('keeps a model without the hidden flag', () => {
    const selectableIds = getSelectableModels(createModels()).map(({ id }) => id);

    expect(selectableIds).toContain('reasoning');
    expect(selectableIds).toContain('fast');
  });

  it('does not mutate or drop models from the source collection', () => {
    const models = createModels();

    getSelectableModels(models);

    expect(models.map(({ id }) => id)).toEqual(['models/provider-model', 'coder', 'reasoning', 'fast']);
  });

  it('returns an empty array when models are not loaded yet', () => {
    expect(getSelectableModels(undefined)).toEqual([]);
  });
});

describe('isModelSelectable', () => {
  it('resolves a hidden model that an existing chat still references', () => {
    const models = createModels();
    const hiddenModel = models.find(({ id }) => id === 'models/provider-model');

    expect(hiddenModel?.name).toBe('Provider Model');
    expect(isModelSelectable(hiddenModel as AIModel)).toBe(false);
  });
});
