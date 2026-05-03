import React, { useState, useEffect } from 'react';
import { taskAPI, userAPI, teamAPI } from '../services/api';

const CreateTaskModal = ({ isOpen, onClose, onTaskCreated, showToast }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignee: '',
    team: '',
    dueDate: '',
    priority: 'Medium',
  });
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) fetchData();
  }, [isOpen]);

  const fetchData = async () => {
    try {
      const [uRes, tRes] = await Promise.all([
        userAPI.getUsers(),
        teamAPI.getTeams()
      ]);
      setUsers(uRes.data || []);
      setTeams(tRes.data || []);
    } catch (err) {
      console.error('Error fetching modal data:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData };
      if (!payload.team) delete payload.team;
      if (!payload.assignee) delete payload.assignee;
      if (!payload.dueDate) delete payload.dueDate; // Mongoose fails on "" for Date fields
      await taskAPI.createTask(payload);
      if (showToast) showToast('Task created successfully!');
      if (onTaskCreated) onTaskCreated();
      setFormData({ title: '', description: '', assignee: '', team: '', dueDate: '', priority: 'Medium' });
      onClose();
    } catch (err) {
      console.error('Error creating task:', err);
      if (showToast) showToast('Failed to create task', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <div className="bg-surface dark:bg-dark-surface w-full max-w-lg rounded-3xl shadow-2xl border border-outline-variant dark:border-dark-outline-variant overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-8 py-6 border-b border-outline-variant dark:border-dark-outline-variant flex justify-between items-center shrink-0">
          <h3 className="text-xl font-black text-on-surface dark:text-dark-on-surface tracking-tight">Create New Task</h3>
          <button className="w-10 h-10 hover:bg-background dark:hover:bg-dark-background rounded-2xl text-secondary transition-all flex items-center justify-center" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form className="p-8 space-y-6 overflow-y-auto custom-scrollbar" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-[11px] font-black text-secondary uppercase tracking-[0.1em] ml-1">Task Title</label>
            <input name="title" value={formData.title} onChange={handleChange}
              className="w-full px-5 py-3 rounded-2xl border border-outline-variant dark:border-dark-outline-variant bg-background dark:bg-dark-background text-on-surface dark:text-dark-on-surface focus:ring-2 focus:ring-primary outline-none text-sm"
              placeholder="e.g., Build landing page" required />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-secondary uppercase tracking-[0.1em] ml-1">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange}
              className="w-full px-5 py-3 rounded-2xl border border-outline-variant dark:border-dark-outline-variant bg-background dark:bg-dark-background text-on-surface dark:text-dark-on-surface focus:ring-2 focus:ring-primary outline-none text-sm resize-none"
              placeholder="Describe the task..." rows="3"></textarea>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-secondary uppercase tracking-[0.1em] ml-1">Assignee</label>
              <select name="assignee" value={formData.assignee} onChange={handleChange}
                className="w-full px-5 py-3 rounded-2xl border border-outline-variant dark:border-dark-outline-variant bg-background dark:bg-dark-background text-on-surface dark:text-dark-on-surface focus:ring-2 focus:ring-primary outline-none text-sm">
                <option value="">Unassigned</option>
                {users.map(u => <option key={u._id} value={u.name}>{u.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-secondary uppercase tracking-[0.1em] ml-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">groups</span> Team
              </label>
              <select name="team" value={formData.team} onChange={handleChange}
                className="w-full px-5 py-3 rounded-2xl border border-outline-variant dark:border-dark-outline-variant bg-background dark:bg-dark-background text-on-surface dark:text-dark-on-surface focus:ring-2 focus:ring-primary outline-none text-sm">
                <option value="">No Team</option>
                {teams.map(t => <option key={t._id} value={t.name}>{t.name} ({(t.members||[]).length})</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-secondary uppercase tracking-[0.1em] ml-1">Due Date</label>
              <input name="dueDate" value={formData.dueDate} onChange={handleChange}
                className="w-full px-5 py-3 rounded-2xl border border-outline-variant dark:border-dark-outline-variant bg-background dark:bg-dark-background text-on-surface dark:text-dark-on-surface focus:ring-2 focus:ring-primary outline-none text-sm"
                type="date" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-secondary uppercase tracking-[0.1em] ml-1">Priority</label>
              <div className="flex gap-2 p-1.5 bg-background dark:bg-dark-background rounded-2xl border border-outline-variant dark:border-dark-outline-variant">
                {['Low', 'Medium', 'High'].map((p) => (
                  <button key={p} type="button" onClick={() => setFormData({ ...formData, priority: p })}
                    className={`flex-1 py-2 text-[10px] font-black rounded-xl transition-all ${
                      formData.priority === p ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-secondary hover:text-on-surface'
                    }`}>{p.toUpperCase()}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button type="button" className="flex-1 py-4 text-sm font-bold text-secondary hover:bg-background dark:hover:bg-dark-background rounded-2xl transition-all" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={loading} className="flex-[2] px-10 py-4 text-sm font-black bg-primary text-white rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all disabled:opacity-50">
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
