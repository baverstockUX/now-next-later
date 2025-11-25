import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminInitiatives, syncFromAha, getConfig, updateConfig, deleteAllInitiatives, getAIModels } from '../utils/api';
import InitiativeCard from './InitiativeCard';
import EditModal from './EditModal';
import DetailModal from './DetailModal';
import ReleaseSelector from './ReleaseSelector';
import SyncProgressModal from './SyncProgressModal';

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showSyncProgress, setShowSyncProgress] = useState(false);
  const [aiModels, setAIModels] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [initiativesRes, configRes, modelsRes] = await Promise.all([
        getAdminInitiatives(),
        getConfig(),
        getAIModels()
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
      setAIModels(modelsRes.data);
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
      await syncFromAha();
      // Show progress modal
      setShowSyncProgress(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start sync');
      setSyncing(false);
    }
  };

  const handleSyncComplete = (progress) => {
    setSyncing(false);
    if (progress.step === 'completed') {
      setSuccess(progress.message);
      setTimeout(() => setSuccess(null), 5000);
      fetchData();
    } else if (progress.error) {
      setError(progress.message);
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

  const handleDeleteAll = async () => {
    try {
      setLoading(true);
      const response = await deleteAllInitiatives();
      setSuccess(`Successfully deleted ${response.data.deleted} initiatives from the board`);
      setTimeout(() => setSuccess(null), 5000);
      setShowDeleteConfirm(false);
      setDeleteConfirmText('');
      await fetchData();
    } catch (err) {
      setError('Failed to delete all initiatives');
      console.error('Error deleting all initiatives:', err);
    } finally {
      setLoading(false);
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
              <span className="text-sm text-gray-600">AI Model:</span>
              <select
                value={config.ai_provider}
                onChange={(e) => handleAIProviderChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-oneadvanced"
              >
                {aiModels.length > 0 ? (
                  aiModels.map(model => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="oneadvanced">OneAdvanced AI</option>
                    <option value="gemini">Gemini 2.0 Flash</option>
                  </>
                )}
              </select>
            </div>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={initiatives.length === 0}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear Board
            </button>
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

      {/* Delete All Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Clear All Initiatives from Board
            </h3>
            <p className="text-gray-700 mb-2">
              This will permanently delete all <span className="font-bold">{initiatives.length} initiatives</span> from the board.
            </p>
            <p className="text-red-600 font-semibold mb-4">
              This action cannot be undone!
            </p>
            <p className="text-gray-700 mb-4">
              To confirm, please type{' '}
              <span className="font-mono font-bold text-red-600">DELETE</span> below:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAll}
                disabled={deleteConfirmText !== 'DELETE' || loading}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Deleting...' : 'Delete All'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sync Progress Modal */}
      {showSyncProgress && (
        <SyncProgressModal
          onClose={() => setShowSyncProgress(false)}
          onComplete={handleSyncComplete}
        />
      )}
    </div>
  );
};

export default AdminView;
