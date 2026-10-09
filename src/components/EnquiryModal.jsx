import React, { useState } from 'react';
import { X, Send, ShieldCheck, AlertCircle } from 'lucide-react';
import { api } from '../api.js';

const QUICK_PROMPTS = [
  'Hi, is this still available? Can we meet at the campus library?',
  'I am interested in buying this item. What time suits you for pickup?',
  'Can we inspect the condition before finalizing at the student center?',
];

export const EnquiryModal = ({
  isOpen,
  onClose,
  listing,
  onSuccess,
}) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !listing) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (message.trim().length < 5) {
      setError('Please write at least 5 characters in your enquiry message.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const res = await api.createEnquiry({
        listingId: listing.id,
        message: message.trim(),
      });
      onSuccess(res.message);
      setMessage('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to dispatch enquiry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Contact Seller</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Send a direct query to {listing.sellerName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Listing preview banner */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
          <img
            src={listing.images[0] || '/images/items/default_item.svg'}
            alt=""
            className="w-12 h-12 rounded-lg object-cover bg-slate-900 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-semibold text-slate-900 line-clamp-1">{listing.title}</h4>
            <div className="text-xs font-bold text-[#3068E0] tabular-nums mt-0.5">
              ₹{listing.price} · {listing.condition}
            </div>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Your Enquiry Message *
            </label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about pickup time, book edition, or availability..."
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3068E0]"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>Minimum 5 characters</span>
              <span>{message.length}/1000</span>
            </div>
          </div>

          {/* Quick prompt suggestions */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-slate-500">Quick question ideas:</span>
            <div className="flex flex-col gap-1">
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setMessage(prompt)}
                  className="text-left text-xs text-slate-600 hover:text-[#3068E0] hover:bg-blue-50/50 p-1.5 rounded transition-colors border border-slate-100"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-100 text-emerald-900 text-[11px] flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              Your message will be sent to the seller's CampusCart inbox. Replies will appear in your Enquiry Inbox.
            </div>
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
              className="px-5 py-2 text-sm font-semibold text-white bg-[#3068E0] hover:bg-[#2253bc] rounded-lg transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Sending...' : 'Send Enquiry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
