import React, { useState, useMemo } from 'react';
import type { CivicIssue, User } from '../types';
import { IssueStatus, UserRole } from '../types';
import { IssueCard } from './IssueCard';
import * as issueService from '../services/issueService';
import { Spinner } from './Icons';

interface IssueDashboardProps {
  issues: CivicIssue[];
  onAdminUpdateStatus: (id: string, newStatus: IssueStatus) => void;
  onCitizenResolveIssue: (id: string, rating: number) => void;
  currentUser: User;
  onAdminAssignIssue: (issueId: string, workerEmail: string) => void;
  workers: Omit<User, 'password'>[];
  onAddComment: (issueId: string, text: string) => void;
}

export const IssueDashboard: React.FC<IssueDashboardProps> = ({ issues, onAdminUpdateStatus, onCitizenResolveIssue, currentUser, onAdminAssignIssue, workers, onAddComment }) => {
  const [filter, setFilter] = useState<IssueStatus | null>(null);

  // State for Service user search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedIssues, setSearchedIssues] = useState<CivicIssue[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  // State for Citizen/Worker search by ID
  const [idSearchQuery, setIdSearchQuery] = useState('');
  const [searchedIssueById, setSearchedIssueById] = useState<CivicIssue | null>(null);
  const [isSearchingById, setIsSearchingById] = useState(false);
  const [searchByIdError, setSearchByIdError] = useState('');

  const handleSearchByUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchedIssues(null); // Clear results if search is empty
      return;
    }
    setIsSearching(true);
    setSearchError('');
    try {
      const results = await issueService.getIssuesByUser(searchQuery);
      setSearchedIssues(results);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchError('Failed to perform search. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleSearchById = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idSearchQuery.trim()) return;
    setIsSearchingById(true);
    setSearchByIdError('');
    setSearchedIssueById(null);
    try {
        const result = await issueService.getIssueById(idSearchQuery.trim());
        setSearchedIssueById(result);
    } catch (error) {
        setSearchByIdError((error as Error).message || 'An error occurred.');
    } finally {
        setIsSearchingById(false);
    }
  };

  const handleClearIdSearch = () => {
    setIdSearchQuery('');
    setSearchedIssueById(null);
    setSearchByIdError('');
  };

  const issuesToDisplay = 
      currentUser.role === UserRole.Service 
      ? searchedIssues 
      : searchedIssueById 
        ? [searchedIssueById] 
        : issues;
  
  const filteredIssues = useMemo(() => {
    if (!issuesToDisplay) return [];
    if (!filter) return issuesToDisplay;
    return issuesToDisplay.filter(issue => issue.status === filter);
  }, [issuesToDisplay, filter]);
  
  const sortedIssues = useMemo(() => {
    if (!filteredIssues) return [];
    return [...filteredIssues].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [filteredIssues]);

  const isSearchableRole = currentUser.role === UserRole.Citizen || currentUser.role === UserRole.Worker;

  // Special view for Service user
  if (currentUser.role === UserRole.Service) {
    return (
      <div className="p-4 md:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Search User Reports</h2>
        <form onSubmit={handleSearchByUser} className="flex flex-col sm:flex-row gap-2 mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by user email or mobile..."
            className="flex-grow block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 px-3 py-2"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 flex justify-center items-center"
          >
            {isSearching ? <Spinner className="h-5 w-5" /> : 'Search'}
          </button>
        </form>
        {searchError && <p className="text-red-500 text-center mb-4">{searchError}</p>}
        
        {searchedIssues === null ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Search for a user to see their reported issues.</p>
          </div>
        ) : sortedIssues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {sortedIssues.map(issue => (
              <IssueCard 
                key={issue.id} 
                issue={issue} 
                onAdminUpdateStatus={onAdminUpdateStatus} 
                onCitizenResolveIssue={onCitizenResolveIssue}
                currentUser={currentUser} 
                onAddComment={onAddComment}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No issues found for this user.</p>
          </div>
        )}
      </div>
    );
  }
  
  // Regular dashboard for other users
  return (
    <div className="p-4 md:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Civic Issues Dashboard</h2>
        
        {isSearchableRole && (
          <div className="flex-shrink-0">
            <form onSubmit={handleSearchById} className="flex gap-2 items-center">
              <input
                type="text"
                value={idSearchQuery}
                onChange={(e) => setIdSearchQuery(e.target.value)}
                placeholder="Search by Issue ID..."
                className="w-48 block border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 px-3 py-1.5"
              />
              <button type="submit" disabled={isSearchingById || !idSearchQuery} className="px-4 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 flex justify-center items-center">
                  {isSearchingById ? <Spinner className="h-5 w-5" /> : 'Find'}
              </button>
              {(searchedIssueById || idSearchQuery) && (
                <button type="button" onClick={handleClearIdSearch} className="px-4 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                  Clear
                </button>
              )}
            </form>
            {searchByIdError && <p className="text-red-500 dark:text-red-400 mt-1 text-xs text-right">{searchByIdError}</p>}
          </div>
        )}
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setFilter(null)}
            className={`px-4 py-2 text-sm font-medium rounded-full ${!filter ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
          >
            All
          </button>
          {Object.values(IssueStatus).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 text-sm font-medium rounded-full ${filter === status ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>
      
      {sortedIssues.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {sortedIssues.map(issue => (
            <IssueCard 
                key={issue.id} 
                issue={issue} 
                onAdminUpdateStatus={onAdminUpdateStatus} 
                onCitizenResolveIssue={onCitizenResolveIssue}
                currentUser={currentUser}
                onAdminAssignIssue={onAdminAssignIssue}
                workers={workers}
                onAddComment={onAddComment}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
                { searchedIssueById ? "This is the only issue matching your search."
                  : idSearchQuery ? "Searching..." 
                  : currentUser.role === UserRole.Worker ? "You have no issues assigned to you." 
                  : currentUser.role === UserRole.Citizen ? "You have not reported any issues yet."
                  : "No issues found for this filter."
                }
            </p>
        </div>
      )}
    </div>
  );
};