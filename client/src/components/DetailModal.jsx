import React from 'react';

const DetailModal = ({ initiative, onClose }) => {
  if (!initiative) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-start">
          <h2 className="text-2xl font-bold text-gray-900 pr-8">
            {initiative.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Summary/Description */}
          {(initiative.ai_summary || initiative.description) && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
              <p className="text-gray-800 leading-relaxed">
                {initiative.ai_summary || initiative.description}
              </p>
            </div>
          )}

          {/* Timeline */}
          {initiative.timeline && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Timeline</h3>
              <div className="flex items-center text-gray-800">
                <svg
                  className="w-5 h-5 mr-2 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {initiative.timeline}
              </div>
            </div>
          )}

          {/* Status/Column */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Status</h3>
            <span className="inline-block px-3 py-1 text-sm font-medium bg-oneadvanced-100 text-oneadvanced-800 rounded-full capitalize">
              {initiative.column_name}
            </span>
          </div>

          {/* Tags */}
          {initiative.custom_tags && initiative.custom_tags.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {initiative.custom_tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block px-3 py-1 text-sm font-medium bg-gray-100 text-gray-800 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full bg-oneadvanced hover:bg-oneadvanced-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
