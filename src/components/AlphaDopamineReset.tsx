import React, { useState, useEffect, useRef } from 'react';
import {
  Brain,
  Zap,
  Moon,
  Flame,
  Shield,
  Check,
  Award,
  Sparkles,
  Share2,
  Lock,
  Volume2,
  VolumeX,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  RefreshCw,
  Copy,
  CheckSquare,
  Square,
  AlertCircle,
  Calendar
} from 'lucide-react';

import { progressService, UserResetState, DailyProgress } from '../pattern_killer/progressService';
import { getLessonForDay, DopamineLesson } from '../pattern_killer/dopamineLessons';
import { AlphaCard } from './AlphaCard';
import { AlphaButton } from './AlphaButton';
import { AlphaBadge } from './AlphaBadge';
import { AlphaProgress } from './AlphaProgress';

interface AlphaDopamineResetProps {
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
  onPointsUpdate?: (newPoints: number) => void;
}

export const AlphaDopamineReset: React.FC<AlphaDopamineResetProps> = ({ addToast, onPointsUpdate }) => {
  // 1. LOCAL SERVICE STATE
  const [state, setState] = useState<UserResetState>(() => progressService.getState());
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'content' | 'timeline' | 'rules'>('content');

  // 2. DAY LEVEL INTERACTION STATE
  const [lesson, setLesson] = useState<DopamineLesson>(() => getLessonForDay(1));
  const [dayProgress, setDayProgress] = useState<DailyProgress>(() => progressService.getOrCreateDayProgress(1));
  
  // 3. AUDIO PLAYER SIMULATION STATE
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [audioBars, setAudioBars] = useState<number[]>(Array(16).fill(5));
  const audioIntervalRef = useRef<any>(null);

  // 4. QUIZ ANSWERS STATE
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<number, number>>({});
  const [submittedQuiz, setSubmittedQuiz] = useState<boolean>(false);

  // 5. CONFETTI ANIMATION STATE
  const [confettiActive, setConfettiActive] = useState<boolean>(false);
  const [confettiParticles, setConfettiParticles] = useState<Array<{ id: number; x: number; y: number; color: string; size: number; duration: number }>>([]);

  // Sync state and selected day
  useEffect(() => {
    const freshState = progressService.getState();
    setState(freshState);
    setSelectedDay(freshState.currentDay);
  }, []);

  // Sync lesson and progress details when selectedDay changes
  useEffect(() => {
    const loadedLesson = getLessonForDay(selectedDay);
    setLesson(loadedLesson);
    
    const loadedProgress = progressService.getOrCreateDayProgress(selectedDay);
    setDayProgress(loadedProgress);

    // Reset quiz for loaded day
    setSelectedQuizAnswers({});
    setSubmittedQuiz(false);
    setIsAudioPlaying(false);
  }, [selectedDay]);

  // Audio waveform animation simulation
  useEffect(() => {
    if (isAudioPlaying) {
      audioIntervalRef.current = setInterval(() => {
        setAudioBars(prev => prev.map(() => Math.floor(Math.random() * 35) + 5));
      }, 150);
    } else {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      setAudioBars(Array(16).fill(5));
    }

    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    };
  }, [isAudioPlaying]);

  // Trigger celebration particle blast
  const triggerConfetti = () => {
    setConfettiActive(true);
    const colors = ['#E94560', '#FFD700', '#00D9A5', '#3B82F6', '#A855F7'];
    const particles = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage left
      y: Math.random() * 40 - 20, // percentage top offset
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      duration: Math.random() * 2 + 1.5
    }));
    setConfettiParticles(particles);

    // Auto turn off
    setTimeout(() => {
      setConfettiActive(false);
    }, 4000);
  };

  // Handle checking of single exercises
  const handleToggleExercise = (exerciseTitle: string) => {
    let list = [...dayProgress.exercisesCompleted];
    if (list.includes(exerciseTitle)) {
      list = list.filter(item => item !== exerciseTitle);
    } else {
      list.push(exerciseTitle);
    }
    
    const updated = { ...dayProgress, exercisesCompleted: list };
    setDayProgress(updated);
    progressService.saveDayProgress(selectedDay, updated);
  };

  // Handle typing inside journal text area
  const handleJournalChange = (text: string) => {
    const updated = { ...dayProgress, journalEntry: text };
    setDayProgress(updated);
    progressService.saveDayProgress(selectedDay, updated);
  };

  // Handle selecting quiz option
  const handleQuizSelect = (qIdx: number, optIdx: number) => {
    if (submittedQuiz) return;
    setSelectedQuizAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  // Share lesson handler
  const handleShareLesson = () => {
    navigator.clipboard.writeText(`ALPHA MAN - Protocole de Libération Cerveau Jour ${selectedDay} : ${lesson.title}`);
    addToast('success', 'Lien de la leçon de neuro-plasticité copié pour partage !');
  };

  // Claim points action
  const handleClaimReward = () => {
    // 1. Validation checklist
    const allExercisesDone = lesson.exercises.every(ex => dayProgress.exercisesCompleted.includes(ex));
    if (!allExercisesDone) {
      addToast('warning', "Soldat, tu dois cocher et réaliser tous les exercices du jour avant d'enregistrer.");
      return;
    }

    if (!dayProgress.journalEntry.trim() || dayProgress.journalEntry.length < 10) {
      addToast('warning', "Le journal neural requiert un engagement honnête d'au moins 10 caractères.");
      return;
    }

    // 2. Quiz validation (require submitting or score)
    const totalQuizCount = lesson.quiz.length;
    const answeredCount = Object.keys(selectedQuizAnswers).length;
    if (answeredCount < totalQuizCount) {
      addToast('warning', "Réponds au quiz d'ancrage scientifique avant de valider la leçon.");
      return;
    }

    if (!submittedQuiz) {
      setSubmittedQuiz(true);
      // check if all answers are correct
      const allCorrect = lesson.quiz.every((q, i) => selectedQuizAnswers[i] === q.correctIndex);
      if (!allCorrect) {
        addToast('error', "Certaines réponses du quiz sont erronées. Révise la leçon.");
        return;
      }
    }

    // 3. Claim rewards through service
    const res = progressService.claimReward(selectedDay, lesson.rewardPoints, lesson.badgeReward);
    if (res.success) {
      setState(res.state);
      setDayProgress({ ...dayProgress, claimedReward: true, completed: true });
      if (onPointsUpdate) {
        onPointsUpdate(res.state.totalPoints);
      }
      
      // Toast message
      addToast('success', `Système recalibré ! +${res.ptsAdded} points d'énergie vitale.`);
      if (lesson.badgeReward) {
        addToast('info', `NOUVEAU TITRE DÉBLOQUÉ : 🏆 ${lesson.badgeReward}`);
      }

      // Explode celebration confettis for milestones
      if ([1, 3, 7, 14, 21, 30, 60, 90].includes(selectedDay)) {
        triggerConfetti();
      }

      // Proactively move current day forward if we completed the highest active day
      if (selectedDay === state.currentDay && state.currentDay < 90) {
        const nextDay = state.currentDay + 1;
        const updatedState = progressService.setCurrentDay(nextDay);
        setState(updatedState);
        setSelectedDay(nextDay);
        addToast('info', `Jour ${nextDay} du protocole de 90 jours débloqué !`);
      }
    } else {
      addToast('info', "Tu as déjà réclamé les points d'aujourd'hui. Reste concentré.");
    }
  };

  // Helper to get corresponding phase metadata
  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'DETOX': return 'text-[#FF2D55] border-[#FF2D55]/30 bg-[#FF2D55]/10';
      case 'REWIRE': return 'text-[#3B82F6] border-[#3B82F6]/30 bg-[#3B82F6]/10';
      case 'REBUILD': return 'text-[#00D9A5] border-[#00D9A5]/30 bg-[#00D9A5]/10';
      default: return 'text-[#FFD700] border-[#FFD700]/30 bg-[#FFD700]/10';
    }
  };

  // Simulate fast-forwarding days for prototype testing
  const handleSimulateDaySelection = (dayNum: number) => {
    if (dayNum > state.currentDay) {
      addToast('error', `Le Jour ${dayNum} est verrouillé. Résiste jour après jour.`);
      return;
    }
    setSelectedDay(dayNum);
  };

  return (
    <div id="dopamine-reset-section" className="relative w-full text-white">
      
      {/* 1. CONFETTI CELEBRATION LAYER */}
      {confettiActive && (
        <div className="absolute inset-0 z-40 overflow-hidden pointer-events-none">
          {confettiParticles.map((p) => (
            <div
              key={p.id}
              className="absolute rounded-full"
              style={{
                left: `${p.x}%`,
                top: `${p.y + 40}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.color,
                animation: `fall ${p.duration}s ease-in-out infinite`
              }}
            />
          ))}
          <style>{`
            @keyframes fall {
              0% { transform: translateY(-50px) rotate(0deg); opacity: 1; }
              100% { transform: translateY(600px) rotate(360deg); opacity: 0; }
            }
          `}</style>
        </div>
      )}

      {/* 2. MAIN HEADER BLOCK */}
      <div className="flex flex-col gap-2 mb-8 text-center md:text-left">
        <span className="text-[10px] md:text-xs font-headline font-bold text-[#E94560] uppercase tracking-[0.25em]">
          PHASE 1 : MIND — NEURO-REWIRE
        </span>
        <h2 className="text-2xl md:text-4xl font-headline font-extrabold text-white tracking-tight flex items-center gap-3 justify-center md:justify-start">
          <Brain className="w-8 h-8 text-[#E94560]" />
          Dopamine Reset Protocol
        </h2>
        <p className="text-xs md:text-sm text-[#8E8E93] italic font-serif">
          &ldquo;Le cerveau est le champ de bataille. On gagne ici.&rdquo;
        </p>
      </div>

      {/* 3. KEY STATS OVERVIEW HEADER CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        
        {/* Streak card */}
        <AlphaCard variant="default" className="p-4 flex items-center justify-between border-l-4 border-l-[#FF2D55]">
          <div>
            <p className="text-[10px] font-headline font-bold text-[#8E8E93] uppercase tracking-wider">Discipline consécutive</p>
            <h4 className="text-xl font-mono font-black text-white mt-1 flex items-center gap-1.5">
              <Flame className="w-5 h-5 text-[#FF2D55] fill-current" />
              {state.streak} {state.streak > 1 ? 'Jours' : 'Jour'}
            </h4>
          </div>
          <AlphaBadge variant="streak" label="🔥 Actif" />
        </AlphaCard>

        {/* Vital Energy Points Tracker */}
        <AlphaCard variant="default" className="p-4 flex items-center justify-between border-l-4 border-l-[#FFD700]">
          <div>
            <p className="text-[10px] font-headline font-bold text-[#8E8E93] uppercase tracking-wider">Énergie Vitale Totale</p>
            <h4 className="text-xl font-mono font-black text-[#FFD700] mt-1 flex items-center gap-1.5">
              <Sparkles className="w-5 h-5" />
              {state.totalPoints} XP
            </h4>
          </div>
          <AlphaBadge variant="level" label="NIV. S" />
        </AlphaCard>

        {/* Current phase and day card */}
        <AlphaCard variant="default" className="p-4 flex items-center justify-between border-l-4 border-l-[#00D9A5]">
          <div>
            <p className="text-[10px] font-headline font-bold text-[#8E8E93] uppercase tracking-wider">Phase du Cerveau</p>
            <h4 className="text-lg font-headline font-extrabold text-white mt-1">
              {state.currentDay <= 7 ? '1. DETOX SÉVÈRE' : state.currentDay <= 30 ? '2. RECONSTRUCTION' : '3. INTÉGRATION ALPHA'}
            </h4>
          </div>
          <span className={`text-[9px] font-headline font-bold px-2.5 py-1 border rounded-full uppercase tracking-wider ${getPhaseColor(lesson.phase)}`}>
            {lesson.phase} PHASE
          </span>
        </AlphaCard>
      </div>

      {/* 4. MAIN NAV TABS CONTAINER */}
      <div className="flex border-b border-[#1A1A2E] mb-6">
        <button
          onClick={() => setActiveTab('content')}
          className={`px-5 py-3 text-xs font-headline font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer
            ${activeTab === 'content' ? 'border-[#E94560] text-white bg-[#E94560]/5' : 'border-transparent text-[#8E8E93] hover:text-white'}
          `}
        >
          <BookOpen className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
          Leçon active & Exercices (Jour {selectedDay})
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-5 py-3 text-xs font-headline font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer
            ${activeTab === 'timeline' ? 'border-[#E94560] text-white bg-[#E94560]/5' : 'border-transparent text-[#8E8E93] hover:text-white'}
          `}
        >
          <Calendar className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
          Timeline 90 Segments
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-5 py-3 text-xs font-headline font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer
            ${activeTab === 'rules' ? 'border-[#E94560] text-white bg-[#E94560]/5' : 'border-transparent text-[#8E8E93] hover:text-white'}
          `}
        >
          <Shield className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
          Charte Dopaminergique
        </button>
      </div>

      {/* 5. DYNAMIC CONTENT VIEWER */}
      {activeTab === 'content' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left / Center Column: Daily Lesson details & Interactive quiz */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* BIG DAY INDICATOR & COUNTDOWN */}
            <div className="bg-gradient-to-r from-[#16213E]/60 to-[#1F2E54]/40 border border-[#1A1A2E] rounded-3xl p-6 text-center shadow-lg">
              <span className="text-[10px] font-mono text-[#FFD700] uppercase tracking-widest bg-[#FFD700]/10 border border-[#FFD700]/30 px-3 py-1 rounded-full">
                SÉLECTION DU PROTOCOLE
              </span>
              <h1 className="text-4xl md:text-5xl font-mono font-black text-white mt-4 tracking-tight">
                JOUR <span className="text-[#E94560]">{selectedDay}</span> DE 90
              </h1>
              <p className="text-xs text-[#8E8E93] mt-2">
                {selectedDay === state.currentDay ? (
                  <span className="text-[#00D9A5] font-semibold animate-pulse">● Recalibrage en cours — Reste concentré</span>
                ) : (
                  <span className="text-[#8E8E93]">Lecture d'archives d'une journée franchie avec succès</span>
                )}
              </p>

              {/* Progress Bar through 90 days */}
              <div className="mt-5 max-w-md mx-auto">
                <div className="flex justify-between text-[10px] text-[#8E8E93] mb-1 font-mono uppercase">
                  <span>Phase : {lesson.phase}</span>
                  <span>{Math.round((state.currentDay / 90) * 100)}% Complété</span>
                </div>
                <AlphaProgress value={Math.round((selectedDay / 90) * 100)} color="secondary" size="md" showLabel={false} />
              </div>
            </div>

            {/* LESSON CARD MAIN BODY */}
            <AlphaCard variant="elevated" className="p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-radial from-[#E94560]/10 to-transparent pointer-events-none rounded-full" />
              
              {/* Card Lesson Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#1A1A2E] pb-4">
                <div>
                  <span className={`text-[10px] font-headline font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${getPhaseColor(lesson.phase)}`}>
                    {lesson.phase} PHASE
                  </span>
                  <h3 className="text-xl md:text-2xl font-headline font-black text-white mt-2 leading-snug">
                    {lesson.title}
                  </h3>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleShareLesson}
                    className="p-2 bg-[#1A1A2E] hover:bg-[#252542] rounded-lg text-[#8E8E93] hover:text-white transition-colors cursor-pointer"
                    title="Partager l'ancrage"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-mono text-[#8E8E93] bg-[#16213E] px-3 py-1.5 rounded-lg border border-[#1A1A2E] flex items-center">
                    ⏳ {lesson.duration} min
                  </span>
                </div>
              </div>

              {/* Daily Motivational Message banner */}
              <div className="bg-[#0F0F1A] border-l-4 border-l-[#E94560] p-4 rounded-r-xl">
                <p className="text-xs text-[#D1D1D6] italic leading-relaxed font-serif">
                  &ldquo;{lesson.message}&rdquo;
                </p>
              </div>

              {/* Lesson Text Content */}
              <div className="text-sm md:text-base text-gray-300 leading-relaxed space-y-4 whitespace-pre-wrap font-sans">
                {lesson.content}
              </div>

              {/* 6. AUDIO COACHING PLAYER SIMULATION */}
              <div className="bg-[#0F0F1A]/80 border border-[#1A1A2E] p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                <button
                  onClick={() => setIsAudioPlaying(!isAudioPlaying)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform hover:scale-105 cursor-pointer
                    ${isAudioPlaying ? 'bg-[#FF2D55] text-white shadow-[0_0_15px_rgba(255,45,85,0.4)]' : 'bg-[#E94560] text-white'}
                  `}
                >
                  {isAudioPlaying ? <VolumeX className="w-5 h-5 animate-pulse" /> : <Volume2 className="w-5 h-5" />}
                </button>
                
                <div className="flex-1 w-full">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-headline font-bold text-white uppercase tracking-wider text-[10px]">Coaching Vocal d'Ancrage</span>
                    <span className="font-mono text-[10px] text-[#8E8E93]">
                      {isAudioPlaying ? 'Audio Actif (Synthèse simulée)' : 'Audio Disponible'}
                    </span>
                  </div>
                  
                  {/* Waveform graphic rendering */}
                  <div className="flex items-end justify-between h-8 gap-0.5">
                    {audioBars.map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-[#E94560] to-[#FFD700] rounded-t transition-all duration-150"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Scientific citation */}
              <div className="bg-[#16213E]/50 p-3.5 rounded-xl border border-[#1A1A2E] flex gap-3 items-start">
                <Award className="w-5 h-5 text-[#FFD700] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-headline font-black text-[#FFD700] uppercase tracking-wider">Validation Scientifique</p>
                  <p className="text-xs text-[#8E8E93] italic mt-1 font-serif leading-relaxed">
                    Source : {lesson.scientificCitation}
                  </p>
                </div>
              </div>
            </AlphaCard>

            {/* SCIENTIFIC QUIZ CARD */}
            <AlphaCard variant="default" className="p-6 md:p-8 flex flex-col gap-5">
              <div className="flex items-center gap-2 pb-2 border-b border-[#1A1A2E]">
                <HelpCircle className="w-5 h-5 text-[#3B82F6]" />
                <h4 className="text-md font-headline font-bold uppercase tracking-wider text-white">
                  Ancrage Intellectuel (Quiz de Rétention)
                </h4>
              </div>
              
              <div className="flex flex-col gap-6">
                {lesson.quiz.map((q, qIdx) => {
                  const selectedOpt = selectedQuizAnswers[qIdx];
                  const isCorrect = selectedOpt === q.correctIndex;

                  return (
                    <div key={qIdx} className="bg-[#0F0F1A] p-4 rounded-2xl border border-[#1A1A2E]">
                      <span className="text-[9px] font-headline font-bold text-[#3B82F6] uppercase tracking-wider bg-[#3B82F6]/10 border border-[#3B82F6]/20 px-2.5 py-0.5 rounded-full">
                        Question {qIdx + 1}
                      </span>
                      <h5 className="text-sm font-headline font-bold text-white mt-2 leading-snug">
                        {q.question}
                      </h5>

                      <div className="flex flex-col gap-2.5 mt-4">
                        {q.options.map((opt, optIdx) => {
                          const isThisSelected = selectedOpt === optIdx;
                          const correctTheme = submittedQuiz && optIdx === q.correctIndex;
                          const wrongTheme = submittedQuiz && isThisSelected && !isCorrect;

                          let containerBorder = 'border-[#1A1A2E] bg-[#16213E]/40 hover:bg-[#16213E]/80';
                          if (isThisSelected && !submittedQuiz) containerBorder = 'border-[#3B82F6] bg-[#3B82F6]/5';
                          if (correctTheme) containerBorder = 'border-[#00D9A5] bg-[#00D9A5]/5 text-[#00D9A5]';
                          if (wrongTheme) containerBorder = 'border-[#FF2D55] bg-[#FF2D55]/5 text-[#FF2D55]';

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleQuizSelect(qIdx, optIdx)}
                              disabled={submittedQuiz}
                              className={`w-full p-3 rounded-xl border text-left text-xs font-headline font-medium transition-colors text-slate-300 flex items-center justify-between cursor-pointer
                                ${containerBorder}
                              `}
                            >
                              <span>{opt}</span>
                              {correctTheme && <CheckCircle2 className="w-4 h-4 text-[#00D9A5] shrink-0" />}
                              {wrongTheme && <AlertCircle className="w-4 h-4 text-[#FF2D55] shrink-0" />}
                            </button>
                          );
                        })}
                      </div>

                      {submittedQuiz && (
                        <div className="mt-3.5 pt-3.5 border-t border-[#1A1A2E] flex gap-2 items-start">
                          <span className={`text-[10px] font-bold uppercase tracking-wider shrink-0 px-2 py-0.5 rounded
                            ${isCorrect ? 'text-[#00D9A5] bg-[#00D9A5]/10' : 'text-[#FF2D55] bg-[#FF2D55]/10'}
                          `}>
                            {isCorrect ? 'Correct ✓' : 'Inexact ✗'}
                          </span>
                          <p className="text-[11px] text-[#8E8E93] leading-relaxed">
                            {q.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </AlphaCard>
          </div>

          {/* Right Column: Dynamic Checklist, Journaling text box & Unlock/Submit Panel */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* DAILY RECONNECTION EXERCISES CHECKLIST */}
            <AlphaCard variant="default" className="p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2 pb-2 border-b border-[#1A1A2E]">
                <CheckSquare className="w-5 h-5 text-[#00D9A5]" />
                <h4 className="text-xs font-headline font-bold uppercase tracking-wider text-white">
                  Exercices Requis ({dayProgress.exercisesCompleted.length}/{lesson.exercises.length})
                </h4>
              </div>

              <p className="text-[11px] text-[#8E8E93] leading-relaxed">
                Complète ces routines physiques et mentales pour ré-équilibrer ton influx nerveux et réclamer ton gain.
              </p>

              <div className="flex flex-col gap-2.5 mt-2">
                {lesson.exercises.map((ex, index) => {
                  const isChecked = dayProgress.exercisesCompleted.includes(ex);
                  return (
                    <button
                      key={index}
                      onClick={() => handleToggleExercise(ex)}
                      className={`w-full p-3 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer
                        ${isChecked 
                          ? 'bg-[#00D9A5]/5 border-[#00D9A5]/40 text-[#00D9A5]' 
                          : 'bg-[#0F0F1A] border-[#1A1A2E] text-[#8E8E93] hover:text-white'
                        }
                      `}
                    >
                      <div className="shrink-0">
                        {isChecked ? (
                          <div className="w-5 h-5 rounded-md bg-[#00D9A5] flex items-center justify-center text-[#0F0F1A]">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-md border-2 border-gray-600" />
                        )}
                      </div>
                      <span className="text-xs font-headline font-bold leading-tight">{ex}</span>
                    </button>
                  );
                })}
              </div>
            </AlphaCard>

            {/* NEURAL JOURNAL PANEL (1 MINUTE) */}
            <AlphaCard variant="default" className="p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#1A1A2E]">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#FF2D55]" />
                  <h4 className="text-xs font-headline font-bold uppercase tracking-wider text-white">
                    Journal Neural (1 Min)
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-[#8E8E93]">Écrire & Libérer</span>
              </div>

              <div className="bg-[#0F0F1A] p-3 rounded-lg border border-[#1A1A2E]">
                <p className="text-[11px] text-[#8E8E93] font-serif leading-relaxed italic">
                  {selectedDay <= 7 
                    ? "Rédige sans filtre l'intensité de ton envie de dopamine artificielle aujourd'hui. Nomme ton démon pour réduire sa force."
                    : "Qu'est-ce qui a renforcé ta forteresse mentale aujourd'hui ? Écris qui tu as décidé d'incarner aujourd'hui."
                  }
                </p>
              </div>

              <textarea
                value={dayProgress.journalEntry}
                onChange={(e) => handleJournalChange(e.target.value)}
                placeholder="Rédige tes pensées sincères ici pour libérer ton cortex préfrontal..."
                className="w-full h-28 p-3 bg-[#0F0F1A] border border-[#1A1A2E] rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#E94560] resize-none"
              />
              <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono">
                <span>Min. 10 Caractères</span>
                <span>{dayProgress.journalEntry.length} Saisis</span>
              </div>
            </AlphaCard>

            {/* PROTOCOL CLAIM SUBMISSION BUTTONS */}
            <AlphaCard variant="premium" className="p-5 flex flex-col gap-4 border border-[#FFD700]/20 bg-gradient-to-br from-[#16213E]/80 to-[#1F2E54]/80">
              <div className="flex items-center gap-2 text-[#FFD700]">
                <Award className="w-5 h-5" />
                <h4 className="text-xs font-headline font-black uppercase tracking-wider">
                  Contrat d'Engagement Souverain
                </h4>
              </div>
              
              <div className="space-y-2 text-[11px] text-[#D1D1D6] leading-relaxed font-sans">
                <p className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#00D9A5] shrink-0" />
                  <span>Validation scientifique acquise</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#00D9A5] shrink-0" />
                  <span>Exercices requis cochés</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#00D9A5] shrink-0" />
                  <span>Journal de combat sincère rédigé</span>
                </p>
              </div>

              <div className="border-t border-[#1A1A2E] pt-3 flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Récompense de la session :</span>
                <span className="text-[#FFD700] font-bold">+{lesson.rewardPoints} XP</span>
              </div>

              {lesson.badgeReward && (
                <div className="bg-[#FFD700]/10 border border-[#FFD700]/30 p-2.5 rounded-lg text-center">
                  <span className="text-[10px] font-headline font-bold text-[#FFD700] uppercase tracking-wider block">
                    🎁 Badge de Jalon Déblocable :
                  </span>
                  <span className="text-xs font-headline font-black text-white mt-1 block">
                    ⭐ &ldquo;{lesson.badgeReward}&rdquo;
                  </span>
                </div>
              )}

              <AlphaButton
                variant={dayProgress.claimedReward ? 'ghost' : 'gold'}
                disabled={dayProgress.claimedReward}
                onClick={handleClaimReward}
                className="w-full font-headline font-extrabold uppercase py-3 cursor-pointer"
              >
                {dayProgress.claimedReward ? 'Session Enregistrée ✓' : `Valider & Réclamer +${lesson.rewardPoints} XP`}
              </AlphaButton>
            </AlphaCard>
          </div>
        </div>
      )}

      {/* 7. VISUAL TIMELINE OF 90 SEGMENTS */}
      {activeTab === 'timeline' && (
        <div className="flex flex-col gap-6 animate-[fade-in_0.2s_ease-out]">
          
          <div className="bg-[#16213E]/50 p-6 rounded-3xl border border-[#1A1A2E]">
            <h4 className="text-sm font-headline font-bold text-white uppercase tracking-wider mb-2">
              Légende du Séquenceur Synaptique
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs mt-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#00D9A5]" />
                <span className="text-[#8E8E93]">Surchargé & Validé (Vert)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#E94560] animate-pulse" />
                <span className="text-white font-medium">Jour Actuel Actif (Rouge)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#16213E] border border-[#222]" />
                <span className="text-[#8E8E93]">Accessibles pour révision (Navy)</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-gray-700" />
                <span className="text-[#5A5A5A]">Futur Verrouillé (Gris)</span>
              </div>
            </div>
          </div>

          {/* Detailed list of stages */}
          <div className="flex flex-col gap-6">
            
            {/* Detox Phase Group */}
            <div className="bg-[#0F0F1A] border border-[#FF2D55]/10 p-5 rounded-3xl">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#FF2D55]/20">
                <span className="font-headline font-extrabold text-[#FF2D55] uppercase tracking-widest text-xs">
                  PHASE 1 : DETOX (Jours 1 - 7)
                </span>
                <span className="text-[10px] font-mono text-[#8E8E93]">Survie & Sevrage Cerveau</span>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {Array.from({ length: 7 }, (_, i) => i + 1).map((d) => {
                  const isPassed = d < state.currentDay;
                  const isActive = d === state.currentDay;
                  const isSelected = d === selectedDay;
                  
                  let btnBg = 'bg-[#16213E]/40 border-gray-800 text-gray-500 hover:text-white';
                  if (isPassed) btnBg = 'bg-[#00D9A5] border-[#00D9A5] text-black font-extrabold';
                  if (isActive) btnBg = 'bg-[#E94560] border-white text-white font-extrabold shadow-[0_0_12px_rgba(233,69,96,0.5)] animate-pulse';
                  if (isSelected) btnBg = 'bg-[#FFD700] border-white text-black font-extrabold shadow-[0_0_12px_rgba(255,215,0,0.5)]';

                  return (
                    <button
                      key={d}
                      onClick={() => handleSimulateDaySelection(d)}
                      className={`w-11 h-11 rounded-full border flex flex-col items-center justify-center text-xs transition-transform hover:scale-105 cursor-pointer relative ${btnBg}`}
                    >
                      <span>{d}</span>
                      {isPassed && <span className="absolute -bottom-1 -right-1 text-[8px] bg-white text-black px-1 rounded-full">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Rewire Phase Group */}
            <div className="bg-[#0F0F1A] border border-[#3B82F6]/10 p-5 rounded-3xl">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#3B82F6]/20">
                <span className="font-headline font-extrabold text-[#3B82F6] uppercase tracking-widest text-xs">
                  PHASE 2 : REWIRE (Jours 8 - 30)
                </span>
                <span className="text-[10px] font-mono text-[#8E8E93]">Voies Neuronales Nouvelles</span>
              </div>

              <div className="flex flex-wrap gap-3">
                {Array.from({ length: 23 }, (_, i) => i + 8).map((d) => {
                  const isPassed = d < state.currentDay;
                  const isActive = d === state.currentDay;
                  const isSelected = d === selectedDay;
                  const isFuture = d > state.currentDay;

                  let btnBg = 'bg-[#16213E]/40 border-gray-800 text-gray-500 hover:text-white';
                  if (isPassed) btnBg = 'bg-[#00D9A5] border-[#00D9A5] text-black font-extrabold';
                  if (isActive) btnBg = 'bg-[#E94560] border-white text-white font-extrabold shadow-[0_0_12px_rgba(233,69,96,0.5)] animate-pulse';
                  if (isSelected) btnBg = 'bg-[#FFD700] border-white text-black font-extrabold shadow-[0_0_12px_rgba(255,215,0,0.5)]';
                  if (isFuture) btnBg = 'bg-gray-900/40 border-transparent text-gray-700 cursor-not-allowed';

                  return (
                    <button
                      key={d}
                      disabled={isFuture}
                      onClick={() => handleSimulateDaySelection(d)}
                      className={`w-11 h-11 rounded-full border flex flex-col items-center justify-center text-xs transition-transform relative ${btnBg} ${!isFuture && 'hover:scale-105 cursor-pointer'}`}
                    >
                      {isFuture ? <Lock className="w-3.5 h-3.5" /> : <span>{d}</span>}
                      {isPassed && <span className="absolute -bottom-1 -right-1 text-[8px] bg-white text-black px-1 rounded-full">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Rebuild Phase Group */}
            <div className="bg-[#0F0F1A] border border-[#00D9A5]/10 p-5 rounded-3xl">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#00D9A5]/20">
                <span className="font-headline font-extrabold text-[#00D9A5] uppercase tracking-widest text-xs">
                  PHASE 3 : REBUILD (Jours 31 - 90)
                </span>
                <span className="text-[10px] font-mono text-[#8E8E93]">Identité Alpha Encrée</span>
              </div>

              <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
                {Array.from({ length: 60 }, (_, i) => i + 31).map((d) => {
                  const isPassed = d < state.currentDay;
                  const isActive = d === state.currentDay;
                  const isSelected = d === selectedDay;
                  const isFuture = d > state.currentDay;

                  let btnBg = 'bg-[#16213E]/40 border-gray-800 text-gray-500 hover:text-white';
                  if (isPassed) btnBg = 'bg-[#00D9A5] border-[#00D9A5] text-black font-extrabold';
                  if (isActive) btnBg = 'bg-[#E94560] border-white text-white font-extrabold shadow-[0_0_12px_rgba(233,69,96,0.5)] animate-pulse';
                  if (isSelected) btnBg = 'bg-[#FFD700] border-white text-black font-extrabold shadow-[0_0_12px_rgba(255,215,0,0.5)]';
                  if (isFuture) btnBg = 'bg-gray-900/40 border-transparent text-gray-700 cursor-not-allowed';

                  return (
                    <button
                      key={d}
                      disabled={isFuture}
                      onClick={() => handleSimulateDaySelection(d)}
                      className={`h-11 rounded-xl border flex flex-col items-center justify-center text-[11px] transition-transform relative ${btnBg} ${!isFuture && 'hover:scale-105 cursor-pointer'}`}
                    >
                      {isFuture ? <Lock className="w-3.5 h-3.5" /> : <span>J.{d}</span>}
                      {isPassed && <span className="absolute -bottom-1 -right-1 text-[8px] bg-white text-black px-1 rounded-full">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick action: simulate moving forward for sandbox testers */}
            <div className="bg-[#16213E]/30 p-5 rounded-2xl border border-[#1A1A2E]/85 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h5 className="text-xs font-headline font-bold text-white uppercase">Portail de Simulation de Jalon (Sandbox)</h5>
                <p className="text-[11px] text-[#8E8E93] mt-1">
                  Permet de tester rapidement le contenu éducatif et les animations des badges (Survivor J.7, Warrior J.30, etc.)
                </p>
              </div>
              <div className="flex gap-2 flex-wrap justify-end">
                <button
                  onClick={() => {
                    const next = Math.max(1, state.currentDay - 5);
                    const fresh = progressService.setCurrentDay(next);
                    setState(fresh);
                    setSelectedDay(next);
                    addToast('info', `Jour actuel régressé au Jour ${next}.`);
                  }}
                  className="px-3 py-1.5 bg-[#1F2E54] hover:bg-[#1A1A2E] border border-gray-800 rounded-lg text-[10px] font-bold uppercase transition-colors cursor-pointer"
                >
                  -5 Jours
                </button>
                <button
                  onClick={() => {
                    const next = Math.min(90, state.currentDay + 5);
                    const fresh = progressService.setCurrentDay(next);
                    setState(fresh);
                    setSelectedDay(next);
                    addToast('info', `Jour actuel avancé au Jour ${next}.`);
                  }}
                  className="px-3 py-1.5 bg-[#E94560] hover:bg-[#FF2D55] rounded-lg text-[10px] font-bold uppercase transition-colors cursor-pointer"
                >
                  +5 Jours
                </button>
                <button
                  onClick={() => {
                    const fresh = progressService.resetAll();
                    setState(fresh);
                    setSelectedDay(1);
                    addToast('warning', "La timeline a été réinitialisée à zéro.");
                  }}
                  className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/40 border border-red-500/40 text-red-400 rounded-lg text-[10px] font-bold uppercase transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3 h-3" />
                  Effacer
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 8. DOPAMINE RULES CHARTER TABS */}
      {activeTab === 'rules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-[fade-in_0.2s_ease-out]">
          
          <AlphaCard variant="default" className="p-5 flex flex-col gap-4">
            <h4 className="text-sm font-headline font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#FF2D55]" />
              Règle #1 : Bannir l'Automatisme
            </h4>
            <p className="text-xs text-[#8E8E93] leading-relaxed">
              Le cerveau reptilien cherche le raccourci biologique le plus court vers le plaisir. Chaque clic sans intention, chaque scroll infini dégrade les connexions de votre cortex préfrontal.
            </p>
            <div className="bg-[#0F0F1A] p-3 rounded-xl border border-red-500/10 text-[11px] text-slate-300">
              <strong className="text-[#FF2D55] uppercase block mb-1">Protocole de Défense :</strong>
              Quand l'envie surgit, appliquez le protocole de respiration 4-7-8 immédiat durant 180 secondes.
            </div>
          </AlphaCard>

          <AlphaCard variant="default" className="p-5 flex flex-col gap-4">
            <h4 className="text-sm font-headline font-black text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#00D9A5]" />
              Règle #2 : Restructurer par l'Effort
            </h4>
            <p className="text-xs text-[#8E8E93] leading-relaxed">
              La dopamine doit redevenir la récompense de l'accomplissement réel, pas de l'illusion numérique. Gagnez votre satisfaction à travers l'effort physique intense et le travail souverain.
            </p>
            <div className="bg-[#0F0F1A] p-3 rounded-xl border border-emerald-500/10 text-[11px] text-slate-300">
              <strong className="text-[#00D9A5] uppercase block mb-1">Restauration :</strong>
              Les douches froides, l'entraînement de force (Gym) et l'apprentissage de nouvelles compétences reconstruisent vos synapses D2.
            </div>
          </AlphaCard>
        </div>
      )}

    </div>
  );
};
