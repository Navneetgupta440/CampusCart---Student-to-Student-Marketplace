import React from 'react';
import { ShieldCheck, BookOpen, Ban, GraduationCap, Mail } from 'lucide-react';

export const AboutView = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Title */}
      <div className="space-y-3">
        <span className="text-xs font-bold text-[#3068E0] uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          About CampusCart
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Campus Connected Student Marketplace
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Developed as a final-year B.Tech Computer Science and Engineering capstone project to address the affordability gap for college textbooks, stationery, and hostel gear.
        </p>
      </div>

      {/* Mission */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-2xs">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-[#3068E0]" />
          Project Motivation &amp; Problem Statement
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          At the start of every academic year, engineering and university students spend significant sums on standard textbooks (e.g. B.S. Grewal Mathematics, Weiss Algorithms, Kurose Networking), scientific calculators, mini-drafters, and lab coats. Meanwhile, senior students often have these exact items sitting unused in hostel cupboards after completing their examinations.
        </p>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          CampusCart provides a dedicated, localized peer-to-peer exchange platform that removes third-party middleman margins, eliminates high delivery fees, and connects campus students for direct, safe on-campus handovers.
        </p>
      </div>

      {/* Prohibited Items Policy */}
      <div className="bg-white rounded-2xl border border-rose-200 p-6 sm:p-8 space-y-4 shadow-2xs">
        <h2 className="text-lg font-bold text-rose-900 flex items-center gap-2">
          <Ban className="w-5 h-5 text-rose-600" />
          Prohibited Items &amp; Academic Integrity Policy
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          To maintain student safety, university compliance, and strict legal standards, the following items are strictly prohibited from CampusCart:
        </p>
        <ul className="text-xs text-slate-700 space-y-2 list-disc list-inside">
          <li>Stolen, lost, or unaccounted college property or university lab equipment.</li>
          <li>Pirated, counterfeit, or illegally photocopied textbook reproductions violating publisher copyrights.</li>
          <li>Exam question leaks, live assignment solution sheets, or unauthorized test material.</li>
          <li>Hazardous chemicals, weapons, alcoholic beverages, nicotine products, or illegal substances.</li>
          <li>Prescription medication or medical equipment requiring regulatory clearance.</li>
        </ul>
        <div className="p-3 bg-rose-50 rounded-lg text-[11px] text-rose-800 font-medium">
          Note: CampusCart administrators regularly audit listings and permanently suspend accounts violating this policy.
        </div>
      </div>

      {/* Technology & Architecture */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-2xs">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          Full-Stack Architectural Highlights
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
          <div className="p-3 rounded-lg bg-slate-50 space-y-1">
            <div className="font-semibold text-slate-900">Frontend Stack</div>
            <p>React 19 + JavaScript (ES Modules), Tailwind CSS, Lucide icons, responsive mobile-first views.</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 space-y-1">
            <div className="font-semibold text-slate-900">Backend REST APIs</div>
            <p>Node.js &amp; Express in ES Modules JavaScript with PBKDF2 cryptography, role-based access control (RBAC), and persistent JSON storage.</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 space-y-1">
            <div className="font-semibold text-slate-900">AI Assistant</div>
            <p>Integrated with Gemini API (gemini-3.8-flash) for listing description drafting, auto-categorization, and quality audits.</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 space-y-1">
            <div className="font-semibold text-slate-900">Safety &amp; Notification Mechanisms</div>
            <p>In-app enquiry inbox with email notifications, wishlist price-drop alerts, report moderation queue, and sanitized profile cards.</p>
          </div>
        </div>
      </div>

      {/* Final note */}
      <div className="text-center text-xs text-slate-400 py-4">
        CampusCart &middot; Buy Smart. Sell Easy. Campus Connected &middot; Department of Computer Science &amp; Engineering
      </div>
    </div>
  );
};
