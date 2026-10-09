import React, { useState } from 'react';
import {
  ShoppingBag,
  PlusCircle,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  Bookmark,
  MessageSquare,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';

export const Navbar = ({
  currentUser,
  activeView,
  onNavigate,
  onOpenAuth,
  onOpenCreateListing,
  onLogout,
  wishlistCount,
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand title, one line */}
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2.5 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg p-1 -ml-1 shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-[#12213A] flex items-center justify-center text-[#34C4CF] shadow-sm group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#12213A] whitespace-nowrap">
            CampusCart
          </span>
        </button>

        {/* Zone 2: 4-5 nav links, 1-2 word labels, single-line */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <button
            onClick={() => onNavigate('marketplace')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 relative ${
              activeView === 'marketplace'
                ? 'text-[#3068E0] font-semibold'
                : 'hover:text-[#12213A]'
            }`}
          >
            Marketplace
            {activeView === 'marketplace' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3068E0] rounded-full" />
            )}
          </button>

          <button
            onClick={() => {
              if (currentUser) {
                onOpenCreateListing();
              } else {
                onOpenAuth();
              }
            }}
            className="whitespace-nowrap shrink-0 hover:text-[#12213A] transition-colors py-1 flex items-center gap-1.5 text-slate-700"
          >
            <PlusCircle className="w-4 h-4 text-[#3068E0]" />
            Sell Item
          </button>

          <button
            onClick={() => onNavigate('how-it-works')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeView === 'how-it-works'
                ? 'text-[#3068E0] font-semibold'
                : 'hover:text-[#12213A]'
            }`}
          >
            How It Works
          </button>

          <button
            onClick={() => onNavigate('about')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeView === 'about'
                ? 'text-[#3068E0] font-semibold'
                : 'hover:text-[#12213A]'
            }`}
          >
            About &amp; Safety
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3068E0]"
              >
                <div className="w-7 h-7 rounded-full bg-[#3068E0] text-white flex items-center justify-center text-xs font-bold uppercase">
                  {currentUser.displayName.charAt(0)}
                </div>
                <div className="hidden sm:block text-left text-xs">
                  <div className="font-semibold text-slate-900 truncate max-w-[130px]">
                    {currentUser.displayName}
                  </div>
                  <div className="text-slate-500 text-[10px] uppercase tracking-wider">
                    {currentUser.role === 'admin' ? 'Campus Admin' : 'Student'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-20 text-sm">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="font-semibold text-slate-900 truncate">
                        {currentUser.displayName}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">{currentUser.college}</p>
                    </div>

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onNavigate('dashboard', { tab: 'listings' });
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 hover:text-slate-900"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      Student Dashboard
                    </button>

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onNavigate('dashboard', { tab: 'wishlist' });
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center justify-between text-slate-700 hover:text-slate-900"
                    >
                      <span className="flex items-center gap-2.5">
                        <Bookmark className="w-4 h-4 text-slate-400" />
                        Saved Wishlist
                      </span>
                      {wishlistCount > 0 && (
                        <span className="text-xs bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                          {wishlistCount}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onNavigate('dashboard', { tab: 'enquiries' });
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 hover:text-slate-900"
                    >
                      <MessageSquare className="w-4 h-4 text-slate-400" />
                      Enquiry Inbox
                    </button>

                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onNavigate('admin');
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-amber-50 flex items-center gap-2.5 text-amber-900 font-medium"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-600" />
                        Admin Moderation
                      </button>
                    )}

                    <div className="my-1 border-t border-slate-100" />

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-rose-50 flex items-center gap-2.5 text-rose-600"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#12213A] hover:bg-[#1a3156] rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3068E0]"
            >
              Sign In
            </button>
          )}

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2">
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigate('marketplace');
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-slate-800 font-medium hover:bg-slate-50"
          >
            Marketplace
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              if (currentUser) {
                onOpenCreateListing();
              } else {
                onOpenAuth();
              }
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-slate-800 font-medium hover:bg-slate-50 flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4 text-[#3068E0]" />
            Sell Item
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigate('how-it-works');
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-slate-800 font-medium hover:bg-slate-50"
          >
            How It Works
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigate('about');
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-slate-800 font-medium hover:bg-slate-50"
          >
            About &amp; Safety
          </button>
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('admin');
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-amber-900 font-medium hover:bg-amber-50 flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              Admin Moderation
            </button>
          )}
        </div>
      )}
    </header>
  );
};
