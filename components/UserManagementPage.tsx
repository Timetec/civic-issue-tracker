
import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import { UserRole } from '../types';
import * as userService from '../services/userService';
import { Spinner, PlusIcon } from './Icons';
import { CreateUserModal } from './CreateUserModal';

interface UserManagementPageProps {
    currentUser: Omit<User, 'password'>;
    onUsersUpdate: () => void;
}

export const UserManagementPage: React.FC<UserManagementPageProps> = ({ currentUser, onUsersUpdate }) => {
    const [users, setUsers] = useState<Omit<User, 'password'>[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState<Record<string, { lat: string; lng: string }>>({});

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const allUsers = await userService.getAllUsers();
            setUsers(allUsers);
        } catch (err) {
            setError('Failed to fetch users. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (email: string, newRole: UserRole) => {
        try {
            const updatedUser = await userService.adminUpdateUserRole(email, newRole);
            setUsers(currentUsers =>
                currentUsers.map(u => (u.email === email ? updatedUser : u))
            );
            onUsersUpdate();
        } catch (err) {
            alert('Failed to update user role.');
            console.error(err);
        }
    };
    
    const handleLocationChange = (email: string, coord: 'lat' | 'lng', value: string) => {
        const currentUser = users.find(u => u.email === email);
        const currentLat = currentUser?.location?.lat.toString() ?? '';
        const currentLng = currentUser?.location?.lng.toString() ?? '';

        setEditingLocation(prev => ({
            ...prev,
            [email]: {
                lat: coord === 'lat' ? value : (prev[email]?.lat ?? currentLat),
                lng: coord === 'lng' ? value : (prev[email]?.lng ?? currentLng),
            }
        }));
    };

    const handleSetLocation = async (email: string) => {
        const location = editingLocation[email];
        if (!location || !location.lat || !location.lng) {
            alert('Please provide both latitude and longitude.');
            return;
        }
        
        const lat = parseFloat(location.lat);
        const lng = parseFloat(location.lng);

        if (isNaN(lat) || isNaN(lng)) {
            alert('Invalid latitude or longitude. Please enter numbers only.');
            return;
        }

        try {
            const updatedUser = await userService.adminSetUserLocation(email, { lat, lng });
            setUsers(currentUsers =>
                currentUsers.map(u => (u.email === email ? updatedUser : u))
            );
            setEditingLocation(prev => {
                const next = {...prev};
                delete next[email];
                return next;
            });
            onUsersUpdate();
        } catch (err) {
            alert('Failed to set location.');
            console.error(err);
        }
    };


    const handleUserCreated = () => {
        setIsModalOpen(false);
        fetchUsers(); // Refetch users to include the new one
        onUsersUpdate();
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-8">
                <Spinner className="h-8 w-8 text-indigo-600" />
            </div>
        );
    }

    if (error) {
        return <div className="text-center p-8 text-red-500">{error}</div>;
    }

    return (
        <div className="p-4 md:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">User Management</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Create User
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contact</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location (Lat, Lng)</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {users.map(user => (
                            <tr key={user.email}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{user.firstName} {user.lastName}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 dark:text-gray-300">{user.email}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{user.mobileNumber}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user.email, e.target.value as UserRole)}
                                        disabled={user.email === currentUser.email}
                                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-700"
                                    >
                                        {Object.values(UserRole).map(role => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </select>
                                </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {user.role === UserRole.Worker ? (
                                        <div className="flex flex-col space-y-2 w-48">
                                            <div className="flex items-center space-x-1">
                                                <input type="text" placeholder="Latitude" defaultValue={user.location?.lat ?? ''} onChange={(e) => handleLocationChange(user.email, 'lat', e.target.value)} className="appearance-none relative block w-full px-2 py-1 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-gray-200 bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm" />
                                                <input type="text" placeholder="Longitude" defaultValue={user.location?.lng ?? ''} onChange={(e) => handleLocationChange(user.email, 'lng', e.target.value)} className="appearance-none relative block w-full px-2 py-1 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-gray-200 bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm" />
                                            </div>
                                            <button onClick={() => handleSetLocation(user.email)} className="w-full text-xs px-2 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-400" disabled={!editingLocation[user.email]}>
                                                Set Location
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 dark:text-gray-500 italic">N/A for this role</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <CreateUserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onUserCreated={handleUserCreated}
            />
        </div>
    );
};
