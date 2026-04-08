import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AddWatchlistRequest } from '../types/watchlist';
import {
  addWatchlistEntry as addEntry,
  deleteWatchlistEntry,
  getWatchlist as fetchWatchlist,
} from '../services/watchlist';

export const WATCHLIST_KEY = 'watchlist';

export function useWatchlist(fetchCurrentPrice: boolean = true) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [WATCHLIST_KEY, fetchCurrentPrice],
    queryFn: () => fetchWatchlist(undefined, fetchCurrentPrice),
    staleTime: Infinity, // Only refetch on explicit refresh
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  const addMutation = useMutation({
    mutationFn: (data: AddWatchlistRequest) => addEntry(data),
    onSuccess: () => {
      // Invalidate all watchlist queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: [WATCHLIST_KEY] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteWatchlistEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [WATCHLIST_KEY] });
    },
  });

  return {
    watchlist: query.data?.watchlist || [],
    summary: query.data?.summary,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isRefetching: query.isRefetching,
    error: query.error?.message || '',
    refetch: query.refetch,
    addStock: addMutation.mutate,
    deleteStock: deleteMutation.mutate,
    addError: addMutation.error?.message || '',
  };
}
