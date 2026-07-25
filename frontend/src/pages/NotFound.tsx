import React from 'react';
import { EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4">
      <div className="flex flex-col items-center gap-6 text-center max-w-sm">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-full text-slate-400 select-none">
          <EyeOff size={48} />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black text-slate-100 tracking-tight">404 Not Found</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>
        <Link to="/" className="w-full mt-2">
          <Button className="w-full">Return Home</Button>
        </Link>
      </div>
    </div>
  );
};
