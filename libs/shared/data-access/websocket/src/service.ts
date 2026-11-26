import { i18n } from '@ronas-it/react-native-common-modules/i18n';
import { isEqual } from 'lodash-es';
import { io, Socket } from 'socket.io-client';

import { checkSession, getApiService, getRequestHeaders } from '@open-webui-react-native/shared/data-access/api-client';
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
  private _heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private _isSessionChecked = false;

  public init(token: string, onConnect: () => void, onDisconnect: () => void): void {
    if (this._socket) return;

    this._socket = io(getApiUrl(), {
      path: webSocketConfig.path,
      transports: webSocketConfig.transports,
      tryAllTransports: webSocketConfig.tryAllTransports,
      auth: { token },
      extraHeaders: this.getHeaders(),
    });

    this._socket.on(SocketState.CONNECT, () => {
      if (this._socket?.id) {
        this._socketSessionId = this._socket.id;
        this._isSessionChecked = false;
        this.startHeartbeat();
        onConnect();
      }
    });

    this._socket.on(SocketState.DISCONNECT, () => {
      this._socketSessionId = '';
      this.stopHeartbeat();
      onDisconnect();
    });

    this._socket.on(SocketState.CONNECT_ERROR, () => {
      ToastService.showError(i18n.t('SHARED.SOCKET_SERVICE.TEXT_CONNECTION_ERROR'));
      this.checkSessionOnce();
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

  // NOTE: Headers are taken at connect time. A live connection keeps streaming as it is and takes them on its next
  // connect; a failing one connects again at once. The same socket keeps its event listeners.
  public reconnectWithNewHeaders(): void {
    const headers = this.getHeaders();

    if (!this._socket || isEqual(this._socket.io.opts.extraHeaders, headers)) {
      return;
    }

    this._socket.io.opts.extraHeaders = headers;
    this._isSessionChecked = false;

    if (!this._socket.connected) {
      this._socket.disconnect().connect();
    }
  }

  public disconnect(): void {
    this.stopHeartbeat();
    this._socket?.disconnect();
    this._socket = null;
    this._socketSessionId = '';
    this._listeners = {};
    this._isSessionChecked = false;
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

  private getHeaders(): Record<string, string> {
    const apiUrl = getApiUrl();

    // NOTE: Workaround required for the socket to connect to the backend, which rejects WS connections without this header.
    return { Origin: apiUrl, ...getRequestHeaders(apiUrl) };
  }

  // NOTE: Only REST tells why the server refused: an expired Access pass or Open WebUI session goes through the
  // api-client's 401 handling. One request per run of failed connects, since the socket retries on its own.
  private checkSessionOnce(): void {
    if (this._isSessionChecked) {
      return;
    }

    this._isSessionChecked = true;
    // NOTE: The result is not needed: the api-client interceptors act on the response.
    void checkSession(getApiService());
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this._heartbeatTimer = setInterval(() => {
      this._socket?.emit(WebSocketEventName.HEARTBEAT, {});
    }, webSocketConfig.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this._heartbeatTimer) {
      clearInterval(this._heartbeatTimer);
      this._heartbeatTimer = null;
    }
  }
}

export const socketService = new SocketService();
