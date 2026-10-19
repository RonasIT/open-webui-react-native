export const isMfaOrPendingApprovalUrl = (url: string): boolean => /[?&](mfa|pending)=1/.test(url);
