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
  chartData: { date: string; close: number }[];
}

export function PriceChart({ ticker, currentPrice, chartData }: PriceChartProps) {
  // Transform chart data for the chart
  const data = chartData.map((point) => ({
    date: new Date(point.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    price: point.close,
  }));

  const latestPrice = data[data.length - 1]?.price ?? currentPrice;
  const startPrice = data[0]?.price ?? currentPrice;
  const priceChange = latestPrice - startPrice;
  const percentChange = startPrice > 0 ? (priceChange / startPrice) * 100 : 0;

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
            <p className="text-xs text-gray-500">Period Change</p>
          </div>
        </div>
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
