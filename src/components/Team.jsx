import React, { useState, useEffect } from 'react';
import { userAPI, teamAPI, taskAPI } from '../services/api';

const Team = ({ user, showToast, initialView }) => {
  const [members, setMembers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [roleFilter, setRoleFilter] = useState('All');
  const [activeView, setActiveView] = useState(initialView || (user?.role === 'Admin' ? 'members' : 'teams'));
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [teamForm, setTeamForm] = useState({ name: '', description: '', members: [] });
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [managedTeam, setManagedTeam] = useState(null);
  const [isUpdatingMembers, setIsUpdatingMembers] = useState(false);
  const [showAssignTask, setShowAssignTask] = useState(null);
  const [allTasks, setAllTasks] = useState([]);

  useEffect(() => {
    if (initialView) setActiveView(initialView);
  }, [initialView]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (managedTeam) {
      const updated = teams.find(t => t._id === managedTeam._id);
      if (updated) setManagedTeam(updated);
    }
  }, [teams, managedTeam?._id]);

  const fetchData = async () => {
    try {
      const [membersRes, teamsRes, tasksRes] = await Promise.all([
        userAPI.getUsers(), 
        teamAPI.getTeams(),
        taskAPI.getTasks()
      ]);
      setMembers(membersRes.data || []);
      setTeams(teamsRes.data || []);
      setAllTasks(tasksRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMembers = async (teamId, newMemberIds) => {
    setIsUpdatingMembers(true);
    try {
      await teamAPI.updateTeam(teamId, { members: newMemberIds });
      if (showToast) showToast('Organization structure updated');
      fetchData();
    } catch (err) {
      if (showToast) showToast('Failed to update members', 'error');
    } finally {
      setIsUpdatingMembers(false);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm('Dissolve this organization? This action is irreversible.')) return;
    try {
      await teamAPI.deleteTeam(teamId);
      if (showToast) showToast('Organization dissolved');
      fetchData();
    } catch (err) {
      if (showToast) showToast('Failed to dissolve organization', 'error');
    }
  };

  const handleAssignTaskToTeam = async (taskId, teamName) => {
    try {
      await taskAPI.updateTask(taskId, { team: teamName });
      if (showToast) showToast(`Strategic objective assigned to ${teamName}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredMembers = members.filter(m => roleFilter === 'All' || m.role === roleFilter);

  const getTeamStats = (team) => {
    const teamTasks = allTasks.filter(t => t.team === team.name);
    const completed = teamTasks.filter(t => t.status === 'Completed').length;
    const total = teamTasks.length;
    return {
      total,
      completed,
      completionRate: total === 0 ? 0 : Math.round((completed / total) * 100)
    };
  };

  if (loading) {
    return (
      <main className="pt-24 pl-[292px] pr-8 pb-12 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Collective Intelligence...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-24 pl-[292px] pr-8 pb-12 min-h-screen bg-[#f8fafc] dark:bg-[#020617] transition-all duration-700">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-3">
             <span className="w-8 h-1 bg-violet-500 rounded-full"></span>
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-500">Human Capital</span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Organization Directory</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium max-w-2xl">
            Managing the ecosystem of teams and talent. Administrators can configure team structures and assign operational objectives.
          </p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
          {['members', 'teams'].filter(v => v === 'teams' || user?.role === 'Admin').map(v => (
            <button key={v} onClick={() => setActiveView(v)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeView === v ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>
              {v}
            </button>
          ))}
        </div>
      </header>

      {/* MEMBERS VIEW */}
      {activeView === 'members' && user.role === 'Admin' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMembers.map(member => (
            <div key={member._id} className="group bg-white dark:bg-slate-800/40 p-6 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 text-center relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-violet-600/10 to-indigo-600/10 dark:from-violet-600/5 dark:to-indigo-600/5"></div>
               <div className="relative z-10">
                 <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-violet-600 to-indigo-600 mx-auto mb-6 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-500 border-4 border-white dark:border-slate-800">
                    {member.name.charAt(0).toUpperCase()}
                 </div>
                 <h4 className="font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors">{member.name}</h4>
                 <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-medium">{member.email}</p>
                 <div className="flex justify-center gap-2">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${member.role === 'Admin' ? 'bg-violet-500/10 text-violet-600 border border-violet-500/20' : 'bg-slate-100 dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800'}`}>
                       {member.role}
                    </span>
                 </div>
               </div>
            </div>
          ))}
        </div>
      )}

      {/* TEAMS VIEW */}
      {activeView === 'teams' && (
        teams.length === 0 ? (
          <div className="py-32 text-center bg-white dark:bg-slate-800/40 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 opacity-30">
               <span className="material-symbols-outlined text-5xl">groups_3</span>
            </div>
            <p className="text-slate-700 dark:text-slate-200 font-black uppercase tracking-[0.3em] mb-4">YOU'RE NOT IN A TEAM</p>
            {user?.role === 'Admin' ? (
              <button onClick={() => setShowCreateTeam(true)} className="px-10 py-4 bg-slate-900 dark:bg-primary text-white rounded-[1.5rem] text-xs font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-all active:scale-95 shadow-primary/20">
                Establish Organization
              </button>
            ) : (
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Contact your System Administrator to be inducted into a team.</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teams.map(team => {
              const stats = getTeamStats(team);
              return (
                <div key={team._id} 
                  onClick={() => {
                    setManagedTeam(team);
                    setActiveView('management');
                    window.location.hash = `team=${team._id}`;
                  }}
                  className="group bg-white dark:bg-slate-800/40 rounded-[2.5rem] p-8 border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full"></div>
                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-primary shadow-inner">
                       <span className="material-symbols-outlined text-3xl">groups</span>
                    </div>
                    {user?.role === 'Admin' && (
                      <div className="flex gap-2">
                        <button onClick={(e) => { e.stopPropagation(); setShowAssignTask(team._id); }} className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-500/10 text-violet-500 hover:bg-violet-500 hover:text-white flex items-center justify-center transition-all shadow-sm border border-violet-100 dark:border-violet-800">
                          <span className="material-symbols-outlined text-[20px]">add_task</span>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteTeam(team._id); }} className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all shadow-sm border border-rose-100 dark:border-rose-800">
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight group-hover:text-primary transition-colors">{team.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 font-medium line-clamp-2 leading-relaxed">{team.description || 'Elevating collaborative excellence through strategic alignment and talent synergy.'}</p>

                  <div className="flex flex-col gap-6 relative z-10">
                    <div className="flex items-center justify-between">
                       <div className="flex -space-x-3">
                         {(team.members || []).slice(0, 5).map((m, i) => (
                           <div key={i} className="w-10 h-10 rounded-full border-4 border-white dark:border-slate-800 bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-[10px] font-black" title={m.name}>
                              {m.name.charAt(0).toUpperCase()}
                           </div>
                         ))}
                         {(team.members || []).length > 5 && (
                           <div className="w-10 h-10 rounded-full border-4 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-black text-slate-500">
                              +{(team.members || []).length - 5}
                           </div>
                         )}
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Delivery Status</p>
                          <p className="text-lg font-black text-emerald-500">{stats.completed} / {stats.total}</p>
                       </div>
                    </div>
                    
                    <div className="space-y-2">
                       <div className="h-2 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${stats.total === 0 ? 0 : (stats.completed/stats.total)*100}%` }}></div>
                       </div>
                       <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <span>Milestones Reached</span>
                          <span>{stats.total} Total Objectives</span>
                       </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* TEAM MANAGEMENT VIEW */}
      {activeView === 'management' && managedTeam && (
        <div className="space-y-8 animate-in fade-in duration-700">
          <div className="bg-slate-900 dark:bg-slate-800 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 right-0 w-80 h-80 bg-violet-500/20 blur-[100px] rounded-full"></div>
             <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
               <div>
                 <button 
                   onClick={() => { setActiveView('teams'); window.location.hash = ''; }}
                   className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white mb-6 transition-colors"
                 >
                   <span className="material-symbols-outlined text-sm">west</span> Back to Organizations
                 </button>
                 <h2 className="text-5xl font-black mb-4 tracking-tighter">{managedTeam.name}</h2>
                 <p className="text-slate-400 max-w-xl font-medium leading-relaxed">{managedTeam.description || 'Configuring organizational resources for optimal delivery and team cohesion.'}</p>
               </div>
               <div className="flex gap-4">
                  <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] border border-white/5 text-center min-w-[140px]">
                     <p className="text-3xl font-black text-white mb-1 tracking-tighter">{managedTeam.members?.length || 0}</p>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Personnel</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] border border-white/5 text-center min-w-[140px]">
                     <p className="text-3xl font-black text-emerald-400 mb-1 tracking-tighter">
                        {getTeamStats(managedTeam).completed} / {getTeamStats(managedTeam).total}
                     </p>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Delivery Progress</p>
                  </div>
               </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between px-2">
                   <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Active Personnel</h3>
                   {user.role === 'Admin' && (
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Manage Resources</span>
                   )}
                </div>
                
                <div className="bg-white dark:bg-slate-800/40 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-700/50 shadow-sm overflow-hidden">
                   {managedTeam.members?.length === 0 ? (
                     <div className="py-20 text-center opacity-30">
                        <span className="material-symbols-outlined text-5xl mb-4">person_off</span>
                        <p className="text-xs font-black uppercase tracking-widest">No Personnel Assigned</p>
                     </div>
                   ) : (
                     <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                        {managedTeam.members.map(member => (
                          <div key={member._id} className="p-6 flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-all">
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-[1.25rem] bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-sm font-black shadow-lg">
                                   {member.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                   <p className="font-bold text-slate-800 dark:text-slate-100">{member.name}</p>
                                   <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{member.email}</p>
                                </div>
                             </div>
                             {user.role === 'Admin' && (
                               <button 
                                 onClick={() => handleUpdateMembers(managedTeam._id, managedTeam.members.filter(m => m._id !== member._id).map(m => m._id))}
                                 disabled={isUpdatingMembers}
                                 className="w-10 h-10 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                               >
                                  <span className="material-symbols-outlined">person_remove</span>
                               </button>
                             )}
                          </div>
                        ))}
                     </div>
                   )}
                </div>
             </div>

             {user.role === 'Admin' && (
               <div className="space-y-6">
                  <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight px-2">Recruitment</h3>
                  <div className="bg-white dark:bg-slate-800/40 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-700/50 shadow-sm p-8">
                     <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">Induct new members into the organization to expand operational capacity.</p>
                     <div className="space-y-3 h-[400px] overflow-y-auto custom-scrollbar pr-2">
                        {members.filter(m => !managedTeam.members.find(tm => tm._id === m._id)).map(member => (
                          <button 
                            key={member._id}
                            onClick={() => handleUpdateMembers(managedTeam._id, [...managedTeam.members.map(m => m._id), member._id])}
                            disabled={isUpdatingMembers}
                            className="w-full p-4 flex items-center justify-between rounded-2xl bg-slate-50 dark:bg-slate-900/50 hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20 transition-all text-left group"
                          >
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-[10px] font-black shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
                                   {member.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-xs font-bold truncate max-w-[120px]">{member.name}</span>
                             </div>
                             <span className="material-symbols-outlined text-lg">person_add</span>
                          </button>
                        ))}
                     </div>
                  </div>
               </div>
             )}
          </div>
        </div>
      )}

      {/* MODALS & OVERLAYS */}
      {showCreateTeam && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/40 animate-in fade-in duration-500">
           <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden border border-white/20">
              <div className="p-10">
                 <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Establish Team</h3>
                 <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-8">Define a new operational unit within the ecosystem.</p>
                 
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Team Designation</label>
                       <input 
                         type="text" 
                         value={teamForm.name}
                         onChange={(e) => setTeamForm({...teamForm, name: e.target.value})}
                         placeholder="e.g. Strategic Operations"
                         className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Operational Mandate</label>
                       <textarea 
                         value={teamForm.description}
                         onChange={(e) => setTeamForm({...teamForm, description: e.target.value})}
                         placeholder="Briefly describe the team's strategic objectives..."
                         className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all h-32 resize-none"
                       />
                    </div>
                 </div>

                 <div className="flex gap-4 mt-10">
                    <button onClick={() => setShowCreateTeam(false)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
                    <button 
                      onClick={async () => {
                        setCreatingTeam(true);
                        try {
                          await teamAPI.createTeam(teamForm);
                          showToast('Organization established successfully');
                          setShowCreateTeam(false);
                          setTeamForm({ name: '', description: '', members: [] });
                          fetchData();
                        } catch (err) {
                          showToast('Establishment failed', 'error');
                        } finally {
                          setCreatingTeam(false);
                        }
                      }}
                      disabled={creatingTeam || !teamForm.name}
                      className="flex-1 py-4 bg-slate-900 dark:bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50"
                    >
                      {creatingTeam ? 'Inducting...' : 'Establish Team'}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {showAssignTask && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/40 animate-in fade-in duration-500">
           <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden border border-white/20">
              <div className="p-10">
                 <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Assign Objectives</h3>
                 <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-8">Select operational tasks to delegate to {teams.find(t => t._id === showAssignTask)?.name}.</p>
                 
                 <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                    {allTasks.filter(t => t.team !== teams.find(tm => tm._id === showAssignTask)?.name).map(task => (
                      <button 
                        key={task._id}
                        onClick={() => handleAssignTaskToTeam(task._id, teams.find(t => t._id === showAssignTask).name)}
                        className="w-full p-5 flex items-center justify-between rounded-3xl bg-slate-50 dark:bg-slate-900/50 hover:bg-indigo-500/10 hover:text-indigo-500 border border-transparent hover:border-indigo-500/20 transition-all text-left group"
                      >
                         <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{task.priority} Priority</span>
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-500">{task.title}</span>
                         </div>
                         <span className="material-symbols-outlined">add_circle</span>
                      </button>
                    ))}
                 </div>

                 <button onClick={() => setShowAssignTask(null)} className="w-full mt-10 py-4 bg-slate-900 dark:bg-slate-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all">Close Pipeline</button>
              </div>
           </div>
        </div>
      )}
    </main>
  );
};

export default Team;
