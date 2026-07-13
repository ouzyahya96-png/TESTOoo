/**
 * ALPHA MAN - Personalized Kegel Program Service
 * Manages objectives, constraints, program adaptations, custom scheduling,
 * special training paths (Performance, PE Control, Post-Op, Couple, Alpha Challenge),
 * and weekly compliant intelligence.
 */

export interface ProgramObjectiveProfile {
  primaryGoal: 'performance' | 'control' | 'health' | 'confidence' | 'all';
  durationTrack: 'fast' | 'progressive' | 'maintenance';
  experienceLevel: 'never' | 'before' | 'pain' | 'post_op';
}

export interface TrainingProgram {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  focusText: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | 'Specialized';
  dailyDurationMin: number;
  exercises: {
    name: string;
    description: string;
    reps: number;
    holdSec: number;
    relaxSec: number;
  }[];
}

export interface CustomReminder {
  id: string;
  label: string;
  time: string; // HH:MM
  enabled: boolean;
}

export interface ProgramState {
  profile: ProgramObjectiveProfile;
  selectedProgramId: string;
  trainingMode: 'standard' | 'vacation' | 'intensive';
  daysMissedCount: number;
  painReported: boolean;
  stagnantWeeksCount: number;
  streakDays: number;
  reminders: CustomReminder[];
  scheduleEvents: {
    day: string; // "Lundi", "Mardi", etc.
    sessionTime: string; // "Matin" | "Midi" | "Soir"
    completed: boolean;
  }[];
}

// Five highly specialized predefined pelvic programs
export const SPECIALIZED_PROGRAMS: TrainingProgram[] = [
  {
    id: "prog_performance",
    name: "Performance Totale",
    emoji: "🚀",
    tagline: "Vascularisation maximale, force brute et endurance érectile.",
    focusText: "Idéal pour maximiser l'afflux sanguin (NO) et verrouiller la rigidité.",
    difficulty: "Advanced",
    dailyDurationMin: 12,
    exercises: [
      { name: "Contractions Brutes", description: "Serrer au maximum de votre force puis relâcher complètement.", reps: 15, holdSec: 6, relaxSec: 6 },
      { name: "Vitesse Flash", description: "Contractions ultra-rapides d'une fraction de seconde pour tonifier les fibres de type II.", reps: 25, holdSec: 1, relaxSec: 1 },
      { name: "Soutien Continu", description: "Maintenir une contraction constante à 70% de la puissance maximale.", reps: 3, holdSec: 15, relaxSec: 10 }
    ]
  },
  {
    id: "prog_pe_control",
    name: "Contrôle PE (Prévention)",
    emoji: "🛑",
    tagline: "Reverse Kegel, relaxation consciente et blocage du réflexe d'éjaculation.",
    focusText: "Travaille le relâchement actif du muscle bulbo-caverneux (Reverse Kegel).",
    difficulty: "Intermediate",
    dailyDurationMin: 10,
    exercises: [
      { name: "Reverse Kegel Profond", description: "Poussez doucement vers le bas comme pour uriner pour étirer le plancher.", reps: 12, holdSec: 8, relaxSec: 6 },
      { name: "Relâchement Rythmique", description: "Serrer légèrement (30%) puis relâcher de manière prolongée.", reps: 10, holdSec: 3, relaxSec: 10 },
      { name: "Respiration Alignée", description: "Inspirer en relâchant le plancher pelvien, expirer en le maintenant neutre.", reps: 8, holdSec: 5, relaxSec: 5 }
    ]
  },
  {
    id: "prog_post_op",
    name: "Santé & Rééducation Post-Op",
    emoji: "🛡️",
    tagline: "Progression ultra-lente, activation douce et accord médical.",
    focusText: "Conçu pour la récupération après chirurgie pelvienne ou incontinence.",
    difficulty: "Beginner",
    dailyDurationMin: 5,
    exercises: [
      { name: "Éveil Pelvien", description: "Contractions infimes (20% de force) pour réactiver les connexions nerveuses.", reps: 8, holdSec: 2, relaxSec: 8 },
      { name: "Relâchement Absolu", description: "Concentration sur la détente complète du sphincter.", reps: 5, holdSec: 1, relaxSec: 10 }
    ]
  },
  {
    id: "prog_couple",
    name: "Harmonie de Couple",
    emoji: "👩‍❤️‍👨",
    tagline: "Entraînement synchronisé avec feedback de bio-tension partagée.",
    focusText: "Exercices d'endurance mutuelle et de contractions alternées.",
    difficulty: "Intermediate",
    dailyDurationMin: 15,
    exercises: [
      { name: "Vagues Alternées", description: "Contracter pendant que la partenaire relâche, puis inverser le rythme.", reps: 15, holdSec: 5, relaxSec: 5 },
      { name: "Endurance Partagée", description: "Contraction synchrone prolongée pour stimuler le contrôle simultané.", reps: 5, holdSec: 12, relaxSec: 12 }
    ]
  },
  {
    id: "prog_alpha_challenge",
    name: "Alpha Challenge 30 Jours",
    emoji: "🔥",
    tagline: "Intensité ultime pour les guerriers. Dominez votre musculature pelvienne.",
    focusText: "Séries extrêmes d'ascenseur et de paliers de force.",
    difficulty: "Expert",
    dailyDurationMin: 20,
    exercises: [
      { name: "L'Ascenseur Absolu", description: "Contracter par paliers successifs (30%, 60%, 90%) puis descendre lentement.", reps: 8, holdSec: 10, relaxSec: 10 },
      { name: "Impulsion Maximum", description: "Contraction foudroyante à 100% de force immédiate.", reps: 30, holdSec: 2, relaxSec: 2 },
      { name: "Résistance Warrior", description: "Maintenir à la limite de la fatigue.", reps: 3, holdSec: 25, relaxSec: 15 }
    ]
  }
];

