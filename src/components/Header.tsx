import React, { useState } from 'react';
import {
  Sparkles,
  ShoppingBag,
  Barcode,
  Laptop,
  Download,
  Cloud,
  RefreshCw,
  Smartphone,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SettingsModal } from './SettingsModal';
import { TodaySalesModal } from './TodaySalesModal';
import { BarcodeCheckerModal } from './BarcodeCheckerModal';
import { DesktopShortcutModal } from './DesktopShortcutModal';
import { SyncModal } from './SyncModal';

export const Header: React.FC = () => {
  const {
    settings,
    currency,
    setCurrency,
    language,
    setLanguage,
    getTodayStats,
    formatMoney,
    syncStatus,
    isSyncModalOpen,
    setIsSyncModalOpen,
  } = useApp();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTodaySalesOpen, setIsTodaySalesOpen] = useState(false);
  const [isBarcodeCheckerOpen, setIsBarcodeCheckerOpen] = useState(false);
  const [isDesktopShortcutOpen, setIsDesktopShortcutOpen] = useState(false);

  const todayStats = getTodayStats();

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-2 sm:px-4 py-2 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Left side actions (Today's Sales, Barcode Checker, Mobile/PC Sync, Desktop Shortcut, Currency, Language) */}
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap sm:flex-nowrap">
            {/* Today's Sales Button */}
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

            {/* Mobile & PC Cloud Sync Button */}
            <button
              onClick={() => setIsSyncModalOpen(true)}
              title="بەستنەوەی کۆمپیوتەر و مۆبایل و دۆخی هاوکاتکردن (Mobile & PC Real-time Sync)"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-97 border ${
                syncStatus === 'connected'
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 shadow-2xs'
                  : syncStatus === 'syncing'
                  ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'
              }`}
            >
              {syncStatus === 'syncing' ? (
                <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
              ) : (
                <Cloud className="w-3.5 h-3.5 text-emerald-600" />
              )}
              <span className="hidden md:inline">
                {syncStatus === 'syncing' ? 'خەریکی هاوکاتکردنە...' : 'هاوکاتی مۆبایل'}
              </span>
              <span className="md:hidden">هاوکات</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  syncStatus === 'connected'
                    ? 'bg-emerald-500'
                    : syncStatus === 'syncing'
                    ? 'bg-blue-500 animate-pulse'
                    : 'bg-amber-500'
                }`}
              />
            </button>

            {/* Quick Barcode Checker Button */}
            <button
              onClick={() => setIsBarcodeCheckerOpen(true)}
              title="پشکنین و دۆزینەوەی کاڵا بەپێی بارکۆد"
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all cursor-pointer active:scale-97"
            >
              <Barcode className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden lg:inline">پشکنینی بارکۆد</span>
            </button>

            {/* Desktop Shortcut & Download App Button */}
            <button
              onClick={() => setIsDesktopShortcutOpen(true)}
              title="دابەزاندنی شۆرتکەت لەسەر کۆمپیوتەر (Desktop Shortcut & App)"
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-all cursor-pointer shadow-2xs active:scale-97"
            >
              <Laptop className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">شۆرتکەت</span>
              <Download className="w-3 h-3 text-blue-500 hidden xs:inline" />
            </button>

            {/* Currency Switcher */}
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

          {/* Right side: Pro badge & Brand Name */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* v700 Pro badge */}
            <div className="hidden xs:flex items-center gap-1 px-2.5 py-1 rounded-full bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-700 text-xs font-bold tracking-tight shadow-xs">
              <Sparkles className="w-3 h-3 text-blue-500 fill-blue-500" />
              <span>v700 Pro</span>
            </div>

            {/* Shop Brand & Logo */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-2 group cursor-pointer focus:outline-hidden"
              title="ڕێکخستن و زانیاری فرۆشگا"
            >
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                {settings.shopName}
              </span>

              {/* Blue Avatar Logo */}
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

      {/* Desktop Shortcut Modal */}
      {isDesktopShortcutOpen && (
        <DesktopShortcutModal
          isOpen={isDesktopShortcutOpen}
          onClose={() => setIsDesktopShortcutOpen(false)}
        />
      )}

      {/* Cross-Device Sync Modal */}
      {isSyncModalOpen && (
        <SyncModal isOpen={isSyncModalOpen} onClose={() => setIsSyncModalOpen(false)} />
      )}
    </>
  );
};
