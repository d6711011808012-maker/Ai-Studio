import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, PaymentMethod } from '../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, getCategoryById } from '../data/categories';
import { CategoryIcon } from './CategoryIcon';
import { getCurrentDateStr } from '../utils/formatters';
import { X, Check, Plus, AlertCircle } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id' | 'createdAt'> & { id?: string }) => void;
  initialData?: Transaction | null;
  defaultMonth?: string;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  defaultMonth,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amountStr, setAmountStr] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(getCurrentDateStr());
  const [time, setTime] = useState('12:00');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('promptpay');
  const [error, setError] = useState('');

  // Synchronize state when editing or opening
  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setAmountStr(initialData.amount.toString());
      setCategoryId(initialData.categoryId);
      setDate(initialData.date);
      setTime(initialData.time || '12:00');
      setNote(initialData.note || '');
      setPaymentMethod(initialData.paymentMethod);
    } else {
      setType('expense');
      setAmountStr('');
      setCategoryId(EXPENSE_CATEGORIES[0].id);
      // Default to selected month if provided and in same year
      if (defaultMonth) {
        const today = getCurrentDateStr();
        if (today.startsWith(defaultMonth)) {
          setDate(today);
        } else {
          setDate(`${defaultMonth}-01`);
        }
      } else {
        setDate(getCurrentDateStr());
      }
      const now = new Date();
      setTime(
        `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      );
      setNote('');
      setPaymentMethod('promptpay');
    }
    setError('');
  }, [initialData, isOpen, defaultMonth]);

  // Adjust default category if type flips
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'expense') {
      setCategoryId(EXPENSE_CATEGORIES[0].id);
    } else {
      setCategoryId(INCOME_CATEGORIES[0].id);
    }
  };

  const handleQuickAddAmount = (add: number) => {
    const current = parseFloat(amountStr) || 0;
    setAmountStr((current + add).toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amountStr);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('กรุณากรอกจำนวนเงินที่ถูกต้อง (มากกว่า 0)');
      return;
    }

    if (!categoryId) {
      setError('กรุณาเลือกหมวดหมู่');
      return;
    }

    if (!date) {
      setError('กรุณาระบุวันที่');
      return;
    }

    onSave({
      id: initialData?.id,
      type,
      amount: Math.round(parsedAmount * 100) / 100,
      categoryId,
      date,
      time,
      note: note.trim(),
      paymentMethod,
    });
    onClose();
  };

  if (!isOpen) return null;

  const currentCategories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">
            {initialData ? 'แก้ไขรายการบันทึก' : 'บันทึกรายการใหม่'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Type Selector (รายจ่าย vs รายรับ) */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                type === 'expense'
                  ? 'bg-white text-rose-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายจ่าย (Expense)
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                type === 'income'
                  ? 'bg-white text-emerald-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายรับ (Income)
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              จำนวนเงิน (บาท) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">
                ฿
              </span>
              <input
                type="number"
                step="any"
                min="0"
                required
                autoFocus
                placeholder="0.00"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-full text-xl font-bold tabular-nums pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 focus:bg-white"
              />
            </div>

            {/* Quick Amount Presets */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[11px] text-slate-400 mr-1">ปุ่มด่วน:</span>
              {[50, 100, 500, 1000, 5000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAddAmount(val)}
                  className="px-2 py-0.5 text-[11px] font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer tabular-nums"
                >
                  +{val.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Category Grid */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              หมวดหมู่ *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-100 rounded-xl bg-slate-50/50">
              {currentCategories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg text-left transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-white border-slate-800 shadow-xs'
                        : 'bg-white/60 border-transparent hover:bg-white hover:border-slate-200'
                    }`}
                  >
                    <CategoryIcon
                      iconName={cat.icon}
                      color={cat.color}
                      bgColor={cat.bgColor}
                      size={15}
                      className="w-7 h-7 rounded-md"
                    />
                    <span className="text-xs font-medium text-slate-800 truncate">
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                วันที่ทำรายการ *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                เวลา (ไม่บังคับ)
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              ช่องทางการชำระเงิน
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'promptpay', label: 'พร้อมเพย์' },
                { id: 'transfer', label: 'โอนเงิน/แอป' },
                { id: 'credit_card', label: 'บัตรเครดิต' },
                { id: 'cash', label: 'เงินสด' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                  className={`py-1.5 px-2 text-xs font-medium rounded-lg border text-center transition-all cursor-pointer ${
                    paymentMethod === m.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Note / Memo */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              บันทึกช่วยจำ / รายละเอียด
            </label>
            <input
              type="text"
              placeholder="เช่น ข้าวผัดกะเพราพิเศษ, กาแฟสด, ค่าบริการรายเดือน..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{initialData ? 'บันทึกการแก้ไข' : 'บันทึกรายการ'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
