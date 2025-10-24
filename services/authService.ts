import type { User } from '../types';
import { UserRole } from '../types';
import * as api from './mockApi';

const AUTH_TOKEN_KEY = 'civic_issue_auth_token';

// Helper to decode the application's mock token.
// In a real app, you would use a library like jwt-decode for standard JWTs.
const decodeToken = (token: string): Omit<User, 'password'> | null => {
  try {
    // New token format: base64 encoded JSON string of the user object
    return JSON.parse(atob(token));
  } catch (error) {
    // Fallback for old token format for graceful migration
     try {
        if (token.startsWith('mock-token-for-')) {
            const tokenData = token.substring('mock-token-for-'.length);
            const parts = tokenData.split('-');
            if (parts.length < 4) return null;

            const role = parts.pop() as UserRole;
            const lastName = parts.pop();
            const firstName = parts.pop();
            const email = parts.join('-');

            return { email, firstName, lastName, role } as Omit<User, 'password'>;
        }
        return null;
     } catch (fallbackError) {
        console.error("Failed to decode token with primary and fallback methods", fallbackError);
        return null;
     }
  }
};

export const registerUser = async (data: Omit<User, 'email' | 'role'> & {email: string, password: string}): Promise<Omit<User, 'password'> | null> => {
  try {
    const { user, token } = await api.apiRegister(data);
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    return user;
  } catch (error) {
    console.error("Registration failed:", (error as Error).message);
    return null;
  }
};

export const loginUser = async (email: string, password: string): Promise<Omit<User, 'password'> | null> => {
  try {
    const { user, token } = await api.apiLogin(email, password);
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    return user;
  } catch (error) {
    console.error("Login failed:", (error as Error).message);
    return null;
  }
};

export const logoutUser = (): void => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
};

export const getCurrentUser = (): Omit<User, 'password'> | null => {
  const token = getToken();
  if (!token) return null;
  
  const user = decodeToken(token);
  if (!user) {
    // If decoding fails, the token is invalid, so remove it.
    logoutUser();
    return null;
  }
  return user;
};

export const getToken = (): string | null => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
}

export const updateUserToken = (token: string) => {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
}