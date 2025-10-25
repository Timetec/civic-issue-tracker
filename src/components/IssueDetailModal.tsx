import React, { useState } from 'react';
import type { CivicIssue, User, Comment } from '../types';
import { UserRole, IssueStatus } from '../types';
import { Modal } from './Modal';
import { StaticMapPreview } from './StaticMapPreview';
import { ClockIcon, CheckCircleIcon, ExclamationCircleIcon, ClipboardCheckIcon, MapPinIcon, UserCircleIcon, StarIcon, Spinner } from './Icons';

interface IssueDetailModalProps {
  issue: CivicIssue;
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  workers: Omit<User, 'password'>[];
  onAdminUpdateStatus: (id: string, newStatus: IssueStatus) => void;
  onCitizenResolveIssue: (id: string, rating: number) => void;
  onAdminAssignIssue: (issueId: string, workerEmail: string) => void;
  onAddComment: (issueId: string, text: string) => void;
}

// Fix: Changed JSX.Element to React.ReactNode to fix TypeScript namespace error.
const statusStyles: { [key in IssueStatus]: { text: string; icon: React.ReactNode } } = {
  [IssueStatus.Pending]: { text: 'text-red-600 dark:text-red-400', icon: <ClockIcon className="h-5 w-5" /> },
  [IssueStatus.InProgress]: { text: 'text-yellow-600 dark:text-yellow-400', icon: <ExclamationCircleIcon className="h-5 w-5" /> },
  [IssueStatus.ForReview]: { text: 'text-blue-600 dark:text-blue-400', icon: <ClipboardCheckIcon className="h-5 w-5" /> },
  [IssueStatus.Resolved]: { text: 'text-green-600 dark:text-green-400', icon: <CheckCircleIcon className="h-5 w-5" /> },
};

