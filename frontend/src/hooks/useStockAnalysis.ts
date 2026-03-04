import { useState } from 'react';
import { AnalysisData } from '../types/analysis';
import { analyzeStock } from '../services/api';
import { ERROR_MESSAGES } from '../constants';

export const useStockAnalysis = () => {
  const [ticker, setTicker] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<AnalysisData | null>(null);

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!ticker.trim()) return;

    setLoading(true);
    setError('');
    setData(null);

    try {
      const result = await analyzeStock(ticker);
      setData(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : ERROR_MESSAGES.ANALYSIS_FAILED);
    } finally {
      setLoading(false);
    }
  };

  return {
    ticker,
    setTicker,
    loading,
    error,
    data,
    handleAnalyze,
  };
};
