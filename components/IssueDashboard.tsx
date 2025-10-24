import React, { useState, useMemo } from 'react';
import type { CivicIssue, User } from '../types';
import { IssueStatus } from '../types';
import { IssueCard } from './IssueCard';
import { PlusIcon } from './Icons';

interface IssueDashboardProps {
  issues: CivicIssue[];
  onAdminUpdateStatus: (id: string, newStatus: IssueStatus) => void;
  currentUser: User;
  onReportIssueClick: () => void;
}

const statusOptions = [null, ...Object.values(IssueStatus)];

export const IssueDashboard: React.FC<IssueDashboardProps> = ({ issues, onAdminUpdateStatus, currentUser, onReportIssueClick }) => {
  const [filter, setFilter] = useState<IssueStatus | null>(null);

  const filteredIssues = useMemo(() => {
    if (!filter) return issues;
    return issues.filter(issue => issue.status === filter);
  }, [issues, filter]);
  
  const sortedIssues = useMemo(() => {
    return [...filteredIssues].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [filteredIssues]);

  return (
    <div className="p-4 md:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Civic Issues Dashboard</h2>
        <button
          onClick={onReportIssueClick}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Report New Issue
        </button>
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
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
            <IssueCard key={issue.id} issue={issue} onAdminUpdateStatus={onAdminUpdateStatus} currentUser={currentUser} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No issues found for this filter.</p>
        </div>
      )}
    </div>
  );
};