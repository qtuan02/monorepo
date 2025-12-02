/**
 * OAuth-related types
 */

/**
 * OAuth callback message types
 */
export type OAuthMessageType = "OAUTH_SUCCESS" | "OAUTH_ERROR";

/**
 * OAuth callback message structure
 */
export interface OAuthMessage {
  type: OAuthMessageType;
  error?: string;
}

/**
 * OAuth callback search parameters
 */
export interface OAuthCallbackSearchParams {
  popup?: string;
  redirect?: string;
  error?: string;
}

