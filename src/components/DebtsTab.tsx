import React, { useState } from 'react';
import {
  Users,
  Building2,
  History,
  Phone,
  MapPin,
  Plus,
  Trash2,
  Edit2,
  ArrowDownLeft,
  ArrowUpRight,
  HandCoins,
  CheckCircle,
  X,
  CreditCard,
  DollarSign,
  Wallet,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Customer, Supplier } from '../types';
import { PaymentModal } from './PaymentModal';

export const DebtsTab: React.FC = () => {
  const {
    customers,
    suppliers,
    payments,
    formatMoney,
    formatNumber,
    deleteCustomer,
    updateCustomer,
    addCustomer,
    deleteSupplier,
    updateSupplier,
    addSupplier,
    deletePayment,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'customers' | 'suppliers' | 'history'>('customers');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentModalDefaults, setPaymentModalDefaults] = useState<{
    type: 'received' | 'paid';
    partyType: 'customer' | 'supplier';
    partyId?: string;
  }>({
    type: 'received',
    partyType: 'customer',
  });

  // Edit / Add Customer State
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    address: '',
    debt: '0',
  });

  // Edit / Add Supplier State
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    phone: '',
    address: '',
    debt: '0',
  });

  // Calculated totals
  const totalCustomerDebt = customers.reduce((sum, c) => sum + c.debt, 0);
  const totalSupplierDebt = suppliers.reduce((sum, s) => sum + s.debt, 0);
  const totalReceived = payments
    .filter((p) => p.type === 'received')
    .reduce((sum, p) => sum + p.amount, 0);
  const totalPaid = payments
    .filter((p) => p.type === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  // Subtab counts
  const customersWithDebtCount = customers.filter((c) => c.debt > 0).length;
  const suppliersWithDebtCount = suppliers.filter((s) => s.debt > 0).length;

  const handleOpenAddCustomer = () => {
    setEditingCustomer(null);
    setCustomerForm({ name: '', phone: '', address: '', debt: '0' });
    setIsCustomerModalOpen(true);
  };

  const handleOpenEditCustomer = (c: Customer) => {
    setEditingCustomer(c);
    setCustomerForm({
      name: c.name,
      phone: c.phone,
      address: c.address,
      debt: c.debt.toString(),
    });
    setIsCustomerModalOpen(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerForm.name.trim()) return;
    const debt = parseFloat(customerForm.debt) || 0;

    if (editingCustomer) {
      updateCustomer({
        ...editingCustomer,
        name: customerForm.name.trim(),
        phone: customerForm.phone.trim() || '-',
        address: customerForm.address.trim() || '-',
        debt,
      });
    } else {
      addCustomer({
        name: customerForm.name.trim(),
        phone: customerForm.phone.trim() || '-',
        address: customerForm.address.trim() || '-',
        debt,
      });
    }
    setIsCustomerModalOpen(false);
  };

  const handleOpenAddSupplier = () => {
    setEditingSupplier(null);
    setSupplierForm({ name: '', phone: '', address: '', debt: '0' });
    setIsSupplierModalOpen(true);
  };

  const handleOpenEditSupplier = (s: Supplier) => {
    setEditingSupplier(s);
    setSupplierForm({
      name: s.name,
      phone: s.phone,
      address: s.address,
      debt: s.debt.toString(),
    });
    setIsSupplierModalOpen(true);
  };

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierForm.name.trim()) return;
    const debt = parseFloat(supplierForm.debt) || 0;

    if (editingSupplier) {
      updateSupplier({
        ...editingSupplier,
        name: supplierForm.name.trim(),
        phone: supplierForm.phone.trim() || '-',
        address: supplierForm.address.trim() || '-',
        debt,
      });
    } else {
      addSupplier({
        name: supplierForm.name.trim(),
        phone: supplierForm.phone.trim() || '-',
        address: supplierForm.address.trim() || '-',
        debt,
      });
    }
    setIsSupplierModalOpen(false);
  };

  const handleOpenReceiveDebt = (customerId?: string) => {
    setPaymentModalDefaults({
      type: 'received',
      partyType: 'customer',
      partyId: customerId,
    });
    setIsPaymentModalOpen(true);
  };

  const handleOpenPayDebt = (supplierId?: string) => {
    setPaymentModalDefaults({
      type: 'paid',
      partyType: 'supplier',
      partyId: supplierId,
    });
    setIsPaymentModalOpen(true);
  };

  return (
    <div className="pb-24 pt-3 px-3 sm:px-4 max-w-4xl mx-auto space-y-4">
      {/* Top Card: Subtabs & 4 KPI cards matching video */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/90 space-y-4">
        {/* Header Title & Subtabs */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-600" />
            <h2 className="font-extrabold text-base sm:text-lg text-slate-900">
              قەرزەکان و باردان
            </h2>
          </div>

          {/* 3 Sub-tabs pills */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setActiveSubTab('customers')}
              className={`py-2 px-1 rounded-lg text-xs font-bold transition-all text-center cursor-pointer truncate ${
                activeSubTab === 'customers'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              قەرزی موشتەرییەکان ({customersWithDebtCount})
            </button>
            <button
              onClick={() => setActiveSubTab('suppliers')}
              className={`py-2 px-1 rounded-lg text-xs font-bold transition-all text-center cursor-pointer truncate ${
                activeSubTab === 'suppliers'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              قەرزی کۆمپانیاکان ({suppliersWithDebtCount})
            </button>
            <button
              onClick={() => setActiveSubTab('history')}
              className={`py-2 px-1 rounded-lg text-xs font-bold transition-all text-center cursor-pointer truncate ${
                activeSubTab === 'history'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              مێژووی باردان و وەرگرتن
            </button>
          </div>
        </div>

        {/* 4 Summary KPI Cards in exactly 2 rows matching video */}
        <div className="space-y-2.5">
          {/* Card 1: قەرزی (موشتەری) */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 text-center">
            <span className="text-xs font-semibold text-amber-800">قەرزی (موشتەری)</span>
            <div className="text-2xl sm:text-3xl font-black text-amber-700 tracking-tight mt-1">
              {formatMoney(totalCustomerDebt)}
            </div>
          </div>

          {/* Card 2: بارە وەرگرتن (پارە وەرگرتن) */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5 text-center">
            <span className="text-xs font-semibold text-emerald-800">پارە وەرگرتن</span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight mt-1">
              {formatMoney(totalReceived)}
            </div>
          </div>

          {/* Card 3: قەرزی کڕین (کۆمپانیاکان) */}
          <div className="bg-purple-50/70 border border-purple-200/80 rounded-2xl p-3.5 text-center">
            <span className="text-xs font-semibold text-purple-800">قەرزی کڕین (کۆمپانیاکان)</span>
            <div className="text-2xl sm:text-3xl font-black text-purple-700 tracking-tight mt-1">
              {formatMoney(totalSupplierDebt)}
            </div>
          </div>

          {/* Card 4: پاردان */}
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-3.5 text-center">
            <span className="text-xs font-semibold text-blue-800">پاردان</span>
            <div className="text-2xl sm:text-3xl font-black text-blue-700 tracking-tight mt-1">
              {formatMoney(totalPaid)}
            </div>
          </div>
        </div>
      </div>

      {/* Subtab 1: Customer Debts List */}
      {activeSubTab === 'customers' && (
        <div className="space-y-3">
          {/* Header & Quick Action */}
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm sm:text-base text-slate-800">
              لیستی تەواوی موشتەرییە قەرزدارەکان
            </h3>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleOpenAddCustomer}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ موشتەری نوێ</span>
              </button>

              <button
                onClick={() => handleOpenReceiveDebt()}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                <HandCoins className="w-3.5 h-3.5" />
                <span>وەرگرتنی پارەی قەرز</span>
              </button>
            </div>
          </div>

          {/* Customer Cards matching video */}
          <div className="space-y-3">
            {customers.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/90 space-y-3 hover:border-blue-300 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                      {c.name}
                    </h4>
                    {c.phone !== '-' && (
                      <div className="flex items-center gap-1 text-xs text-slate-500 font-mono">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{c.phone}</span>
                      </div>
                    )}
                    {c.address !== '-' && (
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{c.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Edit & Delete actions */}
                  {c.id !== 'cust-cash' && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditCustomer(c)}
                        className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 cursor-pointer"
                        title="دەستکاری"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteCustomer(c.id)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer"
                        title="سڕینەوە"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Bottom line: Remaining Debt & Receive Payment button */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400">قەرزی ماوە:</span>
                    <div
                      className={`text-base sm:text-lg font-black ${
                        c.debt > 0 ? 'text-amber-600' : 'text-slate-400'
                      }`}
                    >
                      {formatMoney(c.debt)}
                    </div>
                  </div>

                  {c.debt > 0 && (
                    <button
                      onClick={() => handleOpenReceiveDebt(c.id)}
                      className="flex items-center gap-1 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                    >
                      <HandCoins className="w-3.5 h-3.5" />
                      <span>لا وەرگرتن</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subtab 2: Supplier Debts List */}
      {activeSubTab === 'suppliers' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm sm:text-base text-slate-800">
              قەرزی ماوەی کۆمپانیاکان و دابینکەران
            </h3>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleOpenAddSupplier}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ زیادکردنی کۆمپانیا</span>
              </button>

              <button
                onClick={() => handleOpenPayDebt()}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>پاردانی قەرز</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {suppliers.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/90 space-y-3 hover:border-purple-300 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                      {s.name}
                    </h4>
                    {s.phone && (
                      <div className="flex items-center gap-1 text-xs text-slate-500 font-mono">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{s.phone}</span>
                      </div>
                    )}
                    {s.address && (
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{s.address}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditSupplier(s)}
                      className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteSupplier(s.id)}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400">قەرزی کۆمپانیا:</span>
                    <div
                      className={`text-base sm:text-lg font-black ${
                        s.debt > 0 ? 'text-purple-600' : 'text-slate-400'
                      }`}
                    >
                      {formatMoney(s.debt)}
                    </div>
                  </div>

                  {s.debt > 0 && (
                    <button
                      onClick={() => handleOpenPayDebt(s.id)}
                      className="flex items-center gap-1 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>پاردان</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subtab 3: History of Payments & Receipts matching video */}
      {activeSubTab === 'history' && (
        <div className="space-y-3">
          <h3 className="font-bold text-sm sm:text-base text-slate-800">
            مێژووی تەواوی وەرگرتن و دانەوەی قەرزەکان
          </h3>

          <div className="space-y-2.5">
            {payments.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-200">
                <History className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-1" />
                <p className="text-xs sm:text-sm font-semibold">هیچ مێژوویەک تۆمار نەکراوە</p>
              </div>
            ) : (
              payments.map((p) => {
                const isReceived = p.type === 'received';
                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200/90 flex items-center justify-between gap-3"
                  >
                    {/* Date */}
                    <div className="text-right min-w-[70px]">
                      <span className="text-xs font-mono font-bold text-slate-700 block">
                        {p.date}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {isReceived ? 'موشتەری' : 'کۆمپانیا'}
                      </span>
                    </div>

                    {/* Badge: پارە وەرگرتن / پاردان */}
                    <div>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                          isReceived
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}
                      >
                        {isReceived ? (
                          <>
                            <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                            <span>پارە وەرگرتن</span>
                          </>
                        ) : (
                          <>
                            <ArrowUpRight className="w-3 h-3 text-purple-600" />
                            <span>پاردان</span>
                          </>
                        )}
                      </span>
                    </div>

                    {/* Party Name */}
                    <div className="flex-1 truncate">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-800 truncate">
                        {p.partyName}
                      </h4>
                      {p.note && (
                        <p className="text-[11px] text-slate-400 truncate">{p.note}</p>
                      )}
                    </div>

                    {/* Amount & Delete */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm sm:text-base font-black whitespace-nowrap ${
                          isReceived ? 'text-emerald-700' : 'text-purple-700'
                        }`}
                      >
                        {formatMoney(p.amount)}
                      </span>
                      <button
                        onClick={() => deletePayment(p.id)}
                        className="p-1 rounded-md text-slate-300 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                        title="سڕینەوە"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">
              {editingCustomer ? 'دەستکاری موشتەری' : 'زیادکردنی موشتەری نوێ'}
            </h3>
            <form onSubmit={handleSaveCustomer} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ناوی موشتەری *
                </label>
                <input
                  type="text"
                  required
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                  placeholder="وەک: کاک هێمن عەلی"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ژمارەی مۆبایل
                </label>
                <input
                  type="text"
                  value={customerForm.phone}
                  onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                  placeholder="0770 123 4567"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ناونیشان
                </label>
                <input
                  type="text"
                  value={customerForm.address}
                  onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                  placeholder="سلێمانی، بەختیاری"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  قەرزی سەرەتایی (د.ع)
                </label>
                <input
                  type="number"
                  min="0"
                  value={customerForm.debt}
                  onChange={(e) => setCustomerForm({ ...customerForm, debt: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-amber-700 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
                >
                  پاشگەزبوونەوە
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
                >
                  پاشەکەوتکردن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Supplier Modal */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">
              {editingSupplier ? 'دەستکاری کۆمپانیا' : 'زیادکردنی کۆمپانیای نوێ'}
            </h3>
            <form onSubmit={handleSaveSupplier} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ناوی کۆمپانیا یان دابینکەر *
                </label>
                <input
                  type="text"
                  required
                  value={supplierForm.name}
                  onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                  placeholder="وەک: کۆمپانیای ڕاوەند"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ژمارەی مۆبایل
                </label>
                <input
                  type="text"
                  value={supplierForm.phone}
                  onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                  placeholder="0770 123 4567"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ناونیشان
                </label>
                <input
                  type="text"
                  value={supplierForm.address}
                  onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                  placeholder="سلێمانی، ناوچەی پیشەسازی"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  قەرزی ماوەی کۆمپانیا (د.ع)
                </label>
                <input
                  type="number"
                  min="0"
                  value={supplierForm.debt}
                  onChange={(e) => setSupplierForm({ ...supplierForm, debt: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-purple-700 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(false)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
                >
                  پاشگەزبوونەوە
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold"
                >
                  پاشەکەوتکردن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Action Modal */}
      {isPaymentModalOpen && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          defaultType={paymentModalDefaults.type}
          defaultPartyType={paymentModalDefaults.partyType}
          defaultPartyId={paymentModalDefaults.partyId}
        />
      )}
    </div>
  );
};
