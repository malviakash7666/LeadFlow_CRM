import React from 'react';
import { Calendar } from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';

interface NavbarProps {
  title?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ title }) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="h-16 bg-slate-950/80 border-b border-slate-900 flex items-center justify-between px-8 fixed right-0 top-0 left-64 z-20 backdrop-blur-md">
      <h2 className="text-lg font-bold text-slate-100 select-none">
        {title || 'Dashboard'}
      </h2>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-400 select-none">
          <Calendar size={16} />
          {currentDate}
        </div>

        <NotificationDropdown />
      </div>
    </header>
  );
};
