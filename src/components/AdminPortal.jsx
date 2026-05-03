import React, { useState, useEffect } from 'react';
import { userAPI, taskAPI, teamAPI } from '../services/api';

const AdminPortal = ({ user, showToast }) => {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'teams'
  
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [teamForm, setTeamForm] = useState({ name: '', description: '', members: [] });
  const [managedTeam, setManagedTeam] = useState(null);

  const fetchData = async () => {
    try {
      const [userRes, taskRes, teamRes] = await Promise.all([
        userAPI.getUsers(),
        taskAPI.getTasks(),
        teamAPI.getTeams()
      ]);
      setUsers(Array.isArray(userRes.data) ? userRes.data : []);
      setTasks(Array.isArray(taskRes.data) ? taskRes.data : []);
      setTeams(Array.isArray(teamRes.data) ? teamRes.data : []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      if (showToast) showToast('Failed to load system data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (managedTeam) {
      const updated = teams.find(t => t._id === managedTeam._id);
      if (updated) setManagedTeam(updated);
    }
  }, [teams, managedTeam?._id]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await userAPI.updateRole(userId, newRole);
      if (showToast) showToast(`Role updated to ${newRole}`);
      fetchData();
    } catch (err) {
      if (showToast) showToast('Failed to update role', 'error');
    }
  };

  const handleUpdateTeamMembers = async (teamId, newMemberIds) => {
    try {
      await teamAPI.updateTeam(teamId, { members: newMemberIds });
      if (showToast) showToast('Team structure updated');
      fetchData();
    } catch (err) {
      if (showToast) showToast('Failed to update team members', 'error');
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm('Dissolve this team?')) return;
    try {
      await teamAPI.deleteTeam(teamId);
      if (showToast) showToast('Team dissolved');
      setManagedTeam(null);
      fetchData();
    } catch (err) {
      if (showToast) showToast('Failed to delete team', 'error');
    }
  };

  if (user?.role !== 'Admin') {
    return (
      <main className="pt-24 pl-[292px] pr-8 pb-12 min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#020617]">
        <div className="text-center">
          <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl">lock</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Restricted Access</h2>
          <p className="text-slate-500 font-medium">Administrator privileges are required for the Control Center.</p>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="pt-24 pl-[292px] pr-8 pb-12 min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </main>
    );
  }

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const activeTasks = tasks.filter(t => t.status === 'In Progress').length;

  return (
    <main className="pt-24 pl-[292px] pr-8 pb-12 min-h-screen bg-[#f8fafc] dark:bg-[#020617] transition-all duration-700">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-3">
             <span className="w-8 h-1 bg-primary rounded-full"></span>
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">System Command</span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Control Center</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Global governance, team orchestration, and operational oversight.</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
           <button onClick={() => setActiveTab('users')} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Users</button>
           <button onClick={() => setActiveTab('teams')} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'teams' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Teams</button>
        </div>
      </header>

      {/* Stats Summary */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
         {[
           { label: 'Total Entities', value: users.length, icon: 'people', color: 'text-blue-600', bg: 'bg-blue-500/10' },
           { label: 'Admins', value: users.filter(u => u.role === 'Admin').length, icon: 'shield', color: 'text-violet-600', bg: 'bg-violet-500/10' },
           { label: 'Active Pipeline', value: activeTasks, icon: 'pending', color: 'text-amber-600', bg: 'bg-amber-500/10' },
           { label: 'Delivery Progress', value: `${completedTasks} / ${totalTasks}`, icon: 'verified', color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
         ].map((stat, i) => (
           <div key={i} className="bg-white dark:bg-slate-800/40 p-6 rounded-[2rem] border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                 <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
                    <span className="material-symbols-outlined text-xl">{stat.icon}</span>
                 </div>
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global</span>
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-1">{stat.value}</p>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
           </div>
         ))}
      </section>

      {activeTab === 'users' ? (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white dark:bg-slate-800/40 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-700/50 shadow-sm overflow-hidden">
             <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-700">
                   <tr>
                      <th className="px-8 py-5">System Entity</th>
                      <th className="px-8 py-5">Role Designation</th>
                      <th className="px-8 py-5 text-right">Operations</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                   {users.map(u => (
                     <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/10 transition-all group">
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-lg ${u.role === 'Admin' ? 'bg-slate-900 dark:bg-primary' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                                 {u.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                 <p className="font-bold text-slate-800 dark:text-slate-100 leading-tight">{u.name}</p>
                                 <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{u.email}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <select 
                             value={u.role}
                             onChange={(e) => handleRoleChange(u._id, e.target.value)}
                             className="bg-slate-100 dark:bg-slate-900 border-none rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                           >
                              <option value="Member">Member</option>
                              <option value="Admin">Admin</option>
                           </select>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <button onClick={() => userAPI.deleteUser(u._id).then(fetchData)} className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white border border-rose-100 dark:border-rose-800">
                              <span className="material-symbols-outlined text-lg">delete</span>
                           </button>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
        </section>
      ) : (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="lg:col-span-1 space-y-4">
                <button onClick={() => setShowCreateTeam(true)} className="w-full p-6 bg-slate-900 dark:bg-primary text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                  <span className="material-symbols-outlined">add_circle</span> Establish New Team
                </button>
                <div className="bg-white dark:bg-slate-800/40 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-700/50 shadow-sm overflow-hidden p-4 space-y-2">
                   {teams.map(t => (
                     <button key={t._id} onClick={() => setManagedTeam(t)} className={`w-full p-5 rounded-3xl flex items-center justify-between transition-all group ${managedTeam?._id === t._id ? 'bg-primary text-white shadow-lg' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30 text-slate-700 dark:text-slate-300'}`}>
                        <div className="flex items-center gap-4">
                           <span className="material-symbols-outlined">groups</span>
                           <span className="font-bold text-sm tracking-tight">{t.name}</span>
                        </div>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border ${managedTeam?._id === t._id ? 'bg-white/20 border-white/20' : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400'}`}>{(t.members || []).length}</span>
                     </button>
                   ))}
                </div>
             </div>
             <div className="lg:col-span-2">
                {managedTeam ? (
                  <div className="bg-white dark:bg-slate-800/40 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-700/50 shadow-sm p-10 relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full"></div>
                     <div className="relative z-10 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-8">
                           <div>
                              <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">{managedTeam.name}</h3>
                              <p className="text-slate-500 dark:text-slate-400 font-medium max-w-lg">{managedTeam.description || 'Configuring operational resources.'}</p>
                           </div>
                           <button onClick={() => handleDeleteTeam(managedTeam._id)} className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all border border-rose-100 dark:border-rose-800">
                              <span className="material-symbols-outlined">delete_forever</span>
                           </button>
                        </div>
                        <div className="grid grid-cols-2 gap-8 flex-grow">
                           <div>
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 px-2">Assigned Personnel</h4>
                              <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                 {managedTeam.members?.map(m => (
                                   <div key={m._id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between group">
                                      <div className="flex items-center gap-3">
                                         <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-[10px] font-black">{(m.name || '?').charAt(0).toUpperCase()}</div>
                                         <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{m.name}</span>
                                      </div>
                                      <button onClick={() => handleUpdateTeamMembers(managedTeam._id, managedTeam.members.filter(mem => mem._id !== m._id).map(mem => mem._id))} className="text-rose-400 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100"><span className="material-symbols-outlined text-[18px]">remove_circle</span></button>
                                   </div>
                                 ))}
                              </div>
                           </div>
                           <div className="border-l border-slate-100 dark:border-slate-700/50 pl-8">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 px-2">Induct Members</h4>
                              <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                 {users.filter(u => !managedTeam.members?.find(tm => tm._id === u._id)).map(u => (
                                   <button key={u._id} onClick={() => handleUpdateTeamMembers(managedTeam._id, [...(managedTeam.members?.map(m => m._id) || []), u._id])} className="w-full p-4 rounded-2xl bg-white dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:bg-primary/5 transition-all group">
                                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400 group-hover:text-primary">{u.name}</span>
                                      <span className="material-symbols-outlined text-[18px] text-slate-300 group-hover:text-primary">person_add</span>
                                   </button>
                                 ))}
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center bg-white dark:bg-slate-800/40 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-700 opacity-40 p-20 text-center">
                     <span className="material-symbols-outlined text-6xl mb-4">settings_input_component</span>
                     <p className="text-[10px] font-black uppercase tracking-[0.3em]">Select a unit to manage</p>
                  </div>
                )}
             </div>
          </div>
        </section>
      )}

      {showCreateTeam && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/40 animate-in fade-in duration-500">
           <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-[3rem] shadow-2xl border border-white/10 p-10">
              <h3 className="text-3xl font-black mb-2 tracking-tighter">Establish Team</h3>
              <p className="text-sm text-slate-500 mb-8 font-medium">Define a new organizational unit.</p>
              <div className="space-y-6 mb-10">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Team Designation</label>
                    <input type="text" value={teamForm.name} onChange={(e) => setTeamForm({...teamForm, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 rounded-2xl px-6 py-4 text-sm font-bold border border-slate-100 dark:border-slate-700 outline-none" placeholder="Strategic Operations" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Operational Mandate</label>
                    <textarea value={teamForm.description} onChange={(e) => setTeamForm({...teamForm, description: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 rounded-2xl px-6 py-4 text-sm font-bold border border-slate-100 dark:border-slate-700 outline-none h-32 resize-none" placeholder="Describe objectives..." />
                 </div>
              </div>
              <div className="flex gap-4">
                 <button onClick={() => setShowCreateTeam(false)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-900 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest">Cancel</button>
                 <button onClick={async () => {
                   try { await teamAPI.createTeam(teamForm); showToast('Team established'); setShowCreateTeam(false); setTeamForm({ name: '', description: '', members: [] }); fetchData(); } catch (err) { showToast('Failed', 'error'); }
                 }} className="flex-1 py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20">Establish Team</button>
              </div>
           </div>
        </div>
      )}
    </main>
  );
};

export default AdminPortal;
