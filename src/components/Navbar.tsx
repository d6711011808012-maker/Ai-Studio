import React from 'react';
import { ViewTab } from '../types';
import { 
  PlusCircle, 
  Download, 
  LayoutDashboard, 
  PieChart, 
  ReceiptText, 
  Target,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  activeTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  onOpenNewTransaction: () => void;
  onOpenExportImport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenNewTransaction,
  onOpenExportImport,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Strict 3-Zone Top Bar Contract */}
        <div className="flex items-center justify-between h-16">
          
          {/* Zone 1: Single Wordmark Brand Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              ฿
            </div>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); onTabChange('overview'); }}
              className="text-lg font-bold tracking-tight text-slate-900 hover:text-indigo-600 transition-colors whitespace-nowrap"
            >
              สมุดบัญชีรายรับรายจ่าย
            </a>
          </div>

          {/* Zone 2: Clean 4 Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl">
            <button
              onClick={() => onTabChange('overview')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              ภาพรวมเดือนนี้
            </button>
            <button
              onClick={() => onTabChange('analytics')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PieChart className="w-3.5 h-3.5" />
              วิเคราะห์กราฟ
            </button>
            <button
              onClick={() => onTabChange('transactions')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'transactions'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ReceiptText className="w-3.5 h-3.5" />
              รายการทั้งหมด
            </button>
            <button
              onClick={() => onTabChange('budgets')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'budgets'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              เป้าหมายงบประมาณ
            </button>
          </nav>

          {/* Zone 3: 1-2 Primary Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenExportImport}
              title="สำรองหรือส่งออกข้อมูล"
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">สำรอง/ส่งออก</span>
            </button>

            <button
              onClick={onOpenNewTransaction}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-all flex items-center gap-1.5 shadow-xs whitespace-nowrap cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>บันทึกรายการ</span>
            </button>
          </div>

        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 text-xs">
          <button
            onClick={() => onTabChange('overview')}
            className={`px-2 py-1 font-medium transition-colors ${
              activeTab === 'overview' ? 'text-indigo-600 font-semibold' : 'text-slate-600'
            }`}
          >
            ภาพรวม
          </button>
          <button
            onClick={() => onTabChange('analytics')}
            className={`px-2 py-1 font-medium transition-colors ${
              activeTab === 'analytics' ? 'text-indigo-600 font-semibold' : 'text-slate-600'
            }`}
          >
            กราฟวิเคราะห์
          </button>
          <button
            onClick={() => onTabChange('transactions')}
            className={`px-2 py-1 font-medium transition-colors ${
              activeTab === 'transactions' ? 'text-indigo-600 font-semibold' : 'text-slate-600'
            }`}
          >
            รายการ
          </button>
          <button
            onClick={() => onTabChange('budgets')}
            className={`px-2 py-1 font-medium transition-colors ${
              activeTab === 'budgets' ? 'text-indigo-600 font-semibold' : 'text-slate-600'
            }`}
          >
            งบประมาณ
          </button>
        </div>

      </div>
    </header>
  );
};
