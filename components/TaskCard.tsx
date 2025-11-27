
import React from 'react';
import { Task, SubTask, WeightLevel, TaskStatus, Category } from '../types';
import { WEIGHT_LABELS, STATUS_LABELS } from '../constants';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { Trash2, Plus, CornerDownRight, GripVertical, Clock, Timer } from 'lucide-react';
import { generateId } from '../services/trackerService';

interface TaskCardProps {
  task: Task;
  categories: Category[];
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, categories, onUpdate, onDelete }) => {
  const hasSubTasks = task.subTasks.length > 0;
  
  // Find current category object to get color
  const currentCategory = categories.find(c => c.id === task.categoryId);

  const handleAddSubTask = () => {
    const newSubTask: SubTask = {
      id: generateId(),
      name: '',
      weightLevel: WeightLevel.MEDIUM,
      status: TaskStatus.NEUTRAL,
      timeEstimated: 0,
      timeActual: 0,
    };
    onUpdate({
      ...task,
      subTasks: [...task.subTasks, newSubTask],
    });
  };

  const updateSubTask = (index: number, updates: Partial<SubTask>) => {
    const newSubTasks = [...task.subTasks];
    newSubTasks[index] = { ...newSubTasks[index], ...updates };
    onUpdate({ ...task, subTasks: newSubTasks });
  };

  const removeSubTask = (index: number) => {
    const newSubTasks = task.subTasks.filter((_, i) => i !== index);
    onUpdate({ ...task, subTasks: newSubTasks });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mb-4 transition-all hover:shadow-md relative">
      {/* Category colored strip on left */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1.5" 
        style={{ backgroundColor: currentCategory?.color || 'transparent' }}
      ></div>

      {/* Main Task Header */}
      <div className={`p-4 pl-6 ${hasSubTasks ? 'bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700' : ''}`}>
        <div className="flex items-start gap-3">
            <div className="mt-2 text-slate-400 dark:text-slate-500">
                <GripVertical size={16} />
            </div>
          
          <div className="flex-grow space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <input
                    type="text"
                    value={task.name}
                    onChange={(e) => onUpdate({ ...task, name: e.target.value })}
                    placeholder="Nom de la tâche principale..."
                    className="flex-grow text-lg font-semibold bg-transparent border-none focus:ring-0 placeholder:text-slate-300 dark:placeholder:text-slate-600 text-slate-900 dark:text-white p-0"
                />
                
                {/* Category Select */}
                <div className="relative min-w-[120px]">
                    <select
                        value={task.categoryId || ''}
                        onChange={(e) => onUpdate({ ...task, categoryId: e.target.value || undefined })}
                        className="w-full text-xs rounded-full border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 py-1 pl-3 pr-7 text-slate-600 dark:text-slate-300 focus:border-emerald-500 focus:ring-emerald-500 appearance-none cursor-pointer"
                    >
                        <option value="">Sans catégorie</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                    {currentCategory && (
                        <div 
                            className="absolute right-7 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                            style={{ backgroundColor: currentCategory.color }}
                        />
                    )}
                </div>
            </div>
            
            {!hasSubTasks && (
              <div className="flex flex-wrap gap-4 items-center">
                <Select
                  value={task.weightLevel}
                  onChange={(e) => onUpdate({ ...task, weightLevel: e.target.value as WeightLevel })}
                  className="w-32 text-xs"
                >
                  {Object.entries(WEIGHT_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </Select>

                {/* Time Inputs for Main Task */}
                <div className="flex items-center gap-3 border-l border-r border-slate-200 dark:border-slate-700 px-3 mx-1">
                   <div className="flex items-center gap-1" title="Temps Estimé (min)">
                       <Clock size={14} className="text-slate-400" />
                       <input 
                          type="number" 
                          placeholder="Est." 
                          className="w-12 text-xs border-none bg-transparent p-0 focus:ring-0 text-slate-600 dark:text-slate-300 placeholder:text-slate-300"
                          value={task.timeEstimated || ''}
                          onChange={(e) => onUpdate({ ...task, timeEstimated: parseFloat(e.target.value) })}
                       />
                       <span className="text-[10px] text-slate-400">min</span>
                   </div>
                   <div className="flex items-center gap-1" title="Temps Réel (min)">
                       <Timer size={14} className="text-emerald-500" />
                       <input 
                          type="number" 
                          placeholder="Réel" 
                          className="w-12 text-xs border-none bg-transparent p-0 focus:ring-0 text-slate-800 dark:text-white font-medium placeholder:text-slate-300"
                          value={task.timeActual || ''}
                          onChange={(e) => onUpdate({ ...task, timeActual: parseFloat(e.target.value) })}
                       />
                       <span className="text-[10px] text-slate-400">min</span>
                   </div>
                </div>

                <div className="flex rounded-md shadow-sm bg-slate-100 dark:bg-slate-900 p-1">
                    {Object.entries(STATUS_LABELS).map(([key, label]) => {
                        const statusKey = key as TaskStatus;
                        const isActive = task.status === statusKey;
                        return (
                            <button
                                key={key}
                                onClick={() => onUpdate({...task, status: statusKey})}
                                className={`px-3 py-1 text-xs font-medium rounded-sm transition-all ${
                                    isActive 
                                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                }`}
                            >
                                {label}
                            </button>
                        )
                    })}
                </div>
              </div>
            )}
            
            {hasSubTasks && (
               <p className="text-xs text-orange-600 dark:text-orange-400 font-medium flex items-center gap-1">
                 <CornerDownRight size={12}/>
                 Poids et temps transférés aux sous-tâches
               </p>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => onDelete(task.id)} title="Supprimer la tâche">
              <Trash2 size={16} className="text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400" />
            </Button>
          </div>
        </div>
      </div>

      {/* Subtasks Area */}
      <div className="bg-slate-50/50 dark:bg-slate-900/30 p-4 pt-2 pl-6">
        {task.subTasks.map((sub, index) => (
          <div key={sub.id} className="flex items-center gap-3 ml-8 mt-3 p-2 bg-white dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 shadow-sm flex-wrap">
             <div className="text-slate-300 dark:text-slate-600">
                <CornerDownRight size={14} />
             </div>
             <div className="flex-grow grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                 <div className="md:col-span-4">
                    <input
                        type="text"
                        value={sub.name}
                        onChange={(e) => updateSubTask(index, { name: e.target.value })}
                        placeholder="Sous-tâche..."
                        className="w-full text-sm border-0 border-b border-slate-200 dark:border-slate-600 focus:border-emerald-500 focus:ring-0 bg-transparent px-0 py-1 text-slate-800 dark:text-slate-200"
                    />
                 </div>
                 <div className="md:col-span-2">
                     <select
                        value={sub.weightLevel}
                        onChange={(e) => updateSubTask(index, { weightLevel: e.target.value as WeightLevel })}
                        className="w-full text-xs border-none bg-slate-50 dark:bg-slate-700 rounded px-2 py-1 text-slate-600 dark:text-slate-300 focus:ring-0 cursor-pointer"
                     >
                        {Object.entries(WEIGHT_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                     </select>
                 </div>

                 {/* Time Inputs for Subtask */}
                 <div className="md:col-span-3 flex items-center gap-2 border-l border-r border-slate-100 dark:border-slate-700 px-2 justify-center">
                     <div className="flex items-center gap-1" title="Estimé">
                        <Clock size={12} className="text-slate-400" />
                        <input 
                            type="number"
                            placeholder="0"
                            className="w-8 text-xs bg-transparent border-none p-0 text-slate-500 dark:text-slate-400 text-right focus:ring-0"
                            value={sub.timeEstimated || ''}
                            onChange={(e) => updateSubTask(index, { timeEstimated: parseFloat(e.target.value) })}
                        />
                     </div>
                     <span className="text-slate-300">/</span>
                     <div className="flex items-center gap-1" title="Réel">
                        <Timer size={12} className="text-emerald-500" />
                        <input 
                            type="number"
                            placeholder="0"
                            className="w-8 text-xs bg-transparent border-none p-0 text-slate-800 dark:text-white font-medium text-right focus:ring-0"
                            value={sub.timeActual || ''}
                            onChange={(e) => updateSubTask(index, { timeActual: parseFloat(e.target.value) })}
                        />
                     </div>
                 </div>

                 <div className="md:col-span-3 flex justify-end">
                     <div className="flex bg-slate-100 dark:bg-slate-900 rounded p-0.5">
                        {Object.entries(STATUS_LABELS).map(([key, label]) => {
                             const statusKey = key as TaskStatus;
                             const isActive = sub.status === statusKey;
                             return (
                                 <button
                                     key={key}
                                     onClick={() => updateSubTask(index, { status: statusKey })}
                                     className={`w-6 h-6 flex items-center justify-center rounded-sm text-[10px] transition-colors ${
                                         isActive
                                         ? (statusKey === TaskStatus.DONE ? 'bg-emerald-500 text-white' : statusKey === TaskStatus.NOT_DONE ? 'bg-red-500 text-white' : 'bg-yellow-400 text-white')
                                         : 'text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                                     }`}
                                     title={label}
                                 >
                                     {statusKey === TaskStatus.DONE ? '✔' : statusKey === TaskStatus.NOT_DONE ? '✖' : '−'}
                                 </button>
                             )
                        })}
                     </div>
                 </div>
             </div>
             <button onClick={() => removeSubTask(index)} className="text-slate-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 ml-1">
                <Trash2 size={14} />
             </button>
          </div>
        ))}

        <div className="mt-3 ml-8">
            <Button variant="secondary" size="sm" onClick={handleAddSubTask} className="text-xs">
                <Plus size={14} className="mr-1" />
                {task.subTasks.length > 0 ? 'Ajouter une sous-tâche' : 'Convertir en tâche complexe (Ajouter sous-tâche)'}
            </Button>
        </div>
      </div>
    </div>
  );
};
