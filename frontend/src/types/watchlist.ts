export interface WatchlistEntry {
  id: string;
  ticker: string;
  entry_price: number;
  entry_date: string;
  current_price: number;
  gain_loss_percentage: number;
  notes: string;
  added_by: string;
  added_date: string;
}

export interface WatchlistSummary {
  total_stocks: number;
  average_gain_loss_percentage: number;
  stocks_above_entry: number;
  stocks_below_entry: number;
}

export interface WatchlistListResponse {
  watchlist: WatchlistEntry[];
  summary: WatchlistSummary;
}

export interface AddWatchlistRequest {
  ticker: string;
  entry_price?: number;
  entry_date?: string;
  notes?: string;
  added_by: string;
}

export interface DeleteWatchlistRequest {
  id: string;
}
