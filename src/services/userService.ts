import * as authService from './authService';
import * as mockApi from './mockApi';
import * as apiClient from './apiClient';
import type { User } from '../types';
import { UserRole } from '../types';

const USE_REAL_API = !!process.env.VITE_API_BASE_URL;

export const getAllUsers = async (): Promise<Omit<User, 'password'>[]> => {
    if (USE_REAL_API) return apiClient.get<Omit<User, 'password'>[]>('/api/users');
    return new Promise((resolve) => {
        setTimeout(() => {
            const allUsers = mockApi.getUsers();
            resolve(allUsers.map(({password, ...rest}) => rest));
        }, 300);
    });
};

export const createNewUser = async (data: Omit<User, 'role'>, role: UserRole.Worker | UserRole.Service): Promise<Omit<User, 'password'>> => {
     if (USE_REAL_API) return apiClient.post<Omit<User, 'password'>>('/api/users', { ...data, role });
     return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                const newUser: User = { ...data, role };
                const createdUser = mockApi.addUser(newUser);
                const { password, ...sanitized } = createdUser;
                resolve(sanitized);
            } catch (error) {
                reject(error);
            }
        }, 500);
    });
};

export const updateMyProfile = async (data: {firstName: string, lastName: string, mobileNumber: string}): Promise<{user: Omit<User, 'password'>, token: string}> => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) throw new Error('Not authenticated');

    if (USE_REAL_API) {
        const updatedUser = await apiClient.put<Omit<User, 'password'>>('/api/users/me', data);
        // The "token" here is just the stringified user for consistency with mock API's auth update.
        // A real backend might not need to re-issue a token on profile update.
        const token = JSON.stringify(updatedUser);
        authService.updateUserToken(token); // Update cached user
        return { user: updatedUser, token };
    } else {
        return new Promise((resolve) => {
            setTimeout(() => {
                const updatedUser = mockApi.updateUser(currentUser.email, data);
                const { password, ...sanitized } = updatedUser;
                const token = JSON.stringify(sanitized);
                authService.updateUserToken(token); // Update cached user
                resolve({ user: sanitized, token });
            }, 300);
        });
    }
};

export const changeMyPassword = async (oldPass: string, newPass: string): Promise<void> => {
    if (USE_REAL_API) {
        await apiClient.put<void>('/api/users/me/password', { oldPassword: oldPass, newPassword: newPass });
        return;
    }
    const currentUser = authService.getCurrentUser();
    if (!currentUser) throw new Error('Not authenticated');
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const fullUser = mockApi.findUserByEmail(currentUser.email);
            if (fullUser && fullUser.password === oldPass) {
                mockApi.updateUser(currentUser.email, { password: newPass });
                resolve();
            } else {
                reject(new Error('Incorrect old password'));
            }
        }, 300);
    });
};

export const updateMyLocation = async (location: {lat: number, lng: number}): Promise<Omit<User, 'password'>> => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) throw new Error('Not authenticated');

    if (USE_REAL_API) {
        const updatedUser = await apiClient.put<Omit<User, 'password'>>('/api/users/me/location', location);
        if (currentUser.email === updatedUser.email) {
            authService.updateUserToken(JSON.stringify(updatedUser));
        }
        return updatedUser;
    } else {
        return new Promise((resolve) => {
            setTimeout(() => {
                const updatedUser = mockApi.updateUser(currentUser.email, { location });
                const { password, ...sanitized } = updatedUser;
                if (currentUser.email === sanitized.email) {
                    authService.updateUserToken(JSON.stringify(sanitized));
                }
                resolve(sanitized);
            }, 200);
        });
    }
};

// This admin-specific function is not part of the current UI flow but is kept for completeness.
export const updateUserLocationAdmin = async (email: string, location: {lat: number, lng: number}): Promise<Omit<User, 'password'>> => {
    const adminUser = authService.getCurrentUser();
    if (!adminUser || adminUser.role !== UserRole.Admin) throw new Error('Unauthorized');
    
    if (USE_REAL_API) {
        return apiClient.put<Omit<User, 'password'>>(`/api/users/${email}/location`, location);
    }
    
    return new Promise((resolve) => {
        setTimeout(() => {
            const updatedUser = mockApi.updateUser(email, { location });
            const { password, ...sanitized } = updatedUser;
            resolve(sanitized);
        }, 200);
    });
};
