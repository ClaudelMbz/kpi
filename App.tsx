import React, { useState, useEffect } from 'react';
import { DailyView } from './components/DailyView';
import { Dashboard } from './components/Dashboard';
import { LayoutDashboard, CheckSquare, Calendar as CalendarIcon, Moon, Sun } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'daily' | 'dashboard'>('daily');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize theme from local storage or system preference
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Top Navigation */}
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-600 text-white p-1.5 rounded-lg shadow-sm">
                <CheckSquare size={24} strokeWidth={2.5} />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-800 dark:text-white">KPI<span className="text-emerald-600 dark:text-emerald-400">Master</span></span>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button 
                onClick={() => setCurrentView('daily')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'daily' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'}`}
              >
                <CheckSquare size={18} className="mr-2" />
                <span className="hidden sm:inline">Saisie Journalière</span>
                <span className="sm:hidden">Saisie</span>
              </button>
              <button 
                onClick={() => setCurrentView('dashboard')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'dashboard' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'}`}
              >
                <LayoutDashboard size={18} className="mr-2" />
                <span className="hidden sm:inline">Analyses</span>
                <span className="sm:hidden">Stats</span>
              </button>
              
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>

              <button 
                onClick={toggleTheme}
                className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                title={isDarkMode ? "Passer en mode clair" : "Passer en mode sombre"}
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Date Selector (Only for Daily View) */}
      {currentView === 'daily' && (
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 py-3 shadow-sm transition-colors">
           <div className="max-w-6xl mx-auto px-4 flex items-center justify-center gap-4">
              <button 
                onClick={() => {
                   const d = new Date(selectedDate);
                   d.setDate(d.getDate() - 1);
                   setSelectedDate(d.toISOString().split('T')[0]);
                }}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400"
              >
                 ←
              </button>
              
              <div className="relative">
                 <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                 <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="pl-9 pr-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                 />
              </div>

              <button 
                onClick={() => {
                   const d = new Date(selectedDate);
                   d.setDate(d.getDate() + 1);
                   setSelectedDate(d.toISOString().split('T')[0]);
                }}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400"
              >
                 →
              </button>
           </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'daily' ? (
          <DailyView date={selectedDate} />
        ) : (
          <Dashboard />
        )}
      </main>
    </div>
  );
};

export default App;