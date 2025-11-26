export enum WeightLevel {
  VERY_HIGH = 'VERY_HIGH',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW_MEDIUM = 'LOW_MEDIUM',
  LOW = 'LOW',
}

export enum TaskStatus {
  DONE = 'DONE',
  NEUTRAL = 'NEUTRAL',
  NOT_DONE = 'NOT_DONE',
}

export interface Category {
  id: string;
  name: string;
  color: string; // Hex code or Tailwind class reference key
}

export interface SubTask {
  id: string;
  name: string;
  weightLevel: WeightLevel;
  status: TaskStatus;
}

export interface Task {
  id: string;
  name: string;
  categoryId?: string; // Optional reference to a category
  weightLevel: WeightLevel;
  status: TaskStatus;
  subTasks: SubTask[];
}

export interface DayData {
  date: string; // ISO string YYYY-MM-DD
  targetKpi: number;
  expense: number; // Daily expense amount
  tasks: Task[];
  actualKpi: number; // Calculated and stored for caching, but re-calculated on edit
}

export interface KPIStats {
  date: string;
  actual: number;
  target: number;
  totalTasks: number;
  completionRate: number; // Percentage of items 'Done'
}