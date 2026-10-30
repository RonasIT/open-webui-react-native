// Builds the self-contained HTML of the hidden diagram WebView (mermaid, vega and vega-lite, no CDN)
// into an asset file that the markdown-view library loads into the WebView by URI (kept out of the JS bundle).
// Usage: node tools/scripts/build-diagram-renderer-html.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '../..');
const rendererDir = join(rootDir, 'libs/mobile/shared/features/markdown-view/src/lib/components/diagram-renderer');

const readScript = (path) => readFileSync(join(rootDir, path), 'utf8');

// NOTE: vega-interpreter ships only as an ES module. Its vega-util imports are taken from the vega global
// and its export is attached to it, so the page needs no 'unsafe-eval' for spec expressions.
const interpreterModule = readScript('node_modules/vega-interpreter/build/vega-interpreter.js')
  .replace(/^import \{([^}]+)\} from 'vega-util';$/m, 'var {$1} = vega;')
  .replace(/^export \{ expression as expressionInterpreter \};$/m, 'vega.expressionInterpreter = expression;');

if (/^(import|export)\b/m.test(interpreterModule)) {
  throw new Error('Unexpected vega-interpreter build format, update build-diagram-renderer-html.mjs');
}

const scripts = [
  readScript('node_modules/mermaid/dist/mermaid.min.js'),
  readScript('node_modules/vega/build/vega.min.js'),
  readScript('node_modules/vega-lite/build/vega-lite.min.js'),
  `(function () {${interpreterModule}})();`,
  readFileSync(join(rendererDir, 'host.js'), 'utf8'),
];

const html = [
  '<!doctype html><html><head><meta charset="utf-8">',
  // NOTE: Everything is inline, so any network or file access is refused. Rasterization draws a data: SVG image.
  `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:">`,
  '<meta name="viewport" content="width=device-width,initial-scale=1">',
  // NOTE: The WebView is 1x1, a fixed body width gives width-dependent diagrams (e.g. gantt) room to lay out.
  '<style>body{margin:0;width:600px;font-family:sans-serif}</style>',
  '</head><body><div id="host"></div>',
  ...scripts.map((script) => `<script>${script.replace(/<\/script/gi, '<\\/script')}</script>`),
  '</body></html>',
].join('');

const outputPath = join(rendererDir, 'renderer.html');

writeFileSync(outputPath, html);

console.log(`Wrote ${outputPath} (${(html.length / 1024 / 1024).toFixed(2)} MB of HTML)`);
