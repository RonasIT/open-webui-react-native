import { DiagramLanguage } from '../enums';

export const getDiagramLanguage = (sourceInfo?: string): DiagramLanguage | null => {
  switch (sourceInfo?.trim().split(/\s+/)[0].toLowerCase()) {
    case 'mermaid':
      return DiagramLanguage.MERMAID;
    case 'vega':
      return DiagramLanguage.VEGA;
    case 'vega-lite':
    case 'vegalite':
      return DiagramLanguage.VEGA_LITE;
    default:
      return null;
  }
};
