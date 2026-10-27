# E2E tests (Maestro)

## Structure

- `flows/<NN-area>/` — tests, one folder per app area (`01-auth`, `02-chat`, ...), kebab-case file names. Only these run as tests.
- `subflows/` — reusable steps without own assertions, called via `runFlow`:
  - `launch-clean.yaml` — launch with cleared state.
  - `launch-signed-in.yaml` — launch and sign in only if there is no session, ends on the new chat screen.
  - `sign-in.yaml` — sign in from the sign-in screen.
- `scripts/` — JS helpers for `runScript` / `evalScript`.
- `assets/` — files used by tests (images, documents).
- `config.yaml` — workspace config: which flows run and which tags are excluded.

`subflows/`, `scripts/` and `config.yaml` are shared by all flows: run the whole suite after changing them.

A new flow starts from a copy of `flows/01-auth/sign-in.yaml`: change `name` and drop the `smoke` tag unless the flow is a critical path. For a signed-in user call `launch-signed-in` instead of the launch and sign-in steps:

```yaml
appId: ${APP_ID}
name: <What the flow checks>
---
- runFlow: ../../subflows/launch-signed-in.yaml
- tapOn:
    id: <screen>-<element>
- assertVisible:
    id: <screen>-<element>
```

## Conventions

- testID: `<screen>-<element>` in kebab-case, e.g. `sign-in-email`, `chat-create`. Select elements by `id`, not by text.
- Tags: `smoke` — critical path; `wip` — not finished; `flaky` — unstable. `wip` and `flaky` are excluded from runs.
- Test data created by flows is named `e2e-<area>-<timestamp>`, e.g. `e2e-chat-1760000000000`.
- Values come from the environment, never hardcoded: `APP_ID`, `EMAIL`, `PASSWORD`, `API_URL` (optional, empty means `https://ai.ronas.online`).
- CI takes them from `vars.EXPO_PUBLIC_APP_ID`, `vars.E2E_API_URL`, `secrets.E2E_EMAIL`, `secrets.E2E_PASSWORD` and `secrets.E2E_ARTIFACT_PASSWORD`.

## Run locally

1. Install Maestro: https://docs.maestro.dev/maestro-cli (CI uses `MAESTRO_VERSION=2.11.0`).
2. Install a release build on a running emulator or simulator, the same as CI: a dev client build needs a running Metro server. `EXPO_PUBLIC_APP_ENV=development` turns on development-only feature flags, as in CI.

   ```sh
   cd apps/mobile
   EXPO_PUBLIC_APP_ENV=development npx expo run:android --variant release
   ```

3. Run all flows from the repository root:

   ```sh
   maestro test -e APP_ID='<app id>' -e EMAIL='<email>' -e PASSWORD='<password>' .maestro
   ```

   A single flow: `maestro test -e ... .maestro/flows/01-auth/sign-in.yaml`.

   Values are in single quotes, so a value containing `'` has to be escaped as `'\''`.

## CI report

The report is uploaded as the `maestro-report` artifact with an encrypted `maestro-output.7z` inside, the password is `E2E_ARTIFACT_PASSWORD`, ask the team. Open it with Keka or The Unarchiver, or `brew install sevenzip` and `7zz x maestro-output.7z`.
