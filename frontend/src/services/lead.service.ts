import axiosInstance from '../api/axiosInstance';
import type { ApiResponse, Lead, LeadNote, PaginatedLeads } from '../types';

export const getLeads = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  assignedTo?: number;
}): Promise<ApiResponse<PaginatedLeads>> => {
  const response = await axiosInstance.get('/leads', { params });
  return response.data;
};

export const getLeadById = async (id: number): Promise<ApiResponse<Lead>> => {
  const response = await axiosInstance.get(`/leads/${id}`);
  return response.data;
};

export const createLead = async (data: {
  name: string;
  email: string;
  company: string;
  phone: string;
  message: string;
}): Promise<ApiResponse<Lead>> => {
  const response = await axiosInstance.post('/leads/capture', data);
  return response.data;
};

export const updateLead = async (
  id: number,
  data: Partial<Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<ApiResponse<Lead>> => {
  const response = await axiosInstance.put(`/leads/${id}`, data);
  return response.data;
};

export const deleteLead = async (id: number): Promise<ApiResponse<null>> => {
  const response = await axiosInstance.delete(`/leads/${id}`);
  return response.data;
};

export const assignLead = async (id: number, assignedTo: number): Promise<ApiResponse<Lead>> => {
  const response = await axiosInstance.put(`/leads/${id}/assign`, { assignedTo });
  return response.data;
};

export const updateLeadStatus = async (id: number, status: string): Promise<ApiResponse<Lead>> => {
  const response = await axiosInstance.put(`/leads/${id}/status`, { status });
  return response.data;
};

export const addNote = async (id: number, note: string): Promise<ApiResponse<LeadNote>> => {
  const response = await axiosInstance.post(`/leads/${id}/notes`, { note });
  return response.data;
};

export const getRecentActivities = async (): Promise<ApiResponse<any[]>> => {
  const response = await axiosInstance.get('/leads/activities');
  return response.data;
};

export const importLeads = async (csvText: string): Promise<ApiResponse<{
  total: number;
  success: number;
  duplicates: number;
  invalid: number;
  errors: string[];
}>> => {
  const response = await axiosInstance.post('/leads/import', { csvText });
  return response.data;
};

export const exportLeads = async (filters: { search?: string; status?: string; assignedTo?: string } = {}): Promise<void> => {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.status) params.append('status', filters.status);
  if (filters.assignedTo) params.append('assignedTo', filters.assignedTo.toString());
  
  const response = await axiosInstance.get(`/leads/export?${params.toString()}`, {
    responseType: 'blob'
  });
  
  const blob = new Blob([response.data], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'leads_export.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};
