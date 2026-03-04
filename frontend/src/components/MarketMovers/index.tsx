import { TrendingUp, TrendingDown } from 'lucide-react';

interface StockMover {
  ticker: string;
  company_name: string;
  change_percent: number;
  current_price: number;
  currency: string | null;
}

interface MarketMoversProps {
  topPerformers: StockMover[];
  bottomPerformers: StockMover[];
  onStockClick: (ticker: string) => void;
}

export function MarketMovers({ topPerformers, bottomPerformers, onStockClick }: MarketMoversProps) {
  const renderMoverCard = (mover: StockMover) => (
    <button
      key={mover.ticker}
      onClick={() => onStockClick(mover.ticker)}
      className="block text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-semibold text-gray-900">{mover.ticker}</p>
          <p className="text-sm text-gray-600">{mover.company_name}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">
            {mover.current_price.toFixed(2)} {mover.currency || 'USD'}
          </p>
        </div>
      </div>
      <div
        className={`flex items-center gap-1 ${
          mover.change_percent >= 0 ? 'text-green-600' : 'text-red-600'
        }`}
      >
        {mover.change_percent >= 0 ? (
          <TrendingUp className="w-4 h-4" />
        ) : (
          <TrendingDown className="w-4 h-4" />
        )}
        <p className="font-semibold">{Math.abs(mover.change_percent).toFixed(2)}%</p>
      </div>
    </button>
  );

  return (
    <div className="space-y-8">
      {/* Top Performers */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          Top 5 Performers (24H)
        </h3>
        <div className="grid md:grid-cols-5 gap-4">
          {topPerformers.map((mover) => renderMoverCard(mover))}
        </div>
      </div>

      {/* Bottom Performers */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-red-600" />
          Bottom 5 Performers (24H)
        </h3>
        <div className="grid md:grid-cols-5 gap-4">
          {bottomPerformers.map((mover) => renderMoverCard(mover))}
        </div>
      </div>
    </div>
  );
}
