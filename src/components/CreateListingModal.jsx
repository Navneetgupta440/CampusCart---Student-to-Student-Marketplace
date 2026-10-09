import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Upload,
  Trash2,
  Check,
} from 'lucide-react';
import { api } from '../api.js';

const PRESET_IMAGE_OPTIONS = [
  { label: 'Data Structures Book', url: '/images/items/data_structures.svg' },
  { label: 'Engineering Maths', url: '/images/items/engg_maths.svg' },
  { label: 'Scientific Calculator', url: '/images/items/calculator_casio.svg' },
  { label: 'Laptop Stand', url: '/images/items/laptop_stand.svg' },
  { label: 'Computer Networks', url: '/images/items/computer_networks.svg' },
  { label: 'Mini Drafter Kit', url: '/images/items/drafting_kit.svg' },
  { label: 'Study Lamp', url: '/images/items/study_lamp.svg' },
  { label: 'C Programming', url: '/images/items/c_programming.svg' },
  { label: 'Badminton Racket', url: '/images/items/badminton_racket.svg' },
  { label: 'Campus Backpack', url: '/images/items/backpack.svg' },
  { label: 'Keyboard & Mouse', url: '/images/items/keyboard_mouse.svg' },
  { label: 'White Lab Coat', url: '/images/items/lab_coat.svg' },
];

