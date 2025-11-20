import { MessageSourceMetadata, Source } from '@open-web-ui-mobile-client-react-native/shared/data-access/common';

export type Citation = {
  id: string;
  source: Partial<Source>;
  document: Array<string>;
  metadata: Array<Partial<MessageSourceMetadata>>;
  distances?: Array<number>;
};
