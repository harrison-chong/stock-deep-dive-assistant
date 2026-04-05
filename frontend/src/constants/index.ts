export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const ERROR_MESSAGES = {
  ANALYSIS_FAILED: 'Analysis failed. Please try again or check your internet connection.',
} as const;
