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

export const getWatchlist = async (addedBy?: string) => {
  const params = addedBy ? { added_by: addedBy } : {};
  const response = await axios.get<WatchlistListResponse>(`${API_BASE_URL}/api/watchlist`, {
    params,
  });
  return response.data;
};

export const getWatchlistFilterOptions = async () => {
  const response = await axios.get<{ options: string[] }>(
    `${API_BASE_URL}/api/watchlist/filter/added_by`,
  );
  return response.data.options;
};
