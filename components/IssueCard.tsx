import React, { useState } from 'react';
import type { CivicIssue, User } from '../types';
import { IssueStatus, UserRole } from '../types';
import { LocationMarkerIcon, ClockIcon, CheckCircleIcon, ExclamationCircleIcon, ClipboardCheckIcon, CopyIcon, StarIcon } from './Icons';

interface IssueCardProps {
  issue: CivicIssue;
  onAdminUpdateStatus: (id: string, newStatus: IssueStatus) => void;
  onCitizenResolveIssue: (id: string, rating: number) => void;
  currentUser: Omit<User, 'password'>;
  onAdminAssignIssue?: (issueId: string, workerEmail: string) => void;
  workers?: Omit<User, 'password'>[];
  onAddComment: (issueId: string, text: string) => void;
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
  [IssueStatus.ForReview]: {
    bg: 'bg-blue-100 dark:bg-blue-900',
    text: 'text-blue-800 dark:text-blue-200',
    icon: <ClipboardCheckIcon className="h-5 w-5 text-blue-500" />,
  },
  [IssueStatus.Resolved]: {
    bg: 'bg-green-100 dark:bg-green-900',
    text: 'text-green-800 dark:text-green-200',
    icon: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
  },
};

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


export const IssueCard: React.FC<IssueCardProps> = ({ issue, onAdminUpdateStatus, onCitizenResolveIssue, currentUser, onAdminAssignIssue, workers, onAddComment }) => {
  const { bg, text, icon } = statusStyles[issue.status];
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const handleCopyId = () => {
    navigator.clipboard.writeText(issue.id).then(() => {
        setCopySuccess('Copied!');
        setTimeout(() => setCopySuccess(''), 2000);
    }, () => {
        setCopySuccess('Failed to copy');
        setTimeout(() => setCopySuccess(''), 2000);
    });
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
        onAddComment(issue.id, newComment.trim());
        setNewComment('');
    }
  };
  
  const handleResolve = () => {
      if (rating > 0) {
          onCitizenResolveIssue(issue.id, rating);
      }
  };

  const isAdmin = currentUser.role === UserRole.Admin;
  const isWorker = currentUser.role === UserRole.Worker;
  const isReporter = currentUser.email === issue.reporterId;
  const canComment = isAdmin || isWorker || isReporter;
  const canResolve = isReporter && issue.status === IssueStatus.ForReview;


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
          <div className="mt-2 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
            <span>Reported by: {issue.reporterName}</span>
            <div className="flex items-center">
                <span className="font-mono mr-1">ID: {issue.id}</span>
                <button onClick={handleCopyId} title="Copy ID" className="text-gray-400 hover:text-indigo-500">
                    <CopyIcon className="h-4 w-4" />
                </button>
                {copySuccess && <span className="text-indigo-500 text-xs ml-2">{copySuccess}</span>}
            </div>
          </div>
          <div className="mt-1 text-xs font-semibold text-gray-500 dark:text-gray-400 flex justify-between">
              <span>{issue.assignedToName ? `Assigned to: ${issue.assignedToName}` : 'Unassigned'}</span>
              {issue.status === IssueStatus.Resolved && issue.rating && (
                <div className="flex items-center">
                    <span>Rating: </span>
                    {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} className="h-4 w-4 text-yellow-400" fill={i < issue.rating! ? 'currentColor' : 'none'} />
                    ))}
                </div>
              )}
          </div>
        </div>
      </div>
      {/* Action and Comments Panel */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 mt-auto">
        {canResolve && (
             <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/50 rounded-md">
                <p className="text-xs font-semibold text-blue-800 dark:text-blue-200 mb-2">Work complete. Please rate and confirm:</p>
                <div className="flex items-center justify-between">
                    <div className="flex">
                        {[...Array(5)].map((_, index) => {
                            const starValue = index + 1;
                            return (
                                <button
                                key={starValue}
                                onClick={() => setRating(starValue)}
                                onMouseEnter={() => setHoverRating(starValue)}
                                onMouseLeave={() => setHoverRating(0)}
                                >
                                <StarIcon
                                    className="h-6 w-6 text-yellow-400"
                                    fill={(hoverRating || rating) >= starValue ? 'currentColor' : 'none'}
                                />
                                </button>
                            );
                        })}
                    </div>
                    <button onClick={handleResolve} disabled={rating === 0} className="text-xs px-2 py-1 rounded bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed">
                        Mark Resolved
                    </button>
                </div>
            </div>
        )}
        {(isAdmin || isWorker) && (issue.status !== IssueStatus.Resolved) && (
            <div className="mb-3">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">Actions:</p>
                <div className="flex flex-col space-y-2">
                <div className="flex space-x-2">
                    {isAdmin && issue.status === IssueStatus.Pending && (
                    <button onClick={() => onAdminUpdateStatus(issue.id, IssueStatus.InProgress)} className="text-xs px-2 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600">Mark In Progress</button>
                    )}
                    {isAdmin && (issue.status === IssueStatus.InProgress || issue.status === IssueStatus.ForReview) && (
                    <button onClick={() => onAdminUpdateStatus(issue.id, IssueStatus.Resolved)} className="text-xs px-2 py-1 rounded bg-green-500 text-white hover:bg-green-600">Mark Resolved</button>
                    )}
                    {isWorker && issue.status === IssueStatus.InProgress && (
                    <button onClick={() => onAdminUpdateStatus(issue.id, IssueStatus.ForReview)} className="text-xs px-2 py-1 rounded bg-blue-500 text-white hover:bg-blue-600">Mark for Review</button>
                    )}
                </div>
                {isAdmin && onAdminAssignIssue && workers && (
                    <div>
                    <select
                        value={issue.assignedTo || ''}
                        onChange={(e) => onAdminAssignIssue(issue.id, e.target.value)}
                        className="text-xs block w-full pl-2 pr-7 py-1 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                        aria-label="Re-assign worker"
                    >
                        <option value="">Re-assign to...</option>
                        {workers.map(worker => (
                            <option key={worker.email} value={worker.email}>{worker.firstName} {worker.lastName}</option>
                        ))}
                    </select>
                    </div>
                )}
                </div>
            </div>
        )}

        {/* Comments Section */}
        <div>
            <button onClick={() => setShowComments(!showComments)} className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                {showComments ? 'Hide Comments' : `View Comments (${issue.comments.length})`}
            </button>
            {showComments && (
                <div className="mt-2 space-y-3">
                    <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                        {issue.comments.length > 0 ? (
                            [...issue.comments].sort((a,b) => a.createdAt.getTime() - b.createdAt.getTime()).map(comment => (
                                <div key={comment.id} className="bg-gray-100 dark:bg-gray-600 p-2 rounded-md">
                                    <p className="text-xs text-gray-800 dark:text-gray-200">{comment.text}</p>
                                    <p className="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        - {comment.authorName}, {timeAgo(comment.createdAt)}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs text-gray-500 dark:text-gray-400">No comments yet.</p>
                        )}
                    </div>
                    {canComment && (
                        <form onSubmit={handleCommentSubmit} className="flex items-start space-x-2">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a comment..."
                                rows={2}
                                className="flex-grow text-xs block w-full px-2 py-1 border-gray-300 dark:border-gray-500 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <button type="submit" className="text-xs px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-400" disabled={!newComment.trim()}>
                                Post
                            </button>
                        </form>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};