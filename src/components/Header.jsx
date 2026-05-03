import React from 'react';

const Header = ({ user, darkMode, setDarkMode, searchQuery, setSearchQuery }) => {
  return (
    <header className="fixed top-0 right-0 left-[260px] h-20 bg-white/70 dark:bg-[#0f172a]/70 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 z-[90] flex items-center justify-between px-8 transition-all duration-500">
      <div className="flex-grow max-w-2xl relative group">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-[20px]">search</span>
        <input 
          type="text" 
          placeholder="Analyze intelligence or search milestones..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-sm outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-slate-900 dark:text-white font-medium"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
           <span className="px-2 py-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-black text-slate-400">CTRL</span>
           <span className="px-2 py-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-black text-slate-400">K</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="w-11 h-11 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-90"
        >
          <span className="material-symbols-outlined">{darkMode ? 'light_mode' : 'dark_mode'}</span>
        </button>
        
        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>

        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{user.name}</p>
            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.15em]">{user.role}</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 dark:from-primary dark:to-indigo-600 flex items-center justify-center text-white text-sm font-black shadow-lg shadow-slate-900/10 border-2 border-white dark:border-slate-800">
            {user.name.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
