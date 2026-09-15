export const knowledgeApiConfig = {
  route: 'v1/knowledge',
  getSearchKnowledgeQueryKey: (query: string): Array<string> => ['knowledge', 'search', query],
  getKnowledgeFilesQueryKey: (id: string, query: string): Array<string> => ['knowledge', 'get-files', id, query],
  // NOTE: matches the backend's default page size (PAGE_ITEM_COUNT) on GET /knowledge/search and
  // GET /knowledge/{id}/files
  pageSize: 30,
};
