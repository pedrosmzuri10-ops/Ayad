import React, { useState } from 'react';
import {
  X,
  Barcode,
  Search,
  CheckCircle,
  AlertCircle,
  Edit2,
  Save,
  ShoppingCart,
  Plus,
  RefreshCw,
  Printer,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Item } from '../types';

interface BarcodeCheckerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BarcodeCheckerModal: React.FC<BarcodeCheckerModalProps> = ({ isOpen, onClose }) => {
  const { items, categories, updateItem, addItem, addToCart, formatMoney, formatNumber } = useApp();

  const [inputCode, setInputCode] = useState('');
  const [scannedItem, setScannedItem] = useState<Item | null>(() => items[0] || null);
  const [isEditing, setIsEditing] = useState(false);
  const [editBarcode, setEditBarcode] = useState('');
  const [editSellPrice, setEditSellPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // New item form if barcode is not found
  const [newItemName, setNewItemName] = useState('');
  const [newItemSellPrice, setNewItemSellPrice] = useState('');
  const [newItemBuyPrice, setNewItemBuyPrice] = useState('');
  const [newItemStock, setNewItemStock] = useState('');

  if (!isOpen) return null;

  const handleSearch = (codeToSearch: string) => {
    const q = codeToSearch.trim();
    if (!q) return;

    const found = items.find(
      (item) =>
        item.barcode === q ||
        item.code.toLowerCase() === q.toLowerCase() ||
        item.nameKu.toLowerCase().includes(q.toLowerCase())
    );

    if (found) {
      setScannedItem(found);
      setIsCreatingNew(false);
      setIsEditing(false);
      setEditBarcode(found.barcode || '');
      setEditSellPrice(found.sellPrice.toString());
      setEditStock(found.stockQuantity.toString());
    } else {
      setScannedItem(null);
      setIsCreatingNew(true);
      setNewItemName('');
      setNewItemSellPrice('');
      setNewItemBuyPrice('');
      setNewItemStock('10');
    }
  };

  const handleStartEdit = () => {
    if (!scannedItem) return;
    setEditBarcode(scannedItem.barcode || '');
    setEditSellPrice(scannedItem.sellPrice.toString());
    setEditStock(scannedItem.stockQuantity.toString());
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!scannedItem) return;

    const updated: Item = {
      ...scannedItem,
      barcode: editBarcode.trim(),
      sellPrice: parseFloat(editSellPrice) || scannedItem.sellPrice,
      stockQuantity: parseInt(editStock, 10) || scannedItem.stockQuantity,
    };

    updateItem(updated);
    setScannedItem(updated);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 1500);
  };

  const handleCreateNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const created = addItem({
      nameKu: newItemName.trim(),
      nameEn: newItemName.trim(),
      categoryId: categories[0]?.id || 'cat-1',
      buyPrice: parseFloat(newItemBuyPrice) || 0,
      sellPrice: parseFloat(newItemSellPrice) || 0,
      stockQuantity: parseInt(newItemStock, 10) || 10,
      unitKu: 'دانە',
      unitEn: 'pcs',
      minStockAlert: 5,
      barcode: inputCode.trim() || `622${Date.now().toString().slice(-7)}`,
    });

    setScannedItem(created);
    setIsCreatingNew(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 1500);
  };

  const currentCategory = scannedItem
    ? categories.find((c) => c.id === scannedItem.categoryId)
    : null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-linear-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Barcode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                پشکنین و چاککردنی بارکۆد
              </h3>
              <p className="text-xs text-slate-500">
                پشکنینی نرخ، کۆگا و دەستکاریکردنی خێرای بارکۆد
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-white/80 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Barcode Search / Scan Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              بارکۆد یان کۆدی کاڵا لێبدە / بنووسە:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="وەک: 6221001001 یان #1001..."
                  value={inputCode}
                  onChange={(e) => {
                    setInputCode(e.target.value);
                    if (e.target.value.length >= 4) {
                      handleSearch(e.target.value);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearch(inputCode);
                  }}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono font-bold focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <button
                type="button"
                onClick={() => handleSearch(inputCode)}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                پشکنین
              </button>
            </div>

            {/* Quick Test Barcode Buttons */}
            <div className="flex items-center gap-1.5 pt-1 overflow-x-auto scrollbar-none">
              <span className="text-[10px] text-slate-400 font-semibold whitespace-nowrap">
                تاقیکردنەوەی خێرا:
              </span>
              {items.slice(0, 4).map((it) => (
                <button
                  key={it.id}
                  onClick={() => {
                    setInputCode(it.barcode || it.code);
                    handleSearch(it.barcode || it.code);
                  }}
                  className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-mono font-bold whitespace-nowrap cursor-pointer"
                >
                  {it.code}
                </button>
              ))}
            </div>
          </div>

          {/* Success toast */}
          {saveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-bold">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>گۆڕانکارییەکان بە سەرکەوتوویی پاشەکەوتکران!</span>
            </div>
          )}

          {/* Scanned Item Result Card */}
          {scannedItem && !isCreatingNew ? (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              {/* Item Info Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
                      {scannedItem.code}
                    </span>
                    <span className="text-xs text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      {currentCategory?.nameKu || 'خۆراک'}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900 mt-1">
                    {scannedItem.nameKu}
                  </h4>
                </div>

                {!isEditing && (
                  <button
                    onClick={handleStartEdit}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>چاککردن</span>
                  </button>
                )}
              </div>

              {/* Barcode details */}
              {!isEditing ? (
                <div className="space-y-3">
                  {/* Visual Barcode */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 text-center space-y-1">
                    <div className="flex justify-center items-center gap-[2px] h-9 max-w-[200px] mx-auto opacity-80">
                      {[3, 1, 5, 2, 7, 3, 2, 6, 2, 3, 2, 8, 2, 4, 5, 2, 3, 2, 6].map((w, i) => (
                        <div key={i} style={{ width: `${w}px` }} className="h-full bg-slate-900"></div>
                      ))}
                    </div>
                    <div className="font-mono text-xs font-black text-slate-700 tracking-wider">
                      {scannedItem.barcode || 'هیچ بارکۆدێک دانەنراوە'}
                    </div>
                  </div>

                  {/* 3 Metrics: Sell price, Buy price, Stock */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-blue-600 font-bold block">نرخی فرۆشتن:</span>
                      <span className="text-xs sm:text-sm font-black text-blue-700 mt-0.5 block">
                        {formatMoney(scannedItem.sellPrice)}
                      </span>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-bold block">نرخی کڕین:</span>
                      <span className="text-xs sm:text-sm font-bold text-slate-700 mt-0.5 block">
                        {formatMoney(scannedItem.buyPrice)}
                      </span>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-bold block">بڕی کۆگا:</span>
                      <span className="text-xs sm:text-sm font-black text-slate-800 mt-0.5 block">
                        {scannedItem.stockQuantity} {scannedItem.unitKu}
                      </span>
                    </div>
                  </div>

                  {/* Profit summary */}
                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200/60 flex items-center justify-between text-xs font-bold text-emerald-800">
                    <span>قازانج لە یەک دانە:</span>
                    <span>+{formatMoney(scannedItem.sellPrice - scannedItem.buyPrice)}</span>
                  </div>

                  {/* Quick Add to Cart button */}
                  <button
                    onClick={() => {
                      addToCart(scannedItem, 1);
                      onClose();
                    }}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>زیادکردن بۆ فرۆشتن +</span>
                  </button>
                </div>
              ) : (
                /* Edit Mode: Adjust Barcode, Price, and Stock directly */
                <div className="bg-white p-3.5 rounded-xl border border-blue-200 space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      بارکۆدی نوێ:
                    </label>
                    <input
                      type="text"
                      value={editBarcode}
                      onChange={(e) => setEditBarcode(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        نرخی فرۆشتن (د.ع):
                      </label>
                      <input
                        type="number"
                        value={editSellPrice}
                        onChange={(e) => setEditSellPrice(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-blue-700"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        بڕی کۆگا:
                      </label>
                      <input
                        type="number"
                        value={editStock}
                        onChange={(e) => setEditStock(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600"
                    >
                      پاشگەزبوونەوە
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>پاشەکەوتکردن</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : isCreatingNew ? (
            /* Barcode Not Found -> Fast Register Item with this barcode */
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-amber-800">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <div>
                  <h4 className="font-extrabold text-sm">ئەم بارکۆدە نەدۆزرایەوە</h4>
                  <p className="text-xs text-amber-700">دەتوانیت ڕاستەوخۆ کاڵای نوێ بەم بارکۆدە تۆمار بکەیت</p>
                </div>
              </div>

              <form onSubmit={handleCreateNewItem} className="space-y-2.5 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ناوی کاڵا *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="وەک: پسکویتی ئۆریۆ"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      نرخی فرۆشتن (د.ع) *
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="1000"
                      value={newItemSellPrice}
                      onChange={(e) => setNewItemSellPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-blue-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      نرخی کڕین (د.ع)
                    </label>
                    <input
                      type="number"
                      placeholder="800"
                      value={newItemBuyPrice}
                      onChange={(e) => setNewItemBuyPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>تۆمارکردنی کاڵاکە بە بارکۆدی ({inputCode})</span>
                </button>
              </form>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
