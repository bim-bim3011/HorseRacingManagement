import { refreshTokenApi } from '../api/authApi';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

export async function fetchWithAuth(url, options = {}) {
  // Ensure credentials are sent with the request (if needed for other cookies)
  // Options might already have headers, we just merge them.
  let token = localStorage.getItem('accessToken');
  
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers,
    credentials: 'include', // Always send cookies (needed for refreshToken HttpOnly cookie)
  };

  try {
    let response = await fetch(url, config);

    // Check if the response indicates an authentication issue (token expired)
    if (response.status === 401 || response.status === 403) {
      // Clone response so we can read the body without consuming it
      const clonedResponse = response.clone();
      let shouldRefresh = false;
      
      try {
        const errorData = await clonedResponse.json();
        // Only refresh for UNAUTHENTICATED (1006) or ACCESS_TOKEN_EXPIRED (1011)
        // Do NOT refresh for ACCESS_DENIED (1005) - that's a real permission issue
        shouldRefresh = errorData.code === 1006 || errorData.code === 1011;
      } catch {
        // If we can't parse the response, try refreshing anyway for 401
        shouldRefresh = response.status === 401;
      }

      if (shouldRefresh) {
        if (isRefreshing) {
          // If already refreshing, wait for the new token
          return new Promise(function (resolve, reject) {
            failedQueue.push({ resolve, reject });
          })
            .then((newToken) => {
              config.headers['Authorization'] = 'Bearer ' + newToken;
              return fetch(url, config);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        isRefreshing = true;

        try {
          const refreshData = await refreshTokenApi();
          const newToken = refreshData.accessToken;
          
          localStorage.setItem('accessToken', newToken);
          
          // Notify AuthContext to update state if necessary
          window.dispatchEvent(new CustomEvent('token-refreshed', { detail: newToken }));

          processQueue(null, newToken);
          
          // Retry original request
          config.headers['Authorization'] = 'Bearer ' + newToken;
          response = await fetch(url, config);
        } catch (err) {
          processQueue(err, null);
          // Refresh failed, log out
          localStorage.removeItem('accessToken');
          window.dispatchEvent(new Event('auth-logout'));
          return response; // Return original 401 response so caller can handle it
        } finally {
          isRefreshing = false;
        }
      }
    }

    return response;
  } catch (err) {
    throw err;
  }
}
