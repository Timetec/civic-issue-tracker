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
      setView('app');
    } else {
        setView('landing');
    }
    setIsLoading(false);
  }, []);
  
  useEffect(() => {
    if (view === 'app') {
      fetchIssues();
    }
  }, [view]);

  const fetchIssues = async () => {
    const fetchedIssues = await issueService.getIssues();
    setIssues(fetchedIssues);
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
      const newIssue = await issueService.addIssue(description, photo, location, {
        id: currentUser.email,
        name: `${currentUser.firstName} ${currentUser.lastName}`
      });
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

  if (isLoading) {
    return <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;
  }

  if (view === 'landing') {
    return <LandingPage onGetStarted={() => setView('login')} />;
  }
  
  if (view === 'login') {
    return <LoginPage onLogin={handleLogin} onRegister={handleRegister} onBackToLanding={() => setView('landing')} />;
  }

  if (view === 'app' && currentUser) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow-md">
          <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
            <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">Civic Issue Tracker</h1>
            <div>
              <span className="text-gray-700 dark:text-gray-300 mr-4">Welcome, {currentUser.firstName}!</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
            onReportIssueClick={() => setIsFormModalOpen(true)}
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