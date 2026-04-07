export const getGainLossColor = (value: number): string =>
  value >= 0 ? 'text-green-600' : 'text-red-600';

export const getGainLossBgColor = (value: number): string =>
  value >= 0 ? 'bg-green-50' : 'bg-red-50';

export const formatCurrency = (value: number, decimals = 2): string =>
  `$${value.toFixed(decimals)}`;

export const formatPercent = (value: number, decimals = 2): string =>
  `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;

export const formatNumber = (value: number, decimals = 2): string => value.toFixed(decimals);

export const formatDate = (date: Date | string | number): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatTimestamp = (timestamp: number): string => {
  if (!timestamp || timestamp === 0) return 'N/A';
  return formatDate(new Date(timestamp * 1000));
};
