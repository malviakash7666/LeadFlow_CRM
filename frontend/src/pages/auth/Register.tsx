import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Shield, ArrowLeft } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'member']),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const { register: signup } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'member' }
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await signup(data.name, data.email, data.password, data.role);
      showToast('Account created successfully!', 'success');
      navigate('/dashboard', { replace: true });
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Registration failed. Email might already be registered.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4">
      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-slate-200 transition-colors">
        <ArrowLeft size={16} />
        Back to Home
      </Link>

      <div className="w-full max-w-md bg-slate-900/30 border border-slate-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-md animate-fade-in">
        {/* Brand */}
        <div className="flex flex-col items-center gap-4 text-center mb-8">
          <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-600/10 animate-pulse">
            <Shield size={28} className="fill-indigo-300/30" />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-black text-slate-100 tracking-tight">Agent Sign Up</h2>
            <p className="text-sm text-slate-400">Create your account to start managing leads</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <Input
            label="Full Name"
            placeholder="Agent Name"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="agent@leadflow.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider select-none">System Role</label>
            <select
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-200 focus:outline-none focus:border-indigo-600 cursor-pointer"
              {...register('role')}
            >
              <option value="member">Member Agent</option>
              <option value="admin">Platform Admin</option>
            </select>
          </div>

          <Button
            type="submit"
            isLoading={isSubmitting}
            className="w-full h-11 mt-2 text-sm font-bold"
          >
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-indigo-400 hover:text-indigo-300 hover:underline">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
};
