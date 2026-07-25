import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Shield, ArrowLeft } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data.email, data.password);
      showToast('Logged in successfully!', 'success');
      navigate(from, { replace: true });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Invalid email or password';
      showToast(message, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4">
      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-slate-200 transition-colors">
        <ArrowLeft size={16} />
        Back to Home
      </Link>

      <div className="w-full max-w-md bg-slate-900/30 border border-slate-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
        {/* Brand */}
        <div className="flex flex-col items-center gap-4 text-center mb-8">
          <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-600/10">
            <Shield size={28} className="fill-indigo-300/30" />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-black text-slate-100 tracking-tight">Agent Portal</h2>
            <p className="text-sm text-slate-400">Sign in to manage your pipeline</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
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

          <Button
            type="submit"
            isLoading={isSubmitting}
            className="w-full h-11 mt-2 text-sm font-bold"
          >
            Authenticate
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Don't have an agent account?{' '}
          <Link to="/register" className="font-bold text-indigo-400 hover:text-indigo-300 hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
