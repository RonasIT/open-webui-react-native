# Open Web Ui - Mobile app

React Native mobile app for Android and iOS.

## Scripts overview

See `package.json` for pre-defined scripts.\
You can run them using `npm run {script} -- {arguments}` or `yarn {script} {arguments}`:

- `start` - Start local development server
- `build:{environment}` - Create builds for _both_ platforms
  - Pass `-p {android|ios}` to run a platform-specific build
  - To create a [Development client](https://docs.expo.dev/develop/development-builds/introduction/) build run `build:debug`
- `submit:ios:{environment}` - Submit iOS build to AppStore Connect
- `update:{environment}` - Publish OTA-update for specified environment

## Development

This app uses [Expo development builds](https://docs.expo.dev/develop/development-builds/introduction/)
for local development.

### Run on a virtual device

- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/): `npm run android`
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/) (macOS is required): `npm run ios`

### Run on a physical device

1. Find the latest `debug`-profile build for your platform in Expo project or run `build:debug` script to create a new one.
1. Download the build artifact and install it on your device.
1. Run the `start` script to launch a local development server.
1. Connect to the server using dev-client you installed.

**Note**: For iOS you need to register your device first as [described](https://docs.expo.dev/build/internal-distribution/#setting-up-ad-hoc-provisioning).\
After that [resign](https://docs.expo.dev/app-signing/app-credentials/#re-signing-new-credentials) existing build or a create new one. This is required only once.

## Releases

### 1. Prepare

1. Increment `ios.buildNumber` and `android.versionCode` values and update `version` (if necessary) in `app.config.ts`
1. Commit the changes with version `v{version}-{buildNumber}`, for example: `chore: release v1.2.2-12`
1. Create or update version tag: `git tag v1.2.2-12`
1. Push changes: `git push && git push --tags`
1. Create new release in [Releases](../../../../-/releases) based on tag you pushed

### 2. Build

Create builds using [EAS Build](https://docs.expo.dev/build/introduction/):

- `build:debug` - build [dev-client](https://docs.expo.dev/develop/development-builds/create-a-build/) for local development
- `build:internal` - build development version for [internal distribution](https://docs.expo.dev/tutorial/eas/internal-distribution-builds/) (APK/Ad-Hoc build)
- `build:dev` - build development version for internal testing (AAB/IPA build)
- `build:prod` - build production version for stores (AAB/IPA build)

**Tip**: you can [create builds locally](https://docs.expo.dev/build-reference/local-builds/) by passing `--local` flag when starting build command.

### 3. Distribute

#### Internal

Create an internal or debug build and share the build file within your team.

#### Stores

Created builds can be submitted to stores using [EAS Submit](https://docs.expo.dev/submit/introduction/):

- `submit:dev` - select and submit development build for internal testing in App Store/Google Play. Build will be distributed automatically for all testers.
- `submit:prod` - select and submit production build to App Store/Google Play. After that you can publish the release manually.

**Tip**: you can skip this step by passing the `--auto-submit` flag when creating builds.
This will automatically send created builds to App Store/Google Play. Example:

- `build:dev --auto-submit` - build development version and submit for internal testing in App Store/Google Play.
- `build:prod --auto-submit` - build production version and submit to App Store/Google Play. Release should be published manually.

**Note**: initial setup is required for [Android](https://docs.expo.dev/submit/android/) and [iOS](https://docs.expo.dev/submit/ios)

### OTA updates

Minor fixes can be distributed over-the-air using [EAS Update](https://docs.expo.dev/eas-update/introduction/):

1. Update `version` in `app.config.ts`
2. Commit the changes
3. Publish OTA-update for desired environment: `update:dev` or `update:prod`
