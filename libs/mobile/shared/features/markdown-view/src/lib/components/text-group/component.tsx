import { ReactElement, ReactNode } from 'react';
import { ASTNode } from 'react-native-markdown-display';
import { AppText, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { appMarkdownViewConfig } from '../../config';
import { MarkdownStyles, MarkdownTextProps } from '../../types/markdown-styles';
import { groupChildrenByLength } from '../../utils';

interface TextGroupProps {
  node: ASTNode;
  children: Array<ReactNode>;
  styles: MarkdownStyles;
  textProps?: MarkdownTextProps;
}

export function TextGroup({ node, children, styles, textProps = {} }: TextGroupProps): ReactElement {
  const isMathInline = children.some((child: any) => child.key.includes('math-inline'));

  if (!isMathInline) {
    return (
      <AppText
        key={`textgroup-${node.key}`}
        style={styles.textgroup}
        {...textProps}>
        {children}
      </AppText>
    );
  }

  //NOTE The function is needed to group math_inline and text elements in one row
  // if the content is not long and fits into the width of one row.
  const childGroups = groupChildrenByLength(children);

  return (
    <View>
      {childGroups.map((group, groupIndex) => (
        <View className='flex-row items-center' key={`textgroup-row-${node.key}-${groupIndex}`}>
          {group.map((child: any) => {
            if (child.key.includes(appMarkdownViewConfig.mathInlineKey)) {
              return child;
            } else {
              return (
                <AppText
                  key={`textgroup-${child.key}`}
                  style={styles.textgroup}
                  {...textProps}>
                  {child}
                </AppText>
              );
            }
          })}
        </View>
      ))}
    </View>
  );
}
