const filesStorageRoute = '/api/v1/files/';

export const filesApiConfig = {
  route: 'v1/files/',
  filesStorageRoute,
  getFileContentRoute: (id: string): string => `${filesStorageRoute}${id}/content`,
  uploadFileQueryKey: ['files', 'upload'],
  uploadImageQueryKey: ['files', 'upload-image'],
  getFileContentQueryKey: (id: string): Array<string> => ['files', 'get-content', id],
};
