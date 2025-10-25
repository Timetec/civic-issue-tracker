import React, { useState } from 'react';
import { Spinner } from './Icons';

interface LoginPageProps {
  onLogin: (email: string, pass: string) => Promise<boolean>;
  onRegister: (data: { email: string; pass: string; firstName: string; lastName: string; mobileNumber: string; }) => Promise<boolean>;
  onBackToLanding: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onRegister, onBackToLanding }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobile, setMobile] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const success = await onLogin(email, password);
    if (!success) {
      setError('Invalid email or password.');
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setIsLoading(true);
    setError('');
    const success = await onRegister({
      email,
      pass: password,
      firstName,
      lastName,
      mobileNumber: mobile,
    });
    if (!success) {
        setError('Registration failed. This email may already be in use.');
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <button onClick={onBackToLanding} className="absolute top-4 left-4 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">&larr; Back to Home</button>
      <div className="max-w-md w-full space-y-8 p-10 bg-white dark:bg-gray-800 shadow-lg rounded-xl">
        <div>
          <img className="mx-auto h-12 w-auto" src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg" alt="Workflow" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {isLoginView ? 'Sign in to your account' : 'Create a new account'}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={isLoginView ? handleLoginSubmit : handleRegisterSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            {!isLoginView && (
              <>
                <div className="flex gap-4">
                    <input id="first-name" name="firstName" type="text" required value={firstName} onChange={e => setFirstName(e.target.value)} className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-200 bg-white dark:bg-gray-700 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="First Name" />
                    <input id="last-name" name="lastName" type="text" required value={lastName} onChange={e => setLastName(e.target.value)} className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-200 bg-white dark:bg-gray-700 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Last Name" />
                </div>
                <input id="mobile" name="mobile" type="tel" required value={mobile} onChange={e => setMobile(e.target.value)} className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-200 bg-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Mobile Number" />
              </>
            )}
            <input id="email-address" name="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-200 bg-white dark:bg-gray-700 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Email address" />
            <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-200 bg-white dark:bg-gray-700 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Password" />
             {!isLoginView && (
                <input id="confirm-password" name="confirmPassword" type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-200 bg-white dark:bg-gray-700 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Confirm Password" />
            )}
          </div>
          {error && <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>}
          <div>
            <button type="submit" disabled={isLoading} className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400">
              {isLoading && <Spinner className="h-5 w-5 mr-3" />}
              {isLoginView ? 'Sign in' : 'Register'}
            </button>
          </div>
          <div className="text-center text-sm">
            <button type="button" onClick={() => { setIsLoginView(!isLoginView); setError(''); }} className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
              {isLoginView ? 'Need an account? Register' : 'Already have an account? Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
