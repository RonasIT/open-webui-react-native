import { useSelector } from '@legendapp/state/react';
import { ReactElement } from 'react';
import { appState$ } from '@open-webui-react-native/shared/data-access/app-state';
import { MarkdownRenderer } from '@open-webui-react-native/shared/utils/config';
import { DefaultMarkdownView } from './components/default-markdown-view';
import { NitroMarkdownView } from './components/nitro-markdown-view';
import { AppMarkdownViewProps } from './types/app-markdown-view-props';

export type { AppMarkdownViewProps };

export function AppMarkdownView(props: AppMarkdownViewProps): ReactElement {
  const markdownRenderer = useSelector(appState$.markdownRenderer);

  if (markdownRenderer === MarkdownRenderer.NITRO) {
    return <NitroMarkdownView {...props} />;
  }

  return <DefaultMarkdownView {...props} />;
}
