import { Zoomable } from '@likashefqet/react-native-image-zoom';
import { PropsWithChildren, ReactElement } from 'react';
import { withClassNameInterop } from '@open-webui-react-native/mobile/shared/ui/styles';

type RealZoomableProps = React.ComponentProps<typeof Zoomable>;

export interface AppZoomProps extends PropsWithChildren<RealZoomableProps> {
  className?: string;
}

const AppZoom = ({ className, children, hitSlop, ...props }: AppZoomProps): ReactElement => {
  return <Zoomable {...props}>{children}</Zoomable>;
};

withClassNameInterop(AppZoom);

export { AppZoom };
