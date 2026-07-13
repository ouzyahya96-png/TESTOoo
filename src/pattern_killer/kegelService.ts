/**
 * ALPHA MAN - Kegel 10 Niveaux Master Service
 * Persistent storage, complete 10-level schedule, session completion logs,
 * streak calculations, progress tracking, and beautiful pre-seeded session history.
 */

export interface KegelProgramDetails {
  contractionDuration: number; // in seconds, 0 if variable/special
  relaxationDuration: number; // in seconds
  reps: number;
  sets: number;
  hasFastReps?: boolean;
  fastRepsCount?: number;
  hasElevator?: boolean;
  elevatorFloors?: number;
  hasHoldAtMax?: boolean;
  holdAtMaxDuration?: number; // in seconds
  hasReverseKegel?: boolean;
  reverseKegelReps?: number;
  description: string;
}

export interface KegelLevel {
  id: number;
  name: string;
  badge: string;
  weeks: string;
  objective: string;
  program: string;
  duration: string; // duration in minutes/day
  durationSecondsPerSet: number; // calculated set time for interactive timer
  frequency: string;
  tracking: string;
  unlocks: string;
  details: KegelProgramDetails;
}

export interface KegelSession {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  levelId: number;
  levelName: string;
  durationSeconds: number;
  repsCompleted: number;
  subjectiveForce: number; // 1-10 slider rating
  isFeelMuscleOk: boolean; // Tracking for Level 1 ("Je sens le muscle": oui/non)
  notes: string;
}

export interface KegelState {
  currentLevelId: number;
  completedSessions: KegelSession[];
  streak: number;
  lastSessionDate?: string;
  totalXP: number;
}

