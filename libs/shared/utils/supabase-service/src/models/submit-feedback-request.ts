export interface SubmitFeedbackAttachment {
  base64: string;
  mimeType?: string;
  fileName?: string;
}

export interface SubmitFeedbackRequest {
  email: string;
  message: string;
  platform: string;
  appVersion?: string;
  apiVersion?: string;
  attachments?: Array<SubmitFeedbackAttachment>;
}
