import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';

export const Forbidden: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4">
      <div className="flex flex-col items-center gap-6 text-center max-w-sm">
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-full text-rose-400 select-none">
          <ShieldAlert size={48} />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black text-slate-100 tracking-tight">403 Forbidden</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            You do not have permission to view this resource. This action is restricted to platform administrators.
          </p>
        </div>
        <Link to="/dashboard" className="w-full mt-2">
          <Button className="w-full">Return to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
};
