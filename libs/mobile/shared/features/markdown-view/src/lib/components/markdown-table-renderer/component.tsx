import React, { ReactElement, ReactNode, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { View } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/ui-kit';

function isElement(node: ReactNode): node is ReactElement {
  return !!node && typeof node === 'object' && 'props' in (node as any);
}

const toArray = (v: ReactNode | Array<ReactNode>): Array<ReactNode> => (Array.isArray(v) ? v : v != null ? [v] : []);

interface TableChild extends ReactElement {
  props: {
    children: ReactNode | Array<ReactNode>;
  };
}

export const MarkdownTableRenderer = ({
  node,
  childrenNodes,
}: {
  node: { key: string | number };
  childrenNodes: ReactNode;
}): ReactElement | null => {
  try {
    const childrenArray = toArray(childrenNodes);

    const thead = childrenArray[0];
    const tbody = childrenArray[1];

    if (!isElement(thead) || !isElement(tbody)) {
      return <React.Fragment>{childrenNodes}</React.Fragment>;
    }

    const theadEl = thead as TableChild;
    const tbodyEl = tbody as TableChild;

    const rows = toArray(tbodyEl.props.children).filter(isElement) as Array<TableChild>;

    if (rows.length === 0) return <React.Fragment>{childrenNodes}</React.Fragment>;

    const firstRowCells = toArray(rows[0].props.children);
    const numRows = rows.length;
    const numCols = firstRowCells.length;

    const columns: Array<Array<ReactElement>> = Array.from({ length: numCols }, () => []);

    // Build table body
    for (let r = 0; r < numRows; r++) {
      const row = rows[r];
      const cells = toArray(row.props.children);

      for (let c = 0; c < numCols; c++) {
        const cell = cells[c];

        columns[c].push(
          <View key={`cell-${r}-${c}`} className='px-2 py-1'>
            {cell}
          </View>,
        );
      }
    }

    const theadRows = toArray(theadEl.props.children).filter(isElement);
    const headerRow = theadRows[0] as TableChild | undefined;

    const headerCells = headerRow ? toArray(headerRow.props.children) : [];

    for (let c = 0; c < numCols; c++) {
      const header = headerCells[c];
      columns[c].unshift(
        <View key={`header-${c}`} className='bg-neutral-300 px-2 py-1'>
          {header}
        </View>,
      );
    }

    return (
      <ScrollView
        key={`table-${node.key}`}
        horizontal
        showsHorizontalScrollIndicator>
        <MarkdownTable columns={columns} />
      </ScrollView>
    );
  } catch (e) {
    console.error('Markdown table render failed:', e);

    //NOTE: A fallback in case the table rendering fails.
    return <React.Fragment>{childrenNodes}</React.Fragment>;
  }
};

const MarkdownTable = ({ columns }: { columns: Array<Array<ReactElement>> }): ReactElement => {
  const [maxRowHeights, setMaxRowHeights] = useState(Array(columns[0].length).fill(0));

  const { width } = useWindowDimensions();

  const updateHeight = (rowIndex: number, height: number): void => {
    setMaxRowHeights((prev) => {
      const next = [...prev];
      if (height > next[rowIndex]) next[rowIndex] = height;

      return next;
    });
  };

  return (
    <View className='flex-row'>
      {columns.map((col, cInd) => (
        <View
          key={`col-${cInd}`}
          className={[
            'flex-col border-y-2',
            cInd === 0 ? 'border-l-2 rounded-l-md' : 'border-l border-l-neutral-400',
            cInd === columns.length - 1 ? 'border-r-2 rounded-r-md' : '',
          ].join(' ')}>
          {col.map((cell, rInd) => (
            <View
              key={`cell-${cInd}-${rInd}`}
              className={['border-b border-neutral-300', rInd === col.length - 1 ? 'border-b-0' : ''].join(' ')}
              onLayout={({ nativeEvent: { layout } }) => updateHeight(rInd, layout.height)}
              style={{
                maxWidth: width * 0.66,
                minHeight: maxRowHeights[rInd] > 0 ? maxRowHeights[rInd] : undefined,
              }}>
              {cell}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};
