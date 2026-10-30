import { ReasoningData } from '@open-webui-react-native/shared/utils/strings';

const SECONDS_IN_MINUTE = 60;
const SECONDS_IN_HOUR = 3600;

export interface ReasoningLabel {
  key: string;
  count?: number;
}

// NOTE: Same wording as the web client.
export const getReasoningLabel = ({ isDone, duration }: Pick<ReasoningData, 'isDone' | 'duration'>): ReasoningLabel => {
  if (!isDone) {
    return { key: 'TEXT_THINKING' };
  }

  if (duration == null) {
    return { key: 'TEXT_THOUGHT' };
  }

  if (duration < 1) {
    return { key: 'TEXT_THOUGHT_FOR_LESS_THAN_SECOND' };
  }

  // NOTE: Rounded before picking the unit, so 59.6 s reads as a minute rather than "60 seconds".
  const seconds = Math.round(duration);

  if (seconds < SECONDS_IN_MINUTE) {
    return { key: 'TEXT_THOUGHT_FOR_SECONDS', count: seconds };
  }

  const minutes = Math.round(seconds / SECONDS_IN_MINUTE);

  if (minutes * SECONDS_IN_MINUTE < SECONDS_IN_HOUR) {
    return { key: 'TEXT_THOUGHT_FOR_MINUTES', count: minutes };
  }

  return { key: 'TEXT_THOUGHT_FOR_HOURS', count: Math.round(seconds / SECONDS_IN_HOUR) };
};
