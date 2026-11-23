import { observable } from '@legendapp/state';

// NOTE: Ids the server rejected with "Model not found" during this session, including a listed
// workspace model whose base is gone. Not persisted: the next sign-in asks the server again.
export const unavailableModelsState$ = observable<Record<string, true>>({});

export const resetUnavailableModels = (): void => {
  unavailableModelsState$.set({});
};
