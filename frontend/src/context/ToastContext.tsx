import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-start gap-3 p-4 bg-slate-950 border border-slate-900 rounded-xl shadow-2xl transition-all duration-300`}
          >
            <div className="mt-0.5 select-none">
              {toast.type === 'success' && <CheckCircle2 className="text-emerald-500 w-5 h-5" />}
              {toast.type === 'error' && <AlertCircle className="text-rose-500 w-5 h-5" />}
              {toast.type === 'info' && <Info className="text-blue-500 w-5 h-5" />}
            </div>

            <div className="flex-1 text-sm font-medium text-slate-200">
              {toast.message}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="p-0.5 text-slate-500 hover:text-slate-300 rounded transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
