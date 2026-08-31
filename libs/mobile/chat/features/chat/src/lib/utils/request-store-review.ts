import { appStorageService } from '@open-webui-react-native/shared/data-access/storage';
import { storeReviewService } from '@open-webui-react-native/shared/utils/store-review-service';

export const requestStoreReview = async (chatId: string): Promise<void> => {
  const createdChatsIdsString = appStorageService.createdChatsIds.get();
  const isRateAppReviewed = appStorageService.isRateAppReviewed.get();

  if (isRateAppReviewed === 'true') {
    return;
  }

  const createdChatsIds = createdChatsIdsString ? createdChatsIdsString.split(',') : [];

  if (createdChatsIds.length >= 2) {
    const isReviewRequested = await storeReviewService.requestStoreReview();

    if (isReviewRequested) {
      appStorageService.isRateAppReviewed.set('true');
    }

    return;
  }

  if (!createdChatsIds.includes(chatId)) {
    // If amount of created chats is less than 2, we just add the current chatId to the list of created chats
    appStorageService.createdChatsIds.set(`${createdChatsIds.length ? createdChatsIds + ',' : ''}` + chatId);
  }
};
