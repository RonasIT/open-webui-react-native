import { useInfiniteQuery, UseInfiniteQueryResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ApiErrorData } from '@open-webui-react-native/shared/data-access/api-client';
import { FileData, getNextPageParam } from '@open-webui-react-native/shared/data-access/common';
import { knowledgeApiConfig } from './config';
import { Knowledge } from './models';
import { knowledgeService } from './service';

function useSearchKnowledge(query?: string): UseInfiniteQueryResult<Array<Knowledge>, AxiosError<ApiErrorData>> {
  const searchText = query?.trim() ?? '';

  return useInfiniteQuery({
    queryFn: async ({ pageParam }) => {
      const response = await knowledgeService.searchKnowledge(pageParam, searchText);

      return response.items ?? [];
    },
    queryKey: knowledgeApiConfig.getSearchKnowledgeQueryKey(searchText),
    initialPageParam: 1,
    getNextPageParam: (lastPage, result, lastPageParam) =>
      getNextPageParam({ lastPage, result, lastPageParam, itemsPerPage: knowledgeApiConfig.pageSize }),
    select: (data) => data.pages.flat(),
  });
}

function useSearchKnowledgeFiles(query?: string): UseInfiniteQueryResult<Array<FileData>, AxiosError<ApiErrorData>> {
  const searchText = query?.trim() ?? '';

  return useInfiniteQuery({
    queryFn: async ({ pageParam }) => {
      const response = await knowledgeService.searchKnowledgeFiles(pageParam, searchText);

      return response.items ?? [];
    },
    queryKey: knowledgeApiConfig.getSearchKnowledgeFilesQueryKey(searchText),
    initialPageParam: 1,
    getNextPageParam: (lastPage, result, lastPageParam) =>
      getNextPageParam({ lastPage, result, lastPageParam, itemsPerPage: knowledgeApiConfig.pageSize }),
    select: (data) => data.pages.flat(),
  });
}

function useGetKnowledgeFiles(
  id?: string,
  query?: string,
): UseInfiniteQueryResult<Array<FileData>, AxiosError<ApiErrorData>> {
  const searchText = query?.trim() ?? '';

  return useInfiniteQuery({
    queryFn: async ({ pageParam }) => {
      const response = await knowledgeService.getKnowledgeFiles(id!, pageParam, searchText);

      return response.items ?? [];
    },
    queryKey: knowledgeApiConfig.getKnowledgeFilesQueryKey(id ?? '', searchText),
    initialPageParam: 1,
    getNextPageParam: (lastPage, result, lastPageParam) =>
      getNextPageParam({ lastPage, result, lastPageParam, itemsPerPage: knowledgeApiConfig.pageSize }),
    select: (data) => data.pages.flat(),
    enabled: Boolean(id),
  });
}

export const knowledgeApi = {
  useSearchKnowledge,
  useSearchKnowledgeFiles,
  useGetKnowledgeFiles,
};
