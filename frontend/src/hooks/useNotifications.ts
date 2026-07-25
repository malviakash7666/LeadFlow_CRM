import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../api/axiosInstance';
import type { ApiResponse } from '../types';

export interface NotificationItem {
  id: number;
  userId: number;
  leadId: number | null;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  lead?: {
    id: number;
    name: string;
    company: string;
  };
}

export const useNotifications = () => {
  return useQuery<NotificationItem[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await axiosInstance.get<ApiResponse<NotificationItem[]>>('/notifications');
      return res.data.data;
    },
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await axiosInstance.put<ApiResponse<NotificationItem>>(`/notifications/${id}/read`);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.put<ApiResponse<null>>('/notifications/read-all');
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};