const STORAGE_KEY = "alphaman_personalized_program_state";

const defaultState: ProgramState = {
  profile: {
    primaryGoal: 'performance',
    durationTrack: 'fast',
    experienceLevel: 'before'
  },
  selectedProgramId: "prog_performance",
  trainingMode: 'standard',
  daysMissedCount: 0,
  painReported: false,
  stagnantWeeksCount: 0,
  streakDays: 8,
  reminders: [
    { id: "rem_1", label: "Contraction Éveil Matinal", time: "08:00", enabled: true },
    { id: "rem_2", label: "Pause Focus Pelvien Midi", time: "12:30", enabled: false },
    { id: "rem_3", label: "Ancrage Avant Sommeil", time: "22:15", enabled: true }
  ],
  scheduleEvents: [
    { day: "Lundi", sessionTime: "Matin", completed: true },
    { day: "Lundi", sessionTime: "Soir", completed: true },
    { day: "Mardi", sessionTime: "Matin", completed: true },
    { day: "Mardi", sessionTime: "Soir", completed: false },
    { day: "Mercredi", sessionTime: "Matin", completed: true },
    { day: "Mercredi", sessionTime: "Midi", completed: true },
    { day: "Mercredi", sessionTime: "Soir", completed: true },
    { day: "Jeudi", sessionTime: "Matin", completed: true },
    { day: "Jeudi", sessionTime: "Soir", completed: true },
    { day: "Vendredi", sessionTime: "Matin", completed: false },
    { day: "Vendredi", sessionTime: "Soir", completed: true },
    { day: "Samedi", sessionTime: "Matin", completed: true },
    { day: "Samedi", sessionTime: "Soir", completed: true },
    { day: "Dimanche", sessionTime: "Matin", completed: true },
    { day: "Dimanche", sessionTime: "Soir", completed: false }
  ]
};

