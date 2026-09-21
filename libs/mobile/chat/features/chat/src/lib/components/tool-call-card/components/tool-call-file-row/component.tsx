import { ReactElement, useState } from 'react';
import { fileSystemService } from '@open-webui-react-native/mobile/shared/data-access/file-system-service';
import { AppPressable, AppSpinner, AppText, Icon, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { appStorageService } from '@open-webui-react-native/shared/data-access/storage';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';
import { ToolCallFile } from '../../../../utils';

interface ToolCallFileRowProps {
  file: ToolCallFile;
}

export function ToolCallFileRow({ file }: ToolCallFileRowProps): ReactElement {
  const [isSharing, setIsSharing] = useState(false);

  const handlePress = async (): Promise<void> => {
    setIsSharing(true);

    try {
      await fileSystemService.shareExternalFile(file.source, file.name, {
        mimeType: file.mimeType,
        authorizationToken: appStorageService.token.get(),
      });
    } catch {
      ToastService.showError();
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <AppPressable
      onPress={handlePress}
      disabled={isSharing}
      className='flex-row items-center gap-8 rounded-xl bg-background-secondary px-12 py-10 active:opacity-70'>
      <Icon name='file' className='size-20 shrink-0 color-text-secondary' />
      <View className='min-w-0 flex-1'>
        <AppText numberOfLines={1} className='text-sm-sm sm:text-sm font-mono text-text-primary'>
          {file.name}
        </AppText>
      </View>
      {isSharing ? (
        <AppSpinner size='small' />
      ) : (
        <Icon name='download' className='size-16 shrink-0 color-text-secondary' />
      )}
    </AppPressable>
  );
}
