import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getInitiatives } from '../utils/api';
import InitiativeCard from './InitiativeCard';
import DetailModal from './DetailModal';

const CustomerView = ({ onAdminClick }) => {
  const [initiatives, setInitiatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInitiative, setSelectedInitiative] = useState(null);

  useEffect(() => {
    fetchInitiatives();
  }, []);

  const fetchInitiatives = async () => {
    try {
      setLoading(true);
      const response = await getInitiatives();
      setInitiatives(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load roadmap');
      console.error('Error fetching initiatives:', err);
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
        <div className="text-xl text-gray-600">Loading roadmap...</div>
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
              <h1 className="text-3xl font-bold text-gray-900">Product Roadmap</h1>
              <p className="mt-1 text-sm text-gray-600">
                See what we're working on and what's coming next
              </p>
            </div>
            <button
              onClick={onAdminClick}
              className="text-sm text-gray-500 hover:text-oneadvanced transition-colors"
            >
              Admin
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
                      isAdmin={false}
                      onView={setSelectedInitiative}
                    />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-6 text-center text-sm text-gray-500">
        <p>Powered by OneAdvanced</p>
      </footer>

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

export default CustomerView;
