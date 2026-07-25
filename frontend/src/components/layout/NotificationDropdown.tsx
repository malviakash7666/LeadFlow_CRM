import React, { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, MailOpen, AlertCircle, Info, UserCheck, Plus } from 'lucide-react';
import { 
  useNotifications, 
  useMarkNotificationRead, 
  useMarkAllNotificationsRead 
} from '../../hooks/useNotifications';

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: notifications = [] } = useNotifications();
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    const handleNotification = () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };
    window.addEventListener('notification:received', handleNotification);
    return () => {
      window.removeEventListener('notification:received', handleNotification);
    };
  }, [queryClient]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (id: number, leadId: number | null) => {
    await markReadMutation.mutateAsync(id);
    setIsOpen(false);
    if (leadId) {
      navigate(`/leads/${leadId}`);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'lead_created':
        return <Plus size={14} className="text-indigo-400" />;
      case 'lead_assigned':
        return <UserCheck size={14} className="text-teal-400" />;
      case 'status_updated':
        return <Info size={14} className="text-amber-400" />;
      case 'note_added':
        return <MailOpen size={14} className="text-blue-400" />;
      default:
        return <AlertCircle size={14} className="text-slate-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer select-none"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-bold text-white ring-2 ring-slate-950 animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-950 border border-slate-900 rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col max-h-[400px]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-900 bg-slate-950/80">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllReadMutation.mutate()}
                className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Check size={10} />
                Mark all read
              </button>
            )}
          </div>

          <div className="overflow-y-auto divide-y divide-slate-900/60 flex-1">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n.id, n.leadId)}
                  className={`p-3.5 text-left flex gap-3 cursor-pointer hover:bg-slate-900/30 transition-colors ${
                    !n.isRead ? 'bg-indigo-600/5' : ''
                  }`}
                >
                  <div className="mt-0.5 p-1.5 bg-slate-900 border border-slate-800 rounded-lg h-7 w-7 flex items-center justify-center shrink-0">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                    <span className="text-xs font-bold text-slate-200 leading-tight">
                      {n.title}
                    </span>
                    <p className="text-[11px] text-slate-400 leading-relaxed truncate">
                      {n.message}
                    </p>
                    <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider mt-1 select-none">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {!n.isRead && (
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0 mt-2" />
                  )}
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-slate-500 italic">No notifications found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
