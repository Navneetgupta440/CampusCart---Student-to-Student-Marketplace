import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Grid,
  List,
  RotateCcw,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  X,
  MapPin,
  Bookmark,
} from 'lucide-react';
import { api } from '../api.js';
import { ListingCard } from '../components/ListingCard.jsx';

export const MarketplaceView = ({
  categories,
  initialSearch = '',
  initialCategory = 'all',
  wishlistIds,
  onToggleWishlist,
  onSelectListing,
}) => {
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [selectedCollege, setSelectedCollege] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');

  // Listings data
  const [listings, setListings] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const collegesList = [
    'National Institute of Technology, Trichy',
    'Indian Institute of Technology, Delhi',
    'BITS Pilani',
  ];

  // Fetch listings whenever filters or page changes
  const fetchMarketplaceListings = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        sort: sortBy,
      };

      if (search.trim()) params.search = search.trim();
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (selectedCondition !== 'all') params.condition = selectedCondition;
      if (selectedCollege !== 'all') params.college = selectedCollege;
      if (selectedType !== 'all') params.listingType = selectedType;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const res = await api.getListings(params);
      setListings(res.listings);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error('Failed to load listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketplaceListings();
  }, [
    page,
    sortBy,
    selectedCategory,
    selectedCondition,
    selectedCollege,
    selectedType,
  ]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchMarketplaceListings();
  };

  const resetAllFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedCondition('all');
    setSelectedCollege('all');
    setSelectedType('all');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    setPage(1);
  };

  const hasActiveFilters =
    search !== '' ||
    selectedCategory !== 'all' ||
    selectedCondition !== 'all' ||
    selectedCollege !== 'all' ||
    selectedType !== 'all' ||
    minPrice !== '' ||
    maxPrice !== '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Campus Marketplace</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Showing {total} available student listings
          </p>
        </div>

        {/* Search input with Clear button */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, edition, or campus..."
            className="w-full pl-9 pr-9 py-2 text-sm bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3068E0] shadow-2xs"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setPage(1);
              }}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>

      {/* Main Grid: Sidebar Filters (desktop) + Product Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block space-y-6 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-[#3068E0]" />
              Filter Catalog
            </div>
            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="text-[11px] font-semibold text-[#3068E0] hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 block">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#3068E0]"
            >
              <option value="all">All Academic Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Condition Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 block">Condition</label>
            <select
              value={selectedCondition}
              onChange={(e) => {
                setSelectedCondition(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#3068E0]"
            >
              <option value="all">Any Condition</option>
              <option value="New">Brand New</option>
              <option value="Like New">Like New (Mint)</option>
              <option value="Good">Good Condition</option>
              <option value="Fair">Fair / Highlighted</option>
            </select>
          </div>

          {/* Listing Type Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 block">Transaction Type</label>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#3068E0]"
            >
              <option value="all">All Types</option>
              <option value="Sale">Direct Sale (₹)</option>
              <option value="Exchange">Book Exchange</option>
              <option value="Donation">Student Donation (Free)</option>
            </select>
          </div>

          {/* Campus Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 block">Campus / College</label>
            <select
              value={selectedCollege}
              onChange={(e) => {
                setSelectedCollege(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#3068E0]"
            >
              <option value="all">All Participating Colleges</option>
              {collegesList.map((col, idx) => (
                <option key={idx} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 block">Price Range (₹)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                min={0}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-1/2 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3068E0] font-mono"
              />
              <span className="text-slate-400 text-xs">-</span>
              <input
                type="number"
                placeholder="Max"
                min={0}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-1/2 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3068E0] font-mono"
              />
            </div>
            <button
              onClick={() => {
                setPage(1);
                fetchMarketplaceListings();
              }}
              className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium transition-colors mt-1"
            >
              Apply Price Filter
            </button>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="lg:col-span-3 space-y-5">
          {/* Controls Bar: Sort & View Mode */}
          <div className="flex items-center justify-between gap-4 p-3 bg-white rounded-xl border border-slate-200 text-xs">
            {/* Mobile Filter Trigger */}
            <button
              onClick={() => setFilterDrawerOpen(true)}
              className="lg:hidden px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 flex items-center gap-1.5 font-medium"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters {hasActiveFilters && '(Active)'}</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 ml-auto sm:ml-0">
              <span className="text-slate-500 hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest Listed</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            {/* View Mode Toggle: Grid / List */}
            <div className="hidden sm:flex items-center gap-1 border-l border-slate-200 pl-3">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-slate-100 text-[#3068E0]'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                aria-label="Grid view"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-slate-100 text-[#3068E0]'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Listings Display */}
          {loading ? (
            <div className="py-20 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
              <div className="w-8 h-8 border-3 border-[#3068E0] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500">Searching campus listings...</p>
            </div>
          ) : listings.length === 0 ? (
            <div className="py-20 text-center space-y-3 bg-white rounded-2xl border border-slate-200 p-6">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No student listings matched</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                We couldn't find any items matching your selected criteria. Try adjusting keywords or clearing category filters.
              </p>
              <button
                onClick={resetAllFilters}
                className="px-4 py-2 bg-[#3068E0] text-white rounded-lg text-xs font-semibold hover:bg-[#2555b8] transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {listings.map((item) => (
                <ListingCard
                  key={item.id}
                  listing={item}
                  isWishlisted={wishlistIds.has(item.id)}
                  onToggleWishlist={onToggleWishlist}
                  onSelect={onSelectListing}
                />
              ))}
            </div>
          ) : (
            /* List View */
            <div className="space-y-3">
              {listings.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectListing(item)}
                  className="p-4 bg-white rounded-xl border border-slate-200 hover:border-[#3068E0] hover:shadow-2xs cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={item.images[0] || '/images/items/default_item.svg'}
                      alt=""
                      className="w-20 h-16 rounded-lg object-cover bg-slate-900 shrink-0"
                      onError={(e) => {
                        e.target.src = '/images/items/default_item.svg';
                      }}
                    />
                    <div>
                      <div className="text-xs text-slate-500 flex items-center gap-1.5 mb-1">
                        <span>{item.condition}</span>
                        <span aria-hidden="true">&middot;</span>
                        <span>{item.sellerCollege.split(',')[0]}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900 line-clamp-1">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{item.pickupLocationDescription}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    <div className="text-base font-bold text-slate-900 tabular-nums">
                      ₹{item.price}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWishlist(item.id);
                        }}
                        className={`p-1.5 rounded-lg border text-xs ${
                          wishlistIds.has(item.id)
                            ? 'bg-rose-50 text-rose-600 border-rose-200'
                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                        }`}
                        aria-label="Wishlist toggle"
                      >
                        <Bookmark
                          className={`w-3.5 h-3.5 ${
                            wishlistIds.has(item.id) ? 'fill-rose-600' : ''
                          }`}
                        />
                      </button>
                      <span className="text-xs text-[#3068E0] font-medium hover:underline">
                        Details &rarr;
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
              <div className="text-xs text-slate-500">
                Page {page} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Drawer */}
      {filterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm lg:hidden">
          <div className="w-full max-w-xs bg-white h-full p-6 space-y-6 overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="font-bold text-slate-900 text-base">Filter Catalog</h3>
              <button
                onClick={() => setFilterDrawerOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Category */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 text-xs border rounded-lg bg-white"
              >
                <option value="all">All Academic Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Mobile Condition */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Condition</label>
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="w-full p-2 text-xs border rounded-lg bg-white"
              >
                <option value="all">Any Condition</option>
                <option value="New">Brand New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>

            {/* Mobile College */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">College</label>
              <select
                value={selectedCollege}
                onChange={(e) => setSelectedCollege(e.target.value)}
                className="w-full p-2 text-xs border rounded-lg bg-white"
              >
                <option value="all">All Colleges</option>
                {collegesList.map((col, idx) => (
                  <option key={idx} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-4 border-t space-y-2">
              <button
                onClick={() => {
                  setFilterDrawerOpen(false);
                  setPage(1);
                  fetchMarketplaceListings();
                }}
                className="w-full py-2.5 bg-[#3068E0] text-white rounded-lg text-xs font-semibold"
              >
                Apply Filters
              </button>
              <button
                onClick={() => {
                  resetAllFilters();
                  setFilterDrawerOpen(false);
                }}
                className="w-full py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
