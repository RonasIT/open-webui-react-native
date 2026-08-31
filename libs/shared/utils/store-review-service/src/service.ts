import { storeUrl, hasAction, requestReview } from 'expo-store-review';
import { Linking, Platform } from 'react-native';

class StoreReviewService {
  public async openStoreReview(): Promise<void> {
    const isAndroid = Platform.OS === 'android';
    const url = storeUrl();

    const canOpenUrl = url && (await Linking.canOpenURL(url));

    if (canOpenUrl) {
      await Linking.openURL(`${url}${isAndroid ? '&showAllReviews=true' : `?action=write-review`}`);
    }
  }

  public async requestStoreReview(): Promise<boolean> {
    const isAvailable = await hasAction();

    if (isAvailable) {
      await requestReview();

      return true;
    } else {
      return false;
    }
  }
}

export const storeReviewService = new StoreReviewService();
