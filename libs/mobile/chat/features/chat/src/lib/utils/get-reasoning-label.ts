import { ReasoningData } from './parse-response-message-content';

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

  if (duration < SECONDS_IN_MINUTE) {
    return { key: 'TEXT_THOUGHT_FOR_SECONDS', count: Math.round(duration) };
  }

  if (duration < SECONDS_IN_HOUR) {
    return { key: 'TEXT_THOUGHT_FOR_MINUTES', count: Math.round(duration / SECONDS_IN_MINUTE) };
  }

  return { key: 'TEXT_THOUGHT_FOR_HOURS', count: Math.round(duration / SECONDS_IN_HOUR) };
};
