import React, { useEffect, useState, useCallback } from 'react';
import { DayData, Task, WeightLevel, TaskStatus, Category } from '../types';
import { getDayData, saveDayData, calculateKPI, generateId, getCategories } from '../services/trackerService';
import { TaskCard } from './TaskCard';
import { Button } from './ui/Button';
import { CategoryManager } from './CategoryManager';
import { Plus, Save, TrendingUp, Calendar, AlertCircle, Copy, Settings2 } from 'lucide-react';

interface DailyViewProps {
  date: string;
}

export const DailyView: React.FC<DailyViewProps> = ({ date }) => {
  const [data, setData] = useState<DayData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tempKpi, setTempKpi] = useState(0);
  const [isSaved, setIsSaved] = useState(true);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Load data when date changes
  useEffect(() => {
    const loadedData = getDayData(date);
    const loadedCats = getCategories();
    setData(loadedData);
    setCategories(loadedCats);
    setTempKpi(calculateKPI(loadedData.tasks));
    setIsSaved(true);
  }, [date]);

  // Handler for saving
  const handleSave = useCallback(() => {
    if (!data) return;
    saveDayData(data);
    setIsSaved(true);
  }, [data]);

  // Handler for adding a task
  const addTask = () => {
    if (!data) return;
    const newTask: Task = {
      id: generateId(),
      name: '',
      weightLevel: WeightLevel.MEDIUM,
      status: TaskStatus.NEUTRAL,
      subTasks: [],
    };
    const updated = { ...data, tasks: [...data.tasks, newTask] };
    setData(updated);
    setTempKpi(calculateKPI(updated.tasks));
    setIsSaved(false);
  };

  // Handler for copying from previous day
  const copyFromYesterday = () => {
      if (!data) return;

      // 1. Calculate yesterday's date
      const currentDate = new Date(date);
      currentDate.setDate(currentDate.getDate() - 1);
      const yesterdayStr = currentDate.toISOString().split('T')[0];
      
      // 2. Fetch data
      const yesterdayData = getDayData(yesterdayStr);

      if (yesterdayData.tasks.length === 0) {
          alert("Pas de tâches trouvées pour la journée d'hier (" + yesterdayStr + ")");
          return;
      }

      // 3. Clone tasks (Deep copy + ID regeneration + Reset Status)
      const copiedTasks: Task[] = yesterdayData.tasks.map(t => ({
          ...t,
          id: generateId(),
          status: TaskStatus.NEUTRAL,
          subTasks: t.subTasks.map(st => ({
              ...st,
              id: generateId(),
              status: TaskStatus.NEUTRAL
          }))
      }));

      // 4. Update State
      const updated = {
          ...data,
          tasks: [...data.tasks, ...copiedTasks]
      };
      
      setData(updated);
      setTempKpi(calculateKPI(updated.tasks));
      setIsSaved(false);
  };

  // Handler for updating a task
  const updateTask = (updatedTask: Task) => {
    if (!data) return;
    const updatedTasks = data.tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
    const updated = { ...data, tasks: updatedTasks };
    setData(updated);
    setTempKpi(calculateKPI(updatedTasks));
    setIsSaved(false);
  };

  // Handler for deleting a task
  const deleteTask = (taskId: string) => {
    if (!data) return;
    const updatedTasks = data.tasks.filter(t => t.id !== taskId);
    const updated = { ...data, tasks: updatedTasks };
    setData(updated);
    setTempKpi(calculateKPI(updatedTasks));
    setIsSaved(false);
  };

  // Handler for updating target
  const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!data) return;
    const val = parseInt(e.target.value) || 0;
    setData({ ...data, targetKpi: val });
    setIsSaved(false);
  };

  if (!data) return <div className="p-8 text-center text-slate-500">Chargement...</div>;

  const isTargetMet = tempKpi >= data.targetKpi;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <CategoryManager 
         isOpen={isCategoryModalOpen}
         onClose={() => setIsCategoryModalOpen(false)}
         categories={categories}
         setCategories={setCategories}
      />

      {/* Header Stat Panel */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-8 sticky top-4 z-10 backdrop-blur-lg bg-white/90 dark:bg-slate-800/90 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                <Calendar size={24} />
             </div>
             <div>
               <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Date</h2>
               <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
             </div>
          </div>

          <div className="flex items-center gap-8">
            <div>
               <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Objectif</label>
               <div className="flex items-center gap-1">
                   <input 
                      type="number" 
                      min="0" 
                      max="100" 
                      value={data.targetKpi}
                      onChange={handleTargetChange}
                      className="w-16 font-bold text-2xl bg-transparent border-b border-slate-300 dark:border-slate-600 focus:border-emerald-500 focus:ring-0 p-0 text-center text-slate-900 dark:text-white"
                   />
                   <span className="text-slate-400 font-medium">%</span>
               </div>
            </div>

            <div className="h-10 w-px bg-slate-200 dark:bg-slate-700"></div>

            <div>
               <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">KPI Réel</label>
               <div className={`flex items-center gap-2 ${isTargetMet ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                   <TrendingUp size={24} />
                   <span className="text-3xl font-extrabold">{tempKpi}</span>
                   <span className="text-lg font-medium text-slate-400">%</span>
               </div>
            </div>
          </div>
          
          <div>
              <Button 
                onClick={handleSave} 
                disabled={isSaved} 
                variant={isSaved ? 'secondary' : 'primary'}
                className="w-full md:w-auto"
              >
                  <Save size={18} className="mr-2" />
                  {isSaved ? 'Enregistré' : 'Enregistrer'}
              </Button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full mt-6 overflow-hidden relative">
            <div 
                className={`h-full transition-all duration-500 ease-out ${isTargetMet ? 'bg-emerald-500' : 'bg-emerald-600/60'}`}
                style={{ width: `${Math.min(tempKpi, 100)}%` }}
            ></div>
            <div 
                className="absolute top-0 bottom-0 w-1 bg-slate-900/20 dark:bg-white/20 z-10"
                style={{ left: `${data.targetKpi}%` }}
                title={`Objectif: ${data.targetKpi}%`}
            ></div>
        </div>
      </div>

      {/* Action Bar (Manage Categories) */}
      <div className="flex justify-end mb-4">
         <button 
           onClick={() => setIsCategoryModalOpen(true)}
           className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 transition-colors"
         >
            <Settings2 size={14} />
            Gérer les catégories
         </button>
      </div>

      {/* Task List */}
      <div className="space-y-6">
         {data.tasks.length === 0 && (
             <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl transition-colors">
                 <AlertCircle className="mx-auto text-slate-300 dark:text-slate-600 mb-2" size={32} />
                 <p className="text-slate-500 dark:text-slate-400 font-medium">Aucune tâche définie pour aujourd'hui.</p>
                 <p className="text-slate-400 dark:text-slate-500 text-sm mb-4">Commencez par ajouter vos objectifs ou copiez ceux d'hier.</p>
                 
                 <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button onClick={addTask}>
                        <Plus size={18} className="mr-2" />
                        Ajouter ma première tâche
                    </Button>
                    <Button variant="secondary" onClick={copyFromYesterday}>
                        <Copy size={18} className="mr-2" />
                        Copier les tâches d'hier
                    </Button>
                 </div>
             </div>
         )}

         {data.tasks.map(task => (
            <TaskCard 
                key={task.id} 
                task={task} 
                categories={categories}
                onUpdate={updateTask} 
                onDelete={deleteTask} 
            />
         ))}

         {data.tasks.length > 0 && (
             <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="secondary" className="flex-grow border-dashed dark:border-slate-600" onClick={addTask}>
                    <Plus size={18} className="mr-2" />
                    Ajouter une tâche
                </Button>
                 <Button variant="secondary" className="border-dashed dark:border-slate-600" onClick={copyFromYesterday} title="Copier les tâches d'hier">
                     <Copy size={18} className="mr-2" />
                     Copier Hier
                 </Button>
             </div>
         )}
      </div>
    </div>
  );
};