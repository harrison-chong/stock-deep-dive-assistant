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
