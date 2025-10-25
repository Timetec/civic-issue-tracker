import * as authService from './authService';
import * as mockApi from './mockApi';
import type { User } from '../types';
import { UserRole } from '../types';

export const getAllUsers = async (): Promise<Omit<User, 'password'>[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Fix: This line now works because `getUsers` is exported from `mockApi`.
            const allUsers = mockApi.getUsers();
            resolve(allUsers.map(({password, ...rest}) => rest));
        }, 300);
    });
};

export const createNewUser = async (data: Omit<User, 'role'>, role: UserRole.Worker | UserRole.Service): Promise<Omit<User, 'password'>> => {
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

    return new Promise((resolve) => {
        setTimeout(() => {
            const updatedUser = mockApi.updateUser(currentUser.email, data);
            const { password, ...sanitized } = updatedUser;
            // The "token" is just the stringified user in this mock setup
            resolve({ user: sanitized, token: JSON.stringify(sanitized) });
        }, 300);
    });
};

export const changeMyPassword = async (oldPass: string, newPass: string): Promise<void> => {
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

    return new Promise((resolve) => {
        setTimeout(() => {
            const updatedUser = mockApi.updateUser(currentUser.email, { location });
            const { password, ...sanitized } = updatedUser;
             // If the current user updated their own location, update the session storage too
            if (currentUser.email === sanitized.email) {
                authService.updateUserToken(JSON.stringify(sanitized));
            }
            resolve(sanitized);
        }, 200);
    });
};

export const updateUserLocationAdmin = async (email: string, location: {lat: number, lng: number}): Promise<Omit<User, 'password'>> => {
    const adminUser = authService.getCurrentUser();
    if (!adminUser || adminUser.role !== UserRole.Admin) throw new Error('Unauthorized');
    
    return new Promise((resolve) => {
        setTimeout(() => {
            const updatedUser = mockApi.updateUser(email, { location });
            const { password, ...sanitized } = updatedUser;
            resolve(sanitized);
        }, 200);
    });
};