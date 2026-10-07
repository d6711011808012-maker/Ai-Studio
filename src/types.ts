export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'cash' | 'transfer' | 'credit_card' | 'promptpay';

export interface Category {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  color: string;
  bgColor: string;
  type: TransactionType;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  note: string;
  paymentMethod: PaymentMethod;
  createdAt: number;
}

export interface MonthlyBudget {
  month: string; // YYYY-MM
  targetAmount: number;
}

export type ViewTab = 'overview' | 'analytics' | 'transactions' | 'budgets';
