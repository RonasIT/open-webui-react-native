import { useState } from 'react';
import { Control, useForm, UseFormHandleSubmit } from 'react-hook-form';
import { FormValues } from '@open-webui-react-native/mobile/shared/utils/form';

export interface SuggestChangeSchema {
  suggestionInputValue: string;
}

export interface UseSuggestChangeReturn {
  suggestingMessageId?: string;
  control: Control<FormValues<SuggestChangeSchema>>;
  handleSubmit: UseFormHandleSubmit<FormValues<SuggestChangeSchema>>;
  startSuggesting: (messageId: string) => void;
  cancelSuggesting: () => void;
  submitSuggestion: () => Promise<void>;
}

export const useSuggestChange = (): UseSuggestChangeReturn => {
  const [suggestingMessageId, setSuggestingMessageId] = useState<string>();

  const { control, handleSubmit, reset } = useForm<FormValues<SuggestChangeSchema>>({
    defaultValues: { suggestionInputValue: '' },
  });

  const startSuggesting = (messageId: string): void => {
    setSuggestingMessageId(messageId);
    reset({ suggestionInputValue: '' });
  };

  const cancelSuggesting = (): void => {
    setSuggestingMessageId(undefined);
    reset({ suggestionInputValue: '' });
  };

  const submitSuggestion = async (): Promise<void> => {
    //TODO: implement suggestion sending logic
    cancelSuggesting();
  };

  return {
    suggestingMessageId,
    control,
    handleSubmit,
    startSuggesting,
    cancelSuggesting,
    submitSuggestion,
  };
};
