import { QueryKey } from '@tanstack/react-query';
import { WebView } from 'react-native-webview';
import { DiagramLanguage } from '../enums';
import { RenderedDiagram } from '../types';

export interface DiagramRenderRequest {
  language: DiagramLanguage;
  code: string;
  isDarkTheme: boolean;
}

type DiagramRequest =
  ({ type: 'render' } & DiagramRenderRequest) | ({ type: 'rasterize'; background: string } & RenderedDiagram);

type DiagramRendererMessage = { type: 'ready' } | { type: 'result'; id: string; result?: unknown; error?: string };

interface PendingRequest {
  id: string;
  resolve: (result: unknown) => void;
  reject: (error: Error) => void;
}

// NOTE: A diagram that hangs the WebView (e.g. a huge mermaid layout) is cut off by recreating the WebView.
const requestTimeoutMs = 10000;

export const getDiagramQueryKey = ({ language, code, isDarkTheme }: DiagramRenderRequest): QueryKey => [
  'diagram',
  language,
  isDarkTheme,
  code,
];

/**
 * Sends requests to the hidden WebView of `DiagramRenderer` one at a time: renders diagram code to SVG and
 * rasterizes a rendered SVG to a PNG for the fullscreen viewer.
 * Rendered diagrams are cached by TanStack Query in `DiagramBlock`, not here.
 */
export class DiagramRendererService {
  private webView: WebView | null = null;
  private restartWebView: (() => void) | null = null;
  private showWebView: (() => void) | null = null;
  private isWebViewNeeded = false;
  private ready!: Promise<void>;
  private markReady!: () => void;
  private failReady!: (error: Error) => void;
  private isReady = false;
  // NOTE: Settles when the last queued request settles. One request at a time, so a timeout belongs to it alone.
  private chain: Promise<void> = Promise.resolve();
  private current: PendingRequest | null = null;
  private nextId = 0;

  constructor() {
    this.createReady();
  }

  public attach(webView: WebView | null, restartWebView: () => void): void {
    this.webView = webView;
    this.restartWebView = restartWebView;
  }

  // NOTE: The WebView (and its ~4 MB of HTML) is created only when the first diagram is requested.
  public onWebViewNeeded(showWebView: () => void): void {
    this.showWebView = showWebView;

    // NOTE: A diagram may have been requested before `DiagramRenderer` subscribed.
    if (this.isWebViewNeeded) {
      showWebView();
    }
  }

  public render(request: DiagramRenderRequest): Promise<RenderedDiagram> {
    return this.enqueue({ type: 'render', ...request }) as Promise<RenderedDiagram>;
  }

  // NOTE: Returns a base64 PNG of the diagram at its own size, on a solid background.
  public async rasterize(diagram: RenderedDiagram, background: string): Promise<string> {
    const { png } = (await this.enqueue({ type: 'rasterize', ...diagram, background })) as { png: string };

    return png;
  }

  public handleMessage(data: string): void {
    const message = JSON.parse(data) as DiagramRendererMessage;

    if (message.type === 'ready') {
      this.isReady = true;
      this.markReady();

      return;
    }

    const current = this.current;

    if (!current || message.id !== current.id) {
      return;
    }

    this.current = null;

    if (message.error !== undefined) {
      current.reject(new Error(message.error));
    } else {
      current.resolve(message.result);
    }
  }

  // NOTE: Called on a timeout and when the WebView process is gone: the current request fails, the next ones
  // wait for the recreated WebView.
  public restart(): void {
    const current = this.current;
    this.current = null;

    // NOTE: A WebView that died while loading fails the request waiting for it, so a page that keeps crashing
    // on load costs one remount per request instead of an endless remount loop.
    if (!this.isReady) {
      this.failReady(new Error('Diagram renderer failed to load'));
    }
    this.isReady = false;
    this.createReady();

    current?.reject(new Error('Diagram renderer was restarted'));
    this.restartWebView?.();
  }

  private async enqueue(request: DiagramRequest): Promise<unknown> {
    const previous = this.chain;
    let release = (): void => undefined;
    this.chain = new Promise((resolve) => (release = resolve));

    if (!this.isWebViewNeeded) {
      this.isWebViewNeeded = true;
      this.showWebView?.();
    }

    try {
      await previous;

      return await this.send(request);
    } finally {
      release();
    }
  }

  private async send(request: DiagramRequest): Promise<unknown> {
    await this.ready;
    const id = String(this.nextId++);

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => this.restart(), requestTimeoutMs);

      this.current = {
        id,
        resolve: (result) => {
          clearTimeout(timeoutId);
          resolve(result);
        },
        reject: (error) => {
          clearTimeout(timeoutId);
          reject(error);
        },
      };
      this.webView?.injectJavaScript(`window.handleDiagramRequest(${JSON.stringify({ id, ...request })});true;`);
    });
  }

  private createReady(): void {
    this.ready = new Promise((resolve, reject) => {
      this.markReady = resolve;
      this.failReady = reject;
    });
    // NOTE: Nobody may be waiting when it fails, the rejection is still seen by the next `await this.ready`.
    this.ready.catch(() => undefined);
  }
}

export const diagramRendererService = new DiagramRendererService();