export const CreateListingModal = ({
  isOpen,
  onClose,
  categories,
  userCollege,
  onListingCreated,
  listingToEdit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [condition, setCondition] = useState('Good');
  const [listingType, setListingType] = useState('Sale');
  const [college, setCollege] = useState(userCollege || '');
  const [pickupLocation, setPickupLocation] = useState('');
  const [images, setImages] = useState([]);

  // AI assistant states
  const [aiGeneratingDesc, setAiGeneratingDesc] = useState(false);
  const [aiGeneratedBanner, setAiGeneratedBanner] = useState(null);
  const [aiSuggestingCategory, setAiSuggestingCategory] = useState(false);
  const [aiAuditing, setAiAuditing] = useState(false);
  const [qualityAudit, setQualityAudit] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (listingToEdit) {
      setTitle(listingToEdit.title);
      setDescription(listingToEdit.description);
      setCategoryId(listingToEdit.categoryId);
      setPrice(String(listingToEdit.price));
      setOriginalPrice(listingToEdit.originalPrice ? String(listingToEdit.originalPrice) : '');
      setCondition(listingToEdit.condition);
      setListingType(listingToEdit.listingType);
      setCollege(listingToEdit.college);
      setPickupLocation(listingToEdit.pickupLocationDescription);
      setImages(listingToEdit.images);
    } else {
      setTitle('');
      setDescription('');
      setCategoryId(categories[0]?.id || '');
      setPrice('');
      setOriginalPrice('');
      setCondition('Good');
      setListingType('Sale');
      setCollege(userCollege || '');
      setPickupLocation('');
      setImages(['/images/items/data_structures.svg']);
      setQualityAudit(null);
      setAiGeneratedBanner(null);
    }
  }, [listingToEdit, userCollege, categories, isOpen]);

  if (!isOpen) return null;

  // Handle local file image upload
  const handleFileUpload = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 4 * 1024 * 1024) {
      setError('Image file must be under 4MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      if (images.length < 5) {
        setImages([...images, base64]);
      } else {
        setError('Maximum 5 product photos allowed.');
      }
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (index) => {
    const updated = images.filter((_, idx) => idx !== index);
    setImages(updated.length > 0 ? updated : ['/images/items/default_item.svg']);
  };

  // AI Description Generator
  const handleGenerateAiDescription = async () => {
    if (!title || title.trim().length < 4) {
      setError('Please enter a clear product title before generating a description.');
      return;
    }
    setError(null);
    setAiGeneratingDesc(true);
    try {
      const res = await api.generateAiDescription({
        title,
        categoryId,
        condition,
        keyPoints: description ? `Draft context: ${description}` : undefined,
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
      });

      setDescription(res.description);
      setAiGeneratedBanner(
        res.isAiGenerated
          ? 'Drafted with Gemini AI. You may review and edit this description before publishing.'
          : 'Drafted using academic listing assistant template. You can customize anytime.'
      );
    } catch (err) {
      setError(err.message || 'AI assistant request could not be completed.');
    } finally {
      setAiGeneratingDesc(false);
    }
  };

  // AI Category Suggestion
  const handleSuggestCategory = async () => {
    if (!title) {
      setError('Enter a title first to detect category.');
      return;
    }
    setError(null);
    setAiSuggestingCategory(true);
    try {
      const res = await api.suggestAiCategory({ title, description });
      if (res.categoryId) {
        setCategoryId(res.categoryId);
      }
    } catch (err) {
      setError(err.message || 'Could not determine category.');
    } finally {
      setAiSuggestingCategory(false);
    }
  };

  // AI Quality Auditor
  const handleAuditQuality = async () => {
    setError(null);
    setAiAuditing(true);
    try {
      const res = await api.checkAiQuality({
        title,
        description,
        price: Number(price) || 0,
        condition,
        pickupLocation,
      });
      setQualityAudit({
        score: res.qualityScore,
        suggestions: res.suggestions,
        isReady: res.isReady,
      });
    } catch (err) {
      setError(err.message || 'Quality check could not run.');
    } finally {
      setAiAuditing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      setError('Please provide a valid price (₹0 or higher).');
      return;
    }

    if (!pickupLocation.trim()) {
      setError('Please specify a safe campus pickup location (e.g. library, hostel gate).');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        categoryId,
        price: numPrice,
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        condition,
        listingType,
        college: college.trim(),
        pickupLocationDescription: pickupLocation.trim(),
        images: images.length > 0 ? images : ['/images/items/default_item.svg'],
      };

      if (listingToEdit) {
        const res = await api.updateListing(listingToEdit.id, payload);
        onListingCreated(res.listing, res.message);
      } else {
        const res = await api.createListing(payload);
        onListingCreated(res.listing, res.message);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col my-8 max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {listingToEdit ? 'Edit Marketplace Listing' : 'Create Campus Listing'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              List student essentials for peer sale, exchange, or donation
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 flex-1">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Listing Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Higher Engineering Mathematics by B.S. Grewal (44th Ed)"
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3068E0]"
            />
          </div>

          {/* Category & Listing Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Category *</label>
                <button
                  type="button"
                  onClick={handleSuggestCategory}
                  disabled={aiSuggestingCategory}
                  className="text-[11px] text-[#3068E0] hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  {aiSuggestingCategory ? 'Detecting...' : 'Auto-detect'}
                </button>
              </div>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3068E0] bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Listing Type *
              </label>
              <select
                value={listingType}
                onChange={(e) => setListingType(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3068E0] bg-white"
              >
                <option value="Sale">For Sale (Direct Purchase)</option>
                <option value="Exchange">Open to Exchange / Barter</option>
                <option value="Donation">Free Donation (Giveaway)</option>
              </select>
            </div>
          </div>

          {/* Price, MRP, Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Price (₹ INR) *
              </label>
              <input
                type="number"
                required
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="250"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3068E0] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Original MRP (₹, optional)
              </label>
              <input
                type="number"
                min={0}
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="750"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3068E0] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Item Condition *
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3068E0] bg-white"
              >
                <option value="New">Brand New / Unused</option>
                <option value="Like New">Like New (Mint)</option>
                <option value="Good">Good (Minor wear)</option>
                <option value="Fair">Fair (Noticeable wear)</option>
              </select>
            </div>
          </div>

          {/* Images Section */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Product Photos &amp; Visuals (Max 5)
              </label>
              <span className="text-[11px] text-slate-500">{images.length}/5 photos</span>
            </div>

            <div className="flex flex-wrap gap-2.5 mb-2">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative w-20 h-16 rounded-lg border border-slate-200 overflow-hidden bg-slate-900 group"
                >
                  <img
                    src={img}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove image"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {images.length < 5 && (
                <label className="w-20 h-16 rounded-lg border border-dashed border-slate-300 hover:border-[#3068E0] flex flex-col items-center justify-center cursor-pointer text-slate-500 hover:text-[#3068E0] hover:bg-blue-50/30 transition-colors">
                  <Upload className="w-4 h-4 mb-0.5" />
                  <span className="text-[10px] font-medium">Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Presets */}
            <div className="mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-medium text-slate-600 block mb-1.5">
                Or select a campus essential vector illustration:
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {PRESET_IMAGE_OPTIONS.map((item) => (
                  <button
                    key={item.url}
                    type="button"
                    onClick={() => {
                      if (!images.includes(item.url) && images.length < 5) {
                        setImages([...images, item.url]);
                      }
                    }}
                    className="px-2 py-1 rounded bg-white border border-slate-200 text-[11px] hover:border-[#3068E0] text-slate-700 transition-colors"
                  >
                    + {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description with Gemini Assistant */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Product Description *
              </label>
              <button
                type="button"
                onClick={handleGenerateAiDescription}
                disabled={aiGeneratingDesc}
                className="text-xs text-[#3068E0] hover:underline flex items-center gap-1 font-medium"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {aiGeneratingDesc ? 'Synthesizing with Gemini...' : 'Draft with Gemini AI'}
              </button>
            </div>

            {aiGeneratedBanner && (
              <div className="mb-2 p-2 rounded-lg bg-sky-50 border border-sky-200 text-sky-800 text-[11px] flex items-center justify-between">
                <span>{aiGeneratedBanner}</span>
                <button
                  type="button"
                  onClick={() => setAiGeneratedBanner(null)}
                  className="text-sky-600 hover:text-sky-900 ml-2"
                >
                  <Check className="w-3 h-3" />
                </button>
              </div>
            )}

            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail edition number, chapters highlighted, syllabus match, charger/cables included, or specific hostel handover notes..."
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3068E0]"
            />
          </div>

          {/* Campus and Handover Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                College / Campus *
              </label>
              <input
                type="text"
                required
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="e.g. NIT Trichy or IIT Delhi"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3068E0]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Campus Handover Location *
              </label>
              <input
                type="text"
                required
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                placeholder="e.g. Central Library reception or Hostel Block D"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3068E0]"
              />
            </div>
          </div>

          {/* Quality Audit Tool */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#3068E0]" />
                Listing Quality Check
              </div>
              <button
                type="button"
                onClick={handleAuditQuality}
                disabled={aiAuditing}
                className="text-xs text-[#3068E0] font-semibold hover:underline"
              >
                {aiAuditing ? 'Auditing...' : 'Run Quality Audit'}
              </button>
            </div>

            {qualityAudit && (
              <div className="pt-2 border-t border-slate-200/60 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Completeness Score:</span>
                  <span
                    className={`font-bold ${
                      qualityAudit.score >= 80
                        ? 'text-emerald-700'
                        : qualityAudit.score >= 60
                        ? 'text-amber-700'
                        : 'text-rose-700'
                    }`}
                  >
                    {qualityAudit.score}/100
                  </span>
                </div>
                <ul className="space-y-1 text-slate-600">
                  {qualityAudit.suggestions.map((sug, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[11px]">
                      {qualityAudit.score >= 80 ? (
                        <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
                      )}
                      <span>{sug}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-[#3068E0] hover:bg-[#2355c4] text-white rounded-lg text-xs font-semibold transition-colors shadow-sm disabled:opacity-50"
            >
              {loading
                ? 'Saving Listing...'
                : listingToEdit
                ? 'Update Listing'
                : 'Publish Campus Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
