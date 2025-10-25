import React from 'react';
import type { User } from '../types';
import { LogoutIcon, UserCircleIcon } from './Icons';

interface LandingPageProps {
  onGetStarted: () => void;
  currentUser: Omit<User, 'password'> | null;
  onGoToDashboard: () => void;
  onLogout?: () => void;
  onReportIssueNow: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, currentUser, onGoToDashboard, onLogout, onReportIssueNow }) => {
  return (
    <div className="relative bg-gray-50 dark:bg-gray-900 overflow-hidden min-h-screen">
      <div className="hidden sm:block sm:absolute sm:inset-y-0 sm:h-full sm:w-full" aria-hidden="true">
        <div className="relative h-full max-w-7xl mx-auto">
          <svg className="absolute right-full transform translate-y-1/4 translate-x-1/4 lg:translate-x-1/2" width="404" height="784" fill="none" viewBox="0 0 404 784">
            <defs>
              <pattern id="f210dbf6-a58d-4871-961e-36d5016a0f49" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <rect x="0" y="0" width="4" height="4" className="text-gray-200 dark:text-gray-700" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="404" height="784" fill="url(#f210dbf6-a58d-4871-961e-36d5016a0f49)" />
          </svg>
          <svg className="absolute left-full transform -translate-y-3/4 -translate-x-1/4 md:-translate-y-1/2 lg:-translate-x-1/2" width="404" height="784" fill="none" viewBox="0 0 404 784">
            <defs>
              <pattern id="5d0dd344-b041-4d26-bec4-8d33ea57b289" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <rect x="0" y="0" width="4" height="4" className="text-gray-200 dark:text-gray-700" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="404" height="784" fill="url(#5d0dd344-b041-4d26-bec4-8d33ea57b289)" />
          </svg>
        </div>
      </div>

      <div className="relative pt-6 pb-16 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="relative flex items-center justify-between sm:h-10 md:justify-center" aria-label="Global">
            <div className="flex items-center flex-1 md:absolute md:inset-y-0 md:left-0">
              <div className="flex items-center justify-between w-full md:w-auto">
                <a href="#">
                  <span className="sr-only">Civic Issue Tracker</span>
                  <img className="h-8 w-auto sm:h-10" src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg" alt="Logo" />
                </a>
              </div>
            </div>
            <div className="md:absolute md:inset-y-0 md:right-0 md:flex md:items-center md:justify-end">
              {currentUser ? (
                <div className="flex items-center space-x-4">
                    <span className="font-medium text-gray-600 dark:text-gray-300">Welcome, {currentUser.firstName}</span>
                    <button onClick={onGoToDashboard} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                        <UserCircleIcon className="h-5 w-5 mr-2" />
                        My Dashboard
                    </button>
                    <button onClick={onLogout} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
                        <LogoutIcon className="h-6 w-6" />
                    </button>
                </div>
              ) : (
                <span className="inline-flex rounded-md shadow">
                  <button onClick={onGetStarted} className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50">
                    Log in
                  </button>
                </span>
              )}
            </div>
          </nav>
        </div>

        <main className="mt-16 mx-auto max-w-7xl px-4 sm:mt-24">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              <span className="block">A better way to</span>
              <span className="block text-indigo-600">report civic issues.</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Our AI-powered platform helps you report neighborhood problems quickly and track them to resolution. See an issue? Report it in seconds.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <button onClick={onReportIssueNow} className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10">
                  Report an issue now
                </button>
              </div>
              {!currentUser &&
                <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                    <button onClick={onGetStarted} className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10">
                    Register
                    </button>
                </div>
              }
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};