import { ModelControl } from '@open-webui-react-native/shared/data-access/api';

export function getModelControlResetLabel(
  control: ModelControl,
  translate: (key: string, params?: Record<string, string>) => string,
): string {
  const defaultOptionLabel = control.default ? control.options[control.default]?.label : undefined;

  return defaultOptionLabel
    ? translate('TEXT_RESET_TO_DEFAULT_WITH_OPTION', { option: defaultOptionLabel })
    : translate('TEXT_RESET_TO_DEFAULT');
}
