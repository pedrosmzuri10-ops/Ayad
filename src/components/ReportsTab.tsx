import React, { useState } from 'react';
import {
  TrendingUp,
  ShoppingCart,
  Receipt,
  DollarSign,
  Plus,
  ArrowUpRight,
  CreditCard,
  HandCoins,
  ChevronRight,
  Eye,
  Trash2,
  Printer,
  Calendar,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Invoice } from '../types';
import { ExpenseModal } from './ExpenseModal';
import { PaymentModal } from './PaymentModal';

export const ReportsTab: React.FC = () => {
  const {
    invoices,
    expenses,
    customers,
    payments,
    formatMoney,
    formatNumber,
    setActiveTab,
    deleteInvoice,
    setViewingInvoice,
  } = useApp();

  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'week' | 'month' | 'year' | 'custom'>('all');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);

  // Filter invoices based on date range
  const filteredInvoices = invoices.filter((inv) => {
    if (dateFilter === 'all') return true;
    const invDate = new Date(inv.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dateFilter === 'today') {
      return inv.date === today.toISOString().split('T')[0];
    }
    if (dateFilter === 'yesterday') {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return inv.date === yesterday.toISOString().split('T')[0];
    }
    if (dateFilter === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return invDate >= weekAgo;
    }
    if (dateFilter === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return invDate >= monthAgo;
    }
    if (dateFilter === 'year') {
      const yearAgo = new Date(today);
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      return invDate >= yearAgo;
    }
    return true;
  });

  // Calculate Metrics matching video values
  const totalSales = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const invoiceCount = filteredInvoices.length;
  const averageInvoice = invoiceCount > 0 ? Math.round(totalSales / invoiceCount) : 0;
  const totalGrossProfit = filteredInvoices.reduce((sum, inv) => sum + inv.profit, 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netProfit = totalGrossProfit - totalExpenses;
  const totalCustomerDebt = customers.reduce((sum, c) => sum + c.debt, 0);
  const totalDebtReceived = payments
    .filter((p) => p.type === 'received')
    .reduce((sum, p) => sum + p.amount, 0);

  // Dynamic Chart data calculation from real invoices & expenses
  const dayNames = ['شەممە', 'یەکشەممە', 'دووشەممە', 'سێشەممە', 'چوارشەممە', 'پێنجشەممە', 'هەینی'];
  const chartDays = dayNames.map((label, dayIdx) => {
    const jsDay = (dayIdx + 6) % 7;
    const dayInvoices = filteredInvoices.filter((inv) => new Date(inv.date).getDay() === jsDay);
    const daySales = dayInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const dayProfit = dayInvoices.reduce((sum, inv) => sum + inv.profit, 0);
    const dayExpenses = expenses
      .filter((exp) => new Date(exp.date).getDay() === jsDay)
      .reduce((sum, exp) => sum + exp.amount, 0);

    return {
      label,
      sales: daySales,
      profit: dayProfit,
      expenses: dayExpenses,
    };
  });

  const maxVal = Math.max(...chartDays.map((d) => d.sales), 1000);

  return (
    <div className="pb-24 pt-3 px-3 sm:px-4 max-w-4xl mx-auto space-y-4">
      {/* Date Filter Pills matching video */}
      <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/90">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setDateFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              dateFilter === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            هەموو کاتێک
          </button>
          <button
            onClick={() => setDateFilter('today')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              dateFilter === 'today'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ئەمڕۆ
          </button>
          <button
            onClick={() => setDateFilter('yesterday')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              dateFilter === 'yesterday'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            دوێنێ
          </button>
          <button
            onClick={() => setDateFilter('week')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              dateFilter === 'week'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ئەم هەفتەیە
          </button>
          <button
            onClick={() => setDateFilter('month')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              dateFilter === 'month'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ئەم مانگە
          </button>
          <button
            onClick={() => setDateFilter('year')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              dateFilter === 'year'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ئەمساڵ
          </button>
          <button
            onClick={() => setDateFilter('custom')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              dateFilter === 'custom'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            دیاریکردنی بەروار
          </button>
        </div>
      </div>

      {/* 8 Metric Cards */}
      <div className="space-y-3">
        {/* Card 1: فرۆشتنی گشتی (Total Sales) */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/90 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">فرۆشتنی گشتی</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {formatMoney(totalSales)}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>کۆی فرۆشی دەورە</span>
              {totalSales > 0 ? (
                <span className="inline-flex items-center gap-0.5 text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                  <ArrowUpRight className="w-3 h-3" />
                  <span>+{invoiceCount} پسوولە</span>
                </span>
              ) : (
                <span className="text-slate-400 font-mono">0 پسوولە</span>
              )}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShoppingCart className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: ژمارەی پسوولەکان (Invoice Count) */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/90 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">ژمارەی پسوولەکان</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {invoiceCount}
            </div>
            <span className="text-xs text-slate-400">پسوولەی دەرکراو</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 font-mono font-black text-sm flex items-center justify-center border border-purple-200/60">
            INV#
          </div>
        </div>

        {/* Card 3: تێکڕای پسوولە (Average Invoice) */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/90 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">تێکڕای پسوولە</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {formatMoney(averageInvoice)}
            </div>
            <span className="text-xs text-slate-400">بۆ هەر پسوولەیەک</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 font-black text-xs flex items-center justify-center border border-emerald-200/60">
            AVG
          </div>
        </div>

        {/* Card 4: قازانجی فرۆشتن (Gross Profit) */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/90 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span className="text-xs font-semibold text-slate-500">قازانجی فرۆشتن</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-blue-700 tracking-tight">
              {formatMoney(totalGrossProfit)}
            </div>
            <span className="text-xs text-slate-400">قازانجی خاوێن لە فرۆشتنی کاڵاکان</span>
          </div>
        </div>

        {/* Card 5: خەرجیی ڕۆژانە (Expenses) */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/90 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">خەرجیی ڕۆژانە</span>
            <div className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight">
              {formatMoney(totalExpenses)}
            </div>
            <span className="text-xs text-slate-400">کڕین، کرێیەکان، مووچە و خەرجی ڕۆژانە</span>
          </div>
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ تۆمارکردنی خەرجی</span>
          </button>
        </div>

        {/* Card 6: قازانجی تەواو (قازانج - خەرجی) (Net Profit) */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/90 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">
              قازانجی تەواو (قازانج - خەرجی)
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">
              {formatMoney(netProfit)}
            </div>
            <span className="text-xs text-slate-400">پوختەی دەستکەوت دوای لێدەرکردنی خەرجییەکان</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black">
            NET
          </div>
        </div>

        {/* Card 7: قەرز (Customer Debt) */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/90 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">قەرز</span>
            <div className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight">
              {formatMoney(totalCustomerDebt)}
            </div>
            <span className="text-xs text-slate-400">قەرزی ماوە لای موشتەرییەکان</span>
          </div>
          <button
            onClick={() => setActiveTab('debts')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold transition-all cursor-pointer"
          >
            <span>وردەکاری</span>
            <ChevronRight className="w-3.5 h-3.5 rotate-180" />
          </button>
        </div>

        {/* Card 8: پارە وەرگرتن (Debt Collection) */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/90 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">پارە وەرگرتن</span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">
              {formatMoney(totalDebtReceived)}
            </div>
            <span className="text-xs text-slate-400">وەرگرتنەوەی قیست و قەرز</span>
          </div>
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>وەرگرتن +</span>
          </button>
        </div>
      </div>

      {/* Chart Section: جێبەجێ کردنی فرۆشتن و داهات (Full Chart 700) */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/90 space-y-4">
        <div>
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
            جێبەجێ کردنی فرۆشتن و داهات (Full Chart 700)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">بەراوردی فرۆشتنی ڕۆژانە و قازانج</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-bold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-blue-600"></span>
            <span className="text-slate-700">فرۆشتن</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-500"></span>
            <span className="text-slate-700">قازانج</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-amber-500"></span>
            <span className="text-slate-700">خەرجییەکان</span>
          </div>
        </div>

        {/* Bar Chart Visualization */}
        <div className="h-48 pt-6 flex items-end justify-between gap-2 border-b border-slate-100 px-2">
          {chartDays.map((d, idx) => {
            const salesHeight = Math.max(10, Math.round((d.sales / maxVal) * 100));
            const profitHeight = Math.max(8, Math.round((d.profit / maxVal) * 100));
            const expHeight = Math.max(4, Math.round((d.expenses / 1000) * 100));

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                <div className="w-full max-w-[32px] flex items-end justify-center gap-1 h-full">
                  {/* Sales bar */}
                  <div
                    style={{ height: `${salesHeight}%` }}
                    className="w-2.5 sm:w-3 bg-blue-600 rounded-t-sm transition-all group-hover:bg-blue-700"
                    title={`فرۆشتن: ${formatMoney(d.sales)}`}
                  ></div>
                  {/* Profit bar */}
                  <div
                    style={{ height: `${profitHeight}%` }}
                    className="w-2.5 sm:w-3 bg-emerald-500 rounded-t-sm transition-all group-hover:bg-emerald-600"
                    title={`قازانج: ${formatMoney(d.profit)}`}
                  ></div>
                </div>
                <span className="text-[10px] sm:text-xs font-semibold text-slate-500 truncate max-w-[45px]">
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Sales Invoices Section matching video */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/90 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
              دواین پسوولەکانی فرۆشتن
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">لیستی تەواوی پسوولە تۆمارکراوەکان</p>
          </div>

          <button
            onClick={() => setActiveTab('pos')}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>کردنەوەی بەشی فرۆشتن (POS)</span>
          </button>
        </div>

        {/* Invoices List / Table */}
        <div className="space-y-3">
          {invoices.length === 0 ? (
            <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-xs sm:text-sm font-bold text-slate-500">
                هیچ پسوولەیەک تۆمار نەکراوە (0 پسوولە)
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                کاتێک کاڵا لە بەشی فرۆشتن دەفرۆشیت لێرە دەردەکەوێت
              </p>
            </div>
          ) : (
            invoices.map((inv) => {
              const isCash = inv.paymentMethod === 'cash';
              const isDebt = inv.paymentMethod === 'debt';
              const isHalf = inv.paymentMethod === 'half';

              return (
                <div
                  key={inv.id}
                  className="bg-white rounded-2xl p-3.5 border border-slate-200/90 hover:border-blue-300 transition-all shadow-xs space-y-2.5"
                >
                {/* Top: INV Number, Customer, Date, Payment Method */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                      {inv.invoiceNumber}
                    </span>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                      {inv.customerName}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md ${
                        isCash
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isDebt
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}
                    >
                      {isCash ? 'کاش' : isDebt ? 'قەرز' : 'نیوە کاش و نیوە قەرز'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{inv.date}</span>
                  </div>
                </div>

                {/* Items preview */}
                <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100 flex flex-wrap gap-2">
                  {inv.items.map((it, i) => (
                    <span key={i}>
                      {it.nameKu} ({it.quantity})
                      {i < inv.items.length - 1 ? '، ' : ''}
                    </span>
                  ))}
                </div>

                {/* Bottom line: Total, Profit, Debt remaining, and Actions */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="text-[10px] text-slate-400 block">کۆی پسوولە</span>
                      <span className="text-xs sm:text-sm font-black text-slate-900">
                        {formatMoney(inv.total)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">قازانج</span>
                      <span className="text-xs sm:text-sm font-black text-emerald-600">
                        +{formatMoney(inv.profit)}
                      </span>
                    </div>

                    {inv.debtAmount > 0 && (
                      <div>
                        <span className="text-[10px] text-slate-400 block">ماوەی قەرز</span>
                        <span className="text-xs sm:text-sm font-black text-amber-600">
                          {formatMoney(inv.debtAmount)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action buttons (View/Print receipt & Delete invoice) */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setViewingInvoice(inv)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>پسوولە</span>
                    </button>

                    <button
                      onClick={() => setInvoiceToDelete(inv)}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer"
                      title="سڕینەوە"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          }))}
        </div>
      </div>

      {/* Delete Invoice Confirmation Modal matching video 2 at 0:09 */}
      {invoiceToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <Trash2 className="w-8 h-8" />
            </div>

            <div>
              <h4 className="font-black text-lg text-slate-900">دڵنیایت لە سڕینەوە؟</h4>
              <p className="font-mono font-bold text-sm text-slate-600 mt-1">
                "{invoiceToDelete.invoiceNumber}"
              </p>
              <p className="text-xs text-slate-500 mt-2">
                ئەم کردارە پاشگەزبوونەوەی نییە و زانیارییەکان دەسڕدرێنەوە.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  deleteInvoice(invoiceToDelete.id);
                  setInvoiceToDelete(null);
                }}
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer"
              >
                بەڵێ، بسڕەوە
              </button>

              <button
                onClick={() => setInvoiceToDelete(null)}
                className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-50 cursor-pointer"
              >
                باشە، نەخێر
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {isExpenseModalOpen && (
        <ExpenseModal
          isOpen={isExpenseModalOpen}
          onClose={() => setIsExpenseModalOpen(false)}
        />
      )}

      {isPaymentModalOpen && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          defaultType="received"
          defaultPartyType="customer"
        />
      )}
    </div>
  );
};
