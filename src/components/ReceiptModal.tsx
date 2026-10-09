import React from 'react';
import { Printer, X, Download, Share2, Check, Store } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Invoice } from '../types';

interface ReceiptModalProps {
  invoice: Invoice;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ invoice, onClose }) => {
  const { settings, formatMoney, formatNumber } = useApp();

  const handlePrint = () => {
    window.print();
  };

  const isCash = invoice.paymentMethod === 'cash';
  const isDebt = invoice.paymentMethod === 'debt';
  const isHalf = invoice.paymentMethod === 'half';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 no-print-bg">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Top Actions Bar (Hidden in Print) */}
        <div className="no-print p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>چاپکردن (Print)</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Thermal Receipt Card */}
        <div
          id="printable-receipt"
          className="p-5 overflow-y-auto space-y-4 bg-white text-slate-800 text-center font-sans text-xs"
        >
          {/* Shop Header */}
          <div className="space-y-1 border-b border-dashed border-slate-300 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-xl flex items-center justify-center mx-auto shadow-xs">
              {settings.shopName.charAt(0).toUpperCase()}
            </div>
            <h2 className="font-black text-lg text-slate-900 mt-1">{settings.shopName}</h2>
            <p className="text-[11px] text-slate-500 font-medium">{settings.address}</p>
            <p className="text-[11px] text-slate-500 font-mono">{settings.phone}</p>
          </div>

          {/* Invoice Info */}
          <div className="space-y-1 text-right text-[11px] border-b border-dashed border-slate-300 pb-3">
            <div className="flex justify-between font-mono">
              <span className="font-bold text-slate-800">{invoice.invoiceNumber}</span>
              <span className="text-slate-500">ژمارەی پسوولە:</span>
            </div>
            <div className="flex justify-between font-mono">
              <span className="text-slate-700">{invoice.date} {invoice.time}</span>
              <span className="text-slate-500">بەروار و کات:</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold text-slate-900">{invoice.customerName}</span>
              <span className="text-slate-500">موشتەری:</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-2 border-b border-dashed border-slate-300 pb-3">
            <div className="flex justify-between font-bold text-slate-600 pb-1 border-b border-slate-100 text-[10px]">
              <span className="w-2/5 text-right">کاڵا</span>
              <span className="w-1/5 text-center">بڕ</span>
              <span className="w-1/5 text-center">نرخ</span>
              <span className="w-1/5 text-left">کۆ</span>
            </div>

            <div className="space-y-1.5 text-right">
              {invoice.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-[11px]">
                  <span className="w-2/5 font-semibold text-slate-800 truncate">
                    {item.nameKu}
                  </span>
                  <span className="w-1/5 text-center font-mono">
                    {item.quantity}
                  </span>
                  <span className="w-1/5 text-center font-mono">
                    {formatNumber(item.sellPrice)}
                  </span>
                  <span className="w-1/5 text-left font-bold font-mono">
                    {formatNumber(item.total)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Calculations Summary */}
          <div className="space-y-1.5 text-right text-xs border-b border-dashed border-slate-300 pb-3">
            <div className="flex justify-between text-slate-600">
              <span className="font-mono">{formatMoney(invoice.subtotal)}</span>
              <span>کۆی سەرەتایی:</span>
            </div>

            {invoice.discountAmount > 0 && (
              <div className="flex justify-between text-rose-600">
                <span className="font-mono">-{formatMoney(invoice.discountAmount)} (%{invoice.discountPercent})</span>
                <span>داشکاندن:</span>
              </div>
            )}

            <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-200">
              <span className="text-base text-blue-700 font-mono">{formatMoney(invoice.total)}</span>
              <span>کۆی گشتی:</span>
            </div>

            <div className="flex justify-between text-slate-600 text-[11px]">
              <span className="font-bold">
                {isCash ? 'کاش' : isDebt ? 'قەرز' : 'نیوە کاش و نیوە قەرز'}
              </span>
              <span>شێوازی باردان:</span>
            </div>

            {invoice.debtAmount > 0 && (
              <div className="bg-amber-50 p-2 rounded-lg space-y-1 text-right">
                <div className="flex justify-between text-amber-800 font-bold">
                  <span className="font-mono">{formatMoney(invoice.debtAmount)}</span>
                  <span>ماوەی قەرز لەم پسوولەیە:</span>
                </div>
                {invoice.debtDate && (
                  <div className="flex justify-between text-[10px] text-amber-700">
                    <span className="font-mono font-bold">{invoice.debtDate}</span>
                    <span>بەرواری وەرگرتنی قەرز:</span>
                  </div>
                )}
                <div className="flex justify-between text-[10px] text-slate-700 border-t border-amber-200/60 pt-1">
                  <span className={`font-mono font-bold ${invoice.dueDate ? 'text-rose-700' : 'text-slate-500'}`}>
                    {invoice.dueDate || 'دیارینەکراوە'}
                  </span>
                  <span className="font-bold">کاتی دانەوەی قەرز (بەڵێن):</span>
                </div>
                {invoice.guarantorName && (
                  <div className="flex justify-between text-[10px] text-indigo-900 border-t border-amber-200/60 pt-1">
                    <span className="font-bold">
                      {invoice.guarantorName} {invoice.guarantorPhone ? `(${invoice.guarantorPhone})` : ''}
                    </span>
                    <span className="font-semibold text-slate-600">ناوی کەفیل:</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Barcode Simulation & Footer */}
          <div className="space-y-2 pt-1 text-center">
            {/* Simulated Barcode */}
            <div className="flex justify-center items-center gap-[2px] h-8 max-w-[180px] mx-auto opacity-80">
              {[4, 2, 6, 2, 8, 3, 2, 5, 2, 4, 3, 7, 2, 3, 6, 2, 4, 2, 5].map((w, i) => (
                <div
                  key={i}
                  style={{ width: `${w}px` }}
                  className="h-full bg-slate-900"
                ></div>
              ))}
            </div>
            <p className="font-mono text-[10px] text-slate-400">{invoice.invoiceNumber}</p>

            <p className="text-[10px] text-slate-500 font-medium pt-1">
              {settings.receiptFooterKu}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
