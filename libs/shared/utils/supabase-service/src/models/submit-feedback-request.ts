export interface SubmitFeedbackAttachment {
  base64: string;
  mimeType?: string;
  fileName?: string;
}

export interface SubmitFeedbackRequest {
  message: string;
  platform: string;
  appVersion?: string;
  apiVersion?: string;
  userId?: string;
  attachments?: Array<SubmitFeedbackAttachment>;
}
