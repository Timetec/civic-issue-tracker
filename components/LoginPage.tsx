import React, { useState } from 'react';
import { Spinner } from './Icons';

interface LoginPageProps {
  onLogin: (email: string, pass: string) => Promise<boolean>;
  onRegister: (data: {email: string, pass: string, firstName: string, lastName: string, mobileNumber: string}) => Promise<boolean>;
  onBackToLanding: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onRegister, onBackToLanding }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    let success = false;
    if (isLoginView) {
      success = await onLogin(email, password);
      if (!success) setError('Invalid email or password.');
    } else {
      success = await onRegister({ email, pass: password, firstName, lastName, mobileNumber });
      if (!success) setError('User already exists or password is too short.');
    }
    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg relative">
        <button onClick={onBackToLanding} className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            &larr; Back
        </button>
        <div>
          <h2 className="text-3xl font-extrabold text-center text-gray-900 dark:text-white mt-6">
            {isLoginView ? 'Sign in to your account' : 'Create a new account'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Or{' '}
            <button
              onClick={() => {
                setIsLoginView(!isLoginView);
                setError('');
              }}
              className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
            >
              {isLoginView ? 'create an account' : 'sign in'}
            </button>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            {!isLoginView && (
              <div className="flex space-x-4">
                <input name="firstName" type="text" required className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-gray-200 bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                <input name="lastName" type="text" required className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-gray-200 bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            )}
             {!isLoginView && (
                <input name="mobileNumber" type="tel" required className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-gray-200 bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Mobile Number" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} />
            )}
            <input id="email-address" name="email" type="email" autoComplete="email" required className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-gray-200 bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input id="password" name="password" type="password" autoComplete={isLoginView ? "current-password" : "new-password"} required className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-gray-200 bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          
          {error && <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 dark:disabled:bg-indigo-800"
            >
              {isLoading && <Spinner className="h-5 w-5 mr-3" />}
              {isLoginView ? 'Sign in' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
