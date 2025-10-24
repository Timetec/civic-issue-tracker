// Fix: Added full content for DuplicateIssueModal.tsx
import React from 'react';
import type { CivicIssue } from '../types';

interface DuplicateIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  existingIssue: CivicIssue | null;
}

export const DuplicateIssueModal: React.FC<DuplicateIssueModalProps> = ({ isOpen, onClose, onConfirm, existingIssue }) => {
  if (!isOpen || !existingIssue) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Possible Duplicate</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          This issue looks similar to one that has already been reported.
        </p>
        
        <div className="border dark:border-gray-700 rounded-lg p-4 mb-6">
            <h4 className="font-bold text-gray-800 dark:text-gray-200">{existingIssue.title}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{existingIssue.description}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Status: {existingIssue.status}</p>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Do you still want to submit your report?
        </p>
        
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Submit Anyway
          </button>
        </div>
      </div>
    </div>
  );
};
