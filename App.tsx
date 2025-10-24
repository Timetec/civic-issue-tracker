import React, { useState, useEffect } from 'react';
import type { CivicIssue, User } from './types';
import { IssueStatus } from './types';
import { IssueForm } from './components/IssueForm';
import { IssueDashboard } from './components/IssueDashboard';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import * as authService from './services/authService';
import * as issueService from './services/issueService';
import { Modal } from './components/Modal';
import { PlusIcon } from './components/Icons';

type AppView = 'landing' | 'login' | 'app';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Omit<User, 'password'> | null>(null);
  const [view, setView] = useState<AppView>('landing');
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      // Stay on landing page by default, don't jump to app
      // setView('app');
    }
    setView('landing'); // Always start at landing
    setIsLoading(false);
  }, []);
  
  useEffect(() => {
    if (view === 'app' && currentUser) {
      fetchIssues();
    }
  }, [view, currentUser]);

  const fetchIssues = async () => {
    try {
      const fetchedIssues = await issueService.getIssues();
      setIssues(fetchedIssues);
    } catch (error) {
      console.error("Failed to fetch issues:", error);
      // If token is invalid or expired, log out user
      handleLogout();
    }
  };

  const handleLogin = async (email: string, pass: string): Promise<boolean> => {
    const user = await authService.loginUser(email, pass);
    if (user) {
      setCurrentUser(user);
      setView('app');
      return true;
    }
    return false;
  };
  
  const handleRegister = async (data: {email: string, pass: string, firstName: string, lastName: string, mobileNumber: string}): Promise<boolean> => {
    const user = await authService.registerUser({ ...data, password: data.pass });
     if (user) {
      setCurrentUser(user);
      setView('app');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    authService.logoutUser();
    setCurrentUser(null);
    setView('landing');
  };

  const handleSubmitIssue = async (description: string, photo: File, location: { lat: number; lng: number }) => {
    if (!currentUser) return;
    setIsSubmitting(true);
    try {
      // The user's identity is determined by the auth token on the backend, so we don't need to pass it here.
      const newIssue = await issueService.addIssue(description, photo, location);
      setIssues(prevIssues => [newIssue, ...prevIssues]);
      setIsFormModalOpen(false); // Close modal on success
    } catch (error) {
      console.error("Failed to submit issue", error);
      alert("There was an error submitting your issue. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleAdminUpdateStatus = async (id: string, newStatus: IssueStatus) => {
    try {
      const updatedIssue = await issueService.updateIssueStatus(id, newStatus);
      setIssues(prevIssues => prevIssues.map(issue => issue.id === id ? updatedIssue : issue));
    } catch (error) {
        console.error("Failed to update status", error);
        alert("There was an error updating the issue status.");
    }
  };

  const handleOpenReportModal = () => {
    setView('app');
    setIsFormModalOpen(true);
  };

  if (isLoading) {
    return <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;
  }

  if (view === 'landing') {
    return <LandingPage 
        onGetStarted={() => setView('login')} 
        currentUser={currentUser}
        onGoToDashboard={() => setView('app')}
        onLogout={handleLogout}
        onReportIssueNow={handleOpenReportModal}
    />;
  }
  
  if (view === 'login') {
    return <LoginPage onLogin={handleLogin} onRegister={handleRegister} onBackToLanding={() => setView('landing')} />;
  }

  if (view === 'app' && currentUser) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40">
          <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
            <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setView('landing');
                }}
                className="hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded"
              >
                Civic Issue Tracker
              </a>
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 dark:text-gray-300 hidden sm:inline">Welcome, {currentUser.firstName}!</span>
               <button
                onClick={() => setIsFormModalOpen(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Report Issue
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Logout
              </button>
            </div>
          </nav>
        </header>
        <main className="container mx-auto p-4 md:p-6">
          <IssueDashboard
            issues={issues}
            onAdminUpdateStatus={handleAdminUpdateStatus}
            currentUser={currentUser}
          />
        </main>

        <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)}>
          <IssueForm onSubmit={handleSubmitIssue} isSubmitting={isSubmitting} />
        </Modal>
      </div>
    );
  }

  return null; // Should not happen
};

export default App;