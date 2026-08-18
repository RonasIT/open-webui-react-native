import { ReactElement } from 'react';
import { AppDivider, AppText, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { SettingsSectionItem } from './components';
import { SettingsSectionOption } from './types';

interface SettingsSectionProps {
  options: Array<SettingsSectionOption>;
  title?: string;
}

export function SettingsSection({ title, options }: SettingsSectionProps): ReactElement {
  return (
    <View>
      {!!title && <AppText className='text-sm-sm sm:text-sm text-text-secondary pt-20 pb-8'>{title}</AppText>}
      {options.map((option) => (
        <View key={option.label}>
          <SettingsSectionItem option={option} />
          <AppDivider className='h-[1px] bg-background-tertiary' />
        </View>
      ))}
    </View>
  );
}
