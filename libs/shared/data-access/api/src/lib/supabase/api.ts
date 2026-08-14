import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { SubmitFeedbackRequest, supabaseService } from '@open-webui-react-native/shared/utils/supabase-service';

function useSubmitFeedback(
  props?: UseMutationOptions<void, Error, SubmitFeedbackRequest>,
): UseMutationResult<void, Error, SubmitFeedbackRequest> {
  return useMutation<void, Error, SubmitFeedbackRequest>({
    mutationFn: (request) => supabaseService.submit(request),
    ...props,
  });
}

export const supabaseApi = {
  useSubmitFeedback,
};
