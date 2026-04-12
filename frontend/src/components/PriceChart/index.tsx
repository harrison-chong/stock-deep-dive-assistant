import { useState, useMemo, memo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { getChartPeriods } from '../../constants';
import { getGainLossColor } from '../../utils/formatting';

function _getCutoffDate(chartPeriod: string, lastDate: Date): Date | null {
  if (chartPeriod === 'max') return null;
  if (chartPeriod === 'ytd') return new Date(lastDate.getFullYear(), 0, 1);

  const offsets: Record<string, [number, number]> = {
    '1mo': [1, 0],
    '3mo': [3, 0],
    '6mo': [6, 0],
    '1y': [0, 1],
    '2y': [0, 2],
    '5y': [0, 5],
    '10y': [0, 10],
  };

  const offset = offsets[chartPeriod];
  if (!offset) return null;

  const [months, years] = offset;
  const cutoff = new Date(lastDate);
  if (months > 0) cutoff.setMonth(cutoff.getMonth() - months);
  if (years > 0) cutoff.setFullYear(cutoff.getFullYear() - years);
  return cutoff;
}

interface PriceChartProps {
  ticker: string;
  currentPrice: number;
  chartData: {
    date: string;
    close: number;
    sma20?: number | null;
    sma50?: number | null;
    sma200?: number | null;
  }[];
  period: string;
}

export const PriceChart = memo(function PriceChart({
  ticker,
  currentPrice,
  chartData,
  period,
}: PriceChartProps) {
  const [chartPeriod, setChartPeriod] = useState(() => {
    const available = getChartPeriods(period);
    return available.find((p) => p.value === period)?.value ?? available[0]?.value ?? '5y';
  });
  const [showSMA20, setShowSMA20] = useState(false);
  const [showSMA50, setShowSMA50] = useState(false);
  const [showSMA200, setShowSMA200] = useState(false);

  const availableChartPeriods = useMemo(() => getChartPeriods(period), [period]);

  // Sync chart period when period changes (zoom out not allowed — only equal or lower)
  const effectiveChartPeriod = useMemo(() => {
    const available = getChartPeriods(period);
    return available.some((p) => p.value === chartPeriod)
      ? chartPeriod
      : (available[0]?.value ?? '5y');
  }, [period, chartPeriod]);

  // Filter chart data based on selected chart period (zoom in only — no extra API calls)
  const filteredData = useMemo(() => {
    if (!chartData.length) return [];
    const lastDate = new Date(chartData[chartData.length - 1].date);
    const cutoff = _getCutoffDate(chartPeriod, lastDate);
    if (!cutoff) return chartData;
    return chartData.filter((d) => new Date(d.date) >= cutoff);
  }, [chartData, chartPeriod]);

  // Check if SMA data is available
  const hasSMAData = filteredData.some(
    (point) => point.sma20 !== null || point.sma50 !== null || point.sma200 !== null,
  );

  // Transform chart data for the chart
  const data = filteredData.map((point) => ({
    date: new Date(point.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    price: point.close,
    sma20: point.sma20 ?? undefined,
    sma50: point.sma50 ?? undefined,
    sma200: point.sma200 ?? undefined,
  }));

  const latestPrice = data[data.length - 1]?.price ?? currentPrice;
  const startPrice = data[0]?.price ?? currentPrice;
  const priceChange = latestPrice - startPrice;
  const percentChange = startPrice > 0 ? (priceChange / startPrice) * 100 : 0;

  return (
    <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-gray-200/30 dark:border-gray-800/30 animate-fade-in transition-all duration-300">
      {/* Header - stack on mobile */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-5">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Price Chart</h3>
          <p className="text-sm text-gray-400 dark:text-gray-500 font-mono">
            {ticker} · ${latestPrice.toFixed(2)}
          </p>
        </div>
        <div className="text-right">
          <p className={`text-base sm:text-lg font-semibold ${getGainLossColor(priceChange)}`}>
            {priceChange >= 0 ? '+' : ''}
            {priceChange.toFixed(2)} ({percentChange.toFixed(2)}%)
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">Period Change</p>
        </div>
      </div>

      {/* SMA Toggles */}
      {hasSMAData && (
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setShowSMA20(!showSMA20)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200 ${
              showSMA20
                ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400'
                : 'bg-gray-50/50 dark:bg-gray-700/50 border-gray-100 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:bg-gray-100/50 dark:hover:bg-gray-700'
            }`}
          >
            SMA 20
          </button>
          <button
            onClick={() => setShowSMA50(!showSMA50)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200 ${
              showSMA50
                ? 'bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400'
                : 'bg-gray-50/50 dark:bg-gray-700/50 border-gray-100 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:bg-gray-100/50 dark:hover:bg-gray-700'
            }`}
          >
            SMA 50
          </button>
          <button
            onClick={() => setShowSMA200(!showSMA200)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200 ${
              showSMA200
                ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400'
                : 'bg-gray-50/50 dark:bg-gray-700/50 border-gray-100 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:bg-gray-100/50 dark:hover:bg-gray-700'
            }`}
          >
            SMA 200
          </button>
        </div>
      )}

      {/* Chart Period Selector — only allows zooming in, no extra API calls */}
      <div className="overflow-x-auto hide-scrollbar mb-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex gap-1 min-w-max px-1">
          {availableChartPeriods.map((p) => {
            const isActive = p.value === effectiveChartPeriod;
            return (
              <button
                key={p.value}
                onClick={() => setChartPeriod(p.value)}
                className={`px-4 py-2.5 text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-gray-100'
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart */}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f0f0f0"
              className="dark:stroke-gray-700"
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#6b7280' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              interval="preserveStartEnd"
              minTickGap={50}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#6b7280' }}
              tickLine={false}
              axisLine={false}
              domain={['auto', 'auto']}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
              width={52}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255,255,255,0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
              labelStyle={{ color: '#374151', fontWeight: 600 }}
              formatter={(value, name) => {
                const labelMap: Record<string, string> = {
                  price: 'Price',
                  sma20: 'SMA 20',
                  sma50: 'SMA 50',
                  sma200: 'SMA 200',
                };
                const label =
                  typeof name === 'string' ? labelMap[name] || name.toUpperCase() : String(name);
                return [`$${Number(value).toFixed(2)}`, label];
              }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke={priceChange >= 0 ? '#16a34a' : '#dc2626'}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: priceChange >= 0 ? '#16a34a' : '#dc2626' }}
            />
            {showSMA20 && (
              <Line
                type="monotone"
                dataKey="sma20"
                stroke="#3b82f6"
                strokeWidth={1.5}
                dot={false}
                strokeDasharray="5 5"
              />
            )}
            {showSMA50 && (
              <Line
                type="monotone"
                dataKey="sma50"
                stroke="#f97316"
                strokeWidth={1.5}
                dot={false}
                strokeDasharray="5 5"
              />
            )}
            {showSMA200 && (
              <Line
                type="monotone"
                dataKey="sma200"
                stroke="#a855f7"
                strokeWidth={1.5}
                dot={false}
                strokeDasharray="5 5"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Range Labels */}
      <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
        <span>${startPrice.toFixed(2)}</span>
        <span>${latestPrice.toFixed(2)}</span>
      </div>
    </div>
  );
});
