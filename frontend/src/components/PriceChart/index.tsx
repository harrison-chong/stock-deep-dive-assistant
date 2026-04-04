import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface PriceChartProps {
  ticker: string;
  currentPrice: number;
}

type Period = '1M' | '6M' | 'YTD' | '1Y' | '5Y' | 'MAX';

interface ChartDataPoint {
  date: string;
  price: number;
}

// Format date - show year only when it differs from the most recent date's year
function formatDate(date: Date, showYear: boolean): string {
  if (showYear) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Generate sample data that ends near currentPrice - in production this would come from API
function generateSampleData(period: Period, currentPrice: number): ChartDataPoint[] {
  const now = new Date();
  const data: ChartDataPoint[] = [];

  let days = 1;
  switch (period) {
    case '1M':
      days = 30;
      break;
    case '6M':
      days = 180;
      break;
    case 'YTD':
      days = Math.floor(
        (now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24),
      );
      break;
    case '1Y':
      days = 365;
      break;
    case '5Y':
      days = 1825;
      break;
    case 'MAX':
      days = 3650;
      break;
  }

  // Determine if we should show years in dates (for periods >= 1 year)
  const showYear = days >= 365;

  // Start at a lower price and walk forward to currentPrice
  const volatility = 0.015; // ~1.5% daily volatility
  const startPrice = currentPrice * (1 - days * volatility * 0.3); // Start lower
  let price = startPrice;

  // Generate data chronologically (oldest first)
  for (let i = 0; i <= days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - (days - i));

    data.push({
      date: formatDate(date, showYear),
      price: Math.round(price * 100) / 100,
    });

    // Random walk forward towards current price
    if (i < days) {
      const targetDiff = currentPrice - startPrice;
      const expectedReturn =
        targetDiff * (1 / (days - i)) * (1 + (Math.random() - 0.5) * volatility * 2);
      price = price + expectedReturn;
    }
  }

  // Ensure last price is close to currentPrice
  if (data.length > 0) {
    data[data.length - 1].price = currentPrice;
  }

  return data;
}

export function PriceChart({ ticker, currentPrice }: PriceChartProps) {
  const [period, setPeriod] = useState<Period>('1Y');
  const data = generateSampleData(period, currentPrice);

  const latestPrice = data[data.length - 1]?.price ?? currentPrice;
  const startPrice = data[0]?.price ?? currentPrice;
  const priceChange = latestPrice - startPrice;
  const percentChange = startPrice > 0 ? (priceChange / startPrice) * 100 : 0;

  const periods: Period[] = ['1M', '6M', 'YTD', '1Y', '5Y', 'MAX'];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
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
            <p className="text-xs text-gray-500">{period} Change</p>
          </div>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {periods.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              period === p
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {p}
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
              formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Price']}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke={priceChange >= 0 ? '#16a34a' : '#dc2626'}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: priceChange >= 0 ? '#16a34a' : '#dc2626' }}
            />
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
