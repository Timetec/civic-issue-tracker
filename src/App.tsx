import React, { useState, useEffect, useCallback } from 'react';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { IssueForm } from './components/IssueForm';
import { IssueDashboard } from './components/IssueDashboard';
import { UserManagementPage } from './components/UserManagementPage';
import { ProfileModal } from './components/ProfileModal';
import { GlobalLoader } from './components/GlobalLoader';
import { MapView } from './components/MapView';
import * as authService from './services/authService';
import * as issueService from './services/issueService';
import * as userService from './services/userService';
import type { CivicIssue, User } from './types';
import { UserRole, IssueStatus } from './types';
import { Spinner, UserCircleIcon, LogoutIcon, UserGroupIcon, PlusIcon, MapIcon, ListBulletIcon } from './components/Icons';

type AppView = 'LANDING' | 'LOGIN' | 'DASHBOARD' | 'FORM' | 'MANAGE_USERS';
type CurrentUser = Omit<User, 'password'> | null;

const getApiErrorMessage = (e: unknown): string => {
    if (e instanceof Error) {
        console.error(e);
        if (e.message.toLowerCase().includes('failed to fetch')) {
            return 'Network Error: Could not connect to the server. This may be a CORS issue or a server-side error. Please check the browser console and server logs for more details.';
        }
        return `An error occurred: ${e.message}`;
    }
    console.error('An unknown error occurred', e);
    return 'An unknown error occurred. Please try again.';
};


