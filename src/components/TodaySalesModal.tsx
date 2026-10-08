import React, { useState } from 'react';
import {
  X,
  TrendingUp,
  ShoppingBag,
  Calendar,
  Printer,
  Search,
  Package,
  Layers,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface TodaySalesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TodaySalesModal: React.FC<TodaySalesModalProps> = ({ isOpen, onClose }) => {
  const { getTodayStats, formatMoney, formatNumber, language } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const todayStats = getTodayStats();

  const filteredItems = todayStats.soldItems.filter((item) => {
    const q = searchQuery.trim().toLowerCase();
    return !q || item.nameKu.toLowerCase().includes(q) || item.itemCode.toLowerCase().includes(q);
  });

  const totalPiecesSold = todayStats.soldItems.reduce((sum, item) => sum + item.quantity, 0);

  const handlePrintDailyReport = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 no-print-bg">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-linear-to-r from-blue-50/80 to-indigo-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                  فرۆشراوەکانی ئەمڕۆ
                </h3>
                <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {todayStats.dateStr}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                پوختەی هەموو ئەو کاڵایانەی ئەمڕۆ فرۆشراون
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-white/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Top Quick KPI Cards for Today */}
          <div className="grid grid-cols-3 gap-2.5">
            {/* Today Total Sales */}
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-3 text-center">
              <span className="text-[11px] font-bold text-blue-800">کۆی فرۆشی ئەمڕۆ</span>
              <div className="text-sm sm:text-base font-black text-blue-700 tracking-tight mt-1">
                {formatMoney(todayStats.totalSales)}
              </div>
            </div>

            {/* Today Total Profit */}
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3 text-center">
              <span className="text-[11px] font-bold text-emerald-800">قازانجی ئەمڕۆ</span>
              <div className="text-sm sm:text-base font-black text-emerald-700 tracking-tight mt-1">
                +{formatMoney(todayStats.totalProfit)}
              </div>
            </div>

            {/* Today Pieces Sold */}
            <div className="bg-purple-50/70 border border-purple-200/80 rounded-2xl p-3 text-center">
              <span className="text-[11px] font-bold text-purple-800">دانەی فرۆشراو</span>
              <div className="text-sm sm:text-base font-black text-purple-700 tracking-tight mt-1">
                {totalPiecesSold} دانە
              </div>
            </div>
          </div>

          {/* Search box for sold items */}
          <div className="relative">
            <input
              type="text"
              placeholder="گەڕان لەناو کاڵا فرۆشراوەکانی ئەمڕۆ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-blue-500 focus:outline-hidden"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* List of Items Sold Today */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1">
              <span>لیستی کاڵا فرۆشراوەکان ({filteredItems.length})</span>
              <span>ژمارەی پسوولەکان: {todayStats.invoiceCount}</span>
            </div>

            {filteredItems.length === 0 ? (
              <div className="bg-slate-50 rounded-2xl p-6 text-center text-slate-400 border border-slate-200">
                <Package className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-1" />
                <p className="text-xs font-bold text-slate-500">
                  هیچ کاڵایەک لەم بەروارەدا نەفرۆشراوە
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {filteredItems.map((item, idx) => (
                  <div
                    key={item.itemId}
                    className="p-3 bg-slate-50 hover:bg-slate-100/90 rounded-2xl border border-slate-200/90 flex items-center justify-between gap-2 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                          {item.itemCode}
                        </span>
                        <h4 className="font-extrabold text-xs sm:text-sm text-slate-800 truncate">
                          {item.nameKu}
                        </h4>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                        <span className="font-bold text-blue-700 bg-blue-50/70 px-1.5 py-0.5 rounded">
                          بڕ: {item.quantity} {item.unitKu}
                        </span>
                        <span className="text-emerald-600 font-bold">
                          قازانج: +{formatMoney(item.totalProfit)}
                        </span>
                      </div>
                    </div>

                    <div className="text-left whitespace-nowrap">
                      <span className="text-[10px] text-slate-400 block font-semibold">
                        کۆی فرۆش
                      </span>
                      <span className="text-xs sm:text-sm font-black text-slate-900">
                        {formatMoney(item.totalRevenue)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={handlePrintDailyReport}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>چاپکردنی ڕاپۆرتی ئەمڕۆ</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
          >
            داخستن
          </button>
        </div>
      </div>
    </div>
  );
};
