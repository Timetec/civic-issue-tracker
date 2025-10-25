import React from 'react';
import type { CivicIssue } from '../types';
import { IssueStatus } from '../types';
import { ClockIcon, CheckCircleIcon, ExclamationCircleIcon, ClipboardCheckIcon, MapPinIcon } from './Icons';

interface IssueCardProps {
  issue: CivicIssue;
  onClick: () => void;
}

const statusStyles = {
  [IssueStatus.Pending]: {
    bg: 'bg-red-100 dark:bg-red-900/50',
    text: 'text-red-800 dark:text-red-200',
    icon: <ClockIcon className="h-4 w-4 text-red-500" />,
  },
  [IssueStatus.InProgress]: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/50',
    text: 'text-yellow-800 dark:text-yellow-200',
    icon: <ExclamationCircleIcon className="h-4 w-4 text-yellow-500" />,
  },
  [IssueStatus.ForReview]: {
    bg: 'bg-blue-100 dark:bg-blue-900/50',
    text: 'text-blue-800 dark:text-blue-200',
    icon: <ClipboardCheckIcon className="h-4 w-4 text-blue-500" />,
  },
  [IssueStatus.Resolved]: {
    bg: 'bg-green-100 dark:bg-green-900/50',
    text: 'text-green-800 dark:text-green-200',
    icon: <CheckCircleIcon className="h-4 w-4 text-green-500" />,
  },
};

const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
};

export const IssueCard: React.FC<IssueCardProps> = ({ issue, onClick }) => {
  const { bg, text, icon } = statusStyles[issue.status];
  const hasPhoto = issue.photoUrls && issue.photoUrls.length > 0 && !issue.photoUrls[0].includes('placehold.co');

  return (
    <div 
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all hover:shadow-xl hover:scale-105 duration-300 flex flex-col cursor-pointer group"
    >
      <div className="relative aspect-video bg-gray-200 dark:bg-gray-700">
        {hasPhoto ? (
          <img 
            src={issue.photoUrls[0]} 
            alt={issue.title} 
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPinIcon className="h-10 w-10 text-gray-400 dark:text-gray-500" />
          </div>
        )}
        <div className={`absolute top-2 right-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${bg} ${text} shadow-sm`}>
          {icon}
          <span className="ml-1.5">{issue.status}</span>
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{issue.category}</span>
        <h3 className="mt-1 font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {issue.title}
        </h3>
        
        <div className="mt-4 pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
                <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-gray-600 dark:text-gray-300">ID: {issue.id}</span>
            </div>
            <div className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-1" />
                <span>{timeAgo(issue.createdAt)}</span>
            </div>
        </div>
      </div>
    </div>
  );
};