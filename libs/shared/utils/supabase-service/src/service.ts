import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { decode } from 'base64-arraybuffer';
import Constants from 'expo-constants';
import { SupabaseBucket, SupabaseTable } from './enums';
import { SubmitFeedbackAttachment, SubmitFeedbackRequest } from './models';

class SupabaseService {
  private client: SupabaseClient;

  public init(): void {
    const supabaseConfig = Constants.expoConfig?.extra?.supabase;

    this.client = createClient(supabaseConfig?.url ?? '', supabaseConfig?.publishableKey ?? '', {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }

  public async submit(request: SubmitFeedbackRequest): Promise<void> {
    const attachmentPaths = request.attachments?.length
      ? await Promise.all(request.attachments.map((attachment, index) => this.uploadAttachment(attachment, index)))
      : [];

    const { error } = await this.client.from(SupabaseTable.FEEDBACK).insert({
      message: request.message,
      platform: request.platform,
      app_version: request.appVersion,
      api_version: request.apiVersion,
      app_user_id: request.userId,
      attachment_paths: attachmentPaths,
    });

    if (error) {
      throw error;
    }
  }

  private async uploadAttachment(attachment: SubmitFeedbackAttachment, index: number): Promise<string> {
    const fallbackFileName = attachment.mimeType?.startsWith('video/') ? 'video.mp4' : 'image.jpg';
    const path = `${Date.now()}-${index}-${attachment.fileName ?? fallbackFileName}`;

    const { error } = await this.client.storage
      .from(SupabaseBucket.FEEDBACK_ATTACHMENTS)
      .upload(path, decode(attachment.base64), {
        contentType: attachment.mimeType,
      });

    if (error) {
      throw error;
    }

    return path;
  }
}

export const supabaseService = new SupabaseService();
