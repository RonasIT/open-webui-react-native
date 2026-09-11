import { storeReviewConfig } from '../config';

// Progression: 1 -> 3 -> 6 weeks after the first trigger, then +6 weeks forever.
export const getNextOffsetWeeks = (currentOffsetWeeks: number): number => {
  const currentIndex = storeReviewConfig.initialIntervalsWeeks.indexOf(currentOffsetWeeks);

  if (currentIndex !== -1 && currentIndex < storeReviewConfig.initialIntervalsWeeks.length - 1) {
    return storeReviewConfig.initialIntervalsWeeks[currentIndex + 1];
  }

  return currentOffsetWeeks + storeReviewConfig.repeatingIntervalsWeeks;
};
