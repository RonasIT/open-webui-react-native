import { ReactElement, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { WebView } from 'react-native-webview';
import { createStyles } from '@open-webui-react-native/mobile/shared/ui/styles';
import { View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { diagramRendererService } from '../../services';
import { diagramRendererHtml } from './html';

/**
 * The single hidden WebView that renders Mermaid / Vega / Vega-Lite code to SVG strings for `DiagramBlock`.
 * Mounted once at the app root, the WebView itself is created only when the first diagram is requested.
 */
export function DiagramRenderer(): ReactElement | null {
  const webViewRef = useRef<WebView>(null);
  // NOTE: Bumped to remount the WebView, an instance whose content process is gone must not be reused.
  const [webViewGeneration, setWebViewGeneration] = useState(0);
  const isRendererNeeded = useSyncExternalStore(
    diagramRendererService.subscribe,
    diagramRendererService.getIsRendererNeeded,
  );

  const handleRendererGone = (): void => {
    diagramRendererService.handleRendererReset();
    setWebViewGeneration((generation) => generation + 1);
  };

  useEffect(() => {
    if (!isRendererNeeded) {
      return;
    }

    diagramRendererService.setSender((request) => {
      webViewRef.current?.injectJavaScript(`window.handleDiagramRequest(${JSON.stringify(request)});true;`);
    });

    return () => diagramRendererService.setSender(null);
  }, [isRendererNeeded]);

  if (!isRendererNeeded) {
    return null;
  }

  return (
    <View pointerEvents='none' style={styles.container}>
      <WebView
        key={webViewGeneration}
        ref={webViewRef}
        source={{ html: diagramRendererHtml }}
        originWhitelist={['*']}
        onMessage={(event) => diagramRendererService.handleMessage(event.nativeEvent.data)}
        onContentProcessDidTerminate={handleRendererGone}
        onRenderProcessGone={handleRendererGone}
      />
    </View>
  );
}

const styles = createStyles({
  container: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
});
