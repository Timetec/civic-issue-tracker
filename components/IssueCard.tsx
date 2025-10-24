import React from 'react';
import type { CivicIssue, User } from '../types';
import { IssueStatus } from '../types';
import { LocationMarkerIcon, ClockIcon, CheckCircleIcon, ExclamationCircleIcon } from './Icons';

interface IssueCardProps {
  issue: CivicIssue;
  onAdminUpdateStatus: (id: string, newStatus: IssueStatus) => void;
  currentUser: Omit<User, 'password'>;
}

const statusStyles = {
  [IssueStatus.Pending]: {
    bg: 'bg-red-100 dark:bg-red-900',
    text: 'text-red-800 dark:text-red-200',
    icon: <ClockIcon className="h-5 w-5 text-red-500" />,
  },
  [IssueStatus.InProgress]: {
    bg: 'bg-yellow-100 dark:bg-yellow-900',
    text: 'text-yellow-800 dark:text-yellow-200',
    icon: <ExclamationCircleIcon className="h-5 w-5 text-yellow-500" />,
  },
  [IssueStatus.Resolved]: {
    bg: 'bg-green-100 dark:bg-green-900',
    text: 'text-green-800 dark:text-green-200',
    icon: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
  },
};

export const IssueCard: React.FC<IssueCardProps> = ({ issue, onAdminUpdateStatus, currentUser }) => {
  const { bg, text, icon } = statusStyles[issue.status];
  const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  const isAdmin = currentUser.email === 'admin@example.com';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105 duration-300 flex flex-col justify-between">
      <div>
        <img src={issue.photoUrl} alt={issue.title} className="w-full h-48 object-cover" />
        <div className="p-4">
          <div className="flex justify-between items-start">
              <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{issue.category}</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
                  {icon}
                  <span className="ml-1.5">{issue.status}</span>
              </span>
          </div>
          <h3 className="mt-2 text-lg font-bold text-gray-900 dark:text-white">{issue.title}</h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{issue.description}</p>
          <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                  <LocationMarkerIcon className="h-4 w-4 mr-1"/>
                  <span>{issue.location.lat.toFixed(4)}, {issue.location.lng.toFixed(4)}</span>
              </div>
              <span>{timeAgo(issue.createdAt)}</span>
          </div>
          <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">Reported by: {issue.reporterName}</p>
        </div>
      </div>
      {/* Admin Panel */}
      {isAdmin && (
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 mt-auto">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">Admin Actions:</p>
            <div className="flex space-x-2">
              {issue.status !== IssueStatus.InProgress && (
                <button onClick={() => onAdminUpdateStatus(issue.id, IssueStatus.InProgress)} className="text-xs px-2 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600">Mark In Progress</button>
              )}
              {issue.status !== IssueStatus.Resolved && (
                <button onClick={() => onAdminUpdateStatus(issue.id, IssueStatus.Resolved)} className="text-xs px-2 py-1 rounded bg-green-500 text-white hover:bg-green-600">Mark Resolved</button>
              )}
          </div>
        </div>
      )}
    </div>
  );
};
