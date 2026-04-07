export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const ERROR_MESSAGES = {
  ANALYSIS_FAILED: 'Analysis failed. Please try again or check your internet connection.',
} as const;

export const PERIODS = [
  { value: '1mo', label: '1M' },
  { value: '3mo', label: '3M' },
  { value: '6mo', label: '6M' },
  { value: '1y', label: '1Y' },
  { value: '2y', label: '2Y' },
  { value: '5y', label: '5Y' },
  { value: '10y', label: '10Y' },
  { value: 'ytd', label: 'YTD' },
  { value: 'max', label: 'Max' },
];

// Extended PERIODS with date calculation properties
const PERIODS_WITH_CALC = [
  { value: '1mo', label: '1M', months: 1 },
  { value: '3mo', label: '3M', months: 3 },
  { value: '6mo', label: '6M', months: 6 },
  { value: '1y', label: '1Y', years: 1 },
  { value: '2y', label: '2Y', years: 2 },
  { value: '5y', label: '5Y', years: 5 },
  { value: '10y', label: '10Y', years: 10 },
  { value: 'ytd', label: 'YTD', ytd: true },
  { value: 'max', label: 'Max', max: true },
];

// Calculate start and end dates from period selection
export const getDateRange = (
  periodValue: string,
): { startDate: string; endDate: string } | { period: string } => {
  const today = new Date();
  const endDate = today.toISOString().split('T')[0];

  const period = PERIODS_WITH_CALC.find((p) => p.value === periodValue);
  if (!period) return { period: '5y' };

  if (period.max) return { period: 'max' };
  if (period.ytd) {
    const startOfYear = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
    return { startDate: startOfYear, endDate };
  }
  if (period.months) {
    const startDate = new Date(today);
    startDate.setMonth(startDate.getMonth() - period.months);
    return { startDate: startDate.toISOString().split('T')[0], endDate };
  }
  if (period.years) {
    const startDate = new Date(today);
    startDate.setFullYear(startDate.getFullYear() - period.years);
    return { startDate: startDate.toISOString().split('T')[0], endDate };
  }

  return { period: '5y' };
};
