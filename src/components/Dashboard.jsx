import React, { useState, useEffect } from 'react';
import { taskAPI, activityAPI, teamAPI } from '../services/api';

const Dashboard = ({ user, showToast }) => {
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [taskRes, activityRes, teamRes] = await Promise.all([
        taskAPI.getTasks(),
        activityAPI.getActivities(),
        teamAPI.getTeams()
      ]);
      let rawTasks = taskRes.data || [];
      const rawTeams = teamRes.data || [];
      
      if (user.role !== 'Admin') {
        const myTeamNames = rawTeams.map(t => t.name);
        rawTasks = rawTasks.filter(t => 
          t.assignee === user.name || 
          t.assignee?.name === user.name || 
          (t.team && myTeamNames.includes(t.team))
        );
      }
      
      setTasks(rawTasks);
      setActivities(activityRes.data || []);
      setTeams(rawTeams);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = [
    { label: 'Operational Tasks', value: tasks.length, icon: 'analytics', color: 'text-blue-600', bg: 'bg-blue-600/5', trend: 'Total assignments' },
    { label: 'Active Teams', value: teams.length, icon: 'groups', color: 'text-indigo-600', bg: 'bg-indigo-600/5', trend: 'Healthy engagement' },
    { label: 'Delivery Progress', value: `${tasks.filter(t => t.status === 'Completed').length} / ${tasks.length}`, icon: 'verified', color: 'text-emerald-600', bg: 'bg-emerald-600/5', trend: 'Milestones reached' },
    { label: 'Recent Events', value: activities.length, icon: 'notifications_active', color: 'text-rose-600', bg: 'bg-rose-600/5', trend: 'System live' },
  ];

  if (loading) {
    return (
      <main className="pt-24 pl-[292px] pr-8 pb-12 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Synchronizing Workspace...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-24 pl-[292px] pr-8 pb-12 min-h-screen bg-[#f8fafc] dark:bg-[#020617] transition-all duration-700">
      {/* Header Banner */}
      <section className="mb-12 relative overflow-hidden rounded-[2.5rem] bg-slate-900 dark:bg-slate-800 p-10 shadow-2xl">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-primary/20 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-80 h-80 bg-indigo-500/10 blur-[100px] rounded-full"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
               <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black text-primary uppercase tracking-widest border border-white/5">Internal Alpha v2.4</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4 leading-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">{user.name.split(' ')[0]}</span>.
            </h1>
            <p className="text-slate-400 text-base max-w-xl font-medium leading-relaxed">
              Your centralized command center is ready. Track team performance, manage delivery pipelines, and optimize operational efficiency in real-time.
            </p>
          </div>
          <div className="hidden lg:block">
             <div className="flex flex-col gap-3 p-6 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-inner">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Workspace Status</p>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping"></div>
                  <span className="text-sm font-bold text-slate-200">System Fully Operational</span>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, i) => (
          <div key={i} className="group bg-white dark:bg-slate-800/40 backdrop-blur-md p-6 rounded-[2rem] border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500`}>
                <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded-lg">Real-time</span>
            </div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-1 tracking-tighter">{stat.value}</h3>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3">{stat.label}</p>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500">
               <span className="material-symbols-outlined text-[14px]">trending_up</span>
               {stat.trend}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Recent Tasks */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex items-center justify-between px-2">
             <div className="flex items-center gap-3">
                <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Active Workload</h3>
             </div>
             <button className="text-primary font-bold text-xs hover:underline decoration-2 underline-offset-4">View All Pipeline</button>
          </div>
          
          <div className="bg-white dark:bg-slate-800/40 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-700/50 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-700/50">
            {tasks.length === 0 ? (
              <div className="py-24 text-center">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 opacity-30">
                  <span className="material-symbols-outlined text-4xl">assignment_late</span>
                </div>
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">No Active Assignments</p>
              </div>
            ) : (
              tasks.slice(0, 6).map(task => (
                <div key={task._id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-all duration-300 flex items-center justify-between group">
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black transition-transform group-hover:rotate-12 duration-500 ${
                      task.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-100 dark:bg-slate-900 text-slate-400'
                    }`}>
                      {task.status === 'Completed' ? <span className="material-symbols-outlined">check</span> : <span className="material-symbols-outlined">timer</span>}
                    </div>
                    <div>
                      <h4 className={`font-bold mb-1 group-hover:text-primary transition-colors ${
                        task.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'
                      }`}>{task.title}</h4>
                      <div className="flex items-center gap-3">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{task.team || 'Personal'}</span>
                         <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                         <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">event</span>
                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Indefinite'}
                         </span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                    task.priority === 'High' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                    task.priority === 'Medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                  }`}>
                    {task.priority}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3 px-2">
             <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
             <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Audit Trail</h3>
          </div>
          
          <div className="bg-white dark:bg-slate-800/40 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-700/50 shadow-sm p-6 relative h-[500px] overflow-y-auto custom-scrollbar">
            <div className="absolute top-0 left-9 bottom-0 w-px bg-slate-100 dark:bg-slate-700/50"></div>
            <div className="space-y-8 relative z-10">
              {activities.length === 0 ? (
                <p className="text-center text-slate-400 text-xs py-10">Waiting for events...</p>
              ) : (
                activities.slice(0, 10).map((activity, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="w-6 h-6 rounded-full bg-white dark:bg-slate-800 border-2 border-primary shadow-sm flex items-center justify-center shrink-0 z-20 group-hover:scale-125 transition-transform duration-300">
                       <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    </div>
                    <div className="pt-0.5">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-relaxed mb-1">
                        {activity.user?.name || 'User'} <span className="text-slate-500 font-medium">{activity.action}</span>
                      </p>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
