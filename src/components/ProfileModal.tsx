import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import { Modal } from './Modal';
import { Spinner, MapPinIcon } from './Icons';
import { MapModal } from './MapModal';
import { StaticMapPreview } from './StaticMapPreview';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: Omit<User, 'password'> | null;
  onUpdateProfile: (data: { firstName: string, lastName: string, mobileNumber: string }) => Promise<boolean>;
  onChangePassword: (oldPass: string, newPass: string) => Promise<boolean>;
  onUpdateLocation: (location: {lat: number, lng: number}) => Promise<boolean>;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, onUpdateProfile, onChangePassword, onUpdateLocation }) => {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'password'
  
  // Profile state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  
  // Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setMobileNumber(user.mobileNumber);
    }
     // Reset state on open/close
    setMessage(null);
    setIsSubmitting(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setActiveTab('profile');
  }, [isOpen, user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    const success = await onUpdateProfile({ firstName, lastName, mobileNumber });
    if (success) {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } else {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    }
    setIsSubmitting(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    setIsSubmitting(true);
    setMessage(null);
    const success = await onChangePassword(oldPassword, newPassword);
    if (success) {
      setMessage({ type: 'success', text: 'Password changed successfully!' });
       setOldPassword('');
       setNewPassword('');
       setConfirmPassword('');
    } else {
      setMessage({ type: 'error', text: 'Failed to change password. Check your old password.' });
    }
    setIsSubmitting(false);
  };

  const handleLocationConfirm = async (location: {lat: number, lng: number}) => {
    setIsMapModalOpen(false);
    setIsSubmitting(true);
    setMessage(null);
    const success = await onUpdateLocation(location);
    if(success) {
        setMessage({ type: 'success', text: 'Location updated!' });
    } else {
        setMessage({ type: 'error', text: 'Failed to update location.' });
    }
    setIsSubmitting(false);
  }

  if (!user) return null;

  return (
    <>
    <Modal isOpen={isOpen} onClose={onClose} title="My Profile">
      <div className="space-y-4">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            <button onClick={() => setActiveTab('profile')} className={`${activeTab === 'profile' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>
              Profile
            </button>
            <button onClick={() => setActiveTab('password')} className={`${activeTab === 'password' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>
              Password
            </button>
             {user.role === 'Worker' && (
                <button onClick={() => setActiveTab('location')} className={`${activeTab === 'location' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>
                    Location
                </button>
            )}
          </nav>
        </div>

        {message && (
          <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200'}`}>
            {message.text}
          </div>
        )}

        {activeTab === 'profile' && (
          <form onSubmit={handleProfileUpdate} className="space-y-4">
             <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input type="email" value={user.email} disabled className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-3 py-2" />
            </div>
            <div className="flex gap-4">
                <div className="w-1/2">
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                    <input type="text" id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 px-3 py-2" />
                </div>
                <div className="w-1/2">
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                    <input type="text" id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 px-3 py-2" />
                </div>
            </div>
            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mobile Number</label>
              <input type="tel" id="mobile" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 px-3 py-2" />
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400">
              {isSubmitting ? <Spinner className="h-5 w-5" /> : 'Save Changes'}
            </button>
          </form>
        )}
        
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
                <label htmlFor="old-pass" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Old Password</label>
                <input type="password" id="old-pass" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 px-3 py-2" />
            </div>
             <div>
                <label htmlFor="new-pass" className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                <input type="password" id="new-pass" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 px-3 py-2" />
            </div>
             <div>
                <label htmlFor="confirm-pass" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
                <input type="password" id="confirm-pass" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 px-3 py-2" />
            </div>
             <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400">
              {isSubmitting ? <Spinner className="h-5 w-5" /> : 'Change Password'}
            </button>
          </form>
        )}

        {activeTab === 'location' && user.role === 'Worker' && (
            <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Set your work location to be automatically assigned issues near you.</p>
                {user.location ? (
                    <StaticMapPreview location={user.location} className="h-40 w-full rounded-md" />
                ) : (
                    <div className="h-40 w-full rounded-md bg-gray-200 dark:bg-gray-700 flex flex-col items-center justify-center">
                        <MapPinIcon className="h-8 w-8 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">No location set</p>
                    </div>
                )}
                <button
                    onClick={() => setIsMapModalOpen(true)}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    {user.location ? 'Update Location' : 'Set Location'}
                </button>
            </div>
        )}
      </div>
    </Modal>
    {user.location && (
        <MapModal 
            isOpen={isMapModalOpen}
            onClose={() => setIsMapModalOpen(false)}
            initialCenter={user.location || { lat: 34.0522, lng: -118.2437 }} // Default to LA
            onConfirm={handleLocationConfirm}
            title="Update Your Location"
            confirmText="Save Location"
        />
    )}
    </>
  );
};