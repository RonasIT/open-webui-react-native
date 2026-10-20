export const mfaApiConfig = {
  route: 'v1/auths/mfa',
  startEnrollmentQueryKey: (challengeToken: string): Array<string> => ['mfa', 'enrollment', challengeToken],
};
