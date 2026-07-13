import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Trophy,
  Shield,
  Activity,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Award,
  ChevronRight,
  TrendingUp,
  Sliders,
  Play,
  Share2,
  RotateCcw,
  Check,
  Zap,
  Info,
  CalendarDays,
  ListCollapse,
  UserCheck,
  BookOpen,
  Eye,
  Heart,
  HeartHandshake
} from 'lucide-react';

import {
  programmeService,
  SPECIALIZED_PROGRAMS,
  TrainingProgram,
  ProgramState,
  ProgramObjectiveProfile,
  CustomReminder
} from '../pattern_killer/programmeService';
import { kegelService } from '../pattern_killer/kegelService';
import { AlphaCard } from './AlphaCard';
import { AlphaButton } from './AlphaButton';
import { AlphaBadge } from './AlphaBadge';

interface AlphaKegelProgrammeProps {
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
  onPointsUpdate?: (newPoints: number) => void;
}

export const AlphaKegelProgramme: React.FC<AlphaKegelProgrammeProps> = ({ addToast, onPointsUpdate }) => {
  // States
  const [progState, setProgState] = useState<ProgramState>(() => programmeService.getState());
  const [kegelState, setKegelState] = useState(() => kegelService.getState());
  const [activeSubSection, setActiveSubSection] = useState<'profile' | 'programs' | 'planner' | 'ai_engine' | 'report'>('profile');

  // Interactive profile edits
  const [editingProfile, setEditingProfile] = useState<ProgramObjectiveProfile>({ ...progState.profile });

  // Adaptation simulation states
  const [simulationResult, setSimulationResult] = useState<{
    levelChange: number;
    adaptationMessage: string;
    actionTaken: string;
  } | null>(null);

  // Sync states on service changes
  useEffect(() => {
    const handleUpdate = () => {
      setProgState(programmeService.getState());
      setKegelState(kegelService.getState());
    };
    window.addEventListener('alphaman_program_updated', handleUpdate);
    window.addEventListener('alphaman_kegel_updated', handleUpdate);
    return () => {
      window.removeEventListener('alphaman_program_updated', handleUpdate);
      window.removeEventListener('alphaman_kegel_updated', handleUpdate);
    };
  }, []);

  // Save profile edits
  const handleSaveProfile = (updates: Partial<ProgramObjectiveProfile>) => {
    programmeService.updateProfile(updates);
    setEditingProfile(prev => ({ ...prev, ...updates }));
    addToast('success', "Profil d'objectifs mis à jour. Programme adapté en conséquence !");
    
    // Auto shift view to show the newly activated program
    setTimeout(() => {
      setActiveSubSection('programs');
    }, 1200);
  };

  // Toggle day schedule
  const handleToggleSchedule = (day: string, slot: 'Matin' | 'Midi' | 'Soir') => {
    programmeService.toggleScheduleDay(day, slot);
    addToast('info', `Emplacement du ${day} (${slot}) mis à jour.`);
  };

  // Select program
  const handleSelectProgram = (programId: string) => {
    programmeService.setProgramId(programId);
    addToast('success', `Programme spécialisé activé avec succès !`);
  };

  // Toggle reminder
  const handleToggleReminder = (id: string) => {
    programmeService.toggleReminder(id);
    addToast('success', "Préférence de rappel mise à jour.");
  };

  // Shift modes
  const handleSetMode = (mode: 'standard' | 'vacation' | 'intensive') => {
    programmeService.setTrainingMode(mode);
    if (mode === 'vacation') {
      addToast('warning', "Mode Vacances activé. Votre streak de jours consécutifs est verrouillé ! Entraînement réduit.");
    } else if (mode === 'intensive') {
      addToast('success', "Mode Intensif activé ! Préparez-vous à doubler vos séances cette semaine.");
    } else {
      addToast('info', "Mode Standard restauré.");
    }
  };

  // Trigger simulated AI Adaptations
  const runSimulatedRule = (ruleType: 'pain' | 'missed' | 'progression' | 'stagnation' | 'streak') => {
    let outcome;
    if (ruleType === 'pain') {
      outcome = programmeService.runAdaptationDiagnostics("sens de légers tiraillements fessiers", 8, 0, true, 0);
    } else if (ruleType === 'missed') {
      outcome = programmeService.runAdaptationDiagnostics("aucun", 8, 0, false, 3);
    } else if (ruleType === 'progression') {
      outcome = programmeService.runAdaptationDiagnostics("très fort, aucun problème", 8, 25, false, 0);
      if (onPointsUpdate) onPointsUpdate(kegelState.totalXP + 50);
    } else if (ruleType === 'stagnation') {
      // Simulate stagnant state increase
      const state = programmeService.getState();
      state.stagnantWeeksCount = 2;
      programmeService.saveState(state);
      outcome = programmeService.runAdaptationDiagnostics("stable depuis 3 semaines", 8, 0, false, 0);
    } else {
      outcome = programmeService.runAdaptationDiagnostics("génial", 10, 0, false, 0);
      if (onPointsUpdate) onPointsUpdate(kegelState.totalXP + 100);
    }

    setSimulationResult(outcome);
    addToast('success', `Algorithme d'adaptation IA exécuté : ${outcome.actionTaken}`);
  };

  // Get active program data
  const activeProgram = SPECIALIZED_PROGRAMS.find(p => p.id === progState.selectedProgramId) || SPECIALIZED_PROGRAMS[0];

  // Calculations for compliance metrics
  const totalSlotsCount = progState.scheduleEvents.length;
  const completedSlotsCount = progState.scheduleEvents.filter(e => e.completed).length;
  const complianceRate = totalSlotsCount > 0 ? Math.round((completedSlotsCount / totalSlotsCount) * 100) : 0;

  return (
    <div id="alpha-personalized-program-container" className="flex flex-col gap-6 w-full text-white animate-[fade-in_0.3s_ease-out]">
      
      {/* ======================= HEADER BANNER ======================= */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0A0A14] border border-[#1A1A30] p-5 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-48 h-48 bg-[#E94560]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-[#FFD700] to-[#E94560] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#E94560]/10 shrink-0">
            <Sliders className="w-8 h-8 animate-pulse text-white" />
          </div>
          <div>
            <span className="text-[10px] font-headline font-bold text-[#FFD700] uppercase tracking-[0.2em] block">
              SYSTÈME ADAPTATIF ALPHA INTELLIGENCE
            </span>
            <h2 className="text-xl md:text-2xl font-headline font-black tracking-tight">
              Programme Kegel Personnalisé
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Configuration de vos objectifs d'érection, de contrôle et d'adaptation neuro-pelvienne en temps réel.
            </p>
          </div>
        </div>

        {/* Action Mode Controls */}
        <div className="flex items-center gap-2 bg-black/40 border border-[#1C1C35] p-1.5 rounded-2xl shrink-0">
          <button
            onClick={() => handleSetMode('standard')}
            className={`px-3 py-1.5 rounded-xl text-xs font-headline font-bold uppercase transition-colors cursor-pointer
              ${progState.trainingMode === 'standard' ? 'bg-[#16213E] text-white border border-[#1A1A3F]' : 'text-gray-400 hover:text-white'}
            `}
          >
            Standard
          </button>
          <button
            onClick={() => handleSetMode('vacation')}
            className={`px-3 py-1.5 rounded-xl text-xs font-headline font-bold uppercase transition-colors cursor-pointer
              ${progState.trainingMode === 'vacation' ? 'bg-[#FFD700] text-black font-black' : 'text-gray-400 hover:text-white'}
            `}
          >
            ☀️ Vacances
          </button>
          <button
            onClick={() => handleSetMode('intensive')}
            className={`px-3 py-1.5 rounded-xl text-xs font-headline font-bold uppercase transition-colors cursor-pointer
              ${progState.trainingMode === 'intensive' ? 'bg-[#E94560] text-white font-black' : 'text-gray-400 hover:text-white'}
            `}
          >
            🔥 Intensif
          </button>
        </div>
      </div>

      {/* ======================= INTERNAL SUB SECTION SELECTORS ======================= */}
      <div className="flex bg-[#0F0F1A] border border-[#1A1A2E] p-1.5 rounded-2xl w-full overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveSubSection('profile')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-headline font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap
            ${activeSubSection === 'profile' ? 'bg-[#E94560] text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-[#16213E]/30'}
          `}
        >
          <UserCheck className="w-3.5 h-3.5" />
          1. Profil d'Objectifs
        </button>

        <button
          onClick={() => setActiveSubSection('programs')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-headline font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap
            ${activeSubSection === 'programs' ? 'bg-[#E94560] text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-[#16213E]/30'}
          `}
        >
          <Award className="w-3.5 h-3.5" />
          2. Programmes Spécialisés
        </button>

        <button
          onClick={() => setActiveSubSection('planner')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-headline font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap
            ${activeSubSection === 'planner' ? 'bg-[#E94560] text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-[#16213E]/30'}
          `}
        >
          <CalendarDays className="w-3.5 h-3.5" />
          3. Planning & Rappels
        </button>

        <button
          onClick={() => setActiveSubSection('ai_engine')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-headline font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap
            ${activeSubSection === 'ai_engine' ? 'bg-[#E94560] text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-[#16213E]/30'}
          `}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#FFD700]" />
          4. Adaptation IA
        </button>

        <button
          onClick={() => setActiveSubSection('report')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-headline font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap
            ${activeSubSection === 'report' ? 'bg-[#E94560] text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-[#16213E]/30'}
          `}
        >
          <Trophy className="w-3.5 h-3.5" />
          5. Rapport Hebdomadaire
        </button>
      </div>

      {/* ==================================== SECTION 1: PROFIL D'OBJECTIFS ==================================== */}
      {activeSubSection === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main objective form */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <AlphaCard variant="default" className="p-6 flex flex-col gap-5">
              <div>
                <h3 className="text-sm font-headline font-black text-white uppercase flex items-center gap-2">
                  <Heart className="w-4.5 h-4.5 text-[#E94560]" />
                  Définissez votre profil d'objectif pelvien
                </h3>
                <p className="text-xs text-gray-400 mt-1">Configurez vos priorités pour adapter les charges musculaires.</p>
              </div>

              {/* 1. Primary Goal Selection */}
              <div className="flex flex-col gap-2.5">
                <label className="text-xs font-headline font-bold text-gray-300 uppercase tracking-wider">
                  Objectif principal :
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { id: 'performance', title: "Performance sexuelle", desc: "Verrouillage de la force érectile & érection d'acier", emoji: "🚀" },
                    { id: 'control', title: "Contrôle de l'éjaculation", desc: "Prévention de la PE, reverse Kegel et endurance", emoji: "🛑" },
                    { id: 'health', title: "Santé du plancher pelvien", desc: "Post-opératoire, incontinence ou renforcement préventif", emoji: "🛡️" },
                    { id: 'confidence', title: "Confiance & Énergie générale", desc: "Tonification globale et vitalité pelvienne interne", emoji: "👑" },
                    { id: 'all', title: "Toutes ces réponses à la fois", desc: "Le programme ultime Master d'ALPHA MAN", emoji: "🔥" }
                  ].map((goal) => (
                    <button
                      key={goal.id}
                      onClick={() => handleSaveProfile({ primaryGoal: goal.id as any })}
                      className={`p-4 rounded-2xl text-left border cursor-pointer transition-all flex gap-3 items-start duration-150 active:scale-95
                        ${progState.profile.primaryGoal === goal.id
                          ? 'bg-[#E94560]/10 border-[#E94560] shadow-md shadow-[#E94560]/5'
                          : 'bg-black/20 border-[#1A1A32] hover:bg-[#16213E]/20 hover:border-[#1C2340]'
                        }
                      `}
                    >
                      <span className="text-2xl shrink-0 mt-0.5">{goal.emoji}</span>
                      <div>
                        <span className="text-xs font-headline font-black block text-white">{goal.title}</span>
                        <span className="text-[10px] text-gray-400 block mt-0.5">{goal.desc}</span>
                      </div>
                      {progState.profile.primaryGoal === goal.id && (
                        <div className="ml-auto w-5 h-5 bg-[#E94560] rounded-full flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Pace / Duration Track */}
              <div className="flex flex-col gap-2.5 mt-2">
                <label className="text-xs font-headline font-bold text-gray-300 uppercase tracking-wider">
                  Rythme d'entraînement souhaité :
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { id: 'fast', title: "Renforcement Rapide", desc: "3 mois intensifs", badge: "INTENSE" },
                    { id: 'progressive', title: "Renforcement Progressif", desc: "6 mois rythmés", badge: "STANDARD" },
                    { id: 'maintenance', title: "Maintenance", desc: "Garder son niveau d'acier", badge: "DOUX" }
                  ].map((track) => (
                    <button
                      key={track.id}
                      onClick={() => handleSaveProfile({ durationTrack: track.id as any })}
                      className={`p-3.5 rounded-xl text-left border cursor-pointer transition-all flex flex-col justify-between h-24 duration-150 active:scale-95
                        ${progState.profile.durationTrack === track.id
                          ? 'bg-[#E94560]/15 border-[#E94560]'
                          : 'bg-black/20 border-[#1A1A32] hover:bg-[#16213E]/20 hover:border-[#1C2340]'
                        }
                      `}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="text-xs font-headline font-black text-white">{track.title}</span>
                        <AlphaBadge variant={track.id === 'fast' ? 'alert' : track.id === 'progressive' ? 'info' : 'default'}>
                          {track.badge}
                        </AlphaBadge>
                      </div>
                      <span className="text-[10px] text-gray-400 block mt-2">{track.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Constraints */}
              <div className="flex flex-col gap-2.5 mt-2">
                <label className="text-xs font-headline font-bold text-gray-300 uppercase tracking-wider">
                  Contraintes physiologiques ou antécédents :
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { id: 'never', title: "Je n'ai jamais fait d'exercices Kegel", desc: "Commencer avec des cycles ultra isolés" },
                    { id: 'before', title: "J'ai déjà fait du renforcement pelvien avant", desc: "Baseline calibrée au niveau intermédiaire" },
                    { id: 'pain', title: "J'ai parfois des tensions / douleurs légères", desc: "Contractions limitées, focus relaxation active" },
                    { id: 'post_op', title: "Je suis en rééducation post-opératoire", desc: "Série progressive douce approuvée médicalement" }
                  ].map((experience) => (
                    <button
                      key={experience.id}
                      onClick={() => handleSaveProfile({ experienceLevel: experience.id as any })}
                      className={`p-3 rounded-xl text-left border cursor-pointer transition-all flex gap-3 items-center duration-150 active:scale-95
                        ${progState.profile.experienceLevel === experience.id
                          ? 'bg-[#E94560]/15 border-[#E94560]'
                          : 'bg-black/20 border-[#1A1A32] hover:bg-[#16213E]/20 hover:border-[#1C2340]'
                        }
                      `}
                    >
                      <div className="flex-1">
                        <span className="text-xs font-headline font-black block text-white">{experience.title}</span>
                        <span className="text-[9px] text-gray-400 block mt-0.5">{experience.desc}</span>
                      </div>
                      {progState.profile.experienceLevel === experience.id && (
                        <div className="w-4 h-4 bg-[#E94560] rounded-full flex items-center justify-center shrink-0">
                          <Check className="w-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

            </AlphaCard>
          </div>

          {/* Right Smart Advice Card */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <AlphaCard variant="elevated" className="p-5 flex flex-col gap-4 border border-[#FFD700]/10">
              <div className="flex items-center gap-2 pb-2 border-b border-[#1C1C35]">
                <Sparkles className="w-4 h-4 text-[#FFD700] animate-pulse" />
                <h3 className="text-xs font-headline font-extrabold text-[#FFD700] uppercase tracking-wider">
                  Recommandation IA Immédiate
                </h3>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-[10px] text-gray-400 font-mono">DÉTECTION DE PROFIL ALPHA</span>
                
                {progState.profile.primaryGoal === 'performance' && (
                  <p className="text-xs text-gray-200 leading-relaxed">
                    Votre priorité est la <strong>Performance sexuelle érectile</strong>. L'algorithme d'ALPHA MAN vous a affecté au programme <strong>"Performance Totale"</strong>. Il augmentera de 12% les contractions brutes prolongées et intégrera des séances de vitesse flash pour renforcer l'afflux sanguin vers le muscle bulbo-caverneux.
                  </p>
                )}
                {progState.profile.primaryGoal === 'control' && (
                  <p className="text-xs text-gray-200 leading-relaxed">
                    Votre priorité est le <strong>Contrôle de l'éjaculation</strong>. Le programme <strong>"Contrôle PE"</strong> a été automatiquement mis en place. Il insiste lourdement sur les étirements actifs (Reverse Kegel) et le relâchement conscient à 100%.
                  </p>
                )}
                {progState.profile.primaryGoal === 'health' && (
                  <p className="text-xs text-gray-200 leading-relaxed">
                    Votre profil est orienté vers la <strong>Santé du plancher pelvien</strong>. Votre programme est calibré sur une rééducation post-opératoire lente et fluide avec des séries d'activation fessière légère de 5 minutes par jour maximum.
                  </p>
                )}
                {progState.profile.primaryGoal === 'all' && (
                  <p className="text-xs text-gray-200 leading-relaxed">
                    Vous avez choisi <strong>l'Évolution Totale</strong>. Vous êtes affecté au <strong>"Alpha Challenge 30 Jours"</strong>, notre programme le plus exigeant qui alterne contractions de puissance et Reverse Kegel.
                  </p>
                )}

                <div className="bg-[#111124] p-3 rounded-xl border border-[#1C1C35] flex items-start gap-2.5 mt-2">
                  <Info className="w-4.5 h-4.5 text-[#FFD700] shrink-0 mt-0.5" />
                  <span className="text-[10px] text-gray-400 leading-relaxed">
                    Changer l'objectif principal reconfigure instantanément la structure des exercices sans réinitialiser vos statistiques ni votre niveau actuel.
                  </span>
                </div>
              </div>
            </AlphaCard>
          </div>

        </div>
      )}

      {/* ==================================== SECTION 2: PROGRAMMES SPÉCIALISÉS ==================================== */}
      {activeSubSection === 'programs' && (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-headline font-bold text-[#8E8E93] uppercase tracking-widest">
              5 Protocoles d'entraînement pelvien exclusifs
            </span>
            <AlphaBadge variant="gold">ÉDITION MASTER</AlphaBadge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left list of 5 programs */}
            <div className="lg:col-span-4 flex flex-col gap-3">
              {SPECIALIZED_PROGRAMS.map((program) => (
                <button
                  key={program.id}
                  onClick={() => handleSelectProgram(program.id)}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex items-center gap-3 duration-150 active:scale-95
                    ${progState.selectedProgramId === program.id
                      ? 'bg-gradient-to-r from-[#E94560]/10 to-[#1A1A3C] border-[#E94560] shadow-md'
                      : 'bg-[#0A0A14] border-[#16213A] hover:bg-[#16213E]/20 hover:border-[#1C2C55]'
                    }
                  `}
                >
                  <span className="text-2xl shrink-0">{program.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-headline font-black text-white truncate">{program.name}</span>
                      {progState.selectedProgramId === program.id && (
                        <span className="text-[8px] bg-[#E94560] text-white px-1 rounded font-bold font-mono">ACTIF</span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 block truncate mt-0.5">{program.tagline}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-500 shrink-0" />
                </button>
              ))}
            </div>

            {/* Right detailed program description card */}
            <div className="lg:col-span-8">
              <AlphaCard variant="elevated" className="p-6 flex flex-col gap-5 border border-[#1C1C3E] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700]/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex justify-between items-start pb-3 border-b border-[#1C1C35]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{activeProgram.emoji}</span>
                      <div>
                        <h3 className="text-lg font-headline font-black text-white uppercase">{activeProgram.name}</h3>
                        <span className="text-xs text-gray-400 block mt-0.5">{activeProgram.tagline}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-gray-500 font-mono block">DIFFICULTÉ :</span>
                    <span className="text-xs font-headline font-extrabold text-[#E94560] uppercase">{activeProgram.difficulty}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="bg-[#111124] p-3.5 rounded-xl border border-[#1C1C35] text-xs">
                    <span className="font-headline font-extrabold text-[#FFD700] uppercase block">GUIDE DE MAÎTRISE</span>
                    <p className="text-gray-300 mt-1 leading-relaxed">{activeProgram.focusText}</p>
                    <div className="mt-2.5 flex justify-between items-center text-gray-400 font-mono text-[10px]">
                      <span>Temps quotidien estimé :</span>
                      <span className="text-white font-bold">{activeProgram.dailyDurationMin} minutes / jour</span>
                    </div>
                  </div>

                  {/* List of exercises inside the program */}
                  <div className="flex flex-col gap-3">
                    <span className="text-[10px] font-headline font-bold text-gray-500 uppercase tracking-widest px-1">Structure du protocole d'exercices :</span>
                    {activeProgram.exercises.map((exercise, idx) => (
                      <div key={idx} className="bg-black/20 p-3 rounded-xl border border-[#1A1A35] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="flex-1">
                          <span className="text-xs font-headline font-black text-white block">
                            {idx + 1}. {exercise.name}
                          </span>
                          <span className="text-[10px] text-gray-400 block mt-0.5 leading-relaxed">
                            {exercise.description}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 shrink-0 font-mono text-[11px]">
                          <div className="text-center">
                            <span className="text-gray-500 text-[9px] block">RÉPS :</span>
                            <span className="text-white font-bold">{exercise.reps}x</span>
                          </div>
                          <div className="text-center border-l border-[#1C1C35] pl-4">
                            <span className="text-gray-500 text-[9px] block">TENUE :</span>
                            <span className="text-[#00E676] font-bold">{exercise.holdSec}s</span>
                          </div>
                          <div className="text-center border-l border-[#1C1C35] pl-4">
                            <span className="text-gray-500 text-[9px] block">RELAX :</span>
                            <span className="text-[#E94560] font-bold">{exercise.relaxSec}s</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quick stats comparison for level unlock */}
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#FFD700]/5 to-transparent rounded-xl border border-[#FFD700]/10 mt-2">
                    <Award className="w-5 h-5 text-[#FFD700]" />
                    <span className="text-xs text-gray-300 leading-relaxed">
                      Ce programme s'aligne automatiquement avec votre niveau <strong>Novice à Alpha</strong> actuel ({kegelState.currentLevelId}/10) pour en graduer dynamiquement la tension.
                    </span>
                  </div>

                </div>
              </AlphaCard>
            </div>
          </div>
        </div>
      )}

      {/* ==================================== SECTION 3: PLANNING & REMINDERS ==================================== */}
      {activeSubSection === 'planner' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left panel: Calendar schedule grid */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <AlphaCard variant="default" className="p-5 flex flex-col gap-4">
              <div className="flex justify-between items-center pb-2 border-b border-[#1C1C35]">
                <h3 className="text-xs font-headline font-extrabold uppercase tracking-wider text-[#00E676] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#00E676]" />
                  Calendrier intelligent & Horaires suggérés
                </h3>
                <span className="text-xs text-[#00E676] font-mono font-bold">Complété : {complianceRate}%</span>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed">
                Planifiez vos 3 impulsions de 5 minutes par jour. Cliquez sur les créneaux pour marquer un exercice terminé ou planifier à l'avance.
              </p>

              {/* Weekly Calendar grid */}
              <div className="grid grid-cols-1 sm:grid-cols-7 gap-3 mt-1">
                {["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"].map((day) => {
                  return (
                    <div key={day} className="bg-black/30 border border-[#1A1A35] p-3 rounded-xl flex flex-col gap-2.5">
                      <span className="text-[11px] font-headline font-black text-white text-center block pb-1 border-b border-[#1C1C38]">{day}</span>
                      
                      {/* Slots Matin, Midi, Soir */}
                      {["Matin", "Midi", "Soir"].map((slot) => {
                        const event = progState.scheduleEvents.find(e => e.day === day && e.sessionTime === slot);
                        const isCompleted = event ? event.completed : false;

                        return (
                          <button
                            key={slot}
                            onClick={() => handleToggleSchedule(day, slot as any)}
                            className={`p-2 rounded-lg text-[9px] font-headline font-bold uppercase tracking-wider text-center cursor-pointer border transition-all duration-100 flex flex-col items-center gap-1
                              ${isCompleted
                                ? 'bg-[#00E676]/10 text-[#00E676] border-[#00E676]/30 shadow-sm'
                                : 'bg-[#111124] text-gray-500 border-transparent hover:border-[#1C1C45] hover:text-white'
                              }
                            `}
                          >
                            <span>{slot}</span>
                            {isCompleted ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#00E676]" />
                            ) : (
                              <Clock className="w-3.5 h-3.5 text-gray-600" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono mt-2">
                <span>Astuce : Un plancher pelvien s'entraîne avec régularité.</span>
                <span>Taux de compliance recommandé : &gt;80%</span>
              </div>
            </AlphaCard>
          </div>

          {/* Right panel: Custom Reminders list */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <AlphaCard variant="default" className="p-5 flex flex-col gap-4">
              <div className="flex justify-between items-center pb-2 border-b border-[#1C1C35]">
                <h3 className="text-xs font-headline font-extrabold uppercase tracking-wider text-[#FFD700] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#FFD700]" />
                  Rappels Intelligents
                </h3>
                <span className="text-[10px] text-gray-500 font-mono">PUSH ACTIVÉ</span>
              </div>

              <div className="flex flex-col gap-3">
                {progState.reminders.map((reminder) => (
                  <div key={reminder.id} className="bg-black/20 p-3 rounded-xl border border-[#1A1A35] flex justify-between items-center">
                    <div>
                      <span className="text-xs font-headline font-black text-white block">{reminder.label}</span>
                      <span className="text-[10px] text-gray-400 font-mono block mt-0.5">{reminder.time}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={reminder.enabled} 
                        onChange={() => handleToggleReminder(reminder.id)} 
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-[#1C1C35] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00E676]" />
                    </label>
                  </div>
                ))}
              </div>

              <div className="bg-[#111124] p-3 rounded-xl border border-[#1C1C35] text-[10px] text-gray-400 flex gap-2">
                <Info className="w-4.5 h-4.5 text-[#FFD700] shrink-0 mt-0.5" />
                <span>Rappels contextuels : "Tu as 5 min avant ta réunion. Kegel ?" pour s'adapter à votre agenda.</span>
              </div>
            </AlphaCard>
          </div>

        </div>
      )}

      {/* ==================================== SECTION 4: AI ADAPTATION ENGINE ==================================== */}
      {activeSubSection === 'ai_engine' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Diagnostic Simulation Console */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <AlphaCard variant="default" className="p-5 flex flex-col gap-4">
              <div className="flex justify-between items-center pb-2 border-b border-[#1C1C35]">
                <h3 className="text-xs font-headline font-extrabold uppercase tracking-wider text-[#FFD700] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#FFD700]" />
                  Simulateur de Diagnostic Adaptatif & ML Rules
                </h3>
                <span className="text-[10px] text-[#00E676] font-mono font-black">MOTEUR ACTIF</span>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed">
                ALPHA MAN n'est pas un minuteur bête. L'algorithme ajuste votre charge d'endurance selon vos feedbacks, douleurs ou régularité. Testez les règles d'adaptation en simulant des événements :
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                
                <button
                  onClick={() => runSimulatedRule('missed')}
                  className="bg-[#0A0A14] hover:bg-[#16213E]/20 p-4 rounded-xl border border-[#1C1C3E] text-left cursor-pointer transition-colors duration-150 active:scale-95"
                >
                  <span className="text-xs font-headline font-black text-white block">🚫 Règle : 3 Séances Manquées</span>
                  <p className="text-[10px] text-[#8E8E93] mt-1 leading-relaxed">Simule un oubli de 3 jours. Réduit temporairement la puissance de 1 niveau.</p>
                </button>

                <button
                  onClick={() => runSimulatedRule('pain')}
                  className="bg-[#0A0A14] hover:bg-[#16213E]/20 p-4 rounded-xl border border-[#1C1C3E] text-left cursor-pointer transition-colors duration-150 active:scale-95"
                >
                  <span className="text-xs font-headline font-black text-white block">⚠️ Règle : Tensions Pelviennes</span>
                  <p className="text-[10px] text-[#8E8E93] mt-1 leading-relaxed">Simule un signalement de douleur. Active des étirements doux & repos.</p>
                </button>

                <button
                  onClick={() => runSimulatedRule('progression')}
                  className="bg-[#0A0A14] hover:bg-[#16213E]/20 p-4 rounded-xl border border-[#1C1C3E] text-left cursor-pointer transition-colors duration-150 active:scale-95"
                >
                  <span className="text-xs font-headline font-black text-white block">🚀 Règle : Force Contractile +25%</span>
                  <p className="text-[10px] text-[#8E8E93] mt-1 leading-relaxed">Simule un saut de force brute de contraction de 25%. Passe au palier supérieur.</p>
                </button>

                <button
                  onClick={() => runSimulatedRule('stagnation')}
                  className="bg-[#0A0A14] hover:bg-[#16213E]/20 p-4 rounded-xl border border-[#1C1C3E] text-left cursor-pointer transition-colors duration-150 active:scale-95"
                >
                  <span className="text-xs font-headline font-black text-white block">➡️ Règle : Plateau de 2 Semaines</span>
                  <p className="text-[10px] text-[#8E8E93] mt-1 leading-relaxed">Détecte un manque de progression de force. Diversifie le type de contractions.</p>
                </button>

                <button
                  onClick={() => runSimulatedRule('streak')}
                  className="bg-[#0A0A14] hover:bg-[#16213E]/20 p-4 rounded-xl border border-[#1C1C3E] text-left cursor-pointer transition-colors duration-150 active:scale-95 col-span-1 sm:col-span-2"
                >
                  <span className="text-xs font-headline font-black text-white block">🔥 Règle : Discipline Impériale (7 jours)</span>
                  <p className="text-[10px] text-[#8E8E93] mt-1 leading-relaxed">Simule un sans-faute d'une semaine. Débloque le bonus de vitalité et un défi extrême.</p>
                </button>

              </div>
            </AlphaCard>
          </div>

          {/* Diagnostic Console Output */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <AlphaCard variant="elevated" className="p-5 flex flex-col gap-4 border border-[#00E676]/10">
              <div className="flex items-center gap-2 pb-2 border-b border-[#1C1C35]">
                <Activity className="w-4 h-4 text-[#00E676] animate-pulse" />
                <h3 className="text-xs font-headline font-extrabold text-[#00E676] uppercase tracking-wider">
                  Terminal de Sortie IA & ML
                </h3>
              </div>

              {simulationResult ? (
                <div className="flex flex-col gap-3.5">
                  <div className="bg-black/40 p-3 rounded-xl border border-[#1A1A32] flex flex-col gap-1.5 text-xs">
                    <span className="text-gray-400 font-mono text-[10px]">ACTION EFFECTUÉE :</span>
                    <span className="text-[#00E676] font-headline font-extrabold text-xs uppercase">{simulationResult.actionTaken}</span>
                  </div>

                  <p className="text-xs text-gray-200 leading-relaxed font-sans bg-[#111124] p-4 rounded-xl border border-[#1C1C35]">
                    "{simulationResult.adaptationMessage}"
                  </p>

                  <div className="flex justify-between text-[11px] font-mono mt-1 text-gray-500">
                    <span>Ajustement Palier :</span>
                    <span className="text-[#E94560] font-bold">{simulationResult.levelChange} niveau(x)</span>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 text-xs text-gray-500 bg-black/20 rounded-xl border border-dashed border-[#1C1C35] flex flex-col items-center gap-2">
                  <Sliders className="w-8 h-8 text-gray-600 animate-bounce" />
                  <span>Prêt. Cliquez sur une règle d'adaptation à gauche pour exécuter le moteur intelligent.</span>
                </div>
              )}
            </AlphaCard>
          </div>

        </div>
      )}

      {/* ==================================== SECTION 5: WEEKLY REPORT ==================================== */}
      {activeSubSection === 'report' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left panel: magazine style report layout */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <AlphaCard variant="elevated" className="p-6 flex flex-col gap-5 border-2 border-[#E94560]/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#E94560]/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex justify-between items-start pb-3 border-b border-[#1C1C3A]">
                <div>
                  <span className="text-[10px] font-headline font-bold text-[#E94560] uppercase tracking-[0.2em] block">SOUVERAINETÉ HEBDOMADAIRE</span>
                  <h3 className="text-lg font-headline font-black text-white uppercase mt-0.5">Rapport de Synthèse Pelvienne</h3>
                  <span className="text-xs text-gray-400 font-mono">Période : 06 Juillet - 12 Juillet 2026</span>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-black/40 border border-[#1C1C35] flex flex-col items-center justify-center font-mono">
                  <span className="text-xs text-[#FFD700] font-black leading-none">V9</span>
                  <span className="text-[8px] text-gray-500 font-bold uppercase mt-1">VOLUME</span>
                </div>
              </div>

              {/* Grid of accomplishments */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-1">
                
                <div className="bg-black/30 p-4 rounded-2xl border border-[#1A1A35] text-center flex flex-col items-center justify-center">
                  <span className="text-3xl font-mono font-black text-[#00E676]">12 / 14</span>
                  <span className="text-[9px] text-gray-500 uppercase font-headline font-bold mt-1.5">SÉANCES EFFECTUÉES</span>
                  <div className="w-full bg-[#1C1C35] h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-[#00E676] h-full rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>

                <div className="bg-black/30 p-4 rounded-2xl border border-[#1A1A35] text-center flex flex-col items-center justify-center">
                  <span className="text-3xl font-mono font-black text-white">+8%</span>
                  <span className="text-[9px] text-gray-500 uppercase font-headline font-bold mt-1.5">PUISSANCE CONTRACTILE</span>
                  <span className="text-[9px] text-[#00E676] font-bold mt-1 font-mono">📈 En hausse</span>
                </div>

                <div className="bg-black/30 p-4 rounded-2xl border border-[#1A1A35] text-center flex flex-col items-center justify-center">
                  <span className="text-3xl font-mono font-black text-white">+12%</span>
                  <span className="text-[9px] text-gray-500 uppercase font-headline font-bold mt-1.5">ENDURANCE CONTINUE</span>
                  <span className="text-[9px] text-[#00E676] font-bold mt-1 font-mono">➡️ Stable</span>
                </div>

              </div>

              {/* Smart diagnostic recommendation text */}
              <div className="bg-[#111124] p-4 rounded-2xl border border-[#1C1C35] text-xs">
                <span className="font-headline font-extrabold text-[#FFD700] uppercase block tracking-wider">L'AVIS D'ALPHA MAN :</span>
                <p className="text-gray-300 mt-1 leading-relaxed">
                  Votre régularité pelvienne de 85% est excellente. L'endurance continue progresse favorablement. Pour le prochain cycle, <strong>augmentez la durée de tenue à tension constante de 2 secondes lors de la prochaine phase WARRIOR</strong>. Vous êtes plus fort que 78% des hommes de votre palier !
                </p>
                
                {/* Milestone progress prediction */}
                <div className="mt-3.5 border-t border-[#1C1C35] pt-3 flex justify-between items-center text-gray-400 font-mono text-[10px]">
                  <span>Prochain jalon majeur (Niveau 5) :</span>
                  <span className="text-white font-extrabold">Dans 2 semaines environ</span>
                </div>
              </div>

              {/* Share to community action */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between border-t border-[#1C1C38] pt-4 mt-2">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Shield className="w-4.5 h-4.5 text-[#00E676]" />
                  <span>Anonymisation biométrique activée par défaut</span>
                </div>

                <AlphaButton
                  variant="primary"
                  onClick={() => addToast('success', "Rapport partagé anonymement dans la communauté ALPHA MAN ! +50 XP")}
                  className="px-6 py-2.5 text-xs font-headline font-black uppercase flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  Partager anonymement (+50 XP)
                </AlphaButton>
              </div>

            </AlphaCard>
          </div>

          {/* Right panel: Comparative statistics list */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <AlphaCard variant="default" className="p-5 flex flex-col gap-4">
              <div className="flex justify-between items-center pb-2 border-b border-[#1C1C35]">
                <h3 className="text-xs font-headline font-extrabold uppercase tracking-wider text-[#FFD700] flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-[#FFD700]" />
                  Gains & Récompenses
                </h3>
              </div>

              <div className="bg-black/20 p-3.5 rounded-xl border border-[#1A1A35] flex flex-col gap-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Palier global atteint :</span>
                  <span className="text-white font-headline font-black">LVL {kegelState.currentLevelId}/10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Discipline de fer :</span>
                  <span className="text-[#00E676] font-bold">Excellent (&gt;80%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Vitalité cumulée :</span>
                  <span className="text-[#FFD700] font-mono font-bold">{kegelState.totalXP} XP</span>
                </div>
              </div>

              <div className="bg-[#E94560]/5 border border-[#E94560]/20 p-4 rounded-xl text-center">
                <span className="text-[11px] font-headline font-bold text-[#E94560] uppercase block">PREDICTION IA</span>
                <span className="text-lg font-headline font-black text-white block mt-1">Niveau 5 dans 3 semaines</span>
                <span className="text-[9px] text-gray-500 block mt-0.5">À rythme d'entraînement constant</span>
              </div>
            </AlphaCard>
          </div>

        </div>
      )}

    </div>
  );
};
