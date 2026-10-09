import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Monitor,
  RefreshCw,
  Copy,
  Check,
  Wifi,
  Cloud,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({ isOpen, onClose }) => {
  const { syncStatus, deviceType, lastSyncTime, forceSync } = useApp();
  const [copied, setCopied] = useState(false);
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState('');

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = () => {
    if (navigator.clipboard && currentUrl) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleManualSync = async () => {
    setIsManualSyncing(true);
    setSyncSuccessMsg('');
    try {
      await forceSync();
      setSyncSuccessMsg('داتاکان بە سەرکەوتوویی هاوکات کران!');
      setTimeout(() => setSyncSuccessMsg(''), 3000);
    } catch {
      setSyncSuccessMsg('هەڵەیەک ڕوویدا لە هاوکاتکردن');
    } finally {
      setIsManualSyncing(false);
    }
  };

  // Safe QR Code URL generator
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    currentUrl
  )}&margin=8`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-md shadow-inner">
              <Cloud className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base md:text-lg">بەستنەوەی کۆمپیوتەر و مۆبایل</h3>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-400/25 text-emerald-200 border border-emerald-300/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                داتاکانت ڕاستەوخۆ لە نێوان هەموو ئامێرەکان و Vercel هاوکات دەبن
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Status Banner */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  syncStatus === 'connected'
                    ? 'bg-emerald-100 text-emerald-600'
                    : syncStatus === 'syncing'
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-amber-100 text-amber-600'
                }`}
              >
                {syncStatus === 'connected' ? (
                  <Wifi className="w-5 h-5" />
                ) : syncStatus === 'syncing' ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Cloud className="w-5 h-5" />
                )}
              </div>
              <div>
                <span className="text-[11px] text-slate-700 block font-bold">باری پەیوەندی</span>
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      syncStatus === 'connected'
                        ? 'bg-emerald-500'
                        : syncStatus === 'syncing'
                        ? 'bg-blue-500 animate-ping'
                        : 'bg-amber-500'
                    }`}
                  />
                  {syncStatus === 'connected'
                    ? 'بەستراوەتەوە (هاوکاتە)'
                    : syncStatus === 'syncing'
                    ? 'خەریکی هاوکاتکردنە...'
                    : 'ئۆفلاین (لە ئامێر پارێزراوە)'}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                {deviceType === 'mobile' ? (
                  <Smartphone className="w-5 h-5" />
                ) : (
                  <Monitor className="w-5 h-5" />
                )}
              </div>
              <div>
                <span className="text-[11px] text-slate-700 block font-bold">ئەم ئامێرەی ئێستا</span>
                <span className="text-xs font-bold text-slate-900">
                  {deviceType === 'mobile' ? 'مۆبایل (Phone)' : 'کۆمپیوتەر (PC / Laptop)'}
                </span>
                {lastSyncTime && (
                  <span className="text-[10px] text-slate-700 block mt-0.5 font-medium">
                    دوایین کات: {lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Connect Mobile with QR Code */}
          <div className="bg-gradient-to-b from-blue-50/50 to-indigo-50/30 border border-blue-100 rounded-2xl p-4 md:p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                <Smartphone className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">
                چۆن لەسەر مۆبایلەکەت دەیکەیتەوە؟
              </h4>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* QR Code Container */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center shrink-0">
                <img
                  src={qrCodeUrl}
                  alt="QR Code to open app on mobile"
                  className="w-36 h-36 object-contain rounded-lg"
                  loading="lazy"
                />
                <span className="text-[10px] font-medium text-slate-700 mt-2 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-blue-600" />
                  بە کامێرای مۆبایل سکان بکە
                </span>
              </div>

              {/* Steps and Copy Link */}
              <div className="space-y-3 flex-1 text-right w-full">
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  کاتێک ئەم لینکە لەسەر مۆبایل دەکەیتەوە، هەموو ئایتمەکان، فرۆشتنەکان، کڕین و قەرزەکان ڕاستەوخۆ لە هەردوولا هاوکات دەبن. ئەگەر لە کۆمپیوتەر شتێک زیاد بکەیت یەکسەر لە مۆبایلیش پیشان دەدرێت!
                </p>

                {/* URL box with copy button */}
                <div className="bg-white border border-slate-200 rounded-xl p-2 flex items-center gap-2 shadow-xs">
                  <input
                    type="text"
                    readOnly
                    value={currentUrl}
                    className="flex-1 text-[11px] font-mono text-slate-600 bg-transparent outline-hidden px-2 select-all overflow-hidden text-ellipsis"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs shrink-0 active:scale-95 cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>کۆپیکرا!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>کۆپیکردنی لینک</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="text-[11px] text-slate-700 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  دەتوانیت لینکەکە بنێریت بۆ واتسئاپ یان تێلیگرام و لە مۆبایل بیکەیتەوە
                </div>
              </div>
            </div>
          </div>

          {/* Vercel Deployment Instructions */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-slate-800">
              <Layers className="w-4 h-4 text-blue-600" />
              <h5 className="font-bold text-xs text-slate-900">ڕوونکردنەوەی بەستنەوە بە ڤێرسێل (Vercel):</h5>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              سیستەمەکە کۆنفیگی تەواوی سێرڤەری <code className="bg-slate-200 px-1 py-0.5 rounded text-blue-800 font-mono text-[10px]">/api/sync</code> و <code className="bg-slate-200 px-1 py-0.5 rounded text-blue-800 font-mono text-[10px]">vercel.json</code>ی لەگەڵدایە. کاتێک پڕۆژەکە دەبەستیتەوە بە Vercel، هەمان لینکی سەرەکی کە Vercel پێت دەدات لەسەر کۆمپیوتەر و مۆبایلەکەت بکەرەوە. داتاکانت پارێزراو دەبن و بە بەردەوامی نوێ دەکرێنەوە.
            </p>
          </div>

          {/* Manual Force Sync Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>پاشەکەوتی خۆکار چالاکە (Auto Real-time Sync)</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleManualSync}
                disabled={isManualSyncing}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all disabled:opacity-60 cursor-pointer active:scale-95"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isManualSyncing ? 'animate-spin text-blue-600' : ''}`}
                />
                <span>{isManualSyncing ? 'خەریکی پشکنینە...' : 'هاوکاتکردنی دەستبەجێ'}</span>
              </button>

              <button
                onClick={onClose}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              >
                تەواو
              </button>
            </div>
          </div>

          {syncSuccessMsg && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 text-center animate-in fade-in">
              {syncSuccessMsg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
