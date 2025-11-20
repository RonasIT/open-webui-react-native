export const queryClientConfig = {
  // NOTE: Must be same of higher then persistStorageConfig.maxAge
  gcTime: 1000 * 60 * 60 * 48, // 48h
  refetchOnMountTimeout: 5 * 60 * 1000, // 5m
};
