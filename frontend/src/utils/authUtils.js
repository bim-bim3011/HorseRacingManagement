/**
 * Decode a base64url-encoded string (RFC 4648 §5).
 * Converts base64url characters back to standard base64, pads if needed,
 * then decodes to a UTF-8 string.
 *
 * @param {string} str - base64url-encoded string
 * @returns {string} decoded UTF-8 string
 */
function base64UrlDecode(str) {
  // Replace base64url-specific chars with standard base64 chars
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');

  // Pad with '=' to make length a multiple of 4
  const pad = base64.length % 4;
  if (pad) {
    base64 += '='.repeat(4 - pad);
  }

  // Decode base64 → binary string → UTF-8
  return decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
}

/**
 * Decode a JWT token and return the payload as an object.
 * Does NOT verify the signature — this is for client-side role checking only.
 *
 * @param {string} token - JWT string (header.payload.signature)
 * @returns {object|null} decoded payload, or null if invalid
 */
export function decodeToken(token) {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = base64UrlDecode(parts[1]);
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

/**
 * Extract roles array from the JWT 'scope' claim.
 * The scope claim contains space-separated roles, e.g. "ROLE_ADMIN ROLE_SPECTATOR".
 *
 * @param {string} token - JWT string
 * @returns {string[]} array of roles, e.g. ["ROLE_ADMIN", "ROLE_SPECTATOR"]
 */
export function getRolesFromToken(token) {
  const payload = decodeToken(token);
  if (!payload || !payload.scope) return [];
  return payload.scope.split(' ').filter(Boolean);
}

/**
 * Check if a JWT token contains a specific role.
 *
 * @param {string} token - JWT string
 * @param {string} role - role to check, e.g. "ROLE_ADMIN"
 * @returns {boolean}
 */
export function hasRole(token, role) {
  const roles = getRolesFromToken(token);
  return roles.includes(role);
}

/**
 * Check if a JWT token is expired based on the 'exp' claim.
 * Returns true if token is expired or invalid.
 *
 * @param {string} token - JWT string
 * @returns {boolean} true if expired or invalid
 */
export function isTokenExpired(token) {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) return true;

  // exp is in seconds, Date.now() is in milliseconds
  // Add a small buffer (30 seconds) to account for clock skew
  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now + 30;
}
