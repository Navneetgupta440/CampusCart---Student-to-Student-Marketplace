import React, { useState } from 'react';
import { X, Flag, AlertTriangle } from 'lucide-react';
import { api } from '../api.js';

const REPORT_REASONS = [
  'Prohibited or dangerous goods',
  'Misleading condition, false description, or counterfeit item',
  'Academic copyright or unauthorized distribution of materials',
  'Suspicious transaction request or non-campus meetup demand',
  'Spam, duplicate or offensive content',
  'Other policy violation',
];

export const ReportModal = ({
  isOpen,
  onClose,
  listing,
  onSuccess,
}) => {
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !listing) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please provide specific details regarding this report.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const res = await api.createReport({
        targetType: 'listing',
        listingId: listing.id,
        reason,
        description: description.trim(),
      });
      onSuccess(res.message);
      setDescription('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <Flag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Report Listing</h2>
              <p className="text-xs text-slate-500">Submit for campus administrative review</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Listing preview */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 text-xs text-slate-600">
          Reporting: <span className="font-semibold text-slate-900">"{listing.title}"</span> by{' '}
          <span className="font-medium text-slate-800">{listing.sellerName}</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Reason for Reporting *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3068E0] bg-white"
            >
              {REPORT_REASONS.map((r, idx) => (
                <option key={idx} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Detailed Explanation *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain why this listing violates campus marketplace rules or copyright guidelines..."
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3068E0]"
            />
          </div>

          <div className="text-[11px] text-slate-500 leading-relaxed">
            All reports are investigated by CampusCart administrators. Confirmed violations result in listing removal and account moderation.
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
