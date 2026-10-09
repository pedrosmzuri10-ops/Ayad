import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Barcode,
  Edit2,
  Trash2,
  AlertTriangle,
  Layers,
  Coins,
  DollarSign,
  ShoppingCart,
  PlusCircle,
  X,
  Check,
  Receipt,
  Tag,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Category, Item } from '../types';
import { ExpenseModal } from './ExpenseModal';
import { BarcodeCheckerModal } from './BarcodeCheckerModal';

export const WarehouseTab: React.FC = () => {
  const {
    items,
    categories,
    expenses,
    formatMoney,
    formatNumber,
    addItem,
    updateItem,
    deleteItem,
    addCategory,
    updateCategory,
    deleteCategory,
    addToCart,
    deleteExpense,
    language,
    setActiveTab,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'items' | 'expenses'>('items');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isBarcodeCheckerOpen, setIsBarcodeCheckerOpen] = useState(false);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<Item | null>(null);

  // Category Edit & Delete states
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatNameKu, setEditCatNameKu] = useState('');
  const [editCatNameEn, setEditCatNameEn] = useState('');
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  // New item form state
  const [itemForm, setItemForm] = useState({
    nameKu: '',
    nameEn: '',
    categoryId: categories[0]?.id || 'cat-1',
    buyPrice: '',
    sellPrice: '',
    stockQuantity: '',
    unitKu: 'دانە',
    unitEn: 'pcs',
    minStockAlert: '5',
    barcode: '',
  });

  // Calculate totals
  const totalStockCount = items.reduce((sum, item) => sum + item.stockQuantity, 0);
  const totalInventoryCapital = items.reduce(
    (sum, item) => sum + item.buyPrice * item.stockQuantity,
    0
  );
  const lowStockCount = items.filter((item) => item.stockQuantity <= item.minStockAlert).length;
  const totalExpensesAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      item.nameKu.toLowerCase().includes(query) ||
      item.nameEn.toLowerCase().includes(query) ||
      item.code.toLowerCase().includes(query) ||
      (item.barcode && item.barcode.includes(query));

    return matchesCategory && matchesSearch;
  });

  const handleOpenEdit = (item: Item) => {
    setEditingItem(item);
    setItemForm({
      nameKu: item.nameKu,
      nameEn: item.nameEn,
      categoryId: item.categoryId,
      buyPrice: item.buyPrice.toString(),
      sellPrice: item.sellPrice.toString(),
      stockQuantity: item.stockQuantity.toString(),
      unitKu: item.unitKu,
      unitEn: item.unitEn,
      minStockAlert: item.minStockAlert.toString(),
      barcode: item.barcode || '',
    });
    setIsAddItemOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.nameKu.trim()) return;

    const buyPrice = parseFloat(itemForm.buyPrice) || 0;
    const sellPrice = parseFloat(itemForm.sellPrice) || 0;
    const stockQuantity = parseInt(itemForm.stockQuantity, 10) || 0;
    const minStockAlert = parseInt(itemForm.minStockAlert, 10) || 5;

    if (editingItem) {
      updateItem({
        ...editingItem,
        nameKu: itemForm.nameKu,
        nameEn: itemForm.nameEn || itemForm.nameKu,
        categoryId: itemForm.categoryId,
        buyPrice,
        sellPrice,
        stockQuantity,
        unitKu: itemForm.unitKu,
        unitEn: itemForm.unitEn,
        minStockAlert,
        barcode: itemForm.barcode,
      });
    } else {
      addItem({
        nameKu: itemForm.nameKu,
        nameEn: itemForm.nameEn || itemForm.nameKu,
        categoryId: itemForm.categoryId,
        buyPrice,
        sellPrice,
        stockQuantity,
        unitKu: itemForm.unitKu,
        unitEn: itemForm.unitEn,
        minStockAlert,
        barcode: itemForm.barcode,
      });
    }

    setIsAddItemOpen(false);
    setEditingItem(null);
    setItemForm({
      nameKu: '',
      nameEn: '',
      categoryId: categories[0]?.id || 'cat-1',
      buyPrice: '',
      sellPrice: '',
      stockQuantity: '',
      unitKu: 'دانە',
      unitEn: 'pcs',
      minStockAlert: '5',
      barcode: '',
    });
  };

  const [newCatNameKu, setNewCatNameKu] = useState('');
  const [newCatNameEn, setNewCatNameEn] = useState('');

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatNameKu.trim()) return;
    addCategory({
      nameKu: newCatNameKu.trim(),
      nameEn: newCatNameEn.trim() || newCatNameKu.trim(),
    });
    setNewCatNameKu('');
    setNewCatNameEn('');
  };

  return (
    <div className="pb-24 pt-3 px-3 sm:px-4 max-w-4xl mx-auto space-y-4">
      {/* Top Warehouse Header Card */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/90 space-y-4">
        {/* Sub-tabs header: کۆی گشتی کاڵاکان (10) vs خەرجییەکان (3) */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <button
            onClick={() => setActiveSubTab('items')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              activeSubTab === 'items'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>کۆی گشتی کاڵاکان ({items.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('expenses')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              activeSubTab === 'expenses'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>خەرجییەکان ({expenses.length})</span>
          </button>
        </div>

        {activeSubTab === 'items' ? (
          <>
            {/* KPI Cards in Warehouse matching video */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              {/* Total Inventory Value */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex flex-col justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  بەهای سەرمایەی کاڵا
                </span>
                <span className="text-xl sm:text-2xl font-black text-blue-700 tracking-tight mt-1">
                  {formatMoney(totalInventoryCapital)}
                </span>
              </div>

              {/* Low Stock Alert */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex flex-col justify-between">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  ئاگاداری کەمی کاڵا
                </span>
                <span className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight mt-1">
                  {lowStockCount}
                </span>
              </div>
            </div>

            {/* Action Buttons: Add Item & Manage Categories */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  setEditingItem(null);
                  setItemForm({
                    nameKu: '',
                    nameEn: '',
                    categoryId: categories[0]?.id || 'cat-1',
                    buyPrice: '',
                    sellPrice: '',
                    stockQuantity: '',
                    unitKu: 'دانە',
                    unitEn: 'pcs',
                    minStockAlert: '5',
                    barcode: '',
                  });
                  setIsAddItemOpen(true);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ زیادکردنی کاڵا</span>
              </button>

              <button
                onClick={() => setIsCategoryModalOpen(true)}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold border border-slate-200 transition-all cursor-pointer"
              >
                <Layers className="w-4 h-4 text-slate-500" />
                <span>دەستکاری جۆرەکان</span>
              </button>
            </div>

            {/* Search Input and Barcode Button */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="گەڕان بەدوای کالا یان کۆد..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-3 pr-9 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-xs sm:text-sm focus:outline-hidden transition-all placeholder:text-slate-400"
                />
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                onClick={() => setIsBarcodeCheckerOpen(true)}
                className="flex items-center gap-1 px-3 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                title="پشکنین و لێدانی بارکۆد"
              >
                <Barcode className="w-4 h-4" />
                <span>لێدان</span>
              </button>
            </div>

            {/* Category Pills horizontal scroll */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                هەموو کاڵاکان
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {language === 'ku' ? cat.nameKu : cat.nameEn}
                </button>
              ))}
            </div>
          </>
        ) : (
          /* Expenses Subtab summary & action */
          <div className="space-y-3 pt-1">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500">کۆی خەرجییەکان</span>
                <div className="text-2xl font-black text-rose-600 mt-0.5">
                  {formatMoney(totalExpensesAmount)}
                </div>
              </div>
              <button
                onClick={() => setIsExpenseModalOpen(true)}
                className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>+ تۆمارکردنی خەرجی</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {activeSubTab === 'items' ? (
        /* Items Cards List matching video */
        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-200">
              <Package className="w-12 h-12 mx-auto mb-2 text-slate-300 stroke-1" />
              <p className="text-sm font-semibold">هیچ کاڵایەک نەدۆزرایەوە</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const category = categories.find((c) => c.id === item.categoryId);
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 hover:border-blue-300 transition-all space-y-3"
                >
                  {/* Top card header: Code badge + Title + Category + Edit & Delete */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md font-mono">
                          {item.code}
                        </span>
                        <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">
                          {category?.nameKu || 'خۆراک'}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-800 text-sm sm:text-base leading-snug">
                        {item.nameKu}
                      </h3>
                    </div>

                    {/* Action buttons (Edit & Delete) */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        title="دەستکاری"
                        className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmItem(item)}
                        title="سڕینەوە"
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 3-column stats in bottom of card matching video */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                    {/* Buy price */}
                    <div className="bg-slate-50 rounded-xl p-2">
                      <div className="text-[11px] font-medium text-slate-500">کڕین:</div>
                      <div className="text-xs sm:text-sm font-bold text-slate-700 mt-0.5">
                        {formatMoney(item.buyPrice)}
                      </div>
                    </div>

                    {/* Sell price */}
                    <div className="bg-blue-50/50 rounded-xl p-2 border border-blue-100/50">
                      <div className="text-[11px] font-medium text-blue-600">فرۆشتن:</div>
                      <div className="text-xs sm:text-sm font-extrabold text-blue-700 mt-0.5">
                        {formatMoney(item.sellPrice)}
                      </div>
                    </div>

                    {/* Stock quantity */}
                    <div className="bg-slate-50 rounded-xl p-2">
                      <div className="text-[11px] font-medium text-slate-500">بڕی کۆگا:</div>
                      <div className="text-xs sm:text-sm font-extrabold text-slate-800 mt-0.5">
                        {item.stockQuantity} {item.unitKu}
                      </div>
                    </div>
                  </div>

                  {/* Quick POS action button */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-400 font-mono">
                      بارکۆد: {item.barcode || '—'}
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
      ) : (
        /* Expenses List */
        <div className="space-y-3">
          {expenses.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-200">
              <Receipt className="w-12 h-12 mx-auto mb-2 text-slate-300 stroke-1" />
              <p className="text-sm font-semibold">هیچ خەرجییەک تۆمار نەکراوە</p>
            </div>
          ) : (
            expenses.map((exp) => (
              <div
                key={exp.id}
                className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md">
                      {exp.categoryKu}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{exp.date}</span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm sm:text-base">
                    {exp.titleKu}
                  </h4>
                  {exp.note && <p className="text-xs text-slate-500">{exp.note}</p>}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-base sm:text-lg font-black text-rose-600 whitespace-nowrap">
                    {formatMoney(exp.amount)}
                  </span>
                  <button
                    onClick={() => deleteExpense(exp.id)}
                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add / Edit Item Modal */}
      {isAddItemOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                {editingItem ? 'دەستکاری کاڵا' : 'زیادکردنی کاڵای نوێ'}
              </h3>
              <button
                onClick={() => {
                  setIsAddItemOpen(false);
                  setEditingItem(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ناوی کاڵا (کوردی) *
                </label>
                <input
                  type="text"
                  required
                  value={itemForm.nameKu}
                  onChange={(e) => setItemForm({ ...itemForm, nameKu: e.target.value })}
                  placeholder="وەک: برنجی کوردی پلە یەک"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    جۆری کاڵا (هاوپۆل)
                  </label>
                  <select
                    value={itemForm.categoryId}
                    onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:outline-hidden"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameKu}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    یەکەی پێوانە
                  </label>
                  <select
                    value={itemForm.unitKu}
                    onChange={(e) => setItemForm({ ...itemForm, unitKu: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:outline-hidden"
                  >
                    <option value="دانە">دانە</option>
                    <option value="کارتۆن">کارتۆن</option>
                    <option value="باکێت">باکێت</option>
                    <option value="کگم">کگم (کیلو)</option>
                    <option value="تەن">تەن</option>
                    <option value="مەتر">مەتر</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    نرخی کڕین (د.ع) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="any"
                    value={itemForm.buyPrice}
                    onChange={(e) => setItemForm({ ...itemForm, buyPrice: e.target.value })}
                    placeholder="12500"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    نرخی فرۆشتن (د.ع) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="any"
                    value={itemForm.sellPrice}
                    onChange={(e) => setItemForm({ ...itemForm, sellPrice: e.target.value })}
                    placeholder="13500"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-blue-600 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    بڕی هەبوو لە کۆگا
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={itemForm.stockQuantity}
                    onChange={(e) => setItemForm({ ...itemForm, stockQuantity: e.target.value })}
                    placeholder="50"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ئاگاداری کەمی بڕ
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={itemForm.minStockAlert}
                    onChange={(e) => setItemForm({ ...itemForm, minStockAlert: e.target.value })}
                    placeholder="5"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  کۆدی بارکۆد (ئارەزوومەندانە)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={itemForm.barcode}
                    onChange={(e) => setItemForm({ ...itemForm, barcode: e.target.value })}
                    placeholder="6221001001"
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:bg-white focus:border-blue-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setItemForm({
                        ...itemForm,
                        barcode: `622${Date.now().toString().slice(-7)}`,
                      });
                    }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700"
                  >
                    دروستکردنی بارکۆد
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddItemOpen(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  پاشگەزبوونەوە
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {editingItem ? 'پاشەکەوتکردنی دەستکاری' : 'زیادکردنی کاڵا'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Item Confirmation Modal */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-base text-slate-900">دڵنیایت لە سڕینەوە؟</h4>
              <p className="text-xs text-slate-500 mt-1">
                کاڵای «{deleteConfirmItem.nameKu}» بە تەواوی لە کۆگا دەسڕدرێتەوە.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmItem(null)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                نەخێر، پاشگەزبوونەوە
              </button>
              <button
                onClick={() => {
                  deleteItem(deleteConfirmItem.id);
                  setDeleteConfirmItem(null);
                }}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
              >
                بەڵێ، بسڕەوە
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Management Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900">دەستکاری جۆرەکان (هاوپۆلەکان)</h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of existing categories with Edit and Delete actions */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {categories.map((c) => {
                const count = items.filter((i) => i.categoryId === c.id).length;
                const isThisEditing = editingCatId === c.id;

                if (isThisEditing) {
                  return (
                    <div
                      key={c.id}
                      className="p-3 bg-blue-50/70 rounded-xl border border-blue-300 space-y-2"
                    >
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                            ناوی جۆر (کوردی)
                          </label>
                          <input
                            type="text"
                            value={editCatNameKu}
                            onChange={(e) => setEditCatNameKu(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold focus:outline-hidden focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                            English Name
                          </label>
                          <input
                            type="text"
                            value={editCatNameEn}
                            onChange={(e) => setEditCatNameEn(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold focus:outline-hidden focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingCatId(null)}
                          className="px-2.5 py-1 rounded-lg border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-100 cursor-pointer"
                        >
                          پاشگەزبوونەوە
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!editCatNameKu.trim()) return;
                            updateCategory({
                              ...c,
                              nameKu: editCatNameKu.trim(),
                              nameEn: editCatNameEn.trim() || editCatNameKu.trim(),
                            });
                            setEditingCatId(null);
                          }}
                          className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>پاشەکەوتکردن</span>
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Tag className="w-4 h-4 text-blue-600 shrink-0" />
                      <div className="truncate">
                        <span className="text-xs sm:text-sm font-bold text-slate-800">
                          {c.nameKu}
                        </span>
                        <span className="text-xs text-slate-400 mr-1.5">
                          ({c.nameEn})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-slate-500 font-mono bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        {count} کاڵا
                      </span>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCatId(c.id);
                          setEditCatNameKu(c.nameKu);
                          setEditCatNameEn(c.nameEn);
                        }}
                        className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors cursor-pointer"
                        title="دەستکاری"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (categories.length <= 1) {
                            setCategoryError('ناتوانیت هەموو جۆرەکان بسڕیتەوە! پێویستە لانیکەم یەک جۆر بمێنێتەوە.');
                            return;
                          }
                          setCategoryError(null);
                          setCategoryToDelete(c);
                        }}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                        title="سڕینەوە"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {categoryError && (
              <div className="bg-rose-50 border border-rose-300 rounded-xl p-2.5 text-xs text-rose-800 font-bold text-center">
                {categoryError}
              </div>
            )}

            {/* Add new category form */}
            <form onSubmit={handleAddCategory} className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700">زیادکردنی جۆری نوێ</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="ناوی جۆر (کوردی)"
                  value={newCatNameKu}
                  onChange={(e) => setNewCatNameKu(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap"
                >
                  زیادکردن +
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-base text-slate-900">
                سڕینەوەی جۆری «{categoryToDelete.nameKu}»
              </h4>
              <p className="text-xs text-slate-500 mt-1.5">
                {items.filter((i) => i.categoryId === categoryToDelete.id).length > 0
                  ? `ئەم جۆرە ${items.filter((i) => i.categoryId === categoryToDelete.id).length} کاڵای تێدایە. کاڵاکان بە شێوەی ئۆتۆماتیکی دەگوازرێنەوە بۆ جۆرێکی تر.`
                  : 'دڵنیایت لە سڕینەوەی ئەم جۆرە؟'}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                پاشگەزبوونەوە
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteCategory(categoryToDelete.id);
                  setCategoryToDelete(null);
                }}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
              >
                بەڵێ، بسڕەوە
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barcode Checker Modal */}
      {isBarcodeCheckerOpen && (
        <BarcodeCheckerModal
          isOpen={isBarcodeCheckerOpen}
          onClose={() => setIsBarcodeCheckerOpen(false)}
        />
      )}

      {/* Record Expense Modal */}
      {isExpenseModalOpen && (
        <ExpenseModal
          isOpen={isExpenseModalOpen}
          onClose={() => setIsExpenseModalOpen(false)}
        />
      )}
    </div>
  );
};
