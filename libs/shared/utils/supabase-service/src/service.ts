import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { SubmitFeedbackRequest } from './models';

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
    const { error } = await this.client.from('feedback').insert({
      message: request.message,
      platform: request.platform,
      app_version: request.appVersion,
      api_version: request.apiVersion,
      user_id: request.userId,
    });

    if (error) {
      throw error;
    }
  }
}

export const supabaseService = new SupabaseService();
