import React, { useState } from 'react';
import { Transaction } from '../types';
import { getCategoryById, ALL_CATEGORIES } from '../data/categories';
import { formatCurrency, formatThaiDate, getPaymentMethodName } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import { 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Plus, 
  ArrowDownLeft, 
  ArrowUpRight,
  Inbox
} from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  selectedMonth: string;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenNewTransaction: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  selectedMonth,
  onEditTransaction,
  onDeleteTransaction,
  onOpenNewTransaction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [monthScope, setMonthScope] = useState<'selected' | 'all'>('selected');

  // Filter transactions
  const filtered = transactions.filter((tx) => {
    // Month scope
    if (monthScope === 'selected' && !tx.date.startsWith(selectedMonth)) {
      return false;
    }

    // Type filter
    if (typeFilter !== 'all' && tx.type !== typeFilter) {
      return false;
    }

    // Category filter
    if (categoryFilter !== 'all' && tx.categoryId !== categoryFilter) {
      return false;
    }

    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const cat = getCategoryById(tx.categoryId);
      const matchNote = tx.note.toLowerCase().includes(q);
      const matchCat = cat.name.toLowerCase().includes(q);
      const matchAmount = tx.amount.toString().includes(q);
      if (!matchNote && !matchCat && !matchAmount) {
        return false;
      }
    }

    return true;
  });

  // Sort by date desc, then by createdAt desc
  filtered.sort((a, b) => {
    if (b.date !== a.date) return b.date.localeCompare(a.date);
    return b.createdAt - a.createdAt;
  });

  // Group by date
  const groupedByDate: Record<string, Transaction[]> = {};
  filtered.forEach((tx) => {
    if (!groupedByDate[tx.date]) {
      groupedByDate[tx.date] = [];
    }
    groupedByDate[tx.date].push(tx);
  });

  const dates = Object.keys(groupedByDate).sort().reverse();

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5">
      
      {/* Top Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาตามโน้ต, หมวดหมู่, หรือจำนวนเงิน..."
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Month Scope Toggle */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => setMonthScope('selected')}
              className={`px-2.5 py-1 font-medium rounded-md transition-colors cursor-pointer ${
                monthScope === 'selected'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              เฉพาะเดือนนี้
            </button>
            <button
              onClick={() => setMonthScope('all')}
              className={`px-2.5 py-1 font-medium rounded-md transition-colors cursor-pointer ${
                monthScope === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ทุกช่วงเวลา
            </button>
          </div>

          {/* Type Segmented Tab */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-2 py-1 font-medium rounded-md transition-colors cursor-pointer ${
                typeFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`px-2 py-1 font-medium rounded-md transition-colors cursor-pointer ${
                typeFilter === 'income'
                  ? 'bg-white text-emerald-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายรับ
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-2 py-1 font-medium rounded-md transition-colors cursor-pointer ${
                typeFilter === 'expense'
                  ? 'bg-white text-rose-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายจ่าย
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
          >
            <option value="all">ทุกหมวดหมู่</option>
            {ALL_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

        </div>

      </div>

      {/* Transactions List */}
      <div className="pt-4 space-y-5">
        {dates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <Inbox className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800">ไม่พบรายการบันทึก</p>
            <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
              {searchTerm || categoryFilter !== 'all' || typeFilter !== 'all'
                ? 'ลองปรับเปลี่ยนเงื่อนไขการค้นหาหรือตัวกรอง'
                : 'เริ่มต้นบันทึกรายรับหรือรายจ่ายรายการแรกของเดือนนี้'}
            </p>
            <button
              onClick={onOpenNewTransaction}
              className="text-xs font-semibold text-white bg-slate-900 px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              เพิ่มรายการใหม่
            </button>
          </div>
        ) : (
          dates.map((dateStr) => {
            const dayTxList = groupedByDate[dateStr];
            const dayIncome = dayTxList
              .filter((t) => t.type === 'income')
              .reduce((sum, t) => sum + t.amount, 0);
            const dayExpense = dayTxList
              .filter((t) => t.type === 'expense')
              .reduce((sum, t) => sum + t.amount, 0);

            return (
              <div key={dateStr} className="space-y-1.5">
                
                {/* Date Header: Clean unboxed metadata with separators */}
                <div className="flex items-center justify-between text-xs text-slate-500 px-2 py-1 bg-slate-50/70 rounded-md">
                  <span className="font-semibold text-slate-700">
                    {formatThaiDate(dateStr)}
                  </span>
                  
                  <div className="flex items-center gap-3 tabular-nums text-[11px]">
                    {dayIncome > 0 && (
                      <span className="text-emerald-600 font-medium">
                        รับ +{formatCurrency(dayIncome)}
                      </span>
                    )}
                    {dayExpense > 0 && (
                      <span className="text-rose-600 font-medium">
                        จ่าย -{formatCurrency(dayExpense)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Rows */}
                <div className="divide-y divide-slate-100">
                  {dayTxList.map((tx) => {
                    const cat = getCategoryById(tx.categoryId);
                    const isIncome = tx.type === 'income';

                    return (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between py-2.5 px-2 hover:bg-slate-50/80 rounded-lg transition-colors group"
                      >
                        {/* Left: Icon & Description */}
                        <div className="flex items-center gap-3 min-w-0 pr-3">
                          <CategoryIcon
                            iconName={cat.icon}
                            color={cat.color}
                            bgColor={cat.bgColor}
                            size={16}
                            className="w-9 h-9 rounded-lg"
                          />

                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                              {tx.note || cat.name}
                            </p>
                            
                            {/* Zero-Pill Metadata Line */}
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                              <span className="text-slate-600">{cat.name}</span>
                              <span aria-hidden="true">·</span>
                              <span>{getPaymentMethodName(tx.paymentMethod)}</span>
                              {tx.time && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="tabular-nums">{tx.time} น.</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: Amount & Actions */}
                        <div className="flex items-center gap-3 shrink-0">
                          <span
                            className={`text-sm sm:text-base font-bold tabular-nums ${
                              isIncome ? 'text-emerald-600' : 'text-slate-900'
                            }`}
                          >
                            {isIncome ? `+${formatCurrency(tx.amount)}` : `-${formatCurrency(tx.amount)}`}
                          </span>

                          {/* Action Buttons (Visible on hover on desktop, always visible on mobile) */}
                          <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => onEditTransaction(tx)}
                              title="แก้ไขรายการ"
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteTransaction(tx.id)}
                              title="ลบรายการ"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
