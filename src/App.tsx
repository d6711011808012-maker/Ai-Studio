import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, ViewTab } from './types';
import { 
  loadTransactions, 
  saveTransactions, 
  loadBudgets, 
  saveBudget 
} from './services/storage';
import { getCurrentYearMonth } from './utils/formatters';
import { Navbar } from './components/Navbar';
import { MonthSelector } from './components/MonthSelector';
import { SummaryCards } from './components/SummaryCards';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { TransactionList } from './components/TransactionList';
import { BudgetsView } from './components/BudgetView';
import { TransactionModal } from './components/TransactionModal';
import { ExportImportModal } from './components/ExportImportModal';
import { 
  PlusCircle, 
  ArrowRight, 
  ShieldCheck, 
  Database, 
  PieChart as PieIcon, 
  ReceiptText 
} from 'lucide-react';

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Record<string, number>>({});
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentYearMonth());
  const [activeTab, setActiveTab] = useState<ViewTab>('overview');

  // Modal States
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Initialize data from local storage
  useEffect(() => {
    const loadedTx = loadTransactions();
    const loadedBdg = loadBudgets();
    setTransactions(loadedTx);
    setBudgets(loadedBdg);
  }, []);

  // Update storage on transactions change
  const handleTransactionsChange = (newTxList: Transaction[]) => {
    setTransactions(newTxList);
    saveTransactions(newTxList);
  };

  // Add or Edit Transaction
  const handleSaveTransaction = (data: Omit<Transaction, 'id' | 'createdAt'> & { id?: string }) => {
    if (data.id) {
      // Edit existing
      const updated = transactions.map((t) => {
        if (t.id === data.id) {
          return {
            ...t,
            ...data,
          };
        }
        return t;
      });
      handleTransactionsChange(updated);
    } else {
      // Add new
      const newTx: Transaction = {
        ...data,
        id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        createdAt: Date.now(),
      };
      handleTransactionsChange([newTx, ...transactions]);
    }
  };

  // Delete Transaction
  const handleDeleteTransaction = (id: string) => {
    if (confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?')) {
      const updated = transactions.filter((t) => t.id !== id);
      handleTransactionsChange(updated);
    }
  };

  // Update Budget
  const handleUpdateBudget = (month: string, amount: number) => {
    saveBudget(month, amount);
    setBudgets((prev) => ({ ...prev, [month]: amount }));
  };

  // Calculate statistics for selected month
  const currentMonthTx = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  const totalIncome = useMemo(() => {
    return currentMonthTx
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [currentMonthTx]);

  const totalExpense = useMemo(() => {
    return currentMonthTx
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [currentMonthTx]);

  const netBalance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.max(0, (netBalance / totalIncome) * 100) : 0;

  // Previous month statistics for delta calculation
  const prevMonthStr = useMemo(() => {
    const [yearStr, monthStr] = selectedMonth.split('-');
    let year = parseInt(yearStr, 10);
    let month = parseInt(monthStr, 10) - 1;
    if (month < 1) {
      month = 12;
      year -= 1;
    }
    return `${year}-${String(month).padStart(2, '0')}`;
  }, [selectedMonth]);

  const prevMonthTx = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(prevMonthStr));
  }, [transactions, prevMonthStr]);

  const prevIncome = useMemo(() => {
    return prevMonthTx
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [prevMonthTx]);

  const prevExpense = useMemo(() => {
    return prevMonthTx
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [prevMonthTx]);

  // Available months list for selector
  const availableMonths = useMemo(() => {
    const months = new Set(transactions.map((t) => t.date.slice(0, 7)));
    months.add(getCurrentYearMonth());
    months.add(selectedMonth);
    return Array.from(months).sort().reverse();
  }, [transactions, selectedMonth]);

  const monthlyBudget = budgets[selectedMonth] || 35000;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenNewTransaction={() => {
          setEditingTx(null);
          setIsTxModalOpen(true);
        }}
        onOpenExportImport={() => setIsExportModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Month Selector & Quick Info Header */}
        <MonthSelector
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          availableMonths={availableMonths}
        />

        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* 4 Summary Stat Cards */}
            <SummaryCards
              totalIncome={totalIncome}
              totalExpense={totalExpense}
              netBalance={netBalance}
              savingsRate={savingsRate}
              prevIncome={prevIncome}
              prevExpense={prevExpense}
              monthlyBudget={monthlyBudget}
            />

            {/* Visual Analytics Preview Banner */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <PieIcon className="w-4 h-4 text-slate-500" />
                    กราฟวิเคราะห์รายรับ-รายจ่าย
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    เปรียบเทียบแนวโน้มการเงินและสัดส่วนค่าใช้จ่ายตามหมวดหมู่
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className="text-xs font-semibold text-slate-800 hover:text-indigo-600 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>ดูกราฟฉบับเต็ม</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Analytics Section Component */}
              <AnalyticsCharts
                transactions={transactions}
                selectedMonth={selectedMonth}
                onSelectMonth={setSelectedMonth}
              />
            </div>

            {/* Recent Transactions in Selected Month */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <ReceiptText className="w-4 h-4 text-slate-500" />
                    รายการบันทึกล่าสุดประจำเดือน
                  </h3>
                  <p className="text-xs text-slate-500">
                    มีทั้งหมด {currentMonthTx.length} รายการในเดือนนี้
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('transactions')}
                    className="text-xs font-semibold text-slate-800 hover:text-indigo-600 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>ดูทั้งหมด / ค้นหา</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <TransactionList
                transactions={transactions}
                selectedMonth={selectedMonth}
                onEditTransaction={(tx) => {
                  setEditingTx(tx);
                  setIsTxModalOpen(true);
                }}
                onDeleteTransaction={handleDeleteTransaction}
                onOpenNewTransaction={() => {
                  setEditingTx(null);
                  setIsTxModalOpen(true);
                }}
              />
            </div>

          </div>
        )}

        {/* 2. ANALYTICS CHARTS TAB */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  วิเคราะห์ข้อมูลทางการเงินเชิงลึก
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  ตรวจดูแนวโน้มรายรับ-รายจ่ายย้อนหลัง สัดส่วนหมวดหมู่ และการใช้จ่ายรายวัน
                </p>
              </div>
            </div>

            <AnalyticsCharts
              transactions={transactions}
              selectedMonth={selectedMonth}
              onSelectMonth={setSelectedMonth}
            />
          </div>
        )}

        {/* 3. TRANSACTIONS TAB */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  บันทึกรายการทั้งหมด
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  ค้นหา กรองตามประเภท และแก้ไขหรือลบรายการได้อย่างรวดเร็ว
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingTx(null);
                  setIsTxModalOpen(true);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>เพิ่มรายการ</span>
              </button>
            </div>

            <TransactionList
              transactions={transactions}
              selectedMonth={selectedMonth}
              onEditTransaction={(tx) => {
                setEditingTx(tx);
                setIsTxModalOpen(true);
              }}
              onDeleteTransaction={handleDeleteTransaction}
              onOpenNewTransaction={() => {
                setEditingTx(null);
                setIsTxModalOpen(true);
              }}
            />
          </div>
        )}

        {/* 4. BUDGETS TAB */}
        {activeTab === 'budgets' && (
          <div className="space-y-6">
            <BudgetsView
              transactions={transactions}
              selectedMonth={selectedMonth}
              monthlyBudget={monthlyBudget}
              onUpdateBudget={handleUpdateBudget}
              onOpenNewTransaction={() => {
                setEditingTx(null);
                setIsTxModalOpen(true);
              }}
            />
          </div>
        )}

      </main>

      {/* Footer & Storage Status */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>ข้อมูลบันทึกในเบราว์เซอร์ของคุณอย่างปลอดภัย พร้อมส่งออกเป็น CSV และ JSON</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              ส่งออกไฟล์ CSV สำหรับ Excel
            </button>
            <span aria-hidden="true">·</span>
            <span>บันทึกรายรับรายจ่าย © 2026</span>
          </div>

        </div>
      </footer>

      {/* Transaction Modal (Add / Edit) */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTx(null);
        }}
        onSave={handleSaveTransaction}
        initialData={editingTx}
        defaultMonth={selectedMonth}
      />

      {/* Export / Import Modal */}
      <ExportImportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        transactions={transactions}
        budgets={budgets}
        onDataImported={(newTx, newBudgets) => {
          handleTransactionsChange(newTx);
          if (newBudgets) setBudgets(newBudgets);
        }}
      />

    </div>
  );
}
