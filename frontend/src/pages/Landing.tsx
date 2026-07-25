import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateLead } from '../hooks/useLeads';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Shield, Sparkles, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const captureSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  company: z.string().min(2, 'Company name must be at least 2 characters'),
  phone: z.string().min(5, 'Phone number must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type CaptureFormValues = z.infer<typeof captureSchema>;

export const Landing: React.FC = () => {
  const { showToast } = useToast();
  const createLeadMutation = useCreateLead();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CaptureFormValues>({
    resolver: zodResolver(captureSchema),
  });

  const onSubmit = (data: CaptureFormValues) => {
    createLeadMutation.mutate(data, {
      onSuccess: () => {
        showToast('Lead request captured successfully! Our team will contact you soon.', 'success');
        setSubmitted(true);
        reset();
      },
      onError: (error: any) => {
        showToast(error.response?.data?.message || 'Failed to submit lead request', 'error');
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Header */}
      <header className="h-20 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-8 md:px-16 fixed top-0 left-0 right-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
            <Shield size={20} className="fill-indigo-300/30" />
          </div>
          <span className="font-extrabold text-lg text-slate-100 tracking-tight select-none">
            LeadFlow<span className="text-indigo-500 font-semibold"> CRM</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" className="font-bold px-4 text-slate-300 hover:text-slate-100">
              Sign In
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="primary" className="font-bold px-5">
              Register Agent
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Body */}
      <main className="flex-1 pt-32 pb-16 px-8 md:px-16 flex flex-col lg:flex-row items-center justify-center gap-16 max-w-7xl mx-auto w-full">
        {/* Left Side: Marketing Pitch */}
        <div className="flex-1 flex flex-col gap-6 text-left">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-full text-indigo-400 text-xs font-bold uppercase tracking-wider self-start">
            <Sparkles size={12} />
            LeadFlow CRM Enterprise 2.0
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-100 leading-tight">
            Accelerate Your <br />
            <span className="bg-gradient-to-r from-indigo-400 via-indigo-500 to-indigo-600 bg-clip-text text-transparent">
              Lead Conversions
            </span>
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-lg leading-relaxed">
            The modular, secure Enterprise Lead Management Platform that bridges client enquiries directly to sales agents in real-time. Boost efficiency, log touchpoints, and close more deals.
          </p>

          {/* Core Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
                <Zap size={16} />
              </div>
              <span className="text-sm font-semibold text-slate-300">Automated Pipeline</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
                <Shield size={16} />
              </div>
              <span className="text-sm font-semibold text-slate-300">Role-Based Protection</span>
            </div>
          </div>
        </div>

        {/* Right Side: Lead Capture Form Card */}
        <div className="w-full max-w-lg bg-slate-900/30 border border-slate-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
          {submitted ? (
            <div className="flex flex-col items-center justify-center text-center py-12 gap-4">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 animate-bounce">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-2xl font-bold text-slate-100">Request Submitted!</h2>
              <p className="text-slate-400 text-sm max-w-xs">
                Thanks for reaching out. A product specialist will contact you at the email provided shortly.
              </p>
              <Button
                variant="outline"
                onClick={() => setSubmitted(false)}
                className="mt-6 border-slate-800 hover:bg-slate-900"
              >
                Submit another request
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-1.5">
                <h2 className="text-xl font-bold text-slate-100">Get Started Today</h2>
                <p className="text-sm text-slate-400">Fill out the form below to register your enterprise enquiry.</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    placeholder="Enter your name"
                    error={errors.name?.message}
                    {...register('name')}
                  />
                  <Input
                    label="Email Address"
                    placeholder="name@company.com"
                    error={errors.email?.message}
                    {...register('email')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Company Name"
                    placeholder="e.g. ACME Corp"
                    error={errors.company?.message}
                    {...register('company')}
                  />
                  <Input
                    label="Phone Number"
                    placeholder="e.g. +1 555-0199"
                    error={errors.phone?.message}
                    {...register('phone')}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider select-none">
                    How can we help?
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe your requirements..."
                    className={`w-full px-4 py-2.5 bg-slate-900/60 border ${
                      errors.message ? 'border-rose-500 focus:ring-rose-500/10 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-600 focus:ring-indigo-600/10'
                    } rounded-xl text-slate-100 placeholder-slate-500 transition-all duration-200 focus:outline-none focus:ring-4`}
                    {...register('message')}
                  />
                  {errors.message?.message && (
                    <span className="text-xs text-rose-500 font-medium mt-0.5">{errors.message?.message}</span>
                  )}
                </div>

                <Button
                  type="submit"
                  isLoading={createLeadMutation.isPending}
                  className="mt-2 w-full h-11"
                >
                  Submit Inquiry
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 px-8 text-center text-xs text-slate-500 flex flex-col items-center gap-2 select-none">
        <span>&copy; 2026 LeadFlow CRM. All rights reserved.</span>
        <a
          href="https://digitalheroesco.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors hover:underline"
        >
          Built for Digital Heroes Training Task
        </a>
      </footer>
    </div>
  );
};
