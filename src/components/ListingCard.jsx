import React from 'react';
import { Bookmark, MapPin, TrendingDown } from 'lucide-react';

export const ListingCard = ({
  listing,
  isWishlisted,
  onToggleWishlist,
  onSelect,
}) => {
  const isAvailable = listing.status === 'Active';
  const isSold = listing.status === 'Sold';

  // Format currency
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(listing.price);

  const formattedOriginalPrice = listing.originalPrice
    ? new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(listing.originalPrice)
    : null;

  // Check if price was recently dropped
  const latestPriceChange = listing.priceHistory && listing.priceHistory.length > 0
    ? listing.priceHistory[listing.priceHistory.length - 1]
    : null;
  const isPriceDropped = latestPriceChange && latestPriceChange.price < latestPriceChange.previousPrice;
  const dropAmount = isPriceDropped ? latestPriceChange.previousPrice - latestPriceChange.price : 0;

  // Format date
  const dateFormatted = new Date(listing.createdAt).toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div
      onClick={() => onSelect(listing)}
      className="group relative bg-white rounded-xl border border-slate-200/90 overflow-hidden cursor-pointer flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300"
    >
      {/* Product Image Slot */}
      <div className="relative aspect-[4/3] bg-slate-900 overflow-hidden">
        <img
          src={listing.images[0] || '/images/items/default_item.svg'}
          alt={listing.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
          onError={(e) => {
            e.target.src = '/images/items/default_item.svg';
          }}
        />

        {/* Status overlay if sold or unavailable */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[1px] flex items-center justify-center p-4">
            <span className="text-white text-xs font-semibold tracking-wider uppercase px-3 py-1 bg-slate-800/90 rounded border border-slate-700">
              {isSold ? 'Sold to Peer' : listing.status}
            </span>
          </div>
        )}

        {/* Wishlist toggle button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(listing.id);
          }}
          className={`absolute top-2.5 right-2.5 p-2 rounded-lg backdrop-blur-md transition-colors ${
            isWishlisted
              ? 'bg-rose-50 text-rose-600 shadow-sm'
              : 'bg-white/80 text-slate-700 hover:bg-white hover:text-slate-900'
          }`}
          aria-label={isWishlisted ? 'Remove from saved items' : 'Save to wishlist'}
        >
          <Bookmark className={`w-4 h-4 ${isWishlisted ? 'fill-rose-600' : ''}`} />
        </button>

        {/* Condition tag */}
        <div className="absolute bottom-2.5 left-2.5 text-[11px] font-medium bg-black/60 text-white backdrop-blur-md px-2 py-0.5 rounded">
          {listing.condition}
        </div>

        {/* Price Drop Indicator Tag */}
        {isPriceDropped && isAvailable && (
          <div className="absolute top-2.5 left-2.5 text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 backdrop-blur-xs">
            <TrendingDown className="w-3 h-3" />
            <span>Price Dropped (-₹{dropAmount})</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5 truncate">
            <span className="truncate">{listing.sellerCollege.split(',')[0]}</span>
            <span aria-hidden="true">&middot;</span>
            <span className="shrink-0">{dateFormatted}</span>
          </div>

          {/* Product Title */}
          <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug group-hover:text-[#3068E0] transition-colors">
            {listing.title}
          </h3>
        </div>

        {/* Price & Pickup Footer */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-end justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-slate-900 tabular-nums">
                {formattedPrice}
              </span>
              {formattedOriginalPrice && (
                <span className="text-xs text-slate-400 line-through tabular-nums">
                  {formattedOriginalPrice}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5 truncate max-w-[170px]">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{listing.pickupLocationDescription}</span>
            </div>
          </div>

          <span className="text-[11px] font-medium text-[#3068E0] shrink-0 hover:underline">
            Details &rarr;
          </span>
        </div>
      </div>
    </div>
  );
};
