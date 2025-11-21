import { MessageSourceMetadata, Source } from '@open-webui-react-native/shared/data-access/common';

export type Citation = {
  id: string;
  source: Partial<Source>;
  document: Array<string>;
  metadata: Array<Partial<MessageSourceMetadata>>;
  distances?: Array<number>;
};
