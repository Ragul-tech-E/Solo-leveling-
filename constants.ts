import { Rank } from './types';

export const RANK_LEVELS: Record<number, Rank> = {
  1: Rank.Ordinary,
  5: Rank.Commander,
  10: Rank.Explorer,
  15: Rank.NightCommander,
  20: Rank.Conqueror,
  25: Rank.King,
  30: Rank.Master,
  40: Rank.Grandmaster
};

export const getRankForLevel = (level: number): Rank => {
  const levels = Object.keys(RANK_LEVELS).map(Number).sort((a, b) => b - a);
  for (const l of levels) {
    if (level >= l) return RANK_LEVELS[l];
  }
  return Rank.Ordinary;
};

// High XP per rep (XP gain feels fast/easy)
export const XP_PER_REP = 250; 

// Base XP requirement is very high (making Leveling itself feel difficult)
export const XP_BASE_LEVEL = 50000; 

export const getNextLevelXP = (level: number) => XP_BASE_LEVEL * Math.pow(1.2, level - 1);