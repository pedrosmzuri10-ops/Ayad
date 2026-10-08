import React, { useState } from 'react';
import {
  Barcode,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Printer,
  Package,
  Layers,
  Sparkles,
  X,
  Check,
  ShoppingCart,
  Save,
  Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Item } from '../types';

export const BarcodeTab: React.FC = () => {
  const {
    items,
    categories,
    updateItem,
    deleteItem,
    removeBarcode,
    addItem,
    addToCart,
    formatMoney,
    formatNumber,
    setActiveTab,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterMode, setFilterMode] = useState<'all' | 'with-barcode' | 'without-barcode'>('all');

  // Edit Item / Barcode Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editForm, setEditForm] = useState({
    barcode: '',
    nameKu: '',
    nameEn: '',
    sellPrice: '',
    buyPrice: '',
    stockQuantity: '',
    categoryId: '',
  });

  // Delete Barcode Confirmation Modal
  const [deleteModalItem, setDeleteModalItem] = useState<Item | null>(null);

  // Add New Item with Barcode Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newForm, setNewForm] = useState({
    barcode: '',
    nameKu: '',
    nameEn: '',
    categoryId: categories[0]?.id || 'cat-1',
    buyPrice: '',
    sellPrice: '',
    stockQuantity: '10',
    unitKu: 'دانە',
  });

  // Printable Barcode Sticker Modal
  const [printingItem, setPrintingItem] = useState<Item | null>(null);

  // Stats
  const itemsWithBarcode = items.filter((i) => !!i.barcode && i.barcode.trim() !== '');
  const itemsWithoutBarcode = items.filter((i) => !i.barcode || i.barcode.trim() === '');
  const totalBarcodesCount = itemsWithBarcode.length;

  // Filter items
  const filteredItems = items.filter((item) => {
    // Barcode filter mode
    if (filterMode === 'with-barcode' && (!item.barcode || !item.barcode.trim())) return false;
    if (filterMode === 'without-barcode' && !!item.barcode && item.barcode.trim() !== '') return false;

    // Category filter
    if (selectedCategory !== 'all' && item.categoryId !== selectedCategory) return false;

    // Search query
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;

    return (
      (item.barcode && item.barcode.includes(q)) ||
      item.code.toLowerCase().includes(q) ||
      item.nameKu.toLowerCase().includes(q) ||
      item.nameEn.toLowerCase().includes(q)
    );
  });

  const handleOpenEdit = (item: Item) => {
    setEditingItem(item);
    setEditForm({
      barcode: item.barcode || '',
      nameKu: item.nameKu,
      nameEn: item.nameEn,
      sellPrice: item.sellPrice.toString(),
      buyPrice: item.buyPrice.toString(),
      stockQuantity: item.stockQuantity.toString(),
      categoryId: item.categoryId,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    updateItem({
      ...editingItem,
      barcode: editForm.barcode.trim(),
      nameKu: editForm.nameKu.trim() || editingItem.nameKu,
      nameEn: editForm.nameEn.trim() || editingItem.nameEn,
      sellPrice: parseFloat(editForm.sellPrice) || editingItem.sellPrice,
      buyPrice: parseFloat(editForm.buyPrice) || editingItem.buyPrice,
      stockQuantity: parseInt(editForm.stockQuantity, 10) || editingItem.stockQuantity,
      categoryId: editForm.categoryId || editingItem.categoryId,
    });

    setIsEditModalOpen(false);
    setEditingItem(null);
  };

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.nameKu.trim()) return;

    addItem({
      nameKu: newForm.nameKu.trim(),
      nameEn: newForm.nameEn.trim() || newForm.nameKu.trim(),
      categoryId: newForm.categoryId,
      buyPrice: parseFloat(newForm.buyPrice) || 0,
      sellPrice: parseFloat(newForm.sellPrice) || 0,
      stockQuantity: parseInt(newForm.stockQuantity, 10) || 0,
      unitKu: newForm.unitKu,
      unitEn: 'pcs',
      minStockAlert: 5,
      barcode: newForm.barcode.trim() || `622${Date.now().toString().slice(-7)}`,
    });

    setIsAddModalOpen(false);
    setNewForm({
      barcode: '',
      nameKu: '',
      nameEn: '',
      categoryId: categories[0]?.id || 'cat-1',
      buyPrice: '',
      sellPrice: '',
      stockQuantity: '10',
      unitKu: 'دانە',
    });
  };

  return (
    <div className="pb-28 pt-3 px-3 sm:px-4 max-w-4xl mx-auto space-y-4">
      {/* Top Header Card matching video design */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/90 space-y-4">
        {/* Title & Add button */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Barcode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg text-slate-900">
                بەشی بارکۆدەکان
              </h2>
              <p className="text-xs text-slate-500">
                بەڕێوەبردن، دەستکاری، سڕینەوە و پشکنینی هەموو بارکۆدەکان
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setNewForm({
                barcode: `622${Date.now().toString().slice(-7)}`,
                nameKu: '',
                nameEn: '',
                categoryId: categories[0]?.id || 'cat-1',
                buyPrice: '',
                sellPrice: '',
                stockQuantity: '10',
                unitKu: 'دانە',
              });
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ زیادکردنی بارکۆد</span>
          </button>
        </div>

        {/* 3 KPI Stats Cards matching video style */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* Total Registered Barcodes */}
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-3 text-center">
            <span className="text-[11px] font-bold text-blue-800">کۆی بارکۆدەکان</span>
            <div className="text-xl sm:text-2xl font-black text-blue-700 tracking-tight mt-1">
              {totalBarcodesCount} بارکۆد
            </div>
          </div>

          {/* Items without barcode */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-center">
            <span className="text-[11px] font-bold text-slate-600">بێ بارکۆد</span>
            <div className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight mt-1">
              {itemsWithoutBarcode.length} کاڵا
            </div>
          </div>

          {/* Total Items */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3 text-center">
            <span className="text-[11px] font-bold text-emerald-800">کۆی کاڵاکان</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-700 tracking-tight mt-1">
              {items.length} کاڵا
            </div>
          </div>
        </div>

        {/* Search Bar & Instant Scan */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="لێدان یان گەڕان بەدوای بارکۆد، ناوی کاڵا یان کۆد..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-9 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-xs sm:text-sm font-mono focus:outline-hidden transition-all placeholder:text-slate-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              filterMode === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            هەموو ({items.length})
          </button>
          <button
            onClick={() => setFilterMode('with-barcode')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              filterMode === 'with-barcode'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            تەنها بارکۆددارەکان ({itemsWithBarcode.length})
          </button>
          <button
            onClick={() => setFilterMode('without-barcode')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              filterMode === 'without-barcode'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            بێ بارکۆدەکان ({itemsWithoutBarcode.length})
          </button>
        </div>
      </div>

      {/* Barcode Cards List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1">
          <span>لیستی هەموو بارکۆدە تۆمارکراوەکان ({filteredItems.length})</span>
          <span className="text-slate-400">دەستکاری یان سڕینەوە هەڵبژێرە</span>
        </div>

        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-200">
            <Barcode className="w-12 h-12 mx-auto mb-2 text-slate-300 stroke-1" />
            <p className="text-sm font-semibold">هیچ بارکۆدێک نەدۆزرایەوە</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const category = categories.find((c) => c.id === item.categoryId);
            const hasBarcode = !!item.barcode && item.barcode.trim() !== '';

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/90 hover:border-blue-300 transition-all space-y-3"
              >
                {/* Header: Barcode & Code & Title & Actions */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                        {item.code}
                      </span>
                      {hasBarcode ? (
                        <span className="text-xs font-mono font-black text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200 tracking-wider">
                          {item.barcode}
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          بێ بارکۆدە
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">
                        {category?.nameKu || 'خۆراک'}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 mt-1 truncate">
                      {item.nameKu}
                    </h3>
                  </div>

                  {/* Edit and Delete Buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Print Label Button */}
                    {hasBarcode && (
                      <button
                        onClick={() => setPrintingItem(item)}
                        title="چاپکردنی ستیكەری بارکۆد"
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    )}

                    {/* Edit Button */}
                    <button
                      onClick={() => handleOpenEdit(item)}
                      title="دەستکاری بارکۆد و نرخ"
                      className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => setDeleteModalItem(item)}
                      title="سڕینەوەی بارکۆد"
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Simulated Barcode Visualizer */}
                {hasBarcode && (
                  <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-[2px] h-7 max-w-[140px] opacity-80">
                      {[3, 1, 4, 2, 6, 2, 1, 5, 2, 3, 2, 7, 2, 3, 4, 2, 2, 1, 5].map((w, i) => (
                        <div key={i} style={{ width: `${w}px` }} className="h-full bg-slate-900"></div>
                      ))}
                    </div>
                    <span className="font-mono text-xs font-black text-slate-700">
                      {item.barcode}
                    </span>
                  </div>
                )}

                {/* 3-column stats: Buy, Sell, Stock */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                  <div className="bg-slate-50 rounded-xl p-2">
                    <div className="text-[11px] font-medium text-slate-500">کڕین:</div>
                    <div className="text-xs sm:text-sm font-bold text-slate-700 mt-0.5">
                      {formatMoney(item.buyPrice)}
                    </div>
                  </div>

                  <div className="bg-blue-50/50 rounded-xl p-2 border border-blue-100/50">
                    <div className="text-[11px] font-medium text-blue-600">فرۆشتن:</div>
                    <div className="text-xs sm:text-sm font-extrabold text-blue-700 mt-0.5">
                      {formatMoney(item.sellPrice)}
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-2">
                    <div className="text-[11px] font-medium text-slate-500">کۆگا:</div>
                    <div className="text-xs sm:text-sm font-extrabold text-slate-800 mt-0.5">
                      {item.stockQuantity} {item.unitKu}
                    </div>
                  </div>
                </div>

                {/* Quick Add to Cart button */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-emerald-600 font-bold">
                    قازانج: +{formatMoney(item.sellPrice - item.buyPrice)}
                  </span>

                  <button
                    onClick={() => {
                      addToCart(item, 1);
                      setActiveTab('pos');
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>زیادکردن بۆ فرۆشتن +</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-5 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900">
                دەستکاری بارکۆد و زانیاری کاڵا
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              {/* Barcode Input & Generate button */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ژمارەی بارکۆد *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={editForm.barcode}
                    onChange={(e) => setEditForm({ ...editForm, barcode: e.target.value })}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold focus:bg-white focus:border-blue-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setEditForm({
                        ...editForm,
                        barcode: `622${Date.now().toString().slice(-7)}`,
                      });
                    }}
                    className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold whitespace-nowrap"
                  >
                    دروستکردنی بارکۆد
                  </button>
                </div>
              </div>

              {/* Item Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ناوی کاڵا (کوردی) *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.nameKu}
                  onChange={(e) => setEditForm({ ...editForm, nameKu: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Prices */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    نرخی کڕین (د.ع)
                  </label>
                  <input
                    type="number"
                    value={editForm.buyPrice}
                    onChange={(e) => setEditForm({ ...editForm, buyPrice: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    نرخی فرۆشتن (د.ع)
                  </label>
                  <input
                    type="number"
                    value={editForm.sellPrice}
                    onChange={(e) => setEditForm({ ...editForm, sellPrice: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-blue-700 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Stock & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    بڕی هەبوو لە کۆگا
                  </label>
                  <input
                    type="number"
                    value={editForm.stockQuantity}
                    onChange={(e) => setEditForm({ ...editForm, stockQuantity: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">هاوپۆل</label>
                  <select
                    value={editForm.categoryId}
                    onChange={(e) => setEditForm({ ...editForm, categoryId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:outline-hidden"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameKu}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  پاشگەزبوونەوە
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>پاشەکەوتکردن</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Barcode Modal */}
      {deleteModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-5 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>

            <div>
              <h4 className="font-extrabold text-base text-slate-900">سڕینەوە</h4>
              <p className="text-xs text-slate-600 mt-1">
                کاڵای «{deleteModalItem.nameKu}» (بارکۆد: {deleteModalItem.barcode || 'بێ بارکۆد'})
              </p>
            </div>

            <div className="space-y-2 pt-1">
              {deleteModalItem.barcode && (
                <button
                  onClick={() => {
                    removeBarcode(deleteModalItem.id);
                    setDeleteModalItem(null);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  تەنها بارکۆدەکەی بسڕەوە (کاڵاکە بمێنێتەوە)
                </button>
              )}

              <button
                onClick={() => {
                  deleteItem(deleteModalItem.id);
                  setDeleteModalItem(null);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                کاڵاکە بە تەواوی لە سیستەم بسڕەوە
              </button>

              <button
                onClick={() => setDeleteModalItem(null)}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                پاشگەزبوونەوە
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Item with Barcode Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-5 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900">
                زیادکردنی بارکۆدی نوێ لەگەڵ کاڵا
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewItem} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ژمارەی بارکۆد *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newForm.barcode}
                    onChange={(e) => setNewForm({ ...newForm, barcode: e.target.value })}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold focus:bg-white focus:border-blue-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setNewForm({
                        ...newForm,
                        barcode: `622${Date.now().toString().slice(-7)}`,
                      });
                    }}
                    className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold whitespace-nowrap"
                  >
                    دروستکردن
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ناوی کاڵا (کوردی) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="وەک: شوکولاتەی کیندەر"
                  value={newForm.nameKu}
                  onChange={(e) => setNewForm({ ...newForm, nameKu: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    نرخی کڕین (د.ع)
                  </label>
                  <input
                    type="number"
                    value={newForm.buyPrice}
                    onChange={(e) => setNewForm({ ...newForm, buyPrice: e.target.value })}
                    placeholder="800"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    نرخی فرۆشتن (د.ع) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newForm.sellPrice}
                    onChange={(e) => setNewForm({ ...newForm, sellPrice: e.target.value })}
                    placeholder="1000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-blue-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">بڕی کۆگا</label>
                  <input
                    type="number"
                    value={newForm.stockQuantity}
                    onChange={(e) => setNewForm({ ...newForm, stockQuantity: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">هاوپۆل</label>
                  <select
                    value={newForm.categoryId}
                    onChange={(e) => setNewForm({ ...newForm, categoryId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameKu}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 cursor-pointer"
                >
                  پاشگەزبوونەوە
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  زیادکردنی بارکۆد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Barcode Label Modal */}
      {printingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xs w-full p-5 text-center space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-700">ستیكەری بارکۆد</span>
              <button onClick={() => setPrintingItem(null)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-white border border-dashed border-slate-300 rounded-2xl space-y-2">
              <h4 className="font-black text-sm text-slate-900">{printingItem.nameKu}</h4>
              <div className="flex justify-center items-center gap-[2px] h-10 max-w-[180px] mx-auto opacity-90">
                {[3, 1, 5, 2, 6, 2, 2, 4, 2, 7, 1, 4, 3, 2, 5, 2, 1, 6].map((w, i) => (
                  <div key={i} style={{ width: `${w}px` }} className="h-full bg-slate-900"></div>
                ))}
              </div>
              <div className="font-mono text-xs font-black tracking-wider text-slate-800">
                {printingItem.barcode}
              </div>
              <div className="text-base font-black text-blue-700 pt-1 border-t border-slate-200">
                {formatMoney(printingItem.sellPrice)}
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>چاپکردنی لەیزەر / تیڕماڵ</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
