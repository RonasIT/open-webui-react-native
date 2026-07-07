import { Host, Slider, type SliderProps, type UniversalHostProps } from '@expo/ui';
import { ReactElement } from 'react';

export type ExpoUiSliderProps = SliderProps & {
  hostProps?: Omit<UniversalHostProps, 'children'>;
};

export function ExpoUiSlider({ hostProps, ...props }: ExpoUiSliderProps): ReactElement {
  const { matchContents, style, ...restHostProps } = hostProps ?? {};

  return (
    <Host
      {...restHostProps}
      matchContents={matchContents ?? { vertical: true }}
      style={[{ width: '100%' }, style]}>
      <Slider {...props} />
    </Host>
  );
}
