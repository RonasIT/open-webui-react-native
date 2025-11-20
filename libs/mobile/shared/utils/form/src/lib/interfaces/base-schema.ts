import { FormValues } from '../types';

export interface BaseFormSchema<T> {
  formValues: FormValues<T>;
}
