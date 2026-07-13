/**
 * ALPHA MAN - Physical Integration Service
 * Manages complementary exercise tracking, hip mobility routines,
 * posture notifications configuration, and correlation algorithms.
 */

export interface PhysicalExercise {
  id: string;
  name: string;
  category: 'strength' | 'mobility' | 'posture';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  reps: string;
  durationText: string;
  kegelBenefit: string;
  instructions: string[];
  animationColor: string; // Tailwind gradient colors for visual demonstration
}

export interface ActivityCorrelation {
  factor: string;
  impactPercent: number; // e.g. +25
  impactTrend: 'up' | 'down';
  description: string;
}

export interface PhysicalState {
  completedTodayIds: string[];
  postureRemindersEnabled: boolean;
  hipMobilityTimerActive: boolean;
  activeHipStretchIndex: number;
  correlationStats: ActivityCorrelation[];
}

export const COMPLEMENTARY_EXERCISES: PhysicalExercise[] = [
  {
    id: "ex_squat",
    name: "Squats de Puissance",
    category: "strength",
    difficulty: "Intermediate",
    reps: "3 séries de 12",
    durationText: "4 minutes",
    kegelBenefit: "Renforce les grands fessiers et les rotateurs externes des hanches pour stabiliser le bassin et soutenir la base d'ancrage pelvienne.",
    instructions: [
      "Tenez-vous debout, les pieds légèrement plus larges que la largeur des épaules.",
      "Descendez en poussant vos fessiers vers l'arrière comme pour vous asseoir sur une chaise.",
      "Gardez les genoux alignés avec vos orteils et le dos bien droit.",
      "Poussez sur vos talons pour remonter à la position de départ tout en contractant le plancher pelvien."
    ],
    animationColor: "from-[#FF416C] to-[#FF4B2B]"
  },
  {
    id: "ex_bridge",
    name: "Glute Bridges (Pont fessier)",
    category: "strength",
    difficulty: "Beginner",
    reps: "3 séries de 15",
    durationText: "3 minutes",
    kegelBenefit: "Permet une activation synergique maximale du muscle PC en déchargeant l'effet de la gravité sur le bassin.",
    instructions: [
      "Allongez-vous sur le dos, les genoux pliés, les pieds à plat sur le sol à la largeur des hanches.",
      "Soulevez vos hanches en contractant fessiers et abdominaux jusqu'à aligner cuisses et tronc.",
      "Maintenez la position haute pendant 2 secondes tout en effectuant une contraction Kegel.",
      "Redescendez lentement sans poser totalement les fessiers au sol."
    ],
    animationColor: "from-[#00B0FF] to-[#00E676]"
  },
  {
    id: "ex_plank",
    name: "Planche Isométrique active",
    category: "strength",
    difficulty: "Intermediate",
    reps: "3 séries de 45 secondes",
    durationText: "5 minutes",
    kegelBenefit: "Travaille la synergie du caisson abdominal profond (transverse) avec le plancher pelvien.",
    instructions: [
      "Placez-vous en appui sur les avant-bras et la pointe des pieds.",
      "Maintenez votre bassin neutre pour former une ligne droite de la tête aux talons.",
      "Rentrez légèrement le nombril tout en expirant lentement et en serrant votre plancher pelvien.",
      "Ne bloquez jamais votre respiration."
    ],
    animationColor: "from-[#8A2387] to-[#E94057]"
  },
  {
    id: "ex_superman",
    name: "Superman Pelvien",
    category: "strength",
    difficulty: "Advanced",
    reps: "3 séries de 10",
    durationText: "3 minutes",
    kegelBenefit: "Sollicite la chaîne postérieure et la cambrure contrôlée pour décharger la pression de la vessie.",
    instructions: [
      "Allongez-vous sur le ventre, les bras tendus vers l'avant.",
      "Soulevez simultanément les bras, la poitrine et les jambes du sol.",
      "Contractez votre plancher pelvien au sommet de l'arc de tension.",
      "Redescendez doucement et relâchez le plancher pelvien (Reverse Kegel)."
    ],
    animationColor: "from-[#F27121] to-[#E94057]"
  },
  {
    id: "ex_bird_dog",
    name: "Bird-Dog de Stabilité",
    category: "posture",
    difficulty: "Beginner",
    reps: "2 séries de 10 par côté",
    durationText: "4 minutes",
    kegelBenefit: "Améliore l'équilibre lombo-pelvien et la coordination neuro-musculaire bilatérale.",
    instructions: [
      "Positionnez-vous à quatre pattes, les mains sous les épaules et les genoux sous les hanches.",
      "Tendez le bras droit devant vous et la jambe gauche vers l'arrière.",
      "Gardez le dos stable sans cambrer. Contractez le plancher pelvien lors de l'extension.",
      "Revenez en position de départ et changez de côté."
    ],
    animationColor: "from-[#11998e] to-[#38ef7d]"
  },
  {
    id: "ex_deep_squat",
    name: "Deep Squats passifs (Squat Yogi)",
    category: "mobility",
    difficulty: "Beginner",
    reps: "Maintenir 2 minutes",
    durationText: "2 minutes",
    kegelBenefit: "Étire et détend activement le plancher pelvien. Essentiel pour soulager l'hypertonicité (Reverse Kegel).",
    instructions: [
      "Descendez dans un squat très profond, les fessiers près du sol.",
      "Placez vos coudes à l'intérieur de vos genoux pour presser doucement vers l'extérieur.",
      "Respirez profondément en imaginant votre plancher pelvien s'ouvrir et se détendre à l'inspiration."
    ],
    animationColor: "from-[#FFD700] to-[#F27121]"
  }
];

