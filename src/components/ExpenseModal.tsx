import React, { useState } from 'react';
import { X, Receipt, DollarSign, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({ isOpen, onClose }) => {
  const { addExpense } = useApp();

  const [titleKu, setTitleKu] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryKu, setCategoryKu] = useState('ڕۆژانە');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleKu.trim() || !amount) return;

    addExpense({
      titleKu: titleKu.trim(),
      titleEn: titleKu.trim(),
      amount: parseFloat(amount) || 0,
      categoryKu,
      categoryEn: categoryKu,
      date,
      note: note.trim(),
    });

    onClose();
    setTitleKu('');
    setAmount('');
    setNote('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-rose-600" />
            <h3 className="font-extrabold text-base text-slate-900">تۆمارکردنی خەرجی نوێ</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              بابەتی خەرجی *
            </label>
            <input
              type="text"
              required
              value={titleKu}
              onChange={(e) => setTitleKu(e.target.value)}
              placeholder="وەک: خەرجی ڕۆژانە و چا، کرێی تاکسی..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                بڕی پارە (د.ع) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="450"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-rose-600 focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                جۆری خەرجی
              </label>
              <select
                value={categoryKu}
                onChange={(e) => setCategoryKu(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:outline-hidden"
              >
                <option value="ڕۆژانە">ڕۆژانە</option>
                <option value="کرێ">کرێ</option>
                <option value="گواستنەوە">گواستنەوە</option>
                <option value="مووچە">مووچە</option>
                <option value="چاککردنەوە">چاککردنەوە</option>
                <option value="هیتر">هیتر</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">بەروار</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              تێبینی (ئارەزوومەندانە)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="تێبینی بنووسە..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:outline-hidden"
            />
          </div>

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
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              تۆمارکردن
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
