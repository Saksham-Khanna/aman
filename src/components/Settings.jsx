import React, { useState } from 'react';
import { authAPI } from '../services/api';

const Settings = ({ user, setUser, showToast }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [loading, setLoading] = useState(false);

  const [passData, setPassData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passLoading, setPassLoading] = useState(false);
  const [showPassForm, setShowPassForm] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await authAPI.updateProfile(formData);
      const updatedUser = { ...user, ...res.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      if (setUser) setUser(updatedUser);
      if (showToast) showToast('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmPassword) {
      return showToast('New passwords do not match', 'error');
    }
    setPassLoading(true);
    try {
      await authAPI.updatePassword({
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword
      });
      showToast('Password updated successfully!');
      setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPassForm(false);
    } catch (err) {
      showToast(err.response?.data?.msg || 'Failed to update password', 'error');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <main className="pt-24 pl-[292px] pr-8 pb-12 min-h-screen transition-colors">
      <section className="mb-8">
        <h2 className="text-3xl font-black text-on-surface dark:text-dark-on-surface mb-1">Account Settings</h2>
        <p className="text-sm text-secondary">Manage your profile, preferences, and notifications.</p>
      </section>

      <div className="max-w-4xl space-y-6">
        {/* Profile Card */}
        <div className="bg-surface dark:bg-dark-surface rounded-2xl border border-outline-variant dark:border-dark-outline-variant shadow-sm overflow-hidden">
          <div className="p-6 border-b border-outline-variant dark:border-dark-outline-variant flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-lg">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h3 className="font-bold text-on-surface dark:text-dark-on-surface text-lg">{user?.name || 'User'}</h3>
              <p className="text-xs text-secondary">{user?.email}</p>
              <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${user?.role === 'Admin' ? 'bg-blue-500/10 text-blue-600' : 'bg-slate-500/10 text-slate-600'}`}>
                {user?.role === 'Admin' && <span className="material-symbols-outlined text-[10px]">shield</span>}
                {user?.role || 'Member'}
              </span>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-secondary uppercase tracking-widest ml-1">Full Name</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant dark:border-dark-outline-variant focus:ring-2 focus:ring-primary outline-none text-sm bg-background dark:bg-dark-background text-on-surface dark:text-dark-on-surface" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-secondary uppercase tracking-widest ml-1">Email Address</label>
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant dark:border-dark-outline-variant focus:ring-2 focus:ring-primary outline-none text-sm bg-background dark:bg-dark-background text-on-surface dark:text-dark-on-surface" 
                />
              </div>
            </div>
            
            <div className="flex justify-end pt-2">
              <button 
                onClick={handleSave}
                disabled={loading}
                className="bg-primary text-white font-bold py-3 px-8 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-blue-500/10 disabled:opacity-50 active:scale-[0.98]"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-surface dark:bg-dark-surface rounded-2xl border border-outline-variant dark:border-dark-outline-variant shadow-sm overflow-hidden">
          <div className="p-6 border-b border-outline-variant dark:border-dark-outline-variant flex justify-between items-center">
            <h3 className="font-bold text-on-surface dark:text-dark-on-surface">Security & Privacy</h3>
            <span className="bg-green-500/10 text-green-500 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">Secure</span>
          </div>
          <div className="p-6 divide-y divide-outline-variant dark:divide-dark-outline-variant">
            <div className="py-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h4 className="text-sm font-bold text-on-surface dark:text-dark-on-surface">Password</h4>
                  <p className="text-xs text-secondary">Secured with bcrypt encryption</p>
                </div>
                <button 
                  onClick={() => setShowPassForm(!showPassForm)}
                  className="text-primary font-bold text-sm hover:underline"
                >
                  {showPassForm ? 'Cancel' : 'Update'}
                </button>
              </div>

              {showPassForm && (
                <form onSubmit={handleUpdatePassword} className="space-y-4 pt-2 animate-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-secondary uppercase tracking-widest ml-1">Current Password</label>
                      <input 
                        type="password" required
                        value={passData.currentPassword}
                        onChange={e => setPassData({...passData, currentPassword: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl border border-outline-variant dark:border-dark-outline-variant outline-none text-xs bg-background dark:bg-dark-background text-on-surface dark:text-dark-on-surface"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-secondary uppercase tracking-widest ml-1">New Password</label>
                      <input 
                        type="password" required minLength="6"
                        value={passData.newPassword}
                        onChange={e => setPassData({...passData, newPassword: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl border border-outline-variant dark:border-dark-outline-variant outline-none text-xs bg-background dark:bg-dark-background text-on-surface dark:text-dark-on-surface"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-secondary uppercase tracking-widest ml-1">Confirm New Password</label>
                      <input 
                        type="password" required
                        value={passData.confirmPassword}
                        onChange={e => setPassData({...passData, confirmPassword: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl border border-outline-variant dark:border-dark-outline-variant outline-none text-xs bg-background dark:bg-dark-background text-on-surface dark:text-dark-on-surface"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button 
                      type="submit"
                      disabled={passLoading}
                      className="bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold py-2.5 px-6 rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
                    >
                      {passLoading ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              )}
            </div>
            <div className="py-4 flex justify-between items-center group relative">
              <div>
                <h4 className="text-sm font-bold text-on-surface dark:text-dark-on-surface flex items-center gap-2">
                  Two-factor Authentication 
                  <span className="text-[9px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded font-black uppercase tracking-tighter border border-amber-500/20">Coming Soon</span>
                </h4>
                <p className="text-xs text-secondary">Extra layer of security for your account</p>
              </div>
              <div className="w-10 h-5 bg-outline-variant dark:bg-dark-outline-variant rounded-full relative cursor-not-allowed opacity-50">
                <div className="absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-all"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Settings;
