import { ReactNode } from 'react';
import { appMarkdownViewConfig } from '../config';
import { calculateTextLength } from './calculate-text-length';

export const groupChildrenByLength = (
  children: Array<ReactNode>,
  maxLength: number = appMarkdownViewConfig.maxCharactersForMathInlineRow,
): Array<Array<any>> => {
  const groups: Array<Array<any>> = [];
  let currentGroup: Array<any> = [];
  let currentLength = 0;

  children.forEach((child: any) => {
    const getChildLength = (): number => {
      if (child.key.includes(appMarkdownViewConfig.mathInlineKey)) {
        const keyParts = child.key.split('-');

        return parseInt(keyParts[keyParts.length - 1]) || 0;
      }

      return calculateTextLength(child.props?.children);
    };

    const childLength = getChildLength();

    if (currentLength + childLength > maxLength && currentGroup.length > 0) {
      groups.push(currentGroup);
      currentGroup = [child];
      currentLength = childLength;
    } else {
      currentGroup.push(child);
      currentLength += childLength;
    }
  });

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return groups;
};
