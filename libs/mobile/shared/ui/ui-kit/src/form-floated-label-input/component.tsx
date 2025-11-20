import { ReactElement } from 'react';
import { Control, FieldValues, Path, useController } from 'react-hook-form';
import { TextInput } from 'react-native';

import { FloatedLabelInput, FloatedLabelInputProps } from '../floated-label-input';

export interface FormFloatedLabelInputProps<T extends FieldValues> extends FloatedLabelInputProps {
  name: Path<T>;
  control: Control<T>;
  inputRef?: React.Ref<TextInput>;
}

export function FormFloatedLabelInput<T extends FieldValues>({
  name,
  control,
  inputRef,
  ...restProps
}: FormFloatedLabelInputProps<T>): ReactElement {
  const { field, fieldState } = useController({ control, name });

  return (
    <FloatedLabelInput
      ref={inputRef}
      value={field.value}
      onChangeText={field.onChange}
      onBlur={field.onBlur}
      error={fieldState.error?.message}
      {...restProps}
    />
  );
}
