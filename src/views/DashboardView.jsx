import React, { useState, useEffect } from 'react';
import {
  Package,
  Bookmark,
  MessageSquare,
  Settings,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Send,
  Mail,
  BellRing,
  CheckCircle,
  Clock,
  TrendingDown,
} from 'lucide-react';
import { api } from '../api.js';

export const DashboardView = ({
  currentUser,
  onOpenCreateListing,
  onSelectListing,
  onUpdateCurrentUser,
  onShowToast,
  initialTab = 'listings',
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);

  // Data states
  const [myListings, setMyListings] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [receivedEnquiries, setReceivedEnquiries] = useState([]);
  const [sentEnquiries, setSentEnquiries] = useState([]);

  // Modals & interaction states
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [replyingEnquiry, setReplyingEnquiry] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  // Profile Form state
  const [editName, setEditName] = useState(currentUser.displayName);
  const [editCollege, setEditCollege] = useState(currentUser.college);
  const [editDepartment, setEditDepartment] = useState(currentUser.department || '');
  const [editCourse, setEditCourse] = useState(currentUser.course || '');
  const [editYear, setEditYear] = useState(currentUser.yearOfStudy || '3rd Year');
  const [editBio, setEditBio] = useState(currentUser.bio || '');
  const [profileSaving, setProfileSaving] = useState(false);

  // Email Notification Preferences state
  const [notifyNewEnquiries, setNotifyNewEnquiries] = useState(
    currentUser.emailNotifications?.newEnquiries ?? true
  );
  const [notifyPriceDrops, setNotifyPriceDrops] = useState(
    currentUser.emailNotifications?.priceDrops ?? true
  );
  const [notifyEnquiryReplies, setNotifyEnquiryReplies] = useState(
    currentUser.emailNotifications?.enquiryReplies ?? true
  );
  const [notifyListingStatus, setNotifyListingStatus] = useState(
    currentUser.emailNotifications?.listingStatusUpdates ?? true
  );
  const [notifyCampusAlerts, setNotifyCampusAlerts] = useState(
    currentUser.emailNotifications?.campusAlerts ?? false
  );
  const [sendingTestAlert, setSendingTestAlert] = useState(false);

  useEffect(() => {
    setEditName(currentUser.displayName);
    setEditCollege(currentUser.college);
    setEditDepartment(currentUser.department || '');
    setEditCourse(currentUser.course || '');
    setEditYear(currentUser.yearOfStudy || '3rd Year');
    setEditBio(currentUser.bio || '');
    setNotifyNewEnquiries(currentUser.emailNotifications?.newEnquiries ?? true);
    setNotifyPriceDrops(currentUser.emailNotifications?.priceDrops ?? true);
    setNotifyEnquiryReplies(currentUser.emailNotifications?.enquiryReplies ?? true);
    setNotifyListingStatus(currentUser.emailNotifications?.listingStatusUpdates ?? true);
    setNotifyCampusAlerts(currentUser.emailNotifications?.campusAlerts ?? false);
  }, [currentUser]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. My Listings
      const listRes = await api.getListings({ sellerId: currentUser.id, limit: 50 });
      setMyListings(listRes.listings);

      // 2. Wishlist
      const wishRes = await api.getWishlist();
      setWishlist(wishRes.wishlist);

      // 3. Enquiries
      const enqRes = await api.getEnquiries();
      setReceivedEnquiries(enqRes.received);
      setSentEnquiries(enqRes.sent);
    } catch (err) {
      console.error('Error fetching dashboard records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [currentUser.id]);

  // Listing status toggle
  const handleUpdateListingStatus = async (id, newStatus) => {
    try {
      await api.updateListingStatus(id, newStatus);
      onShowToast(`Listing marked as ${newStatus}.`, 'success');
      fetchDashboardData();
    } catch (err) {
      onShowToast(err.message || 'Failed to update listing status.', 'error');
    }
  };

  // Delete listing
  const handleDeleteListing = async (id) => {
    try {
      await api.deleteListing(id);
      onShowToast('Listing deleted successfully.', 'success');
      setDeleteConfirmId(null);
      fetchDashboardData();
    } catch (err) {
      onShowToast(err.message || 'Could not delete listing.', 'error');
    }
  };

  // Remove from wishlist
  const handleRemoveWishlist = async (listingId) => {
    try {
      await api.removeFromWishlist(listingId);
      onShowToast('Removed from wishlist.', 'info');
      fetchDashboardData();
    } catch (err) {
      onShowToast(err.message || 'Could not remove wishlist item.', 'error');
    }
  };

  // Send enquiry reply
  const handleSendReply = async () => {
    if (!replyingEnquiry || !replyText.trim()) return;
    setReplyLoading(true);
    try {
      await api.updateEnquiryStatus(replyingEnquiry.id, {
        replyMessage: replyText.trim(),
        status: 'Replied',
      });
      onShowToast('Reply sent to student buyer.', 'success');
      setReplyingEnquiry(null);
      setReplyText('');
      fetchDashboardData();
    } catch (err) {
      onShowToast(err.message || 'Failed to send reply.', 'error');
    } finally {
      setReplyLoading(false);
    }
  };

  // Update profile & notification preferences
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const res = await api.updateProfile({
        displayName: editName,
        college: editCollege,
        department: editDepartment,
        course: editCourse,
        yearOfStudy: editYear,
        bio: editBio,
        emailNotifications: {
          newEnquiries: notifyNewEnquiries,
          priceDrops: notifyPriceDrops,
          enquiryReplies: notifyEnquiryReplies,
          listingStatusUpdates: notifyListingStatus,
          campusAlerts: notifyCampusAlerts,
        },
      });
      onUpdateCurrentUser(res.user);
      onShowToast('Profile & email notification preferences saved successfully.', 'success');
    } catch (err) {
      onShowToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSendTestNotification = async () => {
    setSendingTestAlert(true);
    try {
      const res = await api.sendTestNotification();
      onShowToast(res.message, 'success');
    } catch (err) {
      onShowToast(err.message || 'Failed to dispatch test notification.', 'error');
    } finally {
      setSendingTestAlert(false);
    }
  };

  const activeCount = myListings.filter((l) => l.status === 'Active').length;
  const soldCount = myListings.filter((l) => l.status === 'Sold').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-2xs">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#12213A] text-white flex items-center justify-center font-bold text-2xl uppercase shadow-sm">
            {currentUser.displayName.charAt(0)}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                {currentUser.displayName}
              </h1>
              {currentUser.emailVerified && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Student
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              {currentUser.college} &middot; {currentUser.department} &middot; {currentUser.yearOfStudy}
            </p>
            <p className="text-xs text-slate-400 font-mono">{currentUser.email}</p>
          </div>
        </div>

        <button
          onClick={onOpenCreateListing}
          className="px-5 py-2.5 bg-[#3068E0] hover:bg-[#2355c4] text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Campus Listing</span>
        </button>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs text-slate-500">Active Listings</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{activeCount}</div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs text-slate-500">Items Sold / Reused</span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{soldCount}</div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs text-slate-500">Wishlist Saved</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{wishlist.length}</div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs text-slate-500">Buyer Enquiries</span>
          <div className="text-2xl font-bold text-[#3068E0] mt-1">{receivedEnquiries.length}</div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('listings')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'listings'
              ? 'border-[#3068E0] text-[#3068E0]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Listings ({myListings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('wishlist')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'wishlist'
              ? 'border-[#3068E0] text-[#3068E0]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved Wishlist ({wishlist.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('received')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'received'
              ? 'border-[#3068E0] text-[#3068E0]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Received Enquiries ({receivedEnquiries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sent')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'sent'
              ? 'border-[#3068E0] text-[#3068E0]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Sent Enquiries ({sentEnquiries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'settings'
              ? 'border-[#3068E0] text-[#3068E0]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Profile &amp; Email Alerts</span>
        </button>
      </div>

      {/* TAB 1: MY LISTINGS */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          {myListings.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 space-y-3">
              <Package className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No items listed yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Declutter your hostel room or sell your textbooks to junior students in your college.
              </p>
              <button
                onClick={onOpenCreateListing}
                className="px-4 py-2 bg-[#3068E0] text-white rounded-lg text-xs font-semibold hover:bg-[#2355c4] transition-colors"
              >
                Create First Listing
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myListings.map((l) => (
                <div
                  key={l.id}
                  className="p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={l.images[0] || '/images/items/default_item.svg'}
                      alt=""
                      className="w-16 h-14 rounded-lg object-cover bg-slate-900 shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            l.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : l.status === 'Sold'
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {l.status}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {new Date(l.createdAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <h4
                        onClick={() => onSelectListing(l)}
                        className="text-sm font-semibold text-slate-900 hover:text-[#3068E0] cursor-pointer line-clamp-1"
                      >
                        {l.title}
                      </h4>
                      <div className="text-xs font-bold text-slate-800 tabular-nums">
                        ₹{l.price}{' '}
                        {l.originalPrice && (
                          <span className="text-slate-400 font-normal line-through ml-1">
                            ₹{l.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    {l.status === 'Active' ? (
                      <>
                        <button
                          onClick={() => handleUpdateListingStatus(l.id, 'Sold')}
                          className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-medium border border-emerald-200 transition-colors"
                        >
                          Mark Sold
                        </button>
                        <button
                          onClick={() => handleUpdateListingStatus(l.id, 'Unavailable')}
                          className="px-2.5 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-medium transition-colors"
                        >
                          Pause
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleUpdateListingStatus(l.id, 'Active')}
                        className="px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-medium border border-blue-200 transition-colors"
                      >
                        Reactivate
                      </button>
                    )}

                    <button
                      onClick={() => setDeleteConfirmId(l.id)}
                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete listing"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: WISHLIST (WITH PRICE DROP TRACKING) */}
      {activeTab === 'wishlist' && (
        <div className="space-y-4">
          {/* Wishlist Price Drop Alert Status Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#3068E0] text-white flex items-center justify-center shrink-0">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-900">Wishlist Price Drop Notifications</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                    notifyPriceDrops ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {notifyPriceDrops ? 'Opted-In (Active)' : 'Notifications Paused'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  {notifyPriceDrops
                    ? 'You will receive automatic email notifications the moment a seller reduces the price on any of your saved items.'
                    : 'Opt-in for price drop alerts in Settings to get notified when sellers discount your saved items.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('settings')}
              className="text-xs font-semibold text-[#3068E0] hover:underline shrink-0"
            >
              Manage Alert Settings &rarr;
            </button>
          </div>

          {wishlist.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 space-y-3">
              <Bookmark className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">Your wishlist is empty</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Save interesting textbooks or lab tools while browsing the marketplace to track their prices and view them here later.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {wishlist.map((w) => {
                const latestChange = w.listing.priceHistory && w.listing.priceHistory.length > 0
                  ? w.listing.priceHistory[w.listing.priceHistory.length - 1]
                  : null;
                const hasPriceDrop = latestChange && latestChange.price < latestChange.previousPrice;

                return (
                  <div
                    key={w.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 hover:shadow-xs transition-shadow flex flex-col justify-between"
                  >
                    <div
                      onClick={() => onSelectListing(w.listing)}
                      className="cursor-pointer space-y-2"
                    >
                      <div className="relative">
                        <img
                          src={w.listing.images[0] || '/images/items/default_item.svg'}
                          alt=""
                          className="w-full h-36 rounded-lg object-cover bg-slate-900"
                        />
                        {hasPriceDrop && (
                          <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                            <TrendingDown className="w-3 h-3" />
                            <span>Dropped by ₹{latestChange.previousPrice - latestChange.price}!</span>
                          </div>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-500">
                        {w.listing.sellerCollege.split(',')[0]} &middot; {w.listing.condition}
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900 line-clamp-1">
                        {w.listing.title}
                      </h4>
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-bold text-slate-900 tabular-nums">
                          ₹{w.listing.price}
                        </span>
                        {hasPriceDrop && (
                          <span className="text-xs text-slate-400 line-through">
                            ₹{latestChange.previousPrice}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => onSelectListing(w.listing)}
                        className="text-xs font-semibold text-[#3068E0] hover:underline flex items-center gap-1"
                      >
                        <span>View Listing</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleRemoveWishlist(w.listingId)}
                        className="text-xs text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: RECEIVED ENQUIRIES */}
      {activeTab === 'received' && (
        <div className="space-y-4">
          {receivedEnquiries.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 space-y-2">
              <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No enquiries received yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                When students are interested in your active listings, their queries will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {receivedEnquiries.map((enq) => (
                <div
                  key={enq.id}
                  className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div>
                      <span className="text-xs text-slate-500">Item:</span>{' '}
                      <span className="text-xs font-bold text-slate-900">{enq.listingTitle}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                          enq.status === 'New'
                            ? 'bg-amber-100 text-amber-800'
                            : enq.status === 'Replied'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {enq.status}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(enq.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs text-slate-500">
                      From: <span className="font-semibold text-slate-800">{enq.buyerName}</span> ({enq.buyerEmail})
                    </div>
                    <p className="text-xs text-slate-800 bg-slate-50 p-3 rounded-lg leading-relaxed">
                      "{enq.message}"
                    </p>
                  </div>

                  {/* Previous reply if exists */}
                  {enq.replyMessage && (
                    <div className="pl-4 border-l-2 border-[#3068E0] space-y-1">
                      <span className="text-[11px] text-slate-400">Your reply:</span>
                      <p className="text-xs text-slate-700 italic">"{enq.replyMessage}"</p>
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setReplyingEnquiry(enq);
                        setReplyText(enq.replyMessage || '');
                      }}
                      className="px-3 py-1.5 bg-[#3068E0] hover:bg-[#2355c4] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {enq.replyMessage ? 'Update Reply' : 'Reply to Buyer'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SENT ENQUIRIES */}
      {activeTab === 'sent' && (
        <div className="space-y-4">
          {sentEnquiries.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 space-y-2">
              <Send className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No sent enquiries</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                When you contact sellers about their items, you can track their responses here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sentEnquiries.map((enq) => (
                <div
                  key={enq.id}
                  className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div>
                      <span className="text-xs text-slate-500">Query to seller:</span>{' '}
                      <span className="text-xs font-bold text-slate-900">{enq.sellerName}</span>{' '}
                      <span className="text-xs text-slate-500">for "{enq.listingTitle}"</span>
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                        enq.status === 'Replied'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {enq.status === 'Replied' ? 'Seller Replied' : 'Awaiting Reply'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg leading-relaxed">
                    "{enq.message}"
                  </p>

                  {enq.replyMessage ? (
                    <div className="pl-4 border-l-2 border-emerald-500 bg-emerald-50/50 p-2.5 rounded-r-lg space-y-1">
                      <div className="text-[11px] font-bold text-emerald-900">
                        Seller Response from {enq.sellerName}:
                      </div>
                      <p className="text-xs text-slate-800 italic">"{enq.replyMessage}"</p>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Seller has not replied yet. They will receive an email notification reminder.</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: PROFILE & EMAIL NOTIFICATION SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-8">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Profile &amp; Email Notifications</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage your college information and customize what alerts are sent to your campus email
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-8">
            {/* Student Profile Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
                Academic Student Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3068E0]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    College or University *
                  </label>
                  <input
                    type="text"
                    required
                    value={editCollege}
                    onChange={(e) => setEditCollege(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3068E0]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department / Branch
                  </label>
                  <input
                    type="text"
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    placeholder="e.g. Computer Science and Engineering"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3068E0]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Year of Study
                  </label>
                  <select
                    value={editYear}
                    onChange={(e) => setEditYear(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3068E0] bg-white"
                  >
                    <option value="1st Year">1st Year (Fresher)</option>
                    <option value="2nd Year">2nd Year (Sophomore)</option>
                    <option value="3rd Year">3rd Year (Junior)</option>
                    <option value="4th Year">4th Year (Senior / Final)</option>
                    <option value="Postgraduate">Postgraduate / Research</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bio / Student Introduction
                </label>
                <textarea
                  rows={2}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Share a short note on what semester essentials you typically trade..."
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3068E0]"
                />
              </div>
            </div>

            {/* EMAIL NOTIFICATIONS SECTION */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#3068E0]" />
                    <h3 className="text-sm font-bold text-slate-900">Email Notifications &amp; Alerts</h3>
                  </div>
                  <p className="text-xs text-slate-500">
                    Dispatched to your registered email: <span className="font-mono font-medium text-slate-700">{currentUser.email}</span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSendTestNotification}
                  disabled={sendingTestAlert}
                  className="self-start sm:self-auto px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 shrink-0"
                >
                  <BellRing className="w-3.5 h-3.5 text-[#3068E0]" />
                  <span>{sendingTestAlert ? 'Sending...' : 'Send Test Alert'}</span>
                </button>
              </div>

              <div className="space-y-3 pt-1">
                {/* Toggle 1: New Buyer Enquiries */}
                <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 transition-colors flex items-start justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">New Buyer Enquiries</span>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        Essential
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Receive an instant email alert whenever a college peer sends an enquiry about your active listings, ensuring you never miss a potential buyer message or lose a deal.
                    </p>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={notifyNewEnquiries}
                    onClick={() => setNotifyNewEnquiries(!notifyNewEnquiries)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#3068E0] focus:ring-offset-2 ${
                      notifyNewEnquiries ? 'bg-[#3068E0]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        notifyNewEnquiries ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Toggle 2: Price Drop Notifications on Wishlist */}
                <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 transition-colors flex items-start justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">Wishlist Price Drop Alerts</span>
                      <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                        Smart Savings
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Opt-in to get an instant email alert whenever a seller reduces the price of an item saved in your campus wishlist, so you can grab the deal before other students.
                    </p>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={notifyPriceDrops}
                    onClick={() => setNotifyPriceDrops(!notifyPriceDrops)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#3068E0] focus:ring-offset-2 ${
                      notifyPriceDrops ? 'bg-[#3068E0]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        notifyPriceDrops ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Toggle 3: Enquiry Replies */}
                <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 transition-colors flex items-start justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900">Seller Responses &amp; Follow-ups</span>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Get notified when another student replies to an enquiry you sent about their textbooks, lab equipment, or electronics.
                    </p>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={notifyEnquiryReplies}
                    onClick={() => setNotifyEnquiryReplies(!notifyEnquiryReplies)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#3068E0] focus:ring-offset-2 ${
                      notifyEnquiryReplies ? 'bg-[#3068E0]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        notifyEnquiryReplies ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Toggle 4: Listing Status Updates */}
                <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 transition-colors flex items-start justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900">Listing Status &amp; Moderation Alerts</span>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Receive confirmations when your items are marked sold, restored, or reviewed by campus moderation administrators.
                    </p>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={notifyListingStatus}
                    onClick={() => setNotifyListingStatus(!notifyListingStatus)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#3068E0] focus:ring-offset-2 ${
                      notifyListingStatus ? 'bg-[#3068E0]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        notifyListingStatus ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Toggle 5: Campus Safety & Community Broadcasts */}
                <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 transition-colors flex items-start justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900">Campus Marketplace Bulletins</span>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Occasional announcements on end-of-semester textbook donation drives, circular economy metrics, and campus exchange safety reminders.
                    </p>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={notifyCampusAlerts}
                    onClick={() => setNotifyCampusAlerts(!notifyCampusAlerts)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#3068E0] focus:ring-offset-2 ${
                      notifyCampusAlerts ? 'bg-[#3068E0]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        notifyCampusAlerts ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Notification preferences take effect immediately upon saving.
              </span>
              <button
                type="submit"
                disabled={profileSaving}
                className="px-5 py-2.5 bg-[#12213A] hover:bg-[#1a3156] text-white rounded-lg text-xs font-semibold transition-colors shadow-sm disabled:opacity-50"
              >
                {profileSaving ? 'Saving Changes...' : 'Save Profile & Notifications'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Confirm Listing Deletion</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete this listing? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteListing(deleteConfirmId)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reply to Enquiry Modal */}
      {replyingEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">
              Reply to {replyingEnquiry.buyerName}
            </h3>
            <p className="text-xs text-slate-500">
              Regarding listing: "{replyingEnquiry.listingTitle}"
            </p>

            <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-700">
              "{replyingEnquiry.message}"
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Response Message *
              </label>
              <textarea
                rows={4}
                required
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Confirm your availability, library meeting spot, or price agreement..."
                className="w-full p-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3068E0]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setReplyingEnquiry(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSendReply}
                disabled={replyLoading || !replyText.trim()}
                className="px-4 py-2 bg-[#3068E0] hover:bg-[#2355c4] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {replyLoading ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
