import React, { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Search,
  Barcode,
  CheckCircle2,
  Printer,
  User,
  UserPlus,
  CreditCard,
  Banknote,
  DollarSign,
  Package,
  Layers,
  ArrowRight,
  Info,
  Calendar,
  Clock,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PaymentMethod } from '../types';

export const PosTab: React.FC = () => {
  const {
    items,
    categories,
    customers,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    completeSale,
    formatMoney,
    formatNumber,
    addCustomer,
    setViewingInvoice,
  } = useApp();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('cust-cash');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashPaidInput, setCashPaidInput] = useState<string>('');
  const [debtDate, setDebtDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState<string>('');
  const [invoiceNote, setInvoiceNote] = useState<string>('');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleQuickDueDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setDueDate(d.toISOString().split('T')[0]);
  };

  // Quick item search & category filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerAddress, setNewCustomerAddress] = useState('');
  const [newCustomerGuarantorName, setNewCustomerGuarantorName] = useState('');
  const [newCustomerGuarantorPhone, setNewCustomerGuarantorPhone] = useState('');

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const grandTotal = Math.max(0, subtotal - discountAmount);

  // If half-cash, calculate cash vs debt
  const cashPaidVal =
    paymentMethod === 'half'
      ? cashPaidInput !== ''
        ? parseFloat(cashPaidInput) || 0
        : Math.round(grandTotal / 2)
      : paymentMethod === 'cash'
      ? grandTotal
      : 0;

  const debtVal = Math.max(0, grandTotal - cashPaidVal);

  const selectedCustomer =
    customers.find((c) => c.id === selectedCustomerId) || customers[0];

  // Filter items for quick selector
  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      item.nameKu.toLowerCase().includes(q) ||
      item.code.toLowerCase().includes(q) ||
      (item.barcode && item.barcode.includes(q));
    return matchesCategory && matchesSearch;
  });

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim()) return;

    const created = addCustomer({
      name: newCustomerName.trim(),
      phone: newCustomerPhone.trim() || '-',
      address: newCustomerAddress.trim() || '-',
      guarantorName: newCustomerGuarantorName.trim() || undefined,
      guarantorPhone: newCustomerGuarantorPhone.trim() || undefined,
      debt: 0,
    });
    setSelectedCustomerId(created.id);
    setIsAddCustomerOpen(false);
    setNewCustomerName('');
    setNewCustomerPhone('');
    setNewCustomerAddress('');
    setNewCustomerGuarantorName('');
    setNewCustomerGuarantorPhone('');
    setCheckoutError(null);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;

    // Warning if debt chosen for guest cash customer
    if (
      (paymentMethod === 'debt' || paymentMethod === 'half') &&
      selectedCustomerId === 'cust-cash'
    ) {
      setCheckoutError('تکایە ناوی موشتەری دیاریبکە بۆ فرۆشتنی قەرز! ناتوانیت قەرز بە موشتەری گشتی بدەیت.');
      return;
    }

    setCheckoutError(null);
    const isDebtSale = paymentMethod === 'debt' || paymentMethod === 'half';

    const completedInvoice = completeSale({
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      items: cart,
      discountPercent,
      paymentMethod,
      cashPaid: paymentMethod === 'half' ? cashPaidVal : undefined,
      debtDate: isDebtSale ? (debtDate || new Date().toISOString().split('T')[0]) : undefined,
      dueDate: isDebtSale ? (dueDate.trim() || undefined) : undefined,
      note: invoiceNote,
    });

    // Reset local form states
    setDiscountPercent(0);
    setInvoiceNote('');
    setCashPaidInput('');
    setPaymentMethod('cash');
    setDebtDate(new Date().toISOString().split('T')[0]);
    setDueDate('');

    // Trigger printable receipt modal
    setViewingInvoice(completedInvoice);
  };

  return (
    <div className="pb-24 pt-3 px-3 sm:px-4 max-w-5xl mx-auto space-y-4">
      {/* Top Invoice Card matching video */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/90 space-y-4">
        {/* Customer Selector dropdown + New customer */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-blue-600" />
            <span>موشتەری:</span>
          </label>

          <div className="flex items-center gap-2">
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="flex-1 py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.debt > 0 ? `(قەرزی پێشوو: ${formatMoney(c.debt)})` : ''}
                </option>
              ))}
            </select>

            <button
              onClick={() => setIsAddCustomerOpen(true)}
              title="موشتەری نوێ"
              className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded-xl transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          </div>

          {/* Guarantor Info for selected customer */}
          {selectedCustomer.guarantorName && (
            <div className="flex items-center gap-1.5 text-xs text-blue-800 bg-blue-50/90 px-2.5 py-1.5 rounded-xl border border-blue-200">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="font-bold">کەفیل (دەستەبەر): {selectedCustomer.guarantorName}</span>
              {selectedCustomer.guarantorPhone && (
                <span className="font-mono text-[11px] text-blue-700 font-bold">
                  • {selectedCustomer.guarantorPhone}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Invoice Items or Empty State */}
        <div className="min-h-[140px] border border-dashed border-slate-200 rounded-xl p-3 flex flex-col justify-center">
          {cart.length === 0 ? (
            <div className="text-center py-6 text-slate-400 space-y-2">
              <ShoppingCart className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
              <p className="text-xs sm:text-sm font-bold text-slate-500">
                پسوولەکە بەتاڵە، کلیک لە کاڵاکان بکە
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {cart.map((cartItem) => (
                <div
                  key={cartItem.itemId}
                  className="bg-slate-50 hover:bg-slate-100/80 p-2.5 rounded-xl border border-slate-200/80 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                        {cartItem.itemCode}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                        {cartItem.nameKu}
                      </h4>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {formatMoney(cartItem.sellPrice)} × {cartItem.quantity} {cartItem.unitKu}
                    </div>
                  </div>

                  {/* Quantity adjustment buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateCartQuantity(cartItem.itemId, cartItem.quantity - 1)}
                      className="w-6 h-6 rounded-md bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-slate-800 min-w-5 text-center">
                      {cartItem.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(cartItem.itemId, cartItem.quantity + 1)}
                      className="w-6 h-6 rounded-md bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>

                    <div className="text-xs sm:text-sm font-black text-blue-700 min-w-[70px] text-left">
                      {formatMoney(cartItem.total)}
                    </div>

                    <button
                      onClick={() => removeFromCart(cartItem.itemId)}
                      className="p-1 rounded-md text-rose-500 hover:bg-rose-50 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pricing Summary (کۆی پێش داشکاندن، % داشکاندن، کۆی گشتی) */}
        <div className="bg-slate-50 rounded-xl p-3 space-y-2 border border-slate-200/80">
          <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-600">
            <span>کۆی پێش داشکاندن:</span>
            <span className="font-bold text-slate-800">{formatMoney(subtotal)}</span>
          </div>

          <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-600">
            <span className="flex items-center gap-1">
              <span>% داشکاندن:</span>
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="100"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                className="w-16 py-1 px-2 text-center bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-hidden focus:border-blue-500"
              />
              <span className="text-xs text-rose-600 font-bold">
                -{formatMoney(discountAmount)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <span className="text-sm sm:text-base font-black text-slate-800">کۆی گشتی:</span>
            <span className="text-xl sm:text-2xl font-black text-blue-700">
              {formatMoney(grandTotal)}
            </span>
          </div>
        </div>

        {/* Payment Method Selection Pills matching video */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">شێوازی باردان:</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod('cash')}
              className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                paymentMethod === 'cash'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              کاش
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('debt')}
              className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                paymentMethod === 'debt'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              قەرز
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('half')}
              className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                paymentMethod === 'half'
                  ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              نیوە کاش و نیوە قەرز
            </button>
          </div>
        </div>

        {/* If half payment selected: cash paid vs debt */}
        {paymentMethod === 'half' && (
          <div className="bg-purple-50/60 border border-purple-200 rounded-xl p-3 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-purple-900 mb-1">
                بڕی کاش دراو:
              </label>
              <input
                type="number"
                min="0"
                max={grandTotal}
                value={cashPaidInput}
                placeholder={Math.round(grandTotal / 2).toString()}
                onChange={(e) => setCashPaidInput(e.target.value)}
                className="w-full py-1.5 px-2 bg-white border border-purple-300 rounded-lg text-xs sm:text-sm font-bold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-purple-900 mb-1">
                ماوەی قەرز:
              </label>
              <div className="py-1.5 px-2 bg-white/70 border border-purple-200 rounded-lg text-xs sm:text-sm font-black text-rose-600">
                {formatMoney(debtVal)}
              </div>
            </div>
          </div>
        )}

        {/* Debt Dates: بەرواری وەرگرتنی قەرز & بەرواری دانەوە (کەی قەرزەکەی دەهێنێتەوە) */}
        {(paymentMethod === 'debt' || paymentMethod === 'half') && (
          <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between border-b border-amber-200/70 pb-2">
              <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-600" />
                <span>دیاریکردنی بەرواری قەرز و کاتی دانەوە</span>
              </span>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-100/90 px-2.5 py-0.5 rounded-lg font-mono">
                {formatMoney(paymentMethod === 'debt' ? grandTotal : debtVal)} قەرز
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* بەرواری بردن (قەرز) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>بەرواری وەرگرتنی قەرز (کەی بردوویەتی):</span>
                </label>
                <input
                  type="date"
                  value={debtDate}
                  onChange={(e) => setDebtDate(e.target.value)}
                  className="w-full py-2 px-2.5 bg-white border border-amber-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              {/* بەرواری دانەوە (کەی دەهێنێتەوە) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  <span>بەرواری دانەوە (کەی قەرزەکەی دەهێنێتەوە):</span>
                </label>
                <input
                  type="date"
                  value={dueDate}
                  min={debtDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full py-2 px-2.5 bg-white border border-amber-300 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>

            {/* دوگمەکانی خێرای دیاریکردنی کاتی دانەوە */}
            <div className="pt-1">
              <span className="text-[11px] font-bold text-amber-900 block mb-1.5">
                دەستنیشانکردنی خێرای کاتی دانەوە:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickDueDate(7)}
                  className="px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-200 rounded-lg text-xs font-bold text-amber-900 transition-colors cursor-pointer"
                >
                  +٧ ڕۆژ
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDueDate(15)}
                  className="px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-200 rounded-lg text-xs font-bold text-amber-900 transition-colors cursor-pointer"
                >
                  +١٥ ڕۆژ
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDueDate(30)}
                  className="px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-200 rounded-lg text-xs font-bold text-amber-900 transition-colors cursor-pointer"
                >
                  +١ مانگ
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDueDate(60)}
                  className="px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-200 rounded-lg text-xs font-bold text-amber-900 transition-colors cursor-pointer"
                >
                  +٢ مانگ
                </button>
                {dueDate && (
                  <button
                    type="button"
                    onClick={() => setDueDate('')}
                    className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-bold text-rose-700 transition-colors cursor-pointer mr-auto"
                  >
                    پاککردنەوەی بەرواری دانەوە
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Invoice Note input */}
        <div>
          <input
            type="text"
            value={invoiceNote}
            onChange={(e) => setInvoiceNote(e.target.value)}
            placeholder="تێبینی بۆ سەر پسوولە (ئارەزوومەندانە)..."
            className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        {/* Checkout Error Message */}
        {checkoutError && (
          <div className="bg-rose-50 border border-rose-300 rounded-xl p-3 flex items-center gap-2 text-rose-800 text-xs font-bold">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{checkoutError}</span>
          </div>
        )}

        {/* Big Complete Sale & Print Button */}
        <button
          onClick={handleCheckout}
          disabled={cart.length === 0}
          className={`w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-black shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
            cart.length > 0
              ? 'bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/25 active:scale-98'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
          }`}
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>تەواوکردنی فرۆشتن & چاپکردنی پسوولە</span>
        </button>
      </div>

      {/* Quick Add Items Catalog in POS */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/90 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm sm:text-base text-slate-800 flex items-center gap-1.5">
            <Package className="w-4 h-4 text-blue-600" />
            <span>هەڵبژاردنی خێرای کاڵاکان</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {filteredItems.length} کاڵا
          </span>
        </div>

        {/* Search bar & barcode scanner */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="گەڕان بەدوای کالا یان کۆد..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-8 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs focus:border-blue-500 focus:outline-hidden transition-all"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          <button
            onClick={() => {
              if (items.length > 0) {
                const randomItem = items[Math.floor(Math.random() * items.length)];
                addToCart(randomItem, 1);
              }
            }}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
          >
            <Barcode className="w-3.5 h-3.5" />
            <span>لێدان</span>
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            هەموو
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === catId(c.id)
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c.nameKu}
            </button>
          ))}
        </div>

        {/* Item Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
          {filteredItems.map((item) => {
            const inCart = cart.find((c) => c.itemId === item.id);
            return (
              <button
                key={item.id}
                onClick={() => addToCart(item, 1)}
                className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between h-28 relative group cursor-pointer active:scale-97 ${
                  inCart
                    ? 'border-blue-500 bg-blue-50/40 shadow-xs'
                    : 'border-slate-200 bg-slate-50/50 hover:border-blue-300 hover:bg-white'
                }`}
              >
                {inCart && (
                  <span className="absolute top-1.5 left-1.5 bg-blue-600 text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                    {inCart.quantity}
                  </span>
                )}
                <div>
                  <span className="text-[10px] font-mono text-slate-400">{item.code}</span>
                  <h4 className="font-bold text-xs text-slate-800 line-clamp-2 leading-snug">
                    {item.nameKu}
                  </h4>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <span className="text-xs font-black text-blue-700">
                    {formatMoney(item.sellPrice)}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {item.stockQuantity} {item.unitKu}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Add New Customer Modal */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">زیادکردنی موشتەری نوێ</h3>
            <form onSubmit={handleCreateCustomer} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ناوی موشتەری *
                </label>
                <input
                  type="text"
                  required
                  placeholder="وەک: کاک هێمن عەلی"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ژمارەی مۆبایل
                </label>
                <input
                  type="text"
                  placeholder="0770 123 4567"
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ناونیشان
                </label>
                <input
                  type="text"
                  placeholder="سلێمانی، بەختیاری"
                  value={newCustomerAddress}
                  onChange={(e) => setNewCustomerAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Guarantor Info (کەفیل) */}
              <div className="bg-indigo-50/70 border border-indigo-200/90 rounded-2xl p-2.5 space-y-2">
                <span className="text-[11px] font-bold text-indigo-950 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>زانیاری کەفیل (ناوی کەفیل و مۆبایل):</span>
                </span>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                    ناوی کەفیل (کەسی دەستەبەر)
                  </label>
                  <input
                    type="text"
                    placeholder="وەک: کاک هێمن ئەحمەد"
                    value={newCustomerGuarantorName}
                    onChange={(e) => setNewCustomerGuarantorName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-indigo-200 rounded-xl text-xs focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                    ژمارەی مۆبایلی کەفیل
                  </label>
                  <input
                    type="text"
                    placeholder="0770 000 0000"
                    value={newCustomerGuarantorPhone}
                    onChange={(e) => setNewCustomerGuarantorPhone(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-indigo-200 rounded-xl text-xs font-mono focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCustomerOpen(false)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 cursor-pointer"
                >
                  پاشگەزبوونەوە
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
                >
                  پاشەکەوتکردن (OK)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

function catId(id: string) {
  return id;
}
