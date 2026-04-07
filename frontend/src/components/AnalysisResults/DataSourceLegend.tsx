export function DataSourceLegend() {
  return (
    <div className="flex items-center gap-6 text-xs text-gray-500">
      <div className="flex items-center gap-1.5">
        <span className="px-1.5 py-0.5 bg-gray-100 rounded">Y! Finance</span>
        <span>Sourced from Yahoo Finance</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded">Calc</span>
        <span>Calculated from historical price data</span>
      </div>
    </div>
  );
}
