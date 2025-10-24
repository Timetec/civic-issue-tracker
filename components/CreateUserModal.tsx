import React, { useState } from 'react';
import type { User } from '../types';
import { UserRole } from '../types';
import * as userService from '../services/userService';
import { Modal } from './Modal';
import { Spinner } from './Icons';

interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUserCreated: () => void;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onUserCreated }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>(UserRole.Worker);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const resetForm = () => {
        setFirstName('');
        setLastName('');
        setEmail('');
        setMobileNumber('');
        setPassword('');
        setRole(UserRole.Worker);
        setError('');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }

        setIsLoading(true);
        const newUser: User = { firstName, lastName, email, mobileNumber, password, role };
        
        try {
            await userService.adminCreateUser(newUser);
            resetForm();
            onUserCreated();
        } catch (err) {
            setError((err as Error).message || 'Failed to create user.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <div className="p-4 md:p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Create New User</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <input name="firstName" type="text" required className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-gray-200 bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                        <input name="lastName" type="text" required className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-gray-200 bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                    </div>
                    <input name="email" type="email" required className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-gray-200 bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <input name="mobileNumber" type="tel" required className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-gray-200 bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Mobile Number" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} />
                    <input name="password" type="password" required className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-gray-200 bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Initial Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                        <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value as UserRole)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                        >
                            <option value={UserRole.Worker}>Worker</option>
                            <option value={UserRole.Service}>Service</option>
                        </select>
                    </div>

                    {error && <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>}
                    
                    <div className="flex justify-end space-x-4 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 flex justify-center items-center min-w-[120px]"
                        >
                            {isLoading ? <Spinner className="h-5 w-5" /> : 'Create User'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};
