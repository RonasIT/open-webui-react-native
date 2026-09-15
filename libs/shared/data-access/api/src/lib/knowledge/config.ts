export const knowledgeApiConfig = {
  route: 'v1/knowledge',
  getKnowledgeQueryKey: ['knowledge', 'get'],
  getKnowledgeFilesQueryKey: (id: string, page: number): Array<string> => ['knowledge', 'get-files', id, `${page}`],
};
