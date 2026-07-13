import React, { useState, useEffect, useRef } from 'react';
import {
  Flame,
  Trophy,
  Award,
  Brain,
  Zap,
  Shield,
  Target,
  Play,
  Pause,
  X,
  Check,
  Volume2,
  VolumeX,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Star,
  ChevronRight,
  Activity,
  Smile,
  Info,
  Smartphone,
  Copy,
  Lock,
  Compass,
  Sliders
} from 'lucide-react';

import { kegelService, KEGEL_LEVELS, KegelLevel, KegelSession } from '../pattern_killer/kegelService';
import { AlphaCard } from './AlphaCard';
import { AlphaButton } from './AlphaButton';
import { AlphaBadge } from './AlphaBadge';
import { AlphaProgress } from './AlphaProgress';
import { AlphaKegelBiofeedback } from './AlphaKegelBiofeedback';
import { AlphaKegelProgramme } from './AlphaKegelProgramme';
import { AlphaKegelPhysical } from './AlphaKegelPhysical';
import { KegelDashboardScreen } from '../screens/kegel/KegelDashboardScreen';

interface AlphaKegelProps {
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
  onPointsUpdate?: (newPoints: number) => void;
}

export const AlphaKegel: React.FC<AlphaKegelProps> = ({ addToast, onPointsUpdate }) => {
  // Service states
  const [kegelState, setKegelState] = useState(() => kegelService.getState());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'dashboard_spec' | 'levels' | 'history' | 'mobile_blueprint' | 'biofeedback' | 'programme' | 'physical'>('dashboard_spec');

  // Active workout states
  const [activeLevel, setActiveLevel] = useState<KegelLevel | null>(null);
  const [workoutActive, setWorkoutActive] = useState<boolean>(false);
  const [workoutPaused, setWorkoutPaused] = useState<boolean>(false);
  const [currentSet, setCurrentSet] = useState<number>(1);
  const [currentRep, setCurrentRep] = useState<number>(1);
  const [sessionPhase, setSessionPhase] = useState<'intro' | 'contraction' | 'relaxation' | 'elevator' | 'hold_at_max' | 'reverse_kegel' | 'finished'>('intro');
  const [phaseTimeLeft, setPhaseTimeLeft] = useState<number>(5); // 5s intro countdown
  const [totalElapsedTime, setTotalElapsedTime] = useState<number>(0);
  const [voiceGuidance, setVoiceGuidance] = useState<boolean>(true);
  const [repsCompleted, setRepsCompleted] = useState<number>(0);
  const [hapticTriggered, setHapticTriggered] = useState<boolean>(false);

  // Active Workout elevators and specific parameters
  const [currentElevatorFloor, setCurrentElevatorFloor] = useState<number>(1);

  // Post session report state
  const [lastCompletedSession, setLastCompletedSession] = useState<KegelSession | null>(null);
  const [feedbackForce, setFeedbackForce] = useState<number>(7);
  const [feedbackNotes, setFeedbackNotes] = useState<string>('');
  const [feelMuscleOk, setFeelMuscleOk] = useState<boolean>(true);

  // Sound Synth Ref (Audio Context)
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Workout timers using RAF or precise intervals
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update component state on custom events
  useEffect(() => {
    const handleUpdate = () => {
      setKegelState(kegelService.getState());
    };
    window.addEventListener('alphaman_kegel_updated', handleUpdate);
    return () => window.removeEventListener('alphaman_kegel_updated', handleUpdate);
  }, []);

  // Beep synthesis
  const triggerBeep = (freq: number, duration: number, type: 'sine' | 'square' | 'triangle' = 'sine') => {
    if (!voiceGuidance) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio Synthesis failed (browser autoplay limits)", e);
    }
  };

  // Trigger simulated haptic feedback (screen shake / flashing light)
  const triggerHaptic = () => {
    setHapticTriggered(true);
    setTimeout(() => setHapticTriggered(false), 250);

    // Physical vibration trigger for mobile browsers supporting it
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(150);
      } catch (_) {}
    }
  };

  // Main Timer Controller
  useEffect(() => {
    if (workoutActive && !workoutPaused) {
      intervalRef.current = setInterval(() => {
        setTotalElapsedTime(prev => prev + 1);

        if (phaseTimeLeft > 1) {
          setPhaseTimeLeft(prev => prev - 1);

          // Subtle ticking sounds in last 3 seconds
          if (phaseTimeLeft <= 4) {
            triggerBeep(800, 0.05);
          }
        } else {
          // Transition to next state
          handlePhaseTransition();
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [workoutActive, workoutPaused, sessionPhase, phaseTimeLeft]);

  // Phase Transition engine
  const handlePhaseTransition = () => {
    if (!activeLevel) return;
    const details = activeLevel.details;

    triggerHaptic();

    if (sessionPhase === 'intro') {
      // Start session with contraction
      setSessionPhase('contraction');
      setPhaseTimeLeft(details.contractionDuration || 5);
      triggerBeep(1200, 0.3, 'sine');
      addToast('info', 'Phase : CONTRACTEZ ! Serrez fort votre muscle pelvien.');
    } else if (sessionPhase === 'contraction') {
      // Check if we need to do relaxation next
      setSessionPhase('relaxation');
      setPhaseTimeLeft(details.relaxationDuration || 5);
      triggerBeep(600, 0.3, 'triangle');
      addToast('info', 'Phase : RELÂCHEZ ! Détente complète.');
    } else if (sessionPhase === 'relaxation') {
      // Move to next rep or special exercise
      const nextRep = currentRep + 1;
      
      if (nextRep <= details.reps) {
        setCurrentRep(nextRep);
        setRepsCompleted(prev => prev + 1);
        setSessionPhase('contraction');
        setPhaseTimeLeft(details.contractionDuration || 5);
        triggerBeep(1200, 0.3, 'sine');
      } else {
        // Checking for special level activities
        if (details.hasFastReps && repsCompleted < details.reps + (details.fastRepsCount || 0)) {
          setSessionPhase('elevator'); // Use elevator/fast reps phase
          setPhaseTimeLeft(2); // 2s per fast rep
          triggerBeep(1500, 0.15, 'square');
          addToast('warning', 'Séquence ULTRA-RAPIDE ! Contractez à haute fréquence.');
        } else if (details.hasHoldAtMax && sessionPhase !== 'hold_at_max') {
          setSessionPhase('hold_at_max');
          setPhaseTimeLeft(details.holdAtMaxDuration || 15);
          triggerBeep(2000, 0.5, 'sine');
          addToast('warning', 'TENUE MAXIMALE ! Conservez une contraction brute à 100%.');
        } else if (details.hasReverseKegel && sessionPhase !== 'reverse_kegel') {
          setSessionPhase('reverse_kegel');
          setPhaseTimeLeft(5); // 5s active stretching
          triggerBeep(450, 0.4, 'triangle');
          addToast('info', 'REVERSE KEGEL : Relâchement actif. Poussez doucement vers le bas.');
        } else {
          // Check sets
          const nextSet = currentSet + 1;
          if (nextSet <= details.sets) {
            setCurrentSet(nextSet);
            setCurrentRep(1);
            setSessionPhase('contraction');
            setPhaseTimeLeft(details.contractionDuration || 5);
            triggerBeep(1200, 0.3, 'sine');
            addToast('success', `Début de la Série ${nextSet} !`);
          } else {
            // Completed workout!
            finishWorkout();
          }
        }
      }
    } else if (sessionPhase === 'elevator') {
      // Fast reps cycling or elevator floors
      const nextElevatorFloor = currentElevatorFloor + 1;
      const targetFloors = details.elevatorFloors || 3;

      if (nextElevatorFloor <= targetFloors) {
        setCurrentElevatorFloor(nextElevatorFloor);
        setPhaseTimeLeft(3); // 3s per floor
        triggerBeep(1000 + nextElevatorFloor * 100, 0.2);
      } else {
        // Completed elevator, check hold at max next
        setCurrentElevatorFloor(1);
        if (details.hasHoldAtMax) {
          setSessionPhase('hold_at_max');
          setPhaseTimeLeft(details.holdAtMaxDuration || 15);
          triggerBeep(2000, 0.5);
        } else {
          finishWorkout();
        }
      }
    } else if (sessionPhase === 'hold_at_max') {
      if (details.hasReverseKegel) {
        setSessionPhase('reverse_kegel');
        setPhaseTimeLeft(10);
        triggerBeep(450, 0.4);
      } else {
        finishWorkout();
      }
    } else if (sessionPhase === 'reverse_kegel') {
      finishWorkout();
    }
  };

  // Launch Workout
  const startWorkout = (level: KegelLevel) => {
    setActiveLevel(level);
    setWorkoutActive(true);
    setWorkoutPaused(false);
    setCurrentSet(1);
    setCurrentRep(1);
    setRepsCompleted(0);
    setSessionPhase('intro');
    setPhaseTimeLeft(5); // 5 seconds breathing setup
    setTotalElapsedTime(0);
    setCurrentElevatorFloor(1);
    triggerBeep(440, 0.1);
    addToast('info', `Démarrage de la séance : Niveau ${level.id} - ${level.name}`);
  };

  // Finish session
  const finishWorkout = () => {
    setWorkoutActive(false);
    setSessionPhase('finished');
    triggerBeep(1200, 0.5, 'sine');
    triggerBeep(1500, 0.5, 'sine');
  };

  // Save and Log results of active session
  const handleSaveWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLevel) return;

    const logged = kegelService.completeSession(
      activeLevel.id,
      totalElapsedTime,
      repsCompleted || activeLevel.details.reps,
      feedbackForce,
      feelMuscleOk,
      feedbackNotes
    );

    // Award XP to core application if handler exists
    if (onPointsUpdate) {
      const updatedState = kegelService.getState();
      onPointsUpdate(1420 + updatedState.totalXP); // sync back points with mock starting base
    }

    addToast('success', `Session enregistrée avec succès ! +${activeLevel.id * 15} XP de vitalité pelvienne.`);

    // Reset States
    setLastCompletedSession(logged);
    setSessionPhase('intro');
    setActiveLevel(null);
    setFeedbackForce(7);
    setFeedbackNotes('');
    setFeelMuscleOk(true);
    setKegelState(kegelService.getState());
    
    // Bring back to main dashboard tab
    setActiveTab('dashboard');
  };

  // Abort session safely
  const handleAbortWorkout = () => {
    if (window.confirm("Êtes-vous sûr de vouloir abandonner l'entraînement en cours ? Les progrès de cette séance seront perdus.")) {
      setWorkoutActive(false);
      setActiveLevel(null);
      setSessionPhase('intro');
      addToast('warning', "Entraînement annulé.");
    }
  };

  const currentLevel = KEGEL_LEVELS.find(l => l.id === kegelState.currentLevelId) || KEGEL_LEVELS[0];
  const nextLevelId = Math.min(10, kegelState.currentLevelId + 1);
  const nextLevel = KEGEL_LEVELS.find(l => l.id === nextLevelId) || KEGEL_LEVELS[0];
  const sessionsCompletedCount = kegelState.completedSessions.length;
  const sessionsNeeded = kegelService.getSessionsNeededForNextLevel();

  // Color dynamic getters for phase panel
  const getPhaseColorClasses = () => {
    if (sessionPhase === 'contraction') return 'bg-[#00E676]/10 border-[#00E676] text-[#00E676] shadow-[0_0_40px_rgba(0,230,118,0.15)]';
    if (sessionPhase === 'relaxation') return 'bg-[#3B82F6]/10 border-[#3B82F6] text-[#3B82F6] shadow-[0_0_40px_rgba(59,130,246,0.15)]';
    if (sessionPhase === 'elevator') return 'bg-[#FF9800]/10 border-[#FF9800] text-[#FF9800] shadow-[0_0_40px_rgba(255,152,0,0.15)]';
    if (sessionPhase === 'hold_at_max') return 'bg-[#FFD700]/10 border-[#FFD700] text-[#FFD700] shadow-[0_0_40px_rgba(255,215,0,0.2)] animate-pulse';
    if (sessionPhase === 'reverse_kegel') return 'bg-[#9C27B0]/10 border-[#9C27B0] text-[#9C27B0] shadow-[0_0_40px_rgba(156,39,176,0.15)]';
    return 'bg-[#111122]/80 border-[#1A1A2E] text-white';
  };

  // Progress percentage around current level (5 completed at level to level up)
  const levelProgressPercent = Math.min(100, Math.floor(((5 - sessionsNeeded) / 5) * 100));

  // Exporter for the React Native complete implementation
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    addToast('success', "Code React Native copié dans le presse-papiers 📋");
  };

  const reactNativeCodeMock = `/**
 * ALPHA MAN - Native Pelvic Force Core Component
 * Written in React Native + TypeScript with full haptic feedback hooks
 */
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Vibration } from 'react-native';

export default function KegelNativeMaster() {
  const [level, setLevel] = useState(1);
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState('contraction'); // contraction | relaxation

  const handlePhaseChange = (newPhase) => {
    setPhase(newPhase);
    // Real native haptic feedback triggers
    Vibration.vibrate(newPhase === 'contraction' ? [0, 200, 100, 200] : 100);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌱 KEGEL MASTER NATIVE</Text>
      <View style={[styles.timerCircle, phase === 'contraction' ? styles.greenCircle : styles.blueCircle]}>
        <Text style={styles.phaseText}>{phase.toUpperCase()}</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={() => setActive(!active)}>
        <Text style={styles.btnText}>{active ? "Pause" : "Commencer"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A14', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFF', marginBottom: 20 },
  timerCircle: { width: 220, height: 220, borderRadius: 110, borderWidth: 8, justifyContent: 'center', alignItems: 'center' },
  greenCircle: { borderColor: '#00E676', backgroundColor: 'rgba(0, 230, 118, 0.1)' },
  blueCircle: { borderColor: '#3B82F6', backgroundColor: 'rgba(59, 130, 246, 0.1)' },
  phaseText: { fontSize: 22, fontWeight: '900', color: '#FFF' },
  button: { marginTop: 40, backgroundColor: '#E94560', paddingVertical: 14, paddingHorizontal: 40, borderRadius: 25 },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});`;

  return (
    <div id="alpha-kegel-module-root" className={`flex flex-col gap-6 w-full text-white transition-all duration-300 ${hapticTriggered ? 'scale-[0.99] opacity-90' : ''}`}>
      
      {/* ======================= ACTIVE WORKOUT HUD OVERLAY ======================= */}
      {workoutActive && activeLevel && (
        <div className="fixed inset-0 z-50 bg-[#0A0A12]/95 flex flex-col items-center justify-center p-6 backdrop-blur-md animate-[fade-in_0.3s_ease-out]">
          
          {/* TOP NAVIGATION / HEADER */}
          <div className="w-full max-w-2xl flex justify-between items-center pb-4 border-b border-[#1C1C35] mb-8">
            <div className="flex items-center gap-3">
              <span className="text-sm font-headline font-black text-[#E94560] bg-[#E94560]/10 px-3 py-1 rounded-full border border-[#E94560]/20">
                NIVEAU {activeLevel.id}
              </span>
              <div>
                <h4 className="text-xs font-headline font-bold text-[#8E8E93] uppercase tracking-wider">ENTRAÎNEMENT ACTIF</h4>
                <h3 className="text-md font-headline font-black tracking-tight text-white">{activeLevel.name}</h3>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Sound control toggle */}
              <button 
                onClick={() => setVoiceGuidance(!voiceGuidance)}
                className="p-2.5 bg-[#16213E]/80 hover:bg-[#1C2C54] rounded-xl text-gray-300 cursor-pointer transition-colors"
                title="Bip sonore"
              >
                {voiceGuidance ? <Volume2 className="w-4.5 h-4.5 text-[#00E676]" /> : <VolumeX className="w-4.5 h-4.5 text-gray-500" />}
              </button>

              {/* Abort button */}
              <button 
                onClick={handleAbortWorkout}
                className="p-2.5 bg-[#E94560]/10 hover:bg-[#E94560]/20 border border-[#E94560]/20 rounded-xl text-[#E94560] cursor-pointer transition-all"
                title="Quitter"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* MAIN CIRCULAR TIMER & METRICS CARD */}
          <div className="w-full max-w-lg flex flex-col items-center gap-6">
            
            {/* LARGE CENTERED COMPONENT TIMER */}
            <div className={`w-full border-2 rounded-[32px] p-8 md:p-12 text-center transition-all duration-300 ${getPhaseColorClasses()}`}>
              
              {/* STAGE DESCRIPTION */}
              <span className="text-[10px] font-headline font-bold uppercase tracking-[0.2em] block mb-2 opacity-80">
                {sessionPhase === 'intro' ? 'PRÉPARATEUR DE SOUFFLE' : `Série ${currentSet}/${activeLevel.details.sets} • Rep ${currentRep}/${activeLevel.details.reps}`}
              </span>

              {/* HIGH CONTRAST COUNTDOWN */}
              <div className="text-6xl md:text-8xl font-mono font-black my-4 tabular-nums tracking-tighter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                {phaseTimeLeft}s
              </div>

              {/* ACTION TEXT */}
              <h2 className="text-2xl md:text-3xl font-headline font-black tracking-tight uppercase">
                {sessionPhase === 'intro' && 'RENAISSANCE PELVIENNE'}
                {sessionPhase === 'contraction' && 'CONTRACTEZ !'}
                {sessionPhase === 'relaxation' && 'RELÂCHEZ...'}
                {sessionPhase === 'elevator' && `ASCENSEUR (Étage ${currentElevatorFloor})`}
                {sessionPhase === 'hold_at_max' && 'BLOQUEZ AU MAXIMUM !'}
                {sessionPhase === 'reverse_kegel' && 'REVERSE (Relâchement)'}
              </h2>

              <p className="text-xs text-gray-300 mt-2 leading-relaxed italic max-w-xs mx-auto">
                {sessionPhase === 'intro' && "Faites le vide. Inspirez profondément."}
                {sessionPhase === 'contraction' && "Sensation de fermer le flux d'urine. Maintenez le sphincter serré."}
                {sessionPhase === 'relaxation' && "Détendez tous les muscles, laissez le sang affluer librement."}
                {sessionPhase === 'elevator' && "Montez la force par paliers réguliers d'intensité."}
                {sessionPhase === 'hold_at_max' && "Sentez la tension maximale souveraine brute dans le bassin."}
                {sessionPhase === 'reverse_kegel' && "Poussez doucement comme pour ouvrir et relâcher le muscle."}
              </p>

              {/* PROGRESS BAR */}
              <div className="w-full bg-black/30 h-1.5 rounded-full mt-6 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 
                    ${sessionPhase === 'contraction' ? 'bg-[#00E676]' : ''}
                    ${sessionPhase === 'relaxation' ? 'bg-[#3B82F6]' : ''}
                    ${sessionPhase === 'elevator' ? 'bg-[#FF9800]' : ''}
                    ${sessionPhase === 'hold_at_max' ? 'bg-[#FFD700]' : ''}
                    ${sessionPhase === 'reverse_kegel' ? 'bg-[#9C27B0]' : ''}
                  `}
                  style={{ 
                    width: `${
                      sessionPhase === 'intro' ? (5 - phaseTimeLeft) * 20 : 
                      sessionPhase === 'contraction' ? (phaseTimeLeft / activeLevel.details.contractionDuration) * 100 :
                      sessionPhase === 'relaxation' ? (phaseTimeLeft / activeLevel.details.relaxationDuration) * 100 :
                      50
                    }%` 
                  }}
                />
              </div>

            </div>

            {/* QUICK REALTIME FORCE FEEDBACK DURING TRAINING */}
            {sessionPhase === 'contraction' && (
              <div className="w-full bg-[#111122]/90 border border-[#1A1A30] rounded-2xl p-4 flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs font-headline font-bold text-gray-400">
                  <span>Ajuster la force subjective ressentie :</span>
                  <span className="text-[#00E676] font-mono font-black">{feedbackForce}/10</span>
                </div>
                <input 
                  type="range"
                  min="1"
                  max="10"
                  value={feedbackForce}
                  onChange={(e) => setFeedbackForce(parseInt(e.target.value))}
                  className="w-full accent-[#00E676] h-1.5 bg-[#1C1C35] rounded-full cursor-pointer"
                />
              </div>
            )}

            {/* CONTROLS (Pause/Play) */}
            <div className="flex gap-4 items-center justify-center mt-4">
              <AlphaButton 
                variant={workoutPaused ? "gold" : "secondary"}
                onClick={() => setWorkoutPaused(!workoutPaused)}
                className="px-8 py-3.5 flex items-center gap-2 text-xs font-headline font-black uppercase cursor-pointer"
              >
                {workoutPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                {workoutPaused ? "Reprendre" : "Pause de respiration"}
              </AlphaButton>
            </div>

            {/* HUD DETAILS */}
            <div className="grid grid-cols-2 gap-4 w-full mt-2 text-center text-xs font-mono text-gray-400">
              <div className="bg-[#111122] p-2.5 rounded-xl border border-[#1A1A30]">
                <span>TEMPS ÉCOULÉ : </span>
                <span className="text-white font-bold">{totalElapsedTime}s</span>
              </div>
              <div className="bg-[#111122] p-2.5 rounded-xl border border-[#1A1A30]">
                <span>VICIÉES : </span>
                <span className="text-white font-bold">{repsCompleted} reps</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ======================= POST SESSION REPORT WORKSPACE ======================= */}
      {sessionPhase === 'finished' && activeLevel && (
        <div className="fixed inset-0 z-50 bg-[#0A0A12]/98 flex flex-col items-center justify-center p-6 overflow-y-auto backdrop-blur-lg animate-[fade-in_0.3s_ease-out]">
          <form onSubmit={handleSaveWorkout} className="w-full max-w-xl bg-[#111124] border border-[#1C1C38] rounded-3xl p-6 md:p-8 flex flex-col gap-6">
            
            <div className="text-center pb-4 border-b border-[#1C1C35]">
              <div className="w-16 h-16 rounded-full bg-[#FFD700]/10 flex items-center justify-center text-[#FFD700] mx-auto mb-3 shadow-[0_0_20px_rgba(255,215,0,0.15)] animate-bounce">
                <Trophy className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-headline font-black text-white">SÉANCE COMPLÉTÉE ! 🏆</h3>
              <p className="text-xs text-[#8E8E93] mt-1">
                Excellent effort, soldat. Ton plancher pelvien se restructure vers une puissance supérieure.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-[#0F0F1A] border border-[#1C1C35] p-3 rounded-2xl">
                <span className="text-[10px] font-headline font-bold text-gray-500 uppercase">TEMPS TOTAL</span>
                <h4 className="text-lg font-mono font-black mt-1">{totalElapsedTime} secondes</h4>
              </div>

              <div className="bg-[#0F0F1A] border border-[#1C1C35] p-3 rounded-2xl">
                <span className="text-[10px] font-headline font-bold text-gray-500 uppercase">NIVEAU VALIDÉ</span>
                <h4 className="text-lg font-mono font-black text-[#FFD700] mt-1">{activeLevel.name}</h4>
              </div>
            </div>

            {/* INTERACTIVE TRACKING VALUE ACCORDING TO LEVEL REQUIREMENTS */}
            <div className="flex flex-col gap-4 bg-[#0F0F1A] border border-[#1C1C35] p-4 rounded-2xl">
              
              {/* Level 1 specific sensory tracking */}
              {activeLevel.id === 1 ? (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-headline font-bold text-slate-300">
                    Sensation musculaire : As-tu réussi à isoler le muscle pelvien sans forcer les fessiers ?
                  </span>
                  <div className="grid grid-cols-2 gap-3 mt-1">
                    <button
                      type="button"
                      onClick={() => setFeelMuscleOk(true)}
                      className={`py-2 text-xs font-headline font-extrabold rounded-xl border cursor-pointer transition-all
                        ${feelMuscleOk 
                          ? 'bg-[#00E676]/10 border-[#00E676] text-[#00E676]' 
                          : 'bg-[#1C1C3A] border-[#2D2D4E] text-[#8E8E93]'
                        }
                      `}
                    >
                      Oui, clairement 🌱
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeelMuscleOk(false)}
                      className={`py-2 text-xs font-headline font-extrabold rounded-xl border cursor-pointer transition-all
                        ${!feelMuscleOk 
                          ? 'bg-[#E94560]/10 border-[#E94560] text-[#E94560]' 
                          : 'bg-[#1C1C3A] border-[#2D2D4E] text-[#8E8E93]'
                        }
                      `}
                    >
                      Non, difficile ⚠️
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs font-headline font-bold text-slate-300">
                    <label>Force contractile subjective de la séance :</label>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#00E676]/10 text-[#00E676] font-mono font-bold text-xs">
                      {feedbackForce}/10
                    </span>
                  </div>
                  <input 
                    type="range"
                    min="1"
                    max="10"
                    value={feedbackForce}
                    onChange={(e) => setFeedbackForce(parseInt(e.target.value))}
                    className="w-full accent-[#00E676] h-1.5 bg-[#1C1C35] rounded-full cursor-pointer"
                  />
                  <span className="text-[10px] text-gray-500 italic">
                    {feedbackForce >= 8 ? "Impulsion ultra-puissante d'acier." : feedbackForce >= 5 ? "Contrôle stable de base." : "Contraction faible, fatigue musculaire."}
                  </span>
                </div>
              )}

            </div>

            {/* NOTES */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-headline font-bold text-slate-300">Journal ou ressentis de la séance (optionnel)</label>
              <textarea
                placeholder="Ex: Légère tension au début, puis excellent contrôle sur la fin de la série..."
                value={feedbackNotes}
                onChange={(e) => setFeedbackNotes(e.target.value)}
                className="w-full h-20 p-3 bg-[#0F0F1A] border border-[#1C1C35] rounded-xl text-xs text-white focus:outline-none focus:border-[#FFD700] resize-none"
              />
            </div>

            {/* BUTTON SUBMIT AND CLAIM XP */}
            <AlphaButton
              variant="primary"
              className="py-4 text-xs font-headline font-black uppercase tracking-wider cursor-pointer"
            >
              Enregistrer ma séance & réclamer +{activeLevel.id * 15} XP de force
            </AlphaButton>

          </form>
        </div>
      )}

      {/* ======================= MAIN WORKSPACE HEADER ======================= */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] md:text-xs font-headline font-bold text-[#E94560] uppercase tracking-[0.25em]">
            PHASE 2 : BODY — KEGEL MASTER
          </span>
          <h2 className="text-2xl md:text-3xl font-headline font-extrabold text-white tracking-tight flex items-center gap-3">
            <Shield className="w-7 h-7 text-[#00E676]" />
            Kegel 10 Niveaux Master
          </h2>
          <p className="text-xs text-[#8E8E93] font-serif italic">
            &ldquo;Le plancher pelvien est le moteur. On le renforce quotidiennement.&rdquo;
          </p>
        </div>

        {/* STREAK HUD FLAME */}
        <div className="flex items-center gap-2.5 bg-[#0F0F1A] border border-[#1A1A2E] px-4.5 py-2 rounded-2xl shadow-md">
          <div className="w-9 h-9 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-400">
            <Flame className="w-5.5 h-5.5 fill-current animate-pulse" />
          </div>
          <div>
            <h5 className="text-[10px] font-headline font-bold text-[#8E8E93] uppercase">SÉRIE KEGEL</h5>
            <p className="font-mono text-sm font-black text-white">{kegelState.streak} JOURS</p>
          </div>
        </div>
      </div>

      {/* ======================= COGNITIVE SUB-TABS SELECTOR ======================= */}
      <div className="flex bg-[#0F0F1A] border border-[#1A1A2E] p-1.5 rounded-2xl w-full md:max-w-4xl overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveTab('dashboard_spec')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-headline font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap
            ${activeTab === 'dashboard_spec'
              ? 'bg-[#E94560] text-white shadow-lg shadow-[#E94560]/15'
              : 'text-[#8E8E93] hover:text-white hover:bg-[#16213E]/40'
            }
          `}
        >
          <Activity className="w-3.5 h-3.5 text-[#00D9A5]" />
          Dashboard Mobile (Spec 2.1)
        </button>

        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-headline font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap
            ${activeTab === 'dashboard'
              ? 'bg-[#E94560] text-white shadow-lg shadow-[#E94560]/15'
              : 'text-[#8E8E93] hover:text-white hover:bg-[#16213E]/40'
            }
          `}
        >
          <Activity className="w-3.5 h-3.5" />
          Tableau & Progrès
        </button>

        <button
          onClick={() => setActiveTab('levels')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-headline font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap
            ${activeTab === 'levels'
              ? 'bg-[#E94560] text-white shadow-lg shadow-[#E94560]/15'
              : 'text-[#8E8E93] hover:text-white hover:bg-[#16213E]/40'
            }
          `}
        >
          <Trophy className="w-3.5 h-3.5" />
          Les 10 Niveaux
        </button>

        <button
          onClick={() => setActiveTab('programme')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-headline font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap
            ${activeTab === 'programme'
              ? 'bg-[#E94560] text-white shadow-lg shadow-[#E94560]/15'
              : 'text-[#8E8E93] hover:text-white hover:bg-[#16213E]/40'
            }
          `}
        >
          <Sliders className="w-3.5 h-3.5" />
          Programme Adaptatif
        </button>

        <button
          onClick={() => setActiveTab('biofeedback')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-headline font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap
            ${activeTab === 'biofeedback'
              ? 'bg-[#E94560] text-white shadow-lg shadow-[#E94560]/15'
              : 'text-[#8E8E93] hover:text-white hover:bg-[#16213E]/40'
            }
          `}
        >
          <Zap className="w-3.5 h-3.5" />
          Biofeedback & Suivi
        </button>

        <button
          onClick={() => setActiveTab('physical')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-headline font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap
            ${activeTab === 'physical'
              ? 'bg-[#E94560] text-white shadow-lg shadow-[#E94560]/15'
              : 'text-[#8E8E93] hover:text-white hover:bg-[#16213E]/40'
            }
          `}
        >
          <Activity className="w-3.5 h-3.5" />
          Intégration Physique
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-headline font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap
            ${activeTab === 'history'
              ? 'bg-[#E94560] text-white shadow-lg shadow-[#E94560]/15'
              : 'text-[#8E8E93] hover:text-white hover:bg-[#16213E]/40'
            }
          `}
        >
          <Award className="w-3.5 h-3.5" />
          Logs de Séances
        </button>

        <button
          onClick={() => setActiveTab('mobile_blueprint')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-headline font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap
            ${activeTab === 'mobile_blueprint'
              ? 'bg-[#E94560] text-white shadow-lg shadow-[#E94560]/15'
              : 'text-[#8E8E93] hover:text-white hover:bg-[#16213E]/40'
            }
          `}
        >
          <Smartphone className="w-3.5 h-3.5" />
          Blueprint Mobile
        </button>
      </div>

      {/* ==================================== TAB RENDERINGS ==================================== */}

      {/* 0. TAB: KEGEL DASHBOARD SCREEN SPEC #2.1 */}
      {activeTab === 'dashboard_spec' && (
        <KegelDashboardScreen addToast={addToast} onBack={() => setActiveTab('dashboard')} />
      )}

      {/* 1. TAB: MAIN DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: MAIN LEVEL CARD & CIRCULAR PROGRESS RING */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* LARGE CENTERED DYNAMIC PROGRESS DISPLAY */}
            <AlphaCard variant="elevated" className="p-8 flex flex-col items-center justify-center text-center gap-6 relative overflow-hidden border-2 border-[#1C1C38]">
              
              {/* Background abstract layout */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#E94560]/5 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#00E676]/5 rounded-full blur-2xl pointer-events-none" />

              <span className="text-[10px] font-headline font-black text-[#FFD700] uppercase tracking-[0.25em] bg-[#FFD700]/10 border border-[#FFD700]/30 px-3 py-1 rounded-full">
                {currentLevel.weeks}
              </span>

              {/* CIRCULAR PROGRESS AROUND THE AVATAR RING */}
              <div className="relative w-48 h-48 flex items-center justify-center">
                
                {/* SVG Progress Circle */}
                <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Under track */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    stroke="#1C1C32" 
                    strokeWidth="4" 
                    fill="transparent" 
                  />
                  {/* Active fill */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    stroke={kegelState.currentLevelId >= 8 ? "#FFD700" : "#00E676"} 
                    strokeWidth="5" 
                    fill="transparent" 
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * levelProgressPercent) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>

                {/* Inner central avatar/badge */}
                <div className="w-36 h-36 bg-[#0E0E18] rounded-full border border-[#1C1C32] flex flex-col items-center justify-center shadow-inner relative z-10">
                  <span className="text-3xl md:text-4xl select-none mb-1.5">{currentLevel.badge.split(' ')[0]}</span>
                  <h3 className="text-xl font-headline font-black text-white">{currentLevel.name}</h3>
                  <span className="text-[9px] text-[#8E8E93] uppercase font-headline font-bold tracking-wider">NIVEAU {currentLevel.id}</span>
                </div>
              </div>

              {/* INLINE STATS & PROGRESS MOTIVATION */}
              <div className="w-full">
                <div className="flex justify-between items-center text-xs font-headline font-bold uppercase tracking-wider text-[#8E8E93] mb-2 px-4">
                  <span>Progression Niveau</span>
                  <span className="text-white font-mono">{levelProgressPercent}%</span>
                </div>

                <div className="bg-[#0A0A14] border border-[#1C1C30] p-4 rounded-2xl flex justify-between items-center text-left mx-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#E94560]/10 flex items-center justify-center text-[#E94560]">
                      <Star className="w-4 h-4 fill-current" />
                    </div>
                    <div>
                      <h4 className="text-xs font-headline font-bold text-white uppercase">Prochain Niveau : {nextLevel.name}</h4>
                      <p className="text-[10px] text-[#8E8E93]">
                        {sessionsNeeded > 0 
                          ? `Complétez encore ${sessionsNeeded} séances de Niveau ${currentLevel.id}` 
                          : "Prêt pour la mise à niveau immédiate !"}
                      </p>
                    </div>
                  </div>

                  <AlphaBadge variant={sessionsNeeded === 0 ? "gold" : "default"}>
                    {sessionsNeeded === 0 ? "PRÊT 🔥" : `${sessionsNeeded} RESTANTES`}
                  </AlphaBadge>
                </div>
              </div>

              {/* QUICK LAUNCH TRIGGER FOR DYNAMIC TRAINING */}
              <div className="w-full flex gap-3 px-2">
                <AlphaButton
                  variant="gold"
                  onClick={() => startWorkout(currentLevel)}
                  className="flex-1 py-4 text-xs font-headline font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4.5 h-4.5 fill-current" />
                  Démarrer la séance d'aujourd'hui
                </AlphaButton>
              </div>

            </AlphaCard>

          </div>

          {/* RIGHT: SHORT PROGRAM INFORMATION & STATS METRICS */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* ACTIVE PROGRAM RECAP CARD */}
            <AlphaCard variant="default" className="p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center pb-2 border-b border-[#1A1A2E]">
                <h3 className="text-xs font-headline font-extrabold uppercase tracking-widest text-[#E94560]">
                  Détail du programme actif
                </h3>
                <span className="text-[10px] text-gray-500 font-mono">NIV. {currentLevel.id}</span>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex justify-between text-xs font-headline">
                  <span className="text-gray-400">OBJECTIF PRINCIPAL :</span>
                  <span className="text-white font-extrabold text-right">{currentLevel.objective}</span>
                </div>

                <div className="flex justify-between text-xs font-headline border-t border-[#16162A]/60 pt-2.5">
                  <span className="text-gray-400">DURÉE SÉANCE :</span>
                  <span className="text-white font-extrabold font-mono">{currentLevel.duration}</span>
                </div>

                <div className="flex justify-between text-xs font-headline border-t border-[#16162A]/60 pt-2.5">
                  <span className="text-gray-400">FRÉQUENCE :</span>
                  <span className="text-white font-extrabold font-mono">{currentLevel.frequency}</span>
                </div>

                <div className="flex justify-between text-xs font-headline border-t border-[#16162A]/60 pt-2.5">
                  <span className="text-gray-400">SÉRIE TYPE :</span>
                  <span className="text-white font-extrabold text-right">{currentLevel.details.reps} Contractions (x{currentLevel.details.sets} Séries)</span>
                </div>
              </div>

              {/* UNLOCKED MODULE DETAILS */}
              <div className="bg-[#00E676]/5 border border-[#00E676]/15 p-4 rounded-xl flex gap-3 items-start mt-2">
                <Shield className="w-5 h-5 text-[#00E676] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[10px] font-headline font-bold text-white uppercase tracking-wider">
                    MODULE DÉBLOQUÉ
                  </h4>
                  <p className="text-[11px] text-[#8E8E93] mt-0.5 leading-relaxed">
                    {currentLevel.unlocks}
                  </p>
                </div>
              </div>

            </AlphaCard>

            {/* QUICK HISTORIC ANALYTICS COMPONENT */}
            <div className="flex flex-col gap-3.5">
              <span className="text-[10px] font-headline font-bold text-[#8E8E93] uppercase tracking-wider block px-1">
                Progression de Force Tactile (7 dernières séances)
              </span>

              {kegelState.completedSessions.length > 0 ? (
                <AlphaCard variant="default" className="p-4 flex flex-col gap-3">
                  <div className="relative w-full h-24">
                    <svg viewBox="0 0 400 100" className="w-full h-full overflow-visible">
                      {/* Grid */}
                      {[0, 0.5, 1].map((r, i) => (
                        <line key={i} x1="20" y1={10 + 80 * r} x2="380" y2={10 + 80 * r} stroke="#1A1A2E" strokeWidth="1" />
                      ))}

                      {(() => {
                        const history = kegelState.completedSessions.slice(-7);
                        const getX = (idx: number) => 20 + (idx / (history.length - 1)) * 360;
                        const getY = (val: number) => 90 - (val / 10) * 80;

                        const points = history.map((s, i) => `${getX(i)},${getY(s.subjectiveForce)}`).join(' ');

                        return (
                          <g>
                            {/* Area gradient under points */}
                            <polygon 
                              points={`20,90 ${points} 380,90`} 
                              fill="rgba(0, 230, 118, 0.05)" 
                            />
                            {/* Line */}
                            <polyline 
                              points={points} 
                              fill="none" 
                              stroke="#00E676" 
                              strokeWidth="2" 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                            />
                            {/* Nodes */}
                            {history.map((s, i) => (
                              <g key={i}>
                                <circle cx={getX(i)} cy={getY(s.subjectiveForce)} r="3" fill="#00E676" />
                                <text x={getX(i)} y={getY(s.subjectiveForce) - 8} textAnchor="middle" fill="#8E8E93" className="font-mono text-[8px]">
                                  F{s.subjectiveForce}
                                </text>
                              </g>
                            ))}
                          </g>
                        );
                      })()}
                    </svg>
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-[#8E8E93]">
                    <span>Y-axis: Force Subjective (1-10)</span>
                    <span>Analyse de Fatigue Pelvienne</span>
                  </div>
                </AlphaCard>
              ) : (
                <div className="h-28 flex items-center justify-center border border-dashed border-[#1A1A2E] rounded-2xl text-xs text-gray-500 bg-[#0F0F1A]/50">
                  Complétez une séance pour voir vos statistiques.
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* 2. TAB: THE 10 LEVELS */}
      {activeTab === 'levels' && (
        <div className="flex flex-col gap-4">
          <span className="text-xs font-headline font-bold text-[#8E8E93] uppercase tracking-widest block px-1">
            Les 10 Paliers Synaptiques et Pelviens ALPHA MAN
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {KEGEL_LEVELS.map((level) => {
              const isCurrent = level.id === kegelState.currentLevelId;
              const isUnlocked = level.id <= kegelState.currentLevelId;

              return (
                <AlphaCard 
                  key={level.id}
                  variant={isCurrent ? "elevated" : "default"}
                  className={`p-5 flex flex-col gap-4 relative overflow-hidden transition-all duration-300
                    ${isCurrent ? 'border-2 border-[#00E676] scale-[1.01]' : 'opacity-85'}
                    ${!isUnlocked ? 'border-dashed border-[#1C1C35]' : ''}
                  `}
                >
                  {/* Lock Indicator overlay for future levels */}
                  {!isUnlocked && (
                    <div className="absolute top-3 right-3 bg-[#1C1C35] px-2.5 py-1 rounded-full border border-gray-700/30 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-[9px] font-headline font-bold text-gray-500 uppercase">BLOQUÉ</span>
                    </div>
                  )}

                  {isCurrent && (
                    <div className="absolute top-3 right-3 bg-[#00E676]/10 px-2.5 py-1 rounded-full border border-[#00E676]/20 flex items-center gap-1 animate-pulse">
                      <Star className="w-3.5 h-3.5 text-[#00E676] fill-current" />
                      <span className="text-[9px] font-headline font-bold text-[#00E676] uppercase">PALIER ACTIF</span>
                    </div>
                  )}

                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-mono text-[#E94560] uppercase tracking-wider">{level.weeks}</span>
                    <h3 className="text-md font-headline font-black text-white flex items-center gap-2">
                      <span className="text-lg">{level.badge.split(' ')[0]}</span>
                      {level.name}
                    </h3>
                  </div>

                  <p className="text-xs text-[#8E8E93] leading-relaxed">
                    {level.program}
                  </p>

                  <div className="border-t border-[#1A1A2E] pt-3 flex flex-col gap-2 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Durée :</span>
                      <span className="text-white font-mono font-bold">{level.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Défis techniques :</span>
                      <span className="text-white font-headline font-bold text-right">
                        {level.details.hasElevator ? `Ascenseur (${level.details.elevatorFloors} étages)` : 'Contraction Standard Lente'}
                        {level.details.hasHoldAtMax ? ` • Hold at Max (${level.details.holdAtMaxDuration}s)` : ''}
                        {level.details.hasReverseKegel ? ' • Reverse Kegel' : ''}
                      </span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-gray-500">Débloque :</span>
                      <span className="text-[#00E676] font-headline font-bold text-right max-w-[140px] leading-tight">
                        {level.unlocks}
                      </span>
                    </div>
                  </div>

                  {isUnlocked ? (
                    <AlphaButton
                      variant={isCurrent ? "gold" : "secondary"}
                      onClick={() => startWorkout(level)}
                      className="w-full mt-2 py-2 text-xs font-headline font-bold uppercase tracking-wide cursor-pointer"
                    >
                      Démarrer le niveau {level.id}
                    </AlphaButton>
                  ) : (
                    <div className="w-full bg-[#1A1A2E]/50 text-center py-2 text-xs font-headline font-bold uppercase rounded-xl text-gray-600 border border-transparent select-none mt-2">
                      Verrouillé par les étapes antérieures
                    </div>
                  )}

                </AlphaCard>
              );
            })}
          </div>

        </div>
      )}

      {/* 3. TAB: LOGS / HISTORY */}
      {activeTab === 'history' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* History list */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <span className="text-xs font-headline font-bold text-[#8E8E93] uppercase tracking-widest block px-1">
              Historique de Restructuration Pelvienne ({sessionsCompletedCount} Séances complétées)
            </span>

            {kegelState.completedSessions.length === 0 ? (
              <div className="bg-[#111122]/60 border border-dashed border-[#1A1A2E] p-12 rounded-3xl text-center text-xs text-gray-500">
                Aucune séance n'est enregistrée dans le journal pelvien.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {kegelState.completedSessions.slice().reverse().map((session) => (
                  <AlphaCard key={session.id} variant="default" className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#00E676]/10 flex items-center justify-center text-[#00E676]">
                        <Check className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-headline font-black text-white">Niveau {session.levelId} : {session.levelName}</h4>
                          <span className="text-[10px] font-mono text-gray-500 bg-[#1C1C35] px-2 py-0.5 rounded border border-gray-700/30">{session.date} • {session.time}</span>
                        </div>
                        <p className="text-[11px] text-[#8E8E93] leading-relaxed mt-1">
                          Note : &ldquo;{session.notes}&rdquo;
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-end gap-3 sm:gap-1 shrink-0">
                      <div className="flex items-center gap-1 font-mono text-xs text-[#00E676] bg-[#00E676]/10 px-2.5 py-0.5 rounded-full font-bold">
                        <span>Force :</span>
                        <span>{session.subjectiveForce}/10</span>
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono">{session.durationSeconds} secondes sous tension</span>
                    </div>

                  </AlphaCard>
                ))}
              </div>
            )}
          </div>

          {/* Side summaries / performance reports */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <AlphaCard variant="default" className="p-5 flex flex-col gap-4">
              <div className="flex justify-between items-center pb-2 border-b border-[#1A1A2E]">
                <h3 className="text-xs font-headline font-extrabold uppercase tracking-widest text-[#E94560]">
                  Rapport de Force Total
                </h3>
                <span className="text-lg">📈</span>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[11px] text-[#8E8E93] leading-relaxed">
                  L'exercice régulier de contraction du plancher pelvien (PC) engendre une augmentation de l'influx nerveux à travers le nerf honteux (pudendal), renforçant la souveraineté érectile et l'inhibition des urges réflexes de rechute.
                </span>

                <div className="bg-[#0F0F1A] p-3.5 rounded-xl border border-[#1C1C32] mt-2 flex flex-col gap-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 font-headline">SÉANCES COMPLÉTÉES :</span>
                    <span className="text-white font-mono font-bold">{sessionsCompletedCount}</span>
                  </div>
                  <div className="flex justify-between text-xs border-t border-[#1C1C32] pt-2">
                    <span className="text-gray-500 font-headline">XP VITALITÉ ACQUIS :</span>
                    <span className="text-[#FFD700] font-mono font-bold">+{kegelState.totalXP} XP</span>
                  </div>
                </div>
              </div>
            </AlphaCard>
          </div>

        </div>
      )}

      {/* 4. TAB: MOBILE BLUEPRINT CODE EXPORTER */}
      {activeTab === 'mobile_blueprint' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Architectural specs */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <span className="text-xs font-headline font-bold text-[#8E8E93] uppercase tracking-widest block px-1">
              Spécifications d'Intégration Mobile
            </span>

            <AlphaCard variant="default" className="p-5 flex flex-col gap-4">
              <h4 className="text-sm font-headline font-black text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#E94560]" />
                Intégration Haptic React Native
              </h4>
              <p className="text-xs text-[#8E8E93] leading-relaxed">
                Le module mobile ALPHA MAN utilise l'API native d'haptic feedback pour piloter des micro-vibrations rythmiques. Ceci permet de s'entraîner les yeux fermés (écran éteint dans la poche) en se basant uniquement sur la stimulation haptique :
              </p>

              <div className="flex flex-col gap-2.5 text-xs">
                <div className="bg-[#0F0F1A] p-3 rounded-xl border border-[#1A1A2E] flex justify-between items-center">
                  <span className="text-white font-bold">Contraction Standard :</span>
                  <span className="text-[#00E676] font-mono font-extrabold">Vibration Unique (200ms)</span>
                </div>

                <div className="bg-[#0F0F1A] p-3 rounded-xl border border-[#1A1A2E] flex justify-between items-center">
                  <span className="text-white font-bold">Relâchement :</span>
                  <span className="text-[#3B82F6] font-mono font-extrabold">Deux micro-bips (50ms)</span>
                </div>

                <div className="bg-[#0F0F1A] p-3 rounded-xl border border-[#1A1A2E] flex justify-between items-center">
                  <span className="text-white font-bold">Hold At Max / Ascension :</span>
                  <span className="text-[#FFD700] font-mono font-extrabold">Vibration Pulsée Forte (500ms)</span>
                </div>
              </div>
            </AlphaCard>
          </div>

          {/* Interactive Code block */}
          <div className="lg:col-span-7 bg-[#111124] border border-[#1C1C38] rounded-3xl p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-[#1C1C35] pb-3">
              <div>
                <h4 className="text-xs font-headline font-black text-white">Composant Natif React Native (TypeScript)</h4>
                <p className="text-[10px] text-gray-500">Prêt pour import dans Xcode / Android Studio</p>
              </div>

              <AlphaButton 
                variant="secondary" 
                size="sm" 
                onClick={() => handleCopyCode(reactNativeCodeMock)}
                className="flex items-center gap-2 text-[10px] font-headline"
              >
                <Copy className="w-3.5 h-3.5" />
                Copier le Code
              </AlphaButton>
            </div>

            <pre className="p-4 bg-[#0A0A14] rounded-2xl border border-[#1A1A2E] overflow-x-auto text-[10px] md:text-xs font-mono text-gray-300 leading-relaxed max-h-[420px] custom-scrollbar">
              {reactNativeCodeMock}
            </pre>
          </div>

        </div>
      )}

      {/* 5. TAB: REAL-TIME BIOFEEDBACK & FORCE TRACKING */}
      {activeTab === 'biofeedback' && (
        <AlphaKegelBiofeedback addToast={addToast} onPointsUpdate={onPointsUpdate} />
      )}

      {/* 6. TAB: ADAPTATIVE TRAINING PROGRAMME */}
      {activeTab === 'programme' && (
        <AlphaKegelProgramme addToast={addToast} onPointsUpdate={onPointsUpdate} />
      )}

      {/* 7. TAB: PHYSICAL INTEGRATION & FITNESS */}
      {activeTab === 'physical' && (
        <AlphaKegelPhysical addToast={addToast} onPointsUpdate={onPointsUpdate} onBack={() => setActiveTab('dashboard')} />
      )}

    </div>
  );
};
