/* global mermaid, vega, vegaLite */
// NOTE: Runs inside the hidden diagram WebView. Inlined into the generated HTML by
// tools/scripts/build-diagram-renderer-html.mjs, never bundled by Metro.
(function () {
  // NOTE: SvgXml ignores <style>, so the CSS-driven look of mermaid is copied into presentation attributes.
  var INLINED_STYLE_PROPERTIES = [
    'fill',
    'stroke',
    'stroke-width',
    'stroke-dasharray',
    'opacity',
    'fill-opacity',
    'stroke-opacity',
    'font-family',
    'font-size',
    'font-weight',
    'text-anchor',
    'dominant-baseline',
  ];
  var SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
  var DARK_VEGA_CONFIG = {
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
  var LIGHT_VEGA_CONFIG = { background: 'transparent' };
  // NOTE: The web app treats a spec with these keys as vega-lite, even in a ```vega block.
  var VEGA_LITE_KEYS = ['mark', 'encoding', 'layer', 'hconcat', 'vconcat', 'repeat', 'facet'];
  var RASTER_SCALE = 3;
  // NOTE: Below the iOS canvas area limit (4096²) with headroom, and keeps the base64 PNG sent via postMessage smaller.
  var RASTER_MAX_SIDE = 3072;

  var host = document.getElementById('host');
  var mermaidTheme = null;
  function post(message) {
    window.ReactNativeWebView.postMessage(JSON.stringify(message));
  }

  function prepareSvg(svgText, shouldInlineStyles) {
    host.innerHTML = svgText;
    var svg = host.querySelector('svg');

    if (!svg) {
      throw new Error('Renderer returned no SVG');
    }

    // NOTE: Removing HTML labels with text would leave empty shapes, the block shows the code instead.
    svg.querySelectorAll('foreignObject').forEach(function (element) {
      if (element.textContent.trim()) {
        throw new Error('Diagram uses HTML labels that cannot be displayed');
      }
    });

    // NOTE: react-native-svg cannot draw HTML content or <switch>; <image> and external <use> could hit the network.
    svg.querySelectorAll('foreignObject, switch, image, script').forEach(function (element) {
      element.remove();
    });
    svg.querySelectorAll('use').forEach(function (element) {
      var href = element.getAttribute('href') || element.getAttribute('xlink:href') || '';

      if (href.charAt(0) !== '#') {
        element.remove();
      }
    });

    if (shouldInlineStyles) {
      // NOTE: Styles are read for every element first, removing classes on the go would break descendant selectors.
      var elements = Array.prototype.slice.call(svg.querySelectorAll('*')).filter(function (element) {
        return element.tagName !== 'style';
      });
      var computedValues = elements.map(function (element) {
        var computedStyle = getComputedStyle(element);

        return INLINED_STYLE_PROPERTIES.map(function (property) {
          return computedStyle.getPropertyValue(property);
        });
      });

      elements.forEach(function (element, index) {
        INLINED_STYLE_PROPERTIES.forEach(function (property, propertyIndex) {
          if (computedValues[index][propertyIndex]) {
            element.setAttribute(property, computedValues[index][propertyIndex]);
          }
        });
        element.removeAttribute('class');
        element.removeAttribute('style');
      });
      svg.querySelectorAll('style').forEach(function (element) {
        element.remove();
      });
    }

    // NOTE: react-native-svg on Android parses any marker orient except "auto" as a number and crashes otherwise.
    // "auto-start-reverse" becomes "auto"; marker-start users get a copy with the content rotated 180° around the ref point.
    svg.querySelectorAll('marker').forEach(function (marker) {
      var orient = marker.getAttribute('orient');

      if (orient === 'auto-start-reverse') {
        marker.setAttribute('orient', 'auto');
        var startUsers = Array.prototype.filter.call(svg.querySelectorAll('[marker-start]'), function (element) {
          return element.getAttribute('marker-start').endsWith('#' + marker.id + ')');
        });

        if (startUsers.length) {
          var reversed = marker.cloneNode(true);
          var group = document.createElementNS(SVG_NAMESPACE, 'g');
          var refX = parseFloat(marker.getAttribute('refX')) || 0;
          var refY = parseFloat(marker.getAttribute('refY')) || 0;
          reversed.id = marker.id + '-reversed';
          // NOTE: The rotated content leaves the marker viewport, which browsers (rasterization) would clip.
          reversed.setAttribute('overflow', 'visible');
          group.setAttribute('transform', 'rotate(180 ' + refX + ' ' + refY + ')');
          group.append.apply(group, Array.prototype.slice.call(reversed.childNodes));
          reversed.appendChild(group);
          marker.after(reversed);
          startUsers.forEach(function (element) {
            element.setAttribute('marker-start', 'url(#' + reversed.id + ')');
          });
        }
      } else if (orient && orient !== 'auto') {
        marker.setAttribute('orient', String(parseFloat(orient) || 0));
      }
    });

    var viewBox = svg.viewBox && svg.viewBox.baseVal;
    var width = viewBox && viewBox.width ? viewBox.width : parseFloat(svg.getAttribute('width'));
    var height = viewBox && viewBox.height ? viewBox.height : parseFloat(svg.getAttribute('height'));

    if (!width || !height) {
      var box = svg.getBBox();
      width = box.width;
      height = box.height;
    }

    if (!width || !height) {
      throw new Error('Diagram is empty');
    }

    if (!viewBox || !viewBox.width) {
      svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    }

    svg.removeAttribute('class');
    svg.removeAttribute('width');
    svg.removeAttribute('height');
    svg.removeAttribute('style');
    svg.setAttribute('xmlns', SVG_NAMESPACE);

    // NOTE: XMLSerializer, not outerHTML: HTML serialization emits `&nbsp;` and may leave `<` unescaped
    // in attributes, which strict XML parsers (SvgXml, <img> SVG) reject.
    var result = { svg: new XMLSerializer().serializeToString(svg), width: width, height: height };
    host.innerHTML = '';

    return result;
  }

  async function renderMermaid(id, code, isDarkTheme) {
    var theme = isDarkTheme ? 'dark' : 'default';

    if (theme !== mermaidTheme) {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme: theme,
        fontFamily: 'sans-serif',
        htmlLabels: false,
        flowchart: { htmlLabels: false },
      });
      mermaidTheme = theme;
    }

    var elementId = 'diagram' + id;

    try {
      var output = await mermaid.render(elementId, code);

      return prepareSvg(output.svg, true);
    } finally {
      // NOTE: mermaid may leave its temporary container (or an error SVG) in the body.
      var leftover = document.getElementById('d' + elementId);

      if (leftover) {
        leftover.remove();
      }
    }
  }

  async function renderVega(language, code, isDarkTheme) {
    var spec = JSON.parse(code);
    var config = isDarkTheme ? DARK_VEGA_CONFIG : LIGHT_VEGA_CONFIG;
    var isVegaLite =
      language === 'vega-lite' ||
      String(spec.$schema || '').indexOf('vega-lite') !== -1 ||
      VEGA_LITE_KEYS.some(function (key) {
        return key in spec;
      });
    // NOTE: vega-lite applies the theme config while compiling, a vega spec gets it as the parse config.
    var vegaSpec = isVegaLite ? vegaLite.compile(spec, { config: config }).spec : spec;
    var loader = vega.loader();
    var loaderError = null;

    // NOTE: Specs come from the model, so any network or file access is refused. Vega only logs loader failures
    // and draws an empty chart, so the error is kept and rethrown to fall back to the code block.
    function refuseLoading() {
      loaderError = new Error('External data and resources are not supported');

      return Promise.reject(loaderError);
    }

    loader.load = refuseLoading;
    // NOTE: A link (`href` channel) gets no URL instead of failing the chart, the <a> is unwrapped by prepareSvg.
    loader.sanitize = function (uri, options) {
      return options && options.context === 'href' ? Promise.resolve({}) : refuseLoading();
    };

    // NOTE: Spec expressions are interpreted (AST mode), not compiled with `new Function`, so the CSP needs no
    // 'unsafe-eval'.
    var runtime = vega.parse(vegaSpec, isVegaLite ? undefined : config, { ast: true });
    var view = new vega.View(runtime, { renderer: 'none', loader: loader, expr: vega.expressionInterpreter });

    try {
      var svg = await view.toSVG();

      if (loaderError) {
        throw loaderError;
      }

      return prepareSvg(svg, false);
    } finally {
      view.finalize();
    }
  }

  async function rasterize(svgText, width, height, background) {
    var scale = Math.min(RASTER_SCALE, RASTER_MAX_SIDE / Math.max(width, height));
    var canvasWidth = Math.round(width * scale);
    var canvasHeight = Math.round(height * scale);

    // NOTE: The cached SVG has no width/height (it scales to the cell), the image needs an explicit size.
    host.innerHTML = svgText;
    var svg = host.querySelector('svg');
    svg.setAttribute('width', canvasWidth);
    svg.setAttribute('height', canvasHeight);
    var markup = new XMLSerializer().serializeToString(svg);
    host.innerHTML = '';

    var image = new Image();

    await new Promise(function (resolve, reject) {
      image.onload = resolve;
      image.onerror = function () {
        reject(new Error('Failed to load SVG for rasterization'));
      };
      image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(markup);
    });

    var canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    var context = canvas.getContext('2d');
    context.fillStyle = background;
    context.fillRect(0, 0, canvasWidth, canvasHeight);
    context.drawImage(image, 0, 0, canvasWidth, canvasHeight);

    var png = canvas.toDataURL('image/png').split(',')[1];

    // NOTE: Frees the bitmap right away, WebKit caps total canvas memory and GC may lag behind.
    canvas.width = canvas.height = 0;

    return { png: png };
  }

  function handle(request) {
    if (request.type === 'rasterize') {
      return rasterize(request.svg, request.width, request.height, request.background);
    }

    return request.language === 'mermaid'
      ? renderMermaid(request.id, request.code, request.isDarkTheme)
      : renderVega(request.language, request.code, request.isDarkTheme);
  }

  // NOTE: The app sends one request at a time and handles timeouts by recreating the WebView.
  window.handleDiagramRequest = async function (request) {
    try {
      post({ type: 'result', id: request.id, result: await handle(request) });
    } catch (error) {
      host.innerHTML = '';
      post({ type: 'result', id: request.id, error: String((error && error.message) || error) });
    }
  };

  post({ type: 'ready' });
})();
