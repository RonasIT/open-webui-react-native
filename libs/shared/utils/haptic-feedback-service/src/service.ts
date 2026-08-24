import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

class HapticFeedbackService {
  private isEnabled = true;

  public setEnabled(isEnabled: boolean): void {
    this.isEnabled = isEnabled;
  }

  public async trigger(): Promise<void> {
    if (!this.isEnabled) {
      return;
    }

    await (Platform.OS === 'ios'
      ? Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      : Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Long_Press));
  }
}

export const hapticFeedbackService = new HapticFeedbackService();
