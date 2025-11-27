import { ReactElement } from 'react';
import ContentLoader, { IContentLoaderProps } from 'react-content-loader/native';
import { withClassNameInterop } from '@open-webui-react-native/mobile/shared/ui/styles';

interface AppContentLoaderProps extends IContentLoaderProps {
  className?: string;
}

function AppContentLoader(props: AppContentLoaderProps): ReactElement {
  return <ContentLoader {...props} />;
}

withClassNameInterop(AppContentLoader);

export { AppContentLoader };
