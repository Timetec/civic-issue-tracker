import React, { useState } from 'react';
import type { CivicIssue, User } from '../types';
import { IssueStatus, UserRole } from '../types';
import { Modal } from './Modal';
import { StaticMapPreview } from './StaticMapPreview';
import { LocationMarkerIcon, ClockIcon, CheckCircleIcon, ExclamationCircleIcon, ClipboardCheckIcon, CopyIcon, StarIcon, UserCircleIcon } from './Icons';

interface IssueDetailModalProps {
  issue: CivicIssue;
  isOpen: boolean;
  onClose: () => void;
  currentUser: Omit<User, 'password'>;
  workers: Omit<User, 'password'>[];
  onAdminUpdateStatus: (id: string, newStatus: IssueStatus) => void;
  onCitizenResolveIssue: (id: string, rating: number) => void;
  onAdminAssignIssue: (issueId: string, workerEmail: string) => void;
  onAddComment: (issueId: string, text: string) => void;
}

const statusStyles = {
  [IssueStatus.Pending]: { bg: 'bg-red-100 dark:bg-red-900/50', text: 'text-red-800 dark:text-red-200', icon: <ClockIcon className="h-5 w-5 text-red-500" /> },
  [IssueStatus.InProgress]: { bg: 'bg-yellow-100 dark:bg-yellow-900/50', text: 'text-yellow-800 dark:text-yellow-200', icon: <ExclamationCircleIcon className="h-5 w-5 text-yellow-500" /> },
  [IssueStatus.ForReview]: { bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-800 dark:text-blue-200', icon: <ClipboardCheckIcon className="h-5 w-5 text-blue-500" /> },
  [IssueStatus.Resolved]: { bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-800 dark:text-green-200', icon: <CheckCircleIcon className="h-5 w-5 text-green-500" /> },
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

export const IssueDetailModal: React.FC<IssueDetailModalProps> = ({ issue, isOpen, onClose, currentUser, workers, onAdminUpdateStatus, onCitizenResolveIssue, onAdminAssignIssue, onAddComment }) => {
  const [newComment, setNewComment] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  const [rating, setRating] = useState(issue.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  
  const { bg, text, icon } = statusStyles[issue.status];
  
  const isAdmin = currentUser.role === UserRole.Admin;
  const isWorker = currentUser.role === UserRole.Worker;
  const isReporter = currentUser.email === issue.reporterId;
  const canComment = isAdmin || isWorker || isReporter;
  const canResolve = isReporter && issue.status === IssueStatus.ForReview;

  const handleCopyId = () => {
    navigator.clipboard.writeText(issue.id).then(() => {
        setCopySuccess('Copied!');
        setTimeout(() => setCopySuccess(''), 2000);
    }, () => {
        setCopySuccess('Failed');
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

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
        <div className="p-4 md:p-6">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{issue.category}</span>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{issue.title}</h2>
                </div>
                 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text} mt-1`}>
                  {icon}
                  <span className="ml-1.5">{issue.status}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-4">
                    <div>
                        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Description</h3>
                        <p className="text-gray-700 dark:text-gray-300">{issue.description}</p>
                    </div>

                    {issue.photoUrls && issue.photoUrls.length > 0 && !issue.photoUrls[0].includes('placehold.co') && (
                        <div>
                            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Photos</h3>
                            <div className="flex overflow-x-auto space-x-2 pb-2">
                                {issue.photoUrls.map((url, index) => (
                                <a href={url} target="_blank" rel="noopener noreferrer" key={index} className="flex-shrink-0">
                                    <img src={url} alt={`Issue photo ${index + 1}`} className="h-28 w-28 object-cover rounded-md border-2 border-gray-200 dark:border-gray-600 hover:border-indigo-500" />
                                </a>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <div>
                        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Location</h3>
                        <StaticMapPreview location={issue.location} className="h-48 w-full rounded-md" />
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="md:col-span-1 space-y-4 text-sm">
                    <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Details</h3>
                    <div className="space-y-3">
                         <div className="flex items-center">
                            <ClockIcon className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                            <div>
                                <span className="font-semibold text-gray-800 dark:text-gray-200">Reported:</span>
                                <span className="text-gray-600 dark:text-gray-300 ml-1">{new Date(issue.createdAt).toLocaleDateString()} ({timeAgo(issue.createdAt)})</span>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <UserCircleIcon className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                            <div>
                                <span className="font-semibold text-gray-800 dark:text-gray-200">By:</span>
                                <span className="text-gray-600 dark:text-gray-300 ml-1">{issue.reporterName}</span>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <LocationMarkerIcon className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                            <div>
                                <span className="font-semibold text-gray-800 dark:text-gray-200">Coords:</span>
                                <span className="text-gray-600 dark:text-gray-300 font-mono ml-1">{issue.location.lat.toFixed(4)}, {issue.location.lng.toFixed(4)}</span>
                            </div>
                        </div>
                        {issue.assignedToName && (
                             <div className="flex items-center">
                                <UserCircleIcon className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                                <div>
                                    <span className="font-semibold text-gray-800 dark:text-gray-200">Assigned:</span>
                                    <span className="text-gray-600 dark:text-gray-300 ml-1">{issue.assignedToName}</span>
                                </div>
                            </div>
                        )}
                        {issue.status === IssueStatus.Resolved && issue.rating && (
                            <div className="flex items-center">
                                <StarIcon className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                                <div>
                                <span className="font-semibold text-gray-800 dark:text-gray-200">Rating:</span>
                                <span className="flex items-center ml-1">
                                    {[...Array(5)].map((_, i) => (
                                        <StarIcon key={i} className="h-4 w-4 text-yellow-400" fill={i < issue.rating! ? 'currentColor' : 'none'} />
                                    ))}
                                </span>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center">
                            <span className="font-mono text-xs text-gray-400 dark:text-gray-500 mr-1">ID: {issue.id}</span>
                            <button onClick={handleCopyId} title="Copy ID" className="text-gray-400 hover:text-indigo-500">
                                <CopyIcon className="h-4 w-4" />
                            </button>
                            {copySuccess && <span className="text-indigo-500 text-xs ml-2">{copySuccess}</span>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions & Comments */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                {/* Actions */}
                {canResolve && (
                    <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/50 rounded-md">
                        <p className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">Work complete. Please rate and confirm:</p>
                        <div className="flex items-center justify-between">
                            <div className="flex">
                                {[...Array(5)].map((_, index) => {
                                    const starValue = index + 1;
                                    return (
                                        <button key={starValue} onClick={() => setRating(starValue)} onMouseEnter={() => setHoverRating(starValue)} onMouseLeave={() => setHoverRating(0)}>
                                            <StarIcon className="h-6 w-6 text-yellow-400" fill={(hoverRating || rating) >= starValue ? 'currentColor' : 'none'} />
                                        </button>
                                    );
                                })}
                            </div>
                            <button onClick={handleResolve} disabled={rating === 0} className="text-sm px-3 py-1.5 rounded bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed">
                                Mark Resolved
                            </button>
                        </div>
                    </div>
                )}
                {(isAdmin || isWorker) && (issue.status !== IssueStatus.Resolved) && (
                    <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">Actions:</p>
                        <div className="flex flex-wrap items-center gap-2">
                            {isAdmin && issue.status === IssueStatus.Pending && (<button onClick={() => onAdminUpdateStatus(issue.id, IssueStatus.InProgress)} className="text-xs px-2 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600">Mark In Progress</button>)}
                            {isAdmin && (issue.status === IssueStatus.InProgress || issue.status === IssueStatus.ForReview) && (<button onClick={() => onAdminUpdateStatus(issue.id, IssueStatus.Resolved)} className="text-xs px-2 py-1 rounded bg-green-500 text-white hover:bg-green-600">Mark Resolved</button>)}
                            {isWorker && issue.status === IssueStatus.InProgress && (<button onClick={() => onAdminUpdateStatus(issue.id, IssueStatus.ForReview)} className="text-xs px-2 py-1 rounded bg-blue-500 text-white hover:bg-blue-600">Mark for Review</button>)}
                            {isAdmin && (
                                <select value={issue.assignedTo || ''} onChange={(e) => onAdminAssignIssue(issue.id, e.target.value)} className="text-xs block w-48 pl-2 pr-7 py-1 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200" aria-label="Re-assign worker">
                                    <option value="">Re-assign worker...</option>
                                    {workers.map(worker => (<option key={worker.email} value={worker.email}>{worker.firstName} {worker.lastName}</option>))}
                                </select>
                            )}
                        </div>
                    </div>
                )}
                
                {/* Comments */}
                <div>
                    <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Comments ({issue.comments.length})</h3>
                    <div className="space-y-3">
                        <div className="max-h-32 overflow-y-auto space-y-2 pr-2">
                             {issue.comments.length > 0 ? (
                                [...issue.comments].sort((a,b) => a.createdAt.getTime() - b.createdAt.getTime()).map(comment => (
                                    <div key={comment.id} className="bg-gray-100 dark:bg-gray-700/50 p-2 rounded-md">
                                        <p className="text-xs text-gray-800 dark:text-gray-200">{comment.text}</p>
                                        <p className="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">- {comment.authorName}, {timeAgo(comment.createdAt)}</p>
                                    </div>
                                ))
                             ) : (<p className="text-xs text-gray-500 dark:text-gray-400">No comments yet.</p>)}
                        </div>
                        {canComment && (
                            <form onSubmit={handleCommentSubmit} className="flex items-start space-x-2">
                                <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment..." rows={2} className="flex-grow text-xs block w-full px-2 py-1 border-gray-300 dark:border-gray-500 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500" />
                                <button type="submit" className="text-xs px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-400" disabled={!newComment.trim()}>Post</button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </Modal>
  );
};
