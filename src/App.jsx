import React, { useState, useEffect } from 'react';
import { api, setStoredToken, getStoredToken } from './api.js';
import { Navbar } from './components/Navbar.jsx';
import { Footer } from './components/Footer.jsx';
import { ToastContainer } from './components/Toast.jsx';
import { AuthModal } from './components/AuthModal.jsx';
import { CreateListingModal } from './components/CreateListingModal.jsx';
import { ProductDetailsModal } from './components/ProductDetailsModal.jsx';
import { EnquiryModal } from './components/EnquiryModal.jsx';
import { ReportModal } from './components/ReportModal.jsx';

import { LandingPage } from './views/LandingPage.jsx';
import { MarketplaceView } from './views/MarketplaceView.jsx';
import { DashboardView } from './views/DashboardView.jsx';
import { AdminView } from './views/AdminView.jsx';
import { HowItWorksView } from './views/HowItWorksView.jsx';
import { AboutView } from './views/AboutView.jsx';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [recentListings, setRecentListings] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());

  // Views & Routing
  const [activeView, setActiveView] = useState('landing');
  const [viewParams, setViewParams] = useState({});

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [createListingModalOpen, setCreateListingModalOpen] = useState(false);
  const [listingToEdit, setListingToEdit] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [enquiryModalListing, setEnquiryModalListing] = useState(null);
  const [reportModalListing, setReportModalListing] = useState(null);

  // Toasts
  const [toasts, setToasts] = useState([]);

  const showToast = (text, type = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial load
  useEffect(() => {
    const initialize = async () => {
      // 1. Fetch categories
      try {
        const catRes = await api.getCategories();
        setCategories(catRes.categories || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }

      // 2. Fetch recent listings for landing
      try {
        const listRes = await api.getListings({ limit: 8, sort: 'newest' });
        setRecentListings(listRes.listings || []);
      } catch (err) {
        console.error('Failed to load listings:', err);
      }

      // 3. Check existing user session
      const token = getStoredToken();
      if (token) {
        try {
          const userRes = await api.getMe();
          setCurrentUser(userRes.user);

          // Fetch wishlist
          const wishRes = await api.getWishlist();
          setWishlistIds(new Set((wishRes.wishlist || []).map((w) => w.listingId)));
        } catch {
          // Token invalid or expired
          setStoredToken(null);
        }
      }
    };

    initialize();
  }, []);

  // Refresh user wishlist
  const refreshWishlist = async () => {
    if (!currentUser) return;
    try {
      const wishRes = await api.getWishlist();
      setWishlistIds(new Set((wishRes.wishlist || []).map((w) => w.listingId)));
    } catch (err) {
      console.error('Wishlist refresh failed:', err);
    }
  };

  // Toggle wishlist item
  const handleToggleWishlist = async (listingId) => {
    if (!currentUser) {
      setAuthModalOpen(true);
      showToast('Please sign in to save items to your wishlist.', 'info');
      return;
    }

    try {
      if (wishlistIds.has(listingId)) {
        await api.removeFromWishlist(listingId);
        setWishlistIds((prev) => {
          const updated = new Set(prev);
          updated.delete(listingId);
          return updated;
        });
        showToast('Removed from saved wishlist.', 'info');
      } else {
        await api.addToWishlist(listingId);
        setWishlistIds((prev) => new Set([...prev, listingId]));
        showToast('Saved to your wishlist! You will receive price-drop alerts if the seller reduces the price.', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Could not update wishlist.', 'error');
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignore
    }
    setStoredToken(null);
    setCurrentUser(null);
    setWishlistIds(new Set());
    if (activeView === 'dashboard' || activeView === 'admin') {
      setActiveView('landing');
    }
    showToast('Signed out of CampusCart.', 'info');
  };

  // Navigation helper
  const handleNavigate = (view, extra = {}) => {
    setActiveView(view);
    setViewParams(extra);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open single product details
  const handleSelectListing = (listing) => {
    setSelectedListing(listing);
  };

  // Handle edit listing
  const handleEditListing = (listing) => {
    setSelectedListing(null);
    setListingToEdit(listing);
    setCreateListingModalOpen(true);
  };

  // Handle mark as sold
  const handleMarkAsSold = async (listing) => {
    try {
      await api.updateListingStatus(listing.id, 'Sold');
      showToast(`"${listing.title}" marked as Sold!`, 'success');
      setSelectedListing(null);

      // Refresh recent listings
      const listRes = await api.getListings({ limit: 8, sort: 'newest' });
      setRecentListings(listRes.listings || []);
    } catch (err) {
      showToast(err.message || 'Status update failed.', 'error');
    }
  };

  // Handle delete listing
  const handleDeleteListing = async (listingId) => {
    if (!window.confirm('Delete this listing permanently?')) return;
    try {
      await api.deleteListing(listingId);
      showToast('Listing removed from marketplace.', 'success');
      setSelectedListing(null);

      const listRes = await api.getListings({ limit: 8, sort: 'newest' });
      setRecentListings(listRes.listings || []);
    } catch (err) {
      showToast(err.message || 'Delete failed.', 'error');
    }
  };

  // Contact seller enquiry flow
  const handleOpenEnquiry = (listing) => {
    if (!currentUser) {
      setAuthModalOpen(true);
      showToast('Please sign in to contact the seller.', 'info');
      return;
    }
    if (listing.sellerId === currentUser.id) {
      showToast('You cannot send an enquiry about your own listing.', 'error');
      return;
    }
    setEnquiryModalListing(listing);
  };

  // Report listing flow
  const handleOpenReport = (listing) => {
    if (!currentUser) {
      setAuthModalOpen(true);
      showToast('Please sign in to submit a safety report.', 'info');
      return;
    }
    setReportModalListing(listing);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FC] text-[#243044]">
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        activeView={activeView}
        onNavigate={handleNavigate}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenCreateListing={() => {
          if (!currentUser) {
            setAuthModalOpen(true);
            showToast('Sign in to list items for sale on campus.', 'info');
          } else {
            setListingToEdit(null);
            setCreateListingModalOpen(true);
          }
        }}
        onLogout={handleLogout}
        wishlistCount={wishlistIds.size}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {activeView === 'landing' && (
          <LandingPage
            categories={categories}
            recentListings={recentListings}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            onSelectListing={handleSelectListing}
            onNavigate={handleNavigate}
            onOpenCreateListing={() => {
              if (!currentUser) {
                setAuthModalOpen(true);
              } else {
                setListingToEdit(null);
                setCreateListingModalOpen(true);
              }
            }}
          />
        )}

        {activeView === 'marketplace' && (
          <MarketplaceView
            categories={categories}
            initialSearch={viewParams.search || ''}
            initialCategory={viewParams.category || 'all'}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            onSelectListing={handleSelectListing}
          />
        )}

        {activeView === 'dashboard' && currentUser && (
          <DashboardView
            currentUser={currentUser}
            initialTab={viewParams.tab || 'listings'}
            onOpenCreateListing={() => {
              setListingToEdit(null);
              setCreateListingModalOpen(true);
            }}
            onSelectListing={handleSelectListing}
            onEditListing={handleEditListing}
            onUpdateCurrentUser={setCurrentUser}
            onShowToast={showToast}
          />
        )}

        {activeView === 'admin' && currentUser && (
          <AdminView
            currentUser={currentUser}
            categories={categories}
            onRefreshCategories={async () => {
              const res = await api.getCategories();
              setCategories(res.categories || []);
            }}
            onShowToast={showToast}
            onSelectListing={handleSelectListing}
          />
        )}

        {activeView === 'how-it-works' && (
          <HowItWorksView
            onNavigate={handleNavigate}
            onOpenCreateListing={() => {
              if (!currentUser) {
                setAuthModalOpen(true);
              } else {
                setListingToEdit(null);
                setCreateListingModalOpen(true);
              }
            }}
          />
        )}

        {activeView === 'about' && <AboutView />}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* MODALS */}

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          showToast(`Welcome back, ${user.displayName}!`, 'success');
          refreshWishlist();
        }}
      />

      {/* Create / Edit Listing Modal */}
      <CreateListingModal
        isOpen={createListingModalOpen}
        onClose={() => {
          setCreateListingModalOpen(false);
          setListingToEdit(null);
        }}
        categories={categories}
        userCollege={currentUser?.college || ''}
        listingToEdit={listingToEdit}
        onListingCreated={(newOrUpdated, message) => {
          showToast(
            message ||
              (listingToEdit
                ? 'Listing details updated successfully!'
                : 'Your item is live on the CampusCart marketplace!'),
            'success'
          );
          // Refresh recent listings
          api.getListings({ limit: 8, sort: 'newest' }).then((res) => {
            setRecentListings(res.listings || []);
          });
        }}
      />

      {/* Product Details Modal (PDP) */}
      {selectedListing && (
        <ProductDetailsModal
          listing={selectedListing}
          currentUser={currentUser}
          isWishlisted={wishlistIds.has(selectedListing.id)}
          onToggleWishlist={handleToggleWishlist}
          onOpenEnquiry={handleOpenEnquiry}
          onOpenReport={handleOpenReport}
          onEditListing={handleEditListing}
          onMarkAsSold={handleMarkAsSold}
          onDeleteListing={handleDeleteListing}
          onSelectSimilar={(sim) => setSelectedListing(sim)}
          similarListings={recentListings.filter(
            (l) => l.categoryId === selectedListing.categoryId && l.id !== selectedListing.id
          )}
          onClose={() => setSelectedListing(null)}
        />
      )}

      {/* Enquiry Modal */}
      <EnquiryModal
        isOpen={Boolean(enquiryModalListing)}
        listing={enquiryModalListing}
        onClose={() => setEnquiryModalListing(null)}
        onSuccess={(msg) => {
          showToast(msg, 'success');
        }}
      />

      {/* Safety Report Modal */}
      <ReportModal
        isOpen={Boolean(reportModalListing)}
        listing={reportModalListing}
        onClose={() => setReportModalListing(null)}
        onSuccess={(msg) => {
          showToast(msg, 'info');
        }}
      />
    </div>
  );
}
