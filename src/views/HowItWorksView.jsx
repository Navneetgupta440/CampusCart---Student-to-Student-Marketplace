import React from 'react';
import {
  Camera,
  MessageSquare,
  MapPin,
  CheckCircle,
  HelpCircle,
  Shield,
  ArrowRight,
} from 'lucide-react';

export const HowItWorksView = ({
  onNavigate,
  onOpenCreateListing,
}) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-[#3068E0] uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          Campus Marketplace Guide
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          How CampusCart Works
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          A transparent, student-verified peer exchange tailored specifically for college campuses.
        </p>
      </div>

      {/* 3 Step Deep Dive */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#3068E0] flex items-center justify-center">
            <Camera className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">1. List Your Gear</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Snap photos of your textbook, calculator, or hostel study equipment. Enter the course semester, condition, and your preferred campus pickup location.
          </p>
          <ul className="text-xs text-slate-500 space-y-1.5 pt-2 border-t border-slate-100">
            <li className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Free instant publishing</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Optional Gemini AI description help</span>
            </li>
          </ul>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">2. In-App Enquiries</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Interested campus buyers send questions and purchase requests straight to your CampusCart inbox. No unwanted WhatsApp spam or public phone numbers.
          </p>
          <ul className="text-xs text-slate-500 space-y-1.5 pt-2 border-t border-slate-100">
            <li className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Private email &amp; phone protection</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Anti-spam inquiry filtering</span>
            </li>
          </ul>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">3. Safe Campus Handover</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Pick a mutually convenient daytime campus spot (e.g. Central Library, SAC, Hostel Gate). Inspect the item in person and pay via student UPI or cash.
          </p>
          <ul className="text-xs text-slate-500 space-y-1.5 pt-2 border-t border-slate-100">
            <li className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Zero shipping delays or package fees</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Immediate test before payment</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Campus Safety Tips */}
      <div className="p-8 rounded-3xl bg-slate-900 text-white space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-[#34C4CF]" />
          <div>
            <h2 className="text-lg font-bold">Campus Safety Standards</h2>
            <p className="text-xs text-slate-400">Golden rules for trading securely</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-slate-300">
          <div className="space-y-1">
            <div className="font-semibold text-white">Public Handover Only</div>
            <p className="text-slate-400 leading-relaxed">
              Never invite strangers into private hostel rooms. Always meet at the campus library, cafeteria, or academic block.
            </p>
          </div>
          <div className="space-y-1">
            <div className="font-semibold text-white">Inspect Thoroughly</div>
            <p className="text-slate-400 leading-relaxed">
              Verify book editions, highlight coverage, calculator screen pixels, and battery condition on the spot.
            </p>
          </div>
          <div className="space-y-1">
            <div className="font-semibold text-white">Report Suspicious Behavior</div>
            <p className="text-slate-400 leading-relaxed">
              Use the "Report Listing" affordance to alert administrators of prohibited items or misleading details.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center space-y-4">
        <h3 className="text-xl font-bold text-slate-900">Ready to join your campus marketplace?</h3>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('marketplace')}
            className="px-6 py-2.5 bg-[#3068E0] hover:bg-[#2355c4] text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-sm flex items-center gap-2"
          >
            <span>Browse Products</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenCreateListing}
            className="px-6 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 rounded-xl text-xs sm:text-sm font-semibold transition-colors"
          >
            List an Item
          </button>
        </div>
      </div>
    </div>
  );
};
