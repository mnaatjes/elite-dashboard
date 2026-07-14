export const API_BASE_URL = 'http://192.168.1.146:8000/api/v1';

/**
 * Core fetch wrapper with JSON parsing and error handling
 */
export async function apiClient(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { detail: errorText };
      }
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error(`[API Error] ${endpoint}:`, error);
    throw error;
  }
}
