import React from 'react';
import type { User } from '../types';
import { LogoutIcon, UserCircleIcon, SparklesIcon, MapIcon, ClipboardCheckIcon, UserGroupIcon, LightBulbIcon, ChatBubbleLeftRightIcon } from './Icons';

interface LandingPageProps {
  onGetStarted: () => void;
  currentUser: Omit<User, 'password'> | null;
  onGoToDashboard: () => void;
  onLogout?: () => void;
  onReportIssueNow: () => void;
}

const features = [
    {
        name: 'AI-Powered Reporting',
        description: 'Just describe the issue and our AI will suggest a title and category, saving you time and effort.',
        icon: SparklesIcon,
    },
    {
        name: 'Interactive Map Location',
        description: 'Pinpoint the exact location of an issue on an interactive map for accurate dispatch and tracking.',
        icon: MapIcon,
    },
    {
        name: 'Real-time Status Tracking',
        description: 'Follow your report from "Pending" to "Resolved" with a clear and simple timeline view.',
        icon: ClipboardCheckIcon,
    },
    {
        name: 'Community Engagement',
        description: 'See recently resolved issues in your area, fostering transparency and community pride.',
        icon: UserGroupIcon,
    },
    {
        name: 'Direct Communication',
        description: 'Use the comments section to communicate with admins or workers for clarifications and updates.',
        icon: ChatBubbleLeftRightIcon,
    },
    {
        name: 'Resolution Feedback',
        description: 'Confirm that an issue has been resolved and rate the service to help improve your community.',
        icon: LightBulbIcon,
    },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, currentUser, onGoToDashboard, onLogout, onReportIssueNow }) => {
  return (
    <div className="bg-white dark:bg-gray-800">
      <div className="relative overflow-hidden">
        {/* Header */}
        <header className="relative">
          <div className="bg-gray-900 pt-6">
            <nav className="relative max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6" aria-label="Global">
              <div className="flex items-center flex-1">
                <div className="flex items-center justify-between w-full md:w-auto">
                  <a href="#" className="flex items-center space-x-3">
                    <img className="h-8 w-auto sm:h-10" src="/assets/logo.svg" alt="CivicVoice Logo"/>
                    <span className="text-2xl font-bold text-white tracking-tight sm:text-3xl">CivicVoice</span>
                  </a>
                </div>
              </div>
              <div className="md:flex md:items-center md:space-x-6">
                {currentUser ? (
                    <div className="flex items-center space-x-4">
                        <span className="font-medium text-gray-300">Welcome, {currentUser.firstName}</span>
                        <button onClick={onGoToDashboard} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                            <UserCircleIcon className="h-5 w-5 mr-2" />
                            My Dashboard
                        </button>
                        <button onClick={onLogout} className="p-2 rounded-full text-gray-400 hover:bg-gray-800">
                            <LogoutIcon className="h-6 w-6" />
                        </button>
                    </div>
                ) : (
                    <button onClick={onGetStarted} className="inline-block bg-indigo-500 py-2 px-4 border border-transparent rounded-md text-base font-medium text-white hover:bg-opacity-75">
                        Log in
                    </button>
                )}
              </div>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <main>
          <div className="pt-10 bg-gray-900 sm:pt-16 lg:pt-8 lg:pb-14 lg:overflow-hidden">
            <div className="mx-auto max-w-7xl lg:px-8">
              <div className="lg:grid lg:grid-cols-2 lg:gap-8">
                <div className="mx-auto max-w-md px-4 sm:max-w-2xl sm:px-6 sm:text-center lg:px-0 lg:text-left lg:flex lg:items-center">
                  <div className="lg:py-24">
                    <h1 className="mt-4 text-4xl tracking-tight font-extrabold text-white sm:mt-5 sm:text-6xl lg:mt-6 xl:text-6xl">
                      <span className="block">A better way to</span>
                      <span className="block text-indigo-400">improve your community.</span>
                    </h1>
                    <p className="mt-3 text-base text-gray-300 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                      Our AI-powered platform helps you report neighborhood problems quickly and track them to resolution. See an issue? Report it in seconds and watch your community thrive.
                    </p>
                    <div className="mt-10 sm:mt-12">
                       <div className="sm:flex">
                         <div className="sm:flex-shrink-0">
                           <button onClick={onReportIssueNow} className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-600 md:py-4 md:text-lg md:px-10">
                             Report an Issue Now
                           </button>
                         </div>
                         {!currentUser &&
                            <div className="mt-3 sm:mt-0 sm:ml-3">
                                <button onClick={onGetStarted} className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10">
                                Register
                                </button>
                            </div>
                         }
                       </div>
                    </div>
                  </div>
                </div>
                <div className="mt-12 -mb-16 sm:-mb-48 lg:m-0 lg:relative">
                  <div className="mx-auto max-w-md px-4 sm:max-w-2xl sm:px-6 lg:max-w-none lg:px-0">
                    <img className="w-full lg:absolute lg:inset-y-0 lg:left-0 lg:h-full lg:w-auto lg:max-w-none" src="/assets/community-illustration.svg" alt="Community illustration"/>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Feature Section */}
          <div className="bg-white dark:bg-gray-800 py-16 sm:py-24">
              <div className="mx-auto max-w-md px-4 text-center sm:max-w-3xl sm:px-6 lg:px-8 lg:max-w-7xl">
                <p className="text-base font-semibold tracking-wider text-indigo-600 uppercase">How it works</p>
                <h2 className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight sm:text-4xl">
                  Everything You Need to Improve Your Community
                </h2>
                <p className="mt-5 max-w-prose mx-auto text-xl text-gray-500 dark:text-gray-400">
                  Our platform provides a seamless experience from the moment you spot an issue to the moment it's resolved.
                </p>
                <div className="mt-12">
                  <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature) => (
                      <div key={feature.name} className="pt-6">
                        <div className="flow-root bg-gray-50 dark:bg-gray-900 rounded-lg px-6 pb-8">
                          <div className="-mt-6">
                            <div>
                              <span className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                                <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                              </span>
                            </div>
                            <h3 className="mt-8 text-lg font-medium text-gray-900 dark:text-white tracking-tight">{feature.name}</h3>
                            <p className="mt-5 text-base text-gray-500 dark:text-gray-400">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          {/* CTA Section */}
          <div className="bg-indigo-700">
            <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                <span className="block">Ready to make a difference?</span>
              </h2>
              <p className="mt-4 text-lg leading-6 text-indigo-200">
                Join your neighbors in creating a better community. Report your first issue today.
              </p>
               <button onClick={onReportIssueNow} className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 sm:w-auto">
                Report an Issue Now
              </button>
            </div>
          </div>
        </main>
        
        {/* Footer */}
        <footer className="bg-gray-50 dark:bg-gray-900" aria-labelledby="footer-heading">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
             <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8 md:flex md:items-center md:justify-between">
              <p className="mt-8 text-base text-gray-400 md:mt-0 md:order-1">
                &copy; 2024 CivicVoice. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};