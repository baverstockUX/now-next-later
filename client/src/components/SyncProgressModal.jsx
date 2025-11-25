import React, { useState, useEffect } from 'react';
import { getSyncProgress, cancelSync } from '../utils/api';

const SyncProgressModal = ({ onClose, onComplete }) => {
  const [progress, setProgress] = useState({
    inProgress: true,
    step: '',
    message: '',
    percentage: 0,
    error: null
  });
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    // Poll for progress every 500ms
    const interval = setInterval(async () => {
      try {
        const response = await getSyncProgress();
        const data = response.data;
        setProgress(data);

        // If sync is complete or errored, stop polling
        if (!data.inProgress) {
          clearInterval(interval);
          // Auto-close after 2 seconds on completion
          setTimeout(() => {
            onComplete && onComplete(data);
            onClose();
          }, 2000);
        }
      } catch (error) {
        console.error('Error fetching sync progress:', error);
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [onClose, onComplete]);

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel the sync? This may leave the sync incomplete.')) {
      setCancelling(true);
      try {
        await cancelSync();
      } catch (error) {
        console.error('Error cancelling sync:', error);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Syncing from AHA!
        </h3>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-oneadvanced h-4 transition-all duration-500 ease-out flex items-center justify-center"
              style={{ width: `${progress.percentage}%` }}
            >
              {progress.percentage > 20 && (
                <span className="text-xs font-semibold text-white">
                  {progress.percentage}%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Status message */}
        <p className="text-sm text-gray-700 mb-4 min-h-[40px]">
          {progress.message || 'Starting sync...'}
        </p>

        {/* Error message */}
        {progress.error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
            {progress.error}
          </div>
        )}

        {/* Success message */}
        {!progress.inProgress && progress.step === 'completed' && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-800 text-sm flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {progress.message}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          {progress.inProgress && !cancelling && (
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
            >
              Cancel Sync
            </button>
          )}
          {cancelling && (
            <button
              disabled
              className="flex-1 px-4 py-2 bg-gray-400 text-white font-medium rounded-lg cursor-not-allowed"
            >
              Cancelling...
            </button>
          )}
          {!progress.inProgress && (
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SyncProgressModal;
