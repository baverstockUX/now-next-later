import React, { useState, useEffect } from 'react';
import { getAvailableReleases, updateConfig } from '../utils/api';

const ReleaseSelector = ({ selectedReleases = [], onSave }) => {
  const [availableReleases, setAvailableReleases] = useState([]);
  const [selected, setSelected] = useState(selectedReleases);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReleases();
  }, []);

  useEffect(() => {
    setSelected(selectedReleases);
  }, [selectedReleases]);

  const fetchReleases = async () => {
    try {
      setLoading(true);
      const response = await getAvailableReleases();
      setAvailableReleases(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load releases from AHA!');
      console.error('Error fetching releases:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleRelease = (releaseName) => {
    setSelected(prev => {
      if (prev.includes(releaseName)) {
        return prev.filter(r => r !== releaseName);
      } else {
        return [...prev, releaseName];
      }
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateConfig({ selected_releases: selected });
      onSave && onSave(selected);
      setError(null);
    } catch (err) {
      setError('Failed to save release selection');
      console.error('Error saving releases:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 bg-white border border-gray-200 rounded-lg">
        <div className="text-gray-600">Loading releases...</div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">
        Select Releases to Sync
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Choose which AHA! releases to include in the roadmap. Only features from selected releases will be synced.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
          {error}
        </div>
      )}

      <div className="max-h-64 overflow-y-auto mb-4 space-y-2">
        {availableReleases.length === 0 ? (
          <p className="text-gray-500 text-sm">No releases found</p>
        ) : (
          availableReleases.map((release) => (
            <label
              key={release.id}
              className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.includes(release.name)}
                onChange={() => toggleRelease(release.name)}
                className="w-4 h-4 text-oneadvanced focus:ring-oneadvanced border-gray-300 rounded"
              />
              <div className="ml-3 flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {release.name}
                </div>
                <div className="text-xs text-gray-500">
                  {release.release_date
                    ? new Date(release.release_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })
                    : 'No date'}
                  {' • '}
                  {release.released ? 'Released' : 'Upcoming'}
                </div>
              </div>
            </label>
          ))
        )}
      </div>

      <div className="flex gap-3 pt-3 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 px-4 py-2 bg-oneadvanced hover:bg-oneadvanced-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : `Save Selection (${selected.length} releases)`}
        </button>
        <button
          onClick={fetchReleases}
          disabled={loading}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>
    </div>
  );
};

export default ReleaseSelector;
