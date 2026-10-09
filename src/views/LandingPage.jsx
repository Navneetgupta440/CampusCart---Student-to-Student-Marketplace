import React, { useState } from 'react';
import {
  Search,
  ArrowRight,
  Sparkles,
  Shield,
  RefreshCw,
  Wallet,
  BookOpen,
  Laptop,
  Calculator,
  Compass,
  Zap,
  CheckCircle,
} from 'lucide-react';
import { ListingCard } from '../components/ListingCard.jsx';

export const LandingPage = ({
  categories,
  recentListings,
  wishlistIds,
  onToggleWishlist,
  onSelectListing,
  onNavigate,
  onOpenCreateListing,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onNavigate('marketplace', { search: searchQuery });
  };

  const getCategoryIcon = (catId) => {
    switch (catId) {
      case 'cat-books':
        return <BookOpen className="w-5 h-5 text-blue-600" />;
      case 'cat-electronics':
        return <Laptop className="w-5 h-5 text-sky-600" />;
      case 'cat-calculators':
        return <Calculator className="w-5 h-5 text-indigo-600" />;
      case 'cat-stationery':
        return <Compass className="w-5 h-5 text-teal-600" />;
      default:
        return <Zap className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/50 to-transparent border-b border-slate-200/60 pt-12 pb-16 lg:pt-18 lg:pb-22">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Domain Kicker */}
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#3068E0] bg-blue-50/80 px-3.5 py-1.5 rounded-full border border-blue-200/50">
              <Sparkles className="w-3.5 h-3.5 text-[#3068E0]" />
              <span>Campus Connected Peer-to-Peer Marketplace</span>
            </div>

            {/* Hero Heading */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#12213A] leading-tight sm:leading-none">
              Your Campus. <br />
              <span className="text-[#3068E0]">Your Marketplace.</span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Buy, sell, exchange, and reuse student essentials with your college community. Save up to 70% on textbooks, calculators, lab kits, and hostel gear.
            </p>

            {/* Hero Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="max-w-xl mx-auto flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-slate-200/90 shadow-md hover:border-slate-300 focus-within:ring-2 focus-within:ring-[#3068E0] transition-all"
            >
              <div className="pl-3 text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search textbooks, Casio calculators, laptop stands..."
                className="flex-1 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#12213A] hover:bg-[#1a3156] text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shrink-0 shadow-sm"
              >
                Find Items
              </button>
            </form>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => onNavigate('marketplace')}
                className="px-6 py-3 bg-[#3068E0] hover:bg-[#2555b8] text-white rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow flex items-center gap-2"
              >
                <span>Explore Marketplace</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenCreateListing}
                className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 rounded-xl font-semibold text-sm transition-colors shadow-xs"
              >
                Start Selling Items
              </button>
            </div>

            {/* Social Proof & Trust Strip */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>Verified College Profiles</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-sky-600" />
                <span>Zero Listing Commission</span>
              </div>
              <div className="flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4 text-teal-600" />
                <span>Sustainable Student Reuse</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Student Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Browse by Academic Category
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Find coursework references, lab supplies, and hostel living essentials
            </p>
          </div>
          <button
            onClick={() => onNavigate('marketplace')}
            className="text-xs sm:text-sm font-semibold text-[#3068E0] hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {categories.slice(0, 10).map((cat) => (
            <button
              key={cat.id}
              onClick={() => onNavigate('marketplace', { category: cat.id })}
              className="p-4 rounded-xl bg-white border border-slate-200/90 hover:border-[#3068E0] hover:shadow-sm text-left transition-all duration-150 group flex flex-col justify-between h-32"
            >
              <div className="p-2 w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                {getCategoryIcon(cat.id)}
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-1 group-hover:text-[#3068E0]">
                  {cat.name}
                </h3>
                <span className="text-[11px] text-slate-400 mt-0.5 block truncate">
                  {cat.id === 'cat-books' ? 'Textbooks & Guides' : 'Student Supplies'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Recently Added Marketplace Items */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Recently Listed Student Essentials
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Active peer listings from campus batches ready for in-person handover
            </p>
          </div>
          <button
            onClick={() => onNavigate('marketplace')}
            className="text-xs sm:text-sm font-semibold text-[#3068E0] hover:underline flex items-center gap-1"
          >
            <span>Explore All {recentListings.length} Items</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentListings.slice(0, 8).map((item) => (
            <ListingCard
              key={item.id}
              listing={item}
              isWishlisted={wishlistIds.has(item.id)}
              onToggleWishlist={onToggleWishlist}
              onSelect={onSelectListing}
            />
          ))}
        </div>
      </section>

      {/* How CampusCart Works */}
      <section className="bg-white border-y border-slate-200/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              How CampusCart Works
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Simple 3-step peer workflow built specifically for safe college communities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#12213A] text-white flex items-center justify-center font-bold text-sm">
                01
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Snap &amp; List in 60 Seconds
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Take a quick photo of your previous semester's textbook, calculator, or hostel study lamp. Set an honest student price with AI drafting assistance.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#3068E0] text-white flex items-center justify-center font-bold text-sm">
                02
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Connect via Campus Inbox
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Interested peers submit an enquiry through the secure enquiry inbox. No public phone numbers or spam. Coordinate timing easily.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#20976F] text-white flex items-center justify-center font-bold text-sm">
                03
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Safe Campus Handover
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Meet at the campus library, cafeteria, or hostel reception. Inspect the item firsthand, complete the handover, and mark as sold!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sustainability & Benefits Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#12213A] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
          <div className="max-w-2xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-1.5 text-xs text-[#34C4CF] font-semibold bg-white/10 px-3 py-1 rounded-full backdrop-blur-md">
              <RefreshCw className="w-3.5 h-3.5" />
              Circular Campus Economy
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
              Reusing Essentials. Reducing Waste. Empowering Freshers.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Every semester, thousands of expensive textbooks and engineering tools gather dust after exams. CampusCart keeps high-value academic resources in active rotation across batches.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <CheckCircle className="w-4 h-4 text-[#20976F]" />
                  <span>Affordable for Juniors</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Quality textbooks at a fraction of bookstore retail rates.
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <CheckCircle className="w-4 h-4 text-[#20976F]" />
                  <span>Cash for Graduating Seniors</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  De-clutter hostel rooms and recover money on unused gear.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
