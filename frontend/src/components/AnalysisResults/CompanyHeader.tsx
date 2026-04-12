import { AnalysisData } from '../../types/analysis';
import { getGainLossColor } from '../../utils/formatting';
import { Download, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

function isMarketOpen(): boolean {
  const now = new Date();
  const day = now.getDay();
  // Market closed on weekends
  if (day === 0 || day === 6) return false;

  // Get US Eastern time
  const etOffset = -5; // EST (or -4 for EDT)
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const etTime = new Date(utc + 3600000 * etOffset);
  const hour = etTime.getHours();
  const minute = etTime.getMinutes();

  // Market hours: 9:30 AM - 4:00 PM ET
  const marketOpen = hour > 9 || (hour === 9 && minute >= 30);
  const marketClose = hour < 16;
  return marketOpen && marketClose;
}

function formatDataRange(start_date: string | null, end_date: string | null): string {
  if (!end_date) return 'Unknown';
  const end = new Date(end_date);
  const endStr = end.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  if (!start_date) return endStr;
  const start = new Date(start_date);
  const startStr = start.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return `${startStr} – ${endStr}`;
}

interface CompanyHeaderProps {
  data: AnalysisData;
}

export function CompanyHeader({ data }: CompanyHeaderProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const marketOpen = isMarketOpen();

  // Close on click outside
  useEffect(() => {
    if (!showExportMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showExportMenu]);

  return (
    <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl p-8 border border-gray-200/30 dark:border-gray-800/30 animate-fade-in transition-all duration-300">
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900 dark:text-white truncate">
            {data.company_name}
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">{data.ticker}</span>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 sm:mt-3">
            <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
              {data.sector && (
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-300">Sector:</span>{' '}
                  {data.sector}
                </div>
              )}
              {data.industry && (
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-300">Industry:</span>{' '}
                  {data.industry}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${marketOpen ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {marketOpen ? 'Market Open' : 'Market Closed'}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right min-w-0">
          <p className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">
            ${data.current_price.toFixed(2)}
          </p>
          {data.currency && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{data.currency}</p>
          )}
          {data.regular_market_change !== null && data.regular_market_change !== undefined && (
            <p
              className={`text-sm font-semibold mt-1 ${getGainLossColor(data.regular_market_change)}`}
            >
              {data.regular_market_change >= 0 ? '+' : ''}
              {data.regular_market_change.toFixed(2)} (
              {data.regular_market_change_percent !== null &&
              data.regular_market_change_percent !== undefined
                ? `${data.regular_market_change_percent >= 0 ? '+' : ''}${data.regular_market_change_percent.toFixed(2)}%`
                : 'N/A'}
              )
            </p>
          )}
          {data.market_cap && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Market Cap: ${(data.market_cap / 1e9).toFixed(1)}B
            </p>
          )}
          <div className="flex items-center justify-end gap-2 mt-2">
            <span className="text-xs text-gray-400 dark:text-gray-500">
              Data: {formatDataRange(data.data_start_date, data.data_end_date)}
            </span>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowExportMenu((v) => !v)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-200/30 dark:border-gray-700/30 rounded-lg hover:bg-gray-100/60 dark:hover:bg-gray-700/60 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Export
                <ChevronDown className="w-3 h-3" />
              </button>
              {showExportMenu && (
                <div className="absolute right-0 top-full mt-1 z-50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200/30 dark:border-gray-700/30 rounded-lg shadow-lg py-1 min-w-[120px]">
                  <button
                    onClick={() => {
                      setShowExportMenu(false);
                      const exportData = {
                        ticker: data.ticker,
                        company_name: data.company_name,
                        sector: data.sector,
                        industry: data.industry,
                        current_price: data.current_price,
                        currency: data.currency,
                        market_cap: data.market_cap,
                        timestamp: data.timestamp,
                        chart_data: data.chart_data,
                        technical_overview: data.technical_overview,
                        fundamental_overview: data.fundamental_overview,
                        advanced_metrics: data.advanced_metrics,
                      };
                      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                        type: 'application/json',
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${data.ticker}_analysis_${new Date().toISOString().split('T')[0]}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="w-full px-4 py-2 text-xs text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100/60 dark:hover:bg-gray-700/60 transition-colors"
                  >
                    Export as JSON
                  </button>
                  <button
                    onClick={() => {
                      setShowExportMenu(false);
                      const rows: string[] = ['Metric,Value'];
                      rows.push(`Ticker,${data.ticker}`);
                      rows.push(`Company Name,${data.company_name}`);
                      rows.push(`Current Price,$${data.current_price}`);
                      rows.push(`Market Cap,$${data.market_cap}`);
                      if (data.technical_overview.moving_averages) {
                        data.technical_overview.moving_averages.forEach((m) => {
                          rows.push(`SMA ${m.name},${m.value}`);
                        });
                      }
                      if (data.technical_overview.momentum) {
                        data.technical_overview.momentum.forEach((m) => {
                          rows.push(`Momentum ${m.name},${m.value}`);
                        });
                      }
                      Object.entries(data.fundamental_overview).forEach(([category, metrics]) => {
                        if (Array.isArray(metrics)) {
                          metrics.forEach((m) => {
                            rows.push(`${category}.${m.name},${m.value ?? 'N/A'}`);
                          });
                        }
                      });
                      const csv = rows.join('\n');
                      const blob = new Blob([csv], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${data.ticker}_analysis_${new Date().toISOString().split('T')[0]}.csv`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="w-full px-4 py-2 text-xs text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100/60 dark:hover:bg-gray-700/60 transition-colors"
                  >
                    Export as CSV
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
