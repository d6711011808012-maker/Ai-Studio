import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { formatMonthYear, getCurrentYearMonth, THAI_MONTH_NAMES } from '../utils/formatters';

interface MonthSelectorProps {
  selectedMonth: string; // YYYY-MM
  onMonthChange: (month: string) => void;
  availableMonths: string[];
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({
  selectedMonth,
  onMonthChange,
  availableMonths,
}) => {
  const currentMonthStr = getCurrentYearMonth();
  const isCurrentMonth = selectedMonth === currentMonthStr;

  const handlePrev = () => {
    const [yearStr, monthStr] = selectedMonth.split('-');
    let year = parseInt(yearStr, 10);
    let month = parseInt(monthStr, 10) - 1;
    if (month < 1) {
      month = 12;
      year -= 1;
    }
    const newMonth = `${year}-${String(month).padStart(2, '0')}`;
    onMonthChange(newMonth);
  };

  const handleNext = () => {
    const [yearStr, monthStr] = selectedMonth.split('-');
    let year = parseInt(yearStr, 10);
    let month = parseInt(monthStr, 10) + 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
    const newMonth = `${year}-${String(month).padStart(2, '0')}`;
    onMonthChange(newMonth);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-slate-200">
      <div className="flex items-center gap-2">
        <button
          onClick={handlePrev}
          title="เดือนก่อนหน้า"
          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <h2 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight">
            {formatMonthYear(selectedMonth)}
          </h2>
        </div>

        <button
          onClick={handleNext}
          title="เดือนถัดไป"
          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        {!isCurrentMonth && (
          <button
            onClick={() => onMonthChange(currentMonthStr)}
            className="text-xs font-medium text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            กลับสู่เดือนปัจจุบัน
          </button>
        )}

        <select
          value={selectedMonth}
          onChange={(e) => onMonthChange(e.target.value)}
          className="text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
        >
          {/* Ensure at least current and recent months are in dropdown */}
          {Array.from(new Set([...availableMonths, currentMonthStr, '2026-09', '2026-08', '2026-07', '2026-06', '2026-05']))
            .sort()
            .reverse()
            .map((m) => (
              <option key={m} value={m}>
                {formatMonthYear(m)}
              </option>
            ))}
        </select>
      </div>
    </div>
  );
};
