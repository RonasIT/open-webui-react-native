import { Observable, observable } from '@legendapp/state';

interface WebSocketState {
  isSocketConnected: boolean;
}

export const webSocketState$: Observable<WebSocketState> = observable<WebSocketState>({
  isSocketConnected: false,
});
