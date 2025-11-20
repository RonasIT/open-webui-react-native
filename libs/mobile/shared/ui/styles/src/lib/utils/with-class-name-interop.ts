import { cssInterop } from 'nativewind';
import { ReactComponent } from 'react-native-css-interop/dist/types';

export function withClassNameInterop(component: ReactComponent<any>, props: Array<string> = ['color']): void {
  const nativeStyleToProp = Object.fromEntries(props.map((key) => [key, true]));

  cssInterop(component, {
    className: {
      target: 'style',
      nativeStyleToProp,
    },
  });
}
