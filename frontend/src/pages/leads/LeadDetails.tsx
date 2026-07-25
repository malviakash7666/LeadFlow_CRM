import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLeadDetails, useUpdateLeadStatus, useAssignLead, useAddLeadNote } from '../../hooks/useLeads';
import { useUsers } from '../../hooks/useUsers';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { Sidebar } from '../../components/layout/Sidebar';
import { Navbar } from '../../components/layout/Navbar';
import { Button } from '../../components/common/Button';
import { ArrowLeft, User, Calendar, MessageSquare, Clock, Plus } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { MarkdownEditor } from '../../components/common/MarkdownEditor';

export const LeadDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const leadId = parseInt(id || '');

  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const [noteText, setNoteText] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Queries & Mutations
  const { data: lead, isLoading, isError, refetch } = useLeadDetails(leadId);
  const { data: users } = useUsers(); // For assignment dropdown

  const updateStatusMutation = useUpdateLeadStatus();
  const assignMutation = useAssignLead();
  const addNoteMutation = useAddLeadNote();

  const handleStatusChange = (status: string) => {
    updateStatusMutation.mutate(
      { id: leadId, status },
      {
        onSuccess: () => {
          showToast('Status updated successfully!', 'success');
          refetch();
        },
        onError: (err: any) => {
          showToast(err.response?.data?.message || 'Failed to update status', 'error');
        },
      }
    );
  };

  const handleAssignChange = (userId: number) => {
    assignMutation.mutate(
      { id: leadId, assignedTo: userId },
      {
        onSuccess: () => {
          showToast('Lead assigned successfully!', 'success');
          setIsAssigning(false);
          refetch();
        },
        onError: (err: any) => {
          showToast(err.response?.data?.message || 'Failed to assign lead', 'error');
        },
      }
    );
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    addNoteMutation.mutate(
      { id: leadId, note: noteText },
      {
        onSuccess: () => {
          showToast('Note added successfully!', 'success');
          setNoteText('');
          refetch();
        },
        onError: (err: any) => {
          showToast(err.response?.data?.message || 'Failed to add note', 'error');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex justify-center items-center">
        <svg className="animate-spin h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (isError || !lead) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center gap-4">
        <span className="text-rose-400 font-medium">Failed to retrieve lead details.</span>
        <Link to="/leads">
          <Button variant="outline">Back to Leads</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Sidebar />

      <div className="pl-64 pt-16 flex-1 flex flex-col">
        <Navbar title={`Lead Details: ${lead.name}`} />

        <main className="p-8 flex-1 flex flex-col gap-6 w-full max-w-7xl mx-auto">
          {/* Back Action */}
          <Link to="/leads" className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-slate-200 transition-colors self-start select-none">
            <ArrowLeft size={16} />
            Back to Leads board
          </Link>

          {/* Details layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Box: Meta parameters */}
            <div className="lg:col-span-1 bg-slate-900/10 border border-slate-900 rounded-2xl p-6 flex flex-col gap-6 shadow-xl backdrop-blur-md">
              <div className="flex flex-col gap-1 text-left">
                <span className="text-xl font-bold text-slate-100">{lead.name}</span>
                <span className="text-sm font-semibold text-indigo-400">{lead.company}</span>
              </div>

              {/* Status Update */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider select-none">Lead status</label>
                <select
                  value={lead.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-200 focus:outline-none focus:border-indigo-600 cursor-pointer"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="won">Won</option>
                  <option value="lost">Lost</option>
                </select>
              </div>

              {/* Assignee Control */}
              <div className="flex flex-col gap-2 border-t border-slate-900/60 pt-4">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider select-none">Assigned Agent</label>
                {isAssigning && currentUser?.role === 'admin' ? (
                  <div className="flex flex-col gap-2">
                    <select
                      onChange={(e) => handleAssignChange(parseInt(e.target.value))}
                      defaultValue={lead.assignedTo || ''}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-200 focus:outline-none focus:border-indigo-600 cursor-pointer"
                    >
                      <option value="" disabled>Select agent...</option>
                      {users?.map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                      ))}
                    </select>
                    <Button variant="ghost" onClick={() => setIsAssigning(false)} className="text-xs self-start">
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
                        <User size={16} />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-sm font-semibold text-slate-200">
                          {lead.assignee?.name || 'Unassigned'}
                        </span>
                        <span className="text-xs text-slate-500">
                          {lead.assignee?.email || 'Assign an agent to start tracking'}
                        </span>
                      </div>
                    </div>
                    {currentUser?.role === 'admin' && (
                      <button
                        onClick={() => setIsAssigning(true)}
                        className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                      >
                        Change
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* General details */}
              <div className="flex flex-col gap-4 border-t border-slate-900/60 pt-4 text-left">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider select-none">Email</span>
                  <a href={`mailto:${lead.email}`} className="text-sm font-medium text-slate-300 hover:text-indigo-400 transition-colors">
                    {lead.email}
                  </a>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider select-none">Phone</span>
                  <a href={`tel:${lead.phone}`} className="text-sm font-medium text-slate-300 hover:text-indigo-400 transition-colors">
                    {lead.phone}
                  </a>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider select-none">Received Date</span>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Calendar size={14} />
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Message, Notes, Timeline */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Message Inquiry Box */}
              <div className="p-6 bg-slate-900/10 border border-slate-900 rounded-2xl flex flex-col gap-4 shadow-xl backdrop-blur-md text-left">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 select-none">
                  <MessageSquare size={14} />
                  Client Inquiry Message
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed bg-slate-950/60 p-4 border border-slate-900 rounded-xl font-medium">
                  "{lead.message}"
                </p>
              </div>

              {/* Add notes & notes timeline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Notes Container */}
                <div className="p-6 bg-slate-900/10 border border-slate-900 rounded-2xl flex flex-col gap-4 shadow-xl backdrop-blur-md">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-left select-none">Notes ({lead.notes?.length || 0})</h3>
                  
                  {/* Note Creator Form */}
                  <form onSubmit={handleAddNote} className="flex flex-col gap-3">
                    <MarkdownEditor
                      value={noteText}
                      onChange={setNoteText}
                      placeholder="Type note details (Markdown supported)..."
                    />
                    <Button 
                      type="submit" 
                      isLoading={addNoteMutation.isPending} 
                      className="w-full text-xs font-bold py-2 flex items-center justify-center gap-1.5"
                    >
                      <Plus size={14} />
                      Add Note
                    </Button>
                  </form>

                  {/* Notes List */}
                  <div className="flex flex-col gap-3 max-h-[40vh] overflow-y-auto mt-2">
                    {lead.notes?.map((n) => (
                      <div key={n.id} className="p-3.5 bg-slate-950 border border-slate-900 rounded-xl text-left flex flex-col gap-2">
                        <div className="text-slate-200 text-xs font-medium leading-relaxed prose prose-invert max-w-none text-left">
                          <ReactMarkdown>{n.note}</ReactMarkdown>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-1 select-none">
                          <span>By: {n.user?.name || 'Agent'}</span>
                          <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                    {(!lead.notes || lead.notes.length === 0) && (
                      <div className="py-8 text-center text-xs text-slate-600 italic">No notes added yet.</div>
                    )}
                  </div>
                </div>

                {/* Activity Timeline Container */}
                <div className="p-6 bg-slate-900/10 border border-slate-900 rounded-2xl flex flex-col gap-4 shadow-xl backdrop-blur-md">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-left select-none">Audit Timeline</h3>
                  <div className="flex flex-col gap-4 max-h-[48vh] overflow-y-auto pr-1">
                    {lead.logs?.map((log) => (
                      <div key={log.id} className="flex gap-3 text-left">
                        {/* Bullet Icon */}
                        <div className="relative mt-1 select-none flex flex-col items-center">
                          <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full border border-slate-950 z-10" />
                          <div className="w-0.5 bg-slate-900 flex-1 my-0.5" />
                        </div>
                        {/* Log Text */}
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-slate-300 leading-tight">
                            {log.description}
                          </span>
                          <div className="flex gap-2 text-[9px] text-slate-500 font-semibold select-none uppercase tracking-wider">
                            <Clock size={10} className="mt-0.5" />
                            {new Date(log.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!lead.logs || lead.logs.length === 0) && (
                      <div className="py-8 text-center text-xs text-slate-600 italic">No logs captured.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
