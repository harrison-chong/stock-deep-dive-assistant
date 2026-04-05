import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { PERIODS } from '../../constants';

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
  onPeriodChange: (period: string) => void;
}

export function PriceChart({
  ticker,
  currentPrice,
  chartData,
  period,
  onPeriodChange,
}: PriceChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState(period);
  const [showSMA20, setShowSMA20] = useState(false);
  const [showSMA50, setShowSMA50] = useState(false);
  const [showSMA200, setShowSMA200] = useState(false);

  // Check if SMA data is available
  const hasSMAData = chartData.some(
    (point) => point.sma20 !== null || point.sma50 !== null || point.sma200 !== null,
  );

  // Sync with parent period when it changes
  useEffect(() => {
    setSelectedPeriod(period);
  }, [period]);

  // Transform chart data for the chart
  const data = chartData.map((point) => ({
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

  const handlePeriodChange = (newPeriod: string) => {
    setSelectedPeriod(newPeriod);
    onPeriodChange(newPeriod);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Price Chart</h3>
          <p className="text-sm text-gray-500">
            {ticker} • ${latestPrice.toFixed(2)}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p
              className={`text-lg font-bold ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              {priceChange >= 0 ? '+' : ''}
              {priceChange.toFixed(2)} ({percentChange.toFixed(2)}%)
            </p>
            <p className="text-xs text-gray-500">Period Change</p>
          </div>
        </div>
      </div>

      {/* SMA Toggles */}
      {hasSMAData && (
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => setShowSMA20(!showSMA20)}
            className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
              showSMA20
                ? 'bg-blue-100 border-blue-300 text-blue-700'
                : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
            }`}
          >
            SMA 20
          </button>
          <button
            onClick={() => setShowSMA50(!showSMA50)}
            className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
              showSMA50
                ? 'bg-orange-100 border-orange-300 text-orange-700'
                : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
            }`}
          >
            SMA 50
          </button>
          <button
            onClick={() => setShowSMA200(!showSMA200)}
            className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
              showSMA200
                ? 'bg-purple-100 border-purple-300 text-purple-700'
                : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
            }`}
          >
            SMA 200
          </button>
        </div>
      )}

      {/* Period Selector */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => handlePeriodChange(p.value)}
            className={`px-3 py-2 text-xs font-medium transition-colors ${
              selectedPeriod === p.value
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
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
              width={60}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
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
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span>${startPrice.toFixed(2)}</span>
        <span>${latestPrice.toFixed(2)}</span>
      </div>
    </div>
  );
}
