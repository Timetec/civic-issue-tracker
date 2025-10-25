import React, { useState } from 'react';
import { Spinner, MailIcon, LockClosedIcon, UserIcon, PhoneIcon } from './Icons';

interface LoginPageProps {
  onLogin: (email: string, pass: string) => Promise<boolean>;
  onRegister: (data: { email: string; pass: string; firstName: string; lastName: string; mobileNumber: string; }) => Promise<boolean>;
  onBackToLanding: () => void;
}

// Moved InputField outside the LoginPage component to prevent re-creation on every render.
// This solves the "losing focus" bug when typing.
const InputField: React.FC<{
  id: string, 
  name: string, 
  type: string, 
  placeholder: string, 
  value: string, 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, 
  icon: React.ReactNode,
  required?: boolean
}> = ({ id, name, type, placeholder, value, onChange, icon, required = true }) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      {icon}
    </div>
    <input
      id={id}
      name={name}
      type={type}
      required={required}
      value={value}
      onChange={onChange}
      className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
      placeholder={placeholder}
    />
  </div>
);


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

  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setError('');
    // Reset fields when switching views for a cleaner experience
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFirstName('');
    setLastName('');
    setMobile('');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex">
      {/* Left side: The Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <button onClick={onBackToLanding} className="mb-6 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">&larr; Back to Home</button>
          <div>
            <img className="h-12 w-auto" src="/assets/logo.svg" alt="Civic Issue Tracker" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
              {isLoginView ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {isLoginView ? 'Sign in to continue.' : 'Join to start improving your community.'}
            </p>
          </div>

          <div className="mt-8">
            <div className="mt-6">
              <form onSubmit={isLoginView ? handleLoginSubmit : handleRegisterSubmit} className="space-y-6">
                 {error && (
                    <div className="bg-red-100 dark:bg-red-900/40 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded-md text-sm" role="alert">
                        {error}
                    </div>
                 )}

                {/* Registration Fields with transition */}
                <div className={`transition-all duration-500 ease-in-out overflow-hidden space-y-6 ${isLoginView ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100'}`}>
                    <div className="flex gap-4">
                        <InputField id="first-name" name="firstName" type="text" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} icon={<UserIcon className="h-5 w-5 text-gray-400" />} required={!isLoginView} />
                        <InputField id="last-name" name="lastName" type="text" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} icon={<UserIcon className="h-5 w-5 text-gray-400" />} required={!isLoginView} />
                    </div>
                     <InputField id="mobile" name="mobile" type="tel" placeholder="Mobile Number" value={mobile} onChange={e => setMobile(e.target.value)} icon={<PhoneIcon className="h-5 w-5 text-gray-400" />} required={!isLoginView} />
                </div>
                
                {/* Common Fields */}
                <InputField id="email-address" name="email" type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} icon={<MailIcon className="h-5 w-5 text-gray-400" />} />
                <InputField id="password" name="password" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} icon={<LockClosedIcon className="h-5 w-5 text-gray-400" />} />
                
                {/* Confirm Password with transition */}
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isLoginView ? 'max-h-0 opacity-0' : 'max-h-20 opacity-100'}`}>
                    {!isLoginView && (
                        <InputField id="confirm-password" name="confirmPassword" type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} icon={<LockClosedIcon className="h-5 w-5 text-gray-400" />} />
                    )}
                </div>

                <div>
                  <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed">
                    {isLoading && <Spinner className="h-5 w-5 mr-3" />}
                    {isLoginView ? 'Sign in' : 'Create Account'}
                  </button>
                </div>
              </form>
              <div className="mt-6 text-center text-sm">
                <button onClick={toggleView} className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                  {isLoginView ? 'Need an account? Register' : 'Already have an account? Sign in'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Right side: The Image/Gradient */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-indigo-600 to-purple-700 flex flex-col justify-center items-center p-12">
            <img src="/assets/logo.svg" alt="Logo" className="h-20 w-auto" />
            <h2 className="mt-8 text-3xl font-extrabold text-white text-center">
                Building Better Communities, Together.
            </h2>
            <p className="mt-4 text-indigo-200 text-center max-w-sm">
                Report issues, track progress, and see the tangible impact of your engagement.
            </p>
        </div>
      </div>
    </div>
  );
};