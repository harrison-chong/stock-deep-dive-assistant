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
