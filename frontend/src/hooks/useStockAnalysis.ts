import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AnalysisData } from '../types/analysis';
import { analyzeStock, getChartData, generateAIAnalysis } from '../services/api';
import { ERROR_MESSAGES } from '../constants';

export const useStockAnalysis = () => {
  const [ticker, setTicker] = useState('');
  const [period, setPeriod] = useState('5y');
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
      dateRange?: { startDate?: string; endDate?: string; period?: string },
    ) => {
      if (e) e.preventDefault();
      if (!ticker.trim()) return;

      setLoading(true);
      setError('');
      setErrorAI('');

      // Update cache key for React Query
      queryClient.cancelQueries({ queryKey: ['analysis', ticker, period] });

      try {
        const result = await analyzeStock(ticker, dateRange);
        setData(result);

        // Prefetch into React Query cache
        queryClient.setQueryData(['analysis', ticker, period], result);
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
            setError(`Invalid ticker format. Please enter a valid stock ticker.`);
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
    [ticker, period, queryClient],
  );

  const updateChartData = useCallback(
    async (dateRange: { startDate?: string; endDate?: string; period?: string }) => {
      if (!ticker.trim() || !data) return;

      setLoadingChart(true);
      try {
        const chartResult = await getChartData(ticker, dateRange);
        const newData = {
          ...data,
          chart_data: chartResult.chart_data,
          data_start_date: chartResult.data_start_date,
          data_end_date: chartResult.data_end_date,
        };
        setData(newData);
        queryClient.setQueryData(['analysis', ticker, period], newData);
      } catch {
        handleAnalyze(undefined, dateRange);
      } finally {
        setLoadingChart(false);
      }
    },
    [ticker, data, period, queryClient, handleAnalyze],
  );

  const handleGenerateAI = useCallback(
    async (dateRange?: { startDate?: string; endDate?: string; period?: string }) => {
      if (!ticker.trim()) return;

      setLoadingAI(true);
      try {
        const aiResult = await generateAIAnalysis(ticker, dateRange);
        const newData = data ? { ...data, ai_outlook: aiResult } : null;
        setData(newData);
        if (newData) {
          queryClient.setQueryData(['analysis', ticker, period], newData);
        }
      } catch {
        setErrorAI('AI analysis failed. Please try again.');
      } finally {
        setLoadingAI(false);
      }
    },
    [ticker, data, period, queryClient],
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
