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
          const axiosError = err as {
            response?: {
              data?: { detail?: string };
              status?: number;
              headers?: { [key: string]: string };
            };
          };
          const status = axiosError.response?.status;
          const detail = axiosError.response?.data?.detail;
          const retryAfter = axiosError.response?.headers?.['retry-after'];

          // Detect rate limit errors (503 or RATE_LIMIT_MSG detail)
          const isRateLimit = status === 503 || detail === 'RATE_LIMIT_MSG';

          if (isRateLimit) {
            const retrySeconds = retryAfter ? parseInt(retryAfter, 10) : 60;
            setError(
              `Yahoo Finance rate limit exceeded. Please wait ${retrySeconds} seconds before trying again.`,
            );
          } else if (status === 404) {
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
        // Build ticker info from already-loaded data
        const tickerInfo: Record<string, unknown> = {
          longName: data.company_name,
          sector: data.sector,
          industry: data.industry,
          marketCap: data.market_cap,
          currency: data.currency,
          // Add all other fields from AnalysisData that the backend might need
          beta: data.beta,
          regular_market_change: data.regular_market_change,
          regular_market_change_percent: data.regular_market_change_percent,
          ebitda: data.ebitda,
          total_cash: data.total_cash,
          total_debt: data.total_debt,
          total_cash_per_share: data.total_cash_per_share,
          current_ratio: data.current_ratio,
          quick_ratio: data.quick_ratio,
          payout_ratio: data.payout_ratio,
          free_cash_flow: data.free_cash_flow,
          operating_cash_flow: data.operating_cash_flow,
          shares_outstanding: data.shares_outstanding,
          revenue_per_share: data.revenue_per_share,
          held_percent_insiders: data.held_percent_insiders,
          held_percent_institutions: data.held_percent_institutions,
          number_of_analyst_opinions: data.number_of_analyst_opinions,
          recommendation_key: data.recommendation_key,
          recommendation_mean: data.recommendation_mean,
          average_analyst_rating: data.average_analyst_rating,
          target_high_price: data.target_high_price,
          target_low_price: data.target_low_price,
          fifty_day_average: data.fifty_day_average,
          two_hundred_day_average: data.two_hundred_day_average,
          shares_short: data.shares_short,
          short_ratio: data.short_ratio,
          short_percent_of_float: data.short_percent_of_float,
          float_shares: data.float_shares,
          fifty_two_week_change: data.fifty_two_week_change,
          s_and_p_fifty_two_week_change: data.s_and_p_fifty_two_week_change,
          all_time_high: data.all_time_high,
          all_time_low: data.all_time_low,
          trailing_annual_dividend_rate: data.trailing_annual_dividend_rate,
          trailing_annual_dividend_yield: data.trailing_annual_dividend_yield,
          five_year_avg_dividend_yield: data.five_year_avg_dividend_yield,
          dividend_rate: data.dividend_rate,
          forward_dividend_yield: data.forward_dividend_yield,
          website: data.website,
          description: data.description,
          full_time_employees: data.full_time_employees,
          country: data.country,
          state: data.state,
          city: data.city,
          phone: data.phone,
          fax: data.fax,
          earnings_timestamp: data.earnings_timestamp,
          target_mean_price: data.target_mean_price,
          target_median_price: data.target_median_price,
        };

        const aiResult = await generateAIAnalysis({
          ticker,
          dateRange: newDateRange ?? dateRange,
          ohlcData: {
            timestamp: data.chart_data.map((d) => d.date),
            open: [],
            high: [],
            low: [],
            close: data.chart_data.map((d) => d.close),
            volume: [],
            start_date: data.data_start_date,
            end_date: data.data_end_date,
          },
          tickerInfo,
        });
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
