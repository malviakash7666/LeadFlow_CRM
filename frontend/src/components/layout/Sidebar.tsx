import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Kanban, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      await logout();
    }
  };

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      roles: ['admin', 'member']
    },
    {
      to: '/leads',
      label: 'Leads Pipeline',
      icon: <Kanban size={20} />,
      roles: ['admin', 'member']
    },
    {
      to: '/users',
      label: 'Team Members',
      icon: <Users size={20} />,
      roles: ['admin']
    }
  ];

  const filteredItems = navItems.filter(item => user && item.roles.includes(user.role));

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-900 flex flex-col justify-between h-screen fixed left-0 top-0 z-30">
      <div className="flex flex-col">
        <div className="h-16 flex items-center gap-2.5 px-6 border-b border-slate-900 bg-slate-950">
          <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
            <Shield size={20} className="fill-indigo-300/30" />
          </div>
          <span className="font-extrabold text-lg text-slate-100 tracking-tight select-none">
            LeadFlow<span className="text-indigo-500 font-semibold"> CRM</span>
          </span>
        </div>

        <div className="p-4 mx-3 my-4 bg-slate-900/40 border border-slate-900/60 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center select-none uppercase">
            {user?.name.substring(0, 2)}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-slate-200 truncate">{user?.name}</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{user?.role}</span>
          </div>
        </div>

        <nav className="flex flex-col gap-1 px-3">
          {filteredItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600/10 border border-indigo-500/25 text-indigo-400'
                    : 'text-slate-400 border border-transparent hover:bg-slate-900/50 hover:text-slate-200'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-900">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3.5 px-4 py-3 text-sm font-semibold rounded-xl text-rose-400 hover:bg-rose-500/5 hover:text-rose-300 border border-transparent hover:border-rose-500/10 transition-all duration-200 cursor-pointer"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