const RatingDisplay: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex items-center">
    {[...Array(5)].map((_, i) => (
      <StarIcon key={i} className={`h-5 w-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} fill={i < rating ? 'currentColor' : 'none'} />
    ))}
  </div>
);

export const IssueDetailModal: React.FC<IssueDetailModalProps> = ({ issue, isOpen, onClose, currentUser, workers, onAdminUpdateStatus, onCitizenResolveIssue, onAdminAssignIssue, onAddComment }) => {
    const [newComment, setNewComment] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [citizenRating, setCitizenRating] = useState(0);

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!newComment.trim()) return;
        setIsSubmittingComment(true);
        await onAddComment(issue.id, newComment);
        setNewComment('');
        setIsSubmittingComment(false);
    };

    const isReporter = currentUser.email === issue.reporterId;
    const isAdmin = currentUser.role === UserRole.Admin;
    const isAssignedWorker = currentUser.email === issue.assignedTo;
    
    const canViewComments = isAdmin || isReporter || isAssignedWorker || currentUser.role === UserRole.Service;
    const canAddComment = isAdmin || isReporter || isAssignedWorker;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Issue Details" size="xl">
            <div className="space-y-6">
                {/* Header */}
                <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase">{issue.category}</span>
                    <h3 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{issue.title}</h3>
                    <div className={`mt-2 flex items-center text-sm font-medium ${statusStyles[issue.status].text}`}>
                        {statusStyles[issue.status].icon}
                        <span className="ml-2">{issue.status}</span>
                    </div>
                </div>

                {/* Body */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200">Description</h4>
                            <p className="text-gray-600 dark:text-gray-400">{issue.description}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200">Reported By</h4>
                            <p className="text-gray-600 dark:text-gray-400">{issue.reporterName} ({issue.reporterId})</p>
                            <p className="text-xs text-gray-500">on {issue.createdAt.toLocaleDateString()}</p>
                        </div>
                        {issue.assignedToName && (
                             <div>
                                <h4 className="font-semibold text-gray-800 dark:text-gray-200">Assigned To</h4>
                                <p className="text-gray-600 dark:text-gray-400">{issue.assignedToName} ({issue.assignedTo})</p>
                            </div>
                        )}
                        {issue.status === IssueStatus.Resolved && issue.rating && (
                            <div>
                                <h4 className="font-semibold text-gray-800 dark:text-gray-200">Citizen Rating</h4>
                                <RatingDisplay rating={issue.rating} />
                            </div>
                        )}
                    </div>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Location</h4>
                            <StaticMapPreview location={issue.location} className="h-40 w-full rounded-md" />
                        </div>
                         <div>
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Photos</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {issue.photoUrls.map((url, index) => (
                                    <a href={url} target="_blank" rel="noopener noreferrer" key={index}>
                                        <img src={url} alt={`Issue photo ${index + 1}`} className="h-24 w-full object-cover rounded-md" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-4">
                    {/* Admin Actions */}
                    {isAdmin && issue.status !== IssueStatus.Resolved && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Admin Actions</h4>
                            <div className="flex flex-wrap gap-2">
                                <select 
                                    onChange={(e) => onAdminUpdateStatus(issue.id, e.target.value as IssueStatus)} 
                                    value={issue.status}
                                    className="block border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 px-3 py-2"
                                >
                                    {Object.values(IssueStatus).filter(s => s !== IssueStatus.Resolved).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <select
                                    onChange={(e) => onAdminAssignIssue(issue.id, e.target.value)}
                                    value={issue.assignedTo || ''}
                                    className="block border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 px-3 py-2"
                                >
                                    <option value="">Assign to worker...</option>
                                    {workers.map(w => <option key={w.email} value={w.email}>{w.firstName} {w.lastName}</option>)}
                                </select>
                            </div>
                        </div>
                    )}
                     {/* Worker Actions */}
                    {isAssignedWorker && (issue.status === IssueStatus.Pending || issue.status === IssueStatus.InProgress) && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Worker Actions</h4>
                             <div className="flex flex-wrap gap-2">
                                <button onClick={() => onAdminUpdateStatus(issue.id, IssueStatus.InProgress)} disabled={issue.status === IssueStatus.InProgress} className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700 disabled:opacity-50">Mark In Progress</button>
                                <button onClick={() => onAdminUpdateStatus(issue.id, IssueStatus.ForReview)} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Mark For Review</button>
                            </div>
                        </div>
                    )}
                    {/* Citizen Actions */}
                    {isReporter && issue.status === IssueStatus.ForReview && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Confirm Resolution</h4>
                             <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Please confirm if the issue has been resolved to your satisfaction and provide a rating.</p>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                    <button key={i} onClick={() => setCitizenRating(i + 1)}>
                                        <StarIcon className={`h-7 w-7 cursor-pointer ${i < citizenRating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} fill={i < citizenRating ? 'currentColor' : 'none'} />
                                    </button>
                                ))}
                                </div>
                                <button onClick={() => onCitizenResolveIssue(issue.id, citizenRating)} disabled={citizenRating === 0} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50">Confirm & Rate</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Comments */}
                {canViewComments && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Comments ({issue.comments.length})</h4>
                        <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                            {issue.comments.map(comment => (
                                <div key={comment.id} className="flex items-start space-x-3">
                                    <UserCircleIcon className="h-8 w-8 text-gray-400" />
                                    <div className="flex-1">
                                        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
                                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{comment.authorName}</p>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">{comment.text}</p>
                                        </div>
                                        <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {canAddComment && (
                             <form onSubmit={handleAddComment} className="mt-4 flex gap-2">
                                <input 
                                    type="text" 
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Add a comment..."
                                    className="flex-grow block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 px-3 py-2"
                                />
                                <button type="submit" disabled={isSubmittingComment} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 flex items-center">
                                    {isSubmittingComment && <Spinner className="h-4 w-4 mr-2" />}
                                    Send
                                </button>
                            </form>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
};