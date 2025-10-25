import * as mockApi from './mockApi';
import type { User } from '../types';
import { UserRole } from '../types';

const CURRENT_USER_KEY = 'currentUser';

// Helper to remove password before returning user object
const sanitizeUser = (user: User): Omit<User, 'password'> => {
  const { password, ...sanitized } = user;
  return sanitized;
};

export const loginUser = async (email: string, pass: string): Promise<Omit<User, 'password'> | null> => {
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
};

export const registerUser = async (data: Omit<User, 'role'>): Promise<Omit<User, 'password'> | null> => {
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
};

export const logoutUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): Omit<User, 'password'> | null => {
  const userJson = localStorage.getItem(CURRENT_USER_KEY);
  return userJson ? JSON.parse(userJson) : null;
};

export const updateUserToken = (token: string) => {
    // In a real app, this would handle JWTs. Here we just re-save the user.
    const user = JSON.parse(token);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
};
