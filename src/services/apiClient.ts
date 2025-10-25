const API_BASE_URL = process.env.VITE_API_BASE_URL;

const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
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
