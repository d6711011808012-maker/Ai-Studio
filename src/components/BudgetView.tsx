import React, { useState } from 'react';
import { Transaction } from '../types';
import { EXPENSE_CATEGORIES } from '../data/categories';
import { CategoryIcon } from './CategoryIcon';
import { formatCurrency, formatMonthYear } from '../utils/formatters';
import { Target, AlertTriangle, CheckCircle, Edit2, TrendingDown } from 'lucide-react';

interface BudgetsViewProps {
  transactions: Transaction[];
  selectedMonth: string;
  monthlyBudget: number;
  onUpdateBudget: (month: string, amount: number) => void;
  onOpenNewTransaction: () => void;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  transactions,
  selectedMonth,
  monthlyBudget,
  onUpdateBudget,
  onOpenNewTransaction,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [budgetInput, setBudgetInput] = useState(monthlyBudget.toString());

  // Filter expenses in selected month
  const currentMonthExpenses = transactions
    .filter((t) => t.date.startsWith(selectedMonth) && t.type === 'expense');

  const totalExpense = currentMonthExpenses.reduce((sum, t) => sum + t.amount, 0);
  const remainingBudget = monthlyBudget - totalExpense;
  const percentUsed = monthlyBudget > 0 ? (totalExpense / monthlyBudget) * 100 : 0;

  // Category expenses breakdown
  const categoryExpenses: Record<string, number> = {};
  currentMonthExpenses.forEach((tx) => {
    categoryExpenses[tx.categoryId] = (categoryExpenses[tx.categoryId] || 0) + tx.amount;
  });

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(budgetInput);
    if (!isNaN(val) && val >= 0) {
      onUpdateBudget(selectedMonth, val);
      setIsEditing(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Card: Monthly Overall Budget */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">
                งบประมาณรายจ่ายประจำเดือน ({formatMonthYear(selectedMonth)})
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              กำหนดเป้าหมายการควบคุมค่าใช้จ่าย เพื่อให้เหลือเงินออมตามแผน
            </p>
          </div>

          <div>
            {isEditing ? (
              <form onSubmit={handleSaveBudget} className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  className="w-36 text-sm font-bold tabular-nums px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-800"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  บันทึก
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  ยกเลิก
                </button>
              </form>
            ) : (
              <button
                onClick={() => {
                  setBudgetInput(monthlyBudget.toString());
                  setIsEditing(true);
                }}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                <span>ปรับแก้งบประมาณ</span>
              </button>
            )}
          </div>
        </div>

        {/* Progress Display */}
        <div className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-2">
            <div>
              <span className="text-xs text-slate-500 block">ใช้จ่ายไปแล้ว</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
                {formatCurrency(totalExpense)}
              </span>
              <span className="text-xs text-slate-400 ml-2">
                จากงบ {formatCurrency(monthlyBudget)}
              </span>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-500 block">
                {remainingBudget >= 0 ? 'งบคงเหลือที่ใช้ได้' : 'ใช้เกินงบไปแล้ว'}
              </span>
              <span
                className={`text-xl sm:text-2xl font-bold tabular-nums ${
                  remainingBudget >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {formatCurrency(Math.abs(remainingBudget))}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mt-2">
            <div
              style={{ width: `${Math.min(percentUsed, 100)}%` }}
              className={`h-full transition-all duration-500 rounded-full ${
                percentUsed > 100
                  ? 'bg-rose-500'
                  : percentUsed > 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
            />
          </div>

          {/* Warning / Status */}
          <div className="mt-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              {percentUsed > 100 ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span className="text-rose-700 font-medium">
                    เกินงบประมาณที่วางไว้ {percentUsed.toFixed(1)}% ควรชะลอการใช้จ่ายที่ไม่จำเป็น
                  </span>
                </>
              ) : percentUsed > 80 ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-amber-700 font-medium">
                    ใกล้ถึงขีดจำกัดงบประมาณแล้ว (ใช้ไป {percentUsed.toFixed(1)}%)
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-emerald-700 font-medium">
                    การใช้จ่ายยังอยู่ในเกณฑ์ดี (ใช้ไป {percentUsed.toFixed(1)}%)
                  </span>
                </>
              )}
            </div>

            <span className="text-slate-400 tabular-nums">
              คิดเป็น {percentUsed.toFixed(1)}% ของงบรวม
            </span>
          </div>

        </div>
      </div>

      {/* Breakdown by Category */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              การกระจายค่าใช้จ่ายตามหมวดหมู่
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              ดูว่าเงินถูกใช้ไปกับแต่ละหมวดหมู่เท่าใดในเดือนนี้
            </p>
          </div>
          <span className="text-xs text-slate-400 tabular-nums">
            {currentMonthExpenses.length} รายการจ่าย
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {EXPENSE_CATEGORIES.map((cat) => {
            const amount = categoryExpenses[cat.id] || 0;
            const pct = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;

            return (
              <div
                key={cat.id}
                className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <CategoryIcon
                      iconName={cat.icon}
                      color={cat.color}
                      bgColor={cat.bgColor}
                      size={15}
                      className="w-7 h-7 rounded-md"
                    />
                    <span className="text-xs font-semibold text-slate-800 truncate">
                      {cat.name}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-slate-900 tabular-nums">
                      {formatCurrency(amount)}
                    </span>
                    <span className="text-[11px] text-slate-400 ml-1.5 tabular-nums">
                      ({pct.toFixed(1)}%)
                    </span>
                  </div>
                </div>

                {/* Progress Mini Bar */}
                <div className="w-full h-1.5 bg-slate-200/60 rounded-full overflow-hidden">
                  <div
                    style={{
                      width: `${pct}%`,
                      backgroundColor: cat.color,
                    }}
                    className="h-full rounded-full transition-all"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
