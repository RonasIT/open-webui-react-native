import Constants from 'expo-constants';

export const authApiConfig = {
  route: 'v1/auths',
  googleSignInRoute: Constants.expoConfig?.extra?.googleSignInRoute,
  getProfileQueryKey: ['profile'],
  signOutQueryKey: ['sign-out'],
};
