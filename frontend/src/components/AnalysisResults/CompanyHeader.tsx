import { AnalysisData } from '../../types/analysis';
import { getGainLossColor } from '../../utils/formatting';

interface CompanyHeaderProps {
  data: AnalysisData;
}

export function CompanyHeader({ data }: CompanyHeaderProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="flex items-baseline gap-3">
            <h2 className="text-2xl font-bold text-gray-900">{data.company_name}</h2>
            <span className="text-sm text-gray-500">{data.ticker}</span>
          </div>
          <div className="flex gap-4 mt-2 text-xs text-gray-500">
            {data.sector && (
              <div>
                <span className="font-medium text-gray-600">Sector:</span> {data.sector}
              </div>
            )}
            {data.industry && (
              <div>
                <span className="font-medium text-gray-600">Industry:</span> {data.industry}
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-baseline justify-end gap-2">
            <p className="text-3xl font-bold text-gray-900">{data.current_price.toFixed(2)}</p>
            {data.currency && <p className="text-base text-gray-600">{data.currency}</p>}
          </div>
          {data.regular_market_change !== null && data.regular_market_change !== undefined && (
            <p className={`text-sm font-medium ${getGainLossColor(data.regular_market_change)}`}>
              {data.regular_market_change >= 0 ? '+' : ''}
              {data.regular_market_change.toFixed(2)} (
              {data.regular_market_change_percent !== null &&
              data.regular_market_change_percent !== undefined
                ? `${data.regular_market_change_percent >= 0 ? '+' : ''}${data.regular_market_change_percent.toFixed(2)}%`
                : 'N/A'}
              ) Today
            </p>
          )}
          {data.market_cap && (
            <p className="text-sm text-gray-600">
              Market Cap: ${(data.market_cap / 1e9).toFixed(1)}B
            </p>
          )}
          {data.data_start_date && data.data_end_date && (
            <p className="text-xs text-gray-500">
              Data: {new Date(data.data_start_date).toLocaleDateString()} -{' '}
              {new Date(data.data_end_date).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
