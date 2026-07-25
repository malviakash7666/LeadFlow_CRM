export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'member';
  createdAt: string;
  updatedAt: string;
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'won' | 'lost';

export interface Lead {
  id: number;
  name: string;
  email: string;
  company: string;
  phone: string;
  message: string;
  status: LeadStatus;
  assignedTo: number | null;
  createdBy: number | null;
  createdAt: string;
  updatedAt: string;
  assignee?: User;
  creator?: User;
  notes?: LeadNote[];
  logs?: ActivityLog[];
}

export interface LeadNote {
  id: number;
  leadId: number;
  userId: number;
  note: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface ActivityLog {
  id: number;
  leadId: number | null;
  userId: number;
  action: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedLeads {
  leads: Lead[];
  total: number;
  pages: number;
  currentPage: number;
}
