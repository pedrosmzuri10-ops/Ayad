import React, { useState } from 'react';
import {
  Store,
  Plus,
  Trash2,
  Building2,
  Calendar,
  FileText,
  DollarSign,
  Package,
  Layers,
  X,
  CheckCircle,
  Receipt,
  PlusCircle,
  MinusCircle,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PurchaseInvoiceItem, Supplier } from '../types';
import { ExpenseModal } from './ExpenseModal';

export const PurchasesTab: React.FC = () => {
  const {
    purchases,
    suppliers,
    expenses,
    items,
    formatMoney,
    formatNumber,
    completePurchase,
    deleteExpense,
    addSupplier,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'invoices' | 'suppliers' | 'expenses'>('invoices');
  const [isNewPurchaseOpen, setIsNewPurchaseOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // New Purchase Form
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [purchaseItems, setPurchaseItems] = useState<
    { itemId: string; nameKu: string; quantity: number; unitPrice: number }[]
  >([]);
  const [purchasePaymentType, setPurchasePaymentType] = useState<'cash' | 'debt' | 'half'>('debt');
  const [cashPaidInput, setCashPaidInput] = useState<string>('0');
  const [purchaseDebtDate, setPurchaseDebtDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [purchaseDueDate, setPurchaseDueDate] = useState<string>('');
  const [purchaseNote, setPurchaseNote] = useState<string>('');
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  // Selected item to add to purchase
  const [itemToAddId, setItemToAddId] = useState<string>(items[0]?.id || '');
  const [itemToAddQty, setItemToAddQty] = useState<string>('10');
  const [itemToAddCost, setItemToAddCost] = useState<string>(items[0]?.buyPrice?.toString() || '0');

  // Summary calculations
  const totalPurchasesAmount = purchases.reduce((sum, p) => sum + p.total, 0);
  const totalSupplierDebt = suppliers.reduce((sum, s) => sum + s.debt, 0);
  const totalSuppliersCount = suppliers.length;

  const handleAddItemToPurchase = () => {
    const targetItem = items.find((i) => i.id === itemToAddId);
    if (!targetItem) return;

    setPurchaseError(null);
    const qty = parseInt(itemToAddQty, 10) || 1;
    const cost = parseFloat(itemToAddCost) || targetItem.buyPrice;

    const existing = purchaseItems.find((pi) => pi.itemId === targetItem.id);
    if (existing) {
      setPurchaseItems((prev) =>
        prev.map((pi) =>
          pi.itemId === targetItem.id
            ? { ...pi, quantity: pi.quantity + qty, unitPrice: cost }
            : pi
        )
      );
    } else {
      setPurchaseItems((prev) => [
        ...prev,
        {
          itemId: targetItem.id,
          nameKu: targetItem.nameKu,
          quantity: qty,
          unitPrice: cost,
        },
      ]);
    }
  };

  const handleRemoveItemFromPurchase = (itemId: string) => {
    setPurchaseItems((prev) => prev.filter((pi) => pi.itemId !== itemId));
  };

  const purchaseSubtotal = purchaseItems.reduce(
    (sum, pi) => sum + pi.quantity * pi.unitPrice,
    0
  );

  const calculatedCashPaid =
    purchasePaymentType === 'cash'
      ? purchaseSubtotal
      : purchasePaymentType === 'debt'
      ? 0
      : parseFloat(cashPaidInput) || 0;

  const calculatedDebtAmount = Math.max(0, purchaseSubtotal - calculatedCashPaid);

  const handleSubmitPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (purchaseItems.length === 0) {
      setPurchaseError('تکایە لانیکەم یەک کاڵا زیادبکە بۆ پسوولەی کڕین!');
      return;
    }

    setPurchaseError(null);

    const supplier = suppliers.find((s) => s.id === selectedSupplierId) || suppliers[0];

    const formattedItems: PurchaseInvoiceItem[] = purchaseItems.map((pi) => ({
      itemId: pi.itemId,
      nameKu: pi.nameKu,
      quantity: pi.quantity,
      unitPrice: pi.unitPrice,
      total: pi.quantity * pi.unitPrice,
    }));

    completePurchase({
      supplierId: supplier.id,
      supplierName: supplier.name,
      items: formattedItems,
      total: purchaseSubtotal,
      cashPaid: calculatedCashPaid,
      debtAmount: calculatedDebtAmount,
      debtDate: calculatedDebtAmount > 0 ? purchaseDebtDate : undefined,
      dueDate: calculatedDebtAmount > 0 ? (purchaseDueDate.trim() || undefined) : undefined,
      note: purchaseNote || purchaseItems.map((pi) => `${pi.nameKu} (${pi.quantity})`).join('، '),
    });

    setIsNewPurchaseOpen(false);
    setPurchaseItems([]);
    setPurchaseNote('');
    setCashPaidInput('0');
    setPurchaseDebtDate(new Date().toISOString().split('T')[0]);
    setPurchaseDueDate('');
  };

  return (
    <div className="pb-24 pt-3 px-3 sm:px-4 max-w-4xl mx-auto space-y-4">
      {/* Top Header Card matching video */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/90 space-y-4">
        {/* Subtabs header: پسوولەکانی کڕین (1) | دابینکەران (2) | خەرجییەکان (3) */}
        <div className="flex items-center gap-1.5 border-b border-slate-100 pb-3 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveSubTab('invoices')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeSubTab === 'invoices'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>پسوولەکانی کڕین ({purchases.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('suppliers')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeSubTab === 'suppliers'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>دابینکەران ({suppliers.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('expenses')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeSubTab === 'expenses'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>خەرجییەکان ({expenses.length})</span>
          </button>
        </div>

        {/* 3 Summary Cards matching video */}
        <div className="space-y-2.5">
          {/* Card 1: کڕین */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 text-center">
            <span className="text-xs font-semibold text-slate-500">کڕین</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              {formatMoney(totalPurchasesAmount)}
            </div>
          </div>

          {/* Card 2: قەرزی کڕین */}
          <div className="bg-purple-50/70 border border-purple-200/80 rounded-2xl p-3.5 text-center">
            <span className="text-xs font-semibold text-purple-800">قەرزی کڕین</span>
            <div className="text-2xl sm:text-3xl font-black text-purple-700 tracking-tight mt-1">
              {formatMoney(totalSupplierDebt)}
            </div>
          </div>

          {/* Card 3: ژمارەی دابینکەران */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 text-center">
            <span className="text-xs font-semibold text-slate-500">ژمارەی دابینکەران</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight mt-1">
              {totalSuppliersCount}
            </div>
          </div>
        </div>

        {/* Action Button: + کڕینی نوێ */}
        <button
          onClick={() => {
            setPurchaseItems([]);
            setIsNewPurchaseOpen(true);
          }}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ کڕینی نوێ</span>
        </button>
      </div>

      {/* Subtab Content: Purchase Invoices List */}
      {activeSubTab === 'invoices' && (
        <div className="space-y-3">
          {purchases.map((pinv) => (
            <div
              key={pinv.id}
              className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/90 space-y-3 hover:border-blue-300 transition-all"
            >
              {/* Header: PINV number badge + Supplier Name + Date */}
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md font-mono">
                      {pinv.invoiceNumber}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{pinv.date}</span>
                  </div>
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                    {pinv.supplierName}
                  </h4>
                </div>
              </div>

              {/* Note or items preview */}
              {pinv.note && (
                <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
                  {pinv.note}
                </p>
              )}

              {/* Bottom stats: Total, Cash, Debt */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                <div className="bg-slate-50 rounded-xl p-2">
                  <div className="text-[11px] text-slate-500 font-semibold">کۆی کڕین:</div>
                  <div className="text-xs sm:text-sm font-black text-slate-800 mt-0.5">
                    {formatMoney(pinv.total)}
                  </div>
                </div>

                <div className="bg-emerald-50/60 rounded-xl p-2">
                  <div className="text-[11px] text-emerald-700 font-semibold">کاش دراو:</div>
                  <div className="text-xs sm:text-sm font-bold text-emerald-800 mt-0.5">
                    {formatMoney(pinv.cashPaid)}
                  </div>
                </div>

                <div className="bg-purple-50/60 rounded-xl p-2">
                  <div className="text-[11px] text-purple-700 font-semibold">قەرز ماوە:</div>
                  <div className="text-xs sm:text-sm font-black text-purple-800 mt-0.5">
                    {formatMoney(pinv.debtAmount)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subtab Content: Suppliers List */}
      {activeSubTab === 'suppliers' && (
        <div className="space-y-3">
          {suppliers.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/90 flex items-center justify-between gap-3"
            >
              <div>
                <h4 className="font-extrabold text-sm sm:text-base text-slate-900">{s.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{s.phone} • {s.address}</p>
              </div>

              <div className="text-left">
                <span className="text-[11px] text-slate-400">قەرزی کۆمپانیا:</span>
                <div className="text-sm sm:text-base font-black text-purple-700">
                  {formatMoney(s.debt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subtab Content: Expenses List */}
      {activeSubTab === 'expenses' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm sm:text-base text-slate-800">لیستی تەواوی خەرجییەکان</h3>
            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ تۆمارکردنی خەرجی</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {expenses.map((exp) => (
              <div
                key={exp.id}
                className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200 flex items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md">
                      {exp.categoryKu}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{exp.date}</span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm mt-1">{exp.titleKu}</h4>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base font-black text-rose-600">
                    {formatMoney(exp.amount)}
                  </span>
                  <button
                    onClick={() => deleteExpense(exp.id)}
                    className="p-1 rounded-md text-slate-300 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: New Purchase Invoice */}
      {isNewPurchaseOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                تۆمارکردنی پسوولەی کڕینی نوێ
              </h3>
              <button
                onClick={() => setIsNewPurchaseOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPurchase} className="space-y-3.5">
              {purchaseError && (
                <div className="bg-rose-50 border border-rose-300 rounded-xl p-2.5 flex items-center gap-2 text-rose-800 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{purchaseError}</span>
                </div>
              )}

              {/* Supplier Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  هەڵبژاردنی کۆمپانیا یان دابینکەر *
                </label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (قەرزی ماوە: {formatMoney(s.debt)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Add item to invoice line */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  زیادکردنی کاڵا بۆ پسوولەی کڕین
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-3">
                    <select
                      value={itemToAddId}
                      onChange={(e) => {
                        setItemToAddId(e.target.value);
                        const it = items.find((i) => i.id === e.target.value);
                        if (it) setItemToAddCost(it.buyPrice.toString());
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    >
                      {items.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.code} - {i.nameKu}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500">بڕ (دانە/کارتۆن):</label>
                    <input
                      type="number"
                      min="1"
                      value={itemToAddQty}
                      onChange={(e) => setItemToAddQty(e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500">نرخی کڕینی یەکە (د.ع):</label>
                    <input
                      type="number"
                      min="0"
                      value={itemToAddCost}
                      onChange={(e) => setItemToAddCost(e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleAddItemToPurchase}
                      className="w-full py-1.5 px-3 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 cursor-pointer"
                    >
                      زیادکردن +
                    </button>
                  </div>
                </div>
              </div>

              {/* Items in purchase list */}
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {purchaseItems.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-2">هیچ کاڵایەک دانەنراوە</p>
                ) : (
                  purchaseItems.map((pi) => (
                    <div
                      key={pi.itemId}
                      className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-xs border border-slate-200"
                    >
                      <span className="font-bold text-slate-800">{pi.nameKu}</span>
                      <div className="flex items-center gap-3">
                        <span>
                          {pi.quantity} × {formatMoney(pi.unitPrice)} ={' '}
                          <strong className="text-blue-700">
                            {formatMoney(pi.quantity * pi.unitPrice)}
                          </strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItemFromPurchase(pi.itemId)}
                          className="text-rose-500 hover:text-rose-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Total & Payment method */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between font-black text-sm text-slate-800">
                  <span>کۆی گشتی کڕین:</span>
                  <span className="text-base text-blue-700">{formatMoney(purchaseSubtotal)}</span>
                </div>

                <div className="space-y-1 pt-1">
                  <label className="block text-xs font-bold text-slate-700">شێوازی پاردان:</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPurchasePaymentType('cash')}
                      className={`py-1.5 rounded-lg text-xs font-bold border ${
                        purchasePaymentType === 'cash'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      کاش
                    </button>
                    <button
                      type="button"
                      onClick={() => setPurchasePaymentType('debt')}
                      className={`py-1.5 rounded-lg text-xs font-bold border ${
                        purchasePaymentType === 'debt'
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      قەرز
                    </button>
                    <button
                      type="button"
                      onClick={() => setPurchasePaymentType('half')}
                      className={`py-1.5 rounded-lg text-xs font-bold border ${
                        purchasePaymentType === 'half'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      بەشێک کاش
                    </button>
                  </div>
                </div>

                {purchasePaymentType === 'half' && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="block text-[10px] text-slate-500">کاش دراو:</label>
                      <input
                        type="number"
                        value={cashPaidInput}
                        onChange={(e) => setCashPaidInput(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500">ماوەی قەرز:</label>
                      <div className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-purple-700">
                        {formatMoney(calculatedDebtAmount)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Debt Date & Repayment Due Date to Supplier */}
                {(purchasePaymentType === 'debt' || purchasePaymentType === 'half') && (
                  <div className="bg-purple-50/80 border border-purple-200 rounded-xl p-2.5 space-y-2 mt-2">
                    <span className="text-[11px] font-bold text-purple-900 block">
                      بەرواری قەرز و کاتی دانەوە بە کۆمپانیا:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">
                          بەرواری کڕین:
                        </label>
                        <input
                          type="date"
                          value={purchaseDebtDate}
                          onChange={(e) => setPurchaseDebtDate(e.target.value)}
                          className="w-full px-2 py-1 bg-white border border-purple-200 rounded-lg text-xs font-mono font-bold text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">
                          کاتی دانەوە (مەوعد):
                        </label>
                        <input
                          type="date"
                          min={purchaseDebtDate}
                          value={purchaseDueDate}
                          onChange={(e) => setPurchaseDueDate(e.target.value)}
                          className="w-full px-2 py-1 bg-white border border-purple-300 rounded-lg text-xs font-mono font-bold text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Note */}
              <div>
                <input
                  type="text"
                  placeholder="تێبینی بۆ سەر پسوولەی کڕین (ئارەزوومەندانە)..."
                  value={purchaseNote}
                  onChange={(e) => setPurchaseNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Form buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewPurchaseOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
                >
                  پاشگەزبوونەوە
                </button>
                <button
                  type="submit"
                  disabled={purchaseItems.length === 0}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer disabled:bg-slate-300"
                >
                  تەواوکردنی کڕین
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {isExpenseModalOpen && (
        <ExpenseModal
          isOpen={isExpenseModalOpen}
          onClose={() => setIsExpenseModalOpen(false)}
        />
      )}
    </div>
  );
};
