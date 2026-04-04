import axios from 'axios';
import { AnalysisData } from '../types/analysis';
import { API_BASE_URL } from '../constants';

export const analyzeStock = async (
  ticker: string,
  dateRange?: { startDate?: string; endDate?: string; period?: string },
): Promise<AnalysisData> => {
  const payload: Record<string, string> = {
    ticker: ticker.toUpperCase(),
  };

  // Add date range parameters
  if (dateRange?.period) {
    payload.period = dateRange.period;
  }
  if (dateRange?.startDate) {
    payload.start_date = dateRange.startDate;
  }
  if (dateRange?.endDate) {
    payload.end_date = dateRange.endDate;
  }

  const response = await axios.post(`${API_BASE_URL}/api/analyze`, payload);
  return response.data;
};

export interface ChartDataResponse {
  ticker: string;
  chart_data: { date: string; close: number }[];
  data_start_date: string | null;
  data_end_date: string | null;
}

export const getChartData = async (
  ticker: string,
  dateRange?: { startDate?: string; endDate?: string; period?: string },
): Promise<ChartDataResponse> => {
  const payload: Record<string, string> = {
    ticker: ticker.toUpperCase(),
  };

  // Add date range parameters
  if (dateRange?.period) {
    payload.period = dateRange.period;
  }
  if (dateRange?.startDate) {
    payload.start_date = dateRange.startDate;
  }
  if (dateRange?.endDate) {
    payload.end_date = dateRange.endDate;
  }

  const response = await axios.post(`${API_BASE_URL}/api/chart-data`, payload);
  return response.data;
};

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

export const getMarketSummary = async (): Promise<MarketSummaryResponse> => {
  const response = await axios.get(`${API_BASE_URL}/api/market/summary`);
  return response.data;
};

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

export const getStockNews = async (ticker: string): Promise<StockNewsResponse> => {
  const response = await axios.get(`${API_BASE_URL}/api/stock/${ticker}/news`);
  return response.data;
};

export interface SectorPerformance {
  sector: string;
  etf_ticker: string;
  etf_name: string | null;
  price: number | null;
  change: number | null;
  change_percent: number | null;
  week_52_high: number | null;
  week_52_low: number | null;
}

export const getSectorPerformance = async (ticker: string): Promise<SectorPerformance> => {
  const response = await axios.get(`${API_BASE_URL}/api/stock/${ticker}/sector`);
  return response.data;
};
