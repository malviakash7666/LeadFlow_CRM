import axiosInstance from '../api/axiosInstance';
import type { ApiResponse, User } from '../types';

export const getUsers = async (): Promise<ApiResponse<User[]>> => {
  const response = await axiosInstance.get('/users');
  return response.data;
};

export const getUserById = async (id: number): Promise<ApiResponse<User>> => {
  const response = await axiosInstance.get(`/users/${id}`);
  return response.data;
};

export const createUser = async (data: {
  name: string;
  email: string;
  role: 'admin' | 'member';
  password?: string;
}): Promise<ApiResponse<User>> => {
  const response = await axiosInstance.post('/users', data);
  return response.data;
};

export const updateUser = async (id: number, data: {
  name?: string;
  email?: string;
  role?: 'admin' | 'member';
}): Promise<ApiResponse<User>> => {
  const response = await axiosInstance.put(`/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id: number): Promise<ApiResponse<null>> => {
  const response = await axiosInstance.delete(`/users/${id}`);
  return response.data;
};
