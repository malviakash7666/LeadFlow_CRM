import React, { useState } from 'react';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '../../hooks/useUsers';
import { useToast } from '../../context/ToastContext';
import { Sidebar } from '../../components/layout/Sidebar';
import { Navbar } from '../../components/layout/Navbar';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UserPlus, Edit2, Trash2 } from 'lucide-react';

const userCreateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['admin', 'member']),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const userEditSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['admin', 'member']),
});

type UserCreateFormValues = z.infer<typeof userCreateSchema>;
type UserEditFormValues = z.infer<typeof userEditSchema>;

export const Users: React.FC = () => {
  const { showToast } = useToast();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  // Queries & Mutations
  const { data: users, isLoading, isError, refetch } = useUsers();
  
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();

  const addForm = useForm<UserCreateFormValues>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: { role: 'member' }
  });

  const editForm = useForm<UserEditFormValues>({
    resolver: zodResolver(userEditSchema),
  });

  const handleAddSubmit = (data: UserCreateFormValues) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        showToast('User created successfully!', 'success');
        setIsAddOpen(false);
        addForm.reset();
        refetch();
      },
      onError: (err: any) => {
        showToast(err.response?.data?.message || 'Failed to create user', 'error');
      },
    });
  };

  const handleEditOpen = (user: any) => {
    setSelectedUser(user);
    editForm.reset({
      name: user.name,
      email: user.email,
      role: user.role,
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = (data: UserEditFormValues) => {
    if (selectedUser) {
      updateMutation.mutate(
        { id: selectedUser.id, data },
        {
          onSuccess: () => {
            showToast('User updated successfully!', 'success');
            setIsEditOpen(false);
            setSelectedUser(null);
            refetch();
          },
          onError: (err: any) => {
            showToast(err.response?.data?.message || 'Failed to update user', 'error');
          },
        }
      );
    }
  };

  const handleDeleteUser = (id: number) => {
    if (window.confirm('Are you sure you want to delete this team member? This will clear their assignment logs.')) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          showToast('User deleted successfully!', 'success');
          refetch();
        },
        onError: (err: any) => {
          showToast(err.response?.data?.message || 'Failed to delete user', 'error');
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Sidebar />

      <div className="pl-64 pt-16 flex-1 flex flex-col">
        <Navbar title="Team Members" />

        <main className="p-8 flex-1 flex flex-col gap-6 w-full max-w-7xl mx-auto">
          {/* Header Actions */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1 text-left">
              <h1 className="text-2xl font-bold tracking-tight">Team Roster</h1>
              <p className="text-sm text-slate-400">
                Manage agents, assign roles, and administer system access.
              </p>
            </div>
            <Button onClick={() => setIsAddOpen(true)} className="flex items-center gap-2">
              <UserPlus size={16} />
              Add Member
            </Button>
          </div>

          {/* User List */}
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center py-24">
              <svg className="animate-spin h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : isError ? (
            <div className="p-6 bg-rose-500/5 border border-rose-500/10 rounded-xl text-center text-rose-400 font-medium">
              Failed to load team members.
            </div>
          ) : (
            <div className="bg-slate-900/15 border border-slate-900 rounded-2xl overflow-hidden shadow-xl flex flex-col">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-400 font-bold uppercase text-[10px] tracking-wider select-none bg-slate-950/20">
                      <th className="px-6 py-3.5">ID</th>
                      <th className="px-6 py-3.5">Name</th>
                      <th className="px-6 py-3.5">Email</th>
                      <th className="px-6 py-3.5">System Role</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/60 text-slate-200">
                    {users?.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-900/20 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-400">#{u.id}</td>
                        <td className="px-6 py-4 font-bold text-slate-200">{u.name}</td>
                        <td className="px-6 py-4 text-slate-300 font-semibold">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            u.role === 'admin' 
                              ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' 
                              : 'bg-slate-800 border-slate-700 text-slate-300'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEditOpen(u)}
                              className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
                              title="Edit Member"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
                              title="Delete Member"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ADD MEMBER MODAL */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Team Member">
        <form onSubmit={addForm.handleSubmit(handleAddSubmit)} className="flex flex-col gap-4">
          <Input
            label="Name"
            placeholder="Agent Name"
            error={addForm.formState.errors.name?.message}
            {...addForm.register('name')}
          />
          <Input
            label="Email"
            type="email"
            placeholder="agent@domain.com"
            error={addForm.formState.errors.email?.message}
            {...addForm.register('email')}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={addForm.formState.errors.password?.message}
            {...addForm.register('password')}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider select-none">System Role</label>
            <select
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-200 focus:outline-none focus:border-indigo-600 cursor-pointer"
              {...addForm.register('role')}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <Button type="submit" isLoading={createMutation.isPending} className="w-full mt-2 h-11 font-bold">
            Add Team Member
          </Button>
        </form>
      </Modal>

      {/* EDIT MEMBER MODAL */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Team Member">
        <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="flex flex-col gap-4">
          <Input
            label="Name"
            placeholder="Agent Name"
            error={editForm.formState.errors.name?.message}
            {...editForm.register('name')}
          />
          <Input
            label="Email"
            type="email"
            placeholder="agent@domain.com"
            error={editForm.formState.errors.email?.message}
            {...editForm.register('email')}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider select-none">System Role</label>
            <select
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-200 focus:outline-none focus:border-indigo-600 cursor-pointer"
              {...editForm.register('role')}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <Button type="submit" isLoading={updateMutation.isPending} className="w-full mt-2 h-11 font-bold">
            Update Member Details
          </Button>
        </form>
      </Modal>
    </div>
  );
};
