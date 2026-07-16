import { FileData } from '@open-webui-react-native/shared/data-access/common';
import { prepareAttachedFiles } from '../../files';
import { CreateFolderRequest, KnowledgeCollectionItem } from '../models';

export interface PrepareCreateFolderPayloadArgs {
  name: string;
  systemPrompt?: string;
  attachedFiles?: Array<FileData>;
  attachedKnowledge?: Array<KnowledgeCollectionItem>;
}

export const prepareCreateFolderPayload = ({
  name,
  systemPrompt,
  attachedFiles,
  attachedKnowledge,
}: PrepareCreateFolderPayloadArgs): CreateFolderRequest => {
  return {
    name,
    data: {
      systemPrompt,
      files: [...prepareAttachedFiles(attachedFiles), ...(attachedKnowledge || [])],
    },
  };
};
