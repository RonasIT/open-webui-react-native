import { Expose } from 'class-transformer';

export class Features {
  @Expose()
  public auth: boolean;

  @Expose({ name: 'auth_trusted_header' })
  public authTrustedHeader: boolean;

  @Expose({ name: 'enable_ldap' })
  public enableLdap: boolean;

  @Expose({ name: 'enable_api_key' })
  public enableApiKey: boolean;

  @Expose({ name: 'enable_signup' })
  public enableSignup: boolean;

  @Expose({ name: 'enable_login_form' })
  public enableLoginForm: boolean;

  @Expose({ name: 'enable_websocket' })
  public enableWebsocket: boolean;

  @Expose({ name: 'enable_direct_connections' })
  public enableDirectConnections: boolean;

  @Expose({ name: 'enable_channels' })
  public enableChannels: boolean;

  @Expose({ name: 'enable_notes' })
  public enableNotes: boolean;

  @Expose({ name: 'enable_web_search' })
  public enableWebSearch: boolean;

  @Expose({ name: 'enable_code_execution' })
  public enableCodeExecution: boolean;

  @Expose({ name: 'enable_code_interpreter' })
  public enableCodeInterpreter: boolean;

  @Expose({ name: 'enable_image_generation' })
  public enableImageGeneration: boolean;

  @Expose({ name: 'enable_autocomplete_generation' })
  public enableAutocompleteGeneration: boolean;

  @Expose({ name: 'enable_community_sharing' })
  public enableCommunitySharing: boolean;

  @Expose({ name: 'enable_message_rating' })
  public enableMessageRating: boolean;

  @Expose({ name: 'enable_user_webhooks' })
  public enableUserWebhooks: boolean;

  @Expose({ name: 'enable_admin_export' })
  public enableAdminExport: boolean;

  @Expose({ name: 'enable_admin_chat_access' })
  public enableAdminChatAccess: boolean;

  @Expose({ name: 'enable_google_drive_integration' })
  public enableGoogleDriveIntegration: boolean;

  @Expose({ name: 'enable_onedrive_integration' })
  public enableOnedriveIntegration: boolean;

  constructor(partial: Partial<Features>) {
    Object.assign(this, partial);
  }
}