// 10 levels data array
export const KEGEL_LEVELS: KegelLevel[] = [
  {
    id: 1,
    name: "NOVICE",
    badge: "🌱 NOVICE",
    weeks: "Semaine 1-2",
    objective: "Apprendre à isoler le muscle PC",
    program: "Contractions légères de 3 à 5 secondes pour isoler et activer le plancher pelvien sans abdos ni fessiers.",
    duration: "5 min/jour",
    durationSecondsPerSet: 120,
    frequency: "3x/jour",
    tracking: "Sensation musculaire stable (Oui/Non)",
    unlocks: "Leçons Kegel Éducation 1-2",
    details: {
      contractionDuration: 3,
      relaxationDuration: 5,
      reps: 10,
      sets: 2,
      description: "Contraction légère (3s), relâchement (5s). 10 répétitions. Restez concentré sur l'isolation pure."
    }
  },
  {
    id: 2,
    name: "APPRENTICE",
    badge: "🌿 APPRENTICE",
    weeks: "Semaine 3-4",
    objective: "Contrôle de base et tenue de 3 secondes",
    program: "Séries alternées lentes de 3 secondes de contraction suivies de contractions rapides de 1 seconde.",
    duration: "8 min/jour",
    durationSecondsPerSet: 180,
    frequency: "3x/jour",
    tracking: "Temps de tenue moyen, nombre de répétitions",
    unlocks: "Module de Respiration Guidée Somato-Respiratoire",
    details: {
      contractionDuration: 3,
      relaxationDuration: 3,
      reps: 20,
      sets: 2,
      hasFastReps: true,
      fastRepsCount: 10,
      description: "Contractions standards de 3s alternées avec 10 contractions ultra-rapides d'impulsion."
    }
  },
  {
    id: 3,
    name: "DISCIPLE",
    badge: "🍃 DISCIPLE",
    weeks: "Semaine 5-6",
    objective: "Tenue stable de 5 secondes et progression par paliers",
    program: "Tenues lentes de 5s et introduction du protocole de l'ascenseur (contraction progressive par paliers).",
    duration: "10 min/jour",
    durationSecondsPerSet: 240,
    frequency: "3x/jour",
    tracking: "Force subjective (1-10), endurance globale",
    unlocks: "Plan Nutrition Masculine Ciblée & Flux Sanguin",
    details: {
      contractionDuration: 5,
      relaxationDuration: 5,
      reps: 25,
      sets: 3,
      hasFastReps: true,
      fastRepsCount: 10,
      hasElevator: true,
      elevatorFloors: 3,
      description: "Contraction de 5s + contractions rapides + technique de l'ascenseur sur 3 étages progressifs."
    }
  },
  {
    id: 4,
    name: "WARRIOR",
    badge: "⚔️ WARRIOR",
    weeks: "Semaine 7-8",
    objective: "Contrôle avancé et contractions de 7 secondes",
    program: "Contractions intenses de 7 secondes, contractions rapides et exercice de 'Hold at Max' sous tension.",
    duration: "12 min/jour",
    durationSecondsPerSet: 300,
    frequency: "3x/jour",
    tracking: "Force, endurance, vélocité d'impulsion",
    unlocks: "Protocoles d'Exercices Physique Avancés (Full Body Integration)",
    details: {
      contractionDuration: 7,
      relaxationDuration: 7,
      reps: 30,
      sets: 3,
      hasFastReps: true,
      fastRepsCount: 15,
      hasElevator: true,
      elevatorFloors: 5,
      hasHoldAtMax: true,
      holdAtMaxDuration: 10,
      description: "Contraction forte de 7s, Elevator à 5 niveaux, suivi d'une tenue d'endurance maximale de 10s."
    }
  },
  {
    id: 5,
    name: "GUARDIAN",
    badge: "🛡️ GUARDIAN",
    weeks: "Semaine 9-12",
    objective: "Force significative et tenue prolongée",
    program: "Séries lourdes de 10 secondes et introduction du Reverse Kegel pour un relâchement actif conscient.",
    duration: "15 min/jour",
    durationSecondsPerSet: 360,
    frequency: "3x/jour",
    tracking: "Force de contraction et relâchement actif",
    unlocks: "Programme d'Exercices en Couple & Resynchronisation Intime",
    details: {
      contractionDuration: 10,
      relaxationDuration: 10,
      reps: 35,
      sets: 3,
      hasFastReps: true,
      fastRepsCount: 20,
      hasElevator: true,
      elevatorFloors: 10,
      hasHoldAtMax: true,
      holdAtMaxDuration: 15,
      hasReverseKegel: true,
      reverseKegelReps: 5,
      description: "Contraction de 10s, Elevator à 10 niveaux, Hold at Max de 15s et étirement pelvien actif (Reverse Kegel)."
    }
  },
  {
    id: 6,
    name: "KNIGHT",
    badge: "🏇 KNIGHT",
    weeks: "Semaine 13-16",
    objective: "Force élevée et coordination respiratoire",
    program: "Séries de 15 secondes synchronisées sur des schémas d'inspiration/expiration diaphragmatiques profonds.",
    duration: "18 min/jour",
    durationSecondsPerSet: 420,
    frequency: "3x/jour",
    tracking: "Rapport de force, endurance, coordination respiratoire",
    unlocks: "Accès au Biofeedback Connecté Externe",
    details: {
      contractionDuration: 15,
      relaxationDuration: 15,
      reps: 40,
      sets: 3,
      hasFastReps: true,
      fastRepsCount: 25,
      hasElevator: true,
      elevatorFloors: 15,
      hasHoldAtMax: true,
      holdAtMaxDuration: 30,
      hasReverseKegel: true,
      reverseKegelReps: 10,
      description: "Contraction prolongée de 15s, coordination respiratoire forcée, Elevator 15 étages et Reverse Kegel."
    }
  },
  {
    id: 7,
    name: "CHAMPION",
    badge: "🏆 CHAMPION",
    weeks: "Semaine 17-20",
    objective: "Intégration posturale et contraction de 20 secondes",
    program: "Contractions de 20 secondes en effectuant des postures dynamiques (squats lents, ponts fessiers).",
    duration: "20 min/jour",
    durationSecondsPerSet: 480,
    frequency: "3x/jour",
    tracking: "Force brute, stabilité posturale complexe",
    unlocks: "Session de Coaching Individuel Direct 1-on-1 (Diagnostic)",
    details: {
      contractionDuration: 20,
      relaxationDuration: 20,
      reps: 50,
      sets: 3,
      hasFastReps: true,
      fastRepsCount: 30,
      hasElevator: true,
      elevatorFloors: 20,
      hasHoldAtMax: true,
      holdAtMaxDuration: 60,
      hasReverseKegel: true,
      reverseKegelReps: 15,
      description: "Contractions pelviennes intenses de 20s intégrées à des mouvements posturaux (Pont/Squat)."
    }
  },
  {
    id: 8,
    name: "MASTER",
    badge: "🎖️ MASTER",
    weeks: "Semaine 21-24",
    objective: "Endurance maximale et contractions de 30 secondes",
    program: "Séries d'endurance de 30 secondes combinées à des vagues d'impulsions contractions ultra-rapides.",
    duration: "25 min/jour",
    durationSecondsPerSet: 540,
    frequency: "3x/jour",
    tracking: "Indicateurs d'endurance d'acier, contractions par vagues",
    unlocks: "Contenu Expert Exclusif: Neuro-Urologie & Maîtrise Interne",
    details: {
      contractionDuration: 30,
      relaxationDuration: 30,
      reps: 60,
      sets: 3,
      hasFastReps: true,
      fastRepsCount: 40,
      hasElevator: true,
      elevatorFloors: 25,
      hasHoldAtMax: true,
      holdAtMaxDuration: 120,
      hasReverseKegel: true,
      reverseKegelReps: 20,
      description: "Force d'endurance Master. Contractions de 30s, variations rapides vagues et Hold de 2 minutes."
    }
  },
  {
    id: 9,
    name: "LEGEND",
    badge: "👑 LEGEND",
    weeks: "Semaine 25-30",
    objective: "Contrôle olympique et contraction de 45 secondes",
    program: "Exercices de haute intensité avec contraction maintenue de 45 secondes et patterns complexes.",
    duration: "30 min/jour",
    durationSecondsPerSet: 600,
    frequency: "3x/jour",
    tracking: "Tous les indicateurs + Journal de transformation",
    unlocks: "Médaille & Badge Fondateur Immortel sur l'Application",
    details: {
      contractionDuration: 45,
      relaxationDuration: 45,
      reps: 80,
      sets: 3,
      hasFastReps: true,
      fastRepsCount: 50,
      hasElevator: true,
      elevatorFloors: 30,
      hasHoldAtMax: true,
      holdAtMaxDuration: 180,
      hasReverseKegel: true,
      reverseKegelReps: 30,
      description: "Niveau Légende. Résistance ultime de 45s, Elevator à 30 étages et étirements complets actifs."
    }
  },
  {
    id: 10,
    name: "ALPHA",
    badge: "🔥 ALPHA",
    weeks: "Semaine 31+",
    objective: "Maîtrise absolue à vie et maintenance préventive",
    program: "Séries modulées par l'IA d'ALPHA MAN selon la fatigue et les objectifs quotidiens de l'utilisateur.",
    duration: "Personnalisé (~20 min)",
    durationSecondsPerSet: 450,
    frequency: "3x/jour minimum",
    tracking: "Analytics avancées de performance neuro-pelvienne",
    unlocks: "Statut Mentor de la Communauté Alpha Man",
    details: {
      contractionDuration: 15,
      relaxationDuration: 15,
      reps: 30,
      sets: 2,
      hasFastReps: true,
      fastRepsCount: 20,
      hasElevator: true,
      elevatorFloors: 10,
      hasHoldAtMax: true,
      holdAtMaxDuration: 30,
      hasReverseKegel: true,
      reverseKegelReps: 15,
      description: "Maintenance et optimisation continue adaptative. Gardez un contrôle à 100% à vie."
    }
  }
];

