export const apiConfig = {
  auth: {
    unauthorizedRoutes: [
      'v1/auths/signin',
      'v1/auths/mfa/enroll/start',
      'v1/auths/mfa/enroll/confirm',
      'v1/auths/mfa/verify',
      'v1/auths/mfa/recover',
      'v1/auths/signout',
    ],
  },
  initRequestTimeout: 15 * 1000,
};
