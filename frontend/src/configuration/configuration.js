export const OAuthConfig = {
  clientId: '48862700047-a6kebfhchktuntqpbh227hbtbbqs6j4s.apps.googleusercontent.com',
  redirectUri: 'http://localhost:5173/authenticate',
  authUri: 'https://accounts.google.com/o/oauth2/v2/auth',
};

/**
 * Build the full Google OAuth2 authorization URL.
 * Redirecting the user to this URL will start the Google consent flow.
 *
 * @returns {string} The full Google OAuth2 URL
 */
export function getGoogleAuthUrl() {
  const params = new URLSearchParams({
    client_id: OAuthConfig.clientId,
    redirect_uri: OAuthConfig.redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
  });

  return `${OAuthConfig.authUri}?${params.toString()}`;
}
