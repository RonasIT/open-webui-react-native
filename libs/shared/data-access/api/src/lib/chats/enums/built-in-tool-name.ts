// NOTE: Tools Open WebUI ships itself and the client has to treat specially. `ask_user` pauses the
// turn like any other call, but carries questions in its arguments and expects answers — the
// backend rejects `approve` for it with 400 (see `open_webui/utils/ask_user.py`).
export enum BuiltInToolName {
  ASK_USER = 'ask_user',
}
