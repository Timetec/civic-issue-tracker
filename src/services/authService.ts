import * as mockApi from './mockApi';
import * as apiClient from './apiClient';
import type { User } from '../types';
import { UserRole } from '../types';
import { USE_REAL_API } from '../config';

const CURRENT_USER_KEY = 'civic-user';
const AUTH_TOKEN_KEY = 'authToken';

// Helper to remove password before returning user object
const sanitizeUser = (user: User): Omit<User, 'password'> => {
  const { password, ...sanitized } = user;
  return sanitized;
};

export const loginUser = async (email: string, pass: string): Promise<Omit<User, 'password'> | null> => {
  // Note: Passwords are sent plaintext over HTTPS, which is the standard security practice.
  // The backend is responsible for hashing and comparing passwords.
  if (USE_REAL_API) {
    try {
      const response = await apiClient.post<{ token: string; user: User }>('/api/auth/login', { email, password: pass });
      localStorage.setItem(AUTH_TOKEN_KEY, response.token);
      const sanitized = sanitizeUser(response.user);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sanitized));
      return sanitized;
    } catch (error) {
      console.error("API Login failed:", error);
      return null;
    }
  } else {
    // Mock API Flow
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = mockApi.findUserByEmail(email);
        if (user && user.password === pass) {
          const userToStore = sanitizeUser(user);
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userToStore));
          resolve(userToStore);
        } else {
          resolve(null);
        }
      }, 500);
    });
  }
};

export const registerUser = async (data: Omit<User, 'role' | 'password'> & {password: string}): Promise<Omit<User, 'password'> | null> => {
    // Note: Passwords are sent plaintext over HTTPS, which is the standard security practice.
    // The backend is responsible for securely hashing and storing the password.
    if (USE_REAL_API) {
        try {
            const response = await apiClient.post<{ token: string; user: User }>('/api/auth/register', { ...data, role: UserRole.Citizen });
            localStorage.setItem(AUTH_TOKEN_KEY, response.token);
            const sanitized = sanitizeUser(response.user);
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sanitized));
            return sanitized;
        } catch (error) {
            console.error("API Registration failed:", error);
            return null;
        }
    } else {
        // Mock API Flow
        return new Promise((resolve) => {
            setTimeout(() => {
                try {
                    const newUser: User = { ...data, role: UserRole.Citizen };
                    const createdUser = mockApi.addUser(newUser);
                    const userToStore = sanitizeUser(createdUser);
                    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userToStore));
                    resolve(userToStore);
                } catch (error) {
                    console.error("Registration failed:", error);
                    resolve(null);
                }
            }, 500);
        });
    }
};

export const logoutUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
  localStorage.removeItem(AUTH_TOKEN_KEY);
};

export const getCurrentUser = (): Omit<User, 'password'> | null => {
  const userJson = localStorage.getItem(CURRENT_USER_KEY);
  return userJson ? JSON.parse(userJson) : null;
};

export const updateUserToken = (token: string) => {
    // This function is now primarily for the mock flow, where the "token" is the stringified user.
    // In the real API flow, the JWT is stored separately and doesn't need this update mechanism.
    // However, we can use it to update the cached user object in both flows.
    const user = JSON.parse(token);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
};