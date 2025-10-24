import type { User } from '../types';
import * as mockApi from './mockApi';

const AUTH_TOKEN_KEY = 'civic_issue_auth_token';

// This service now acts as a client-side session manager.
// All user persistence logic is handled by the (mock) API.

export const registerUser = async (data: Omit<User, 'email'> & {email: string, password: string}): Promise<Omit<User, 'password'> | null> => {
  try {
    const { user, token } = await mockApi.apiRegister(data);
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    return user;
  } catch (error) {
    console.error("Registration failed:", (error as Error).message);
    return null;
  }
};

export const loginUser = async (email: string, password: string): Promise<Omit<User, 'password'> | null> => {
  try {
    const { user, token } = await mockApi.apiLogin(email, password);
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    return user;
  } catch (error) {
    console.error("Login failed:", (error as Error).message);
    return null;
  }
};

export const logoutUser = (): Promise<void> => {
  return new Promise((resolve) => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    resolve();
  });
};

export const getCurrentUser = (): Omit<User, 'password'> | null => {
  const token = getToken();
  if (!token) return null;
  
  // In a real app, you'd decode a JWT here. We'll simulate it.
  if (token.startsWith('mock-token-for-')) {
    const parts = token.split('-');
    // A real implementation would fetch full user details from an API after decoding.
    // For this mock, we assume the necessary details are in the token.
    return { 
        email: parts[3],
        firstName: parts[4],
        lastName: parts[5],
        mobileNumber: '' // Not stored in token for this mock
    };
  }
  
  return null;
};

export const getToken = (): string | null => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
}
