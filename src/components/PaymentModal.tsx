import React, { useState } from 'react';
import { X, HandCoins, ArrowDownLeft, ArrowUpRight, DollarSign, AlertCircle, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PaymentRecordType, Customer } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: PaymentRecordType;
  defaultPartyType?: 'customer' | 'supplier';
  defaultPartyId?: string;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'received',
  defaultPartyType = 'customer',
  defaultPartyId,
}) => {
  const { customers, suppliers, recordPayment, formatMoney } = useApp();

  const [type, setType] = useState<PaymentRecordType>(defaultType);
  const [partyType, setPartyType] = useState<'customer' | 'supplier'>(defaultPartyType);
  const [partyId, setPartyId] = useState<string>(() => {
    if (defaultPartyId) return defaultPartyId;
    return defaultPartyType === 'customer'
      ? customers[0]?.id || ''
      : suppliers[0]?.id || '';
  });
  const [amount, setAmount] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentParty =
    partyType === 'customer'
      ? customers.find((c) => c.id === partyId)
      : suppliers.find((s) => s.id === partyId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = amount.toString().replace(/,/g, '').trim();
    const numericAmount = parseFloat(cleanAmount);
    if (isNaN(numericAmount) || numericAmount <= 0 || !partyId) {
      setError('تکایە بڕی پارەی دروست بنووسە!');
      return;
    }

    setError(null);
    recordPayment({
      type,
      partyType,
      partyId,
      amount: numericAmount,
      note: note.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <HandCoins className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-base text-slate-900">
              {type === 'received' ? 'وەرگرتنی پارەی قەرز' : 'پاردانی قەرزی کۆمپانیا'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Type Toggle: پارە وەرگرتن / پاردان */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setType('received');
                setPartyType('customer');
                setPartyId(customers[0]?.id || '');
              }}
              className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                type === 'received'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>پارە وەرگرتن</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setType('paid');
                setPartyType('supplier');
                setPartyId(suppliers[0]?.id || '');
              }}
              className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                type === 'paid'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>پاردان</span>
            </button>
          </div>

          {/* Party Selection Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {partyType === 'customer' ? 'موشتەری قەرزدار' : 'کۆمپانیا یان دابینکەر'} *
            </label>
            <select
              value={partyId}
              onChange={(e) => setPartyId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden"
            >
              {partyType === 'customer'
                ? customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (قەرز: {formatMoney(c.debt)})
                    </option>
                  ))
                : suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (قەرز: {formatMoney(s.debt)})
                    </option>
                  ))}
            </select>
          </div>

          {/* Current Debt & Guarantor Badge */}
          {currentParty && (
            <div className="space-y-1.5">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-semibold">قەرزی ماوەی هەنووکەیی:</span>
                <span className="font-black text-amber-700">{formatMoney(currentParty.debt)}</span>
              </div>
              {partyType === 'customer' && (currentParty as Customer).guarantorName && (
                <div className="bg-indigo-50/80 p-2 rounded-xl border border-indigo-200/70 flex items-center justify-between text-xs text-indigo-950">
                  <div className="flex items-center gap-1.5 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>کەفیل: {(currentParty as Customer).guarantorName}</span>
                  </div>
                  {(currentParty as Customer).guarantorPhone && (
                    <span className="font-mono text-[11px] text-indigo-700 font-bold">
                      {(currentParty as Customer).guarantorPhone}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Inline Error Banner */}
          {error && (
            <div className="bg-rose-50 border border-rose-300 rounded-xl p-2.5 flex items-center gap-2 text-rose-800 text-xs font-bold">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Amount input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              بڕی پارەی وەرگیراو / دراو (د.ع) *
            </label>
            <div className="relative">
              <input
                type="number"
                required
                min="0.01"
                step="any"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="10000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
              {currentParty && currentParty.debt > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setAmount(currentParty.debt.toString());
                    if (error) setError(null);
                  }}
                  className="absolute left-2 top-2 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold hover:bg-blue-100 cursor-pointer"
                >
                  هەموو قەرزەکە
                </button>
              )}
            </div>
          </div>

          {/* Note input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              تێبینی (ئارەزوومەندانە)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="وەک: قیستی مانگانە، پاشماوە..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 cursor-pointer"
            >
              پاشگەزبوونەوە
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded-xl text-white text-xs font-bold shadow-xs cursor-pointer ${
                type === 'received'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              پاشەکەوتکردن (OK)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
