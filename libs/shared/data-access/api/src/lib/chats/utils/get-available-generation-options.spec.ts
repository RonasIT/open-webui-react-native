import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { AIModel } from '../../ai-models/models';
import { Configuration } from '../../app-configuration/models/configuration';
import { isFeaturePermitted } from '../../auth/utils/is-feature-permitted';
import { ChatGenerationOption } from '../enums';
import { getAvailableGenerationOptions } from './get-available-generation-options';
import { resolveDefaultGenerationOptions } from './resolve-default-generation-options';

const createConfiguration = (features: Record<string, boolean>): Configuration =>
  plainToInstance(Configuration, { features: { enable_image_generation: true, enable_web_search: true, ...features } });

const createModel = (meta: object): AIModel => plainToInstance(AIModel, { id: 'model', name: 'Model', info: { meta } });

// NOTE: The permission check, including the admin bypass, is covered by `isFeaturePermitted` itself.
jest.mock('../../auth/utils/is-feature-permitted', () => ({ isFeaturePermitted: jest.fn(() => true) }));

const resolveDefaults = (model: AIModel, configuration: Configuration): Array<ChatGenerationOption> =>
  resolveDefaultGenerationOptions({ model, availableOptions: getAvailableGenerationOptions(model, configuration) });

describe('getAvailableGenerationOptions', () => {
  it('offers an option whose capability the admin never set', () => {
    expect(getAvailableGenerationOptions(createModel({}), createConfiguration({}))).toEqual([
      ChatGenerationOption.IMAGE_GENERATION,
      ChatGenerationOption.WEB_SEARCH,
    ]);
  });

  it('hides an option the model opts out of or the server turns off', () => {
    const model = createModel({ capabilities: { image_generation: false } });

    expect(getAvailableGenerationOptions(model, createConfiguration({ enable_web_search: false }))).toEqual([]);
  });

  it('hides an option the user has no permission for', () => {
    jest.mocked(isFeaturePermitted).mockImplementation((_, permission) => permission !== 'webSearch');

    expect(getAvailableGenerationOptions(createModel({}), createConfiguration({}))).toEqual([
      ChatGenerationOption.IMAGE_GENERATION,
    ]);

    jest.mocked(isFeaturePermitted).mockReturnValue(true);
  });
});

describe('resolveDefaultGenerationOptions', () => {
  it('turns on a default feature the model explicitly supports', () => {
    const model = createModel({ capabilities: { image_generation: true }, defaultFeatureIds: ['image_generation'] });

    expect(resolveDefaults(model, createConfiguration({}))).toEqual([ChatGenerationOption.IMAGE_GENERATION]);
  });

  it('does not turn on a default feature whose capability is unset', () => {
    expect(resolveDefaults(createModel({ defaultFeatureIds: ['web_search'] }), createConfiguration({}))).toEqual([]);
  });

  it('does not turn on a default feature the server has off', () => {
    const model = createModel({ capabilities: { web_search: true }, defaultFeatureIds: ['web_search'] });

    expect(resolveDefaults(model, createConfiguration({ enable_web_search: false }))).toEqual([]);
  });
});
