import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Package,
  Flag,
  RotateCcw,
  Plus,
  RefreshCw,
  FolderTree,
} from 'lucide-react';
import { api } from '../api.js';

export const AdminView = ({
  currentUser,
  categories,
  onRefreshCategories,
  onShowToast,
  onSelectListing,
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [allListings, setAllListings] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Moderation modal / inputs
  const [moderatingListing, setModeratingListing] = useState(null);
  const [removalReason, setRemovalReason] = useState('Prohibited item or policy violation');

  // User suspension modal
  const [suspendingUser, setSuspendingUser] = useState(null);
  const [suspensionReason, setSuspensionReason] = useState('Repeated violation of campus marketplace safety policy');

  // Report resolution modal
  const [resolvingReport, setResolvingReport] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('Verified listing and taken appropriate compliance action');

  // Category creation modal
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [showCatModal, setShowCatModal] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [overviewRes, listRes, usersRes, repRes] = await Promise.all([
        api.getAdminOverview(),
        api.getListings({ limit: 100 }),
        api.getAdminUsers(),
        api.getAdminReports(),
      ]);

      setStats(overviewRes.stats);
      setActivities(overviewRes.recentActivities);
      setAllListings(listRes.listings);
      setAllUsers(usersRes.users);
      setReports(repRes.reports);
    } catch (err) {
      onShowToast(err.message || 'Failed to load administrator data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Moderate listing (remove/restore)
  const handleConfirmRemoval = async () => {
    if (!moderatingListing) return;
    try {
      await api.updateListingStatus(moderatingListing.id, 'Removed', removalReason);
      onShowToast(`Listing "${moderatingListing.title}" marked as Removed.`, 'success');
      setModeratingListing(null);
      fetchAdminData();
    } catch (err) {
      onShowToast(err.message || 'Action failed.', 'error');
    }
  };

  const handleRestoreListing = async (listing) => {
    try {
      await api.updateListingStatus(listing.id, 'Active');
      onShowToast(`Listing "${listing.title}" restored to Active.`, 'success');
      fetchAdminData();
    } catch (err) {
      onShowToast(err.message || 'Restore failed.', 'error');
    }
  };

  // User status update
  const handleConfirmSuspend = async () => {
    if (!suspendingUser) return;
    try {
      await api.updateUserStatus(suspendingUser.id, {
        status: 'suspended',
        reason: suspensionReason,
      });
      onShowToast(`User ${suspendingUser.displayName} suspended.`, 'info');
      setSuspendingUser(null);
      fetchAdminData();
    } catch (err) {
      onShowToast(err.message || 'Suspension failed.', 'error');
    }
  };

  const handleReactivateUser = async (user) => {
    try {
      await api.updateUserStatus(user.id, { status: 'active' });
      onShowToast(`User ${user.displayName} reactivated.`, 'success');
      fetchAdminData();
    } catch (err) {
      onShowToast(err.message || 'Failed to reactivate.', 'error');
    }
  };

  // Report resolution
  const handleResolveReport = async (status) => {
    if (!resolvingReport) return;
    try {
      await api.updateAdminReport(resolvingReport.id, {
        status,
        resolutionNote,
      });
      onShowToast(`Report marked as ${status}.`, 'success');
      setResolvingReport(null);
      fetchAdminData();
    } catch (err) {
      onShowToast(err.message || 'Failed to update report.', 'error');
    }
  };

  // Category creation
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName || !newCatDesc) return;
    try {
      await api.createCategory({
        name: newCatName,
        description: newCatDesc,
      });
      onShowToast(`Category "${newCatName}" created.`, 'success');
      setNewCatName('');
      setNewCatDesc('');
      setShowCatModal(false);
      onRefreshCategories();
    } catch (err) {
      onShowToast(err.message || 'Failed to create category.', 'error');
    }
  };

  // Reset to demo data
  const handleResetDemoData = async () => {
    if (!window.confirm('Reset database to pristine demo data (12 listings, sample users)?')) return;
    try {
      await api.resetDemoData();
      onShowToast('Database reset to clean demo seed state.', 'success');
      fetchAdminData();
      onRefreshCategories();
    } catch (err) {
      onShowToast(err.message || 'Reset failed.', 'error');
    }
  };

  if (currentUser.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-2xl border border-rose-200 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-600 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          The administrator moderation dashboard requires verified administrative authorization.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-400/10 px-2.5 py-0.5 rounded border border-amber-400/20">
              Campus Governance Desk
            </span>
            <span className="text-xs text-slate-400">&middot; Authorized Role</span>
          </div>
          <h1 className="text-2xl font-extrabold mt-1">Marketplace Administration</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Live compliance monitoring, user safety reports, listing removal, and category taxonomy management.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchAdminData}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Refresh statistics"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleResetDemoData}
            className="px-3.5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Seeds</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          <div className="p-4 rounded-xl bg-white border border-slate-200">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Registered Users</div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums mt-0.5">
              {stats.totalUsers}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Active Listings</div>
            <div className="text-2xl font-bold text-[#3068E0] tabular-nums mt-0.5">
              {stats.activeListings}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Sold Items</div>
            <div className="text-2xl font-bold text-[#20976F] tabular-nums mt-0.5">
              {stats.soldListings}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Pending Reports</div>
            <div className="text-2xl font-bold text-rose-600 tabular-nums mt-0.5">
              {stats.pendingReports}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Peer Enquiries</div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums mt-0.5">
              {stats.totalEnquiries}
            </div>
          </div>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="border-b border-slate-200 flex gap-4 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-1 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'overview'
              ? 'border-[#3068E0] text-[#3068E0]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ActivityItemIcon />
          Activity &amp; Overview
        </button>
        <button
          onClick={() => setActiveTab('listings')}
          className={`pb-3 px-1 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'listings'
              ? 'border-[#3068E0] text-[#3068E0]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          Listing Moderation ({allListings.length})
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 px-1 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'reports'
              ? 'border-[#3068E0] text-[#3068E0]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Flag className="w-4 h-4" />
          Reports Inbox ({reports.filter((r) => r.status === 'pending').length} pending)
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-1 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'users'
              ? 'border-[#3068E0] text-[#3068E0]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Student Accounts ({allUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`pb-3 px-1 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'categories'
              ? 'border-[#3068E0] text-[#3068E0]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          Categories ({categories.length})
        </button>
      </div>

      {/* TAB: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Recent Marketplace Activity Feed</h3>
            <div className="divide-y divide-slate-100">
              {activities.map((act) => (
                <div key={act.id} className="py-3 flex items-start justify-between gap-4 text-xs">
                  <div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded mr-2 ${
                        act.type === 'listing'
                          ? 'bg-blue-50 text-blue-700'
                          : act.type === 'report'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {act.type}
                    </span>
                    <span className="font-medium text-slate-800">{act.title}</span>
                  </div>
                  <span className="text-slate-400 text-[11px] shrink-0">
                    {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Campus Compliance Summary</h3>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <span>Total Items Active:</span>
                <span className="font-bold text-slate-900">{stats?.activeListings}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <span>Items Marked Removed:</span>
                <span className="font-bold text-rose-600">{stats?.removedListings}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <span>Pending Safety Audits:</span>
                <span className="font-bold text-amber-600">{stats?.pendingReports}</span>
              </div>
              <p className="text-[11px] text-slate-400 pt-2 border-t">
                CampusCart enforces zero tolerance for counterfeit textbooks, stolen hardware, and unauthorized material distribution.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB: LISTINGS MODERATION */}
      {activeTab === 'listings' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">All Marketplace Listings</h3>
            <span className="text-xs text-slate-500">{allListings.length} total</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Product</th>
                  <th className="p-3">Seller &amp; College</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Moderation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allListings.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/60">
                    <td className="p-3">
                      <div
                        onClick={() => onSelectListing(l)}
                        className="font-semibold text-slate-900 hover:text-[#3068E0] cursor-pointer line-clamp-1 max-w-xs"
                      >
                        {l.title}
                      </div>
                      <div className="text-[11px] text-slate-400">{l.condition}</div>
                    </td>
                    <td className="p-3 text-slate-600">
                      <div className="font-medium text-slate-800">{l.sellerName}</div>
                      <div className="text-[11px] text-slate-400">{l.college}</div>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-900 tabular-nums">
                      ₹{l.price}
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          l.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : l.status === 'Removed'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      {l.status === 'Removed' ? (
                        <button
                          onClick={() => handleRestoreListing(l)}
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[11px] font-semibold border border-emerald-200"
                        >
                          Restore
                        </button>
                      ) : (
                        <button
                          onClick={() => setModeratingListing(l)}
                          className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded text-[11px] font-semibold border border-rose-200"
                        >
                          Remove Listing
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: REPORTS */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs space-y-3">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Student Safety Reports Inbox</h3>
          </div>

          {reports.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">No safety reports recorded.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {reports.map((rep) => (
                <div key={rep.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          rep.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : rep.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {rep.status}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{rep.reason}</span>
                    </div>

                    <div className="text-xs text-slate-500">
                      Target: <span className="font-semibold text-slate-800">{rep.listingTitle || rep.reportedUserName || 'Entity'}</span>{' '}
                      &middot; Reported by: {rep.reporterName}
                    </div>

                    <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg">
                      "{rep.description}"
                    </p>

                    {rep.resolutionNote && (
                      <div className="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded">
                        Resolution note: {rep.resolutionNote}
                      </div>
                    )}
                  </div>

                  {rep.status === 'pending' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setResolvingReport(rep)}
                        className="px-3 py-1.5 bg-[#3068E0] hover:bg-[#2355c4] text-white rounded-lg text-xs font-semibold"
                      >
                        Take Action
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Registered Student Accounts</h3>
            <span className="text-xs text-slate-500">{allUsers.length} total</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">College &amp; Dept</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Account Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60">
                    <td className="p-3">
                      <div className="font-semibold text-slate-900">{u.displayName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                    </td>
                    <td className="p-3 text-slate-600">
                      <div>{u.college}</div>
                      <div className="text-[11px] text-slate-400">
                        {u.department} &middot; {u.yearOfStudy}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="capitalize font-semibold text-slate-800">{u.role}</span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          u.accountStatus === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {u.accountStatus}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {u.role !== 'admin' && (
                        u.accountStatus === 'active' ? (
                          <button
                            onClick={() => setSuspendingUser(u)}
                            className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded text-[11px] font-semibold border border-rose-200"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReactivateUser(u)}
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[11px] font-semibold border border-emerald-200"
                          >
                            Reactivate
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Academic Category Taxonomy</h3>
              <p className="text-xs text-slate-500">Configure marketplace catalog groupings</p>
            </div>
            <button
              onClick={() => setShowCatModal(true)}
              className="px-3 py-1.5 bg-[#3068E0] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Category
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {categories.map((c) => (
              <div key={c.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{c.name}</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                    Active
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{c.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Remove Listing Modal */}
      {moderatingListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Remove Listing</h3>
            <p className="text-xs text-slate-600">
              Removing: "{moderatingListing.title}"
            </p>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Administrative Reason
              </label>
              <input
                type="text"
                value={removalReason}
                onChange={(e) => setRemovalReason(e.target.value)}
                className="w-full p-2 text-xs border rounded-lg"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setModeratingListing(null)}
                className="px-3 py-1.5 text-xs text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRemoval}
                className="px-4 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold"
              >
                Confirm Removal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend User Modal */}
      {suspendingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Suspend Student Account</h3>
            <p className="text-xs text-slate-600">
              User: {suspendingUser.displayName} ({suspendingUser.email})
            </p>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Recorded Suspension Reason
              </label>
              <input
                type="text"
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                className="w-full p-2 text-xs border rounded-lg"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSuspendingUser(null)}
                className="px-3 py-1.5 text-xs text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSuspend}
                className="px-4 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold"
              >
                Suspend Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Report Modal */}
      {resolvingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Review Safety Report</h3>
            <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
              <div>
                <span className="font-semibold">Reason:</span> {resolvingReport.reason}
              </div>
              <div>
                <span className="font-semibold">Details:</span> {resolvingReport.description}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Moderator Resolution Note
              </label>
              <input
                type="text"
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                className="w-full p-2 text-xs border rounded-lg"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setResolvingReport(null)}
                className="px-3 py-1.5 text-xs text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={() => handleResolveReport('dismissed')}
                className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
              >
                Dismiss Report
              </button>
              <button
                onClick={() => handleResolveReport('resolved')}
                className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold"
              >
                Mark Resolved
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Category Modal */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <form
            onSubmit={handleCreateCategory}
            className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 border border-slate-200 shadow-2xl"
          >
            <h3 className="text-base font-bold text-slate-900">New Category</h3>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Name</label>
              <input
                type="text"
                required
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="e.g. Photography Equipment"
                className="w-full p-2 text-xs border rounded-lg"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Description</label>
              <textarea
                required
                rows={3}
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                placeholder="Cameras, lenses, tripods and memory cards..."
                className="w-full p-2 text-xs border rounded-lg"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCatModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#3068E0] text-white rounded-lg text-xs font-semibold"
              >
                Save Category
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

function ActivityItemIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}
