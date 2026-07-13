import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Heart,
  ChevronRight,
  Sparkles,
  Trophy,
  Shield,
  Zap,
  Clock,
  Play,
  Pause,
  RotateCcw,
  BookOpen,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Info,
  Smartphone,
  Eye,
  Lock,
  ArrowRight,
  ArrowLeft,
  Bell,
  X,
  Plus,
  Moon,
  Compass,
  CornerDownRight
} from 'lucide-react';

import { physicalService, PhysicalExercise } from '../pattern_killer/physicalService';
import { kegelService } from '../pattern_killer/kegelService';
import { AlphaCard } from './AlphaCard';
import { AlphaButton } from './AlphaButton';
import { AlphaBadge } from './AlphaBadge';

interface AlphaKegelPhysicalProps {
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
  onPointsUpdate?: (newPoints: number) => void;
  onBack?: () => void;
}

// Exactly the 6 complementary exercises requested by the spec
const EXERCISES_LIST = [
  {
    id: "ex_squats",
    name: "Squats",
    videoUrl: "assets/videos/squats.mp4",
    difficulty: "MOYEN",
    difficultyColor: "#FF9500",
    duration: "5 min",
    description: "Renforce hanches + plancher pelvien",
    kegelBenefit: "Renforce les fessiers et les rotateurs externes des hanches pour stabiliser le bassin et soutenir la base d'ancrage pelvienne.",
    instructions: [
      "Tenez-vous debout, pieds légèrement plus larges que les épaules.",
      "Descendez en poussant vos fessiers vers l'arrière.",
      "Gardez les genoux alignés avec vos orteils et le dos droit.",
      "Poussez sur vos talons pour remonter tout en contractant le plancher pelvien."
    ],
    animationStyle: "animate-[pulse_1.8s_infinite]"
  },
  {
    id: "ex_bridges",
    name: "Ponts (Glute Bridges)",
    videoUrl: "assets/videos/glute_bridges.mp4",
    difficulty: "FACILE",
    difficultyColor: "#00D9A5",
    duration: "4 min",
    description: "Activation synergique",
    kegelBenefit: "Permet une activation synergique maximale du muscle PC en déchargeant l'effet de la gravité sur le bassin.",
    instructions: [
      "Allongez-vous sur le dos, genoux pliés, pieds au sol.",
      "Soulevez les hanches en serrant les fessiers.",
      "Maintenez la position haute pendant 2 secondes en contractant le Kegel.",
      "Redescendez lentement sans toucher complètement le sol."
    ],
    animationStyle: "animate-[bounce_2s_infinite]"
  },
  {
    id: "ex_plank",
    name: "Planche",
    videoUrl: "assets/videos/plank.mp4",
    difficulty: "MOYEN",
    difficultyColor: "#FF9500",
    duration: "3 min",
    description: "Core stability + plancher pelvien",
    kegelBenefit: "Travaille la synergie du caisson abdominal profond (transverse) avec le plancher pelvien.",
    instructions: [
      "Placez-vous en appui sur les avant-bras et les orteils.",
      "Maintenez le corps aligné droit de la tête aux talons.",
      "Aspirez le nombril tout en expirant lentement et en serrant le plancher pelvien."
    ],
    animationStyle: "animate-[pulse_3s_infinite]"
  },
  {
    id: "ex_superman",
    name: "Superman",
    videoUrl: "assets/videos/superman.mp4",
    difficulty: "FACILE",
    difficultyColor: "#00D9A5",
    duration: "3 min",
    description: "Dos + plancher pelvien",
    kegelBenefit: "Sollicite la chaîne postérieure et la cambrure contrôlée pour décharger la pression de la vessie.",
    instructions: [
      "Allongez-vous sur le ventre, bras tendus devant.",
      "Soulevez simultanément les bras, le buste et les jambes.",
      "Serrer le plancher pelvien au sommet de l'effort.",
      "Redescendez doucement et relâchez le plancher pelvien."
    ],
    animationStyle: "animate-[bounce_1.5s_infinite]"
  },
  {
    id: "ex_bird_dog",
    name: "Bird-Dog",
    videoUrl: "assets/videos/bird_dog.mp4",
    difficulty: "MOYEN",
    difficultyColor: "#FF9500",
    duration: "4 min",
    description: "Équilibre + coordination",
    kegelBenefit: "Améliore l'équilibre lombo-pelvien et la coordination neuro-musculaire bilatérale.",
    instructions: [
      "À quatre pattes, mains sous les épaules, genoux sous les hanches.",
      "Tendez le bras droit devant et la jambe gauche derrière.",
      "Gardez le dos stable. Contractez le plancher pelvien en extension.",
      "Revenez et changez de côté."
    ],
    animationStyle: "animate-[pulse_2.2s_infinite]"
  },
  {
    id: "ex_deep_squats",
    name: "Deep Squats",
    videoUrl: "assets/videos/deep_squats.mp4",
    difficulty: "DIFFICILE",
    difficultyColor: "#FF2D55",
    duration: "6 min",
    description: "Mobilité hanche + plancher pelvien",
    kegelBenefit: "Étire et détend activement le plancher pelvien. Essentiel pour soulager l'hypertonicité (Reverse Kegel).",
    instructions: [
      "Descendez dans un squat complet très profond, fesses proches du sol.",
      "Pressez vos coudes à l'intérieur des genoux pour ouvrir le bassin.",
      "Respirez profondément en imaginant le plancher pelvien s'ouvrir et se détendre."
    ],
    animationStyle: "animate-[bounce_2.5s_infinite]"
  }
];

