/**
 * getUserToken.ts
 * 
 * Stores and provides access to the user's OAuth token from ChatGPT.
 * Token is extracted by verifyToken middleware and used by authenticated tools.
 */

let userAccessToken: string | null = null;

/**
 * Sets the current user's access token.
 * Called by verifyToken middleware after extracting token from Authorization header.
 */
export function setUserToken(token: string | null): void {
  userAccessToken = token;
}

/**
 * Gets the user token or throws an error if not authenticated.
 * Use this in tools that require authentication.
 */
export function requireUserToken(): string {
  if (!userAccessToken) {
    throw new Error('Authentication required. Please log in via OAuth.');
  }
  return userAccessToken;
}
