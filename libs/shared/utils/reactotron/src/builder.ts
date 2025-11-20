import type { ReactotronReactNative } from 'reactotron-react-native';

export const setupReactotron = (projectName: string): ReactotronReactNative | undefined => {
  if (__DEV__) {
    const Reactotron: ReactotronReactNative = require('reactotron-react-native').default;

    if (!Reactotron) {
      throw new Error('Reactotron is undefined. Please ensure reactotron-react-native is properly installed.');
    }

    return Reactotron.configure({ name: projectName }).useReactNative({ log: true }).connect();
  }

  return undefined;
};