const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<CurrentUser>(null);
  const [currentView, setCurrentView] = useState<AppView>('LANDING');
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [mapIssues, setMapIssues] = useState<CivicIssue[]>([]);
  const [workers, setWorkers] = useState<Omit<User, 'password'>[]>([]);
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [showMapView, setShowMapView] = useState(false);

  const fetchData = useCallback(async () => {
    if (!currentUser) {
      setIssues([]);
      setWorkers([]);
      return;
    }
    setIsGlobalLoading(true);
    try {
      let issuesPromise;
      switch (currentUser.role) {
        case UserRole.Admin:
          issuesPromise = issueService.getIssues();
          break;
        case UserRole.Service:
           issuesPromise = Promise.resolve([]); // Service user searches, doesn't load all.
           break;
        case UserRole.Worker:
          issuesPromise = issueService.getMyAssignedIssues();
          break;
        case UserRole.Citizen:
          issuesPromise = issueService.getMyReportedIssues();
          break;
        default:
          issuesPromise = Promise.resolve([]);
      }
      
      const [fetchedIssues, allUsers] = await Promise.all([
        issuesPromise,
        currentUser.role === UserRole.Admin ? userService.getAllUsers() : Promise.resolve([])
      ]);

      setIssues(fetchedIssues);
      if (currentUser.role === UserRole.Admin) {
        setWorkers(allUsers.filter(u => u.role === UserRole.Worker));
      }

    } catch (e) {
      setError('Failed to load data. Please try again.');
      console.error(e);
    } finally {
      setIsGlobalLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setCurrentView('DASHBOARD');
    }
    setIsAppLoading(false);
  }, []);

  useEffect(() => {
    if (currentView === 'DASHBOARD') {
        fetchData();
    }
  }, [fetchData, currentView]);

  useEffect(() => {
    const fetchMapData = async () => {
        if (showMapView && currentUser?.role === UserRole.Citizen) {
            setIsGlobalLoading(true);
            try {
                const recentIssues = await issueService.getRecentPublicIssues();
                setMapIssues(recentIssues);
            } catch (e) {
                setError('Failed to load map data. Please try again.');
                console.error(e);
            } finally {
                setIsGlobalLoading(false);
            }
        }
    };

    fetchMapData();
  }, [showMapView, currentUser]);
  
  const handleLogin = async (email: string, pass: string) => {
    setIsGlobalLoading(true);
    try {
      const user = await authService.loginUser(email, pass);
      if (user) {
        setCurrentUser(user);
        setCurrentView('DASHBOARD');
        return true;
      }
      return false;
    } finally {
      setIsGlobalLoading(false);
    }
  };

  const handleRegister = async (data: { email: string; pass: string; firstName: string; lastName: string; mobileNumber: string; }) => {
    setIsGlobalLoading(true);
    const { pass, ...rest } = data;
    try {
      const user = await authService.registerUser({ ...rest, password: pass });
      if (user) {
        setCurrentUser(user);
        setCurrentView('DASHBOARD');
        return true;
      }
      return false;
    } finally {
      setIsGlobalLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logoutUser();
    setCurrentUser(null);
    setCurrentView('LANDING');
    setIssues([]);
    setWorkers([]);
  };

  const handleIssueSubmit = async (description: string, photos: File[], location: { lat: number; lng: number }) => {
    setIsSubmitting(true);
    setIsGlobalLoading(true);
    try {
      await issueService.addIssue(description, photos, location);
      await fetchData(); // Refresh data
      setCurrentView('DASHBOARD');
    } catch (e) {
      alert(getApiErrorMessage(e));
    } finally {
      setIsSubmitting(false);
      setIsGlobalLoading(false);
    }
  };

  const handleAdminUpdateStatus = async (id: string, newStatus: IssueStatus) => {
    setIsGlobalLoading(true);
    try {
        await issueService.updateIssueStatus(id, newStatus);
        await fetchData();
    } catch (e) {
        alert(getApiErrorMessage(e));
    } finally {
      setIsGlobalLoading(false);
    }
  };

  const handleCitizenResolveIssue = async (id: string, rating: number) => {
    setIsGlobalLoading(true);
    try {
      await issueService.citizenResolveIssue(id, rating);
      await fetchData();
    } catch(e) {
      alert(getApiErrorMessage(e));
    } finally {
      setIsGlobalLoading(false);
    }
  };

  const handleAdminAssignIssue = async (issueId: string, workerEmail: string) => {
    setIsGlobalLoading(true);
    try {
        await issueService.assignIssue(issueId, workerEmail);
        await fetchData();
    } catch (e) {
        alert(getApiErrorMessage(e));
    } finally {
      setIsGlobalLoading(false);
    }
  };
  
  const handleAddComment = async (issueId: string, text: string) => {
    setIsGlobalLoading(true);
    try {
        await issueService.addComment(issueId, text);
        await fetchData();
    } catch(e) {
        alert(getApiErrorMessage(e));
    } finally {
      setIsGlobalLoading(false);
    }
  };

  const handleUpdateProfile = async (data: { firstName: string; lastName: string; mobileNumber: string; }) => {
    setIsGlobalLoading(true);
    try {
      const { user, token } = await userService.updateMyProfile(data);
      authService.updateUserToken(token);
      setCurrentUser(user);
      return true;
    } catch (e) {
      console.error("Profile update failed", e);
      return false;
    } finally {
      setIsGlobalLoading(false);
    }
  };

  const handleChangePassword = async (oldPass: string, newPass: string) => {
    setIsGlobalLoading(true);
    try {
      await userService.changeMyPassword(oldPass, newPass);
      return true;
    } catch (e) {
      console.error("Password change failed", e);
      return false;
    } finally {
      setIsGlobalLoading(false);
    }
  };

  const handleUpdateLocation = async (location: { lat: number; lng: number; }) => {
    setIsGlobalLoading(true);
    try {
        const updatedUser = await userService.updateMyLocation(location);
        // Refresh the main workers list if admin is viewing
        if(currentUser?.role === UserRole.Admin) {
            await fetchData();
        }
        // Update the current user's state if they are the one who updated their profile
        if (currentUser?.email === updatedUser.email) {
            setCurrentUser(updatedUser);
        }
        return true;
    } catch (e) {
        console.error("Location update failed", e);
        return false;
    } finally {
      setIsGlobalLoading(false);
    }
  };

  const renderContent = () => {
    if (isAppLoading && !currentUser && currentView !== 'LANDING') {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
                <Spinner className="h-12 w-12 text-indigo-600"/>
            </div>
        );
    }

    switch(currentView) {
      case 'LOGIN':
        return <LoginPage onLogin={handleLogin} onRegister={handleRegister} onBackToLanding={() => setCurrentView('LANDING')} />;
      case 'DASHBOARD':
        if (currentUser) {
          return (
            <main className="container mx-auto p-4 md:p-6">
                <header className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white truncate">Welcome, {currentUser.firstName}!</h1>
                    <div className="flex items-center space-x-2 md:space-x-4">
                        {currentUser.role !== UserRole.Service && (
                            <button onClick={() => setShowMapView(!showMapView)} title={showMapView ? "List View" : "Map View"} className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
                                {showMapView ? <ListBulletIcon className="h-6 w-6"/> : <MapIcon className="h-6 w-6"/>}
                            </button>
                        )}
                        {currentUser.role === UserRole.Admin && (
                            <button onClick={() => setCurrentView('MANAGE_USERS')} title="Manage Users" className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
                                <UserGroupIcon className="h-6 w-6"/>
                            </button>
                        )}
                        {currentUser.role !== UserRole.Service && (
                            <button onClick={() => setCurrentView('FORM')} className="px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 flex items-center">
                                <PlusIcon className="h-5 w-5 mr-1"/>
                                <span className="hidden sm:inline">New Issue</span>
                            </button>
                        )}
                         <button onClick={() => setIsProfileModalOpen(true)} title="My Profile" className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
                            <UserCircleIcon className="h-6 w-6"/>
                        </button>
                        <button onClick={handleLogout} title="Logout" className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
                            <LogoutIcon className="h-6 w-6"/>
                        </button>
                    </div>
                </header>
                {showMapView ? (
                  <MapView 
                    issues={(currentUser.role === UserRole.Citizen ? mapIssues : issues).filter(issue => issue.status !== IssueStatus.Resolved)} 
                    currentUser={currentUser}
                  />
                ) : (
                  <IssueDashboard issues={issues} onAdminUpdateStatus={handleAdminUpdateStatus} onCitizenResolveIssue={handleCitizenResolveIssue} currentUser={currentUser} onAdminAssignIssue={handleAdminAssignIssue} workers={workers} onAddComment={handleAddComment} />
                )}
            </main>
          );
        }
        break; // Should not happen
      case 'FORM':
        return (
             <main className="container mx-auto p-4 md:p-6 max-w-2xl">
                <button onClick={() => setCurrentView('DASHBOARD')} className="mb-4 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">&larr; Back to Dashboard</button>
                <IssueForm onSubmit={handleIssueSubmit} isSubmitting={isSubmitting} />
            </main>
        );
      case 'MANAGE_USERS':
        if (currentUser && currentUser.role === UserRole.Admin) {
            return (
                <main className="container mx-auto p-4 md:p-6">
                    <button onClick={() => setCurrentView('DASHBOARD')} className="mb-4 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">&larr; Back to Dashboard</button>
                    <UserManagementPage currentUser={currentUser} onUsersUpdate={fetchData} />
                </main>
            );
        }
        break; // Fallthrough for non-admins
      case 'LANDING':
      default:
        return <LandingPage onGetStarted={() => setCurrentView('LOGIN')} currentUser={currentUser} onGoToDashboard={() => setCurrentView('DASHBOARD')} onLogout={handleLogout} onReportIssueNow={() => setCurrentView(currentUser ? 'FORM' : 'LOGIN')} />;
    }
    // Fallback
    // Fix: Added missing 'onReportIssueNow' prop to satisfy LandingPageProps.
    return <LandingPage onGetStarted={() => setCurrentView('LOGIN')} currentUser={currentUser} onGoToDashboard={() => setCurrentView('DASHBOARD')} onReportIssueNow={() => setCurrentView(currentUser ? 'FORM' : 'LOGIN')} />;
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen font-sans">
      {isGlobalLoading && <GlobalLoader />}
      {renderContent()}
      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        user={currentUser} 
        onUpdateProfile={handleUpdateProfile}
        onChangePassword={handleChangePassword}
        onUpdateLocation={handleUpdateLocation}
      />
    </div>
  );
};

export default App;