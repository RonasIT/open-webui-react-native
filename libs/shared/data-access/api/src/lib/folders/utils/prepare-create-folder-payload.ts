import { FileData } from '@open-web-ui-mobile-client-react-native/shared/data-access/common';
import { prepareAttachedFiles } from '../../files';
import { Knowledge } from '../../knowledge/models/knowledge';
import { CreateFolderRequest } from '../models';

export interface PrepareCreateFolderPayloadArgs {
  name: string;
  systemPrompt?: string;
  attachedFiles?: Array<FileData>;
  attachedKnowledge?: Array<Knowledge>;
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
