import React, { useMemo, useState } from 'react';
import { getAllData, getCategories, calculateKPI } from '../services/trackerService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend, BarChart, Bar, Cell } from 'recharts';
import { TaskStatus } from '../types';
import { STATUS_COEFFICIENTS } from '../constants';

export const Dashboard: React.FC = () => {
  const [range, setRange] = useState<'7' | '30' | 'all'>('7');

  const { chartData, categoryData } = useMemo(() => {
    const allData = getAllData();
    const categories = getCategories();
    const sortedDates = Object.keys(allData).sort();
    
    // Filter by range
    let datesToProcess = sortedDates;
    if (range !== 'all') {
       const days = parseInt(range);
       datesToProcess = sortedDates.slice(-days);
    }

    // 1. Prepare Main Trend Data & Expense Data
    const trendData = datesToProcess.map(date => {
      const dayData = allData[date];
      
      let doneCount = 0;
      let totalItems = 0;

      dayData.tasks.forEach(t => {
          if (t.subTasks.length > 0) {
              t.subTasks.forEach(st => {
                  totalItems++;
                  if (st.status === TaskStatus.DONE) doneCount++;
              });
          } else {
              totalItems++;
              if (t.status === TaskStatus.DONE) doneCount++;
          }
      });

      return {
        date,
        displayDate: new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        actual: dayData.actualKpi,
        target: dayData.targetKpi,
        expense: dayData.expense || 0, // Ensure expense exists
        completionRate: totalItems > 0 ? (doneCount / totalItems) * 100 : 0
      };
    });

    // 2. Prepare Category Data
    const catStats: Record<string, { totalScore: number; count: number }> = {};
    
    // Initialize
    categories.forEach(c => {
        catStats[c.id] = { totalScore: 0, count: 0 };
    });
    // Unknown category bucket
    catStats['unknown'] = { totalScore: 0, count: 0 };

    datesToProcess.forEach(date => {
        const dayTasks = allData[date].tasks;
        dayTasks.forEach(task => {
            const catId = task.categoryId && categories.find(c => c.id === task.categoryId) ? task.categoryId : 'unknown';
            
            // If task has subtasks, they belong to the parent category
            if (task.subTasks.length > 0) {
                task.subTasks.forEach(st => {
                     catStats[catId].count++;
                     catStats[catId].totalScore += STATUS_COEFFICIENTS[st.status];
                });
            } else {
                catStats[catId].count++;
                catStats[catId].totalScore += STATUS_COEFFICIENTS[task.status];
            }
        });
    });

    const catChartData = categories.map(c => {
        const stats = catStats[c.id];
        return {
            name: c.name,
            color: c.color,
            performance: stats.count > 0 ? (stats.totalScore / stats.count) * 100 : 0,
            volume: stats.count
        };
    }).filter(c => c.volume > 0); // Only show categories with data

    // Removed 'Sans Catégorie' block as requested

    return { chartData: trendData, categoryData: catChartData };
  }, [range]);

  // Calculations for summary cards
  const averageKPI = useMemo(() => {
     if (chartData.length === 0) return 0;
     const sum = chartData.reduce((acc, curr) => acc + curr.actual, 0);
     return (sum / chartData.length).toFixed(1);
  }, [chartData]);

  const successRate = useMemo(() => {
      if (chartData.length === 0) return '0';
      const successDays = chartData.filter(d => d.actual >= d.target).length;
      return ((successDays / chartData.length) * 100).toFixed(0);
  }, [chartData]);

  const totalExpenses = useMemo(() => {
      if (chartData.length === 0) return 0;
      const sum = chartData.reduce((acc, curr) => acc + curr.expense, 0);
      return sum.toFixed(2);
  }, [chartData]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Filters and Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Tableau de Bord</h2>
           <p className="text-slate-500 dark:text-slate-400">Analyse de vos performances</p>
        </div>
        
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
           <button 
             onClick={() => setRange('7')}
             className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${range === '7' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
           >
             7 Jours
           </button>
           <button 
             onClick={() => setRange('30')}
             className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${range === '30' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
           >
             30 Jours
           </button>
           <button 
             onClick={() => setRange('all')}
             className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${range === 'all' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
           >
             Tout
           </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
             <p className="text-sm font-medium text-slate-400 uppercase">Moyenne KPI</p>
             <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{averageKPI}%</p>
         </div>
         <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
             <p className="text-sm font-medium text-slate-400 uppercase">Objectifs Atteints</p>
             <p className={`text-3xl font-bold mt-1 ${parseInt(successRate) > 50 ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-500'}`}>{successRate}%</p>
             <p className="text-xs text-slate-400 mt-1">des jours affichés</p>
         </div>
         <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
             <p className="text-sm font-medium text-slate-400 uppercase">Dépenses Totales</p>
             <p className="text-3xl font-bold text-amber-500 mt-1">{totalExpenses}€</p>
         </div>
         <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
             <p className="text-sm font-medium text-slate-400 uppercase">Jours Suivis</p>
             <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{chartData.length}</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Graph */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 h-[350px]">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Évolution du KPI</h3>
            {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="displayDate" stroke="#94a3b8" tick={{fontSize: 12}} tickMargin={10} />
                    <YAxis 
                        stroke="#94a3b8" 
                        domain={[0, 100]} 
                        ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
                        tick={{fontSize: 11}} 
                    />
                    <Tooltip 
                        contentStyle={{ 
                            borderRadius: '8px', 
                            border: 'none', 
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            backgroundColor: 'var(--tw-content-bg, #fff)',
                            color: 'var(--tw-content-text, #1e293b)'
                        }}
                        itemStyle={{ color: '#10b981' }}
                        labelStyle={{ color: '#64748b', fontWeight: 'bold' }}
                    />
                    <ReferenceLine y={80} stroke="#94a3b8" strokeDasharray="3 3" label={{ value: "Objectif (80%)", position: "insideTopRight", fill: "#94a3b8", fontSize: 10 }} />
                    <Area 
                        type="monotone" 
                        dataKey="actual" 
                        name="KPI Réel"
                        stroke="#10b981" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorActual)" 
                    />
                    <Area 
                        type="monotone" 
                        dataKey="target" 
                        name="Objectif"
                        stroke="#94a3b8" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        fill="none" 
                    />
                </AreaChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-slate-400">
                    Pas assez de données pour afficher le graphique.
                </div>
            )}
        </div>

        {/* Expense Graph */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 h-[350px]">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Évolution des Dépenses</h3>
            {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                        <XAxis dataKey="displayDate" stroke="#94a3b8" tick={{fontSize: 12}} tickMargin={10} />
                        <YAxis stroke="#94a3b8" tick={{fontSize: 11}} unit="€" />
                        <Tooltip 
                            cursor={{fill: 'transparent'}}
                            contentStyle={{ 
                                borderRadius: '8px', 
                                border: 'none', 
                                backgroundColor: '#fff',
                                color: '#1e293b'
                            }}
                        />
                        <Bar dataKey="expense" name="Dépenses (€)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-slate-400">
                    Pas de données de dépenses.
                </div>
            )}
        </div>
      </div>

      {/* Category Performance Graph */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 h-80">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Performance par Catégorie</h3>
        {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#334155" opacity={0.2} />
                    <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" hide />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" width={100} tick={{fontSize: 12}} />
                    <Tooltip 
                         cursor={{fill: 'transparent'}}
                         contentStyle={{ 
                            borderRadius: '8px', 
                            border: 'none', 
                            backgroundColor: '#fff',
                            color: '#1e293b'
                        }}
                    />
                    <Bar dataKey="performance" name="Taux de réussite (%)" radius={[0, 4, 4, 0]} barSize={20}>
                        {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        ) : (
            <div className="h-full flex items-center justify-center text-slate-400">
                Pas assez de données pour l'analyse par catégorie.
            </div>
        )}
      </div>
    </div>
  );
};