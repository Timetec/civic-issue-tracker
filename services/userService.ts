import type { User, UserRole } from '../types';
import * as api from './mockApi';
import * as authService from './authService';


export const getAllUsers = (): Promise<Omit<User, 'password'>[]> => {
  return api.apiAdminGetAllUsers();
};

export const adminUpdateUserRole = (email: string, newRole: UserRole): Promise<Omit<User, 'password'>> => {
    return api.apiAdminUpdateUserRole(email, newRole);
};

export const adminSetUserLocation = (email: string, location: { lat: number; lng: number }): Promise<Omit<User, 'password'>> => {
    return api.apiAdminSetUserLocation(email, location);
};

export const adminCreateUser = (userData: User): Promise<Omit<User, 'password'>> => {
    return api.apiAdminCreateUser(userData);
};

// --- User Self-Service ---
export const updateMyProfile = (data: { firstName: string, lastName: string, mobileNumber: string }): Promise<{ user: Omit<User, 'password'>, token: string }> => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) throw new Error("Not authenticated");
    return api.apiUpdateMyProfile(currentUser.email, data);
};

export const changeMyPassword = (oldPass: string, newPass: string): Promise<void> => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) throw new Error("Not authenticated");
    return api.apiChangeMyPassword(currentUser.email, oldPass, newPass);
};

export const updateMyLocation = (location: { lat: number, lng: number }): Promise<Omit<User, 'password'>> => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) throw new Error("Not authenticated");
    return api.apiUpdateMyLocation(currentUser.email, location);
};