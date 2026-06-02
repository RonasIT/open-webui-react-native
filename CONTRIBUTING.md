# Contributing to Open MobileUI

Thanks for your interest in improving Open MobileUI! Bug fixes, new features, documentation, UI/UX polish, performance work, and translations are all welcome.

## Ways to contribute

- 🐛 **Bug fixes** — help us squash bugs and improve stability
- ✨ **Features** — propose and build new functionality
- 📝 **Documentation** — improve docs, add examples, fix typos
- 🎨 **UI/UX** — refine the mobile experience
- ⚡ **Performance** — optimize rendering and app responsiveness
- 🌍 **Internationalization** — add translations for new languages

## Reporting issues

Before opening an issue, please [search existing issues](https://github.com/RonasIT/open-webui-react-native/issues) to avoid duplicates.

When [filing a new issue](https://github.com/RonasIT/open-webui-react-native/issues/new/choose), pick the template that fits:

- 🐛 **Bug report** — for something that's broken. Fill in what happened vs. what you expected, precise steps to reproduce, the app + Open WebUI versions, your device + OS, and screenshots where relevant.
- ✨ **Feature request** — for new functionality. Describe the use case and the problem it solves, not just the proposed solution.

## Development setup

### Prerequisites

- **Node.js** 18+ and npm
- **iOS:** Xcode 14+ (macOS only)
- **Android:** Android Studio with the Android SDK

### Clone and install

```bash
git clone https://github.com/RonasIT/open-webui-react-native.git
cd open-webui-react-native
npm install
```

### Run the app

```bash
# Start the Metro bundler (development env)
npx nx start mobile

# Or run directly on a device/emulator (from apps/mobile)
npm run android
npm run ios
```

Running on a device/emulator requires a **development build**. Follow the
[Expo development builds guide](https://docs.expo.dev/develop/development-builds/create-a-build/)
to create one (a one-time setup), then start the bundler as above.

### Configure your own Expo project (for builds)

To create your own builds you'll need an Expo project of your own:

1. Create an account at [expo.dev](https://expo.dev/) and a new project.
2. Note your project `slug`, `owner`, and `project ID`.
3. Provide your project details via environment variables / app config used by
   [`apps/mobile/app.config.ts`](apps/mobile/app.config.ts) (e.g. `EXPO_PUBLIC_APP_NAME`,
   `EXPO_PUBLIC_APP_SLUG`, `EXPO_PUBLIC_APP_OWNER`, `EXPO_PUBLIC_PROJECT_ID`).
4. For production builds, configure [`eas.json`](eas.json) following the
   [EAS configuration guide](https://docs.expo.dev/eas/json/).

### Common commands

```bash
npm run lint        # tsc + eslint
npm run format      # prettier + eslint --fix
npx nx test mobile  # run the mobile test suite
```

See the root [CLAUDE.md](CLAUDE.md) and `README.md` for more on the monorepo architecture and library structure.

## Submitting a pull request

1. **Fork** the repository and create a feature branch off `main`.
2. Make your changes, keeping commits focused and following the existing code style.
3. **Run `npm run lint`** and the relevant tests — make sure everything passes.
4. **Open a pull request** against `main` with a clear description of _what_ changed and _why_. Link any related issue.
5. Be ready to iterate on review feedback.

For larger changes, please open an issue to discuss the approach first — it saves everyone time.

## Helpful resources

- 📖 [Expo development builds](https://docs.expo.dev/develop/development-builds/create-a-build/)
- 📦 [EAS Build documentation](https://docs.expo.dev/build/setup/)
- ⚙️ [Expo configuration reference](https://docs.expo.dev/workflow/configuration/)
- 🏗️ [Nx documentation](https://nx.dev/getting-started/intro)

---

By contributing, you agree that your contributions will be licensed under the project's [GPL v3 license](LICENSE).
