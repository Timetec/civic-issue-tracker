import type { User } from '../types';
import * as api from './mockApi';

const AUTH_TOKEN_KEY = 'civic_issue_auth_token';

// Helper to decode the application's mock token.
// In a real app, you would use a library like jwt-decode for standard JWTs.
const decodeToken = (token: string): Omit<User, 'password'> | null => {
  try {
    // This app uses a simple mock token format: "mock-token-for-email-firstName-lastName"
    if (token.startsWith('mock-token-for-')) {
      const tokenData = token.substring('mock-token-for-'.length);
      const parts = tokenData.split('-');

      // We assume names do not contain hyphens and are the last two parts.
      // This logic is now robust enough to handle emails that may contain hyphens.
      if (parts.length < 3) {
        console.error("Invalid mock token structure.");
        return null;
      }

      const lastName = parts[parts.length - 1];
      const firstName = parts[parts.length - 2];
      const email = parts.slice(0, parts.length - 2).join('-');

      return {
        email,
        firstName,
        lastName,
        mobileNumber: '', // mobileNumber is part of the User type, default to empty.
      };
    }

    // The previous logic for JWTs was incorrect and caused the 'atob' error.
    // Since the app only uses the mock format, we'll reject any other format.
    console.error("Unrecognized token format.");
    return null;

  } catch (error) {
    console.error("An unexpected error occurred while decoding token", error);
    return null;
  }
};

export const registerUser = async (data: Omit<User, 'email'> & {email: string, password: string}): Promise<Omit<User, 'password'> | null> => {
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
  
  return decodeToken(token);
};

export const getToken = (): string | null => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
}