// Seed history for beautiful graphs immediately on first render
const generateSeedSessions = (): KegelSession[] => {
  const sessions: KegelSession[] = [];
  const now = new Date();
  
  // Seed 14 sessions spanning the last 14 days representing active progression
  for (let i = 14; i >= 1; i--) {
    const sessionDate = new Date();
    sessionDate.setDate(now.getDate() - i);
    const dateStr = sessionDate.toISOString().split('T')[0];

    // Progression: Level 1 in the first few days, then Level 2, up to Level 3 or 4
    let levelId = 1;
    if (i <= 4) levelId = 3;
    else if (i <= 9) levelId = 2;

    const level = KEGEL_LEVELS[levelId - 1];
    
    // Slight noise in ratings
    const force = Math.min(10, Math.max(1, levelId * 2 + Math.floor(Math.random() * 3)));
    const reps = level.details.reps - Math.floor(Math.random() * 3);

    sessions.push({
      id: `session_seed_${i}`,
      date: dateStr,
      time: "08:30",
      levelId: level.id,
      levelName: level.name,
      durationSeconds: Math.floor(level.durationSecondsPerSet * 0.9),
      repsCompleted: reps,
      subjectiveForce: force,
      isFeelMuscleOk: true,
      notes: i === 14 ? "Première fois. Sent un peu de fatigue pelvienne." : "Progression stable. Meilleur contrôle."
    });
  }

  return sessions;
};

