import React, { useState, useEffect } from 'react';
import { taskAPI, teamAPI } from '../services/api';

const TaskBoard = ({ user, showToast, searchQuery, setCurrentTab }) => {
  const [tasks, setTasks] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingDate, setEditingDate] = useState(null);
  const [editingTeam, setEditingTeam] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [taskRes, teamRes] = await Promise.all([
        taskAPI.getTasks(),
        teamAPI.getTeams()
      ]);
      
      let rawTasks = taskRes.data || [];
      const rawTeams = teamRes.data || [];
      
      if (user.role !== 'Admin') {
        const myTeamNames = rawTeams.map(t => t.name);
        rawTasks = rawTasks.filter(t => {
          const assigneeName = typeof t.assignee === 'object' ? t.assignee?.name : t.assignee;
          return (
            assigneeName === user.name || 
            (t.team && myTeamNames.includes(t.team))
          );
        });
      }
      
      setTasks(rawTasks);
      setTeams(rawTeams);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      if (showToast) showToast('Failed to sync timeline', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchQuery]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskAPI.updateTask(taskId, { status: newStatus });
      if (showToast) showToast(`Task moved to ${newStatus}`);
      fetchData();
    } catch (err) {
      if (showToast) showToast('Failed to update status', 'error');
    }
  };

  const handleDateChange = async (taskId, date) => {
    if (user.role !== 'Admin') return;
    try {
      await taskAPI.updateTask(taskId, { dueDate: date || null });
      if (showToast) showToast('Due date updated');
      setEditingDate(null);
      fetchData();
    } catch (err) {
      if (showToast) showToast('Failed to update date', 'error');
    }
  };

  const handleTeamChange = async (taskId, teamName) => {
    if (user.role !== 'Admin') return;
    try {
      await taskAPI.updateTask(taskId, { team: teamName || '' });
      if (showToast) showToast(teamName ? `Assigned to ${teamName}` : 'Team removed');
      setEditingTeam(null);
      fetchData();
    } catch (err) {
      if (showToast) showToast('Failed to assign team', 'error');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (user.role !== 'Admin') return;
    if (!window.confirm('Are you sure you want to delete this completed task?')) return;
    try {
      await taskAPI.deleteTask(taskId);
      if (showToast) showToast('Task archived and removed');
      fetchData();
    } catch (err) {
      if (showToast) showToast('Failed to delete task', 'error');
    }
  };

  const filteredTasks = tasks.filter(t => {
    const query = (searchQuery || '').toLowerCase();
    return (
      (t.title || '').toLowerCase().includes(query) ||
      (t.description || '').toLowerCase().includes(query)
    );
  });

  const columns = [
    { title: 'To-Do', status: 'To-Do', color: 'bg-amber-400', glow: 'shadow-amber-500/20' },
    { title: 'In Progress', status: 'In Progress', color: 'bg-blue-500', glow: 'shadow-blue-500/20' },
    { title: 'Completed', status: 'Completed', color: 'bg-emerald-500', glow: 'shadow-emerald-500/20' },
  ];

  if (loading) {
    return (
      <main className="pt-24 pl-[292px] pr-8 pb-12 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Timeline...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-24 pl-[292px] pr-8 pb-12 min-h-screen bg-[#f1f5f9] dark:bg-[#020617] transition-all duration-700">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-3">
             <span className="w-8 h-1 bg-primary rounded-full"></span>
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Strategic Execution</span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Timeline Board</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Monitoring delivery pipelines and cross-team synchronization.
          </p>
        </div>
        <div className="hidden lg:flex items-center gap-6 bg-white dark:bg-slate-800/50 p-4 rounded-3xl border border-slate-200 dark:border-slate-700">
          <div className="flex flex-col text-right">
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Board Health</span>
             <span className="text-lg font-black text-slate-900 dark:text-white">{filteredTasks.length} Units Active</span>
          </div>
        </div>
      </header>

      <div className="flex gap-8 overflow-x-auto pb-12 custom-scrollbar items-start min-h-[700px]">
        {columns.map((col, idx) => {
          const colTasks = filteredTasks.filter(t => t.status === col.status);
          return (
            <div key={idx} className="w-[380px] flex flex-col shrink-0">
              <div className="flex items-center justify-between mb-6 px-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${col.color} ${col.glow} shadow-lg`}></div>
                  <h3 className="font-black text-slate-700 dark:text-slate-200 uppercase tracking-[0.2em] text-[11px]">{col.title}</h3>
                  <span className="bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 px-2.5 py-0.5 rounded-lg text-[10px] font-black border border-slate-200 dark:border-slate-700">
                    {colTasks.length}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-5 min-h-[500px]">
                {colTasks.length === 0 ? (
                  <div className="h-40 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center opacity-30">
                    <span className="material-symbols-outlined text-4xl mb-2">inventory_2</span>
                    <p className="text-[10px] font-black uppercase tracking-widest">No Active Units</p>
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div key={task._id} className="group bg-white dark:bg-slate-800/40 backdrop-blur-xl rounded-[2rem] p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
                      <div className={`absolute top-0 left-0 w-full h-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-50 ${col.color}`}></div>
                      
                      <div className="flex justify-between items-start mb-5">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          task.priority === 'High' ? 'bg-rose-500/10 text-rose-500' :
                          task.priority === 'Medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
                        }`}>
                          {task.priority} Priority
                        </span>
                        {user.role === 'Admin' && (
                          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                             <div className="relative">
                                <button onClick={() => setEditingDate(editingDate === task._id ? null : task._id)} className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-primary flex items-center justify-center">
                                  <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                                </button>
                                {editingDate === task._id && (
                                  <div className="absolute top-full right-0 mt-2 z-50 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 animate-in slide-in-from-top-2">
                                     <input 
                                       type="date" 
                                       autoFocus
                                       onChange={(e) => handleDateChange(task._id, e.target.value)}
                                       className="bg-slate-50 dark:bg-slate-900 border-none outline-none text-xs font-bold p-2 rounded-xl"
                                     />
                                  </div>
                                )}
                             </div>
                             <button onClick={() => setEditingTeam(task._id)} className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-primary flex items-center justify-center">
                               <span className="material-symbols-outlined text-[16px]">group</span>
                             </button>
                             {col.status === 'Completed' && (
                               <button onClick={() => handleDeleteTask(task._id)} className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all">
                                 <span className="material-symbols-outlined text-[16px]">delete</span>
                               </button>
                             )}
                          </div>
                        )}
                      </div>

                      <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-2 leading-snug group-hover:text-primary transition-colors">
                        {task.title}
                      </h4>
                      <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-6 line-clamp-2 leading-relaxed">
                        {task.description || 'Executing strategic objectives with precision and team collaboration.'}
                      </p>

                      {user.role === 'Admin' && editingTeam === task._id && (
                        <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl animate-in slide-in-from-top-2">
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Target Team</p>
                           <select 
                             autoFocus
                             onBlur={() => setEditingTeam(null)}
                             value={task.team || ''} 
                             onChange={(e) => handleTeamChange(task._id, e.target.value)}
                             className="w-full bg-white dark:bg-slate-800 p-2.5 rounded-xl border-none outline-none text-xs font-bold shadow-inner"
                           >
                             <option value="">No Team</option>
                             {teams.map(t => <option key={t._id} value={t.name}>{t.name}</option>)}
                           </select>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-5 border-t border-slate-100 dark:border-slate-700/50">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-xs font-black text-slate-500 shadow-inner">
                            {(typeof task.assignee === 'object' ? task.assignee?.name : task.assignee)?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Assigned To</span>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                              {task.team ? `Team: ${task.team}` : (typeof task.assignee === 'object' ? task.assignee?.name : (task.assignee || 'Unassigned'))}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                          <span className="material-symbols-outlined text-[14px]">schedule</span>
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Deadline'}
                        </div>
                        
                        <div className="flex gap-2">
                          {col.status !== 'To-Do' && (
                            <button 
                              onClick={() => handleStatusChange(task._id, columns[columns.findIndex(c => c.status === col.status) - 1].status)} 
                              className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-center"
                              title="Move Back"
                            >
                              <span className="material-symbols-outlined text-[16px]">west</span>
                            </button>
                          )}
                          {col.status !== 'Completed' && (
                            <button 
                              onClick={() => handleStatusChange(task._id, columns[columns.findIndex(c => c.status === col.status) + 1].status)} 
                              className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
                            >
                              Advance
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
};

export default TaskBoard;
