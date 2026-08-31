import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ReactElement, useState } from 'react';
import { AppButton, AppText, AppTextInput, Icon, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { AskUserDraftAnswers, AskUserPrompt } from '@open-webui-react-native/shared/data-access/api';
import { AskUserOption } from './components';

export interface AskUserCardProps {
  prompt: AskUserPrompt;
  onSubmit: (answers: AskUserDraftAnswers) => void;
  onDenyPress: () => void;
  isResolving?: boolean;
}

export function AskUserCard({ prompt, isResolving, onSubmit, onDenyPress }: AskUserCardProps): ReactElement {
  const translate = useTranslation('CHAT.AI_MESSAGE.ASK_USER_CARD');

  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AskUserDraftAnswers>({});

  const { questions } = prompt;
  const question = questions[Math.min(questionIndex, questions.length - 1)];
  const answer = answers[question.id];
  const isLastQuestion = questionIndex >= questions.length - 1;

  const isAnswered = (checkedAnswers: AskUserDraftAnswers): boolean =>
    questions.every((item) => {
      const itemAnswer = checkedAnswers[item.id];

      return itemAnswer?.type === 'option' || (itemAnswer?.type === 'other' && Boolean(itemAnswer.text.trim()));
    });

  // NOTE: Answering the last question submits straight away — mirrors the web client, where picking an
  // option advances the stepper and the final pick sends the answers without a separate confirm tap.
  const advance = (nextAnswers: AskUserDraftAnswers): void => {
    if (!isLastQuestion) {
      return setQuestionIndex(questionIndex + 1);
    }

    if (isAnswered(nextAnswers)) {
      onSubmit(nextAnswers);
    }
  };

  const handleOptionPress = (optionIndex: number): void => {
    const option = question.options[optionIndex];
    const nextAnswers: AskUserDraftAnswers = {
      ...answers,
      [question.id]: {
        type: 'option',
        optionIndex,
        label: option.label,
        description: option.description,
      },
    };

    setAnswers(nextAnswers);
    advance(nextAnswers);
  };

  const handleOtherPress = (): void =>
    setAnswers({
      ...answers,
      [question.id]: { type: 'other', text: answer?.type === 'other' ? answer.text : '' },
    });

  const handleOtherTextChange = (text: string): void =>
    setAnswers({ ...answers, [question.id]: { type: 'other', text } });

  const handleSubmitPress = (): void => {
    if (isAnswered(answers)) {
      onSubmit(answers);
    }
  };

  const isOtherSelected = answer?.type === 'other';
  const otherText = isOtherSelected ? answer.text : '';
  // The stepper's own button is only needed when a free-form answer blocks auto-advance.
  const isSubmitShown = isOtherSelected && isLastQuestion;

  return (
    <View className='gap-10 rounded-xl bg-background-secondary px-12 py-10'>
      <View className='flex-row items-center gap-8'>
        <Icon name='message' className='size-20 shrink-0 color-brand-primary' />
        <AppText className='text-sm-sm sm:text-sm min-w-0 flex-1 font-medium text-text-primary'>
          {question.header}
        </AppText>
        {questions.length > 1 && (
          <AppText className='text-xs shrink-0 text-text-secondary'>
            {questionIndex + 1}/{questions.length}
          </AppText>
        )}
      </View>
      {!!question.question && (
        <AppText className='text-sm-sm sm:text-sm text-text-secondary'>{question.question}</AppText>
      )}
      <View className='gap-4'>
        {question.options.map((option, optionIndex) => (
          <AskUserOption
            key={`${question.id}-${optionIndex}`}
            label={option.label}
            description={option.description}
            isSelected={answer?.type === 'option' && answer.optionIndex === optionIndex}
            disabled={isResolving}
            onPress={() => handleOptionPress(optionIndex)}
          />
        ))}
        {question.allowOther && (
          <AskUserOption
            label={translate('TEXT_OTHER')}
            isSelected={isOtherSelected}
            disabled={isResolving}
            onPress={handleOtherPress}
          />
        )}
      </View>
      {isOtherSelected && (
        <AppTextInput
          value={otherText}
          onChangeText={handleOtherTextChange}
          editable={!isResolving}
          placeholder={translate('TEXT_OTHER_PLACEHOLDER')}
          className='bg-background-primary'
        />
      )}
      <View className='flex-row items-center gap-8'>
        {isOtherSelected && !isLastQuestion && (
          <AppButton
            text={translate('BUTTON_NEXT')}
            size='sm'
            className='px-16'
            disabled={isResolving || !otherText.trim()}
            onPress={() => setQuestionIndex(questionIndex + 1)}
          />
        )}
        {isSubmitShown && (
          <AppButton
            text={translate('BUTTON_SUBMIT')}
            size='sm'
            className='px-16'
            isLoading={isResolving}
            disabled={isResolving || !isAnswered(answers)}
            onPress={handleSubmitPress}
          />
        )}
        <AppButton
          text={translate('BUTTON_DENY')}
          size='sm'
          variant='ghost'
          disabled={isResolving}
          onPress={onDenyPress}
        />
      </View>
    </View>
  );
}
