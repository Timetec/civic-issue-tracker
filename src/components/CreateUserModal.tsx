import React, { useState } from 'react';
import { Modal } from './Modal';
import { Spinner, MapPinIcon } from './Icons';
import type { User } from '../types';
import { UserRole } from '../types';
import { MapModal } from './MapModal';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateUser: (data: Omit<User, 'role'>, role: UserRole.Worker | UserRole.Service) => Promise<boolean>;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onCreateUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [role, setRole] = useState<UserRole.Worker | UserRole.Service>(UserRole.Worker);
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setMobileNumber('');
    setRole(UserRole.Worker);
    setLocation(null);
    setError(null);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(role === UserRole.Worker && !location) {
        setError("Worker role requires a location to be set.");
        return;
    }

    setIsSubmitting(true);
    setError(null);
    const success = await onCreateUser({
      email,
      password,
      firstName,
      lastName,
      mobileNumber,
      location: location || undefined,
    }, role);

    if (success) {
      handleClose();
    } else {
      setError('Failed to create user. The email might already be in use.');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title="Create New User">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
              <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 px-3 py-2" />
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
              <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} required className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 px-3 py-2" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mobile Number</label>
            <input type="tel" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} required className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
            <select value={role} onChange={e => setRole(e.target.value as UserRole.Worker | UserRole.Service)} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 px-3 py-2">
              <option value={UserRole.Worker}>Worker</option>
              <option value={UserRole.Service}>Service</option>
            </select>
          </div>

          {role === UserRole.Worker && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
              {location ? (
                <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
                </div>
              ) : (
                <div className="mt-1 text-sm text-gray-500 italic">Location not set</div>
              )}
              <button
                type="button"
                onClick={() => setIsMapModalOpen(true)}
                className="mt-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"
              >
                <MapPinIcon className="h-4 w-4 mr-1" />
                {location ? 'Change Location' : 'Set Location'}
              </button>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-indigo-400 flex items-center">
              {isSubmitting && <Spinner className="h-4 w-4 mr-2" />}
              Create User
            </button>
          </div>
        </form>
      </Modal>
      <MapModal 
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        initialCenter={location || { lat: 34.0522, lng: -118.2437 }} // Default to LA
        onConfirm={(loc) => {
            setLocation(loc);
            setIsMapModalOpen(false);
        }}
        title="Set Worker Location"
        confirmText="Confirm Location"
      />
    </>
  );
};