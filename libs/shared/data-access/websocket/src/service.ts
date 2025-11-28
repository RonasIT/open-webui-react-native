import { i18n } from '@ronas-it/react-native-common-modules/i18n';
import { io, Socket } from 'socket.io-client';
import { getApiUrl } from '@open-webui-react-native/shared/utils/config';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';
import { webSocketConfig } from './config';
import { SocketState, WebSocketEventName } from './enums';

type SocketEventListener = {
  queryKey: string;
  callback: (...args: Array<any>) => void;
};

export class SocketService {
  private _socket: Socket | null = null;
  private _listeners: Record<string, Array<SocketEventListener>> = {};
  private _socketSessionId = '';

  public init(token: string, onConnect: () => void, onDisconnect: () => void): void {
    if (this._socket) return;

    this._socket = io(getApiUrl(), {
      path: webSocketConfig.path,
      transports: webSocketConfig.transports,
      auth: { token },
    });

    this._socket.on(SocketState.CONNECT, () => {
      if (this._socket?.id) {
        this._socketSessionId = this._socket.id;
        onConnect();
      }
    });

    this._socket.on(SocketState.DISCONNECT, () => {
      this._socketSessionId = '';
      onDisconnect();
    });

    this._socket.on(SocketState.CONNECT_ERROR, () => {
      ToastService.showError(i18n.t('SHARED.SOCKET_SERVICE.TEXT_CONNECTION_ERROR'));
    });

    this._socket.on(SocketState.RECONNECT, () => {
      onConnect();

      for (const [event, listeners] of Object.entries(this._listeners)) {
        listeners.forEach((listener) => {
          this._socket?.on(event, listener.callback);
        });
      }
    });
  }

  public disconnect(): void {
    this._socket?.disconnect();
    this._socket = null;
    this._socketSessionId = '';
    this._listeners = {};
  }

  public subscribeToEvent(event: WebSocketEventName, listener: SocketEventListener): void {
    if (!this._listeners[event]) {
      this._listeners[event] = [];
    }

    if (this._listeners[event].some((item) => item.queryKey === listener.queryKey)) {
      // If the listener already exists, do not add it again
      return;
    }

    this._listeners[event].push(listener);
    this._socket?.on(event, listener.callback);
  }

  public unsubscribeFromEvent(event: WebSocketEventName, listener: SocketEventListener): void {
    if (!this._listeners[event]) return;

    this._listeners[event] = this._listeners[event].filter((item) => item.queryKey !== listener.queryKey);
    this._socket?.off(event, listener.callback);
  }

  public get socketSessionId(): string {
    return this._socketSessionId;
  }
}

export const socketService = new SocketService();
