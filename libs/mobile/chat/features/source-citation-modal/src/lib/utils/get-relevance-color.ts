export const getRelevanceColor = (percentage: number): string => {
  if (percentage >= 80) return 'bg-status-success-light text-status-success';
  if (percentage >= 60) return 'bg-status-warning-light text-status-warning';
  if (percentage >= 40) return 'bg-status-warning-orange-light text-status-warning-orange';

  return 'bg-status-error-light text-status-error';
};
