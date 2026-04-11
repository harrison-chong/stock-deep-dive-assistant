export function DataSourceLegend() {
  return (
    <div className="flex items-center justify-center gap-6 text-xs text-gray-400 py-2">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-blue-400" />
        <span className="font-medium text-gray-500">Y! Finance</span>
        <span>·</span>
        <span>Sourced from Yahoo Finance</span>
      </div>
      <div className="w-px h-3 bg-gray-200" />
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-purple-400" />
        <span className="font-medium text-gray-500">Calc</span>
        <span>·</span>
        <span>Calculated from historical price data</span>
      </div>
    </div>
  );
}
