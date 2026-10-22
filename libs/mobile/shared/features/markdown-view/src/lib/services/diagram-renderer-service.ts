import { DiagramLanguage } from '../enums';

export interface DiagramRenderRequest {
  type: 'render';
  id: string;
  language: DiagramLanguage;
  code: string;
  isDarkTheme: boolean;
}

// NOTE: Draws an already rendered SVG to a PNG (base64) for the fullscreen image viewer.
export interface DiagramRasterizeRequest {
  type: 'rasterize';
  id: string;
  svg: string;
  width: number;
  height: number;
  background: string;
}

export type DiagramRequest = DiagramRenderRequest | DiagramRasterizeRequest;

export type DiagramRenderResult = { svg: string; width: number; height: number } | { error: string };

type DiagramReply = DiagramRenderResult | { png: string };

// NOTE: A diagram that kills the WebView process (e.g. OOM) would otherwise be resent after every reload forever.
const MAX_RENDER_ATTEMPTS = 2;

type DiagramRendererMessage = { type: 'ready' } | ({ type: 'result'; id: string } & DiagramReply);

interface PendingRequest {
  request: DiagramRequest;
  attempts: number;
  complete: (reply: DiagramReply) => void;
}

const getReplyError = (reply: DiagramReply): string => ('error' in reply ? reply.error : 'Unexpected renderer reply');

/**
 * Queue and in-memory cache between diagram blocks and the hidden diagram WebView (`DiagramRenderer`).
 * Results are cached by language + theme + code, so recycled or re-rendered cells do not render twice.
 */
export class DiagramRendererService {
  // ponytail: unbounded cache for the app session, add an LRU limit if long sessions grow memory noticeably.
  private results = new Map<string, DiagramRenderResult>();
  private pendingRequests = new Map<string, PendingRequest>();
  private requestedKeys = new Set<string>();
  private listeners = new Set<() => void>();
  private send: ((request: DiagramRequest) => void) | null = null;
  private isReady = false;
  private isRendererNeeded = false;
  private nextRequestId = 0;

  public subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);

    return () => this.listeners.delete(listener);
  };

  public getIsRendererNeeded = (): boolean => this.isRendererNeeded;

  public getResult = (key: string): DiagramRenderResult | undefined => this.results.get(key);

  public getKey(language: DiagramLanguage, code: string, isDarkTheme: boolean): string {
    return `${language}:${isDarkTheme ? 'dark' : 'light'}:${code}`;
  }

  public requestRender(language: DiagramLanguage, code: string, isDarkTheme: boolean): void {
    const key = this.getKey(language, code, isDarkTheme);

    if (this.results.has(key) || this.requestedKeys.has(key)) {
      return;
    }

    this.requestedKeys.add(key);
    this.enqueue({ type: 'render', id: this.createRequestId(), language, code, isDarkTheme }, (reply) => {
      this.results.set(
        key,
        'svg' in reply ? { svg: reply.svg, width: reply.width, height: reply.height } : { error: getReplyError(reply) },
      );
      this.requestedKeys.delete(key);
      this.notify();
    });
  }

  /**
   * Rasterizes a rendered diagram (from the cache, nothing is re-rendered) to a base64 PNG on a solid background.
   */
  public rasterize(key: string, background: string): Promise<string> {
    const result = this.results.get(key);

    if (!result || 'error' in result) {
      return Promise.reject(new Error('Diagram is not rendered'));
    }

    return new Promise((resolve, reject) => {
      this.enqueue({ type: 'rasterize', id: this.createRequestId(), ...result, background }, (reply) =>
        'png' in reply ? resolve(reply.png) : reject(new Error(getReplyError(reply))),
      );
    });
  }

  public setSender(send: ((request: DiagramRequest) => void) | null): void {
    this.send = send;

    if (!send) {
      this.isReady = false;
    }
    this.flush();
  }

  // NOTE: Called when the WebView content process is gone, unanswered requests are resent after the remount
  // until they reach MAX_RENDER_ATTEMPTS, then they fail and fall back to the code block.
  public handleRendererReset(): void {
    this.isReady = false;

    this.pendingRequests.forEach((pending, id) => {
      pending.attempts++;

      if (pending.attempts >= MAX_RENDER_ATTEMPTS) {
        this.resolve(id, { error: 'Diagram renderer process was terminated' });
      }
    });
  }

  public handleMessage(data: string): void {
    let message: DiagramRendererMessage;

    try {
      message = JSON.parse(data);
    } catch {
      return;
    }

    if (message.type === 'ready') {
      this.isReady = true;
      this.flush();

      return;
    }

    this.resolve(message.id, message);
  }

  private createRequestId(): string {
    return `diagram${this.nextRequestId++}`;
  }

  private enqueue(request: DiagramRequest, complete: PendingRequest['complete']): void {
    this.pendingRequests.set(request.id, { request, attempts: 0, complete });

    if (this.isReady) {
      this.send?.(request);
    }

    if (!this.isRendererNeeded) {
      this.isRendererNeeded = true;
      this.notify();
    }
  }

  private resolve(id: string, reply: DiagramReply): void {
    const pending = this.pendingRequests.get(id);

    if (!pending) {
      return;
    }

    this.pendingRequests.delete(id);
    pending.complete(reply);
  }

  private flush(): void {
    if (!this.isReady || !this.send) {
      return;
    }

    this.pendingRequests.forEach(({ request }) => this.send?.(request));
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }
}

export const diagramRendererService = new DiagramRendererService();
