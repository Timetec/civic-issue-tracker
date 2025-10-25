import { API_BASE_URL } from '../config';

const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  // Check if the response has content. If not, return null.
  // This gracefully handles 200 OK or 204 No Content responses with no body.
  const responseText = await response.text();
  if (!responseText) {
    return null as any;
  }
  
  try {
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Failed to parse JSON response:", responseText);
    throw new Error("Invalid JSON response from server.");
  }
};

export const get = async <T>(endpoint: string): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
  });
  return handleResponse(response);
};

export const post = async <T>(endpoint: string, body: unknown): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(body),
  });
  return handleResponse(response);
};

export const put = async <T>(endpoint: string, body: unknown): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(body),
  });
  return handleResponse(response);
};


export const postForm = async <T>(endpoint: string, formData: FormData): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
            // Content-Type is not set, the browser will set it with the correct boundary
            'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: formData,
    });
    return handleResponse(response);
};