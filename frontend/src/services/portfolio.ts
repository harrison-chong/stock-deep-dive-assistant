import axios from 'axios';
import { AddPortfolioRequest, SellPortfolioRequest } from '../types/portfolio';
import { API_BASE_URL } from '../constants';

export const addPortfolioEntry = async (data: AddPortfolioRequest) => {
  const response = await axios.post(`${API_BASE_URL}/api/portfolio/add`, data);
  return response.data;
};

export const sellPortfolioEntry = async (data: SellPortfolioRequest) => {
  const response = await axios.post(`${API_BASE_URL}/api/portfolio/sell`, data);
  return response.data;
};

export const getPortfolio = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/portfolio`);
  return response.data;
};

export const getPortfolioPerformance = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/portfolio/performance`);
  return response.data;
};

export const getPortfolioSummary = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/portfolio/summary`);
  return response.data;
};