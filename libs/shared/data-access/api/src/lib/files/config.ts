export const filesApiConfig = {
  route: 'v1/files/',
  filesStorageRoute: '/api/v1/files/',
  getFileContentRoute: (id: string): string => `/api/v1/files/${id}/content`,
  uploadFileQueryKey: ['files', 'upload'],
  uploadImageQueryKey: ['files', 'upload-image'],
  getFileContentQueryKey: (id: string): Array<string> => ['files', 'get-content', id],
};
