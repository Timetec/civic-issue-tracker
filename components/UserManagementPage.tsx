import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import { UserRole } from '../types';
import * as userService from '../services/userService';
import { Spinner, PlusIcon, LocationMarkerIcon } from './Icons';
import { CreateUserModal } from './CreateUserModal';
import { MapModal } from './MapModal';

interface UserManagementPageProps {
    currentUser: Omit<User, 'password'>;
    onUsersUpdate: () => void;
}

export const UserManagementPage: React.FC<UserManagementPageProps> = ({ currentUser, onUsersUpdate }) => {
    const [users, setUsers] = useState<Omit<User, 'password'>[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const [selectedUserForMap, setSelectedUserForMap] = useState<Omit<User, 'password'> | null>(null);


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

    const openMapForUser = (user: Omit<User, 'password'>) => {
        setSelectedUserForMap(user);
        setIsMapModalOpen(true);
    };

    const handleSetLocation = async (location: { lat: number, lng: number }) => {
        if (!selectedUserForMap) return;

        try {
            const updatedUser = await userService.adminSetUserLocation(selectedUserForMap.email, location);
            setUsers(currentUsers =>
                currentUsers.map(u => (u.email === selectedUserForMap.email ? updatedUser : u))
            );
            onUsersUpdate();
            setIsMapModalOpen(false);
            setSelectedUserForMap(null);
        } catch (err) {
            alert('Failed to set location.');
            console.error(err);
        }
    };


    const handleUserCreated = () => {
        setIsCreateModalOpen(false);
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
                    onClick={() => setIsCreateModalOpen(true)}
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
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location</th>
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
                                        <div className="flex flex-col items-start">
                                            {user.location ? (
                                                <span className="text-xs font-mono">{user.location.lat.toFixed(4)}, {user.location.lng.toFixed(4)}</span>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">Not set</span>
                                            )}
                                            <button onClick={() => openMapForUser(user)} className="mt-1 text-xs px-2 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 flex items-center">
                                                <LocationMarkerIcon className="h-3 w-3 mr-1" />
                                                {user.location ? 'Edit' : 'Set'} Location
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
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onUserCreated={handleUserCreated}
            />

            {selectedUserForMap && (
                <MapModal 
                    isOpen={isMapModalOpen}
                    onClose={() => setIsMapModalOpen(false)}
                    initialCenter={selectedUserForMap.location || { lat: 34.0522, lng: -118.2437 }} // Default to LA
                    onConfirm={handleSetLocation}
                />
            )}
        </div>
    );
};