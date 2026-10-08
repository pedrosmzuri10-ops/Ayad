import React, { useState } from 'react';
import {
  X,
  Monitor,
  Download,
  CheckCircle2,
  ExternalLink,
  Laptop,
  Copy,
  Check,
  Sparkles,
  Layers,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface DesktopShortcutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesktopShortcutModal: React.FC<DesktopShortcutModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isInstallable, isInstalled, install, isIOS } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [downloadedUrl, setDownloadedUrl] = useState(false);

  if (!isOpen) return null;

  // Function to generate and download a native Windows .url internet shortcut file
  const handleDownloadWindowsShortcut = () => {
    try {
      const currentUrl = window.location.href;
      const fileContent = `[InternetShortcut]\r\nURL=${currentUrl}\r\nIconIndex=0\r\nHotKey=0\r\nIDList=\r\n[{000214A0-0000-0000-C000-000000000046}]\r\nProp3=19,11\r\n`;
      const blob = new Blob([fileContent], {
        type: 'application/internet-shortcut;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Pedros POS.url';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setDownloadedUrl(true);
      setTimeout(() => setDownloadedUrl(false), 4000);
    } catch (e) {
      console.error('Failed to create shortcut file:', e);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-100"
        dir="rtl"
      >
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 via-indigo-600 to-blue-700 px-6 py-5 text-white flex items-center justify-between relative overflow-hidden">
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <Monitor className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg sm:text-xl tracking-tight flex items-center gap-2">
                <span>شۆرتکەت و ئەپی کۆمپیوتەر</span>
                <span className="text-[10px] bg-white/20 text-white font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                  Desktop POS
                </span>
              </h3>
              <p className="text-xs text-blue-100 mt-0.5 font-medium">
                بەرنامەکە ڕاستەوخۆ لەسەر دێسکتۆپی کۆمپیوتەرەکەت داببەزێنە
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors cursor-pointer relative z-10"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Decorative glow */}
          <div className="absolute -left-10 -bottom-10 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto max-h-[calc(92vh-130px)]">
          {/* Main Action 1: Install PWA (Chrome/Edge desktop app) */}
          <div className="p-4 rounded-xl border-2 border-blue-100 bg-blue-50/50 hover:bg-blue-50 transition-all">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
                  <Laptop className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                    <span>داگرتنی وەک بەرنامەی کۆمپیوتەر (PWA)</span>
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">
                      پێشنیارکراو
                    </span>
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    بە شێوەی پەنجەرەی تایبەت (Standalone App) و بە ئایکۆنی ڕاستەقینە لەسەر شاشەی سەرەکی
                    و لە مێنیوی Start و Taskbar دەکرێتەوە.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3.5 flex items-center gap-2">
              {isInstalled ? (
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold w-full justify-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>بەرنامەکە لەسەر ئەم ئامێرە دامەزراوە</span>
                </div>
              ) : isInstallable ? (
                <button
                  onClick={install}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>داگرتنی بەرنامە بۆ کۆمپیوتەر (Install App)</span>
                </button>
              ) : (
                <div className="w-full bg-white p-3 rounded-xl border border-blue-200 text-xs text-slate-700">
                  <div className="flex items-center gap-1.5 font-bold text-blue-900 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>چۆن لە کرۆم و ئێج دایبەزێنم؟</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-normal">
                    لە سەرەوەی براوزەر لە تەنیشت ناونیشانی وێبگە (Search/URL bar) کلیک لەسەر ئایکۆنی
                    <strong> داگرتن (💻 Install)</strong> بکە، یان هەنگاوەکانی خوارەوە بەکاربێنە.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Main Action 2: Download .url shortcut file for Desktop */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/20">
                <Download className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                  داگرتنی فایلی شۆرتکەت (.url) بۆ سەر Desktop
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  فایلی شۆرتکەتی دێسکتۆپ داببەزێنە و بیخەرە سەر دێسکتۆپی کۆمپیوتەرەکەت؛ بە جووت کلیک
                  (Double Click) ڕاستەوخۆ دەکرێتەوە.
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleDownloadWindowsShortcut}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-98"
                  >
                    {downloadedUrl ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>فایلەکە دابەزی! (Pedros POS.url)</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>داگرتنی فایلی شۆرتکەت (.url)</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'لینک کۆپی کرا' : 'کۆپیکردنی لینک'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Browser Manual Instructions */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h5 className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <span>ڕێنمایی دروستکردنی شۆرتکەت لە گۆگڵ کرۆم و مایکرۆسۆفت ئێج</span>
            </h5>

            <div className="space-y-2.5 text-xs text-slate-600">
              {/* Chrome step */}
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center justify-center shrink-0">
                  1
                </span>
                <div>
                  <strong className="text-slate-900 block mb-0.5">Google Chrome:</strong>
                  کلیک لەسەر سێ خاڵەکەی سەرەوەی چەپ یان ڕاست (<strong className="text-slate-800">⋮</strong>) بکە
                  لە براوزەرەکە، پاشان بڕۆ بۆ <span className="font-semibold text-blue-600">Save and share</span> یان{' '}
                  <span className="font-semibold text-blue-600">More tools</span>، دواتر کلیک لە{' '}
                  <strong className="text-slate-900">Create shortcut...</strong> بکە و نیشانەی{' '}
                  <strong className="text-blue-700">"Open as window"</strong> لێبدە و کلیک لە Create بکە.
                </div>
              </div>

              {/* Edge step */}
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[11px] flex items-center justify-center shrink-0">
                  2
                </span>
                <div>
                  <strong className="text-slate-900 block mb-0.5">Microsoft Edge:</strong>
                  کلیک لەسەر سێ خاڵەکە (<strong className="text-slate-800">...</strong>) بکە، بڕۆ بۆ بەشی{' '}
                  <span className="font-semibold text-indigo-600">Apps</span>، پاشان کلیک لەسەر{' '}
                  <strong className="text-slate-900">Install this site as an app</strong> بکە.
                </div>
              </div>

              {/* Mobile note if on mobile */}
              {isIOS && (
                <div className="bg-white p-2.5 rounded-lg border border-amber-200 flex items-start gap-2 text-amber-900">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 font-bold text-[11px] flex items-center justify-center shrink-0">
                    📱
                  </span>
                  <div>
                    <strong className="text-amber-950 block mb-0.5">بۆ ئایفۆن و ئایپاد (iOS Safari):</strong>
                    کلیک لە دوگمەی Share لە خوارەوەی Safari بکە، پاشان بڕۆ خوارەوە و کلیک لە{' '}
                    <strong>Add to Home Screen</strong> بکە.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium">
            Pedros POS & Inventory Management System
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
          >
            داخستن
          </button>
        </div>
      </div>
    </div>
  );
};
