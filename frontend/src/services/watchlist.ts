import axios from 'axios';
import { AddWatchlistRequest, WatchlistListResponse } from '../types/watchlist';
import { API_BASE_URL } from '../constants';

export const addWatchlistEntry = async (data: AddWatchlistRequest) => {
  const response = await axios.post(`${API_BASE_URL}/api/watchlist`, data);
  return response.data;
};

export const deleteWatchlistEntry = async (id: string) => {
  const response = await axios.delete(`${API_BASE_URL}/api/watchlist/${id}`);
  return response.data;
};

export const getWatchlist = async (addedBy?: string, fetchCurrentPrice: boolean = true) => {
  const params: Record<string, string | boolean> = {};
  if (addedBy) params.added_by = addedBy;
  if (!fetchCurrentPrice) params.fetch_current_price = 'false';
  const response = await axios.get<WatchlistListResponse>(`${API_BASE_URL}/api/watchlist`, {
    params,
  });
  return response.data;
};
