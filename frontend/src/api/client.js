const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * A centralized fetch client that handles:
 * 1. Prepending the base URL
 * 2. Adding the Authorization header if a token exists
 * 3. Checking for response.ok and throwing structured errors
 */
export async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = new Headers(options.headers || {});
  
  if (options.body && typeof options.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const token = localStorage.getItem('adminToken');
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.detail) {
        errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
      }
    } catch {
      // Ignore if response is not JSON
    }
    throw new Error(errorMessage);
  }

  if (options.rawResponse) {
    return response;
  }
  
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  if (contentType && contentType.includes('application/pdf')) {
    return response.blob();
  }

  return response.text();
}
