import React from 'react';

const Sidebar = ({ user, currentTab, setCurrentTab, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid_view' },
    { id: 'taskboard', label: 'Timeline', icon: 'event_repeat' },
    { id: 'team', label: 'Organizations', icon: 'groups' },
    { id: 'admin', label: 'Control Center', icon: 'settings_input_component', adminOnly: true },
    { id: 'settings', label: 'Preferences', icon: 'settings' },
    { id: 'support', label: 'Help Center', icon: 'contact_support' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] bg-white dark:bg-[#0f172a] border-r border-slate-200 dark:border-slate-800 z-[100] transition-all duration-500 shadow-[20px_0_60px_-15px_rgba(0,0,0,0.03)] dark:shadow-none">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-12 group cursor-pointer" onClick={() => setCurrentTab('dashboard')}>
          <div className="w-10 h-10 bg-slate-900 dark:bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-[15deg] transition-transform duration-500">
            <span className="material-symbols-outlined text-white text-2xl font-black">bolt</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">TASKFLOW<span className="text-primary font-black">.</span></h1>
        </div>

        <nav className="space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 ml-2">Navigation</p>
          {menuItems.map((item) => {
            if (item.adminOnly && user.role !== 'Admin') return null;
            const isActive = currentTab === item.id || (item.id === 'team' && currentTab === 'team-management');
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 relative group ${
                  isActive 
                    ? 'bg-slate-900 dark:bg-primary text-white shadow-xl shadow-primary/20' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className={`material-symbols-outlined text-xl transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {item.icon}
                </span>
                <span className="text-sm font-bold tracking-tight">{item.label}</span>
                {isActive && (
                  <div className="absolute right-3 w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse"></div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="absolute bottom-0 left-0 w-full p-6">
        <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-[2rem] border border-slate-100 dark:border-slate-800 transition-all hover:shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-md border-2 border-white dark:border-slate-700">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <p className="text-xs font-black text-slate-900 dark:text-white truncate tracking-tight">{user.name}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-black text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            SIGN OUT
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
