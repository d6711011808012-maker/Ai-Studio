import { Transaction, MonthlyBudget } from '../types';
import { INITIAL_TRANSACTIONS } from '../data/sampleData';
import { getCategoryById } from '../data/categories';
import { getPaymentMethodName } from '../utils/formatters';

const STORAGE_KEY_TX = 'finflow_transactions_v1';
const STORAGE_KEY_BUDGET = 'finflow_budgets_v1';

export function loadTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TX);
    if (!raw) {
      // First time initialization: populate sample data
      localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(INITIAL_TRANSACTIONS));
      return INITIAL_TRANSACTIONS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return INITIAL_TRANSACTIONS;
  } catch (err) {
    console.error('Error loading transactions from localStorage:', err);
    return INITIAL_TRANSACTIONS;
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(transactions));
  } catch (err) {
    console.error('Error saving transactions to localStorage:', err);
  }
}

export function loadBudgets(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BUDGET);
    if (!raw) {
      // Default sample budget for October 2026: 35,000 THB
      const initialBudgets: Record<string, number> = {
        '2026-10': 35000,
        '2026-09': 35000,
        '2026-08': 38000,
      };
      localStorage.setItem(STORAGE_KEY_BUDGET, JSON.stringify(initialBudgets));
      return initialBudgets;
    }
    return JSON.parse(raw) || {};
  } catch (err) {
    console.error('Error loading budgets:', err);
    return {};
  }
}

export function saveBudget(month: string, amount: number): void {
  try {
    const budgets = loadBudgets();
    budgets[month] = amount;
    localStorage.setItem(STORAGE_KEY_BUDGET, JSON.stringify(budgets));
  } catch (err) {
    console.error('Error saving budget:', err);
  }
}

export function exportTransactionsCSV(transactions: Transaction[]): void {
  const headers = ['วันที่', 'เวลา', 'ประเภท', 'หมวดหมู่', 'จำนวนเงิน(บาท)', 'วิธีชำระ', 'หมายเหตุ'];
  
  const rows = transactions.map((tx) => {
    const cat = getCategoryById(tx.categoryId);
    const typeLabel = tx.type === 'income' ? 'รายรับ' : 'รายจ่าย';
    const methodLabel = getPaymentMethodName(tx.paymentMethod);
    const safeNote = `"${(tx.note || '').replace(/"/g, '""')}"`;
    return [
      tx.date,
      tx.time || '',
      typeLabel,
      cat.name,
      tx.amount.toFixed(2),
      methodLabel,
      safeNote,
    ].join(',');
  });

  // Include UTF-8 BOM so Thai text displays correctly in Excel
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `บันทึกรายรับรายจ่าย_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportBackupJSON(transactions: Transaction[], budgets: Record<string, number>): void {
  const backupData = {
    appName: 'FinFlow Expense & Income Tracker',
    version: '1.0',
    exportDate: new Date().toISOString(),
    transactions,
    budgets,
  };

  const jsonStr = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup_expense_data_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function restoreSampleData(): Transaction[] {
  localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(INITIAL_TRANSACTIONS));
  return INITIAL_TRANSACTIONS;
}

export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEY_TX);
  localStorage.removeItem(STORAGE_KEY_BUDGET);
}
