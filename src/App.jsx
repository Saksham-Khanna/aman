import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import CreateTaskModal from './components/CreateTaskModal';
import Login from './components/Login';
import Register from './components/Register';
import TaskBoard from './components/TaskBoard';
import Team from './components/Team';
import AdminPortal from './components/AdminPortal';
import Settings from './components/Settings';
import Support from './components/Support';

function App() {
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [authMode, setAuthMode] = useState('login');
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#team=')) {
        setCurrentTab('team-management');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser && savedUser !== 'undefined') {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error('Error parsing user from localStorage:', err);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleTaskCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setAuthMode('login');
    setCurrentTab('dashboard');
  };

  if (!user) {
    return authMode === 'login' ? (
      <Login onLoginSuccess={setUser} onToggleMode={() => setAuthMode('register')} />
    ) : (
      <Register onRegisterSuccess={setUser} onToggleMode={() => setAuthMode('login')} />
    );
  }

  const renderContent = () => {
    const props = { user, showToast, setCurrentTab, searchQuery };
    switch (currentTab) {
      case 'dashboard': return <Dashboard key={refreshTrigger} {...props} />;
      case 'taskboard': return <TaskBoard key={refreshTrigger} {...props} />;
      case 'team': return <Team key={refreshTrigger} {...props} />;
      case 'team-management': return <Team key="management" {...props} initialView="management" />;
      case 'admin': return <AdminPortal {...props} />;
      case 'settings': return <Settings {...props} setUser={setUser} />;
      case 'support': return <Support {...props} />;
      default: return <Dashboard key={refreshTrigger} {...props} />;
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background text-on-surface dark:text-dark-on-surface transition-colors duration-300">
      <Sidebar user={user} onLogout={handleLogout} currentTab={currentTab} setCurrentTab={setCurrentTab} />
      <Header user={user} onLogout={handleLogout} darkMode={darkMode} setDarkMode={setDarkMode} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      {renderContent()}
      
      <button 
        className="fixed bottom-8 right-8 w-14 h-14 bg-slate-900 dark:bg-primary text-white rounded-full shadow-xl flex items-center justify-center hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 z-50"
        onClick={() => setIsModalOpen(true)}
      >
        <span className="material-symbols-outlined text-[32px]">add</span>
      </button>

      <CreateTaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onTaskCreated={handleTaskCreated}
        showToast={showToast}
      />

      {toast && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl shadow-2xl z-[200] flex items-center gap-3 ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          <span className="material-symbols-outlined">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
          <span className="font-bold text-sm">{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default App;
