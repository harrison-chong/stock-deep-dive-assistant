import axios from 'axios';
import { AnalysisData, MarketMoversData } from '../types/analysis';
import { API_BASE_URL } from '../constants';

export const analyzeStock = async (ticker: string): Promise<AnalysisData> => {
  const response = await axios.post(`${API_BASE_URL}/api/analyze`, {
    ticker: ticker.toUpperCase(),
  });
  return response.data;
};

export const fetchMarketMovers = async (): Promise<MarketMoversData> => {
  const response = await axios.get(`${API_BASE_URL}/api/market-movers`);
  return response.data;
};
