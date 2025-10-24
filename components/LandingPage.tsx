
import React from 'react';
import { PlusIcon } from './Icons';
import type { User } from '../types';

interface LandingPageProps {
  onGetStarted: () => void;
  currentUser?: Omit<User, 'password'> | null;
  onGoToDashboard?: () => void;
  onLogout?: () => void;
  onReportIssueNow?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, currentUser, onGoToDashboard, onLogout, onReportIssueNow }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <header className="absolute top-0 left-0 right-0 z-10">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">Civic Issue Tracker</h1>
          {currentUser && onGoToDashboard && onLogout ? (
            <div className="flex items-center space-x-4">
              <button 
                onClick={onGoToDashboard}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Go to Dashboard
              </button>
              <button 
                onClick={onLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Logout
              </button>
            </div>
          ) : (
            <button 
              onClick={onGetStarted}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Login / Sign Up
            </button>
          )}
        </nav>
      </header>
      
      <main>
        <div className="relative pt-16 pb-32 flex content-center items-center justify-center min-h-screen-75">
          <div className="absolute top-0 w-full h-full bg-center bg-cover"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1599389392885-2023a6358178?q=80&w=2940&auto=format&fit=crop')" }}>
            <span id="blackOverlay" className="w-full h-full absolute opacity-75 bg-black"></span>
          </div>
          <div className="container relative mx-auto">
              <div className="items-center flex flex-wrap">
                <div className="w-full lg:w-6/12 px-4 ml-auto mr-auto text-center">
                  <div className="pr-12">
                    <h1 className="text-white font-semibold text-5xl">
                      Improve Your Community.
                    </h1>
                    <p className="mt-4 text-lg text-gray-300">
                      See an issue? A pothole, graffiti, or a broken streetlight? Report it in seconds.
                      Our platform connects you with local authorities to get things fixed, fast.
                    </p>
                    <button 
                      onClick={currentUser && onReportIssueNow ? onReportIssueNow : onGetStarted}
                      className="mt-12 px-8 py-4 text-lg font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 inline-flex items-center"
                    >
                      <PlusIcon className="h-6 w-6 mr-2" />
                      Report an Issue Now
                    </button>
                  </div>
                </div>
              </div>
          </div>
        </div>

        <section className="pb-20 bg-gray-200 dark:bg-gray-800 -mt-24">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap">
              <div className="lg:pt-12 pt-6 w-full md:w-4/12 px-4 text-center">
                <div className="relative flex flex-col min-w-0 break-words bg-white dark:bg-gray-700 w-full mb-8 shadow-lg rounded-lg">
                  <div className="px-4 py-5 flex-auto">
                    <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-red-400">
                      1
                    </div>
                    <h6 className="text-xl font-semibold">Snap a Photo</h6>
                    <p className="mt-2 mb-4 text-gray-600 dark:text-gray-400">
                      Use your phone to take a picture of the civic issue. Our app automatically gets the location.
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-4/12 px-4 text-center">
                <div className="relative flex flex-col min-w-0 break-words bg-white dark:bg-gray-700 w-full mb-8 shadow-lg rounded-lg">
                  <div className="px-4 py-5 flex-auto">
                    <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-blue-400">
                      2
                    </div>
                    <h6 className="text-xl font-semibold">AI-Powered Report</h6>
                    <p className="mt-2 mb-4 text-gray-600 dark:text-gray-400">
                      Add a brief description. Our AI categorizes the issue and creates a title, sending it to the right department.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 w-full md:w-4/12 px-4 text-center">
                <div className="relative flex flex-col min-w-0 break-words bg-white dark:bg-gray-700 w-full mb-8 shadow-lg rounded-lg">
                  <div className="px-4 py-5 flex-auto">
                    <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-green-400">
                      3
                    </div>
                    <h6 className="text-xl font-semibold">Track to Resolution</h6>
                    <p className="mt-2 mb-4 text-gray-600 dark:text-gray-400">
                      Get updates on your report and see other issues being resolved in your community.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative bg-gray-200 dark:bg-gray-800 pt-8 pb-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center md:justify-between justify-center">
            <div className="w-full md:w-4/12 px-4 mx-auto text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400 font-semibold py-1">
                Copyright © {new Date().getFullYear()} Civic Issue Tracker
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};