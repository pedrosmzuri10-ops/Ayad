import React, { useState } from 'react';
import {
  Sparkles,
  ShoppingBag,
  Barcode,
  Settings,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SettingsModal } from './SettingsModal';
import { TodaySalesModal } from './TodaySalesModal';
import { BarcodeCheckerModal } from './BarcodeCheckerModal';

export const Header: React.FC = () => {
  const {
    settings,
    currency,
    setCurrency,
    language,
    setLanguage,
    getTodayStats,
    formatMoney,
  } = useApp();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTodaySalesOpen, setIsTodaySalesOpen] = useState(false);
  const [isBarcodeCheckerOpen, setIsBarcodeCheckerOpen] = useState(false);

  const todayStats = getTodayStats();

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-4 py-2.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Left side actions (Today's Sales, Barcode Checker, Currency, Language) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Replaced RT with Today's Sales Button */}
            <button
              onClick={() => setIsTodaySalesOpen(true)}
              title="فرۆشراوەکانی ئەمڕۆ - کلیک بکە بۆ بینینی هەموو کاڵا فرۆشراوەکان"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xs transition-all cursor-pointer active:scale-97"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-white" />
              <span>فرۆشی ئەمڕۆ</span>
              <span className="hidden sm:inline-block bg-white/20 text-white px-1.5 py-0.2 rounded-md font-mono text-[10px]">
                {formatMoney(todayStats.totalSales)}
              </span>
            </button>

            {/* Currency Pill Switcher (USD $ / د.ع) */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setCurrency('USD')}
                className={`px-2 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  currency === 'USD'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                USD $
              </button>
              <button
                onClick={() => setCurrency('IQD')}
                className={`px-2 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  currency === 'IQD'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                د.ع
              </button>
            </div>

            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'ku' ? 'en' : 'ku')}
              className="px-2 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all cursor-pointer"
            >
              {language === 'ku' ? 'English' : 'کوردی'}
            </button>
          </div>

          {/* Right side: Pro badge & Brand Name WITHOUT the pencil icon */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* v700 Pro badge */}
            <div className="hidden xs:flex items-center gap-1 px-2.5 py-1 rounded-full bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-700 text-xs font-bold tracking-tight shadow-xs">
              <Sparkles className="w-3 h-3 text-blue-500 fill-blue-500" />
              <span>v700 Pro</span>
            </div>

            {/* Shop Brand & Logo - Pencil icon removed as requested */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-2 group cursor-pointer focus:outline-hidden"
              title="ڕێکخستن و زانیاری فرۆشگا"
            >
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                {settings.shopName}
              </span>

              {/* Blue 'P' (or initial letter) Avatar Logo */}
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-sm shadow-blue-500/20 group-hover:bg-blue-700 transition-transform group-hover:scale-105">
                {settings.shopName.charAt(0).toUpperCase() || 'P'}
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      )}

      {/* Today's Sales Modal */}
      {isTodaySalesOpen && (
        <TodaySalesModal isOpen={isTodaySalesOpen} onClose={() => setIsTodaySalesOpen(false)} />
      )}

      {/* Barcode Checker Modal */}
      {isBarcodeCheckerOpen && (
        <BarcodeCheckerModal
          isOpen={isBarcodeCheckerOpen}
          onClose={() => setIsBarcodeCheckerOpen(false)}
        />
      )}
    </>
  );
};
