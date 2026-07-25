import React, { useState } from 'react';
import { useLeads, useUpdateLeadStatus, useAssignLead, useCreateLead, useDeleteLead } from '../../hooks/useLeads';
import { useUsers } from '../../hooks/useUsers';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { Sidebar } from '../../components/layout/Sidebar';
import { Navbar } from '../../components/layout/Navbar';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Kanban, List, Search, UserCheck, Plus, Trash2, ArrowRight, Download, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { LeadStatus } from '../../types';
import * as leadService from '../../services/lead.service';

const leadCreateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  company: z.string().min(2, 'Company must be at least 2 characters'),
  phone: z.string().min(5, 'Phone must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type LeadCreateFormValues = z.infer<typeof leadCreateSchema>;

export const Leads: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importSummary, setImportSummary] = useState<{
    total: number;
    success: number;
    duplicates: number;
    invalid: number;
    errors: string[];
  } | null>(null);

  // Queries & Mutations
  const { data: leadsData, isLoading, isError, refetch } = useLeads({
    page,
    limit: viewMode === 'table' ? 10 : 100, // higher limit for Kanban view
    search,
    status: viewMode === 'table' ? statusFilter : undefined,
  });

  const { data: users } = useUsers(); // For assignment selection

  const updateStatusMutation = useUpdateLeadStatus();
  const assignMutation = useAssignLead();
  const createMutation = useCreateLead();
  const deleteMutation = useDeleteLead();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeadCreateFormValues>({
    resolver: zodResolver(leadCreateSchema),
  });

  const handleCreateLead = (data: LeadCreateFormValues) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        showToast('Lead created successfully!', 'success');
        setIsCreateOpen(false);
        reset();
        refetch();
      },
      onError: (err: any) => {
        showToast(err.response?.data?.message || 'Failed to create lead', 'error');
      },
    });
  };

  const handleAssignLeadSubmit = (assignedToId: number) => {
    if (selectedLeadId) {
      assignMutation.mutate(
        { id: selectedLeadId, assignedTo: assignedToId },
        {
          onSuccess: () => {
            showToast('Lead assigned successfully!', 'success');
            setIsAssignOpen(false);
            setSelectedLeadId(null);
            refetch();
          },
          onError: (err: any) => {
            showToast(err.response?.data?.message || 'Failed to assign lead', 'error');
          },
        }
      );
    }
  };

  const handleDeleteLead = (id: number) => {
    if (window.confirm('Are you sure you want to delete this lead? This action is permanent.')) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          showToast('Lead deleted successfully!', 'success');
          refetch();
        },
        onError: (err: any) => {
          showToast(err.response?.data?.message || 'Failed to delete lead', 'error');
        },
      });
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = (leadsList: any[]) => {
    if (selectedIds.size === leadsList.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(leadsList.map(l => l.id)));
    }
  };

  const exportLeadsToCSV = (leadsToExport: any[]) => {
    const headers = ['id', 'name', 'email', 'company', 'phone', 'message', 'status', 'createdAt'];
    const rows = leadsToExport.map(lead => [
      lead.id,
      `"${lead.name.replace(/"/g, '""')}"`,
      lead.email,
      `"${lead.company.replace(/"/g, '""')}"`,
      `"${(lead.phone || '').replace(/"/g, '""')}"`,
      `"${(lead.message || '').replace(/"/g, '""')}"`,
      lead.status,
      lead.createdAt
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads_export.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleExportSelected = () => {
    const allLeads = leadsData?.leads || [];
    const selectedLeads = allLeads.filter(l => selectedIds.has(l.id));
    if (selectedLeads.length === 0) {
      showToast('No leads selected for export', 'error');
      return;
    }
    exportLeadsToCSV(selectedLeads);
    showToast(`Exported ${selectedLeads.length} selected leads!`, 'success');
  };

  const handleExportFiltered = async () => {
    try {
      await leadService.exportLeads({
        search,
        status: viewMode === 'table' ? statusFilter : undefined
      });
      showToast('Exported filtered leads!', 'success');
    } catch (err) {
      showToast('Failed to export filtered leads', 'error');
    }
  };

  const handleImportFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvText = event.target?.result as string;
      if (!csvText) {
        showToast('File is empty', 'error');
        return;
      }

      setImporting(true);
      setImportSummary(null);
      try {
        const res = await leadService.importLeads(csvText);
        if (res.success && res.data) {
          setImportSummary(res.data);
          showToast('CSV import complete!', 'success');
        } else {
          showToast(res.message || 'Import failed', 'error');
        }
      } catch (err: any) {
        showToast(err.response?.data?.message || 'Import failed', 'error');
      } finally {
        setImporting(false);
      }
    };
    reader.readAsText(file);
  };

  // Kanban Native Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, id: number) => {
    e.dataTransfer.setData('leadId', id.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: LeadStatus) => {
    e.preventDefault();
    const id = parseInt(e.dataTransfer.getData('leadId'));
    if (!isNaN(id)) {
      updateStatusMutation.mutate(
        { id, status: targetStatus },
        {
          onSuccess: () => {
            showToast('Lead status updated successfully!', 'success');
            refetch();
          },
          onError: (err: any) => {
            showToast(err.response?.data?.message || 'Permission denied. Could not update lead status.', 'error');
          },
        }
      );
    }
  };

  const columns: { status: LeadStatus; label: string; color: string }[] = [
    { status: 'new', label: 'New', color: 'border-indigo-600/30' },
    { status: 'contacted', label: 'Contacted', color: 'border-amber-600/30' },
    { status: 'qualified', label: 'Qualified', color: 'border-blue-600/30' },
    { status: 'won', label: 'Won', color: 'border-emerald-600/30' },
    { status: 'lost', label: 'Lost', color: 'border-rose-600/30' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Sidebar />

      <div className="pl-64 pt-16 flex-1 flex flex-col">
        <Navbar title="Leads Management" />

        <main className="p-8 flex-1 flex flex-col gap-6 w-full max-w-7xl mx-auto">
          {/* Action Row */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant={viewMode === 'kanban' ? 'primary' : 'outline'}
                onClick={() => setViewMode('kanban')}
                className="flex items-center gap-2"
              >
                <Kanban size={16} />
                Kanban
              </Button>
              <Button
                variant={viewMode === 'table' ? 'primary' : 'outline'}
                onClick={() => setViewMode('table')}
                className="flex items-center gap-2"
              >
                <List size={16} />
                Table List
              </Button>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto flex-wrap">
              <div className="relative flex-1 md:flex-none">
                <Search className="absolute left-3.5 top-3 text-slate-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 rounded-xl text-sm placeholder-slate-500 text-slate-100"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsImportOpen(true)} 
                  className="flex items-center gap-1.5 py-2 px-3 text-xs cursor-pointer select-none"
                >
                  <Upload size={14} />
                  Import CSV
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleExportFiltered} 
                  className="flex items-center gap-1.5 py-2 px-3 text-xs cursor-pointer select-none"
                >
                  <Download size={14} />
                  Export All
                </Button>
                {selectedIds.size > 0 && (
                  <Button 
                    variant="outline" 
                    onClick={handleExportSelected} 
                    className="flex items-center gap-1.5 py-2 px-3 text-xs border-emerald-500/20 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 cursor-pointer select-none"
                  >
                    <Download size={14} />
                    Selected ({selectedIds.size})
                  </Button>
                )}
              </div>

              <Button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2 select-none">
                <Plus size={16} />
                Add Lead
              </Button>
            </div>
          </div>

          {/* Leads Viewer */}
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center py-24">
              <svg className="animate-spin h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : isError ? (
            <div className="p-6 bg-rose-500/5 border border-rose-500/10 rounded-xl text-center text-rose-400 font-medium">
              Failed to retrieve leads.
            </div>
          ) : viewMode === 'kanban' ? (
            /* Kanban Board */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start flex-1">
              {columns.map((col) => {
                const columnLeads = (leadsData?.leads || []).filter((l) => l.status === col.status);
                return (
                  <div
                    key={col.status}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, col.status)}
                    className="flex flex-col bg-slate-900/25 border border-slate-900 rounded-2xl min-h-[60vh] max-h-[75vh]"
                  >
                    {/* Header */}
                    <div className="p-4 border-b border-slate-900/60 bg-slate-950 flex items-center justify-between rounded-t-2xl">
                      <span className="font-bold text-sm text-slate-200">{col.label}</span>
                      <span className="px-2 py-0.5 text-xs font-semibold bg-slate-900 text-slate-400 rounded-full border border-slate-800">
                        {columnLeads.length}
                      </span>
                    </div>

                    {/* Cards Scroll */}
                    <div className="p-3 flex flex-col gap-3 overflow-y-auto flex-1 select-none">
                      {columnLeads.map((lead) => (
                        <div
                          key={lead.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, lead.id)}
                          onClick={() => navigate(`/leads/${lead.id}`)}
                          className="p-4 bg-slate-900 border border-slate-800 hover:border-indigo-500/30 rounded-xl shadow-md cursor-grab active:cursor-grabbing transition-all hover:scale-[1.01]"
                        >
                          <div className="flex flex-col gap-1 text-left">
                            <span className="font-bold text-slate-100 text-sm">{lead.name}</span>
                            <span className="text-xs font-medium text-indigo-400">{lead.company}</span>
                          </div>
                          <div className="flex justify-between items-center mt-4">
                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                              ID: {lead.id}
                            </span>
                            {lead.assignee ? (
                              <div className="px-2 py-0.5 text-[10px] font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full truncate max-w-[100px]">
                                {lead.assignee.name}
                              </div>
                            ) : (
                              <span className="text-[10px] font-semibold text-slate-500 italic">Unassigned</span>
                            )}
                          </div>
                        </div>
                      ))}
                      {columnLeads.length === 0 && (
                        <div className="flex-1 flex items-center justify-center py-12 text-slate-600 text-xs italic">
                          Drop leads here
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="bg-slate-900/15 border border-slate-900 rounded-2xl overflow-hidden shadow-xl flex flex-col">
              {/* Filter Sub-bar */}
              <div className="px-6 py-4 border-b border-slate-900 bg-slate-950/60 flex items-center gap-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status filter:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold px-3 py-1.5 text-slate-300"
                >
                  <option value="">All Statuses</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="won">Won</option>
                  <option value="lost">Lost</option>
                </select>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-400 font-bold uppercase text-[10px] tracking-wider select-none bg-slate-950/20">
                      <th className="px-6 py-3.5 w-12">
                        <input
                          type="checkbox"
                          checked={leadsData?.leads && leadsData.leads.length > 0 && selectedIds.size === leadsData.leads.length}
                          onChange={() => toggleSelectAll(leadsData?.leads || [])}
                          className="rounded border-slate-800 text-indigo-600 focus:ring-0 cursor-pointer"
                        />
                      </th>
                      <th className="px-6 py-3.5">ID</th>
                      <th className="px-6 py-3.5">Name</th>
                      <th className="px-6 py-3.5">Company</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5">Assignee</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/60 text-slate-200">
                    {leadsData?.leads.map((lead) => (
                      <tr
                        key={lead.id}
                        className="hover:bg-slate-900/20 cursor-pointer transition-colors"
                        onClick={() => navigate(`/leads/${lead.id}`)}
                      >
                        <td className="px-6 py-4 w-12" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(lead.id)}
                            onChange={() => toggleSelect(lead.id)}
                            className="rounded border-slate-800 text-indigo-600 focus:ring-0 cursor-pointer"
                          />
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-400">#{lead.id}</td>
                        <td className="px-6 py-4 font-bold text-slate-200">{lead.name}</td>
                        <td className="px-6 py-4 text-indigo-400 font-semibold">{lead.company}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            lead.status === 'won' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                            lead.status === 'lost' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                            lead.status === 'qualified' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                            lead.status === 'contacted' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                            'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                          }`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-300 font-medium">
                          {lead.assignee?.name || <span className="text-slate-600 italic">Unassigned</span>}
                        </td>
                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end gap-2">
                            {currentUser?.role === 'admin' && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedLeadId(lead.id);
                                    setIsAssignOpen(true);
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
                                  title="Assign Lead"
                                >
                                  <UserCheck size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteLead(lead.id)}
                                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
                                  title="Delete Lead"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {(leadsData?.leads || []).length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-slate-500 italic">
                          No leads matching query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              {leadsData && leadsData.pages > 1 && (
                <div className="px-6 py-4 bg-slate-950/60 border-t border-slate-900 flex justify-between items-center select-none text-xs font-semibold text-slate-400">
                  <span>Page {leadsData.currentPage} of {leadsData.pages}</span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="px-3 py-1.5 text-xs"
                    >
                      Prev
                    </Button>
                    <Button
                      variant="outline"
                      disabled={page === leadsData.pages}
                      onClick={() => setPage((p) => p + 1)}
                      className="px-3 py-1.5 text-xs"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* CREATE LEAD MODAL */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Lead">
        <form onSubmit={handleSubmit(handleCreateLead)} className="flex flex-col gap-4">
          <Input label="Name" placeholder="John Doe" error={errors.name?.message} {...register('name')} />
          <Input label="Email" type="email" placeholder="john@domain.com" error={errors.email?.message} {...register('email')} />
          <Input label="Company" placeholder="Acme Corp" error={errors.company?.message} {...register('company')} />
          <Input label="Phone" placeholder="+123 456 789" error={errors.phone?.message} {...register('phone')} />
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Message</label>
            <textarea
              rows={3}
              placeholder="Lead requirements description..."
              className={`w-full px-4 py-2.5 bg-slate-900/60 border ${
                errors.message ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-600'
              } rounded-xl text-slate-100 placeholder-slate-500 text-sm`}
              {...register('message')}
            />
            {errors.message?.message && <span className="text-xs text-rose-500 font-medium">{errors.message?.message}</span>}
          </div>

          <Button type="submit" isLoading={createMutation.isPending} className="w-full mt-2 h-11 font-bold">
            Create Lead Request
            <ArrowRight size={16} className="ml-2" />
          </Button>
        </form>
      </Modal>

      {/* ASSIGN LEAD MODAL */}
      <Modal isOpen={isAssignOpen} onClose={() => setIsAssignOpen(false)} title="Assign Agent">
        <div className="flex flex-col gap-4">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider select-none">
            Choose Agent to Handle Lead
          </label>
          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
            {users?.map((u) => (
              <button
                key={u.id}
                onClick={() => handleAssignLeadSubmit(u.id)}
                className="w-full text-left p-3 rounded-xl border border-slate-900 bg-slate-900/40 hover:bg-indigo-600/10 hover:border-indigo-500/30 flex justify-between items-center transition-all cursor-pointer"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-200">{u.name}</span>
                  <span className="text-xs text-slate-500">{u.email}</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-950 text-slate-400 rounded-md border border-slate-800">
                  {u.role}
                </span>
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* CSV IMPORT MODAL */}
      <Modal 
        isOpen={isImportOpen} 
        onClose={() => {
          setIsImportOpen(false);
          setImportSummary(null);
          refetch();
        }} 
        title="CSV Lead Import"
      >
        <div className="flex flex-col gap-5 text-left">
          <p className="text-xs text-slate-400 leading-relaxed select-none">
            Upload a standard CSV spreadsheet to import leads. Your CSV file must contain the following header fields: <span className="font-semibold text-slate-300">Name</span>, <span className="font-semibold text-slate-300">Email</span>, and <span className="font-semibold text-slate-300">Company</span>. Optional header fields are: <span className="font-semibold text-slate-300">Phone</span> and <span className="font-semibold text-slate-300">Message</span>.
          </p>

          {!importSummary && !importing && (
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 hover:border-indigo-500/40 rounded-2xl py-10 bg-slate-900/10 cursor-pointer transition-all select-none">
              <Upload size={24} className="text-slate-500 mb-2" />
              <span className="text-xs font-bold text-slate-300">Click to upload lead spreadsheet</span>
              <span className="text-[10px] text-slate-500 mt-1">Accepts .csv format</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleImportFileChange}
                className="hidden"
              />
            </label>
          )}

          {importing && (
            <div className="flex flex-col items-center py-10 select-none">
              <svg className="animate-spin h-7 w-7 text-indigo-500 mb-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-xs font-semibold text-slate-400">Processing file & analyzing records...</span>
            </div>
          )}

          {importSummary && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-900 border border-slate-800/80 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Parsed</span>
                  <span className="text-lg font-black text-slate-200">{importSummary.total}</span>
                </div>
                <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-wider block">Imported Successfully</span>
                  <span className="text-lg font-black text-emerald-400">{importSummary.success}</span>
                </div>
                <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-amber-500/60 uppercase tracking-wider block">Duplicates Skipped</span>
                  <span className="text-lg font-black text-amber-400">{importSummary.duplicates}</span>
                </div>
                <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-rose-500/60 uppercase tracking-wider block">Invalid Records</span>
                  <span className="text-lg font-black text-rose-400">{importSummary.invalid}</span>
                </div>
              </div>

              {importSummary.errors.length > 0 && (
                <div className="p-4 bg-slate-900 border border-slate-850 rounded-xl flex flex-col gap-2 max-h-40 overflow-y-auto">
                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Validation Errors & Log Warnings</span>
                  <ul className="text-[11px] font-semibold text-slate-400 flex flex-col gap-1.5 list-disc list-inside">
                    {importSummary.errors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <Button
                onClick={() => {
                  setIsImportOpen(false);
                  setImportSummary(null);
                  refetch();
                }}
                className="w-full font-bold mt-2 py-2.5 text-xs"
              >
                Close Summary & Reload List
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
