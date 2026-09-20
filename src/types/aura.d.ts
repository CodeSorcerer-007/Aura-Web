/**
 * Aura Mindful Productivity — Core TypeScript Schema Definitions
 */

export type EnergyLevel = 'spark' | 'flow' | 'rest';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening';

export type PriorityLevel = 1 | 2 | 3;

export type BotanicalSpecies = 'oak' | 'cherry' | 'evergreen' | 'willow' | 'bamboo';

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface TaskAttachment {
  key: string;
  name: string;
  type: string;
  size: number;
}

export interface VoiceNote {
  key: string;
  duration: number;
  timestamp: string;
}

export interface RecurringRule {
  type: 'daily' | 'weekly' | 'monthly';
}

export interface AuraTask {
  id: string;
  createdAt: string;
  text: string;
  completed: boolean;
  priority: PriorityLevel;
  energy: EnergyLevel;
  category: string;
  timeOfDay: TimeOfDay;
  deadline: string | null;
  subtasks: Subtask[];
  win: string | null;
  completionDate: string | null;
  recurring: RecurringRule | null;
  dependsOn?: string | null;
  notes: string;
  attachments: TaskAttachment[];
  voiceNotes: VoiceNote[];
  tags: string[];
  isPinned: boolean;
  focusSessions: number;
  isArchived: boolean;
}

export interface GroveTree {
  id: string;
  species: BotanicalSpecies;
  plantedDate: string;
  growthPoints: number;
  completedTasksCount: number;
  isGolden?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
}

export interface JournalEntry {
  date: string;
  content: string;
  mood: 'calm' | 'energized' | 'focused' | 'grateful' | 'reflective' | 'weary' | null;
  updatedAt?: string;
}

export interface DailySnapshot {
  id: string;
  date: string;
  timestamp: number;
  data: {
    tasks: AuraTask[];
    grove: GroveTree[];
    journalEntries: JournalEntry[];
    stats: Record<string, any>;
  };
}

export interface CustomTheme {
  id: string;
  name: string;
  bg: string;
  bgSecondary: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
}
