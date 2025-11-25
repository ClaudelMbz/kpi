import React, { useState } from 'react';
import { Category } from '../types';
import { CATEGORY_PALETTE } from '../constants';
import { generateId, saveCategories } from '../services/trackerService';
import { Button } from './ui/Button';
import { X, Trash2, Plus } from 'lucide-react';

interface CategoryManagerProps {
  categories: Category[];
  setCategories: (cats: Category[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, setCategories, isOpen, onClose }) => {
  const [newName, setNewName] = useState('');
  const [selectedColor, setSelectedColor] = useState(CATEGORY_PALETTE[0].hex);

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!newName.trim()) return;
    const newCat: Category = {
      id: generateId(),
      name: newName.trim(),
      color: selectedColor,
    };
    const updated = [...categories, newCat];
    setCategories(updated);
    saveCategories(updated);
    setNewName('');
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      const updated = categories.filter(c => c.id !== id);
      setCategories(updated);
      saveCategories(updated);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Gérer les catégories</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* List existing */}
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
             {categories.length === 0 && <p className="text-sm text-slate-400 italic">Aucune catégorie définie.</p>}
             {categories.map(cat => (
               <div key={cat.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-2 rounded-md border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                     <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: cat.color }}></div>
                     <span className="font-medium text-slate-700 dark:text-slate-200">{cat.name}</span>
                  </div>
                  <button onClick={() => handleDelete(cat.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                     <Trash2 size={16} />
                  </button>
               </div>
             ))}
          </div>

          {/* Add New */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
             <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">Nouvelle Catégorie</h4>
             
             <div className="space-y-4">
                 <input 
                    type="text" 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Nom (ex: Sports)"
                    className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                 />
                 
                 <div>
                    <p className="text-xs text-slate-400 mb-2">Couleur</p>
                    <div className="flex flex-wrap gap-2">
                        {CATEGORY_PALETTE.map((color) => (
                            <button
                                key={color.hex}
                                onClick={() => setSelectedColor(color.hex)}
                                className={`w-6 h-6 rounded-full transition-transform ${selectedColor === color.hex ? 'ring-2 ring-offset-2 ring-emerald-500 scale-110' : 'hover:scale-105'}`}
                                style={{ backgroundColor: color.hex }}
                                title={color.name}
                            />
                        ))}
                    </div>
                 </div>

                 <Button onClick={handleAdd} disabled={!newName.trim()} className="w-full justify-center">
                    <Plus size={16} className="mr-2" />
                    Ajouter
                 </Button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};