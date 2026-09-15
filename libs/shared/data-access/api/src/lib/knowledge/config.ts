export const knowledgeApiConfig = {
  route: 'v1/knowledge',
  getKnowledgeQueryKey: ['knowledge', 'get'],
  getKnowledgeFilesQueryKey: (id: string): Array<string> => ['knowledge', 'get-files', id],
  // NOTE: matches the backend's default page size (PAGE_ITEM_COUNT) for GET /knowledge/{id}/files
  filesPerPage: 30,
};
