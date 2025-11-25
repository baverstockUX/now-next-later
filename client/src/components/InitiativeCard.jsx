import React from 'react';

const InitiativeCard = ({ initiative, isAdmin, onEdit }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Title */}
      <h3 className="text-base font-semibold text-gray-900 mb-2">
        {initiative.title}
      </h3>

      {/* Description/Summary */}
      {(initiative.ai_summary || initiative.description) && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-3">
          {initiative.ai_summary || initiative.description}
        </p>
      )}

      {/* Tags */}
      {initiative.custom_tags && initiative.custom_tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {initiative.custom_tags.map((tag, index) => (
            <span
              key={index}
              className="inline-block px-2 py-1 text-xs font-medium bg-oneadvanced-100 text-oneadvanced-800 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Timeline */}
      {initiative.timeline && (
        <div className="flex items-center text-xs text-gray-500 mb-2">
          <svg
            className="w-4 h-4 mr-1"
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
      )}

      {/* Admin Controls */}
      {isAdmin && onEdit && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <button
            onClick={() => onEdit(initiative)}
            className="text-sm text-oneadvanced hover:text-oneadvanced-700 font-medium"
          >
            Edit
          </button>
        </div>
      )}
    </div>
  );
};

export default InitiativeCard;
