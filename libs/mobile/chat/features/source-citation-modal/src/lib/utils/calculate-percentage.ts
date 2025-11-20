export const calculatePercentage = (distance: number): number => {
  if (distance < 0) return 0;
  if (distance > 1) return 100;

  return Math.round(distance * 10000) / 100;
};
