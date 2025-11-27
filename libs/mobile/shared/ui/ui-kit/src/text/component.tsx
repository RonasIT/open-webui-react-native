import { ReactElement } from 'react';
import { Text, TextProps } from 'react-native';
import { cn } from '@open-webui-react-native/mobile/shared/ui/styles';

export interface AppTextProps extends Omit<TextProps, 'className'> {
  className?: string;
}

export const AppText = ({ children, className, ...restProps }: AppTextProps): ReactElement => {
  const baseTextClasses = ['font-inter', 'text-md-sm', 'sm:text-md', 'text-text-primary'];

  return (
    <Text className={cn(baseTextClasses, className)} {...restProps}>
      {children}
    </Text>
  );
};
