import { isEqual } from 'lodash-es';
import { ComponentType, memo } from 'react';

export function deepMemo<TProps extends Record<string, any>>(Component: ComponentType<TProps>): ComponentType<TProps> {
  return memo(Component, (prevProps: TProps, nextProps: TProps) => isEqual(prevProps, nextProps));
}
