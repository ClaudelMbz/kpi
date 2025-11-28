import { WeightLevel, TaskStatus } from './types';

// Raw values for weights before normalization
export const WEIGHT_VALUES: Record<WeightLevel, number> = {
  [WeightLevel.VERY_HIGH]: 40,
  [WeightLevel.HIGH]: 30,
  [WeightLevel.MEDIUM]: 15,
  [WeightLevel.LOW_MEDIUM]: 10,
  [WeightLevel.LOW]: 5,
};

// Labels for UI
export const WEIGHT_LABELS: Record<WeightLevel, string> = {
  [WeightLevel.VERY_HIGH]: 'Très Haute',
  [WeightLevel.HIGH]: 'Haute',
  [WeightLevel.MEDIUM]: 'Moyenne',
  [WeightLevel.LOW_MEDIUM]: 'Assez Faible',
  [WeightLevel.LOW]: 'Faible',
};

// Coefficient multipliers
export const STATUS_COEFFICIENTS: Record<TaskStatus, number> = {
  [TaskStatus.DONE]: 1.0,
  [TaskStatus.NEUTRAL]: 0.25,
  [TaskStatus.NOT_DONE]: 0.0,
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.DONE]: 'Fait',
  [TaskStatus.NEUTRAL]: 'Neutre',
  [TaskStatus.NOT_DONE]: 'Pas Fait',
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  [TaskStatus.DONE]: 'bg-green-100 text-green-800 border-green-200',
  [TaskStatus.NEUTRAL]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [TaskStatus.NOT_DONE]: 'bg-red-100 text-red-800 border-red-200',
};

// Max 10 colors palette for categories
export const CATEGORY_PALETTE = [
  { name: 'Émeraude', hex: '#10b981', tailwind: 'bg-emerald-500' },
  { name: 'Bleu', hex: '#3b82f6', tailwind: 'bg-blue-500' },
  { name: 'Violet', hex: '#8b5cf6', tailwind: 'bg-violet-500' },
  { name: 'Rose', hex: '#ec4899', tailwind: 'bg-pink-500' },
  { name: 'Orange', hex: '#f97316', tailwind: 'bg-orange-500' },
  { name: 'Jaune', hex: '#eab308', tailwind: 'bg-yellow-500' },
  { name: 'Cyan', hex: '#06b6d4', tailwind: 'bg-cyan-500' },
  { name: 'Rouge', hex: '#ef4444', tailwind: 'bg-red-500' },
  { name: 'Indigo', hex: '#6366f1', tailwind: 'bg-indigo-500' },
  { name: 'Gris', hex: '#64748b', tailwind: 'bg-slate-500' },
];