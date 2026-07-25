import React from 'react';
import { useLeads, useRecentActivities } from '../../hooks/useLeads';
import { useAuth } from '../../hooks/useAuth';
import { Sidebar } from '../../components/layout/Sidebar';
import { Navbar } from '../../components/layout/Navbar';
import { 
  Inbox, 
  
  CheckCircle2, 
  TrendingUp, 
  RefreshCw, 
  Clock, 
  Activity,
  Calendar,
  XOctagon
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
  const { data: leadsData, isLoading: isLeadsLoading, isError: isLeadsError, refetch: refetchLeads } = useLeads({ limit: 1000 });
  const { data: activities, isLoading: isActLoading, refetch: refetchActivities } = useRecentActivities();

  const leads = leadsData?.leads || [];
  const totalLeads = leadsData?.total || 0;
  
  const todayStr = new Date().toISOString().split('T')[0];
  const todayLeads = leads.filter(l => l.createdAt.startsWith(todayStr)).length;
  const activeLeads = leads.filter(l => ['new', 'contacted', 'qualified'].includes(l.status)).length;
  const wonLeads = leads.filter(l => l.status === 'won').length;
  const lostLeads = leads.filter(l => l.status === 'lost').length;

  const newLeads = leads.filter(l => l.status === 'new').length;
  const contactedLeads = leads.filter(l => l.status === 'contacted').length;
  const qualifiedLeads = leads.filter(l => l.status === 'qualified').length;

  const closedLeads = wonLeads + lostLeads;
  const conversionRate = closedLeads > 0 
    ? Math.round((wonLeads / closedLeads) * 100) 
    : 0;

  const handleRefreshAll = () => {
    refetchLeads();
    refetchActivities();
  };

  const getMonthlyData = () => {
    const monthsMap: { [key: string]: number } = {};
    leads.forEach(l => {
      const date = new Date(l.createdAt);
      const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthsMap[monthYear] = (monthsMap[monthYear] || 0) + 1;
    });

    return Object.entries(monthsMap)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  };

  const monthlyData = getMonthlyData();

  const statusData = [
    { name: 'New', value: newLeads, color: '#6366f1' },
    { name: 'Contacted', value: contactedLeads, color: '#f59e0b' },
    { name: 'Qualified', value: qualifiedLeads, color: '#3b82f6' },
    { name: 'Won', value: wonLeads, color: '#10b981' },
    { name: 'Lost', value: lostLeads, color: '#ef4444' }
  ].filter(item => item.value > 0);

  const kpis = [
    {
      label: user?.role === 'admin' ? 'Total Leads' : 'My Assigned Leads',
      value: totalLeads,
      icon: <Inbox className="text-indigo-400 w-5 h-5" />,
      bg: 'bg-indigo-500/10 border-indigo-500/20'
    },
    {
      label: "Today's Enquiries",
      value: todayLeads,
      icon: <Calendar className="text-pink-400 w-5 h-5" />,
      bg: 'bg-pink-500/10 border-pink-500/20'
    },
    {
      label: 'Active Leads',
      value: activeLeads,
      icon: <Activity className="text-amber-400 w-5 h-5" />,
      bg: 'bg-amber-500/10 border-amber-500/20'
    },
    {
      label: 'Closed Won',
      value: wonLeads,
      icon: <CheckCircle2 className="text-emerald-400 w-5 h-5" />,
      bg: 'bg-emerald-500/10 border-emerald-500/20'
    },
    {
      label: 'Closed Lost',
      value: lostLeads,
      icon: <XOctagon className="text-rose-400 w-5 h-5" />,
      bg: 'bg-rose-500/10 border-rose-500/20'
    },
    {
      label: 'Conversion Rate',
      value: `${conversionRate}%`,
      icon: <TrendingUp className="text-teal-400 w-5 h-5" />,
      bg: 'bg-teal-500/10 border-teal-500/20'
    }
  ];

  const isLoading = isLeadsLoading || isActLoading;
  const isError = isLeadsError;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Sidebar />
      
      <div className="pl-64 pt-16 flex-1 flex flex-col">
        <Navbar title="Dashboard Analytics" />

        <main className="p-8 flex-1 flex flex-col gap-8 max-w-7xl w-full mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1 text-left">
              <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user?.name}</h1>
              <p className="text-sm text-slate-400">
                Live performance dashboard and real-time sales indicators.
              </p>
            </div>
            <button 
              onClick={handleRefreshAll}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-all cursor-pointer select-none"
            >
              <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
              Reload analytics
            </button>
          </div>

          {isLoading ? (
            <div className="flex-1 flex items-center justify-center py-24">
              <svg className="animate-spin h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : isError ? (
            <div className="p-6 bg-rose-500/5 border border-rose-500/10 rounded-2xl text-center text-rose-400 font-medium">
              Failed to load metrics. Please check your connection.
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                {kpis.map((kpi, index) => (
                  <div 
                    key={index}
                    className={`p-5 bg-slate-900/10 border ${kpi.bg} rounded-2xl flex flex-col justify-between shadow-xl backdrop-blur-md hover:scale-[1.01] transition-transform`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left leading-tight">
                        {kpi.label}
                      </span>
                      <div className="p-1.5 rounded-lg bg-slate-950/40 border border-slate-900 shadow-inner shrink-0">
                        {kpi.icon}
                      </div>
                    </div>
                    <span className="text-2xl font-black text-slate-100 text-left mt-3">{kpi.value}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="p-6 bg-slate-900/10 border border-slate-900 rounded-2xl flex flex-col gap-4 shadow-xl backdrop-blur-md lg:col-span-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-left">Monthly Lead Growth</h3>
                  <div className="h-72 w-full text-xs">
                    {monthlyData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="month" stroke="#475569" fontSize={11} tickLine={false} />
                          <YAxis stroke="#475569" fontSize={11} tickLine={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#090d16', border: '1px solid #1e293b', borderRadius: '12px' }}
                            labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                          />
                          <Area type="monotone" dataKey="count" name="New Leads" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorLeads)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-500 italic">No growth data available.</div>
                    )}
                  </div>
                </div>

                <div className="p-6 bg-slate-900/10 border border-slate-900 rounded-2xl flex flex-col gap-4 shadow-xl backdrop-blur-md">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-left">Lead Status Distribution</h3>
                  <div className="h-72 w-full flex flex-col justify-center items-center">
                    {statusData.length > 0 ? (
                      <div className="w-full h-full relative flex flex-col justify-center">
                        <div className="w-full h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={75}
                                paddingAngle={4}
                                dataKey="value"
                              >
                                {statusData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#090d16', border: '1px solid #1e293b', borderRadius: '12px' }}
                                itemStyle={{ color: '#f8fafc' }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-3 gap-2 px-2 text-[10px] font-bold text-slate-400">
                          {statusData.map((d, i) => (
                            <div key={i} className="flex items-center gap-1.5 justify-center truncate">
                              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                              <span className="truncate">{d.name}: {d.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-slate-500 italic">No lead records to show.</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="p-6 bg-slate-900/10 border border-slate-900 rounded-2xl flex flex-col gap-4 shadow-xl backdrop-blur-md lg:col-span-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-left">Recent Pipeline Activities</h3>
                  <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-1">
                    {activities && activities.length > 0 ? (
                      activities.map((log: any) => (
                        <div key={log.id} className="flex gap-4 text-left border-b border-slate-900/60 pb-3 last:border-b-0 last:pb-0">
                          <div className="relative mt-1 select-none flex flex-col items-center">
                            <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full border border-slate-950 z-10" />
                            <div className="w-0.5 bg-slate-900 flex-1 my-0.5" />
                          </div>
                          <div className="flex flex-col gap-1 min-w-0 flex-1">
                            <span className="text-xs font-semibold text-slate-200 leading-tight">
                              {log.description}
                            </span>
                            <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-1 select-none">
                              {log.lead && (
                                <span className="text-indigo-400 truncate">
                                  Lead: {log.lead.name} ({log.lead.company})
                                </span>
                              )}
                              <span className="flex items-center gap-1 shrink-0">
                                <Clock size={10} />
                                {new Date(log.createdAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center text-xs text-slate-500 italic">No recent activities found.</div>
                    )}
                  </div>
                </div>

                <div className="p-6 bg-slate-900/10 border border-slate-900 rounded-2xl flex flex-col justify-between shadow-xl backdrop-blur-md">
                  <div className="text-left">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">LeadFlow CRM Overview</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                      LeadFlow aggregates marketing requests, tracks agent notes, logs status changes, and manages team roles. 
                    </p>
                    <ul className="text-[10px] font-bold text-slate-400 flex flex-col gap-2.5 list-disc list-inside">
                      <li>Use <span className="text-indigo-400">Pipeline Board</span> to transition prospect statuses.</li>
                      <li>Use <span className="text-indigo-400">Details View</span> to record markdown touchpoints.</li>
                      <li>Unread updates instantly fire on the bell indicator.</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-[10px] font-semibold text-indigo-400 text-left mt-4 leading-relaxed">
                    💡 Tip: Analytics metrics calculate closed won/lost conversion counts dynamically. Win rate indicates closed won divided by total closed pipeline records.
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
