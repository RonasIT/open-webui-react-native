import { useDictateModeConfig } from './config';

export const normalizeMetering = (metering?: number): number => {
  if (metering === undefined || metering <= useDictateModeConfig.silenceMetering) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(1, (metering - useDictateModeConfig.silenceMetering) / (0 - useDictateModeConfig.silenceMetering)),
  );
};
