import { appStorageService } from '@open-webui-react-native/shared/data-access/storage';
import { storeReviewService } from '@open-webui-react-native/shared/utils/store-review-service';
import { storeReviewConfig } from '../config';
import { getNextOffsetWeeks } from './get-next-offset-weeks';

const { weekInMs, initialIntervalsWeeks } = storeReviewConfig;

export const requestStoreReview = async (chatId: string): Promise<void> => {
  const date = Date.now();
  const firstTriggeredAt = Number(appStorageService.storeReviewFirstTriggeredAt.get());

  // First time triggering the store review request
  if (!firstTriggeredAt) {
    const createdChatsIdsString = appStorageService.createdChatsIds.get();
    const createdChatsIds = createdChatsIdsString ? createdChatsIdsString.split(',') : [];

    if (createdChatsIds.length < 2) {
      if (!createdChatsIds.includes(chatId)) {
        // If amount of created chats is less than 2, we just add the current chatId to the list of created chats
        appStorageService.createdChatsIds.set(`${createdChatsIds.length ? createdChatsIds + ',' : ''}` + chatId);
      }

      return;
    }

    await storeReviewService.requestStoreReview();

    appStorageService.storeReviewFirstTriggeredAt.set(String(date));
    appStorageService.storeReviewNextAttemptAt.set(String(date + initialIntervalsWeeks[0] * weekInMs));

    return;
  }

  const nextAttemptAt = Number(appStorageService.storeReviewNextAttemptAt.get()) || firstTriggeredAt;

  if (date < nextAttemptAt) {
    return;
  }

  await storeReviewService.requestStoreReview();

  const currentOffsetWeeks = Math.round((nextAttemptAt - firstTriggeredAt) / weekInMs);
  const nextOffsetWeeks = getNextOffsetWeeks(currentOffsetWeeks);

  appStorageService.storeReviewNextAttemptAt.set(String(firstTriggeredAt + nextOffsetWeeks * weekInMs));
};
