# shared/data-access/nitro-api-client

Independent HTTP client on top of [react-native-nitro-fetch](https://github.com/margelo/react-native-nitro-fetch),
an analog of `@ronas-it/axios-api-client`. Knows nothing about the app: auth, toasts and other
reactions are plugged in through interceptors (see `shared/data-access/api-service` for the app wiring).

## Exports

- `NitroApiService` — `get/post/put/patch/delete<T>(endpoint, data?, options?)` returning response data,
  plus `useInterceptors({ request, response, error })`:
  - `request` interceptors modify the outgoing `ApiRequest` (method, endpoint, headers, params, body);
  - `response` interceptors transform a successful `ApiResponse` before it is returned to the caller;
  - `error` interceptors react to failures (error responses and network errors) before the error is thrown.
- `tokenInterceptor({ getToken })` — adds `Authorization: Bearer <token>` from any token source.
- `unauthorizedInterceptor({ publicEndpoints, onError })` — reacts to 401 outside public endpoints.
- `ApiError` — axios-like error shape: `message`, `request`, `response?.status/data`.

## Notes

- For GET/DELETE the second argument is query params; for POST/PUT/PATCH it is the JSON body.
- `FormData` bodies (including React Native file parts `{ uri, type, name }`) are uploaded natively
  by nitro-fetch, which also sets the multipart boundary.
- The constructor is `(baseUrl, config?)` where `config` is `{ logger?, credentials? }`.
- Cookies are sent by default (`credentials: 'include'`). Change globally with
  `new NitroApiService(url, { credentials: 'omit' })`, or per request via the `credentials` option
  (`RequestCredentials`: `'include' | 'omit' | 'same-origin'`; `'omit'` skips the native cookie jar).
