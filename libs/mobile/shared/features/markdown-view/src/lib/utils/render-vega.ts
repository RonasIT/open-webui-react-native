import { DiagramLanguage } from '../enums';
import type { RenderedDiagram } from '../types';
import type { Config as VegaConfig, Spec as VegaSpec } from 'vega';
import type { Config as VegaLiteConfig, TopLevelSpec } from 'vega-lite';

const DARK_VEGA_CONFIG: VegaLiteConfig = {
  background: 'transparent',
  title: { color: '#e5e5e5', subtitleColor: '#d4d4d4' },
  axis: {
    labelColor: '#d4d4d4',
    titleColor: '#e5e5e5',
    domainColor: '#737373',
    tickColor: '#737373',
    gridColor: '#404040',
  },
  legend: { labelColor: '#d4d4d4', titleColor: '#e5e5e5' },
  header: { labelColor: '#d4d4d4', titleColor: '#e5e5e5' },
  view: { stroke: '#404040' },
};
const LIGHT_VEGA_CONFIG: VegaLiteConfig = { background: 'transparent' };
// NOTE: React Native sets `global.window = global` without `addEventListener`, so vega must not subscribe to
// window, CSS selector or timer events (interactive charts would throw in the View constructor).
// It is set on the spec config, which overrides any `config.events` coming from the spec itself.
const STATIC_EVENTS_CONFIG: VegaConfig['events'] = { window: false, selector: false, timer: false };

// ponytail: heuristic limits against specs that would freeze the app JS thread or exhaust memory; a heavy spec
// that slips through still blocks the UI, the upgrade path is rendering in a separate JS runtime.
// Total inline rows (`values`) and `sequence` generated rows anywhere in the spec.
const MAX_DATA_ROWS = 10000;
const MAX_SVG_LENGTH = 2 * 1024 * 1024;

// NOTE: vega's SVG string renderer emits `<svg ... width="W" height="H" viewBox="0 0 W H">` as the root tag.
const svgRootPattern = /^<svg\b[^>]*>/;
const viewBoxPattern = /\bviewBox="0 0 ([\d.]+) ([\d.]+)"/;
// NOTE: react-native-svg cannot draw these; an image mark with a URL could hit the network.
const unsupportedElementPattern = /<(image|foreignObject|switch|script)\b[^>]*?(\/>|>[\s\S]*?<\/\1>)/g;
// NOTE: react-native-svg drops an `<a>` together with its content, so links are unwrapped, their marks are kept.
const linkTagPattern = /<\/?a\b[^>]*>/g;

function countDataRows(node: unknown): number {
  if (!node || typeof node !== 'object') {
    return 0;
  }

  const { values, sequence, type, start, stop, step } = node as Record<string, unknown>;
  const generator = type === 'sequence' ? { start, stop, step } : (sequence as Record<string, unknown> | undefined);
  let rows = Array.isArray(values) ? values.length : 0;

  if (typeof values === 'string') {
    rows += values.split('\n').length;
  }

  if (typeof generator?.start === 'number' && typeof generator.stop === 'number') {
    rows += Math.ceil(Math.abs(generator.stop - generator.start) / Math.abs(Number(generator.step) || 1));
  }

  return Object.values(node).reduce<number>((total, child) => total + countDataRows(child), rows);
}

/**
 * Renders a Vega / Vega-Lite spec to an SVG string in the app JS runtime, without a DOM or the diagram WebView.
 * vega, vega-lite and vega-interpreter (~1 MB) are loaded on the first chart only, so the app startup does not pay
 * for them. Spec expressions are interpreted (AST mode), not compiled with `new Function`.
 */
export async function renderVega(
  language: DiagramLanguage,
  code: string,
  isDarkTheme: boolean,
): Promise<RenderedDiagram> {
  const [vega, vegaLite, { expressionInterpreter }] = await Promise.all([
    import('vega'),
    import('vega-lite'),
    import('vega-interpreter'),
  ]);
  const spec = JSON.parse(code);

  if (countDataRows(spec) > MAX_DATA_ROWS) {
    throw new Error('Chart data is too large');
  }

  const config = isDarkTheme ? DARK_VEGA_CONFIG : LIGHT_VEGA_CONFIG;
  const isVegaLite = language === DiagramLanguage.VEGA_LITE;
  // NOTE: vega-lite applies the theme config while compiling, a vega spec gets it as the parse config.
  const vegaSpec: VegaSpec = isVegaLite ? vegaLite.compile(spec as TopLevelSpec, { config }).spec : spec;
  const runtime = vega.parse(
    { ...vegaSpec, config: { ...vegaSpec.config, events: STATIC_EVENTS_CONFIG } },
    isVegaLite ? undefined : (config as VegaConfig),
    { ast: true },
  );
  const loader = vega.loader();
  let loaderError: Error | null = null;

  // NOTE: Specs come from the model, so any network or file access is refused. Vega only logs loader failures
  // and draws an empty chart, so the error is kept and rethrown to fall back to the code block.
  // A link (`href` channel) is sanitized to no attributes and unwrapped below, so the chart still renders.
  const refuseLoading = (): Promise<never> => {
    loaderError = new Error('External data and resources are not supported');

    return Promise.reject(loaderError);
  };
  loader.load = refuseLoading;
  loader.sanitize = (_uri, options) =>
    options?.context === 'href' ? Promise.resolve({} as { href: string }) : refuseLoading();

  const view = new vega.View(runtime, { expr: expressionInterpreter, renderer: 'none', loader });

  try {
    const svg = await view.toSVG();

    if (loaderError) {
      throw loaderError;
    }

    if (svg.length > MAX_SVG_LENGTH) {
      throw new Error('Chart is too large to display');
    }

    const root = svg.match(svgRootPattern)?.[0];
    const viewBox = root?.match(viewBoxPattern);

    if (!root || !viewBox) {
      throw new Error('Renderer returned no SVG');
    }

    const width = Number(viewBox[1]);
    const height = Number(viewBox[2]);

    if (!width || !height) {
      throw new Error('Chart is empty');
    }

    // NOTE: The SVG scales to the cell by its viewBox, so the fixed size attributes are dropped.
    const scalableRoot = root.replace(/\s(width|height|class)="[^"]*"/g, '');

    const content = svg.slice(root.length).replace(unsupportedElementPattern, '').replace(linkTagPattern, '');

    return { svg: scalableRoot + content, width, height };
  } finally {
    view.finalize();
  }
}
