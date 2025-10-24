import { getToken } from './authService';
import type { CivicIssue, User, IssueStatus } from '../types';

// ===================================================================
// IMPORTANT: THIS IS THE ONLY LINE YOU NEED TO CHANGE!
// Replace this with your deployed backend's URL.
const BASE_URL = 'https://your-backend-api-url.com/api'; 
// ===================================================================


interface ApiError {
  message: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    const error: ApiError = data;
    throw new Error(error.message || 'Something went wrong');
  }
  return data as T;
}

// Helper function for authenticated requests
async function fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
  };

  // Do not set Content-Type for multipart/form-data
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  return fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
}


// --- API Functions ---

export const apiRegister = (data: Omit<User, 'email'> & { email: string; password: string }): Promise<{ user: Omit<User, 'password'>, token: string }> => {
  return fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(res => handleResponse(res));
};

export const apiLogin = (email: string, password: string): Promise<{ user: Omit<User, 'password'>, token: string }> => {
    return fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }).then(res => handleResponse(res));
};

export const apiGetIssues = (): Promise<CivicIssue[]> => {
  return fetchWithAuth('/issues').then(res => handleResponse(res));
};

export const apiAddIssue = (formData: FormData): Promise<CivicIssue> => {
  return fetchWithAuth('/issues', {
    method: 'POST',
    body: formData, // Let the browser set the Content-Type header for FormData
  }).then(res => handleResponse(res));
};

export const apiUpdateIssueStatus = (id: string, newStatus: IssueStatus): Promise<CivicIssue> => {
    return fetchWithAuth(`/issues/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: newStatus }),
  }).then(res => handleResponse(res));
};
