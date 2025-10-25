import React, { useState, useEffect, useCallback } from 'react';
import type { User } from '../types';
import { UserRole } from '../types';
import * as userService from '../services/userService';
import { CreateUserModal } from './CreateUserModal';
import { Spinner, PlusIcon } from './Icons';

interface UserManagementPageProps {
    currentUser: User;
    onUsersUpdate: () => Promise<void>;
}

export const UserManagementPage: React.FC<UserManagementPageProps> = ({ currentUser, onUsersUpdate }) => {
    const [users, setUsers] = useState<Omit<User, 'password'>[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const allUsers = await userService.getAllUsers();
            setUsers(allUsers);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);
    
    const handleCreateUser = async (data: Omit<User, 'role'>, role: UserRole.Worker | UserRole.Service) => {
        try {
            await userService.createNewUser(data, role);
            await fetchUsers(); // Refresh user list
            await onUsersUpdate(); // Refresh main app data (e.g. workers list for assignment)
            return true;
        } catch (error) {
            console.error("Failed to create user:", error);
            return false;
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Spinner className="h-10 w-10 text-indigo-600" /></div>;
    }

    return (
        <>
            <div className="p-4 md:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">User Management</h2>
                    <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 flex items-center">
                        <PlusIcon className="h-5 w-5 mr-1" />
                        Create User
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {users.map((user) => (
                                <tr key={user.email}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{user.firstName} {user.lastName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.role}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <CreateUserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreateUser={handleCreateUser} />
        </>
    );
};