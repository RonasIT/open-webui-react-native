import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ApiErrorData } from '@open-webui-react-native/shared/data-access/api-client';
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

export const knowledgeApi = {
  useGetKnowledge,
};
