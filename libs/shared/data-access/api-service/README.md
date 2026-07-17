# shared/data-access/api-service

App-configured HTTP client: wires the `shared/data-access/nitro-api-client` core with the app
token storage, auth state and toasts. Drop-in replacement for the old `shared/data-access/api-client` (axios).

## Usage

```ts
import { getApiService } from '@open-webui-react-native/shared/data-access/api-service';

// GET/DELETE: the second argument is query params
const chats = await getApiService().get<Array<ChatListItem>>('v1/chats/', { page: 1 });

// POST/PUT/PATCH: the second argument is the JSON body (FormData is also supported)
const chat = await getApiService().post<ChatResponse>('v1/chats/new', request);

// A custom base URL creates (and caches) a separate service instance
const config = await getApiService('https://example.com/api/').get('v1/configuration');
```

## Behavior (same as the old axios client)

- `Authorization: Bearer <token>` header is added when a token exists in `appStorageService`.
- `401` outside of `apiConfig.auth.unauthorizedRoutes` → sets `authState$.isUnauthorized` and shows the "session expired" toast.
- `404` on the GET profile request (`v1/auths/`) → sets `authState$.isUnauthorized`.
- Any other error response shows a toast with a message from the response `detail` or a generic i18n message.
  Pass `{ skipToast: true }` in query params to suppress it. Network errors never show a toast.
