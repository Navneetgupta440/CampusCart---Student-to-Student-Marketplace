import React, { useState } from 'react';
import {
  X,
  MapPin,
  Calendar,
  MessageCircle,
  Bookmark,
  Flag,
  ShieldCheck,
  Edit3,
  Trash2,
  CheckCircle,
  TrendingDown,
  History,
} from 'lucide-react';

export const ProductDetailsModal = ({
  listing,
  currentUser,
  isWishlisted,
  onToggleWishlist,
  onOpenEnquiry,
  onOpenReport,
  onEditListing,
  onMarkAsSold,
  onDeleteListing,
  onSelectSimilar,
  similarListings = [],
  onClose,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!listing) return null;

  const isOwner = currentUser && currentUser.id === listing.sellerId;
  const isAvailable = listing.status === 'Active';
  const isSold = listing.status === 'Sold';

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

  const discountPercent =
    listing.originalPrice && listing.originalPrice > listing.price
      ? Math.round(((listing.originalPrice - listing.price) / listing.originalPrice) * 100)
      : null;

  const dateFormatted = new Date(listing.createdAt).toLocaleDateString('en-IN', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col my-8 max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
            <span className="font-semibold text-slate-800">{listing.college}</span>
            <span aria-hidden="true">&middot;</span>
            <span className="text-slate-600">{listing.condition} Condition</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-8 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Left: Product Images & Location */}
            <div className="space-y-3">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-inner">
                <img
                  src={listing.images[selectedImageIndex] || listing.images[0] || '/images/items/default_item.svg'}
                  alt={listing.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/images/items/default_item.svg';
                  }}
                />

                {!isAvailable && (
                  <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] flex items-center justify-center p-4">
                    <span className="text-white text-sm font-semibold tracking-wider uppercase px-4 py-1.5 bg-slate-900 rounded border border-slate-700">
                      {isSold ? 'Sold to Fellow Student' : listing.status}
                    </span>
                  </div>
                )}

                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs font-medium px-2.5 py-1 rounded">
                  {listing.condition} Condition
                </div>
              </div>

              {/* Thumbnails strip */}
              {listing.images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {listing.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-16 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                        selectedImageIndex === idx
                          ? 'border-[#3068E0] shadow-sm'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Pickup & Campus Safety Box */}
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/80 space-y-2">
                <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#3068E0]" />
                  Designated Campus Handover Point
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-5">
                  {listing.pickupLocationDescription}
                </p>
                <div className="text-[11px] text-slate-500 pl-5 pt-1 border-t border-slate-200/60 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Campus safety advice: Always meet at well-lit, public college locations.</span>
                </div>
              </div>
            </div>

            {/* Right: Product Details & Actions */}
            <div className="space-y-5">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                  <span className="font-medium text-slate-700">{listing.listingType}</span>
                  <span aria-hidden="true">&middot;</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {dateFormatted}
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                  {listing.title}
                </h1>
              </div>

              {/* Price Banner */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-baseline justify-between">
                <div>
                  <div className="text-[11px] text-slate-500 font-medium">Selling Price</div>
                  <div className="flex items-baseline gap-2.5 mt-0.5">
                    <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
                      {formattedPrice}
                    </span>
                    {formattedOriginalPrice && (
                      <span className="text-sm text-slate-400 line-through tabular-nums">
                        {formattedOriginalPrice}
                      </span>
                    )}
                  </div>
                </div>

                {discountPercent && (
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded tabular-nums">
                      {discountPercent}% OFF MRP
                    </span>
                    <div className="text-[10px] text-slate-500 mt-1">Student Resale Value</div>
                  </div>
                )}
              </div>

              {/* Price History & Tracking Module */}
              {listing.priceHistory && listing.priceHistory.length > 0 && (
                <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/40 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                    <TrendingDown className="w-4 h-4 text-emerald-600" />
                    <span>Price Change &amp; Drop History</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    {listing.priceHistory.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-slate-700 bg-white/80 p-2 rounded border border-emerald-100/60">
                        <div className="space-y-0.5">
                          <div className="font-medium text-slate-900">
                            ₹{item.previousPrice} &rarr; ₹{item.price}
                            {item.price < item.previousPrice && (
                              <span className="ml-1.5 text-[11px] font-bold text-emerald-700">
                                (-₹{item.previousPrice - item.price})
                              </span>
                            )}
                          </div>
                          {item.note && <div className="text-[11px] text-slate-500">{item.note}</div>}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(item.changedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-1">
                {isOwner ? (
                  <div className="space-y-2">
                    <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs">
                      You are the seller of this listing. Manage its status below.
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onEditListing(listing)}
                        className="py-2.5 px-4 bg-white border border-slate-200 hover:border-slate-300 text-slate-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                      >
                        <Edit3 className="w-4 h-4 text-slate-500" />
                        Edit Listing
                      </button>
                      {isAvailable && (
                        <button
                          onClick={() => onMarkAsSold(listing)}
                          className="py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Mark as Sold
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => onDeleteListing(listing.id)}
                      className="w-full py-2 px-4 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Listing
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => onOpenEnquiry(listing)}
                      disabled={!isAvailable}
                      className="w-full py-3 px-4 bg-[#12213A] hover:bg-[#1b3155] text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MessageCircle className="w-4 h-4 text-[#34C4CF]" />
                      {isAvailable ? 'Contact Seller / Send Enquiry' : 'Item No Longer Available'}
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onToggleWishlist(listing.id)}
                        className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                          isWishlisted
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-rose-600' : ''}`} />
                        {isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
                      </button>

                      <button
                        onClick={() => onOpenReport(listing)}
                        className="py-2 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Flag className="w-3.5 h-3.5 text-slate-400" />
                        Report Listing
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Seller Information */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Seller Information
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#12213A] text-white flex items-center justify-center font-bold text-sm">
                    {listing.sellerName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-900 text-sm truncate">
                        {listing.sellerName}
                      </span>
                      <span className="text-[11px] text-emerald-600 flex items-center gap-0.5 shrink-0" title="Verified Campus Student">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Verified
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{listing.sellerCollege}</p>
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 pt-1">
                  Private contact info protected. Enquiries are routed through the secure CampusCart inbox.
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5 pt-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Item Description
                </div>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {listing.description}
                </p>
              </div>
            </div>
          </div>

          {/* Similar Products in Same Category */}
          {similarListings.length > 0 && (
            <div className="pt-8 border-t border-slate-100 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Similar Campus Listings
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {similarListings.map((sim) => (
                  <div
                    key={sim.id}
                    onClick={() => onSelectSimilar && onSelectSimilar(sim)}
                    className="p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer group bg-slate-50/50"
                  >
                    <img
                      src={sim.images[0] || '/images/items/default_item.svg'}
                      alt=""
                      className="w-full aspect-[4/3] rounded-lg object-cover mb-2 bg-slate-900"
                    />
                    <div className="text-xs font-semibold text-slate-900 truncate group-hover:text-[#3068E0]">
                      {sim.title}
                    </div>
                    <div className="text-xs font-bold text-slate-800 mt-1">₹{sim.price}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
