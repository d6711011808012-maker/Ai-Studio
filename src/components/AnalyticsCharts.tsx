import React, { useState } from 'react';
import { Transaction } from '../types';
import { ALL_CATEGORIES, getCategoryById } from '../data/categories';
import { formatCurrency, formatShortMonth } from '../utils/formatters';
import { 
  BarChart3, 
  PieChart as PieIcon, 
  TrendingUp, 
  Calendar, 
  AlertCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface AnalyticsChartsProps {
  transactions: Transaction[];
  selectedMonth: string;
  onSelectMonth?: (month: string) => void;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  transactions,
  selectedMonth,
  onSelectMonth,
}) => {
  const [breakdownType, setBreakdownType] = useState<'expense' | 'income'>('expense');
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // 1. Calculate Monthly History (Last 6 distinct months)
  const allMonths = Array.from(
    new Set(transactions.map((t) => t.date.slice(0, 7)))
  ).sort();

  // Pick last 6 months up to selectedMonth or overall
  const recentMonths = allMonths.slice(-6);
  if (!recentMonths.includes(selectedMonth) && selectedMonth) {
    recentMonths.push(selectedMonth);
    recentMonths.sort();
  }

  const monthlyHistory = recentMonths.map((m) => {
    const monthTx = transactions.filter((t) => t.date.startsWith(m));
    const income = monthTx
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = monthTx
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      month: m,
      income,
      expense,
      net: income - expense,
    };
  });

  const maxMonthValue = Math.max(
    ...monthlyHistory.map((m) => Math.max(m.income, m.expense)),
    10000
  );

  // 2. Category Breakdown for current selected month
  const currentMonthTx = transactions.filter((t) => t.date.startsWith(selectedMonth));
  const filteredTx = currentMonthTx.filter((t) => t.type === breakdownType);
  const totalAmountForType = filteredTx.reduce((sum, t) => sum + t.amount, 0);

  const categoryAggregates: Record<string, number> = {};
  filteredTx.forEach((tx) => {
    categoryAggregates[tx.categoryId] = (categoryAggregates[tx.categoryId] || 0) + tx.amount;
  });

  const categoryData = Object.entries(categoryAggregates)
    .map(([catId, amount]) => {
      const category = getCategoryById(catId);
      const percentage = totalAmountForType > 0 ? (amount / totalAmountForType) * 100 : 0;
      return {
        id: catId,
        category,
        amount,
        percentage,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  // 3. Daily spending in selected month
  const daysInMonth = 31;
  const dailySpend: Record<number, { expense: number; income: number }> = {};
  for (let i = 1; i <= daysInMonth; i++) {
    dailySpend[i] = { expense: 0, income: 0 };
  }
  currentMonthTx.forEach((t) => {
    const day = parseInt(t.date.split('-')[2], 10);
    if (dailySpend[day]) {
      if (t.type === 'expense') dailySpend[day].expense += t.amount;
      else dailySpend[day].income += t.amount;
    }
  });

  const maxDailyExpense = Math.max(
    ...Object.values(dailySpend).map((d) => d.expense),
    1000
  );

  // 4. Quick Insights
  const topExpenseTx = currentMonthTx
    .filter((t) => t.type === 'expense')
    .sort((a, b) => b.amount - a.amount)[0];

  const totalExpenseThisMonth = currentMonthTx
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const activeDays = new Set(
    currentMonthTx.filter((t) => t.type === 'expense').map((t) => t.date)
  ).size;
  const avgDailySpend = activeDays > 0 ? totalExpenseThisMonth / activeDays : 0;

  // SVG Donut calculations
  let accumulatedAngle = 0;
  const donutSlices = categoryData.map((item) => {
    const sliceAngle = (item.percentage / 100) * 360;
    const startAngle = accumulatedAngle;
    accumulatedAngle += sliceAngle;
    return {
      ...item,
      startAngle,
      endAngle: accumulatedAngle,
    };
  });

  function getDonutCoordinates(angleInDegrees: number, radius: number) {
    const radians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: 100 + radius * Math.cos(radians),
      y: 100 + radius * Math.sin(radians),
    };
  }

  function createDonutArc(startAngle: number, endAngle: number, innerR = 52, outerR = 86) {
    // Edge case: full circle
    const isFull = endAngle - startAngle >= 359.9;
    const effEndAngle = isFull ? startAngle + 359.99 : endAngle;

    const startOuter = getDonutCoordinates(startAngle, outerR);
    const endOuter = getDonutCoordinates(effEndAngle, outerR);
    const startInner = getDonutCoordinates(effEndAngle, innerR);
    const endInner = getDonutCoordinates(startAngle, innerR);
    const largeArcFlag = effEndAngle - startAngle <= 180 ? '0' : '1';

    return [
      `M ${startOuter.x} ${startOuter.y}`,
      `A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${endOuter.x} ${endOuter.y}`,
      `L ${startInner.x} ${startInner.y}`,
      `A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${endInner.x} ${endInner.y}`,
      'Z',
    ].join(' ');
  }

  return (
    <div className="space-y-6">
      
      {/* Upper Grid: Monthly Comparison & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* 1. Monthly Bar Chart (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-slate-500" />
                เปรียบเทียบรายรับ-รายจ่าย รายเดือน
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                คลิกแท่งกราฟของแต่ละเดือนเพื่อสลับดูข้อมูลเฉพาะเดือนนั้นได้ทันที
              </p>
            </div>
            
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block"></span>
                รายรับ
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-xs bg-rose-500 inline-block"></span>
                รายจ่าย
              </span>
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="pt-4 pb-2">
            <div className="h-56 flex items-end justify-between gap-2 sm:gap-4 px-2 border-b border-slate-100">
              {monthlyHistory.map((item) => {
                const incomeHeight = Math.max(4, Math.round((item.income / maxMonthValue) * 100));
                const expenseHeight = Math.max(4, Math.round((item.expense / maxMonthValue) * 100));
                const isSelected = item.month === selectedMonth;

                return (
                  <div
                    key={item.month}
                    onClick={() => onSelectMonth?.(item.month)}
                    onMouseEnter={() => setHoveredMonth(item.month)}
                    onMouseLeave={() => setHoveredMonth(null)}
                    className={`flex-1 flex flex-col items-center justify-end h-full group cursor-pointer relative transition-all ${
                      isSelected ? 'opacity-100' : 'opacity-85 hover:opacity-100'
                    }`}
                  >
                    {/* Hover Tooltip */}
                    {hoveredMonth === item.month && (
                      <div className="absolute -top-16 z-20 bg-slate-900 text-white text-[11px] rounded-lg py-1.5 px-2.5 shadow-lg whitespace-nowrap pointer-events-none">
                        <div className="font-semibold text-slate-200">{formatShortMonth(item.month)}</div>
                        <div className="text-emerald-400 tabular-nums">รับ: {formatCurrency(item.income)}</div>
                        <div className="text-rose-400 tabular-nums">จ่าย: {formatCurrency(item.expense)}</div>
                        <div className="text-slate-300 tabular-nums pt-0.5 border-t border-slate-700">
                          คงเหลือ: {formatCurrency(item.net, true)}
                        </div>
                      </div>
                    )}

                    {/* Dual Bars */}
                    <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-44">
                      {/* Income Bar */}
                      <div
                        style={{ height: `${incomeHeight}%` }}
                        className={`w-1/2 rounded-t-md transition-all duration-300 ${
                          isSelected ? 'bg-emerald-500 shadow-xs' : 'bg-emerald-400/80 group-hover:bg-emerald-500'
                        }`}
                      />
                      {/* Expense Bar */}
                      <div
                        style={{ height: `${expenseHeight}%` }}
                        className={`w-1/2 rounded-t-md transition-all duration-300 ${
                          isSelected ? 'bg-rose-500 shadow-xs' : 'bg-rose-400/80 group-hover:bg-rose-500'
                        }`}
                      />
                    </div>

                    {/* Month Label */}
                    <div className="mt-2 text-center">
                      <span
                        className={`text-xs block tabular-nums transition-colors ${
                          isSelected
                            ? 'font-bold text-slate-900 underline underline-offset-4 decoration-slate-900'
                            : 'text-slate-500 group-hover:text-slate-800'
                        }`}
                      >
                        {formatShortMonth(item.month)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between text-[11px] text-slate-400 px-2 mt-2">
              <span>0 ฿</span>
              <span>สูงสุด {formatCurrency(maxMonthValue)}</span>
            </div>
          </div>
        </div>

        {/* 2. Donut Category Breakdown (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-slate-500" />
              สัดส่วนตามหมวดหมู่
            </h3>

            {/* Segmented Filter */}
            <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-xs">
              <button
                onClick={() => setBreakdownType('expense')}
                className={`px-2.5 py-1 font-medium rounded-md transition-colors cursor-pointer ${
                  breakdownType === 'expense'
                    ? 'bg-white text-rose-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                รายจ่าย
              </button>
              <button
                onClick={() => setBreakdownType('income')}
                className={`px-2.5 py-1 font-medium rounded-md transition-colors cursor-pointer ${
                  breakdownType === 'income'
                    ? 'bg-white text-emerald-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                รายรับ
              </button>
            </div>
          </div>

          {categoryData.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
              <AlertCircle className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-xs text-slate-500">ไม่มีข้อมูล{breakdownType === 'expense' ? 'รายจ่าย' : 'รายรับ'}ในเดือนนี้</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col sm:flex-row lg:flex-col items-center gap-4">
              
              {/* Donut Chart SVG */}
              <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                  {donutSlices.map((slice) => {
                    const isHovered = hoveredCategory === slice.id;
                    const path = createDonutArc(
                      slice.startAngle,
                      slice.endAngle,
                      isHovered ? 48 : 52,
                      isHovered ? 90 : 86
                    );
                    return (
                      <path
                        key={slice.id}
                        d={path}
                        fill={slice.category.color}
                        onMouseEnter={() => setHoveredCategory(slice.id)}
                        onMouseLeave={() => setHoveredCategory(null)}
                        className="transition-all duration-200 cursor-pointer hover:opacity-90"
                      />
                    );
                  })}
                </svg>

                {/* Donut Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-[10px] text-slate-400 font-medium">รวม{breakdownType === 'expense' ? 'จ่าย' : 'รับ'}</span>
                  <span className="text-xs font-bold text-slate-800 tabular-nums">
                    {formatCurrency(totalAmountForType)}
                  </span>
                </div>
              </div>

              {/* Category Legend List */}
              <div className="w-full space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {categoryData.map((item) => (
                  <div
                    key={item.id}
                    onMouseEnter={() => setHoveredCategory(item.id)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    className={`flex items-center justify-between text-xs py-1 px-1.5 rounded-lg transition-colors cursor-pointer ${
                      hoveredCategory === item.id ? 'bg-slate-100 font-semibold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.category.color }}
                      />
                      <span className="text-slate-700 truncate">{item.category.name}</span>
                    </div>

                    <div className="text-right shrink-0 flex items-center gap-2">
                      <span className="font-semibold text-slate-900 tabular-nums">
                        {formatCurrency(item.amount)}
                      </span>
                      <span className="text-[11px] text-slate-400 tabular-nums w-10 text-right">
                        {item.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>
      </div>

      {/* Lower Row: Daily Spending Timeline & Financial Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* 3. Daily Spending Timeline (8 Cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              การใช้จ่ายรายวัน (วันที่ 1 - 31 ของเดือน)
            </h3>
            <span className="text-xs text-slate-400">
              ค่าเฉลี่ยต่อวัน: <strong className="text-slate-700 tabular-nums">{formatCurrency(avgDailySpend)}</strong>
            </span>
          </div>

          <div className="h-32 flex items-end gap-1 pt-4 border-b border-slate-100">
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const data = dailySpend[day] || { expense: 0, income: 0 };
              const barHeight = data.expense > 0 ? Math.max(6, (data.expense / maxDailyExpense) * 100) : 0;
              const hasSpend = data.expense > 0;

              return (
                <div
                  key={day}
                  title={`วันที่ ${day}: จ่าย ${formatCurrency(data.expense)} / รับ ${formatCurrency(data.income)}`}
                  className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                >
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 z-20 bg-slate-900 text-white text-[10px] rounded px-1.5 py-1 whitespace-nowrap pointer-events-none">
                    ว.{day}: {formatCurrency(data.expense)}
                  </div>

                  <div
                    style={{ height: `${barHeight}%` }}
                    className={`w-full rounded-t-xs transition-all ${
                      hasSpend
                        ? data.expense > avgDailySpend * 1.5
                          ? 'bg-rose-500'
                          : 'bg-slate-700 group-hover:bg-slate-900'
                        : 'bg-transparent'
                    }`}
                  />
                  <span className="text-[9px] text-slate-400 mt-1 block">
                    {day % 5 === 0 || day === 1 ? day : ''}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
            <span>แท่งสีแดง = วันที่ใช้จ่ายสูงกว่าค่าเฉลี่ย</span>
            <span>วันที่สูงสุด: {formatCurrency(maxDailyExpense)}</span>
          </div>
        </div>

        {/* 4. Financial Insights & Highlights (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              สรุปข้อมูลสำคัญเดือนนี้
            </h3>

            <div className="space-y-3">
              {/* Top Expense Item */}
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-[11px] text-slate-500 block mb-1">รายการที่จ่ายสูงสุด</span>
                {topExpenseTx ? (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800 truncate mr-2">
                      {topExpenseTx.note || getCategoryById(topExpenseTx.categoryId).name}
                    </span>
                    <span className="text-xs font-bold text-rose-600 tabular-nums shrink-0">
                      {formatCurrency(topExpenseTx.amount)}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">ยังไม่มีรายจ่าย</span>
                )}
              </div>

              {/* Top Spending Category */}
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-[11px] text-slate-500 block mb-1">หมวดหมู่ที่ใช้เงินมากที่สุด</span>
                {categoryData.length > 0 ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 truncate mr-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: categoryData[0].category.color }}
                      />
                      <span className="text-xs font-semibold text-slate-800 truncate">
                        {categoryData[0].category.name}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-900 tabular-nums shrink-0">
                      {categoryData[0].percentage.toFixed(0)}% ({formatCurrency(categoryData[0].amount)})
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">ไม่มีข้อมูล</span>
                )}
              </div>

              {/* Total Transaction Count */}
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-[11px] text-slate-500 block mb-1">จำนวนรายการทั้งหมดในเดือน</span>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-700">บันทึกทั้งหมด</span>
                  <span className="text-xs font-bold text-slate-900 tabular-nums">
                    {currentMonthTx.length} รายการ
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 text-[11px] text-slate-400 border-t border-slate-100 flex items-center justify-between">
            <span>อัปเดตเรียลไทม์</span>
            <span>สถานะ: บันทึกในเครื่องปลอดภัย</span>
          </div>

        </div>

      </div>

    </div>
  );
};
