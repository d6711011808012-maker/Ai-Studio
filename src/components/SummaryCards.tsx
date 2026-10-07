import React from 'react';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface SummaryCardsProps {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  savingsRate: number;
  prevIncome?: number;
  prevExpense?: number;
  monthlyBudget?: number;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalIncome,
  totalExpense,
  netBalance,
  savingsRate,
  prevIncome,
  prevExpense,
  monthlyBudget,
}) => {
  // Income comparison %
  const incomeDiff = prevIncome !== undefined && prevIncome > 0
    ? ((totalIncome - prevIncome) / prevIncome) * 100
    : null;

  // Expense comparison %
  const expenseDiff = prevExpense !== undefined && prevExpense > 0
    ? ((totalExpense - prevExpense) / prevExpense) * 100
    : null;

  // Budget used %
  const budgetUsedPercent = monthlyBudget && monthlyBudget > 0
    ? Math.min(Math.round((totalExpense / monthlyBudget) * 100), 200)
    : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* 1. Total Income */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
          <span>รายรับทั้งหมด</span>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="text-2xl font-bold text-slate-900 tabular-nums tracking-tight">
          {formatCurrency(totalIncome)}
        </div>

        <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
          {incomeDiff !== null ? (
            <span className={`inline-flex items-center font-medium ${incomeDiff >= 0 ? 'text-emerald-600' : 'text-slate-600'}`}>
              {incomeDiff >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {Math.abs(incomeDiff).toFixed(1)}%
            </span>
          ) : (
            <span className="text-slate-400">เดือนนี้</span>
          )}
          <span className="text-slate-400">เทียบเดือนก่อนหน้า</span>
        </div>
      </div>

      {/* 2. Total Expense */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
          <span>รายจ่ายทั้งหมด</span>
          <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>

        <div className="text-2xl font-bold text-slate-900 tabular-nums tracking-tight">
          {formatCurrency(totalExpense)}
        </div>

        <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
          {expenseDiff !== null ? (
            <span className={`inline-flex items-center font-medium ${expenseDiff <= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {expenseDiff > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {Math.abs(expenseDiff).toFixed(1)}%
            </span>
          ) : (
            <span className="text-slate-400">เดือนนี้</span>
          )}
          <span className="text-slate-400">เทียบเดือนก่อนหน้า</span>
        </div>
      </div>

      {/* 3. Net Savings / Balance */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
          <span>เงินคงเหลือสุทธิ</span>
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
        </div>

        <div className={`text-2xl font-bold tabular-nums tracking-tight ${netBalance >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
          {formatCurrency(netBalance, true)}
        </div>

        <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
          <span>สถานะการเงิน:</span>
          <span className={`font-medium ${netBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {netBalance >= 0 ? 'เป็นบวก (มีเงินออม)' : 'ติดลบ (ใช้จ่ายเกิน)'}
          </span>
        </div>
      </div>

      {/* 4. Savings Rate or Budget Progress */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
          <span>อัตราการออมเงิน</span>
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <PiggyBank className="w-4 h-4" />
          </div>
        </div>

        <div className="text-2xl font-bold text-slate-900 tabular-nums tracking-tight">
          {savingsRate.toFixed(1)}%
        </div>

        <div className="mt-2 text-xs text-slate-500">
          {monthlyBudget ? (
            <div className="flex items-center gap-1.5">
              <span>งบที่ใช้:</span>
              <span className={`font-semibold tabular-nums ${(budgetUsedPercent || 0) > 100 ? 'text-rose-600' : (budgetUsedPercent || 0) > 85 ? 'text-amber-600' : 'text-slate-700'}`}>
                {budgetUsedPercent}%
              </span>
              <span className="text-slate-400">จาก ฿{monthlyBudget.toLocaleString()}</span>
            </div>
          ) : (
            <span className="text-slate-500">
              {totalIncome > 0 ? `ออมได้ ฿${Math.max(0, netBalance).toLocaleString()}` : 'ยังไม่มีรายรับ'}
            </span>
          )}
        </div>
      </div>

    </div>
  );
};
