import { type TextInputRef } from '@expo/ui';
import { ReactElement } from 'react';
import { Control, FieldValues, Path, useController } from 'react-hook-form';

import { FloatedLabelInput, FloatedLabelInputProps } from '../floated-label-input';

export interface FormFloatedLabelInputProps<T extends FieldValues> extends FloatedLabelInputProps {
  name: Path<T>;
  control: Control<T>;
  inputRef?: React.Ref<TextInputRef>;
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
