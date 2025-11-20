import { ImageStyle, TextStyle, ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

type StyleFunction<K> = () => K;
type Value<T> = T | (string | (number & object));
type Variable<T> = Value<T> | StyleFunction<Value<T>>;
type Extended<T> = { [K in keyof T]: Variable<T[K]> };
type WebStyle = {
  outlineWidth?: number;
};

export type AnyStyle = ImageStyle & TextStyle & ViewStyle & WebStyle;
interface AnyStyleSet {
  [key: string]: AnyStyle;
}

export type EStyleSet<T = any> = {
  [K in keyof T]: T[K] extends Variable<number> ? T[K] : T[K] extends MediaQuery ? T[K] : Extended<AnyStyle>;
};

export type StyleSet<T = any> = {
  [K in keyof T]: T[K] extends number
    ? T[K]
    : T[K] extends string
      ? T[K]
      : T[K] extends StyleFunction<number>
        ? number
        : T[K] extends StyleFunction<string>
          ? string
          : T[K] extends MediaQuery
            ? AnyStyleSet
            : AnyStyle;
};

export interface MediaQuery {
  [key: string]: Extended<AnyStyle>;
}

export const createStyles = <T = EStyleSet>(styles: EStyleSet<T>): StyleSet<T> =>
  EStyleSheet.create(styles) as StyleSet<T>;
export const styleValue = (key: string, prop?: string) => EStyleSheet.value(key, prop);
export const flattenStyle = (style: AnyStyle): AnyStyle => EStyleSheet.flatten(style);
