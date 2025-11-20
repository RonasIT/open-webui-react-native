import { createContext, useContext } from 'react';

export interface VoiceModeModalContextMethods {
  present: ({ chatId, modelId }: { chatId?: string; modelId: string }) => Promise<void>;
  close: () => Promise<void>;
}

export const VoiceModeModalContext = createContext<VoiceModeModalContextMethods | null>(null);

export const useVoiceModeModal = (): VoiceModeModalContextMethods => {
  const context = useContext(VoiceModeModalContext);

  if (!context) {
    throw new Error('useVoiceModeModal must be used within ChatLayout');
  }

  return context;
};