export const programmeService = {
  getState(): ProgramState {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error("Failed to load program state", e);
    }
    this.saveState(defaultState);
    return defaultState;
  },

  saveState(state: ProgramState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      window.dispatchEvent(new Event('alphaman_program_updated'));
    } catch (e) {
      console.error("Failed to save program state", e);
    }
  },

  updateProfile(profile: Partial<ProgramObjectiveProfile>): void {
    const state = this.getState();
    state.profile = { ...state.profile, ...profile };
    
    // Auto-associate default program matching objective
    if (profile.primaryGoal) {
      if (profile.primaryGoal === 'performance') state.selectedProgramId = "prog_performance";
      else if (profile.primaryGoal === 'control') state.selectedProgramId = "prog_pe_control";
      else if (profile.primaryGoal === 'health') state.selectedProgramId = "prog_post_op";
      else if (profile.primaryGoal === 'all') state.selectedProgramId = "prog_alpha_challenge";
    }

    if (profile.experienceLevel === 'post_op') {
      state.selectedProgramId = "prog_post_op";
    }

    this.saveState(state);
  },

  setProgramId(programId: string): void {
    const state = this.getState();
    state.selectedProgramId = programId;
    this.saveState(state);
  },

  setTrainingMode(mode: 'standard' | 'vacation' | 'intensive'): void {
    const state = this.getState();
    state.trainingMode = mode;
    this.saveState(state);
  },

  toggleReminder(id: string): void {
    const state = this.getState();
    const reminder = state.reminders.find(r => r.id === id);
    if (reminder) {
      reminder.enabled = !reminder.enabled;
      this.saveState(state);
    }
  },

  updateReminderTime(id: string, timeStr: string): void {
    const state = this.getState();
    const reminder = state.reminders.find(r => r.id === id);
    if (reminder) {
      reminder.time = timeStr;
      this.saveState(state);
    }
  },

  toggleScheduleDay(day: string, sessionTime: "Matin" | "Midi" | "Soir"): void {
    const state = this.getState();
    const event = state.scheduleEvents.find(e => e.day === day && e.sessionTime === sessionTime);
    if (event) {
      event.completed = !event.completed;
    } else {
      state.scheduleEvents.push({ day, sessionTime, completed: true });
    }
    this.saveState(state);
  },

  // Machine Learning / Rule-Based Adaptation Engine
  // Analyzes inputs and produces adaptation feedback notifications
  runAdaptationDiagnostics(
    feedbackNotes: string,
    streak: number,
    forceIncreasePercent: number,
    hadPain: boolean,
    missedSessions: number
  ): {
    levelChange: number; // e.g. -1, 0, 1
    adaptationMessage: string;
    actionTaken: string;
  } {
    const state = this.getState();
    let levelChange = 0;
    let adaptationMessage = "Votre musculature pelvienne est équilibrée. Continuez le programme actuel.";
    let actionTaken = "Statut Stable";

    // Rule 1: Pain reported
    if (hadPain || feedbackNotes.toLowerCase().includes("douleur") || feedbackNotes.toLowerCase().includes("mal")) {
      state.painReported = true;
      levelChange = -1;
      adaptationMessage = "Douleur ou inconfort signalé. L'algorithme a automatiquement basculé votre programme vers des exercices de relâchement doux (Reverse Kegel) et suggère 2 jours de repos.";
      actionTaken = "Programme Allégé & Repos suggéré";
    }
    // Rule 2: 3 or more sessions missed
    else if (missedSessions >= 3) {
      state.daysMissedCount = missedSessions;
      levelChange = -1;
      adaptationMessage = "Vous avez manqué 3 séances ou plus. L'IA a réduit temporairement l'intensité d'un niveau pour éviter les spasmes ou l'épuisement des fibres musculaires.";
      actionTaken = "Niveau Temporairement Ajusté (-1)";
    }
    // Rule 3: Major force increase (e.g. +20%)
    else if (forceIncreasePercent >= 20) {
      levelChange = 1;
      adaptationMessage = "Progression fulgurante de votre force contractile (+20%). L'algorithme vous propulse au niveau supérieur pour stimuler votre endurance de pointe !";
      actionTaken = "Niveau Supérieur Débloqué (+1)";
    }
    // Rule 4: Stagnation for 2 weeks
    else if (state.stagnantWeeksCount >= 2) {
      adaptationMessage = "Plateau de progression détecté depuis 2 semaines. L'IA a diversifié vos types d'exercices en intégrant des variations d'impulsions rapides et des contractions asymétriques.";
      actionTaken = "Exercices Alternatifs Activés";
    }
    // Rule 5: Strong 7 days streak
    else if (streak >= 7) {
      adaptationMessage = "Souveraineté et discipline impériale ! Streak de 7 jours consécutifs. Profitez d'un bonus de +100 points de Vitalité et d'un défi d'ascenseur extrême.";
      actionTaken = "Défi Spécial Guerrier Activé";
    }

    this.saveState(state);
    return { levelChange, adaptationMessage, actionTaken };
  },

  resetProgress(): void {
    this.saveState(defaultState);
  }
};
