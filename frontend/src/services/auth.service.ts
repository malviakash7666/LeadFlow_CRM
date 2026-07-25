import axiosInstance from '../api/axiosInstance';
import type { ApiResponse, User } from '../types';

export const login = async (email: string, password: string): Promise<ApiResponse<{ user: User; accessToken: string }>> => {
  const response = await axiosInstance.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (name: string, email: string, password: string, role?: string): Promise<ApiResponse<{ user: User; accessToken: string }>> => {
  const response = await axiosInstance.post('/auth/register', { name, email, password, role });
  return response.data;
};

export const logout = async (): Promise<ApiResponse<null>> => {
  const response = await axiosInstance.post('/auth/logout');
  return response.data;
};

export const refreshToken = async (): Promise<ApiResponse<{ accessToken: string }>> => {
  const response = await axiosInstance.post('/auth/refresh');
  return response.data;
};

export const getCurrentUser = async (): Promise<ApiResponse<User>> => {
  const response = await axiosInstance.get('/auth/me');
  return response.data;
};
