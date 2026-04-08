import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AnalysisData } from '../types/analysis';
import { analyzeStock, getChartData, generateAIAnalysis } from '../services/api';
import { ERROR_MESSAGES } from '../constants';

const ANALYSIS_KEY = 'stockAnalysis';

export interface UseStockAnalysisReturn {
  ticker: string;
  setTicker: (ticker: string) => void;
  period: string;
  setPeriod: (period: string) => void;
  loading: boolean;
  loadingChart: boolean;
  loadingAI: boolean;
  errorAI: string;
  error: string;
  data: AnalysisData | null;
  handleAnalyze: (
    e?: React.FormEvent,
    dateRange?: { startDate?: string; endDate?: string; period?: string },
  ) => Promise<void>;
  updateChartData: (dateRange: {
    startDate?: string;
    endDate?: string;
    period?: string;
  }) => Promise<void>;
  handleGenerateAI: (dateRange?: {
    startDate?: string;
    endDate?: string;
    period?: string;
  }) => Promise<void>;
}

export const useStockAnalysis = (): UseStockAnalysisReturn => {
  const [ticker, setTicker] = useState('');
  const [period, setPeriod] = useState('5y');
  const [dateRange, setDateRange] = useState<
    { startDate?: string; endDate?: string; period?: string } | undefined
  >(undefined);
  const [loading, setLoading] = useState(false);
  const [loadingChart, setLoadingChart] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [errorAI, setErrorAI] = useState('');
  const [error, setError] = useState('');
  const [data, setData] = useState<AnalysisData | null>(null);

  const queryClient = useQueryClient();

  const handleAnalyze = useCallback(
    async (
      e?: React.FormEvent,
      newDateRange?: { startDate?: string; endDate?: string; period?: string },
    ) => {
      if (e) e.preventDefault();
      if (!ticker.trim()) return;

      setLoading(true);
      setError('');

      // Cancel any in-flight requests
      queryClient.cancelQueries({ queryKey: [ANALYSIS_KEY, ticker, period] });

      // Update date range if provided
      if (newDateRange) {
        setDateRange(newDateRange);
      }

      try {
        const result = await analyzeStock(ticker, newDateRange ?? dateRange);
        setData(result);
        // Prefetch into React Query cache for future use
        queryClient.setQueryData([ANALYSIS_KEY, ticker, period], result);
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'response' in err) {
          const axiosError = err as { response?: { data?: { detail?: string }; status?: number } };
          const status = axiosError.response?.status;
          const detail = axiosError.response?.data?.detail;

          if (status === 404) {
            setError(
              `No data found for "${ticker.toUpperCase()}". Please check the ticker and try again.`,
            );
          } else if (status === 400) {
            setError('Invalid ticker format. Please enter a valid stock ticker.');
          } else if (detail) {
            setError(detail);
          } else {
            setError(ERROR_MESSAGES.ANALYSIS_FAILED);
          }
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(ERROR_MESSAGES.ANALYSIS_FAILED);
        }
      } finally {
        setLoading(false);
      }
    },
    [ticker, period, dateRange, queryClient],
  );

  const updateChartData = useCallback(
    async (newDateRange: { startDate?: string; endDate?: string; period?: string }) => {
      if (!ticker.trim() || !data) return;

      setLoadingChart(true);
      try {
        const chartResult = await getChartData(ticker, newDateRange);
        const newData = {
          ...data,
          chart_data: chartResult.chart_data,
          data_start_date: chartResult.data_start_date,
          data_end_date: chartResult.data_end_date,
        };
        setData(newData);
        // Update cache with new chart data
        queryClient.setQueryData([ANALYSIS_KEY, ticker, period], newData);
      } catch {
        // On error, refetch the full analysis
        handleAnalyze(undefined, newDateRange);
      } finally {
        setLoadingChart(false);
      }
    },
    [ticker, period, data, queryClient, handleAnalyze],
  );

  const handleGenerateAI = useCallback(
    async (newDateRange?: { startDate?: string; endDate?: string; period?: string }) => {
      if (!ticker.trim() || !data) return;

      setLoadingAI(true);
      setErrorAI('');
      try {
        const aiResult = await generateAIAnalysis(ticker, newDateRange ?? dateRange);
        const newData = { ...data, ai_outlook: aiResult };
        setData(newData);
        queryClient.setQueryData([ANALYSIS_KEY, ticker, period], newData);
      } catch {
        setErrorAI('AI analysis failed. Please try again.');
      } finally {
        setLoadingAI(false);
      }
    },
    [ticker, period, dateRange, data, queryClient],
  );

  return {
    ticker,
    setTicker,
    period,
    setPeriod,
    loading,
    loadingChart,
    loadingAI,
    errorAI,
    error,
    data,
    handleAnalyze,
    updateChartData,
    handleGenerateAI,
  };
};
