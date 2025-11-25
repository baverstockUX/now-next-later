import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminInitiatives, syncFromAha, getConfig, updateConfig } from '../utils/api';
import InitiativeCard from './InitiativeCard';
import EditModal from './EditModal';
import DetailModal from './DetailModal';
import ReleaseSelector from './ReleaseSelector';

const AdminView = ({ onLogout }) => {
  const navigate = useNavigate();
  const [initiatives, setInitiatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingInitiative, setEditingInitiative] = useState(null);
  const [selectedInitiative, setSelectedInitiative] = useState(null);
  const [config, setConfig] = useState({ ai_provider: 'oneadvanced', product_name: 'Our Product', selected_releases: [] });
  const [showPreview, setShowPreview] = useState(false);
  const [showReleaseSelector, setShowReleaseSelector] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [initiativesRes, configRes] = await Promise.all([
        getAdminInitiatives(),
        getConfig()
      ]);
      setInitiatives(initiativesRes.data);
      const configData = configRes.data;
      // Parse selected_releases if it's a string
      if (configData.selected_releases && typeof configData.selected_releases === 'string') {
        try {
          configData.selected_releases = JSON.parse(configData.selected_releases);
        } catch (e) {
          configData.selected_releases = [];
        }
      }
      setConfig(configData || { ai_provider: 'oneadvanced', selected_releases: [] });
      setError(null);
    } catch (err) {
      setError('Failed to load data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!window.confirm('Sync from AHA!? This will fetch the latest data and generate AI summaries.')) {
      return;
    }

    try {
      setSyncing(true);
      setError(null);
      const response = await syncFromAha();
      setSuccess(`Successfully synced ${response.data.synced} initiatives from AHA!`);
      setTimeout(() => setSuccess(null), 5000);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleAIProviderChange = async (provider) => {
    try {
      await updateConfig({ ai_provider: provider });
      setConfig({ ...config, ai_provider: provider });
      setSuccess(`AI provider changed to ${provider}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to update AI provider');
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      onLogout();
      navigate('/');
    }
  };

  const getInitiativesByColumn = (column) => {
    return initiatives.filter(item => item.column_name === column);
  };

  const columns = [
    { id: 'done', title: 'Done', color: 'bg-green-50 border-green-200' },
    { id: 'now', title: 'Now', color: 'bg-blue-50 border-blue-200' },
    { id: 'next', title: 'Next', color: 'bg-orange-50 border-orange-200' },
    { id: 'explore', title: 'Explore', color: 'bg-purple-50 border-purple-200' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading admin panel...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage roadmap initiatives and sync from AHA!
              </p>
            </div>
            <div className="flex gap-3 items-center">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-oneadvanced transition-colors"
              >
                {showPreview ? 'Admin View' : 'Preview Customer View'}
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-6 flex flex-wrap gap-4 items-center">
            <button
              onClick={() => setShowReleaseSelector(!showReleaseSelector)}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              {showReleaseSelector ? 'Hide' : 'Select'} Releases ({(config.selected_releases || []).length})
            </button>

            <button
              onClick={handleSync}
              disabled={syncing}
              className="px-6 py-2 bg-oneadvanced hover:bg-oneadvanced-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg
                className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {syncing ? 'Syncing...' : 'Sync from AHA!'}
            </button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">AI Provider:</span>
              <select
                value={config.ai_provider}
                onChange={(e) => handleAIProviderChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-oneadvanced"
              >
                <option value="oneadvanced">OneAdvanced AI</option>
                <option value="gemini">Gemini 3 Pro</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            {success}
          </div>
        )}

        {/* Release Selector */}
        {showReleaseSelector && (
          <div className="mb-6">
            <ReleaseSelector
              selectedReleases={config.selected_releases || []}
              onSave={(selected) => {
                setConfig({ ...config, selected_releases: selected });
                setSuccess(`${selected.length} releases selected. Click "Sync from AHA!" to fetch features.`);
                setTimeout(() => setSuccess(null), 5000);
                setShowReleaseSelector(false);
              }}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map(column => (
            <div key={column.id} className="flex flex-col">
              <div className={`${column.color} border-2 rounded-t-lg px-4 py-3`}>
                <h2 className="text-xl font-bold text-gray-800">{column.title}</h2>
                <p className="text-xs text-gray-600 mt-1">
                  {getInitiativesByColumn(column.id).length} item(s)
                </p>
              </div>
              <div className="bg-white border-l-2 border-r-2 border-b-2 border-gray-200 rounded-b-lg p-4 flex-1 space-y-4">
                {getInitiativesByColumn(column.id).length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-8">
                    No items yet
                  </p>
                ) : (
                  getInitiativesByColumn(column.id).map(initiative => (
                    <InitiativeCard
                      key={initiative.id}
                      initiative={initiative}
                      isAdmin={!showPreview}
                      onEdit={setEditingInitiative}
                      onView={setSelectedInitiative}
                    />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Edit Modal */}
      {editingInitiative && (
        <EditModal
          initiative={editingInitiative}
          onClose={() => setEditingInitiative(null)}
          onSave={() => {
            setEditingInitiative(null);
            fetchData();
          }}
        />
      )}

      {/* Detail Modal */}
      {selectedInitiative && (
        <DetailModal
          initiative={selectedInitiative}
          onClose={() => setSelectedInitiative(null)}
        />
      )}
    </div>
  );
};

export default AdminView;
