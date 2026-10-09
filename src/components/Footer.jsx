import React from 'react';
import { ShoppingBag, Shield, BookOpen, HeartHandshake } from 'lucide-react';

export const Footer = ({ onNavigate }) => {
  return (
    <footer className="bg-[#12213A] text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#3068E0] flex items-center justify-center text-white">
                <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">CampusCart</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Buy Smart. Sell Easy. Campus Connected. The peer-to-peer marketplace empowering college students to buy, sell, exchange, and reuse essentials.
            </p>
            <div className="text-[11px] text-[#34C4CF] font-medium pt-1">
              Final-Year B.Tech CSE Capstone Project Demonstration
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 text-xs">
            <div className="text-white font-semibold uppercase tracking-wider text-[11px]">
              Marketplace
            </div>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('marketplace')}
                  className="hover:text-white transition-colors"
                >
                  Browse All Listings
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('marketplace')}
                  className="hover:text-white transition-colors"
                >
                  Engineering Textbooks
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('marketplace')}
                  className="hover:text-white transition-colors"
                >
                  Calculators &amp; Electronics
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('marketplace')}
                  className="hover:text-white transition-colors"
                >
                  Hostel &amp; Study Essentials
                </button>
              </li>
            </ul>
          </div>

          {/* Safety & Compliance */}
          <div className="space-y-3 text-xs">
            <div className="text-white font-semibold uppercase tracking-wider text-[11px]">
              Campus Safety &amp; Trust
            </div>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Verified academic profiles</span>
              </li>
              <li className="flex items-center gap-1.5">
                <HeartHandshake className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>Public daytime handover spots</span>
              </li>
              <li className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Copyright &amp; academic rules</span>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-white text-slate-300 transition-colors underline underline-offset-2"
                >
                  Review safety guidelines
                </button>
              </li>
            </ul>
          </div>

          {/* Legal / Policy */}
          <div className="space-y-3 text-xs">
            <div className="text-white font-semibold uppercase tracking-wider text-[11px]">
              Policy &amp; Terms
            </div>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">
                  Prohibited Items Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">
                  Zero Counterfeit Commitment
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">
                  Privacy &amp; Contact Protection
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">
                  Campus Moderation Desk
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} CampusCart. Built with pride for university communities.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Production-minded Architecture</span>
            <span aria-hidden="true">&middot;</span>
            <span>REST API Verified</span>
            <span aria-hidden="true">&middot;</span>
            <span>Safe College Handover</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