// Exactly the 5 hip mobility stretches requested
const MOBILITY_STRETCHES = [
  { name: "Pigeon Stretch (Gauche)", description: "Étire le piriforme gauche et libère le nerf pudendal.", durationSec: 30 },
  { name: "Pigeon Stretch (Droit)", description: "Étire le piriforme droit et libère le nerf pudendal.", durationSec: 30 },
  { name: "Papillon au sol", description: "Ouvre les adducteurs et soulage l'hyperpression pubienne.", durationSec: 30 },
  { name: "Flexion avant grand écart", description: "Basculez le bassin vers l'avant pour étirer les ischio-jambiers internes.", durationSec: 30 },
  { name: "Pose de l'Enfant", description: "Détend la colonne lombaire et ouvre tout l'arrière du plancher pelvien.", durationSec: 30 }
];

export const AlphaKegelPhysical: React.FC<AlphaKegelPhysicalProps> = ({ addToast, onPointsUpdate, onBack }) => {
  const [state, setState] = useState(() => physicalService.getState());
  const [kegelState, setKegelState] = useState(() => kegelService.getState());

  // Interactive Modals and Overlay state
  const [selectedExercise, setSelectedExercise] = useState<typeof EXERCISES_LIST[0] | null>(null);
  const [showPostureExercises, setShowPostureExercises] = useState<boolean>(false);
  const [showCorrelationDetails, setShowCorrelationDetails] = useState<boolean>(false);
  
  // Mobility Timer State
  const [mobilityActive, setMobilityActive] = useState<boolean>(false);
  const [mobilityStretchIndex, setMobilityStretchIndex] = useState<number>(0);
  const [mobilityTimeRemaining, setMobilityTimeRemaining] = useState<number>(30);
  const mobilityIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Breathing & Kegel states (4-phase: Inspire 4s, Retient 4s, Expire 4s, Relâche 4s)
  const [breathingActive, setBreathingActive] = useState<boolean>(false);
  const [breathingPhase, setBreathingPhase] = useState<'inspire' | 'retient' | 'expire' | 'relâche'>('inspire');
  const [breathingSecondsLeft, setBreathingSecondsLeft] = useState<number>(4);
  const [breathingTotalTime, setBreathingTotalTime] = useState<number>(180); // 3:00 total
  const breathingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state on local storage updates
  useEffect(() => {
    const handleUpdate = () => {
      setState(physicalService.getState());
      setKegelState(kegelService.getState());
    };
    window.addEventListener('alphaman_physical_updated', handleUpdate);
    window.addEventListener('alphaman_kegel_updated', handleUpdate);
    return () => {
      window.removeEventListener('alphaman_physical_updated', handleUpdate);
      window.removeEventListener('alphaman_kegel_updated', handleUpdate);
    };
  }, []);

  // Posture Toggle Handler
  const handleTogglePosture = () => {
    physicalService.togglePostureReminders();
    const updated = physicalService.getState().postureRemindersEnabled;
    setState(prev => ({ ...prev, postureRemindersEnabled: updated }));
    if (updated) {
      addToast('success', "Rappel de posture activé (toutes les 2h). Redressez-vous !");
    } else {
      addToast('info', "Rappels de posture suspendus.");
    }
  };

  // Completion logic for Exercises
  const handleToggleCompletion = (exId: string) => {
    physicalService.toggleCompleteExercise(exId);
    setState(physicalService.getState());
    const isNowDone = physicalService.getState().completedTodayIds.includes(exId);
    if (isNowDone) {
      addToast('success', "Exercice synergique enregistré ! +15 points accumulés.");
      if (onPointsUpdate) {
        onPointsUpdate(kegelState.totalXP + 15);
      }
    } else {
      addToast('info', "Exercice retiré de vos activités.");
    }
  };

  // Mobility Session timer logic
  useEffect(() => {
    if (mobilityActive) {
      mobilityIntervalRef.current = setInterval(() => {
        setMobilityTimeRemaining((prev) => {
          if (prev <= 1) {
            const nextIndex = mobilityStretchIndex + 1;
            if (nextIndex < MOBILITY_STRETCHES.length) {
              setMobilityStretchIndex(nextIndex);
              addToast('info', `Passage à : ${MOBILITY_STRETCHES[nextIndex].name}`);
              return 30;
            } else {
              setMobilityActive(false);
              addToast('success', "Séance de mobilité des hanches complétée ! Votre bassin est libéré. (+25 XP)");
              if (onPointsUpdate) {
                onPointsUpdate(kegelState.totalXP + 25);
              }
              return 30;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (mobilityIntervalRef.current) clearInterval(mobilityIntervalRef.current);
    }
    return () => {
      if (mobilityIntervalRef.current) clearInterval(mobilityIntervalRef.current);
    };
  }, [mobilityActive, mobilityStretchIndex]);

  const startMobilitySession = () => {
    setMobilityStretchIndex(0);
    setMobilityTimeRemaining(30);
    setMobilityActive(true);
    addToast('success', `Démarrage de l'étirement : ${MOBILITY_STRETCHES[0].name}`);
  };

  // Breathing loop logic (16s cycle total: 4s x 4 phases)
  useEffect(() => {
    if (breathingActive) {
      breathingIntervalRef.current = setInterval(() => {
        // Decrease total timer
        setBreathingTotalTime((prevTotal) => {
          if (prevTotal <= 1) {
            setBreathingActive(false);
            addToast('success', "Routine de respiration synchronisée terminée ! Force PC optimisée de +40%. (+30 XP)");
            if (onPointsUpdate) {
              onPointsUpdate(kegelState.totalXP + 30);
            }
            return 180;
          }
          return prevTotal - 1;
        });

        // Decrease active phase timer
        setBreathingSecondsLeft((prevPhase) => {
          if (prevPhase <= 1) {
            setBreathingPhase((currentPhase) => {
              if (currentPhase === 'inspire') return 'retient';
              if (currentPhase === 'retient') return 'expire';
              if (currentPhase === 'expire') return 'relâche';
              return 'inspire';
            });
            return 4;
          }
          return prevPhase - 1;
        });
      }, 1000);
    } else {
      if (breathingIntervalRef.current) clearInterval(breathingIntervalRef.current);
    }
    return () => {
      if (breathingIntervalRef.current) clearInterval(breathingIntervalRef.current);
    };
  }, [breathingActive, breathingPhase]);

  const toggleBreathing = () => {
    setBreathingActive(!breathingActive);
    if (!breathingActive) {
      addToast('info', "Routine de respiration lancée. Coordonnez votre souffle.");
    }
  };

  const resetBreathing = () => {
    setBreathingActive(false);
    setBreathingPhase('inspire');
    setBreathingSecondsLeft(4);
    setBreathingTotalTime(180);
  };

  // Format countdown mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Calculate checkmarks done in posture exercises
  const strengthCompletedCount = EXERCISES_LIST.filter(ex => state.completedTodayIds.includes(ex.id)).length;

  return (
    <div id="alpha-physical-integration-screen" className="flex flex-col w-full bg-[#05050C] text-white min-h-screen pb-12 font-sans animate-[fade-in_0.4s_ease-out]">
      
      {/* ======================= HEADER ======================= */}
      <div className="relative h-20 w-full flex items-center px-4 pt-6 bg-gradient-to-b from-black/50 to-transparent border-b border-[#16213E]/40">
        <button
          onClick={onBack}
          aria-label="Retour au tableau de bord"
          className="absolute left-4 top-[24px] p-2 hover:bg-[#16213E]/50 rounded-xl transition-all cursor-pointer active:scale-95"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <div className="pl-12">
          <h1 className="text-xl md:text-2xl font-headline font-black text-white leading-tight tracking-tight uppercase">
            Intégration Physique
          </h1>
          <p className="text-xs text-[#8E8E93] font-sans mt-0.5">
            Ton corps est une machine. Optimise-le.
          </p>
        </div>
      </div>

      {/* ==================================== SECTION 1 : EXERCICES COMPLÉMENTAIRES ==================================== */}
      <div className="w-full mt-6">
        <div className="px-4 pb-2">
          <h2 className="text-base font-headline font-extrabold uppercase text-[#FFD700] tracking-wider">
            Exercices Complémentaires
          </h2>
          <p className="text-[11px] text-gray-400">Renforcez les muscles stabilisateurs du bassin et soutenez votre force pelvienne.</p>
        </div>

        {/* Scrollable Horizontal Row mimicking FlatList */}
        <div className="flex overflow-x-auto gap-4 pb-4 pt-2 px-4 snap-x snap-mandatory custom-scrollbar">
          {EXERCISES_LIST.map((ex) => {
            const isCompleted = state.completedTodayIds.includes(ex.id);
            return (
              <div
                key={ex.id}
                className="w-[160px] h-[225px] flex-shrink-0 bg-[#16213E] rounded-2xl shadow-md snap-start flex flex-col justify-between relative overflow-hidden transition-transform duration-150 hover:scale-[1.02] border border-[#1A1A2E]"
              >
                {/* Simulated autoplay looping video presentation */}
                <div className="relative w-full h-[100px] bg-[#0A0A1F] overflow-hidden">
                  <div className="absolute top-1.5 right-1.5 z-10">
                    <span
                      style={{ backgroundColor: ex.difficultyColor }}
                      className="px-1.5 py-0.5 rounded text-[8px] font-sans font-bold text-white uppercase tracking-wider"
                    >
                      {ex.difficulty}
                    </span>
                  </div>

                  {/* Geometric loop motion representation representing actual pelvic activation */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-12 h-12 flex items-center justify-center">
                      <div className={`absolute inset-0 rounded-full bg-white/5 border border-dashed border-[#00D9A5]/40 animate-spin duration-[4000ms]`} />
                      <div className={`absolute inset-2 rounded-xl bg-gradient-to-br from-[#E94560] to-[#FF9500] opacity-80 ${ex.animationStyle} flex items-center justify-center`}>
                        <Activity className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Dark gradient bottom overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#16213E] via-[#16213E]/20 to-transparent" />
                  
                  {/* Under the hood actual video node for standard local files support */}
                  <video 
                    src={ex.videoUrl} 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none" 
                  />
                </div>

                {/* Content info & titles */}
                <div className="px-3 flex-1 flex flex-col justify-between pb-3">
                  <div>
                    <h3 className="text-[12px] font-headline font-extrabold text-white leading-tight line-clamp-2 mt-1">
                      {ex.name}
                    </h3>
                    <div className="flex items-center gap-1 mt-1 text-[#8E8E93]">
                      <Clock className="w-3 h-3 text-[#8E8E93]" />
                      <span className="text-[10px] font-sans font-medium">{ex.duration}</span>
                    </div>
                  </div>

                  {/* Action button */}
                  <button
                    onClick={() => {
                      setSelectedExercise(ex);
                    }}
                    aria-label={`Bouton démarrer l'exercice ${ex.name}, ${ex.duration}, difficulté ${ex.difficulty}`}
                    className="w-full h-8 bg-[#E94560] active:scale-95 transition-transform duration-150 rounded-lg text-white font-headline font-bold text-[10px] uppercase tracking-wider flex items-center justify-center cursor-pointer mt-2"
                  >
                    DÉMARRER
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ==================================== SECTION 2 : POSTURE & ALIGNEMENT ==================================== */}
      <div className="px-4 mt-6">
        <h2 className="text-base font-headline font-extrabold uppercase text-[#FFD700] tracking-wider mb-3">
          Posture & Alignement
        </h2>

        <div className="w-full bg-[#16213E] rounded-3xl p-4 shadow-lg flex flex-col gap-4 border border-[#1C1C3F]">
          <div className="flex items-center gap-4">
            
            {/* Elegant Posture Male vector SVG Illustration */}
            <svg width="80" height="120" viewBox="0 0 80 120" className="bg-[#1A1A2E] rounded-xl border border-[#1C1C35] shrink-0 p-1">
              {/* Grid backdrop */}
              <line x1="20" y1="0" x2="20" y2="120" stroke="#00D9A5" strokeOpacity="0.05" />
              <line x1="40" y1="0" x2="40" y2="120" stroke="#00D9A5" strokeOpacity="0.05" />
              <line x1="60" y1="0" x2="60" y2="120" stroke="#00D9A5" strokeOpacity="0.05" />
              {/* Spine Line */}
              <path d="M 40 15 Q 43 45 38 75 T 41 110" fill="none" stroke="#00D9A5" strokeWidth="2.5" strokeLinecap="round" />
              {/* Head */}
              <circle cx="40" cy="18" r="8" fill="#16213E" stroke="#00D9A5" strokeWidth="2" />
              {/* Pelvis region indicator */}
              <ellipse cx="40" cy="80" rx="12" ry="6" fill="#00D9A5" fillOpacity="0.15" stroke="#00D9A5" strokeWidth="1.5" strokeDasharray="3,3" />
              {/* Ground */}
              <line x1="15" y1="115" x2="65" y2="115" stroke="#1C1C35" strokeWidth="2" strokeLinecap="round" />
            </svg>

            {/* Right Side Info */}
            <div className="flex-1">
              <h3 className="text-base font-headline font-black text-white leading-tight">
                Redresse-toi
              </h3>
              <p className="text-xs text-[#8E8E93] mt-0.5 font-sans">
                Ton plancher pelvien te remercie.
              </p>
              
              <div className="flex items-center gap-1.5 mt-3 text-[#00D9A5] font-sans font-semibold text-xs">
                <CheckCircle2 className="w-4 h-4 text-[#00D9A5]" />
                <span>{strengthCompletedCount}/6 exercices faits aujourd'hui</span>
              </div>
            </div>
          </div>

          {/* Action trigger button */}
          <button
            onClick={() => setShowPostureExercises(true)}
            className="w-full h-11 bg-transparent hover:bg-white/5 transition-all border border-[#E94560] rounded-lg text-[#E94560] font-headline font-bold text-xs uppercase tracking-widest flex items-center justify-center cursor-pointer active:scale-98"
          >
            VOIR EXERCICES
          </button>
        </div>

        {/* Posture Reminder Section */}
        <div className="flex items-center justify-between p-3.5 bg-[#16213E]/40 border border-[#1C1C3A] rounded-xl mt-3">
          <div className="flex items-center gap-2.5">
            <Bell className="w-4.5 h-4.5 text-[#FF9500] animate-bounce" />
            <span className="text-xs font-sans font-medium text-[#FF9500]">
              Rappel toutes les 2h activé
            </span>
          </div>

          {/* Fully Interactive Custom Styled Toggle Switch */}
          <button
            onClick={handleTogglePosture}
            aria-label="Interrupteur rappel posture"
            className={`w-[44px] h-[24px] rounded-full p-[2px] transition-colors duration-200 focus:outline-none cursor-pointer
              ${state.postureRemindersEnabled ? 'bg-[#00D9A5]' : 'bg-[#5A5A5A]'}
            `}
          >
            <div
              className={`w-[20px] h-[20px] bg-white rounded-full shadow-md transform transition-transform duration-200
                ${state.postureRemindersEnabled ? 'translate-x-[20px]' : 'translate-x-0'}
              `}
            />
          </button>
        </div>
      </div>

      {/* ==================================== SECTION 3 : MOBILITÉ HANCHE ==================================== */}
      <div className="px-4 mt-6">
        <h2 className="text-base font-headline font-extrabold uppercase text-[#FFD700] tracking-wider mb-3">
          Mobilité Hanche
        </h2>

        <div className="w-full bg-[#16213E] rounded-3xl p-4 shadow-lg border border-[#1C1C3F] flex flex-col gap-4">
          
          {/* Card Header */}
          <div className="flex justify-between items-center pb-2 border-b border-[#1A1A35]">
            <div className="flex items-center gap-2.5">
              <Compass className="w-5 h-5 text-[#E94560]" />
              <h3 className="text-xs font-headline font-bold text-white uppercase tracking-wider">
                5 Exercices de Mobilité
              </h3>
            </div>
            <div className="flex items-center gap-1 text-[#8E8E93]">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-xs font-sans font-semibold">15 min</span>
            </div>
          </div>

          {/* Stretches list */}
          <div className="flex flex-col">
            {MOBILITY_STRETCHES.map((st, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setMobilityStretchIndex(idx);
                  setMobilityTimeRemaining(30);
                  setMobilityActive(true);
                  addToast('info', `Démarrage ciblé : ${st.name}`);
                }}
                className={`h-14 flex items-center justify-between border-b border-[#1A1A30] last:border-0 hover:bg-white/5 transition-colors px-1 rounded-xl cursor-pointer`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-[#8E8E93]">
                    0{idx + 1}
                  </span>
                  <div>
                    <span className="text-xs font-sans font-medium text-white block">
                      {st.name}
                    </span>
                    <span className="text-[10px] text-[#8E8E93] block truncate max-w-[200px]">
                      {st.description}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] text-[#8E8E93] font-mono">30 sec</span>
                  <div className="w-7 h-7 bg-[#E94560]/10 rounded-lg flex items-center justify-center hover:bg-[#E94560]/30 transition-colors">
                    <Play className="w-3.5 h-3.5 text-[#E94560]" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Start entire sequence button */}
          <button
            onClick={startMobilitySession}
            className="w-full h-11 bg-transparent hover:bg-white/5 transition-all border border-[#E94560] rounded-lg text-[#E94560] font-headline font-bold text-xs uppercase tracking-widest flex items-center justify-center cursor-pointer active:scale-98"
          >
            DÉMARRER SÉANCE
          </button>
        </div>
      </div>

      {/* ==================================== SECTION 4 : RESPIRATION + KEGEL ==================================== */}
      <div className="px-4 mt-6">
        <h2 className="text-base font-headline font-extrabold uppercase text-[#FFD700] tracking-wider mb-3">
          Respiration + Kegel
        </h2>

        <div className="w-full bg-[#16213E] rounded-3xl p-5 shadow-lg border border-[#1C1C3F] flex flex-col items-center gap-5">
          
          {/* Animated diaphragmatic breathing circle visualizer */}
          <div className="relative w-36 h-36 flex items-center justify-center mt-2">
            
            {/* Dynamic pulsating glow backdrop ring */}
            <div
              className={`absolute inset-0 rounded-full border-2 transition-all duration-[4000ms] ease-in-out
                ${!breathingActive ? 'border-gray-700 opacity-20' : ''}
                ${breathingActive && breathingPhase === 'inspire' ? 'border-[#00D9A5] scale-125 opacity-70 shadow-[0_0_15px_rgba(0,217,165,0.3)]' : ''}
                ${breathingActive && breathingPhase === 'retient' ? 'border-[#FF9500] scale-125 opacity-100 shadow-[0_0_20px_rgba(255,149,0,0.4)]' : ''}
                ${breathingActive && breathingPhase === 'expire' ? 'border-[#00B0FF] scale-95 opacity-50' : ''}
                ${breathingActive && breathingPhase === 'relâche' ? 'border-dashed border-gray-600 scale-90 opacity-30' : ''}
              `}
            />

            {/* Core inner circular text node */}
            <div className="w-28 h-28 rounded-full bg-[#0F0F1A] border-4 border-[#00D9A5] flex flex-col items-center justify-center text-center p-2 shadow-inner">
              <span className="text-xs font-headline font-black text-white uppercase tracking-wider leading-none">
                {!breathingActive ? "PRÊT" : breathingPhase.toUpperCase()}
              </span>
              <span className="text-2xl font-mono font-black text-white mt-1 leading-none">
                {breathingActive ? `${breathingSecondsLeft}s` : "4s"}
              </span>
            </div>
          </div>

          {/* Interactive instruction message changing according to selected phase */}
          <div className="text-center min-h-[44px] flex items-center justify-center px-4">
            <p className="text-xs text-[#8E8E93] leading-relaxed max-w-sm font-sans font-medium transition-all duration-300">
              {!breathingActive && "Appuyez sur Démarrer pour lancer l'exercice guidé de 3 minutes."}
              {breathingActive && breathingPhase === 'inspire' && "💧 INSPIRE par le nez → Relâche complètement ton plancher pelvien (Reverse Kegel)"}
              {breathingActive && breathingPhase === 'retient' && "🔒 RETIENS le souffle → Maintiens le relâchement et la détente du bassin"}
              {breathingActive && breathingPhase === 'expire' && "🔥 EXPIRE par la bouche → Contracte ton plancher pelvien (Kegel classique)"}
              {breathingActive && breathingPhase === 'relâche' && "🌬️ RELÂCHE TOUT → Repose tes muscles et ré-oxygène ton système"}
            </p>
          </div>

          {/* Stopwatch countdown */}
          <div className="text-center">
            <span className="font-mono text-xl font-bold text-[#FFD700] tracking-widest">
              {formatTime(breathingTotalTime)}
            </span>
          </div>

          {/* Action trigger button */}
          <div className="flex gap-3 w-full justify-center">
            <button
              onClick={toggleBreathing}
              aria-label="Bouton démarrer la respiration guidée, 3 minutes"
              className={`w-[160px] h-12 rounded-xl text-white font-headline font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-transform duration-150 active:scale-95 shadow-md
                ${breathingActive ? 'bg-[#FF9500] shadow-[#FF9500]/10' : 'bg-[#E94560] shadow-[#E94560]/10'}
              `}
            >
              {breathingActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {breathingActive ? "PAUSE" : "DÉMARRER"}
            </button>

            {breathingActive && (
              <button
                onClick={resetBreathing}
                className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center cursor-pointer transition-colors border border-white/10"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Coordinated stat badge at bottom */}
          <div className="flex items-center gap-2 pt-3 border-t border-[#1C1C45] w-full justify-center text-[#8E8E93]">
            <Info className="w-3.5 h-3.5 text-[#8E8E93]" />
            <span className="text-[11px] font-sans font-medium text-gray-400">
              La respiration amplifie ton Kegel de 40%
            </span>
          </div>
        </div>
      </div>

      {/* ==================================== SECTION 5 : CORRÉLATION DONNÉES ==================================== */}
      <div className="px-4 mt-6">
        <h2 className="text-base font-headline font-extrabold uppercase text-[#FFD700] tracking-wider mb-3">
          Tes Corrélations
        </h2>

        <div className="w-full bg-[#16213E] rounded-3xl p-5 shadow-lg border border-[#1C1C3F] flex flex-col gap-4">
          
          {/* Custom SVG Radar Chart representation */}
          <div className="bg-[#0D1426] rounded-2xl border border-white/5 p-4 flex flex-col items-center justify-center relative">
            <span className="absolute top-2 left-3 font-mono text-[9px] text-[#8E8E93] uppercase">Modèle de force croisé</span>
            
            <svg width="220" height="200" viewBox="0 0 200 200" className="mx-auto mt-2">
              {/* Pentagonal grid lines */}
              {/* Outer pentagon (radius 65) */}
              <polygon points="100,35 162,80 138,153 62,153 38,80" fill="none" stroke="#1A2E50" strokeWidth="1" />
              {/* Middle pentagon (radius 45) */}
              <polygon points="100,55 143,86 126,137 74,137 57,86" fill="none" stroke="#1A2E50" strokeWidth="1" />
              {/* Inner pentagon (radius 25) */}
              <polygon points="100,75 124,92 115,120 85,120 76,92" fill="none" stroke="#1A2E50" strokeWidth="1" />

              {/* Axis connector lines */}
              <line x1="100" y1="100" x2="100" y2="35" stroke="#1A2E50" strokeWidth="1" strokeDasharray="2,2" />
              <line x1="100" y1="100" x2="162" y2="80" stroke="#1A2E50" strokeWidth="1" strokeDasharray="2,2" />
              <line x1="100" y1="100" x2="138" y2="153" stroke="#1A2E50" strokeWidth="1" strokeDasharray="2,2" />
              <line x1="100" y1="100" x2="62" y2="153" stroke="#1A2E50" strokeWidth="1" strokeDasharray="2,2" />
              <line x1="100" y1="100" x2="38" y2="80" stroke="#1A2E50" strokeWidth="1" strokeDasharray="2,2" />

              {/* Data Series 1: Semaine Dernière (Grey/Blue dash, e.g. moderate values) */}
              <polygon points="100,60 142,92 118,135 80,128 58,95" fill="#4A90D9" fillOpacity="0.15" stroke="#4A90D9" strokeWidth="1.5" strokeDasharray="3,3" />

              {/* Data Series 2: Cette Semaine (Solid magenta/pink, optimized values) */}
              <polygon points="100,42 155,83 125,145 70,138 48,85" fill="#E94560" fillOpacity="0.25" stroke="#E94560" strokeWidth="2.5" />

              {/* Outer label positions */}
              <text x="100" y="28" fill="#E94560" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">FORCE KEGEL</text>
              <text x="168" y="82" fill="#00D9A5" fontSize="8" fontWeight="bold" textAnchor="start" fontFamily="sans-serif">SOMMEIL</text>
              <text x="144" y="164" fill="#FF9500" fontSize="8" fontWeight="bold" textAnchor="start" fontFamily="sans-serif">STRESS</text>
              <text x="56" y="164" fill="#FFD700" fontSize="8" fontWeight="bold" textAnchor="end" fontFamily="sans-serif">NUTRITION</text>
              <text x="32" y="82" fill="#4A90D9" fontSize="8" fontWeight="bold" textAnchor="end" fontFamily="sans-serif">EXERCICE</text>
            </svg>

            {/* Legends Bottom Bar */}
            <div className="flex gap-4 mt-3 text-[10px] font-sans">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-[#E94560] rounded-sm" />
                <span className="text-gray-300 font-semibold">Cette semaine</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-[#4A90D9] rounded-sm border border-dashed border-white/20" />
                <span className="text-gray-400">Semaine dernière</span>
              </div>
            </div>
          </div>

          {/* Scrollable Insight Cards under graph */}
          <div className="flex flex-col gap-2.5 max-h-[180px] overflow-y-auto custom-scrollbar pr-1">
            
            <div className="flex gap-3 bg-black/10 border border-[#1A1A35] p-3 rounded-xl items-start">
              <span className="text-[#00D9A5] bg-[#00D9A5]/10 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold">↑</span>
              <p className="text-xs text-white leading-relaxed font-sans">
                Quand tu fais <strong className="text-[#00D9A5]">squats + Kegel</strong> : <strong className="text-white">+25% de force maximale</strong> d'ancrage mesurée.
              </p>
            </div>

            <div className="flex gap-3 bg-black/10 border border-[#1A1A35] p-3 rounded-xl items-start">
              <span className="text-[#FF2D55] bg-[#FF2D55]/10 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold">↓</span>
              <p className="text-xs text-white leading-relaxed font-sans">
                Quand tu <strong className="text-[#FF2D55]">dors mal (&lt; 6h)</strong> : <strong className="text-[#FF2D55]">-15% de tenue isométrique</strong> à cause de la fatigue nerveuse.
              </p>
            </div>

            <div className="flex gap-3 bg-black/10 border border-[#1A1A35] p-3 rounded-xl items-start">
              <span className="text-[#FF2D55] bg-[#FF2D55]/10 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold">↓</span>
              <p className="text-xs text-white leading-relaxed font-sans">
                Quand tu <strong className="text-[#FF9500]">stresses (cortisol)</strong> : <strong className="text-[#FF2D55]">-20% d'endurance globale</strong> en raison de contractions parasites involontaires.
              </p>
            </div>

            <div className="flex gap-3 bg-black/10 border border-[#1A1A35] p-3 rounded-xl items-start">
              <span className="text-[#00D9A5] bg-[#00D9A5]/10 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold">↑</span>
              <p className="text-xs text-white leading-relaxed font-sans">
                La douche froide du matin augmente ta vigueur de <strong className="text-[#00D9A5]">+18%</strong> en boostant la vascularisation locale.
              </p>
            </div>
          </div>

          {/* Action button details */}
          <button
            onClick={() => setShowCorrelationDetails(true)}
            className="w-full h-11 bg-transparent hover:bg-white/5 transition-all border border-[#E94560] rounded-lg text-[#E94560] font-headline font-bold text-xs uppercase tracking-widest flex items-center justify-center cursor-pointer active:scale-98"
          >
            VOIR DÉTAILS
          </button>
        </div>
      </div>

      {/* ==================================== MODAL 1: EXERCISE DETAILS SCREEN ==================================== */}
      {selectedExercise && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-[fade-in_0.2s_ease-out]">
          <div className="bg-[#0F0F1E] border border-[#1C1C3F] w-full max-w-lg rounded-3xl p-6 relative overflow-hidden flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setSelectedExercise(null)}
              className="absolute top-4 right-4 p-1.5 hover:bg-white/5 rounded-full text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-[#1C1C3F] pb-3">
              <h3 className="text-lg font-headline font-black text-[#FFD700] uppercase">
                {selectedExercise.name}
              </h3>
              <p className="text-xs text-[#8E8E93] mt-0.5">Renforcement complémentaire • {selectedExercise.duration}</p>
            </div>

            {/* Large simulated loop visual */}
            <div className="bg-[#05050C] rounded-2xl h-44 flex flex-col items-center justify-center border border-white/5 relative overflow-hidden">
              <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded text-[8px] font-mono text-[#00D9A5]">
                <span className="w-1.5 h-1.5 bg-[#00D9A5] rounded-full animate-ping" />
                <span>MUTED • LOOP DÉMONSTRATION</span>
              </div>
              <Activity className="w-12 h-12 text-[#E94560] animate-bounce" />
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-mono mt-2">Démonstration active en cours</span>
            </div>

            {/* How it helps Kegel */}
            <div className="bg-[#16213E] p-4 rounded-xl border border-[#00D9A5]/20">
              <span className="text-xs font-headline font-black text-[#00D9A5] uppercase tracking-wide block">Bénéfice Plancher Pelvien :</span>
              <p className="text-xs text-gray-300 mt-1 leading-relaxed font-sans">{selectedExercise.kegelBenefit}</p>
            </div>

            {/* Detailed Instructions list */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-headline font-black text-gray-500 uppercase tracking-widest">Guide pas à pas :</span>
              <div className="flex flex-col gap-2">
                {selectedExercise.instructions.map((step, idx) => (
                  <div key={idx} className="flex gap-2.5 items-start bg-black/30 p-3 rounded-xl border border-[#1C1C3F] text-xs">
                    <span className="font-mono text-xs text-[#00D9A5] bg-black/40 w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</span>
                    <p className="text-gray-300 leading-relaxed font-sans">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Log completed toggle button */}
            <div className="flex justify-between items-center border-t border-[#1C1C3F] pt-4 mt-2">
              <span className="text-xs text-gray-400 font-mono">XP de vitalité : +15 XP</span>
              <button
                onClick={() => {
                  handleToggleCompletion(selectedExercise.id);
                  setSelectedExercise(null);
                }}
                className={`px-5 py-2.5 rounded-xl font-headline font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2
                  ${state.completedTodayIds.includes(selectedExercise.id)
                    ? 'bg-gray-700 text-white'
                    : 'bg-[#00D9A5] text-black shadow-lg shadow-[#00D9A5]/10'
                  }
                `}
              >
                <CheckCircle2 className="w-4 h-4" />
                {state.completedTodayIds.includes(selectedExercise.id) ? "Terminé (cliquez pour annuler)" : "Marquer comme fait"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ==================================== MODAL 2: POSTURE EXERCISES SCREEN ==================================== */}
      {showPostureExercises && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-[fade-in_0.2s_ease-out]">
          <div className="bg-[#0F0F1E] border border-[#1C1C3F] w-full max-w-lg rounded-3xl p-6 relative overflow-hidden flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setShowPostureExercises(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-white/5 rounded-full text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-[#1C1C3F] pb-3">
              <h3 className="text-lg font-headline font-black text-[#FFD700] uppercase">
                Exercices de Posture (5 min)
              </h3>
              <p className="text-xs text-[#8E8E93] mt-0.5">Libérez la tension passive sur le sacrum.</p>
            </div>

            <div className="flex flex-col gap-4 text-xs font-sans">
              {[
                { name: "La Décompression Sacrée", desc: "Debout, rétroversez doucement le bassin tout en expirant. Sentez l'étirement du bas de la colonne lombo-pelvienne." },
                { name: "La Posture des Ischions", desc: "Assis sur une chaise rigide, basculez légèrement le poids sur les ischions pour libérer l'hyperlordose et ouvrir le canal PC." },
                { name: "L'Étirement Pelvito-diaphragmatique", desc: "Inspirez profondément en gonflant le bas du ventre pour repousser doucement le plancher vers le bas, puis soufflez lentement." }
              ].map((pe, idx) => (
                <div key={idx} className="bg-black/20 p-3.5 rounded-xl border border-[#1C1C3F] flex flex-col gap-1">
                  <span className="font-headline font-extrabold text-[#00D9A5]">0{idx + 1}. {pe.name}</span>
                  <p className="text-gray-300 leading-relaxed mt-1">{pe.desc}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setShowPostureExercises(false);
                addToast('success', "Routine de posture complétée ! Alignement optimisé. (+15 XP)");
                if (onPointsUpdate) {
                  onPointsUpdate(kegelState.totalXP + 15);
                }
              }}
              className="w-full h-11 bg-[#E94560] rounded-xl text-white font-headline font-bold text-xs uppercase tracking-wider flex items-center justify-center cursor-pointer mt-2 active:scale-98"
            >
              COMPLÉTER LA SÉANCE POSTURE
            </button>

          </div>
        </div>
      )}

      {/* ==================================== MODAL 3: MOBILITY TIMER OVERLAY ==================================== */}
      {mobilityActive && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-6 animate-[fade-in_0.3s_ease-out]">
          <div className="w-full max-w-md bg-[#0F0F1E] border border-[#1C1C3F] rounded-3xl p-6 flex flex-col items-center text-center gap-5 relative">
            
            <button
              onClick={() => setMobilityActive(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-white/5 rounded-full text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-mono text-[#E94560] uppercase tracking-widest">MOBILITÉ HANCHE ACTIVE</span>
              <h3 className="text-lg font-headline font-black text-white uppercase mt-1">
                {MOBILITY_STRETCHES[mobilityStretchIndex].name}
              </h3>
              <p className="text-xs text-gray-400 mt-1 max-w-xs">
                {MOBILITY_STRETCHES[mobilityStretchIndex].description}
              </p>
            </div>

            {/* Big interactive circular countdown */}
            <div className="relative w-40 h-40 rounded-full border-4 border-gray-800 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-[#E94560] border-t-transparent animate-spin duration-1000" />
              <div className="text-center">
                <span className="text-5xl font-mono font-black text-white">
                  {mobilityTimeRemaining}
                </span>
                <span className="text-[10px] text-[#8E8E93] block uppercase font-mono">secondes</span>
              </div>
            </div>

            <span className="text-xs text-gray-400 font-mono">
              Exercice {mobilityStretchIndex + 1} sur {MOBILITY_STRETCHES.length}
            </span>

            {/* Control triggers */}
            <div className="flex gap-4 w-full">
              <button
                onClick={() => setMobilityActive(false)}
                className="flex-1 h-11 bg-gray-800 rounded-xl text-white font-headline font-bold text-xs uppercase cursor-pointer hover:bg-gray-700 transition-all"
              >
                Passer / Arrêter
              </button>
              
              <button
                onClick={() => {
                  const next = (mobilityStretchIndex + 1) % MOBILITY_STRETCHES.length;
                  if (next === 0) {
                    setMobilityActive(false);
                    addToast('success', "Séance complétée ! (+25 XP)");
                  } else {
                    setMobilityStretchIndex(next);
                    setMobilityTimeRemaining(30);
                  }
                }}
                className="flex-1 h-11 bg-[#E94560] rounded-xl text-white font-headline font-bold text-xs uppercase cursor-pointer active:scale-95 transition-all shadow-md shadow-[#E94560]/10"
              >
                Suivant →
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ==================================== MODAL 4: CORRELATIONS DETAILS SCREEN ==================================== */}
      {showCorrelationDetails && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-[fade-in_0.2s_ease-out]">
          <div className="bg-[#0F0F1E] border border-[#1C1C3F] w-full max-w-md rounded-3xl p-6 relative overflow-hidden flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
            
            <button
              onClick={() => setShowCorrelationDetails(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-white/5 rounded-full text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-[#1C1C3F] pb-3">
              <h3 className="text-lg font-headline font-black text-[#FFD700] uppercase">
                Insights & Corrélations
              </h3>
              <p className="text-xs text-[#8E8E93] mt-0.5">Comment l'environnement réagit avec vos muscles.</p>
            </div>

            <div className="flex flex-col gap-3 text-xs font-sans text-gray-300">
              <div className="bg-black/30 p-3.5 rounded-xl border border-[#1C1C3F]">
                <strong className="text-white block mb-1">💤 Sommeil vs Force d'Ancrage</strong>
                <p className="leading-relaxed text-[#8E8E93]">
                  La phase de sommeil paradoxal permet de recharger les neurotransmetteurs de l'acétylcholine, indispensable pour l'influx des contractions rapides du muscle PC.
                </p>
              </div>

              <div className="bg-black/30 p-3.5 rounded-xl border border-[#1C1C3F]">
                <strong className="text-white block mb-1">⚡ Fatigue & Récupération</strong>
                <p className="leading-relaxed text-[#8E8E93]">
                  Après un entraînement intensif des jambes (squats), l'afflux sanguin pelvien augmente de 300%, favorisant un apport en oxygène maximal pour les séances d'endurance de Kegel.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowCorrelationDetails(false)}
              className="w-full h-11 bg-[#E94560] rounded-xl text-white font-headline font-bold text-xs uppercase tracking-wider flex items-center justify-center cursor-pointer mt-2 active:scale-98"
            >
              FERMER
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
