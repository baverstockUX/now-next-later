import React, { useState, useEffect } from 'react';
import { updateInitiative, deleteInitiative } from '../utils/api';

const EditModal = ({ initiative, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ai_summary: '',
    custom_tags: [],
    timeline: '',
    column_name: 'explore',
    is_visible: true
  });
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initiative) {
      setFormData({
        title: initiative.title || '',
        description: initiative.description || '',
        ai_summary: initiative.ai_summary || '',
        custom_tags: initiative.custom_tags || [],
        timeline: initiative.timeline || '',
        column_name: initiative.column_name || 'explore',
        is_visible: initiative.is_visible !== false
      });
    }
  }, [initiative]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.custom_tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        custom_tags: [...prev.custom_tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      custom_tags: prev.custom_tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await updateInitiative(initiative.id, formData);
      onSave();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save changes');
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this initiative?')) {
      return;
    }

    try {
      setSaving(true);
      await deleteInitiative(initiative.id);
      onSave();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete initiative');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900">Edit Initiative</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-oneadvanced"
            />
          </div>

          {/* AI Summary (What customers see) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer-Facing Summary *
              <span className="text-xs text-gray-500 ml-2">(This is what customers will see)</span>
            </label>
            <textarea
              name="ai_summary"
              value={formData.ai_summary}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-oneadvanced"
              placeholder="Enter a customer-friendly description..."
            />
          </div>

          {/* Internal Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Internal Description
              <span className="text-xs text-gray-500 ml-2">(Admin only)</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-oneadvanced"
              placeholder="Internal notes (not visible to customers)"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Custom Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-oneadvanced"
                placeholder="Add a tag..."
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.custom_tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-oneadvanced-100 text-oneadvanced-800 rounded"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-oneadvanced-600 hover:text-oneadvanced-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Timeline/Month
            </label>
            <input
              type="text"
              name="timeline"
              value={formData.timeline}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-oneadvanced"
              placeholder="e.g., December 2024, Q1 2025"
            />
          </div>

          {/* Column */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Column *
            </label>
            <select
              name="column_name"
              value={formData.column_name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-oneadvanced"
            >
              <option value="done">Done</option>
              <option value="now">Now</option>
              <option value="next">Next</option>
              <option value="explore">Explore</option>
            </select>
          </div>

          {/* Visibility */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_visible"
              name="is_visible"
              checked={formData.is_visible}
              onChange={handleChange}
              className="w-4 h-4 text-oneadvanced focus:ring-oneadvanced border-gray-300 rounded"
            />
            <label htmlFor="is_visible" className="ml-2 text-sm text-gray-700">
              Visible to customers
            </label>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-oneadvanced hover:bg-oneadvanced-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal;
