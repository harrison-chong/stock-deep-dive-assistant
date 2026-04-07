import axios from 'axios';
import { AnalysisData } from '../types/analysis';
import { API_BASE_URL } from '../constants';

export interface ChartDataResponse {
  ticker: string;
  chart_data: { date: string; close: number }[];
  data_start_date: string | null;
  data_end_date: string | null;
}

export interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
}

export interface MarketSummaryResponse {
  indices: MarketIndex[];
  timestamp: string;
}

export interface AIOutlookData {
  overall_summary: string;
  bull_case: string;
  bear_case: string;
  risk_factors: string[];
  neutral_scenario: string;
  recommendation: string;
  recommendation_rationale: string;
}

export interface NewsArticle {
  title: string;
  description: string | null;
  provider: string | null;
  link: string | null;
  pub_date: string | null;
  thumbnail: string | null;
}

export interface StockNewsResponse {
  ticker: string;
  articles: NewsArticle[];
  timestamp: string;
}

type DateRange = { startDate?: string; endDate?: string; period?: string };

const buildPayload = (ticker: string, dateRange?: DateRange): Record<string, string> => {
  const payload: Record<string, string> = { ticker: ticker.toUpperCase() };
  if (dateRange?.period) payload.period = dateRange.period;
  if (dateRange?.startDate) payload.start_date = dateRange.startDate;
  if (dateRange?.endDate) payload.end_date = dateRange.endDate;
  return payload;
};

export const analyzeStock = async (
  ticker: string,
  dateRange?: DateRange,
): Promise<AnalysisData> => {
  const response = await axios.post(`${API_BASE_URL}/api/analyze`, buildPayload(ticker, dateRange));
  return response.data;
};

export const getChartData = async (
  ticker: string,
  dateRange?: DateRange,
): Promise<ChartDataResponse> => {
  const response = await axios.post(
    `${API_BASE_URL}/api/chart-data`,
    buildPayload(ticker, dateRange),
  );
  return response.data;
};

export const getMarketSummary = async (): Promise<MarketSummaryResponse> => {
  const response = await axios.get(`${API_BASE_URL}/api/market/summary`);
  return response.data;
};

export const generateAIAnalysis = async (
  ticker: string,
  dateRange?: DateRange,
): Promise<AIOutlookData> => {
  const response = await axios.post(
    `${API_BASE_URL}/api/analyze/ai`,
    buildPayload(ticker, dateRange),
  );
  return response.data;
};

export const getStockNews = async (ticker: string): Promise<StockNewsResponse> => {
  const response = await axios.get(`${API_BASE_URL}/api/stock/${ticker}/news`);
  return response.data;
};
