export interface SubmitFeedbackRequest {
  message: string;
  platform: string;
  appVersion?: string;
  apiVersion?: string;
  userId?: string;
}
