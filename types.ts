export enum Rank {
  Ordinary = "Ordinary",
  Commander = "Commander",
  Explorer = "Explorer",
  NightCommander = "Night Commander",
  Conqueror = "Conqueror",
  King = "King",
  Master = "Master",
  Grandmaster = "Grandmaster"
}

export interface Exercise {
  id: string;
  name: string;
  count: number;
  target: number;
}

export interface WeightEntry {
  date: string;
  value: number;
}

export interface HeightEntry {
  date: string;
  value: number;
}

export interface UserData {
  name: string;
  email: string;
  age: number;
  weight: number;
  height: number;
  photo: string | null;
  level: number;
  xp: number;
  streak: number;
  skillPoints: number;
  recoveryDays: number;
  daysCompletedThisWeek: number;
  lastWorkoutDate: string | null;
  exercises: Exercise[];
  weightHistory: WeightEntry[];
  heightHistory: HeightEntry[];
  recoveryActive: boolean;
  recoveryEndTime: number | null;
  workoutLog: Record<string, number>;
  penaltyActive: boolean;
  lastMonthCheck: string | null;
  alarmAudio: string | null;
  isSilent: boolean;
  questCompletedToday: boolean;
  hiddenQuestTriggeredToday: boolean;
}

export type View = 'dashboard' | 'profile' | 'stats' | 'settings' | 'onboarding';