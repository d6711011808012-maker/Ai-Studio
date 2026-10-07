export const THAI_MONTH_NAMES = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

export const THAI_MONTH_SHORT = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
];

/**
 * Format currency with Thai Baht
 */
export function formatCurrency(amount: number, showSign = false): string {
  const formatted = new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));

  if (showSign) {
    if (amount > 0) return `+฿${formatted}`;
    if (amount < 0) return `-฿${formatted}`;
    return `฿${formatted}`;
  }
  return `฿${formatted}`;
}

/**
 * Format compact numbers for charts (e.g., 25K, 1.2M)
 */
export function formatCompactNumber(amount: number): string {
  if (Math.abs(amount) >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `${(amount / 1_000).toFixed(0)}k`;
  }
  return amount.toString();
}

/**
 * Convert YYYY-MM to Thai month string (e.g. "ตุลาคม 2569 / 2026")
 */
export function formatMonthYear(yearMonth: string): string {
  const [yearStr, monthStr] = yearMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const thaiYear = year + 543;
  return `${THAI_MONTH_NAMES[month]} ${thaiYear} (${year})`;
}

/**
 * Convert YYYY-MM to short Thai format (e.g. "ต.ค. 69")
 */
export function formatShortMonth(yearMonth: string): string {
  const [yearStr, monthStr] = yearMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const shortThaiYear = (year + 543) % 100;
  return `${THAI_MONTH_SHORT[month]} ${shortThaiYear}`;
}

/**
 * Format date string YYYY-MM-DD to readable Thai date
 */
export function formatThaiDate(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const thaiYear = (year + 543) % 100;
    return `${day} ${THAI_MONTH_SHORT[month]} ${thaiYear}`;
  } catch {
    return dateStr;
  }
}

/**
 * Return current YYYY-MM based on system date (e.g. 2026-10)
 */
export function getCurrentYearMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Return current date string YYYY-MM-DD
 */
export function getCurrentDateStr(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Payment method text in Thai
 */
export function getPaymentMethodName(method: string): string {
  switch (method) {
    case 'cash':
      return 'เงินสด';
    case 'transfer':
      return 'โอนเงิน / แบงก์กิ้ง';
    case 'promptpay':
      return 'พร้อมเพย์';
    case 'credit_card':
      return 'บัตรเครดิต';
    default:
      return 'ทั่วไป';
  }
}
