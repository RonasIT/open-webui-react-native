import { ReactNode } from 'react';
import { IconName } from '@open-webui-react-native/mobile/shared/ui/ui-kit';

interface SettingsSectionOptionBase {
  label: string;
  iconName?: IconName;
  isDanger?: boolean;
}

export interface SettingsSectionLinkOption extends SettingsSectionOptionBase {
  type?: 'link';
  value?: string;
  accessoryRight?: ReactNode;
  onPress: () => void;
}

export interface SettingsSectionActionOption extends SettingsSectionOptionBase {
  type: 'action';
  onPress: () => void;
}

export interface SettingsSectionSwitchOption extends SettingsSectionOptionBase {
  type: 'switch';
  isEnabled: boolean;
  onValueChange: (isEnabled: boolean) => void;
}

export type SettingsSectionOption =
  SettingsSectionLinkOption | SettingsSectionActionOption | SettingsSectionSwitchOption;