const STORAGE_KEY = "alphaman_kegel_state";

const defaultState: KegelState = {
  currentLevelId: 3, // Start user at Level 3 to reflect the layout mockup (LVL 8/80% could map to 3 as beginner-mid)
  completedSessions: generateSeedSessions(),
  streak: 8, // Seeded 8 days streak
  lastSessionDate: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0], // yesterday
  totalXP: 450
};

export const kegelService = {
  getState(): KegelState {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error("Failed to load Kegel state", e);
    }
    this.saveState(defaultState);
    return defaultState;
  },

  saveState(state: KegelState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      // Dispatch a custom event to notify React components to update
      window.dispatchEvent(new Event('alphaman_kegel_updated'));
    } catch (e) {
      console.error("Failed to save Kegel state", e);
    }
  },

  completeSession(
    levelId: number,
    durationSeconds: number,
    repsCompleted: number,
    subjectiveForce: number,
    isFeelMuscleOk: boolean,
    notes: string
  ): KegelSession {
    const state = this.getState();
    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toTimeString().slice(0, 5);

    const level = KEGEL_LEVELS.find(l => l.id === levelId) || KEGEL_LEVELS[0];

    const newSession: KegelSession = {
      id: `kegel_${Date.now()}`,
      date: todayStr,
      time: timeStr,
      levelId,
      levelName: level.name,
      durationSeconds,
      repsCompleted,
      subjectiveForce,
      isFeelMuscleOk,
      notes: notes.trim() || "Séance terminée avec succès."
    };

    state.completedSessions.push(newSession);

    // Calculate streak
    if (state.lastSessionDate) {
      const lastDate = new Date(state.lastSessionDate);
      const today = new Date(todayStr);
      const diffTime = Math.abs(today.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        state.streak += 1;
      } else if (diffDays > 1) {
        state.streak = 1; // broken, reset to 1
      }
    } else {
      state.streak = 1;
    }

    state.lastSessionDate = todayStr;

    // Calculate XP reward
    const xpReward = levelId * 15; // Higher levels award more XP
    state.totalXP += xpReward;

    // Auto level-up logic: complete 5 sessions at current level to level up
    const sessionsAtCurrentLevel = state.completedSessions.filter(s => s.levelId === state.currentLevelId).length;
    if (sessionsAtCurrentLevel >= 5 && state.currentLevelId < 10) {
      state.currentLevelId += 1;
    }

    this.saveState(state);
    return newSession;
  },

  // Get count of sessions needed to unlock next level
  getSessionsNeededForNextLevel(): number {
    const state = this.getState();
    if (state.currentLevelId >= 10) return 0;
    const completedAtCurrent = state.completedSessions.filter(s => s.levelId === state.currentLevelId).length;
    return Math.max(0, 5 - completedAtCurrent);
  },

  resetProgress(): void {
    this.saveState(defaultState);
  }
};
