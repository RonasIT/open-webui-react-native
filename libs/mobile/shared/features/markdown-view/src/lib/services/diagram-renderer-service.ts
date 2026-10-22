import { DiagramLanguage } from '../enums';
import { RenderedDiagram } from '../types';
import { renderVega } from '../utils';

// NOTE: Only mermaid is rendered in the WebView.
export interface DiagramRenderRequest {
  type: 'render';
  id: string;
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

export type DiagramRenderResult = RenderedDiagram | { error: string };

// NOTE: Transient errors (timeout, terminated renderer) are not cached, a later mount of the block retries the render.
type DiagramReply = DiagramRenderResult | { error: string; isTransient: true } | { png: string };

// NOTE: A diagram that kills the WebView process (e.g. OOM) would otherwise be resent after every reload forever.
const MAX_RENDER_ATTEMPTS = 2;
// NOTE: A WebView killed while loading (e.g. OOM on a weak device) would otherwise be remounted forever.
const MAX_RESETS_WITHOUT_READY = 3;
const MAX_CACHED_RESULTS = 100;
// NOTE: Cannot interrupt synchronous vega work, it only unblocks the in-process queue after a render that never settles.
const IN_PROCESS_RENDER_TIMEOUT_MS = 10000;

type DiagramRendererMessage = { type: 'ready' } | ({ type: 'result'; id: string } & DiagramReply);

interface PendingRequest {
  request: DiagramRequest;
  attempts: number;
  complete: (reply: DiagramReply) => void;
}

const getReplyError = (reply: DiagramReply): string => ('error' in reply ? reply.error : 'Unexpected renderer reply');

const rendererTerminatedReply: DiagramReply = { error: 'Diagram renderer process was terminated', isTransient: true };

/**
 * Render queue and in-memory cache for diagram blocks. Vega / Vega-Lite charts render in the app JS runtime,
 * mermaid diagrams and rasterization go to the hidden diagram WebView (`DiagramRenderer`).
 * Results are cached by language + theme + code, so recycled or re-rendered cells do not render twice.
 */
export class DiagramRendererService {
  // ponytail: FIFO eviction, a block still mounted when its entry is evicted falls back to code; switch to LRU if seen.
  private results = new Map<string, DiagramRenderResult>();
  private pendingRequests = new Map<string, PendingRequest>();
  private requestedKeys = new Set<string>();
  private listeners = new Set<() => void>();
  private send: ((request: DiagramRequest) => void) | null = null;
  private isReady = false;
  private isRendererNeeded = false;
  private resetsWithoutReady = 0;
  private nextRequestId = 0;
  private inProcessQueue = Promise.resolve();

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

    if (language !== DiagramLanguage.MERMAID) {
      this.renderInProcess(key, language, code, isDarkTheme);

      return;
    }

    this.enqueue({ type: 'render', id: this.createRequestId(), code, isDarkTheme }, (reply) => {
      this.requestedKeys.delete(key);

      if ('isTransient' in reply) {
        return;
      }

      this.storeResult(key, 'svg' in reply ? reply : { error: getReplyError(reply) });
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

  // NOTE: Called when the WebView content process is gone, unanswered requests are resent after the remount.
  // The WebView handles requests one at a time in send order, so only the oldest pending one was being processed:
  // it alone gets an attempt counted and fails (falls back to the code block) on reaching MAX_RENDER_ATTEMPTS.
  // A renderer that keeps dying before "ready" fails every pending request and is unmounted until the next request.
  public handleRendererReset(): void {
    const [inFlight] = this.isReady ? this.pendingRequests.entries() : [];
    this.isReady = false;
    this.resetsWithoutReady++;

    if (this.resetsWithoutReady >= MAX_RESETS_WITHOUT_READY) {
      this.resetsWithoutReady = 0;
      this.isRendererNeeded = false;
      this.pendingRequests.forEach((_, id) => this.resolve(id, rendererTerminatedReply));
      this.notify();

      return;
    }

    if (!inFlight) {
      return;
    }

    const [id, pending] = inFlight;
    pending.attempts++;

    if (pending.attempts >= MAX_RENDER_ATTEMPTS) {
      this.resolve(id, rendererTerminatedReply);
    }
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
      this.resetsWithoutReady = 0;
      this.flush();

      return;
    }

    // NOTE: The page reloads after a transient (timeout) reply, requests are sent again on its "ready".
    if ('isTransient' in message) {
      this.isReady = false;
    }

    this.resolve(message.id, message);
  }

  // NOTE: Vega needs no DOM, so charts render in the app JS runtime and only mermaid goes to the WebView.
  // Charts render one at a time and yield to the event loop before each one, so a message with many charts
  // does not block the UI in one long task.
  // A failing link (e.g. a throwing subscriber) is caught, so it never stalls the following renders.
  private renderInProcess(key: string, language: DiagramLanguage, code: string, isDarkTheme: boolean): void {
    this.inProcessQueue = this.inProcessQueue
      .then(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
        const result = await this.renderVegaWithTimeout(language, code, isDarkTheme);
        this.requestedKeys.delete(key);

        // NOTE: A timeout is transient and not cached, a later mount of the block retries the render.
        if (result) {
          this.storeResult(key, result);
        }
      })
      .catch(() => undefined);
  }

  private async renderVegaWithTimeout(
    language: DiagramLanguage,
    code: string,
    isDarkTheme: boolean,
  ): Promise<DiagramRenderResult | null> {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<null>((resolve) => {
      timeoutId = setTimeout(() => resolve(null), IN_PROCESS_RENDER_TIMEOUT_MS);
    });

    try {
      return await Promise.race([renderVega(language, code, isDarkTheme), timeout]);
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private storeResult(key: string, result: DiagramRenderResult): void {
    this.results.set(key, 'svg' in result ? { svg: result.svg, width: result.width, height: result.height } : result);

    if (this.results.size > MAX_CACHED_RESULTS) {
      this.results.delete(this.results.keys().next().value as string);
    }
    this.notify();
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
