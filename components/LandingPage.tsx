import React, { useState, useEffect } from 'react';
import { PlusIcon, Spinner, CameraIcon, SparklesIcon, ClipboardCheckIcon } from './Icons';
import type { User, CivicIssue } from '../types';
import { IssueStatus } from '../types';
import * as issueService from '../services/issueService';

interface LandingPageProps {
  onGetStarted: () => void;
  currentUser?: Omit<User, 'password'> | null;
  onGoToDashboard?: () => void;
  onLogout?: () => void;
  onReportIssueNow?: () => void;
}

const statusStyles: { [key in IssueStatus]: { bg: string; text: string } } = {
  [IssueStatus.Pending]: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-800 dark:text-red-200' },
  [IssueStatus.InProgress]: { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-800 dark:text-yellow-200' },
  [IssueStatus.ForReview]: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-800 dark:text-blue-200' },
  [IssueStatus.Resolved]: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-200' },
};

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, currentUser, onGoToDashboard, onLogout, onReportIssueNow }) => {
  const [sampleIssues, setSampleIssues] = useState<CivicIssue[]>([]);
  const [isLoadingSamples, setIsLoadingSamples] = useState(true);

  useEffect(() => {
    const fetchSamples = async () => {
      try {
        const issues = await issueService.getSampleIssues();
        setSampleIssues(issues);
      } catch (e) {
        console.error("Failed to fetch sample issues", e);
      } finally {
        setIsLoadingSamples(false);
      }
    };
    fetchSamples();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <header className="absolute top-0 left-0 right-0 z-10">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
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
        <div className="relative pt-24 pb-24 flex content-center items-center justify-center min-h-[50vh]">
          <div className="absolute top-0 w-full h-full bg-center bg-cover"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1599389392885-2023a6358178?q=80&w=2940&auto=format&fit=crop')" }}>
            <span id="blackOverlay" className="w-full h-full absolute opacity-75 bg-black"></span>
          </div>
          <div className="container relative mx-auto">
              <div className="items-center flex flex-wrap">
                <div className="w-full lg:w-6/12 px-4 ml-auto mr-auto text-center">
                  <div>
                    <h1 className="text-white font-semibold text-4xl">
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

        <section className="pt-28 pb-20 bg-gray-200 dark:bg-gray-800 -mt-24">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center text-center mb-12">
              <div className="w-full lg:w-6/12 px-4">
                <h2 className="text-4xl font-semibold text-gray-800 dark:text-white">Simple & Effective</h2>
                <p className="text-lg leading-relaxed m-4 text-gray-600 dark:text-gray-400">
                  Our platform streamlines the process of reporting and resolving civic issues.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap">
              <div className="w-full md:w-4/12 px-4 text-center">
                <div className="relative flex flex-col min-w-0 break-words bg-white dark:bg-gray-700 w-full mb-8 shadow-lg rounded-lg h-full">
                  <div className="px-4 py-5 flex-auto">
                    <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-red-400">
                      <CameraIcon className="h-6 w-6" />
                    </div>
                    <h6 className="text-xl font-semibold text-gray-800 dark:text-white">Easy Reporting</h6>
                    <p className="mt-2 mb-4 text-gray-600 dark:text-gray-400">
                      Snap a photo, add a quick description, and tag your location. Reporting an issue takes less than a minute.
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-4/12 px-4 text-center">
                <div className="relative flex flex-col min-w-0 break-words bg-white dark:bg-gray-700 w-full mb-8 shadow-lg rounded-lg h-full">
                  <div className="px-4 py-5 flex-auto">
                    <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-blue-400">
                      <SparklesIcon className="h-6 w-6" />
                    </div>
                    <h6 className="text-xl font-semibold text-gray-800 dark:text-white">Smart Categorization</h6>
                    <p className="mt-2 mb-4 text-gray-600 dark:text-gray-400">
                      Our AI automatically analyzes and routes your issue to the correct municipal department, eliminating guesswork.
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-4/12 px-4 text-center">
                <div className="relative flex flex-col min-w-0 break-words bg-white dark:bg-gray-700 w-full mb-8 shadow-lg rounded-lg h-full">
                  <div className="px-4 py-5 flex-auto">
                    <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-green-400">
                      <ClipboardCheckIcon className="h-6 w-6" />
                    </div>
                    <h6 className="text-xl font-semibold text-gray-800 dark:text-white">Live Status Updates</h6>
                    <p className="mt-2 mb-4 text-gray-600 dark:text-gray-400">
                      Receive real-time notifications and track the progress of your report from submission to resolution.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative py-20 bg-gray-100 dark:bg-gray-900">
             <div className="container mx-auto px-4">
                 <div className="items-center flex flex-wrap">
                     <div className="w-full ml-auto mr-auto px-4 text-center">
                         <div>
                             <h3 className="text-3xl font-semibold text-gray-800 dark:text-white">Issues in Progress</h3>
                             <p className="mt-4 text-lg leading-relaxed text-gray-600 dark:text-gray-400">
                                 Here's a live look at some of the issues currently being addressed by our dedicated teams.
                             </p>
                         </div>
                     </div>
                 </div>
                 {isLoadingSamples ? (
                    <div className="flex justify-center mt-8"><Spinner className="h-10 w-10 text-indigo-500" /></div>
                 ) : sampleIssues.length > 0 ? (
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {sampleIssues.map(issue => {
                             const styles = statusStyles[issue.status];
                             return (
                                <div key={issue.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col">
                                    <img src={issue.photoUrl} alt={issue.title} className="w-full h-48 object-cover" />
                                    <div className="p-4 flex flex-col flex-grow">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{issue.category}</span>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles.bg} ${styles.text}`}>
                                                {issue.status}
                                            </span>
                                        </div>
                                        <h3 className="mt-2 text-lg font-bold text-gray-900 dark:text-white">{issue.title}</h3>
                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 flex-grow">{issue.description.substring(0, 100)}...</p>
                                    </div>
                                </div>
                             );
                        })}
                    </div>
                 ) : (
                    <p className="text-center mt-8 text-gray-500 dark:text-gray-400">No issues are currently in progress.</p>
                 )}
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