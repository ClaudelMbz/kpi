import { DayData, Task, SubTask, WeightLevel, TaskStatus, Category } from '../types';
import { WEIGHT_VALUES, STATUS_COEFFICIENTS, CATEGORY_PALETTE } from '../constants';

const STORAGE_KEY = 'kpi_tracker_data_v1';
const CATEGORY_STORAGE_KEY = 'kpi_tracker_categories_v1';

// --- KPI Calculation ---

export const calculateKPI = (tasks: Task[]): number => {
  // 1. Identify all scoring items (Leaf nodes)
  // If a task has subtasks, the task itself is ignored, and subtasks are used.
  // If a task has NO subtasks, the task itself is used.
  
  const scoringItems: { weightLevel: WeightLevel; status: TaskStatus }[] = [];

  tasks.forEach((task) => {
    if (task.subTasks && task.subTasks.length > 0) {
      task.subTasks.forEach((sub) => {
        scoringItems.push({ weightLevel: sub.weightLevel, status: sub.status });
      });
    } else {
      scoringItems.push({ weightLevel: task.weightLevel, status: task.status });
    }
  });

  if (scoringItems.length === 0) return 0;

  // 2. Calculate Total Raw Weight
  const totalRawWeight = scoringItems.reduce((sum, item) => {
    return sum + WEIGHT_VALUES[item.weightLevel];
  }, 0);

  if (totalRawWeight === 0) return 0;

  // 3. Calculate Normalized Score
  let totalScore = 0;

  scoringItems.forEach((item) => {
    const rawWeight = WEIGHT_VALUES[item.weightLevel];
    const normalizedWeight = (rawWeight / totalRawWeight) * 100; // Percentage of the day
    const coefficient = STATUS_COEFFICIENTS[item.status];
    
    totalScore += (normalizedWeight * coefficient);
  });

  return parseFloat(totalScore.toFixed(2));
};

// --- Data Persistence ---

export const getDayData = (date: string): DayData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return createEmptyDay(date);
  }
  const data = JSON.parse(stored);
  return data[date] || createEmptyDay(date);
};

export const getAllData = (): Record<string, DayData> => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
};

export const saveDayData = (dayData: DayData): void => {
  const stored = localStorage.getItem(STORAGE_KEY);
  const data = stored ? JSON.parse(stored) : {};
  
  // Recalculate KPI before saving to ensure consistency
  dayData.actualKpi = calculateKPI(dayData.tasks);
  
  data[dayData.date] = dayData;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const createEmptyDay = (date: string): DayData => ({
  date,
  targetKpi: 80, // Default target
  tasks: [],
  actualKpi: 0,
});

export const generateId = () => Math.random().toString(36).substr(2, 9);

// --- Category Persistence ---

export const getCategories = (): Category[] => {
  const stored = localStorage.getItem(CATEGORY_STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  
  // Default Categories if none exist
  const defaults: Category[] = [
    { id: generateId(), name: 'Travail', color: CATEGORY_PALETTE[1].hex }, // Blue
    { id: generateId(), name: 'Sports', color: CATEGORY_PALETTE[0].hex }, // Emerald
    { id: generateId(), name: 'Dev Perso', color: CATEGORY_PALETTE[2].hex }, // Violet
    { id: generateId(), name: 'Santé Mentale', color: CATEGORY_PALETTE[6].hex }, // Cyan
    { id: generateId(), name: 'Finance', color: CATEGORY_PALETTE[5].hex }, // Yellow
  ];
  saveCategories(defaults);
  return defaults;
};

export const saveCategories = (categories: Category[]): void => {
  localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(categories));
};