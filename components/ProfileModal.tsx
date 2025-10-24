import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import { UserRole } from '../types';
import { Modal } from './Modal';
import { Spinner } from './Icons';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: Omit<User, 'password'> | null;
  onUpdateProfile: (data: { firstName: string, lastName: string, mobileNumber: string }) => Promise<boolean>;
  onChangePassword: (oldPass: string, newPass: string) => Promise<boolean>;
  onUpdateLocation: (location: { lat: number, lng: number }) => Promise<boolean>;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, onUpdateProfile, onChangePassword, onUpdateLocation }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setMobileNumber(user.mobileNumber);
      setLat(user.location?.lat?.toString() || '');
      setLng(user.location?.lng?.toString() || '');
    }
  }, [user]);

  const handleClose = () => {
    setIsEditing(false);
    setError('');
    setSuccess('');
    setOldPassword('');
    setNewPassword('');
    // Reset fields to original user data on close
    if (user) {
        setFirstName(user.firstName);
        setLastName(user.lastName);
        setMobileNumber(user.mobileNumber);
        setLat(user.location?.lat.toString() || '');
        setLng(user.location?.lng.toString() || '');
    }
    onClose();
  };
  
  const showSuccessMessage = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const success = await onUpdateProfile({ firstName, lastName, mobileNumber });
    setIsLoading(false);
    if (success) {
      setIsEditing(false);
      showSuccessMessage('Profile updated successfully!');
    } else {
      setError('Failed to update profile.');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(newPassword.length < 8) {
        setError('New password must be at least 8 characters long.');
        return;
    }
    setIsLoading(true);
    setError('');
    const success = await onChangePassword(oldPassword, newPassword);
    setIsLoading(false);
    if (success) {
      setOldPassword('');
      setNewPassword('');
      showSuccessMessage('Password changed successfully!');
    } else {
      setError('Failed to change password. Check your current password.');
    }
  };
  
  const handleLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (isNaN(latNum) || isNaN(lngNum)) {
        setError('Latitude and Longitude must be valid numbers.');
        return;
    }
    setIsLoading(true);
    setError('');
    const success = await onUpdateLocation({ lat: latNum, lng: lngNum });
    setIsLoading(false);
    if(success) {
        showSuccessMessage('Location updated successfully!');
    } else {
        setError('Failed to update location.');
    }
  };

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="p-6">
        <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">My Profile</h2>
            {!isEditing && (
                 <button onClick={() => setIsEditing(true)} className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">Edit Profile</button>
            )}
        </div>
        
        {error && <p className="text-sm text-red-500 dark:text-red-400 text-center mb-4">{error}</p>}
        {success && <p className="text-sm text-green-600 dark:text-green-400 text-center mb-4">{success}</p>}

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
            <p className="text-lg text-gray-700 dark:text-gray-300 mt-1">{user.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">First Name</label>
            <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} disabled={!isEditing} className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 disabled:bg-gray-200 dark:disabled:bg-gray-600 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Last Name</label>
            <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} disabled={!isEditing} className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 disabled:bg-gray-200 dark:disabled:bg-gray-600 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Mobile Number</label>
            <input type="text" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} disabled={!isEditing} className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 disabled:bg-gray-200 dark:disabled:bg-gray-600 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" />
          </div>
          {isEditing && (
             <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm rounded-md bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200">Cancel</button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm rounded-md bg-indigo-600 text-white flex items-center">{isLoading && <Spinner className="h-4 w-4 mr-2" />} Save Changes</button>
             </div>
          )}
        </form>

        {user.role === UserRole.Worker && (
             <form onSubmit={handleLocationSubmit} className="space-y-4 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">My Location</h3>
                <div className="flex space-x-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Latitude</label>
                        <input type="text" value={lat} onChange={e => setLat(e.target.value)} className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Longitude</label>
                        <input type="text" value={lng} onChange={e => setLng(e.target.value)} className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" />
                    </div>
                </div>
                 <div className="flex justify-end">
                    <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm rounded-md bg-indigo-600 text-white flex items-center">{isLoading && <Spinner className="h-4 w-4 mr-2" />} Update Location</button>
                 </div>
             </form>
        )}

        <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Change Password</h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-4 mt-2">
                <input type="password" placeholder="Current Password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" />
                <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" />
                <div className="flex justify-end">
                    <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm rounded-md bg-red-600 text-white flex items-center">{isLoading && <Spinner className="h-4 w-4 mr-2" />} Change Password</button>
                </div>
            </form>
        </div>

      </div>
    </Modal>
  );
};