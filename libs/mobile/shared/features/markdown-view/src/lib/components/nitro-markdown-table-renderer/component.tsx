import { ComponentType, ReactElement, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import {
  type MarkdownNode,
  type NodeRendererProps,
  type TableCellAlign,
  useMarkdownContext,
} from 'react-native-nitro-markdown';
import { colors, useColorScheme } from '@open-webui-react-native/mobile/shared/ui/styles';
import { View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';

const DEFAULT_MIN_COLUMN_WIDTH = 80;
const COLUMN_PADDING = 24;
const APPROX_CHAR_WIDTH = 7;

interface TableData {
  alignments: Array<TableCellAlign | undefined>;
  headers: Array<MarkdownNode>;
  rows: Array<Array<MarkdownNode>>;
}

const extractTableData = (node: MarkdownNode): TableData => {
  const headers: Array<MarkdownNode> = [];
  const rows: Array<Array<MarkdownNode>> = [];
  const alignments: Array<TableCellAlign | undefined> = [];

  for (const child of node.children ?? []) {
    if (child.type === 'table_head') {
      for (const row of child.children ?? []) {
        if (row.type !== 'table_row') continue;

        for (const cell of row.children ?? []) {
          headers.push(cell);
          alignments.push(cell.align);
        }
      }
    } else if (child.type === 'table_body') {
      for (const row of child.children ?? []) {
        if (row.type !== 'table_row') continue;

        const rowCells: Array<MarkdownNode> = [];

        for (const cell of row.children ?? []) {
          rowCells.push(cell);
        }

        rows.push(rowCells);
      }
    }
  }

  return { headers, rows, alignments };
};

const getNodeTextLength = (node: MarkdownNode): number => {
  if (node.content) {
    return node.content.trim().length;
  }

  return (node.children ?? []).reduce((total, child) => total + getNodeTextLength(child), 0);
};

const estimateColumnWidths = (
  headers: Array<MarkdownNode>,
  rows: Array<Array<MarkdownNode>>,
  columnCount: number,
  minColumnWidth: number,
): Array<number> => {
  const widths = Array.from({ length: columnCount }, () => minColumnWidth);

  for (let col = 0; col < columnCount; col++) {
    let maxChars = getNodeTextLength(headers[col] ?? { type: 'text', content: '' });

    for (const row of rows) {
      const cell = row[col];

      if (!cell) continue;

      maxChars = Math.max(maxChars, getNodeTextLength(cell));
    }

    widths[col] = Math.max(minColumnWidth, maxChars * APPROX_CHAR_WIDTH + COLUMN_PADDING);
  }

  return widths;
};

interface NitroMarkdownTableCellProps {
  node: MarkdownNode;
  Renderer: ComponentType<NodeRendererProps>;
}

function NitroMarkdownTableCell({ node, Renderer }: NitroMarkdownTableCellProps): ReactElement {
  if (!node.children?.length) {
    return <Renderer
      node={node}
      depth={0}
      inListItem={false}
      parentIsText={false} />;
  }

  return (
    <View className='flex-row flex-wrap items-center'>
      {node.children.map((child, index) => (
        <Renderer
          key={child.beg ?? `${child.type}-${index}`}
          node={child}
          depth={0}
          inListItem={false}
          parentIsText={false}
        />
      ))}
    </View>
  );
}

interface NitroMarkdownTableRendererProps {
  node: MarkdownNode;
  Renderer: ComponentType<NodeRendererProps>;
}

export function NitroMarkdownTableRenderer({ node, Renderer }: NitroMarkdownTableRendererProps): ReactElement | null {
  const { tableOptions } = useMarkdownContext();
  const { isDarkColorScheme } = useColorScheme();
  const minColumnWidth = tableOptions?.minColumnWidth ?? DEFAULT_MIN_COLUMN_WIDTH;

  const { headers, rows, alignments } = useMemo(() => extractTableData(node), [node]);
  const columnCount = headers.length;

  const columnWidths = useMemo(
    () => estimateColumnWidths(headers, rows, columnCount, minColumnWidth),
    [columnCount, headers, minColumnWidth, rows],
  );

  const tableStyles = useMemo(
    () =>
      StyleSheet.create({
        bodyCell: {
          alignItems: 'flex-start',
          borderRightColor: isDarkColorScheme ? colors.gray700 : colors.gray200,
          borderRightWidth: 1,
          flexShrink: 0,
          justifyContent: 'center',
          paddingHorizontal: 12,
          paddingVertical: 10,
        },
        bodyRow: {
          borderBottomColor: isDarkColorScheme ? colors.gray700 : colors.gray200,
          borderBottomWidth: 1,
          flexDirection: 'row',
        },
        headerCell: {
          alignItems: 'flex-start',
          borderRightColor: isDarkColorScheme ? colors.gray700 : colors.gray200,
          borderRightWidth: 1,
          flexShrink: 0,
          paddingHorizontal: 12,
          paddingVertical: 10,
        },
        headerRow: {
          backgroundColor: isDarkColorScheme ? colors.gray700 : colors.gray75,
          borderBottomColor: isDarkColorScheme ? colors.gray700 : colors.gray200,
          borderBottomWidth: 1,
          flexDirection: 'row',
        },
        lastBodyRow: {
          borderBottomWidth: 0,
        },
        lastCell: {
          borderRightWidth: 0,
        },
        scrollContainer: {
          alignSelf: 'stretch',
          width: '100%',
        },
        table: {
          borderColor: isDarkColorScheme ? colors.gray700 : colors.gray200,
          borderRadius: 8,
          borderWidth: 1,
          overflow: 'hidden',
        },
      }),
    [isDarkColorScheme],
  );

  if (columnCount === 0) {
    return null;
  }

  const getAlignment = (index: number): 'flex-start' | 'center' | 'flex-end' => {
    const align = alignments[index];

    if (align === 'center') return 'center';
    if (align === 'right') return 'flex-end';

    return 'flex-start';
  };

  return (
    <View style={tableStyles.scrollContainer} className='my-8'>
      <ScrollView
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator
        bounces={false}>
        <View style={tableStyles.table}>
          <View style={tableStyles.headerRow}>
            {headers.map((cell, colIndex) => (
              <View
                key={`header-${colIndex}`}
                style={[
                  tableStyles.headerCell,
                  {
                    width: columnWidths[colIndex],
                    alignItems: getAlignment(colIndex),
                  },
                  colIndex === columnCount - 1 && tableStyles.lastCell,
                ]}>
                <NitroMarkdownTableCell node={cell} Renderer={Renderer} />
              </View>
            ))}
          </View>
          {rows.map((row, rowIndex) => (
            <View
              key={`row-${rowIndex}`}
              style={[tableStyles.bodyRow, rowIndex === rows.length - 1 && tableStyles.lastBodyRow]}>
              {row.map((cell, colIndex) => (
                <View
                  key={`cell-${rowIndex}-${colIndex}`}
                  style={[
                    tableStyles.bodyCell,
                    {
                      width: columnWidths[colIndex],
                      alignItems: getAlignment(colIndex),
                    },
                    colIndex === columnCount - 1 && tableStyles.lastCell,
                  ]}>
                  <NitroMarkdownTableCell node={cell} Renderer={Renderer} />
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
