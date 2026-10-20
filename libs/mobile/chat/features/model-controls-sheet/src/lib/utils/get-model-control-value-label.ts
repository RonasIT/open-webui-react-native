import { ModelControl } from '@open-webui-react-native/shared/data-access/api';

export function getModelControlValueLabel(
  control: ModelControl,
  choice: string | undefined,
  translate: (key: string, params?: Record<string, string>) => string,
): string {
  if (choice && control.options[choice]) {
    return control.options[choice].label;
  }

  if (control.default && control.options[control.default]) {
    return control.options[control.default].label;
  }

  return translate('TEXT_DEFAULT');
}
