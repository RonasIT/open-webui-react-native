import { useState } from 'react';
import { imagePreviewModalConfig } from '../config';

export const useImagePreview = (): typeof result => {
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleImagePress = (index: number): void => {
    if (index !== -1) {
      setSelectedImageIndex(index);
      setIsPreviewVisible(true);
    }
  };
  const handleCloseImagePress = (): void => setIsPreviewVisible(false);

  const handleAllPhotosPress = (): void => {
    setSelectedImageIndex(imagePreviewModalConfig.maxImagesShown);
    setIsPreviewVisible(true);
  };

  const result = {
    isPreviewVisible,
    selectedImageIndex,
    handleImagePress,
    handleCloseImagePress,
    handleAllPhotosPress,
  };

  return result;
};
