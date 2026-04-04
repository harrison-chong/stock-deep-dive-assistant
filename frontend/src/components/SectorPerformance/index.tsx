import { useEffect, useState } from 'react';
import {
  getSectorPerformance,
  type SectorPerformance as SectorPerformanceType,
} from '../../services/api';

interface SectorPerformanceProps {
  ticker: string;
}

export function SectorPerformance({ ticker }: SectorPerformanceProps) {
  const [sectorData, setSectorData] = useState<SectorPerformanceType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSectorPerformance = async () => {
      if (!ticker) return;

      try {
        const data = await getSectorPerformance(ticker);
        setSectorData(data);
      } catch (err) {
        console.error('Failed to fetch sector performance:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSectorPerformance();
  }, [ticker]);

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-500">Loading sector data...</p>
      </div>
    );
  }

  if (!sectorData) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 mb-1">Sector Performance ({sectorData.etf_ticker})</p>
          <p className="text-sm font-medium text-gray-900">
            {sectorData.etf_name || sectorData.sector}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-gray-900">
            {sectorData.price?.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p
            className={`text-sm font-medium ${
              (sectorData.change ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {(sectorData.change ?? 0) >= 0 ? '+' : ''}
            {sectorData.change?.toFixed(2)} (
            {((sectorData.change_percent ?? 0) >= 0 ? '+' : '') +
              (sectorData.change_percent ?? 0).toFixed(2)}
            %)
          </p>
        </div>
      </div>
      {sectorData.week_52_high && sectorData.week_52_low && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex justify-between text-xs text-gray-500">
            <span>52W Low: ${sectorData.week_52_low.toFixed(2)}</span>
            <span>52W High: ${sectorData.week_52_high.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
