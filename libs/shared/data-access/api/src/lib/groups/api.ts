import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ApiErrorData } from '@open-webui-react-native/shared/data-access/api-client';
import { groupsApiConfig } from './config';
import { Group } from './models';
import { groupsService } from './service';

function useGetGroups(
  share = true,
  props?: Omit<UseQueryOptions<Array<Group>, AxiosError<ApiErrorData>>, 'queryKey' | 'queryFn'>,
): UseQueryResult<Array<Group>, AxiosError<ApiErrorData>> {
  return useQuery<Array<Group>, AxiosError<ApiErrorData>>({
    queryFn: () => groupsService.getGroups({ share }),
    queryKey: groupsApiConfig.getGroupsQueryKey(share),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...props,
  });
}

export const groupsApi = {
  useGetGroups,
};
