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
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers,
    credentials: options.credentials || 'same-origin', // Ensure cookies are sent to same-origin
  };

  try {
    let response = await fetch(url, config);

    // The backend's JwtAuthenticationEntryPoint currently maps authentication errors to 403 (ACCESS_DENIED)
    if (response.status === 401 || response.status === 403) {
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

    return response;
  } catch (err) {
    throw err;
  }
}
