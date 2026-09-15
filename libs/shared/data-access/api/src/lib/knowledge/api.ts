import {
  useInfiniteQuery,
  UseInfiniteQueryResult,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ApiErrorData } from '@open-webui-react-native/shared/data-access/api-client';
import { FileData, getNextPageParam } from '@open-webui-react-native/shared/data-access/common';
import { knowledgeApiConfig } from './config';
import { Knowledge } from './models';
import { knowledgeService } from './service';

function useGetKnowledge(
  props?: UseQueryOptions<Array<Knowledge>, AxiosError<ApiErrorData>>,
): UseQueryResult<Array<Knowledge>, AxiosError<ApiErrorData>> {
  return useQuery<Array<Knowledge>, AxiosError<ApiErrorData>>({
    queryFn: knowledgeService.getKnowledge,
    queryKey: knowledgeApiConfig.getKnowledgeQueryKey,
    ...props,
  });
}

function useGetKnowledgeFiles(id?: string): UseInfiniteQueryResult<Array<FileData>, AxiosError<ApiErrorData>> {
  return useInfiniteQuery({
    queryFn: ({ pageParam }) => knowledgeService.getKnowledgeFiles(id!, pageParam).then((response) => response.items),
    queryKey: knowledgeApiConfig.getKnowledgeFilesQueryKey(id!),
    initialPageParam: 1,
    getNextPageParam: (lastPage, result, lastPageParam) =>
      getNextPageParam({ lastPage, result, lastPageParam, itemsPerPage: knowledgeApiConfig.filesPerPage }),
    select: (data) => data.pages.flat(),
    enabled: !!id,
  });
}

export const knowledgeApi = {
  useGetKnowledge,
  useGetKnowledgeFiles,
};
