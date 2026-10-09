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
  Calendar,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Customer, Supplier, Invoice } from '../types';
import { PaymentModal } from './PaymentModal';

export const DebtsTab: React.FC = () => {
  const {
    customers,
    suppliers,
    payments,
    invoices,
    formatMoney,
    formatNumber,
    deleteCustomer,
    updateCustomer,
    addCustomer,
    setCustomerDueDate,
    deleteSupplier,
    updateSupplier,
    addSupplier,
    setSupplierDueDate,
    deletePayment,
    setViewingInvoice,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'customers' | 'suppliers' | 'history'>('customers');
  const [customerFilter, setCustomerFilter] = useState<'all' | 'debtors' | 'overdue' | 'dueSoon'>('debtors');
  const [customerSearch, setCustomerSearch] = useState('');
  const [supplierSearch, setSupplierSearch] = useState('');
  const [expandedCustomerInvoices, setExpandedCustomerInvoices] = useState<Record<string, boolean>>({});

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
    guarantorName: '',
    guarantorPhone: '',
    debt: '0',
    debtDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    debtNotes: '',
  });

  // Quick Due Date Change Modal State
  const [quickDueDateModal, setQuickDueDateModal] = useState<{
    isOpen: boolean;
    partyType: 'customer' | 'supplier';
    partyId: string;
    partyName: string;
    debtDate: string;
    dueDate: string;
  }>({
    isOpen: false,
    partyType: 'customer',
    partyId: '',
    partyName: '',
    debtDate: new Date().toISOString().split('T')[0],
    dueDate: '',
  });

  // Edit / Add Supplier State
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    phone: '',
    address: '',
    debt: '0',
    debtDate: new Date().toISOString().split('T')[0],
    dueDate: '',
  });

  // Helper to calculate due date status
  const getDueDateStatus = (dueDate?: string) => {
    if (!dueDate) {
      return {
        type: 'none',
        label: 'بەرواری دانەوە دیارینەکراوە',
        badgeClass: 'bg-slate-100 text-slate-500 border-slate-200',
        days: null,
      };
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        type: 'overdue',
        days: Math.abs(diffDays),
        label: `مەوعد بەسەرچووە! (${Math.abs(diffDays)} ڕۆژ دواکەوتووە)`,
        badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 font-extrabold',
      };
    } else if (diffDays === 0) {
      return {
        type: 'today',
        days: 0,
        label: 'ئەمڕۆ کاتی دانەوەیەتی!',
        badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 font-extrabold',
      };
    } else if (diffDays <= 7) {
      return {
        type: 'soon',
        days: diffDays,
        label: `${diffDays} ڕۆژ ماوە بۆ دانەوە (ئەم هەفتەیە)`,
        badgeClass: 'bg-blue-100 text-blue-900 border-blue-300 font-bold',
      };
    } else {
      return {
        type: 'upcoming',
        days: diffDays,
        label: `${diffDays} ڕۆژ ماوە بۆ دانەوە`,
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-medium',
      };
    }
  };

  const addDaysToToday = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

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

  // Overdue count
  const overdueCustomersCount = customers.filter((c) => {
    if (c.debt <= 0 || !c.dueDate) return false;
    const st = getDueDateStatus(c.dueDate);
    return st.type === 'overdue';
  }).length;

  const dueSoonCustomersCount = customers.filter((c) => {
    if (c.debt <= 0 || !c.dueDate) return false;
    const st = getDueDateStatus(c.dueDate);
    return st.type === 'today' || st.type === 'soon';
  }).length;

  const handleOpenAddCustomer = () => {
    setEditingCustomer(null);
    setCustomerForm({
      name: '',
      phone: '',
      address: '',
      guarantorName: '',
      guarantorPhone: '',
      debt: '0',
      debtDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      debtNotes: '',
    });
    setIsCustomerModalOpen(true);
  };

  const handleOpenEditCustomer = (c: Customer) => {
    setEditingCustomer(c);
    setCustomerForm({
      name: c.name,
      phone: c.phone,
      address: c.address,
      guarantorName: c.guarantorName || '',
      guarantorPhone: c.guarantorPhone || '',
      debt: c.debt.toString(),
      debtDate: c.debtDate || c.createdAt || new Date().toISOString().split('T')[0],
      dueDate: c.dueDate || '',
      debtNotes: c.debtNotes || '',
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
        guarantorName: customerForm.guarantorName.trim() || undefined,
        guarantorPhone: customerForm.guarantorPhone.trim() || undefined,
        debt,
        debtDate: debt > 0 ? (customerForm.debtDate || editingCustomer.debtDate) : undefined,
        dueDate: debt > 0 ? (customerForm.dueDate.trim() || undefined) : undefined,
        debtNotes: customerForm.debtNotes.trim() || undefined,
      });
    } else {
      addCustomer({
        name: customerForm.name.trim(),
        phone: customerForm.phone.trim() || '-',
        address: customerForm.address.trim() || '-',
        guarantorName: customerForm.guarantorName.trim() || undefined,
        guarantorPhone: customerForm.guarantorPhone.trim() || undefined,
        debt,
        debtDate: debt > 0 ? (customerForm.debtDate || new Date().toISOString().split('T')[0]) : undefined,
        dueDate: debt > 0 ? (customerForm.dueDate.trim() || undefined) : undefined,
        debtNotes: customerForm.debtNotes.trim() || undefined,
      });
    }
    setIsCustomerModalOpen(false);
  };

  const handleOpenQuickDueDate = (partyType: 'customer' | 'supplier', id: string, name: string, debtDate?: string, dueDate?: string) => {
    setQuickDueDateModal({
      isOpen: true,
      partyType,
      partyId: id,
      partyName: name,
      debtDate: debtDate || new Date().toISOString().split('T')[0],
      dueDate: dueDate || '',
    });
  };

  const handleSaveQuickDueDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickDueDateModal.partyType === 'customer') {
      setCustomerDueDate(
        quickDueDateModal.partyId,
        quickDueDateModal.dueDate.trim() || undefined,
        quickDueDateModal.debtDate.trim() || undefined
      );
    } else {
      setSupplierDueDate(
        quickDueDateModal.partyId,
        quickDueDateModal.dueDate.trim() || undefined,
        quickDueDateModal.debtDate.trim() || undefined
      );
    }
    setQuickDueDateModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleOpenAddSupplier = () => {
    setEditingSupplier(null);
    setSupplierForm({
      name: '',
      phone: '',
      address: '',
      debt: '0',
      debtDate: new Date().toISOString().split('T')[0],
      dueDate: '',
    });
    setIsSupplierModalOpen(true);
  };

  const handleOpenEditSupplier = (s: Supplier) => {
    setEditingSupplier(s);
    setSupplierForm({
      name: s.name,
      phone: s.phone,
      address: s.address,
      debt: s.debt.toString(),
      debtDate: s.debtDate || s.createdAt || new Date().toISOString().split('T')[0],
      dueDate: s.dueDate || '',
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
        debtDate: debt > 0 ? (supplierForm.debtDate || editingSupplier.debtDate) : undefined,
        dueDate: debt > 0 ? (supplierForm.dueDate.trim() || undefined) : undefined,
      });
    } else {
      addSupplier({
        name: supplierForm.name.trim(),
        phone: supplierForm.phone.trim() || '-',
        address: supplierForm.address.trim() || '-',
        debt,
        debtDate: debt > 0 ? (supplierForm.debtDate || new Date().toISOString().split('T')[0]) : undefined,
        dueDate: debt > 0 ? (supplierForm.dueDate.trim() || undefined) : undefined,
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

  const toggleCustomerInvoices = (customerId: string) => {
    setExpandedCustomerInvoices((prev) => ({
      ...prev,
      [customerId]: !prev[customerId],
    }));
  };

  // Filter customers
  const filteredCustomers = customers.filter((c) => {
    const q = customerSearch.trim().toLowerCase();
    const matchesSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      (c.guarantorName && c.guarantorName.toLowerCase().includes(q)) ||
      (c.guarantorPhone && c.guarantorPhone.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (customerFilter === 'debtors') {
      return c.debt > 0;
    }
    if (customerFilter === 'overdue') {
      if (c.debt <= 0 || !c.dueDate) return false;
      return getDueDateStatus(c.dueDate).type === 'overdue';
    }
    if (customerFilter === 'dueSoon') {
      if (c.debt <= 0 || !c.dueDate) return false;
      const st = getDueDateStatus(c.dueDate);
      return st.type === 'today' || st.type === 'soon';
    }
    return true;
  });

  // Filter suppliers
  const filteredSuppliers = suppliers.filter((s) => {
    const q = supplierSearch.trim().toLowerCase();
    return (
      !q ||
      s.name.toLowerCase().includes(q) ||
      (s.phone && s.phone.toLowerCase().includes(q))
    );
  });

  return (
    <div className="pb-24 pt-3 px-3 sm:px-4 max-w-4xl mx-auto space-y-4">
      {/* Top Card: Subtabs & 4 KPI cards matching video */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/90 space-y-4">
        {/* Header Title & Subtabs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-blue-600" />
              <h2 className="font-extrabold text-base sm:text-lg text-slate-900">
                بەشی قەرزەکان و باردان
              </h2>
            </div>

            {overdueCustomersCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-black">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>{overdueCustomersCount} قەرز مەوعدی بەسەرچووە!</span>
              </span>
            )}
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <h3 className="font-extrabold text-sm sm:text-base text-slate-800">
              لیستی قەرزدارەکان و بەرواری دانەوە
            </h3>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={handleOpenAddCustomer}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ موشتەری نوێ</span>
              </button>

              <button
                onClick={() => handleOpenReceiveDebt()}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
              >
                <HandCoins className="w-3.5 h-3.5" />
                <span>وەرگرتنی پارەی قەرز</span>
              </button>
            </div>
          </div>

          {/* Filters & Search Bar */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200 space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="گەڕان بەپێی ناوی موشتەری یان مۆبایل..."
                className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-0.5">
              <button
                onClick={() => setCustomerFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  customerFilter === 'all'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                موشتەرییە گشتییەکان ({customers.length})
              </button>

              <button
                onClick={() => setCustomerFilter('debtors')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  customerFilter === 'debtors'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                قەرزدارەکان ({customersWithDebtCount})
              </button>

              <button
                onClick={() => setCustomerFilter('overdue')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  customerFilter === 'overdue'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                ⚠️ مەوعد بەسەرچوو ({overdueCustomersCount})
              </button>

              <button
                onClick={() => setCustomerFilter('dueSoon')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  customerFilter === 'dueSoon'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                🔔 کاتی دانەوە ({dueSoonCustomersCount})
              </button>
            </div>
          </div>

          {/* Customer Cards with Due Date details */}
          <div className="space-y-3">
            {filteredCustomers.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-200 space-y-2">
                <Users className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
                <p className="text-xs sm:text-sm font-bold text-slate-600">
                  هیچ موشتەرییەک بەپێی ئەم فلتەرە نەدۆزرایەوە
                </p>
              </div>
            ) : (
              filteredCustomers.map((c) => {
                const hasDebt = c.debt > 0;
                const status = hasDebt ? getDueDateStatus(c.dueDate) : null;
                const customerDebtInvoices = invoices.filter(
                  (inv) => inv.customerId === c.id && inv.debtAmount > 0
                );
                const isExpanded = !!expandedCustomerInvoices[c.id];

                return (
                  <div
                    key={c.id}
                    className={`bg-white rounded-2xl p-4 shadow-xs border transition-all space-y-3 ${
                      hasDebt
                        ? status?.type === 'overdue'
                          ? 'border-rose-300/90 bg-rose-50/15'
                          : 'border-slate-200/90 hover:border-amber-300'
                        : 'border-slate-200/90'
                    }`}
                  >
                    {/* Top Row: Name, phone, and Actions */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-black text-sm sm:text-base text-slate-900">
                            {c.name}
                          </h4>
                          {hasDebt && status && (
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] border ${status.badgeClass}`}
                            >
                              {status.type === 'overdue' && <AlertTriangle className="w-3 h-3 text-rose-600" />}
                              {status.type === 'today' && <Clock className="w-3 h-3 text-amber-600" />}
                              {status.type === 'soon' && <Calendar className="w-3 h-3 text-blue-600" />}
                              <span>{status.label}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                          {c.phone !== '-' && (
                            <div className="flex items-center gap-1 font-mono">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{c.phone}</span>
                            </div>
                          )}
                          {c.address !== '-' && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{c.address}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Edit & Delete actions */}
                      {c.id !== 'cust-cash' && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditCustomer(c)}
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 cursor-pointer"
                            title="دەستکاری موشتەری"
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

                    {/* Guarantor Section (ناوی کەفیل و ژمارەی مۆبایل) */}
                    <div className="bg-slate-50/90 border border-slate-200/90 rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs flex-wrap">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            c.guarantorName
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold block">
                            ناوی کەفیل (کەسی دەستەبەر):
                          </span>
                          <span
                            className={`text-xs ${
                              c.guarantorName
                                ? 'font-black text-slate-900'
                                : 'font-medium text-slate-400'
                            }`}
                          >
                            {c.guarantorName || 'کەفیل دیارینەکراوە'}
                          </span>
                        </div>
                      </div>

                      {c.guarantorPhone && c.guarantorPhone !== '-' ? (
                        <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-blue-700 bg-white px-2.5 py-1 rounded-lg border border-blue-200 shadow-2xs">
                          <Phone className="w-3 h-3 text-blue-600" />
                          <span>{c.guarantorPhone}</span>
                        </div>
                      ) : (
                        c.id !== 'cust-cash' && (
                          <button
                            type="button"
                            onClick={() => handleOpenEditCustomer(c)}
                            className="text-[11px] text-blue-600 hover:text-blue-800 font-bold hover:underline cursor-pointer"
                          >
                            + دیاریکردنی کەفیل
                          </button>
                        )
                      )}
                    </div>

                    {/* Date Details Box: بەرواری وەرگرتنی قەرز & کاتی دانەوە */}
                    {hasDebt && (
                      <div className="bg-slate-50/90 border border-slate-200/90 rounded-xl p-3 space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {/* بەرواری وەرگرتن */}
                          <div className="flex items-center justify-between sm:justify-start sm:gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/60">
                            <span className="text-slate-500 font-semibold flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>بەرواری وەرگرتنی قەرز:</span>
                            </span>
                            <span className="font-mono font-bold text-slate-800">
                              {c.debtDate || c.createdAt || '-'}
                            </span>
                          </div>

                          {/* بەرواری دانەوە */}
                          <div
                            className={`flex items-center justify-between sm:justify-start sm:gap-2 px-2.5 py-1.5 rounded-lg border ${
                              status?.type === 'overdue'
                                ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                                : 'bg-white border-slate-200/60 text-slate-800'
                            }`}
                          >
                            <span className="font-semibold flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-amber-600" />
                              <span>کاتی دانەوە (مەوعد):</span>
                            </span>
                            <span className="font-mono font-bold">
                              {c.dueDate || 'دیارینەکراوە'}
                            </span>
                          </div>
                        </div>

                        {/* Quick set / change due date button */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-xs">
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenQuickDueDate('customer', c.id, c.name, c.debtDate, c.dueDate)
                            }
                            className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-bold hover:underline cursor-pointer"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{c.dueDate ? 'گۆڕینی بەرواری دانەوە' : 'دانانی بەرواری دانەوە'}</span>
                          </button>

                          {customerDebtInvoices.length > 0 && (
                            <button
                              type="button"
                              onClick={() => toggleCustomerInvoices(c.id)}
                              className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-bold text-[11px] cursor-pointer"
                            >
                              <span>پسوولەکانی قەرز ({customerDebtInvoices.length})</span>
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>

                        {/* Expandable Invoices List */}
                        {isExpanded && customerDebtInvoices.length > 0 && (
                          <div className="pt-2 border-t border-slate-200 space-y-1.5">
                            <span className="text-[11px] font-bold text-slate-700 block">
                              وردەکاری پسوولەکانی ئەم موشتەرییە:
                            </span>
                            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                              {customerDebtInvoices.map((inv) => (
                                <div
                                  key={inv.id}
                                  className="bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                                >
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono font-bold text-blue-600">
                                        {inv.invoiceNumber}
                                      </span>
                                      <span className="text-[10px] text-slate-500 font-mono">
                                        {inv.date} {inv.time}
                                      </span>
                                    </div>
                                    <div className="text-[11px] text-slate-500 mt-0.5">
                                      {inv.items.length} کاڵا • کۆی گشتی: {formatMoney(inv.total)}
                                    </div>
                                    {inv.dueDate && (
                                      <div className="text-[10px] font-bold text-amber-700 font-mono mt-0.5">
                                        کاتی دانەوەی ئەم پسوولەیە: {inv.dueDate}
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <span className="font-black text-rose-600 font-mono">
                                      {formatMoney(inv.debtAmount)}
                                    </span>
                                    <button
                                      onClick={() => setViewingInvoice(inv)}
                                      className="p-1 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                                      title="چاپکردن و بینینی پسوولە"
                                    >
                                      <FileText className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Bottom line: Remaining Debt & Receive Payment button */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400">قەرزی ماوە:</span>
                        <div
                          className={`text-base sm:text-lg font-black ${
                            hasDebt ? 'text-amber-600' : 'text-slate-400'
                          }`}
                        >
                          {formatMoney(c.debt)}
                        </div>
                      </div>

                      {hasDebt && (
                        <button
                          onClick={() => handleOpenReceiveDebt(c.id)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
                        >
                          <HandCoins className="w-3.5 h-3.5" />
                          <span>وەرگرتنی پارەی قەرز</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Subtab 2: Supplier Debts List */}
      {activeSubTab === 'suppliers' && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <h3 className="font-extrabold text-sm sm:text-base text-slate-800">
              قەرزی ماوەی کۆمپانیاکان و بەرواری دانەوە
            </h3>

            <div className="flex items-center gap-1.5 flex-wrap">
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

          {/* Supplier Search */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={supplierSearch}
                onChange={(e) => setSupplierSearch(e.target.value)}
                placeholder="گەڕان بەپێی ناوی کۆمپانیا یان مۆبایل..."
                className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredSuppliers.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-200 space-y-2">
                <Building2 className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
                <p className="text-xs sm:text-sm font-bold text-slate-600">
                  هیچ کۆمپانیایەک نەدۆزرایەوە
                </p>
              </div>
            ) : (
              filteredSuppliers.map((s) => {
                const hasDebt = s.debt > 0;
                const status = hasDebt ? getDueDateStatus(s.dueDate) : null;

                return (
                  <div
                    key={s.id}
                    className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/90 space-y-3 hover:border-purple-300 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-black text-sm sm:text-base text-slate-900">
                            {s.name}
                          </h4>
                          {hasDebt && status && (
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] border ${status.badgeClass}`}
                            >
                              <span>{status.label}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          {s.phone && (
                            <div className="flex items-center gap-1 font-mono">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{s.phone}</span>
                            </div>
                          )}
                          {s.address && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{s.address}</span>
                            </div>
                          )}
                        </div>
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

                    {/* Dates for Supplier */}
                    {hasDebt && (
                      <div className="bg-slate-50/90 border border-slate-200/90 rounded-xl p-3 space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center justify-between sm:justify-start sm:gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/60">
                            <span className="text-slate-500 font-semibold">بەرواری قەرز:</span>
                            <span className="font-mono font-bold text-slate-800">
                              {s.debtDate || s.createdAt || '-'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between sm:justify-start sm:gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/60">
                            <span className="text-purple-700 font-semibold">بەرواری دانەوە بە کۆمپانیا:</span>
                            <span className="font-mono font-bold text-slate-800">
                              {s.dueDate || 'دیارینەکراوە'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-xs">
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenQuickDueDate('supplier', s.id, s.name, s.debtDate, s.dueDate)
                            }
                            className="inline-flex items-center gap-1.5 text-purple-600 hover:text-purple-800 font-bold hover:underline cursor-pointer"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{s.dueDate ? 'گۆڕینی بەرواری دانەوە' : 'دانانی بەرواری دانەوە'}</span>
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400">قەرزی کۆمپانیا:</span>
                        <div
                          className={`text-base sm:text-lg font-black ${
                            hasDebt ? 'text-purple-600' : 'text-slate-400'
                          }`}
                        >
                          {formatMoney(s.debt)}
                        </div>
                      </div>

                      {hasDebt && (
                        <button
                          onClick={() => handleOpenPayDebt(s.id)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          <span>پاردان</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
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
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-5 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="font-black text-base text-slate-900">
                {editingCustomer ? 'دەستکاری موشتەری' : 'زیادکردنی موشتەری نوێ'}
              </h3>
              <button
                type="button"
                onClick={() => setIsCustomerModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

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

              {/* Guarantor Details (زانیاری کەفیل) */}
              <div className="bg-indigo-50/70 border border-indigo-200/90 rounded-2xl p-3 space-y-2.5">
                <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>زانیاری کەفیل (ناوی کەسی دەستەبەر بۆ قەرز):</span>
                </span>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ناوی کەفیل
                  </label>
                  <input
                    type="text"
                    value={customerForm.guarantorName}
                    onChange={(e) =>
                      setCustomerForm({ ...customerForm, guarantorName: e.target.value })
                    }
                    placeholder="وەک: کاک هێمن ئەحمەد"
                    className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ژمارەی مۆبایلی کەفیل
                  </label>
                  <input
                    type="text"
                    value={customerForm.guarantorPhone}
                    onChange={(e) =>
                      setCustomerForm({ ...customerForm, guarantorPhone: e.target.value })
                    }
                    placeholder="0770 000 0000"
                    className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs font-mono focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
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

              {/* Debt Date & Repayment Due Date */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3 space-y-2.5">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  <span>دیاریکردنی بەرواری قەرز و کاتی دانەوە:</span>
                </span>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    بەرواری وەرگرتنی قەرز (کەی بردوویەتی):
                  </label>
                  <input
                    type="date"
                    value={customerForm.debtDate}
                    onChange={(e) => setCustomerForm({ ...customerForm, debtDate: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-amber-200 rounded-xl text-xs font-mono font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    بەرواری دانەوە (کەی قەرزەکەی دەهێنێتەوە):
                  </label>
                  <input
                    type="date"
                    min={customerForm.debtDate}
                    value={customerForm.dueDate}
                    onChange={(e) => setCustomerForm({ ...customerForm, dueDate: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-xl text-xs font-mono font-bold text-slate-800"
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1 pt-1">
                  <button
                    type="button"
                    onClick={() => setCustomerForm({ ...customerForm, dueDate: addDaysToToday(7) })}
                    className="px-2 py-0.5 bg-white hover:bg-amber-100 border border-amber-200 rounded-lg text-[10px] font-bold text-amber-900 cursor-pointer"
                  >
                    +٧ ڕۆژ
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomerForm({ ...customerForm, dueDate: addDaysToToday(15) })}
                    className="px-2 py-0.5 bg-white hover:bg-amber-100 border border-amber-200 rounded-lg text-[10px] font-bold text-amber-900 cursor-pointer"
                  >
                    +١٥ ڕۆژ
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomerForm({ ...customerForm, dueDate: addDaysToToday(30) })}
                    className="px-2 py-0.5 bg-white hover:bg-amber-100 border border-amber-200 rounded-lg text-[10px] font-bold text-amber-900 cursor-pointer"
                  >
                    +١ مانگ
                  </button>
                  {customerForm.dueDate && (
                    <button
                      type="button"
                      onClick={() => setCustomerForm({ ...customerForm, dueDate: '' })}
                      className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg text-[10px] font-bold text-rose-700 cursor-pointer mr-auto"
                    >
                      پاککردنەوە
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  تێبینی دەربارەی قەرز (ئارەزوومەندانە)
                </label>
                <input
                  type="text"
                  value={customerForm.debtNotes}
                  onChange={(e) => setCustomerForm({ ...customerForm, debtNotes: e.target.value })}
                  placeholder="وەک: بەڵێنی داوە لە سەرەتای مانگ پارەکە بدات"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(false)}
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

      {/* Quick Due Date Adjustment Modal */}
      {quickDueDateModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-600" />
                <h3 className="font-black text-sm sm:text-base text-slate-900">
                  دیاریکردنی کاتی دانەوەی قەرز
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setQuickDueDateModal((prev) => ({ ...prev, isOpen: false }))}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-xs">
              <span className="text-slate-500 block font-medium">موشتەری / لایەن:</span>
              <span className="font-extrabold text-amber-950 text-sm">{quickDueDateModal.partyName}</span>
            </div>

            <form onSubmit={handleSaveQuickDueDate} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>بەرواری وەرگرتنی قەرز (کەی بردوویەتی):</span>
                </label>
                <input
                  type="date"
                  value={quickDueDateModal.debtDate}
                  onChange={(e) =>
                    setQuickDueDateModal((prev) => ({ ...prev, debtDate: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  <span>بەرواری دانەوە (کەی قەرزەکەی دەهێنێتەوە):</span>
                </label>
                <input
                  type="date"
                  min={quickDueDateModal.debtDate}
                  value={quickDueDateModal.dueDate}
                  onChange={(e) =>
                    setQuickDueDateModal((prev) => ({ ...prev, dueDate: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-amber-300 rounded-xl text-xs font-mono font-bold text-slate-800"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="pt-1">
                <span className="text-[11px] font-bold text-amber-900 block mb-1">
                  دەستنیشانکردنی خێرا:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setQuickDueDateModal((prev) => ({ ...prev, dueDate: addDaysToToday(7) }))
                    }
                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg text-xs font-bold text-amber-900 cursor-pointer"
                  >
                    +٧ ڕۆژ
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setQuickDueDateModal((prev) => ({ ...prev, dueDate: addDaysToToday(15) }))
                    }
                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg text-xs font-bold text-amber-900 cursor-pointer"
                  >
                    +١٥ ڕۆژ
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setQuickDueDateModal((prev) => ({ ...prev, dueDate: addDaysToToday(30) }))
                    }
                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg text-xs font-bold text-amber-900 cursor-pointer"
                  >
                    +١ مانگ
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setQuickDueDateModal((prev) => ({ ...prev, dueDate: addDaysToToday(60) }))
                    }
                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg text-xs font-bold text-amber-900 cursor-pointer"
                  >
                    +٢ مانگ
                  </button>
                  {quickDueDateModal.dueDate && (
                    <button
                      type="button"
                      onClick={() =>
                        setQuickDueDateModal((prev) => ({ ...prev, dueDate: '' }))
                      }
                      className="px-2 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-bold text-rose-700 cursor-pointer mr-auto"
                    >
                      سڕینەوە
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setQuickDueDateModal((prev) => ({ ...prev, isOpen: false }))}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 cursor-pointer"
                >
                  پاشگەزبوونەوە
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
                >
                  پاشەکەوتکردنی بەروار
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Supplier Modal */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-5 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="font-black text-base text-slate-900">
                {editingSupplier ? 'دەستکاری کۆمپانیا' : 'زیادکردنی کۆمپانیای نوێ'}
              </h3>
              <button
                type="button"
                onClick={() => setIsSupplierModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

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

              {/* Debt Date & Repayment Due Date for Supplier */}
              <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-3 space-y-2.5">
                <span className="text-xs font-bold text-purple-900 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-purple-600" />
                  <span>بەرواری قەرز و دانەوە بە کۆمپانیا:</span>
                </span>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    بەرواری کڕینی قەرز:
                  </label>
                  <input
                    type="date"
                    value={supplierForm.debtDate}
                    onChange={(e) => setSupplierForm({ ...supplierForm, debtDate: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-purple-200 rounded-xl text-xs font-mono font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    بەرواری دانەوە بە کۆمپانیا:
                  </label>
                  <input
                    type="date"
                    min={supplierForm.debtDate}
                    value={supplierForm.dueDate}
                    onChange={(e) => setSupplierForm({ ...supplierForm, dueDate: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-purple-300 rounded-xl text-xs font-mono font-bold text-slate-800"
                  />
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  <button
                    type="button"
                    onClick={() => setSupplierForm({ ...supplierForm, dueDate: addDaysToToday(7) })}
                    className="px-2 py-0.5 bg-white hover:bg-purple-100 border border-purple-200 rounded-lg text-[10px] font-bold text-purple-900 cursor-pointer"
                  >
                    +٧ ڕۆژ
                  </button>
                  <button
                    type="button"
                    onClick={() => setSupplierForm({ ...supplierForm, dueDate: addDaysToToday(15) })}
                    className="px-2 py-0.5 bg-white hover:bg-purple-100 border border-purple-200 rounded-lg text-[10px] font-bold text-purple-900 cursor-pointer"
                  >
                    +١٥ ڕۆژ
                  </button>
                  <button
                    type="button"
                    onClick={() => setSupplierForm({ ...supplierForm, dueDate: addDaysToToday(30) })}
                    className="px-2 py-0.5 bg-white hover:bg-purple-100 border border-purple-200 rounded-lg text-[10px] font-bold text-purple-900 cursor-pointer"
                  >
                    +١ مانگ
                  </button>
                  {supplierForm.dueDate && (
                    <button
                      type="button"
                      onClick={() => setSupplierForm({ ...supplierForm, dueDate: '' })}
                      className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg text-[10px] font-bold text-rose-700 cursor-pointer mr-auto"
                    >
                      پاککردنەوە
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(false)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 cursor-pointer"
                >
                  پاشگەزبوونەوە
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold cursor-pointer"
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
