import { AnalysisData } from '../../types/analysis';
import { getGainLossColor } from '../../utils/formatting';

interface CompanyHeaderProps {
  data: AnalysisData;
}

export function CompanyHeader({ data }: CompanyHeaderProps) {
  return (
    <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl p-8 border border-gray-200/30 dark:border-gray-800/30 animate-fade-in transition-all duration-300">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
            {data.company_name}
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">{data.ticker}</span>
          <div className="flex gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
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
        </div>
        <div className="text-right">
          <p className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">
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
          {data.data_start_date && data.data_end_date && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              {new Date(data.data_start_date).toLocaleDateString()} —{' '}
              {new Date(data.data_end_date).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
