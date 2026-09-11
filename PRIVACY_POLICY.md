# Privacy Policy for Open MobileUI

Last Updated: 17 Dec 2025

## Introduction

Open MobileUI ("we," "our," or "the App") is an open-source mobile application developed by Ronas IT. The App is a client for user-provided, self-hosted Open WebUI instances. This Privacy Policy explains how information is handled when you use the App.

## Important Notice (No Developer Backend)

Open MobileUI connects directly to the Open WebUI server URL that you configure in the App. We do not operate any backend service that receives, stores, or processes your chat content.

## Information We Store Locally on Your Device

The App stores the following information locally to function:

- Server URL: the Open WebUI instance URL you enter.
- Authentication tokens: stored locally in encrypted storage to keep you signed in and to authenticate requests to your Open WebUI server.

We do not upload this information to our servers.

## Device Permissions

The App may request the following optional permissions, only when you choose to use the related features:

- Camera: to take photos for uploading.
- Photo library: to select and upload images from your device.

You can deny these permissions and still use the App’s core functionality.

## Crash and Error Reporting (Sentry)

The App uses Sentry to track crashes and application errors so we can diagnose and fix problems.

When an error occurs, Sentry receives the error/crash message and stack trace, along with diagnostic details about failed requests to your Open WebUI server: the HTTP status and method, the request path (the server’s domain/host is stripped and never sent), and the request/response body. Body content is length-truncated, and any fields that may contain conversation text (such as content, message, text, or prompt) are redacted before being sent.

We do not send your chat content, AI prompts or responses, or your Open WebUI server’s address/domain to Sentry.

## Google Sign-In (Optional)

If your Open WebUI instance is configured to support Google Sign-In, the App may initiate a Google sign-in flow. We do not receive or store your Google password. Google may process authentication-related data under Google’s policies.

## What We Do NOT Collect

We do not collect, store, or have access to (on our servers):

- Your conversations, chat messages, attachments, or AI prompts/responses
- Usage analytics or telemetry
- Location data
- Contacts or address book data
- Advertising identifiers

## Data Transmission

The App sends requests (including chat content) to the Open WebUI server you configure.

- If you use an HTTPS/WSS server URL, data is encrypted in transit.
- If you use an HTTP/WS server URL, data may not be encrypted in transit. We recommend using HTTPS/WSS.

## Data Retention

- Authentication tokens and server URL: stored locally until you log out, remove the server configuration, or uninstall the App.
- Conversation data: stored and managed by your Open WebUI server according to that server’s configuration and policies. We do not control or access server-side retention.

## Your Rights and Choices

- Delete local data: log out, remove the configured server, or uninstall the App.
- Control permissions: manage camera and photo library permissions in your device settings.
- Change server: you can change the Open WebUI server URL at any time.
- Review source code: you can review how the App handles data by inspecting the source code.

## Open Source

Open MobileUI is open-source software released under the GNU General Public License v3 (GPLv3). Source code is available at GitHub.

## Third-Party Platforms (App Stores)

Apple and Google may collect certain data independently when you download or use the App through their platforms, under their own terms and privacy policies.

## Children’s Privacy

The App is not intended for children under the age of 13. We do not knowingly collect personal information from children.

## Changes to This Privacy Policy

We may update this Privacy Policy from time to time. We will update the “Last Updated” date above. Continued use of the App after changes means you accept the updated Policy.

## Contact Information

If you have questions about this Privacy Policy, contact Ronas IT:

- Website: [https://ronasit.com](https://ronasit.com)
- Email: [hello@ronasit.com](mailto:hello@ronasit.com)

## Your Open WebUI Server

Your Open WebUI instance is operated by you or your organization and may have its own privacy policy and data handling practices. Please review your server’s policies to understand how your data is handled on the server side.

## Relationship to Open WebUI

Open MobileUI is an independent, third-party client application and is not affiliated with Open WebUI Inc.
Open WebUI is a product of Timothy Jaeryang Baek (Open WebUI Inc.).

## Compliance

We aim to comply with applicable privacy laws, including GDPR and CCPA, where they apply.
