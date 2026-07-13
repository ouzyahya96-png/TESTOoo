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
  ArrowRight
} from 'lucide-react';

import {
  physicalService,
  COMPLEMENTARY_EXERCISES,
  HIP_STRETCHES,
  CORRELATIONS,
  PhysicalState,
  PhysicalExercise
} from '../pattern_killer/physicalService';
import { kegelService } from '../pattern_killer/kegelService';
import { AlphaCard } from './AlphaCard';
import { AlphaButton } from './AlphaButton';
import { AlphaBadge } from './AlphaBadge';

interface AlphaKegelPhysicalProps {
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
  onPointsUpdate?: (newPoints: number) => void;
}

export const AlphaKegelPhysical: React.FC<AlphaKegelPhysicalProps> = ({ addToast, onPointsUpdate }) => {
  const [state, setState] = useState<PhysicalState>(() => physicalService.getState());
  const [kegelState, setKegelState] = useState(() => kegelService.getState());
  const [activeTab, setActiveTab] = useState<'exercises' | 'posture' | 'hip_mobility' | 'respiration' | 'correlation'>('exercises');

  // Exercise selection for modal instruction display
  const [selectedExercise, setSelectedExercise] = useState<PhysicalExercise | null>(COMPLEMENTARY_EXERCISES[0]);

  // Hip Stretch Timer States
  const [stretchTimer, setStretchTimer] = useState<number>(30);
  const [stretchRunning, setStretchRunning] = useState<boolean>(false);
  const [currentStretchIdx, setCurrentStretchIdx] = useState<number>(0);
  const stretchIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Guided Breathing States
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'exhale'>('inhale');
  const [breathingTimer, setBreathingTimer] = useState<number>(4); // 4s inhale, 4s exhale
  const [breathingCycleCount, setBreathingCycleCount] = useState<number>(0);
  const [breathingRunning, setBreathingRunning] = useState<boolean>(false);
  const breathingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state on updates
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

  // Exercise Loop Completion Toggle
  const handleToggleExercise = (id: string) => {
    physicalService.toggleCompleteExercise(id);
    const updatedState = physicalService.getState();
    const isCompleted = updatedState.completedTodayIds.includes(id);

    if (isCompleted) {
      addToast('success', "Exercice synergique complété ! +15 points de force accumulés.");
      if (onPointsUpdate) {
        onPointsUpdate(kegelState.totalXP + 15);
      }
    } else {
      addToast('info', "Exercice retiré de vos complétions du jour.");
    }
  };

  // Toggle Posture notification reminders
  const handleTogglePosture = () => {
    physicalService.togglePostureReminders();
    const current = physicalService.getState().postureRemindersEnabled;
    if (current) {
      addToast('success', "Rappel de posture activé (toutes les 2h). Restez droit, renforcez le PC !");
    } else {
      addToast('info', "Rappels de posture suspendus.");
    }
  };

  // ---------------- HIP MOBILITY TIMER LOGIC ----------------
  useEffect(() => {
    if (stretchRunning) {
      stretchIntervalRef.current = setInterval(() => {
        setStretchTimer((prev) => {
          if (prev <= 1) {
            // Next stretch
            const nextIdx = (currentStretchIdx + 1) % HIP_STRETCHES.length;
            if (nextIdx === 0) {
              setStretchRunning(false);
              addToast('success', "Cycle de mobilité des hanches complété ! Votre bassin est libéré.");
              if (onPointsUpdate) onPointsUpdate(kegelState.totalXP + 30);
              return 30;
            }
            setCurrentStretchIdx(nextIdx);
            addToast('info', `Passage à l'étirement : ${HIP_STRETCHES[nextIdx].name}`);
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (stretchIntervalRef.current) clearInterval(stretchIntervalRef.current);
    }

    return () => {
      if (stretchIntervalRef.current) clearInterval(stretchIntervalRef.current);
    };
  }, [stretchRunning, currentStretchIdx]);

  const handleToggleStretchTimer = () => {
    setStretchRunning(!stretchRunning);
  };

  const handleResetStretchTimer = () => {
    setStretchRunning(false);
    setCurrentStretchIdx(0);
    setStretchTimer(30);
  };

  // ---------------- GUIDED BREATHING LOGIC ----------------
  useEffect(() => {
    if (breathingRunning) {
      breathingIntervalRef.current = setInterval(() => {
        setBreathingTimer((prev) => {
          if (prev <= 1) {
            // Switch phase
            setBreathingPhase((phase) => {
              const nextPhase = phase === 'inhale' ? 'exhale' : 'inhale';
              if (nextPhase === 'inhale') {
                setBreathingCycleCount((count) => count + 1);
              }
              return nextPhase;
            });
            return 4; // Reset to 4 seconds
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (breathingIntervalRef.current) clearInterval(breathingIntervalRef.current);
    }

    return () => {
      if (breathingIntervalRef.current) clearInterval(breathingIntervalRef.current);
    };
  }, [breathingRunning]);

  // Finish breathing routine manually
  const finishBreathingRoutine = () => {
    setBreathingRunning(false);
    setBreathingCycleCount(0);
    setBreathingTimer(4);
    setBreathingPhase('inhale');
    addToast('success', "Respiration synchronisée complétée ! Votre Kegel gagne +40% d'amplitude.");
    if (onPointsUpdate) onPointsUpdate(kegelState.totalXP + 25);
  };

  return (
    <div id="alpha-physical-integration-container" className="flex flex-col gap-6 w-full text-white animate-[fade-in_0.3s_ease-out]">
      
      {/* ======================= HEADER BANNER ======================= */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0A0A14] border border-[#1A1A30] p-5 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-48 h-48 bg-[#00E676]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-[#00E676] to-[#00B0FF] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#00E676]/10 shrink-0">
            <Activity className="w-8 h-8 text-white animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-headline font-bold text-[#00E676] uppercase tracking-[0.2em] block">
              SYNERGIE NEURO-MUSCULAIRE & FITNESS
            </span>
            <h2 className="text-xl md:text-2xl font-headline font-black tracking-tight">
              Intégration Physique Globale
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Synchronisez votre plancher pelvien avec votre posture, vos étirements de hanches et votre bio-respiration.
            </p>
          </div>
        </div>

        {/* Total Points Indicator */}
        <div className="flex items-center gap-3 bg-black/40 border border-[#1C1C35] p-2 px-4 rounded-2xl shrink-0">
          <Zap className="w-4 h-4 text-[#FFD700]" />
          <div>
            <span className="text-[9px] text-gray-500 font-mono block">VITALITÉ ALPHA</span>
            <span className="text-xs font-mono font-bold text-[#FFD700]">{kegelState.totalXP} XP</span>
          </div>
        </div>
      </div>

      {/* ======================= SUB-TABS SELECTOR ======================= */}
      <div className="flex bg-[#0F0F1A] border border-[#1A1A2E] p-1.5 rounded-2xl w-full overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveTab('exercises')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-headline font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap
            ${activeTab === 'exercises' ? 'bg-[#00E676] text-black shadow-md' : 'text-gray-400 hover:text-white hover:bg-[#16213E]/30'}
          `}
        >
          <Zap className="w-3.5 h-3.5" />
          1. Exercices Synergiques
        </button>

        <button
          onClick={() => setActiveTab('posture')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-headline font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap
            ${activeTab === 'posture' ? 'bg-[#00E676] text-black shadow-md' : 'text-gray-400 hover:text-white hover:bg-[#16213E]/30'}
          `}
        >
          <Sliders className="w-3.5 h-3.5" />
          2. Posture & Rappels
        </button>

        <button
          onClick={() => setActiveTab('hip_mobility')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-headline font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap
            ${activeTab === 'hip_mobility' ? 'bg-[#00E676] text-black shadow-md' : 'text-gray-400 hover:text-white hover:bg-[#16213E]/30'}
          `}
        >
          <Clock className="w-3.5 h-3.5" />
          3. Mobilité Hanche (Timer)
        </button>

        <button
          onClick={() => setActiveTab('respiration')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-headline font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap
            ${activeTab === 'respiration' ? 'bg-[#00E676] text-black shadow-md' : 'text-gray-400 hover:text-white hover:bg-[#16213E]/30'}
          `}
        >
          <Heart className="w-3.5 h-3.5" />
          4. Respiration Synchronisée
        </button>

        <button
          onClick={() => setActiveTab('correlation')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-headline font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap
            ${activeTab === 'correlation' ? 'bg-[#00E676] text-black shadow-md' : 'text-gray-400 hover:text-white hover:bg-[#16213E]/30'}
          `}
        >
          <Trophy className="w-3.5 h-3.5" />
          5. Corrélations & Données
        </button>
      </div>

      {/* ==================================== SECTION 1: COMPLEMENTARY EXERCISES ==================================== */}
      {activeTab === 'exercises' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Exercises Selection List (Left) */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <span className="text-[10px] font-headline font-bold text-gray-500 uppercase tracking-widest px-1">Choix des exercices de fitness</span>
            {COMPLEMENTARY_EXERCISES.map((ex) => {
              const isCompleted = state.completedTodayIds.includes(ex.id);
              return (
                <button
                  key={ex.id}
                  onClick={() => setSelectedExercise(ex)}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex items-center gap-3 duration-150 active:scale-95
                    ${selectedExercise?.id === ex.id
                      ? 'bg-[#111124] border-[#00E676]'
                      : 'bg-[#0A0A14] border-[#1C1C3E] hover:border-[#1E2E5D]'
                    }
                  `}
                >
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${ex.animationColor} shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-headline font-black text-white block truncate">{ex.name}</span>
                    <span className="text-[9px] text-gray-400 block truncate">{ex.reps} • {ex.durationText}</span>
                  </div>
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-[#00E676] shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Exercise Details with Simulated Loop Video Representation (Right) */}
          {selectedExercise && (
            <div className="lg:col-span-8 flex flex-col gap-6">
              <AlphaCard variant="elevated" className="p-6 flex flex-col gap-5 border border-[#1A1A3A] relative overflow-hidden">
                
                {/* Visual Header */}
                <div className="flex justify-between items-start pb-3 border-b border-[#1C1C35]">
                  <div>
                    <h3 className="text-sm font-headline font-black text-white uppercase">{selectedExercise.name}</h3>
                    <p className="text-[10px] text-gray-400 mt-1">Série d'activation pelvienne synergique • {selectedExercise.reps}</p>
                  </div>
                  <AlphaBadge variant={selectedExercise.difficulty === 'Advanced' ? 'alert' : selectedExercise.difficulty === 'Intermediate' ? 'info' : 'default'}>
                    {selectedExercise.difficulty}
                  </AlphaBadge>
                </div>

                {/* Simulated Auto-Playing Demonstration Video Loop Component */}
                <div className="bg-[#05050C] border border-[#1C1C3A] rounded-2xl h-52 flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/60 px-2 py-1 rounded font-mono text-[8px] text-gray-400">
                    <span className="w-1.5 h-1.5 bg-[#00E676] rounded-full animate-ping" />
                    <span>MUTÉ • LOOP AUTO-PLAY (5s)</span>
                  </div>

                  {/* Geometric Loop Video representation */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative w-24 h-24 flex items-center justify-center">
                      <div className={`absolute inset-0 bg-gradient-to-tr ${selectedExercise.animationColor} rounded-full opacity-10 animate-ping duration-1000`} />
                      <div className={`w-16 h-16 bg-gradient-to-tr ${selectedExercise.animationColor} rounded-2xl shadow-lg flex items-center justify-center transform hover:rotate-12 transition-transform`}>
                        <Activity className="w-8 h-8 text-white animate-bounce" />
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest animate-pulse">Simulation Mouvement Pelvien</span>
                  </div>
                </div>

                {/* How it helps Kegel */}
                <div className="bg-[#111124] p-3.5 rounded-xl border border-[#00E676]/20">
                  <span className="text-[10px] font-headline font-black text-[#00E676] uppercase block">COMMENT ÇA AIDE VOTRE KEGEL :</span>
                  <p className="text-xs text-gray-300 mt-1 leading-relaxed font-sans">{selectedExercise.kegelBenefit}</p>
                </div>

                {/* Instructions */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-headline font-bold text-gray-500 uppercase tracking-widest px-1">Instructions d'exécution :</span>
                  <div className="flex flex-col gap-2">
                    {selectedExercise.instructions.map((step, idx) => (
                      <div key={idx} className="flex gap-2.5 items-start bg-black/20 p-2.5 rounded-xl border border-[#1A1A35] text-xs">
                        <span className="font-mono text-[10px] text-[#00E676] bg-black/40 w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</span>
                        <p className="text-gray-300 leading-relaxed font-sans">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Confirm complete action */}
                <div className="flex justify-between items-center border-t border-[#1C1C3F] pt-4 mt-2">
                  <span className="text-[10px] text-gray-400 font-mono">Gain immédiat : +15 XP</span>
                  <AlphaButton
                    variant={state.completedTodayIds.includes(selectedExercise.id) ? 'secondary' : 'primary'}
                    onClick={() => handleToggleExercise(selectedExercise.id)}
                    className="px-6 py-2.5 text-xs font-headline font-black uppercase flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {state.completedTodayIds.includes(selectedExercise.id) ? "Terminé (cliquez pour annuler)" : "Marquer comme fait (+15 XP)"}
                  </AlphaButton>
                </div>

              </AlphaCard>
            </div>
          )}
        </div>
      )}

      {/* ==================================== SECTION 2: POSTURE & ALIGNEMENT ==================================== */}
      {activeTab === 'posture' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <div className="lg:col-span-8 flex flex-col gap-6">
            <AlphaCard variant="default" className="p-6 flex flex-col gap-5">
              <div>
                <h3 className="text-sm font-headline font-black text-white uppercase">La posture affecte directement votre plancher pelvien</h3>
                <p className="text-xs text-gray-400 mt-1">Une inclinaison pelvienne incorrecte (hyperlordose) détend passivement vos muscles.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                
                <div className="bg-[#0A0A14] p-4 rounded-xl border border-[#1A1A3E] flex flex-col gap-2">
                  <span className="text-xs font-headline font-black text-[#E94560] uppercase">⚠️ Position Assise Affalée (Nocif)</span>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Comprime la vessie, affaisse le diaphragme et empêche le plancher pelvien de s'étirer naturellement. Diminue l'activation contractile maximale de 30%.
                  </p>
                </div>

                <div className="bg-[#0A0A14] p-4 rounded-xl border border-[#1A1A3E] flex flex-col gap-2">
                  <span className="text-xs font-headline font-black text-[#00E676] uppercase">✅ Alignement Neutre (Optimal)</span>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Colonne étirée, épaules basses, inclinaison du bassin neutre. Le plancher pelvien est sous tension optimale naturelle de pré-étirement.
                  </p>
                </div>

              </div>

              {/* Quick Posture Routine (5 min) */}
              <div className="bg-[#111124] p-4 rounded-2xl border border-[#1C1C3E] mt-2 flex flex-col gap-3">
                <span className="text-xs font-headline font-black text-[#FFD700] uppercase tracking-wider">MICRO-ENTRAÎNEMENT POSTURE (5 min/jour) :</span>
                <p className="text-xs text-gray-300 leading-relaxed">
                  "Asseyez-vous sur vos ischions (les os pointus du bassin). Étirez le sommet du crâne vers le haut, baissez le menton de 1 cm. Prenez 5 inspirations lentes en maintenant une micro-activation de votre Kegel à 20%."
                </p>
                <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono pt-2 border-t border-[#1C1C45]">
                  <span>Durée idéale : 5 minutes</span>
                  <span className="text-[#FFD700] font-bold">Inclus par défaut dans vos habitudes</span>
                </div>
              </div>
            </AlphaCard>
          </div>

          {/* Posture Reminder settings */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <AlphaCard variant="elevated" className="p-5 flex flex-col gap-4 border border-[#00B0FF]/10">
              <div className="flex items-center gap-2 pb-2 border-b border-[#1C1C35]">
                <Smartphone className="w-4.5 h-4.5 text-[#00B0FF]" />
                <h3 className="text-xs font-headline font-extrabold text-[#00B0FF] uppercase tracking-wider">
                  Rappel intelligent Posture
                </h3>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed">
                Configurez des notifications toutes les 2 heures pour réajuster votre colonne et maintenir votre force PC de base.
              </p>

              <div className="bg-[#05050C] p-3 rounded-xl border border-[#1C1C3A] flex justify-between items-center my-1">
                <div>
                  <span className="text-xs font-headline font-black text-white block">Rappel toutes les 2h</span>
                  <span className="text-[9px] text-[#00E676] font-mono block">"Redresse-toi. Ton plancher pelvien te remercie."</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={state.postureRemindersEnabled} 
                    onChange={handleTogglePosture} 
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-[#1C1C35] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00E676]" />
                </label>
              </div>

              <div className="bg-[#111124] p-3 rounded-xl border border-[#1C1C35] text-[10px] text-gray-400 leading-relaxed">
                Ces notifications s'affichent de manière discrète sur votre terminal mobile apparié ou l'iframe de simulation.
              </div>
            </AlphaCard>
          </div>

        </div>
      )}

      {/* ==================================== SECTION 3: HIP MOBILITY TIMER ==================================== */}
      {activeTab === 'hip_mobility' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Active stretch execution timer (Left) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <AlphaCard variant="elevated" className="p-6 flex flex-col gap-5 border border-[#1C1C3C] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700]/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex justify-between items-center pb-2 border-b border-[#1C1C35]">
                <h3 className="text-xs font-headline font-extrabold uppercase tracking-wider text-[#FFD700] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#FFD700]" />
                  Étirement hanche interactif : {HIP_STRETCHES[currentStretchIdx].name}
                </h3>
                <span className="text-xs text-gray-400 font-mono">
                  {currentStretchIdx + 1} / {HIP_STRETCHES.length}
                </span>
              </div>

              {/* Timer big circular visual */}
              <div className="flex flex-col items-center justify-center p-8 bg-black/30 border border-[#1A1A35] rounded-2xl">
                <div className="relative w-40 h-40 rounded-full border-4 border-[#1C1C3E] flex items-center justify-center">
                  
                  {/* Dynamic border track representation */}
                  <div className="absolute inset-0 rounded-full border-4 border-[#FFD700] border-t-transparent animate-spin duration-1000" style={{ animationPlayState: stretchRunning ? 'running' : 'paused' }} />
                  
                  <div className="text-center">
                    <span className="text-4xl font-mono font-black text-white">{stretchTimer}</span>
                    <span className="text-[10px] text-gray-400 block uppercase font-mono mt-1">secondes</span>
                  </div>
                </div>

                <span className="text-sm font-headline font-black text-white text-center mt-5 uppercase">
                  {HIP_STRETCHES[currentStretchIdx].name}
                </span>
                <p className="text-xs text-gray-400 text-center mt-1 leading-relaxed max-w-md">
                  {HIP_STRETCHES[currentStretchIdx].description}
                </p>

                {/* Control buttons */}
                <div className="flex gap-4 mt-6">
                  <AlphaButton
                    variant="primary"
                    onClick={handleToggleStretchTimer}
                    className="px-6 py-2 text-xs font-headline font-bold uppercase flex items-center gap-2 cursor-pointer"
                  >
                    {stretchRunning ? (
                      <>
                        <Pause className="w-4 h-4" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" /> Démarrer
                      </>
                    )}
                  </AlphaButton>

                  <AlphaButton
                    variant="secondary"
                    onClick={handleResetStretchTimer}
                    className="p-2 border border-[#1C1C3E] rounded-xl cursor-pointer hover:bg-white/5"
                  >
                    <RotateCcw className="w-4 h-4 text-gray-400" />
                  </AlphaButton>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3.5 bg-black/40 rounded-xl border border-[#1A1A35]">
                <Info className="w-4.5 h-4.5 text-[#FFD700] shrink-0" />
                <span className="text-[10px] text-gray-400 leading-relaxed">
                  "Hanches serrées = plancher pelvien faible." Une capsule de 5 étirements légers de 30 secondes élimine l'hyperpression externe sur la ceinture pelvienne.
                </span>
              </div>
            </AlphaCard>
          </div>

          {/* Right Panel: Foam Rolling Guide */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <AlphaCard variant="default" className="p-5 flex flex-col gap-4">
              <div className="pb-2 border-b border-[#1C1C35]">
                <h3 className="text-xs font-headline font-extrabold uppercase tracking-wider text-[#FF4B2B]">
                  Guide Foam Rolling (Auto-massage)
                </h3>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed">
                Le foam rolling de la bandelette ilio-tibiale et des adducteurs libère les fascias qui étranglent la base du bassin.
              </p>

              <div className="flex flex-col gap-3.5">
                {[
                  { name: "Massage Adducteurs", duration: "1 min / côté", benefit: "Détend les muscles internes de la cuisse qui tirent sur la branche pubienne." },
                  { name: "Massage Grands Fessiers", duration: "1 min / côté", benefit: "Active la circulation et libère le piriforme pour éviter les sciatiques pelviennes." }
                ].map((item, idx) => (
                  <div key={idx} className="bg-black/20 p-3 rounded-xl border border-[#1A1A35] flex flex-col gap-1 text-xs">
                    <span className="font-headline font-black text-white">{item.name}</span>
                    <span className="text-[10px] text-[#00E676] font-mono">{item.duration}</span>
                    <p className="text-[10px] text-gray-400 leading-relaxed mt-0.5">{item.benefit}</p>
                  </div>
                ))}
              </div>
            </AlphaCard>
          </div>

        </div>
      )}

      {/* ==================================== SECTION 4: RESPIRATION + KEGEL ==================================== */}
      {activeTab === 'respiration' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main Breathing visual engine */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <AlphaCard variant="elevated" className="p-6 flex flex-col gap-5 border border-[#1A1A3C] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-[#00E676]/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex justify-between items-center pb-2 border-b border-[#1C1C35]">
                <h3 className="text-xs font-headline font-extrabold uppercase tracking-wider text-[#00E676] flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[#00E676]" />
                  Respiration Rythmée & Amplitude Kegel (+40%)
                </h3>
                <span className="text-xs text-gray-400 font-mono">Cycles effectués : {breathingCycleCount}</span>
              </div>

              {/* Circle visual animation representation */}
              <div className="flex flex-col items-center justify-center p-10 bg-black/40 border border-[#1A1A35] rounded-2xl relative overflow-hidden">
                
                {/* Dynamic resizing circle */}
                <div 
                  className={`relative w-48 h-48 rounded-full flex items-center justify-center border-4 transition-all duration-1000 ease-in-out
                    ${breathingPhase === 'inhale' 
                      ? 'border-[#00E676]/30 bg-[#00E676]/5 scale-110' 
                      : 'border-[#00B0FF]/30 bg-[#00B0FF]/5 scale-90'
                    }
                  `}
                >
                  <div className="text-center z-10">
                    <span className="text-3xl font-mono font-black text-white">{breathingTimer}s</span>
                    <span className="text-[10px] text-gray-300 block uppercase font-mono mt-1 font-bold">
                      {breathingPhase === 'inhale' ? "INSPIREZ" : "EXPIREZ"}
                    </span>
                  </div>
                  
                  {/* Subtle inner animated ring */}
                  <div className={`absolute inset-4 rounded-full border border-dashed animate-spin duration-[6000s]
                    ${breathingPhase === 'inhale' ? 'border-[#00E676]' : 'border-[#00B0FF]'}
                  `} />
                </div>

                <div className="text-center mt-6">
                  <span className="text-xs font-headline font-extrabold text-white uppercase">
                    {breathingPhase === 'inhale' 
                      ? "💧 RELÂCHEZ COMPLÈTEMENT (REVERSE KEGEL)" 
                      : "🔥 CONTRACTEZ LE PLANCHER (KEGEL)"
                    }
                  </span>
                  <p className="text-[11px] text-gray-400 mt-1 max-w-md">
                    {breathingPhase === 'inhale' 
                      ? "L'inspiration abaisse le diaphragme et ouvre la ceinture pelvienne. Laissez les muscles s'étirer." 
                      : "L'expiration remonte le diaphragme. Accompagnez le mouvement en serrant à 60% de force."
                    }
                  </p>
                </div>

                {/* Control elements */}
                <div className="flex gap-4 mt-6">
                  <AlphaButton
                    variant="primary"
                    onClick={() => setBreathingRunning(!breathingRunning)}
                    className="px-6 py-2.5 text-xs font-headline font-bold uppercase flex items-center gap-2 cursor-pointer"
                  >
                    {breathingRunning ? (
                      <>
                        <Pause className="w-4 h-4" /> Arrêter la respiration
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" /> Démarrer la respiration (3 min)
                      </>
                    )}
                  </AlphaButton>

                  {breathingCycleCount > 0 && (
                    <AlphaButton
                      variant="secondary"
                      onClick={finishBreathingRoutine}
                      className="px-5 py-2 text-xs font-headline font-bold uppercase cursor-pointer"
                    >
                      Terminer & Enregistrer (+25 XP)
                    </AlphaButton>
                  )}
                </div>

              </div>
            </AlphaCard>
          </div>

          {/* Right Panel: Coordinated explanation */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <AlphaCard variant="default" className="p-5 flex flex-col gap-4">
              <div className="pb-2 border-b border-[#1C1C35]">
                <h3 className="text-xs font-headline font-extrabold uppercase tracking-wider text-[#FFD700]">
                  Amplification neuro-diaphragmatique
                </h3>
              </div>

              <div className="flex flex-col gap-3.5 text-xs">
                <p className="text-gray-300 leading-relaxed">
                  Le plancher pelvien et le diaphragme respiratoire se déplacent parallèlement comme un double piston hydraulique :
                </p>

                <div className="bg-[#0A0A14] p-3 rounded-xl border border-[#1A1A35] leading-relaxed">
                  <strong>Inspiration :</strong> Les côtes s'écartent, le ventre se gonfle, le diaphragme descend et repousse le plancher pelvien vers le bas. C'est l'étirement (Reverse Kegel).
                </div>

                <div className="bg-[#0A0A14] p-3 rounded-xl border border-[#1A1A35] leading-relaxed">
                  <strong>Expiration :</strong> L'air sort, les muscles abdominaux se resserrent, le diaphragme remonte et aspire le plancher pelvien vers le haut. C'est la contraction (Kegel standard).
                </div>
              </div>
            </AlphaCard>
          </div>

        </div>
      )}

      {/* ==================================== SECTION 5: DATA CORRELATION DASHBOARD ==================================== */}
      {activeTab === 'correlation' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left panel: Impact Factors and positive/negative multipliers */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <AlphaCard variant="default" className="p-6 flex flex-col gap-5">
              <div>
                <h3 className="text-sm font-headline font-black text-white uppercase">Tableau des Modificateurs de Performance Pelvienne</h3>
                <p className="text-xs text-gray-400 mt-1">Comment vos activités quotidiennes influent directement sur votre force de contraction mesurée.</p>
              </div>

              <div className="flex flex-col gap-3">
                {CORRELATIONS.map((item, idx) => (
                  <div key={idx} className="bg-black/20 p-4 rounded-2xl border border-[#1A1A35] flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <span className="text-xs font-headline font-black text-white block">{item.factor}</span>
                      <p className="text-[10px] text-gray-400 leading-relaxed mt-1 max-w-xl">{item.description}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className={`text-lg font-mono font-black block
                        ${item.impactTrend === 'up' ? 'text-[#00E676]' : 'text-[#E94560]'}
                      `}>
                        {item.impactTrend === 'up' ? '+' : '-'}{item.impactPercent}%
                      </span>
                      <span className="text-[9px] text-gray-500 font-mono uppercase block mt-0.5">force PC</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#00E676]/5 to-transparent rounded-xl border border-[#00E676]/10 mt-1">
                <Trophy className="w-5 h-5 text-[#00E676]" />
                <span className="text-xs text-gray-300 leading-relaxed">
                  Combiner vos squats réguliers avec le dodo réparateur augmente votre endurance isométrique cumulée de <strong>+35% en moyenne d'après nos modèles adaptatifs</strong>.
                </span>
              </div>
            </AlphaCard>
          </div>

          {/* Right Panel: Daily Stats Comparison Chart / Indicator mockup */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <AlphaCard variant="elevated" className="p-5 flex flex-col gap-4 border border-[#FFD700]/15">
              <div className="flex items-center gap-2 pb-2 border-b border-[#1C1C35]">
                <Flame className="w-4 h-4 text-[#FFD700]" />
                <h3 className="text-xs font-headline font-extrabold text-[#FFD700] uppercase tracking-wider">
                  Vos Métriques ce jour
                </h3>
              </div>

              <div className="flex flex-col gap-4">
                
                {/* 1 */}
                <div>
                  <div className="flex justify-between items-center text-xs pb-1">
                    <span className="text-gray-400">Force PC Potentielle :</span>
                    <span className="text-[#00E676] font-mono font-bold">92%</span>
                  </div>
                  <div className="w-full bg-[#1C1C35] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#00E676] h-full rounded-full" style={{ width: '92%' }} />
                  </div>
                </div>

                {/* 2 */}
                <div>
                  <div className="flex justify-between items-center text-xs pb-1">
                    <span className="text-gray-400">Niveau de Fatigue SNC :</span>
                    <span className="text-[#E94560] font-mono font-bold">15% (Faible)</span>
                  </div>
                  <div className="w-full bg-[#1C1C35] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#E94560] h-full rounded-full" style={{ width: '15%' }} />
                  </div>
                </div>

                {/* 3 */}
                <div>
                  <div className="flex justify-between items-center text-xs pb-1">
                    <span className="text-gray-400">Mobilité Articulaire :</span>
                    <span className="text-[#00B0FF] font-mono font-bold">Excellent</span>
                  </div>
                  <div className="w-full bg-[#1C1C35] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#00B0FF] h-full rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>

                <div className="bg-[#111124] p-3 rounded-xl border border-[#1C1C35] text-[10px] text-gray-400 leading-relaxed text-center">
                  "Savoir écouter son corps fait l'homme fort." Les stats évoluent d'après vos complétions d'exercices physiques quotidiens.
                </div>
              </div>
            </AlphaCard>
          </div>

        </div>
      )}

    </div>
  );
};
