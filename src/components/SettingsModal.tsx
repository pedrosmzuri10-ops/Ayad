import React, { useState } from 'react';
import {
  X,
  Store,
  DollarSign,
  Download,
  Upload,
  RefreshCw,
  Check,
  ShieldAlert,
  Monitor,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DesktopShortcutModal } from './DesktopShortcutModal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    settings,
    updateSettings,
    exportDataJson,
    importDataJson,
    resetToDefaultData,
  } = useApp();

  const [form, setForm] = useState({
    shopName: settings.shopName,
    ownerName: settings.ownerName,
    phone: settings.phone,
    address: settings.address,
    usdToIqdRate: settings.usdToIqdRate.toString(),
    receiptFooterKu: settings.receiptFooterKu,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importText, setImportText] = useState('');
  const [showImportBox, setShowImportBox] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [showShortcutModal, setShowShortcutModal] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      ...settings,
      shopName: form.shopName.trim() || 'Pedros',
      ownerName: form.ownerName.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      usdToIqdRate: parseFloat(form.usdToIqdRate) || 1530,
      receiptFooterKu: form.receiptFooterKu.trim(),
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const handleDownloadBackup = () => {
    const dataStr = exportDataJson();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pedros_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleApplyImport = () => {
    if (!importText.trim()) return;
    const success = importDataJson(importText.trim());
    if (success) {
      setImportMessage({ type: 'success', text: 'داتاکان بە سەرکەوتوویی هێنرانە ناوەوە!' });
      setTimeout(() => {
        setShowImportBox(false);
        setImportText('');
        onClose();
      }, 1200);
    } else {
      setImportMessage({ type: 'error', text: 'هەڵەیەک ڕوویدا لە خوێندنەوەی فایلی پاشەکەوت!' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[92vh] overflow-y-auto p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-blue-600" />
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
              ڕێکخستن و زانیاری فرۆشگا
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSave} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ناوی سیستەم / مارکێت *
            </label>
            <input
              type="text"
              required
              value={form.shopName}
              onChange={(e) => setForm({ ...form, shopName: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ژمارەی پەیوەندی
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                نرخی دۆلار بەرامبەر د.ع
              </label>
              <input
                type="number"
                value={form.usdToIqdRate}
                onChange={(e) => setForm({ ...form, usdToIqdRate: e.target.value })}
                placeholder="1530"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-blue-700 focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
              <span className="text-[10px] text-slate-400">1$ = {form.usdToIqdRate} د.ع</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ناونیشان</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              پەیامی ژێرەوەی پسوولە
            </label>
            <input
              type="text"
              value={form.receiptFooterKu}
              onChange={(e) => setForm({ ...form, receiptFooterKu: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>پاشەکەوتکرا!</span>
              </>
            ) : (
              <span>پاشەکەوتکردنی گۆڕانکارییەکان</span>
            )}
          </button>
        </form>

        {/* Data Backup & Restore Section */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <label className="block text-xs font-bold text-slate-700">پاشەکەوت و هێنانەوەی داتا</label>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDownloadBackup}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>داگرتنی داتا (Backup)</span>
            </button>

            <button
              type="button"
              onClick={() => setShowImportBox(!showImportBox)}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>هێنانەوە (Restore)</span>
            </button>
          </div>

          {showImportBox && (
            <div className="space-y-2 pt-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="block text-[11px] font-bold text-slate-600">
                کۆدی JSON لێرە دابنێ:
              </label>
              <textarea
                rows={3}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Paste backup JSON here..."
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono"
              />
              {importMessage && (
                <div
                  className={`p-2 rounded-lg text-xs font-bold text-center ${
                    importMessage.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {importMessage.text}
                </div>
              )}
              <button
                type="button"
                onClick={handleApplyImport}
                className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
              >
                جێبەجێکردنی هێنانەوە
              </button>
            </div>
          )}
        </div>

        {/* Desktop Shortcut & Installation */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <label className="block text-xs font-bold text-slate-700">شۆرتکەت و ئەپی کۆمپیوتەر</label>
          <button
            type="button"
            onClick={() => setShowShortcutModal(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all cursor-pointer border border-blue-200"
          >
            <Monitor className="w-4 h-4 text-blue-600" />
            <span>داگرتنی شۆرتکەت بۆ سەر دێسکتۆپ (Desktop Shortcut / PWA)</span>
          </button>
        </div>

        {/* Reset to Zero Data */}
        <div className="pt-3 border-t border-slate-100">
          {!resetConfirm ? (
            <button
              type="button"
              onClick={() => setResetConfirm(true)}
              className="w-full py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-rose-200"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>سفرکردنەوەی تەواوی سیستەم (0 کاڵا و 0 پارە)</span>
            </button>
          ) : (
            <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl space-y-2 text-center">
              <p className="text-xs font-bold text-rose-800">
                دڵنیایت لە سفرکردنەوەی هەموو شتێک؟ هەموو کاڵا، فرۆش و قەرزەکان دەبنە 0!
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setResetConfirm(false)}
                  className="flex-1 py-1.5 bg-white border border-rose-200 rounded-lg text-xs font-bold text-slate-700 cursor-pointer"
                >
                  نەخێر
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetToDefaultData();
                    setResetConfirm(false);
                    onClose();
                  }}
                  className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  بەڵێ، هەمووی سفر بکەوە
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showShortcutModal && (
        <DesktopShortcutModal
          isOpen={showShortcutModal}
          onClose={() => setShowShortcutModal(false)}
        />
      )}
    </div>
  );
};
