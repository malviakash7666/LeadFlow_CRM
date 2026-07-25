import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label ? (
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider select-none">
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          className={`w-full px-4 py-2.5 bg-slate-900/60 border ${
            error ? 'border-rose-500 focus:ring-rose-500/10 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-600 focus:ring-indigo-600/10'
          } rounded-xl text-slate-100 placeholder-slate-500 transition-all duration-200 focus:outline-none focus:ring-4 ${className}`}
          {...props}
        />
        {error ? (
          <span className="text-xs text-rose-500 font-medium mt-0.5">{error}</span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
