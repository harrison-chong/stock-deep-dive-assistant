import { useState } from 'react';
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

  const handleAnalyze = async (
    e?: React.FormEvent,
    dateRange?: { startDate?: string; endDate?: string; period?: string },
  ) => {
    if (e) e.preventDefault();
    if (!ticker.trim()) return;

    setLoading(true);
    setError('');
    setErrorAI('');
    setData(null);

    try {
      const result = await analyzeStock(ticker, dateRange);
      setData(result);
    } catch (err: unknown) {
      // Handle axios error response
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
  };

  // Lightweight chart data update - does NOT recalculate expensive metrics
  const updateChartData = async (dateRange: {
    startDate?: string;
    endDate?: string;
    period?: string;
  }) => {
    if (!ticker.trim() || !data) return;

    setLoadingChart(true);
    try {
      const chartResult = await getChartData(ticker, dateRange);
      // Only update chart data, keep everything else from existing data
      setData((prevData) => {
        if (!prevData) return null;
        return {
          ...prevData,
          chart_data: chartResult.chart_data,
          data_start_date: chartResult.data_start_date,
          data_end_date: chartResult.data_end_date,
        };
      });
    } catch (err) {
      console.error('Failed to update chart data:', err);
      // On error, fall back to full analysis
      handleAnalyze(undefined, dateRange);
    } finally {
      setLoadingChart(false);
    }
  };

  const handleGenerateAI = async (dateRange?: {
    startDate?: string;
    endDate?: string;
    period?: string;
  }) => {
    if (!ticker.trim()) return;

    setLoadingAI(true);
    try {
      const aiResult = await generateAIAnalysis(ticker, dateRange);
      setData((prevData) => {
        if (!prevData) return null;
        return {
          ...prevData,
          ai_outlook: aiResult,
        };
      });
    } catch (err) {
      console.error('AI analysis failed:', err);
      setErrorAI('AI analysis failed. Please try again.');
    } finally {
      setLoadingAI(false);
    }
  };

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
