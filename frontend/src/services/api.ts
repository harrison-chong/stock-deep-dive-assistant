import axios from 'axios';
import { AnalysisData } from '../types/analysis';
import { API_BASE_URL } from '../constants';

export const analyzeStock = async (
  ticker: string,
  period: string = '5y',
): Promise<AnalysisData> => {
  const response = await axios.post(`${API_BASE_URL}/api/analyze`, {
    ticker: ticker.toUpperCase(),
    period,
  });
  return response.data;
};