export const HIP_STRETCHES: { name: string; description: string; durationSec: number }[] = [
  { name: "Posture du Pigeon (Côté Gauche)", description: "Ouvre le piriforme gauche et libère le nerf honteux (pudendal).", durationSec: 30 },
  { name: "Posture du Pigeon (Côté Droit)", description: "Ouvre le piriforme droit et libère le nerf honteux (pudendal).", durationSec: 30 },
  { name: "Étreinte de genoux papillon", description: "Allongé sur le dos, joignez vos pieds pour détendre les adducteurs.", durationSec: 30 },
  { name: "Flexion avant grand écart assis", description: "Basculez le bassin vers l'avant pour étirer les ischio-jambiers internes.", durationSec: 30 },
  { name: "Pose de l'Enfant (Child's Pose)", description: "Détend la colonne lombaire et ouvre tout l'arrière du plancher pelvien.", durationSec: 30 }
];

export const CORRELATIONS: ActivityCorrelation[] = [
  {
    factor: "Squats + Kegel combinés",
    impactPercent: 25,
    impactTrend: "up",
    description: "L'activation simultanée des fessiers déverrouille l'afflux sanguin et augmente la puissance de pointe mesurée."
  },
  {
    factor: "Sommeil de mauvaise qualité (< 6h)",
    impactPercent: 15,
    impactTrend: "down",
    description: "La fatigue du système nerveux central réduit de 15% le temps maximal de tenue isométrique."
  },
  {
    factor: "Taux de stress élevé",
    impactPercent: 20,
    impactTrend: "down",
    description: "L'excès de cortisol provoque des micro-spasmes pelviens involontaires et une chute de l'endurance globale."
  }
];

const STORAGE_KEY = "alphaman_physical_integration_state";

const defaultState: PhysicalState = {
  completedTodayIds: [],
  postureRemindersEnabled: true,
  hipMobilityTimerActive: false,
  activeHipStretchIndex: 0,
  correlationStats: CORRELATIONS
};

export const physicalService = {
  getState(): PhysicalState {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error("Failed to load physical integration state", e);
    }
    this.saveState(defaultState);
    return defaultState;
  },

  saveState(state: PhysicalState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      window.dispatchEvent(new Event('alphaman_physical_updated'));
    } catch (e) {
      console.error("Failed to save physical state", e);
    }
  },

  toggleCompleteExercise(id: string): void {
    const state = this.getState();
    if (state.completedTodayIds.includes(id)) {
      state.completedTodayIds = state.completedTodayIds.filter(x => x !== id);
    } else {
      state.completedTodayIds.push(id);
    }
    this.saveState(state);
  },

  togglePostureReminders(): void {
    const state = this.getState();
    state.postureRemindersEnabled = !state.postureRemindersEnabled;
    this.saveState(state);
  },

  setActiveStretch(idx: number): void {
    const state = this.getState();
    state.activeHipStretchIndex = idx;
    this.saveState(state);
  }
};
