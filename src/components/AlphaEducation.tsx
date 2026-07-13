import React, { useState, useEffect, useRef } from 'react';
import {
  Brain,
  BookOpen,
  Lock,
  CheckCircle2,
  Play,
  Pause,
  Award,
  ChevronRight,
  ChevronLeft,
  Volume2,
  VolumeX,
  Sparkles,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Info,
  Layers,
  Activity,
  Zap,
  Target
} from 'lucide-react';
import { EDUCATION_LESSONS, Lesson, ContentBlock } from '../pattern_killer/educationLessons';
import { educationService, UserEducationState } from '../pattern_killer/educationService';
import { AlphaCard } from './AlphaCard';
import { AlphaButton } from './AlphaButton';
import { AlphaBadge } from './AlphaBadge';

interface AlphaEducationProps {
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
  onPointsUpdate?: (newPoints: number) => void;
}

export const AlphaEducation: React.FC<AlphaEducationProps> = ({ addToast, onPointsUpdate }) => {
  // 1. SERVICES STATE
  const [state, setState] = useState<UserEducationState>(() => educationService.getState());
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'NEUROSCIENCE' | 'PATTERN_ADDICTION' | 'KEGEL_PHYSIOLOGY' | 'VITALITY_ENERGY' | 'CONFIDENCE_INTIMACY'>('ALL');
  
  // Active Lesson state (null if in catalog)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  
  // 2. LESSON SCREEN LEVEL STATE
  const [scrollPercentage, setScrollPercentage] = useState<number>(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const audioIntervalRef = useRef<any>(null);
  const lessonContainerRef = useRef<HTMLDivElement>(null);

  // 3. INTERACTIVE SLIDERS AND HOTSPOT STATES
  const [dopamineSliderVal, setDopamineSliderVal] = useState<number>(100);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [beforeAfterToggle, setBeforeAfterToggle] = useState<'BEFORE' | 'AFTER'>('BEFORE');
  const [kegelTensionVal, setKegelTensionVal] = useState<number>(50);
  const [stressActive, setStressActive] = useState<boolean>(false);
  const [neuronPulses, setNeuronPulses] = useState<Array<{ id: number; key: number }>>([]);
  const [neuronFireCount, setNeuronFireCount] = useState<number>(0);

  // 4. QUIZ STATES
  // Keeps track of the selected option for each quiz block. Key is block index, value is option index.
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<number, number>>({});
  // Keeps track of whether a quiz block has been submitted.
  const [submittedQuizBlocks, setSubmittedQuizBlocks] = useState<Record<number, boolean>>({});
  // Keeps track of flippable card states. Key is block index.
  const [quizFlipped, setQuizFlipped] = useState<Record<number, boolean>>({});

  // Sync state initially and on events
  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const freshState = (e as CustomEvent).detail || educationService.getState();
      setState(freshState);
      if (onPointsUpdate) {
        // Find total points in progress state
        try {
          const dopState = localStorage.getItem('alphaman_dopamine_reset_state');
          if (dopState) {
            const parsed = JSON.parse(dopState);
            onPointsUpdate(parsed.totalPoints || 0);
          }
        } catch (err) {
          console.error(err);
        }
      }
    };

    window.addEventListener('alphaman_education_updated', handleUpdate);
    return () => {
      window.removeEventListener('alphaman_education_updated', handleUpdate);
    };
  }, [onPointsUpdate]);

  // Handle scroll progress within the lesson reader
  const handleScroll = () => {
    if (!lessonContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = lessonContainerRef.current;
    const totalScrollable = scrollHeight - clientHeight;
    if (totalScrollable <= 0) {
      setScrollPercentage(100);
      return;
    }
    const currentProgress = Math.min(100, Math.max(0, (scrollTop / totalScrollable) * 100));
    setScrollPercentage(currentProgress);
  };

  // Audio reader simulation ticker
  useEffect(() => {
    if (isAudioPlaying) {
      audioIntervalRef.current = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 100) {
            setIsAudioPlaying(false);
            clearInterval(audioIntervalRef.current);
            addToast('success', 'Leçon audio terminée ! +10 Points bonus d\'attention.');
            return 100;
          }
          return prev + 1;
        });
      }, 300);
    } else {
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
      }
    }
    return () => {
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
      }
    };
  }, [isAudioPlaying]);

  // Check if a lesson is unlocked
  const isLessonUnlocked = (lesson: Lesson, index: number) => {
    if (lesson.unlockCondition === 'none' || index === 0) return true;
    
    // Find the previous lesson in the sorted array
    const prevLesson = EDUCATION_LESSONS[index - 1];
    return state.completedLessons.includes(prevLesson.id);
  };

  // Handle lesson click
  const handleSelectLesson = (lesson: Lesson, idx: number) => {
    if (!isLessonUnlocked(lesson, idx)) {
      addToast('warning', 'Cette leçon est verrouillée. Complète la leçon précédente pour la débloquer !');
      return;
    }
    setSelectedLesson(lesson);
    educationService.setActiveLesson(lesson.id);
    
    // Reset reader states
    setScrollPercentage(0);
    setIsAudioPlaying(false);
    setAudioProgress(0);
    setSelectedQuizAnswers({});
    setSubmittedQuizBlocks({});
    setQuizFlipped({});
    setActiveHotspot(null);
    setDopamineSliderVal(100);
    setBeforeAfterToggle('BEFORE');
    setNeuronPulses([]);
    setNeuronFireCount(0);
    
    // Scroll to top
    setTimeout(() => {
      if (lessonContainerRef.current) {
        lessonContainerRef.current.scrollTop = 0;
      }
    }, 100);
  };

  const handleCloseLesson = () => {
    setSelectedLesson(null);
    educationService.setActiveLesson(null);
  };

  const handleFireNeuron = () => {
    const newId = Date.now();
    setNeuronPulses((prev) => [...prev, { id: newId, key: newId }]);
    setNeuronFireCount((prev) => prev + 1);
    
    // Remove pulse after animation completes
    setTimeout(() => {
      setNeuronPulses((prev) => prev.filter((p) => p.id !== newId));
    }, 1500);

    if ((neuronFireCount + 1) % 5 === 0) {
      addToast('info', 'Loi de Hebb active : Plus l\'influx passe, plus la myéline s\'épaissit !');
    }
  };

  const handleQuizAnswerSelect = (blockIdx: number, optIdx: number) => {
    if (submittedQuizBlocks[blockIdx]) return;
    setSelectedQuizAnswers((prev) => ({ ...prev, [blockIdx]: optIdx }));
  };

  const handleQuizSubmit = (blockIdx: number, block: ContentBlock) => {
    const selected = selectedQuizAnswers[blockIdx];
    if (selected === undefined) {
      addToast('warning', 'Veuillez sélectionner une réponse.');
      return;
    }

    setSubmittedQuizBlocks((prev) => ({ ...prev, [blockIdx]: true }));
    setQuizFlipped((prev) => ({ ...prev, [blockIdx]: true }));

    const isCorrect = selected === block.correctAnswer;
    if (isCorrect) {
      addToast('success', 'Bonne réponse ! Neuroscience assimilée.');
    } else {
      addToast('error', 'Réponse incorrecte. Analyse l\'explication pour comprendre.');
    }
  };

  const handleMarkAsRead = () => {
    if (!selectedLesson) return;

    // Check if there are quizzes, and if they are all completed
    const quizBlocks = selectedLesson.content.filter((b) => b.type === 'quiz');
    const allQuizzesDone = quizBlocks.every((block, idx) => {
      // Find index of this block in full content
      const blockIdx = selectedLesson.content.indexOf(block);
      return submittedQuizBlocks[blockIdx];
    });

    if (quizBlocks.length > 0 && !allQuizzesDone) {
      addToast('warning', 'Tu dois répondre au quiz interactif avant de valider la leçon !');
      return;
    }

    // Mark as completed
    educationService.completeLesson(selectedLesson.id, selectedLesson.rewardPoints, 100);
    addToast('success', `Félicitations ! Leçon validée. +${selectedLesson.rewardPoints} Points ALPHA ajoutés !`);
    
    // Auto unlock next or go to catalog
    const currentIdx = EDUCATION_LESSONS.findIndex((l) => l.id === selectedLesson.id);
    if (currentIdx < EDUCATION_LESSONS.length - 1) {
      const nextLesson = EDUCATION_LESSONS[currentIdx + 1];
      setSelectedLesson(nextLesson);
      setScrollPercentage(0);
      setIsAudioPlaying(false);
      setAudioProgress(0);
      setSelectedQuizAnswers({});
      setSubmittedQuizBlocks({});
      setQuizFlipped({});
      
      setTimeout(() => {
        if (lessonContainerRef.current) {
          lessonContainerRef.current.scrollTop = 0;
        }
      }, 100);
    } else {
      handleCloseLesson();
    }
  };

  // Filter lessons based on category tab
  const filteredLessons = EDUCATION_LESSONS.filter((l) => {
    if (activeCategory === 'ALL') return true;
    return l.category === activeCategory;
  });

  // Calculate global completion progress
  const totalLessonsCount = EDUCATION_LESSONS.length;
  const completedCount = state.completedLessons.length;
  const completionPercentage = Math.round((completedCount / totalLessonsCount) * 100);

  return (
    <div id="alpha-education-module" className="flex flex-col gap-8 w-full max-w-7xl mx-auto p-4 md:p-6 text-white bg-[#0A0A12] rounded-3xl border border-[#16213E]/60 overflow-hidden relative">
      
      {/* BACKGROUND GRAPHIC ACCENTS */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#E94560]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* CATALOG PREVIEW OR OPEN LESSON CONDITIONAL */}
      {!selectedLesson ? (
        <>
          {/* CATALOG HEADER */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-[#16213E] pb-6 relative z-10">
            <div>
              <div className="flex items-center gap-2.5 text-[#E94560] font-mono text-xs uppercase tracking-widest mb-1.5 font-bold">
                <Brain className="w-4 h-4 animate-pulse" />
                MIND — PHASE 1.3
              </div>
              <h2 className="text-2xl md:text-3xl font-headline font-black tracking-tight text-white uppercase">
                Éducation Cérébrale Interactive
              </h2>
              <p className="text-[#8E8E93] text-sm mt-1 max-w-2xl font-light">
                Reprends le contrôle de ta chimie interne. Des leçons interactives et scientifiquement éprouvées pour comprendre la neuroscience de ton cerveau souverain.
              </p>
            </div>

            {/* Completion stats widget */}
            <div className="flex items-center gap-4 bg-[#111122] border border-[#1C1C3A] rounded-2xl px-5 py-3.5 shadow-xl">
              <div className="relative w-12 h-12 flex items-center justify-center">
                {/* SVG circular track */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="24" cy="24" r="20" stroke="#16213E" strokeWidth="4" fill="transparent" />
                  <circle 
                    cx="24" 
                    cy="24" 
                    r="20" 
                    stroke="#E94560" 
                    strokeWidth="4" 
                    fill="transparent" 
                    strokeDasharray={125.6} 
                    strokeDashoffset={125.6 - (125.6 * completionPercentage) / 100}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <span className="absolute text-[11px] font-bold font-headline">{completionPercentage}%</span>
              </div>
              <div>
                <div className="text-[10px] text-[#8E8E93] font-mono uppercase tracking-widest font-bold">PROGRÈS GLOBAL</div>
                <div className="text-sm font-bold font-headline">{completedCount} / {totalLessonsCount} LEÇONS VALIDÉES</div>
                <div className="text-[11px] text-[#00E676] font-mono font-medium">{state.totalPointsEarned.toLocaleString()} PTS COLLECTÉS</div>
              </div>
            </div>
          </div>

          {/* CATEGORY SELECTOR TABS */}
          <div className="flex flex-wrap gap-2 pb-1 overflow-x-auto scrollbar-none relative z-10 border-b border-[#16213E]/30">
            {[
              { id: 'ALL', label: 'Toutes les leçons', icon: Layers },
              { id: 'NEUROSCIENCE', label: 'Neuroscience (10)', icon: Brain },
              { id: 'PATTERN_ADDICTION', label: 'Pattern & Addiction (8)', icon: Target },
              { id: 'KEGEL_PHYSIOLOGY', label: 'Physiologie & Kegel (8)', icon: Activity },
              { id: 'VITALITY_ENERGY', label: 'Vitalité & Énergie (8)', icon: Zap },
              { id: 'CONFIDENCE_INTIMACY', label: 'Confiance & Intimité (6)', icon: Award }
            ].map((cat) => {
              const Icon = cat.icon;
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap
                    ${isSelected 
                      ? 'bg-[#E94560] text-white shadow-lg shadow-[#E94560]/20 scale-102 border border-transparent' 
                      : 'bg-[#111122] text-[#8E8E93] hover:text-white hover:bg-[#16213E]/50 border border-[#1C1C3A]'
                    }
                  `}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* LESSONS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10">
            {filteredLessons.map((lesson, idx) => {
              const globalIndex = EDUCATION_LESSONS.findIndex((l) => l.id === lesson.id);
              const isCompleted = state.completedLessons.includes(lesson.id);
              const isUnlocked = isLessonUnlocked(lesson, globalIndex);

              return (
                <AlphaCard 
                  key={lesson.id}
                  variant={isCompleted ? 'success' : isUnlocked ? 'default' : 'opaque'}
                  className={`group p-5 flex flex-col justify-between transition-all duration-300 relative overflow-hidden h-[210px] border
                    ${isUnlocked 
                      ? 'cursor-pointer hover:border-[#E94560]/40 hover:translate-y-[-4px] hover:shadow-xl hover:shadow-[#E94560]/5' 
                      : 'opacity-60 cursor-not-allowed border-[#16213E]/30 bg-[#0F0F1A]/80'
                    }
                  `}
                  onClick={() => handleSelectLesson(lesson, globalIndex)}
                >
                  {/* Subtle lock background icon */}
                  {!isUnlocked && (
                    <div className="absolute top-4 right-4 text-gray-600 bg-black/40 p-2.5 rounded-xl border border-white/5">
                      <Lock className="w-4 h-4 text-[#8E8E93]" />
                    </div>
                  )}

                  {isCompleted && (
                    <div className="absolute top-4 right-4 text-[#00E676] bg-[#00E676]/10 p-2 rounded-xl border border-[#00E676]/20">
                      <CheckCircle2 className="w-4 h-4 fill-current" />
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    {/* Category Label */}
                    <div className="flex items-center gap-1.5 text-[#E94560] font-mono text-[9px] uppercase tracking-widest font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E94560] animate-pulse" />
                      {lesson.categoryLabel}
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-headline font-extrabold tracking-tight text-white group-hover:text-[#E94560] transition-colors mt-1 line-clamp-2">
                      {lesson.title}
                    </h3>
                    
                    {/* Subtitle */}
                    <p className="text-[#8E8E93] text-xs font-light line-clamp-2 mt-0.5 leading-relaxed">
                      {lesson.subtitle}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[#16213E]/30 mt-3">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#16213E]/60 text-[#E94560] rounded-md uppercase">
                        Niveau {lesson.level}
                      </span>
                      <span className="text-[10px] font-mono text-[#8E8E93] flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {lesson.durationMinutes} min
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[#E94560] text-xs font-mono font-extrabold group-hover:translate-x-1.5 transition-transform">
                      {isUnlocked ? (
                        <>
                          {isCompleted ? 'Réviser' : 'Commencer'}
                          <ChevronRight className="w-4 h-4" />
                        </>
                      ) : (
                        <span className="text-[#8E8E93] text-[10px] uppercase font-bold tracking-widest">Verrouillé</span>
                      )}
                    </div>
                  </div>
                </AlphaCard>
              );
            })}
          </div>
        </>
      ) : (
        /* ====================================================================== */
        /* LESSON VIEWER SCREEN (Full height interactive scroll reader)           */
        /* ====================================================================== */
        <div className="flex flex-col lg:flex-row gap-6 h-[720px] relative z-10 bg-[#07070F] rounded-2xl overflow-hidden border border-[#16213E]/50">
          
          {/* SCROLL PROGRESS INDICATOR BAR */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#111122] z-55">
            <div 
              className="h-full bg-gradient-to-r from-[#E94560] to-blue-500 transition-all duration-200" 
              style={{ width: `${scrollPercentage}%` }}
            />
          </div>

          {/* LEFT INTERACTIVE PANEL (Diagrams / Sliders / Micro-simulations) */}
          <div className="w-full lg:w-5/12 bg-[#0C0C16] p-5 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#16213E]/60 overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-[#16213E]/40 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-[#E94560]/10 text-[#E94560] rounded-lg">
                  <Brain className="w-4 h-4" />
                </span>
                <span className="text-xs font-headline font-black uppercase tracking-wider text-white">Simulation interactive</span>
              </div>
              <span className="text-[10px] font-mono text-[#8E8E93] bg-[#111122] px-2 py-1 rounded">LAB_ALPHA v1.3</span>
            </div>

            {/* CUSTOM RENDERING FOR VISUALS BASED ON LESSON ID */}
            <div className="flex-1 flex flex-col items-center justify-center py-4">
              
              {/* 1. CERVEAU 3D INTERACTIF WITH HOTSPOTS */}
              {selectedLesson.content.some((b) => b.imageUrl === 'brain_reward_pathway' || b.imageUrl === 'pelvic_floor' || b.imageUrl === 'testosterone_brain') && (
                <div className="w-full flex flex-col items-center gap-4">
                  <div className="relative w-[280px] h-[220px] bg-[#0E0E1F] border border-[#1C1C3A] rounded-2xl flex items-center justify-center p-4 overflow-hidden shadow-inner">
                    
                    {/* SVG brain background */}
                    <svg viewBox="0 0 400 300" className="w-full h-full opacity-95">
                      <defs>
                        <linearGradient id="brainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#16213E" />
                          <stop offset="100%" stopColor="#0B0B14" />
                        </linearGradient>
                        <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#E94560" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#E94560" stopOpacity="0" />
                        </radialGradient>
                      </defs>
                      
                      {/* Detailed brain shape */}
                      <path 
                        d="M 200,60 C 280,60 340,90 350,150 C 360,210 320,250 280,250 C 260,250 250,230 230,230 C 210,230 190,260 170,260 C 120,260 80,220 70,170 C 60,120 120,60 200,60 Z" 
                        fill="url(#brainGrad)" 
                        stroke="#1C1C3A" 
                        strokeWidth="2" 
                      />
                      
                      {/* Sulci / convolutions lines */}
                      <path d="M 120,110 C 150,90 180,120 200,100" fill="transparent" stroke="#16213E" strokeWidth="2" />
                      <path d="M 150,150 C 180,130 200,180 230,160" fill="transparent" stroke="#16213E" strokeWidth="2" />
                      <path d="M 250,120 C 280,100 310,140 330,120" fill="transparent" stroke="#16213E" strokeWidth="2" />
                      <path d="M 110,180 C 140,170 170,200 190,190" fill="transparent" stroke="#16213E" strokeWidth="2" />

                      {/* VTA and Nucleus Accumbens link (Mésolimbique) */}
                      <path 
                        d="M 160,210 Q 180,180 220,165" 
                        fill="transparent" 
                        stroke={activeHotspot === 'vta' || activeHotspot === 'nucleus' ? '#E94560' : '#1C1C3A'} 
                        strokeWidth="3" 
                        strokeDasharray="5,5"
                        className={activeHotspot === 'vta' || activeHotspot === 'nucleus' ? 'animate-pulse' : ''}
                      />

                      {/* Hotspot 1: Cortex Préfrontal (Front) */}
                      <circle 
                        cx="120" 
                        cy="130" 
                        r="16" 
                        fill={activeHotspot === 'pfc' ? 'rgba(0, 230, 118, 0.2)' : 'rgba(0, 230, 118, 0.05)'} 
                        stroke="#00E676" 
                        strokeWidth="2" 
                        className="cursor-pointer transition-all hover:r-[18]"
                        onClick={() => setActiveHotspot('pfc')}
                      />
                      <text x="120" y="134" textAnchor="middle" fill="#00E676" fontSize="10" className="cursor-pointer font-black" onClick={() => setActiveHotspot('pfc')}>PFC</text>

                      {/* Hotspot 2: Nucleus Accumbens (Reward) */}
                      <circle 
                        cx="220" 
                        cy="165" 
                        r="14" 
                        fill={activeHotspot === 'nucleus' ? 'rgba(233, 69, 96, 0.2)' : 'rgba(233, 69, 96, 0.05)'} 
                        stroke="#E94560" 
                        strokeWidth="2" 
                        className="cursor-pointer transition-all hover:r-[16]"
                        onClick={() => setActiveHotspot('nucleus')}
                      />
                      <text x="220" y="169" textAnchor="middle" fill="#E94560" fontSize="8" className="cursor-pointer font-bold" onClick={() => setActiveHotspot('nucleus')}>NAc</text>

                      {/* Hotspot 3: Amygdale (Stress / Trigger) */}
                      <circle 
                        cx="200" 
                        cy="195" 
                        r="14" 
                        fill={activeHotspot === 'amygdale' ? 'rgba(255, 152, 0, 0.2)' : 'rgba(255, 152, 0, 0.05)'} 
                        stroke="#FF9800" 
                        strokeWidth="2" 
                        className="cursor-pointer transition-all hover:r-[16]"
                        onClick={() => setActiveHotspot('amygdale')}
                      />
                      <text x="200" y="199" textAnchor="middle" fill="#FF9800" fontSize="8" className="cursor-pointer font-bold" onClick={() => setActiveHotspot('amygdale')}>AMY</text>

                      {/* Hotspot 4: Aire Tegmentale Ventrale (VTA) */}
                      <circle 
                        cx="160" 
                        cy="210" 
                        r="12" 
                        fill={activeHotspot === 'vta' ? 'rgba(33, 150, 243, 0.2)' : 'rgba(33, 150, 243, 0.05)'} 
                        stroke="#2196F3" 
                        strokeWidth="2" 
                        className="cursor-pointer transition-all hover:r-[14]"
                        onClick={() => setActiveHotspot('vta')}
                      />
                      <text x="160" y="214" textAnchor="middle" fill="#2196F3" fontSize="8" className="cursor-pointer font-bold" onClick={() => setActiveHotspot('vta')}>VTA</text>
                    </svg>

                    {/* Glowing active animation indicator */}
                    {activeHotspot && (
                      <div className="absolute inset-0 bg-[#E94560]/5 animate-pulse pointer-events-none" />
                    )}
                  </div>
                  
                  {/* HOTSPOT INFO PANEL */}
                  <div className="w-full bg-[#111122] border border-[#1C1C3A] p-4 rounded-xl text-xs leading-relaxed min-h-[90px]">
                    {!activeHotspot ? (
                      <div className="flex items-center gap-2 text-[#8E8E93] justify-center h-full text-center py-4">
                        <Info className="w-4 h-4 text-[#E94560] animate-bounce" />
                        <span>Clique sur une région du cerveau (PFC, NAc, AMY, VTA) pour activer le neuro-coaching tactique.</span>
                      </div>
                    ) : (
                      <div>
                        {activeHotspot === 'pfc' && (
                          <>
                            <div className="text-[#00E676] font-bold uppercase mb-1 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#00E676] animate-ping" />
                              CORTEX PRÉFRONTAL (PFC) — Le Siège du Veto
                            </div>
                            <p className="text-[#8E8E93]">Gère la discipline suprême et l\'inhibition consciente. En disant NON à l\'impulsion, tu augmentes la densité synaptique de ce pilote intérieur, le renforçant physiquement comme un muscle.</p>
                          </>
                        )}
                        {activeHotspot === 'nucleus' && (
                          <>
                            <div className="text-[#E94560] font-bold uppercase mb-1 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#E94560] animate-ping" />
                              NUCLEUS ACCUMBENS — Le Centre du Désir
                            </div>
                            <p className="text-[#8E8E93]">Reçoit la dopamine libérée par la VTA lors de la quête et crée l\'intense tension d\'anticipation. Saturé par les pixels, il se désensibilise. La detox rétablit sa sensibilité d\'origine.</p>
                          </>
                        )}
                        {activeHotspot === 'amygdale' && (
                          <>
                            <div className="text-[#FF9800] font-bold uppercase mb-1 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#FF9800] animate-ping" />
                              AMYGDALE — Détecteur de Stress et d\'Alarme
                            </div>
                            <p className="text-[#8E8E93]">Déclenche les impulsions de fuite face à l\'angoisse et au stress. En neutralisant l\'amygdale par la douche froide ou l\'apnée, tu coupes le signal de fuite dopaminergique.</p>
                          </>
                        )}
                        {activeHotspot === 'vta' && (
                          <>
                            <div className="text-[#2196F3] font-bold uppercase mb-1 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#2196F3] animate-ping" />
                              AIRE TEGMENTALE VENTRALE (VTA) — La Pompe à Dopamine
                            </div>
                            <p className="text-[#8E8E93]">Point d\'origine de la voie mésolimbique. Elle pompe la dopamine vers le Nucleus Accumbens chaque fois qu\'un signal prometteur de reproduction ou de récompense est capté par vos sens.</p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 2. DYNAMIC DOPAMINE SPIKE & CRASH GRAPH */}
              {selectedLesson.content.some((b) => b.imageUrl === 'dopamine_vs_pleasure' || b.imageUrl === 'memory_filter' || b.imageUrl === 'receptors_density' || b.imageUrl === 'kegel_studies') && (
                <div className="w-full flex flex-col gap-4">
                  
                  {/* MORPHING PATHWAY GRAPHICS */}
                  <div className="relative w-full h-[180px] bg-[#0E0E1F] border border-[#1C1C3A] rounded-2xl p-4 overflow-hidden shadow-inner">
                    <div className="absolute top-2 left-2 text-[10px] font-mono text-[#8E8E93] uppercase">Voie de Récompense (Dopamine over Time)</div>
                    
                    <svg viewBox="0 0 400 150" className="w-full h-full">
                      {/* Zero baseline */}
                      <line x1="10" y1="100" x2="390" y2="100" stroke="#16213E" strokeWidth="1" strokeDasharray="3,3" />
                      <text x="360" y="93" fill="#8E8E93" fontSize="8" fontClassName="font-mono">Baseline</text>

                      {/* Morphing dopamine path curve */}
                      {dopamineSliderVal <= 180 ? (
                        /* NATURAL REWARD CURVE (Smooth curve, modest peak, fast return to baseline, no deep crash) */
                        <path 
                          d="M 10,100 Q 80,100 120,60 T 200,90 T 300,100 T 390,100" 
                          fill="none" 
                          stroke="#00E676" 
                          strokeWidth="3" 
                          className="transition-all duration-300" 
                        />
                      ) : (
                        /* ARTIFICIAL OVERLOAD CURVE (Insane spike, massive slope, followed by an extremely deep deficit/crash) */
                        <path 
                          d={`M 10,100 Q 60,100 100,${120 - dopamineSliderVal/2.5} T 160,135 T 260,138 T 390,105`} 
                          fill="none" 
                          stroke="#E94560" 
                          strokeWidth="3.5" 
                          className="transition-all duration-300 animate-pulse" 
                        />
                      )}

                      {/* Floating dots indicating active status */}
                      <circle 
                        cx={dopamineSliderVal <= 180 ? "120" : "100"} 
                        cy={dopamineSliderVal <= 180 ? "60" : `${120 - dopamineSliderVal/2.5}`} 
                        r="6" 
                        fill={dopamineSliderVal <= 180 ? "#00E676" : "#E94560"} 
                        className="animate-ping" 
                      />
                    </svg>

                    {/* Deficit warning tag for deep crash */}
                    {dopamineSliderVal > 250 && (
                      <div className="absolute bottom-2 right-4 text-[9px] font-mono font-black text-[#E94560] bg-[#E94560]/10 border border-[#E94560]/20 px-2 py-0.5 rounded uppercase animate-pulse">
                        DOPAMINE DEFICIT STATE (Crash chimique)
                      </div>
                    )}
                  </div>

                  {/* USER INTERACTION SLIDER */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono text-[#8E8E93]">Stimulus Sélectionné :</span>
                      <span className={`font-mono font-bold ${dopamineSliderVal <= 180 ? 'text-[#00E676]' : 'text-[#E94560]'}`}>
                        {dopamineSliderVal <= 180 ? 'Interaction Humaine Réelle' : 'Stimulation Numérique Massive (Porno)'}
                      </span>
                    </div>
                    
                    <input 
                      type="range"
                      min="50"
                      max="400"
                      value={dopamineSliderVal}
                      onChange={(e) => setDopamineSliderVal(Number(e.target.value))}
                      className="w-full accent-[#E94560] h-1.5 bg-[#16213E] rounded-lg appearance-none cursor-pointer"
                    />

                    <div className="bg-[#111122] border border-[#1C1C3A] p-3 rounded-xl text-xs text-[#8E8E93] leading-relaxed">
                      {dopamineSliderVal <= 180 ? (
                        <p>🌱 <strong className="text-white">Dopamine saine :</strong> La courbe s\'élève de manière modérée et redescend en douceur sur la baseline. Pas de crash compensation : tu gardes ta motivation intacte pour d\'autres tâches.</p>
                      ) : (
                        <p>🚨 <strong className="text-white">Inondation dopaminergique :</strong> Le signal explose de 10x sa valeur. Pour s\'adapter, le cerveau élague instantanément ses récepteurs, provoquant un crash abyssal sous la baseline (vide, angoisse, manque, impulsion obsessive).</p>
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* 3. NEURONE ÉLECTRIQUE ANIMÉ (LAW OF HEBB) */}
              {selectedLesson.content.some((b) => b.imageUrl === 'neuroplasticity_growth' || b.imageUrl === 'starving_pattern' || b.imageUrl === 'energy_transmutation' || b.imageUrl === 'kegel_advanced') && (
                <div className="w-full flex flex-col gap-4">
                  <div className="relative w-full h-[180px] bg-[#0E0E1F] border border-[#1C1C3A] rounded-2xl flex items-center justify-center p-4 overflow-hidden">
                    <div className="absolute top-2 left-2 text-[10px] font-mono text-[#8E8E93] uppercase">Transmission Synaptique active</div>
                    
                    {/* Animated Neuron Path */}
                    <svg viewBox="0 0 400 120" className="w-full h-full">
                      {/* Gaine de Myéline (Axon casing) */}
                      <rect 
                        x="100" 
                        y="50" 
                        width="200" 
                        height="20" 
                        rx="10" 
                        fill="#16213E" 
                        stroke="#1C1C3A" 
                        strokeWidth="1.5" 
                      />

                      {/* Myelination thickness visually grows based on fire counts */}
                      <rect 
                        x="100" 
                        y="52" 
                        width="200" 
                        height="16" 
                        rx="8" 
                        fill="transparent"
                        stroke="#00E676" 
                        strokeWidth={Math.min(8, 1 + neuronFireCount * 0.4)} 
                        strokeOpacity={Math.min(0.9, 0.2 + neuronFireCount * 0.08)}
                        className="transition-all duration-300"
                      />

                      {/* Soma (Body of neuron) */}
                      <circle cx="80" cy="60" r="22" fill="#111122" stroke="#E94560" strokeWidth="2.5" />
                      <text x="80" y="63" textAnchor="middle" fill="#E94560" fontSize="8" className="font-bold">SOMA</text>

                      {/* Synapse dendrite branches */}
                      <path d="M 300,60 Q 330,40 350,30" fill="none" stroke="#16213E" strokeWidth="2" />
                      <path d="M 300,60 Q 330,60 360,60" fill="none" stroke="#16213E" strokeWidth="2" />
                      <path d="M 300,60 Q 330,80 350,90" fill="none" stroke="#16213E" strokeWidth="2" />

                      {/* Active electrical pulse animation elements */}
                      {neuronPulses.map((p) => (
                        <circle 
                          key={p.key} 
                          cx="80" 
                          cy="60" 
                          r="6" 
                          fill="#FFD700" 
                          className="animate-pulse"
                        >
                          <animate 
                            attributeName="cx" 
                            from="80" 
                            to="320" 
                            dur="1.2s" 
                            repeatCount="1" 
                          />
                          <animate 
                            attributeName="fill" 
                            from="#E94560" 
                            to="#00E676" 
                            dur="1.2s" 
                            repeatCount="1" 
                          />
                        </circle>
                      ))}
                    </svg>

                    {/* Counts indicator */}
                    <div className="absolute bottom-2 right-4 text-[9px] font-mono text-[#8E8E93]">
                      Myélinisation active : <strong className="text-[#00E676]">{Math.min(100, Math.round(neuronFireCount * 8.5))}%</strong>
                    </div>
                  </div>

                  {/* FIRE BUTTON */}
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={handleFireNeuron}
                      className="w-full py-3 rounded-xl text-xs font-headline font-black uppercase tracking-widest bg-gradient-to-r from-blue-600 to-[#E94560] text-white hover:opacity-95 shadow-md shadow-[#E94560]/10 flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-transform"
                    >
                      <Zap className="w-4 h-4 animate-bounce" />
                      ENVOYER L'INFLUX DE CONTRÔLE (Veto Conscient)
                    </button>
                    
                    <div className="bg-[#111122] border border-[#1C1C3A] p-3 rounded-xl text-xs text-[#8E8E93] leading-relaxed">
                      <p>💡 <strong className="text-white">Loi de Hebb :</strong> Chaque fois que tu fais passer consciemment l\'influx de discipline dans ton cerveau, tu fortifies l\'isolant gras (la myéline) autour de l\'axone. Dire NON devient de plus en plus physique et fluide à réaliser.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. BEFORE AFTER BRAIN HEATMAP COMPARE */}
              {selectedLesson.content.some((b) => b.imageUrl === 'receptors_density' || b.imageUrl === 'brain_heatmap' || b.imageUrl === 'cold_exposure' || b.imageUrl === 'sleep_hormones' || b.imageUrl === 'real_intimacy') && (
                <div className="w-full flex flex-col gap-4">
                  <div className="relative w-full h-[180px] bg-[#0E0E1F] border border-[#1C1C3A] rounded-2xl flex items-center justify-center p-4 overflow-hidden shadow-inner">
                    <div className="absolute top-2 left-2 text-[10px] font-mono text-[#8E8E93] uppercase">
                      Visualisation d'activité (Heatmap d'activité IRM)
                    </div>

                    {/* Left brain active vs right brain comparison */}
                    <div className="flex gap-12 items-center justify-center w-full">
                      <div className="text-center">
                        <div className={`relative w-20 h-20 rounded-full border flex items-center justify-center transition-all duration-300
                          ${beforeAfterToggle === 'BEFORE' 
                            ? 'bg-red-500/10 border-red-500/30 shadow-lg shadow-red-500/10' 
                            : 'bg-[#16213E]/30 border-[#1C1C3A]'
                          }
                        `}>
                          <Brain className={`w-8 h-8 transition-colors ${beforeAfterToggle === 'BEFORE' ? 'text-red-500' : 'text-gray-600'}`} />
                          {beforeAfterToggle === 'BEFORE' && (
                            <span className="absolute text-[8px] font-bold font-mono text-red-500 bottom-1 animate-pulse uppercase">Déséquilibré</span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#8E8E93] font-mono mt-1 block">Avant 90j</span>
                      </div>

                      <div className="text-center">
                        <div className={`relative w-20 h-20 rounded-full border flex items-center justify-center transition-all duration-300
                          ${beforeAfterToggle === 'AFTER' 
                            ? 'bg-[#00E676]/10 border-[#00E676]/30 shadow-lg shadow-[#00E676]/10' 
                            : 'bg-[#16213E]/30 border-[#1C1C3A]'
                          }
                        `}>
                          <Brain className={`w-8 h-8 transition-colors ${beforeAfterToggle === 'AFTER' ? 'text-[#00E676]' : 'text-gray-600'}`} />
                          {beforeAfterToggle === 'AFTER' && (
                            <span className="absolute text-[8px] font-bold font-mono text-[#00E676] bottom-1 animate-pulse uppercase">Alpha</span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#8E8E93] font-mono mt-1 block">Après 90j</span>
                      </div>
                    </div>
                  </div>

                  {/* CHANGER LE TOGGLE */}
                  <div className="flex bg-[#111122] border border-[#1C1C3A] p-1 rounded-xl">
                    <button 
                      onClick={() => setBeforeAfterToggle('BEFORE')}
                      className={`flex-1 py-2 text-xs font-headline font-bold rounded-lg cursor-pointer transition-all
                        ${beforeAfterToggle === 'BEFORE' ? 'bg-[#E94560] text-white' : 'text-[#8E8E93] hover:text-white'}
                      `}
                    >
                      Cerveau Déclencheur / Impulsif
                    </button>
                    <button 
                      onClick={() => setBeforeAfterToggle('AFTER')}
                      className={`flex-1 py-2 text-xs font-headline font-bold rounded-lg cursor-pointer transition-all
                        ${beforeAfterToggle === 'AFTER' ? 'bg-[#00E676] text-black font-black' : 'text-[#8E8E93] hover:text-white'}
                      `}
                    >
                      Cerveau Souverain / Restauré
                    </button>
                  </div>

                  <div className="bg-[#111122] border border-[#1C1C3A] p-3 rounded-xl text-xs text-[#8E8E93] leading-relaxed">
                    {beforeAfterToggle === 'BEFORE' ? (
                      <p>💥 <strong className="text-red-500">Hypo-frontalité :</strong> Le cortex préfrontal rationnel est déconnecté de son centre de veto. L\'amygdale (stress) et le striatum dirigent toutes vos réactions immédiates.</p>
                    ) : (
                      <p>🏆 <strong className="text-[#00E676]">Souveraineté :</strong> L\'IRM fonctionnelle montre une reconnexion dense et solide du PFC. Le signal vagal est puissant, éteignant naturellement les tensions pelviennes et d\'addiction.</p>
                    )}
                  </div>
                </div>
              )}

              {/* DEFAULT PLACEHOLDER FOR GENERAL LESSONS */}
              {!selectedLesson.content.some((b) => b.imageUrl) && (
                <div className="w-full flex flex-col items-center justify-center p-6 text-center border border-[#1C1C3A] border-dashed rounded-2xl bg-[#090912]">
                  <Layers className="w-12 h-12 text-[#E94560]/40 animate-pulse mb-3" />
                  <h4 className="text-sm font-headline font-black uppercase text-white mb-1">Visualisation du Flux Cognitif</h4>
                  <p className="text-xs text-[#8E8E93] max-w-xs">Poursuis le défilement de ta leçon pour apprécier les citations et lancer le quiz d\'assimilation synaptique.</p>
                </div>
              )}

            </div>

            {/* SIMULATED TTS AUDIO READER PLAYER */}
            <div className="bg-[#111122] border border-[#1C1C3A] p-4 rounded-xl flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-[#E94560]" />
                  <span className="text-xs font-headline font-bold text-white uppercase">Synthèse Vocale Alpha</span>
                </div>
                <button 
                  onClick={() => setIsMuted(!isMuted)} 
                  className="text-[#8E8E93] hover:text-white p-1 rounded transition-colors cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>

              {/* Dynamic Soundwave animation */}
              <div className="flex justify-between items-center gap-1 h-8 bg-black/40 rounded-lg p-2.5">
                {Array(20).fill(0).map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-1 rounded-full transition-all duration-300 bg-gradient-to-t from-blue-500 to-[#E94560]
                      ${isAudioPlaying ? 'animate-pulse' : 'opacity-30'}
                    `}
                    style={{ 
                      height: isAudioPlaying ? `${Math.floor(Math.random() * 20) + 4}px` : '4px',
                      animationDelay: `${i * 40}ms`
                    }}
                  />
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsAudioPlaying(!isAudioPlaying)}
                  className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-center text-white
                    ${isAudioPlaying ? 'bg-red-600' : 'bg-[#E94560]'}
                  `}
                >
                  {isAudioPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                </button>

                <div className="flex-1">
                  <div className="flex justify-between text-[10px] text-[#8E8E93] font-mono mb-1">
                    <span>{isAudioPlaying ? 'Lecture active' : 'Audio en pause'}</span>
                    <span>{Math.floor((audioProgress / 100) * selectedLesson.durationMinutes)}:00 / {selectedLesson.durationMinutes}:00 min</span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1 bg-black rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-[#E94560] transition-all duration-300"
                      style={{ width: `${audioProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT VIEWPORT PANEL: LESSON VERTICAL SCROLL CONTENT READER */}
          <div className="w-full lg:w-7/12 flex flex-col relative bg-[#07070F]">
            
            {/* STICKY CONTENT READER HEADER */}
            <div className="flex items-center justify-between p-4 border-b border-[#16213E]/50 bg-black/60 backdrop-blur-xl absolute top-0 left-0 right-0 z-40">
              <button 
                onClick={handleCloseLesson}
                className="flex items-center gap-1.5 text-xs text-[#8E8E93] hover:text-white font-headline font-extrabold uppercase tracking-wider transition-colors cursor-pointer bg-[#111122] px-3.5 py-2 rounded-xl border border-[#1C1C3A]"
              >
                <ChevronLeft className="w-4 h-4" />
                Retour Catalogue
              </button>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[#00E676] bg-[#00E676]/10 border border-[#00E676]/20 px-2.5 py-1 rounded-full uppercase font-black tracking-widest animate-pulse">
                  +{selectedLesson.rewardPoints} points
                </span>
              </div>
            </div>

            {/* THE VERTICAL SCROLLER */}
            <div 
              ref={lessonContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-6 pt-22 pb-24 scroll-smooth"
            >
              
              <div className="max-w-xl mx-auto flex flex-col gap-6">
                
                {/* LESSON METADATA INTRO */}
                <div className="border-b border-[#16213E]/40 pb-5 mb-2">
                  <div className="text-[10px] font-mono font-black text-[#E94560] uppercase tracking-widest mb-1">
                    {selectedLesson.categoryLabel}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-headline font-black text-white leading-tight uppercase tracking-tight">
                    {selectedLesson.title}
                  </h1>
                  <h3 className="text-[#8E8E93] text-sm font-light mt-1.5 italic">
                    {selectedLesson.subtitle}
                  </h3>
                </div>

                {/* DYNAMIC CONTENT BLOCK RENDERING */}
                {selectedLesson.content.map((block, index) => {
                  
                  if (block.type === 'header') {
                    return (
                      <h3 key={index} className="text-lg font-headline font-black uppercase text-white mt-4 border-l-2 border-[#E94560] pl-3.5 tracking-tight">
                        {block.text}
                      </h3>
                    );
                  }

                  if (block.type === 'text') {
                    return (
                      <p key={index} className="text-sm text-[#BCBCC3] leading-relaxed font-light text-justify">
                        {block.text}
                      </p>
                    );
                  }

                  if (block.type === 'quote') {
                    return (
                      <div key={index} className="bg-[#111122] border border-[#1C1C3A] p-5 rounded-2xl relative my-3 shadow-xl">
                        <span className="absolute top-2 left-4 text-4xl text-[#E94560]/30 font-serif">“</span>
                        <p className="text-sm italic text-gray-200 leading-relaxed pl-4 pt-2 relative z-10 font-medium">
                          {block.text}
                        </p>
                        <div className="text-right text-[11px] text-[#E94560] font-mono uppercase tracking-wider font-extrabold mt-3.5">
                          — {block.author}
                        </div>
                      </div>
                    );
                  }

                  if (block.type === 'citation') {
                    return (
                      <div key={index} className="border-t border-[#16213E]/40 pt-4 mt-2 mb-4">
                        <div className="text-[9px] font-mono text-[#8E8E93] uppercase font-bold tracking-widest mb-1.5">
                          RÉFÉRENCE CLINIQUE ET SCIENTIFIQUE
                        </div>
                        <p className="text-[10px] font-mono text-[#E94560]/80 leading-relaxed border-l border-[#1C1C3A] pl-3">
                          {block.text}
                        </p>
                      </div>
                    );
                  }

                  // Skip rendering illustration and slider in vertical scroll, they are already on the left simulator panel!
                  if (block.type === 'illustration' || block.type === 'interactive') {
                    return null;
                  }

                  /* DUAL-CARD FLIPPABLE QUIZ COMPONENT */
                  if (block.type === 'quiz') {
                    const isFlipped = quizFlipped[index];
                    const selectedAns = selectedQuizAnswers[index];
                    const isSubmitted = submittedQuizBlocks[index];
                    const isCorrect = selectedAns === block.correctAnswer;

                    return (
                      <div key={index} className="my-6 relative perspective-1000 w-full min-h-[290px]">
                        
                        <div className={`w-full min-h-[290px] transition-transform duration-700 transform-style-3d relative
                          ${isFlipped ? 'rotate-y-180' : ''}
                        `}>
                          
                          {/* QUIZ FRONT CARD */}
                          <div className="absolute inset-0 backface-hidden w-full h-full bg-[#111122] border border-[#1C1C3A] rounded-2xl p-5 flex flex-col justify-between shadow-xl">
                            <div>
                              <div className="flex justify-between items-center border-b border-[#16213E]/40 pb-3 mb-4">
                                <span className="text-[10px] font-mono text-[#E94560] uppercase tracking-widest font-black flex items-center gap-1.5">
                                  <HelpCircle className="w-3.5 h-3.5 animate-pulse" />
                                  Assimilation Synaptique
                                </span>
                                <span className="text-[9px] font-mono text-[#8E8E93] uppercase">QUIZ INTERACTIF</span>
                              </div>

                              <h4 className="text-sm font-headline font-black text-white leading-snug uppercase mb-4 tracking-tight">
                                {block.question}
                              </h4>

                              {/* Options list */}
                              <div className="flex flex-col gap-2.5">
                                {block.options?.map((opt, optIdx) => {
                                  const isSelected = selectedAns === optIdx;
                                  return (
                                    <button
                                      key={optIdx}
                                      onClick={() => handleQuizAnswerSelect(index, optIdx)}
                                      className={`w-full text-left p-3.5 rounded-xl text-xs transition-all flex items-center justify-between border cursor-pointer
                                        ${isSelected 
                                          ? 'bg-[#E94560]/10 border-[#E94560] text-white font-bold' 
                                          : 'bg-[#090913] border-[#1C1C3A] text-[#8E8E93] hover:text-white hover:border-[#16213E]'
                                        }
                                      `}
                                    >
                                      <span>{opt}</span>
                                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px]
                                        ${isSelected ? 'bg-[#E94560] border-transparent text-white' : 'border-gray-600'}
                                      `}>
                                        {isSelected && '✓'}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Submit validation CTA */}
                            <div className="pt-4 mt-4 border-t border-[#16213E]/30 flex justify-end">
                              <AlphaButton 
                                variant="default"
                                size="sm"
                                disabled={selectedAns === undefined || isSubmitted}
                                onClick={() => handleQuizSubmit(index, block)}
                                className="font-black uppercase text-[10px] tracking-widest bg-[#E94560] cursor-pointer"
                              >
                                Valider et Retourner
                                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                              </AlphaButton>
                            </div>
                          </div>

                          {/* QUIZ BACK CARD (RESULTS) */}
                          <div className="absolute inset-0 backface-hidden rotate-y-180 w-full h-full bg-[#111122] border rounded-2xl p-5 flex flex-col justify-between shadow-xl
                            ${isCorrect ? 'border-[#00E676]/30' : 'border-[#E94560]/30'}
                          ">
                            <div>
                              <div className="flex justify-between items-center border-b border-[#16213E]/40 pb-3 mb-4">
                                <span className={`text-[10px] font-mono uppercase tracking-widest font-black flex items-center gap-1.5
                                  ${isCorrect ? 'text-[#00E676]' : 'text-[#E94560]'}
                                `}>
                                  {isCorrect ? '✓ Neuro-Assimilation Réussie' : '✗ Erreur Neurologique'}
                                </span>
                                <span className="text-[9px] font-mono text-[#8E8E93]">RESULTAT</span>
                              </div>

                              <div className="flex flex-col gap-3 py-2">
                                <div className="text-xs text-[#8E8E93]">Ta réponse :</div>
                                <div className={`text-xs p-3 rounded-xl border font-bold
                                  ${isCorrect 
                                    ? 'bg-[#00E676]/5 border-[#00E676]/30 text-[#00E676]' 
                                    : 'bg-[#E94560]/5 border-[#E94560]/30 text-[#E94560]'
                                  }
                                `}>
                                  {block.options?.[selectedAns || 0]}
                                </div>

                                <div className="text-xs text-white leading-relaxed bg-[#090913] p-4 rounded-xl border border-[#1C1C3A] text-justify font-light mt-1">
                                  <strong className="text-[#00E676] block mb-1 uppercase font-bold text-[10px] tracking-wide">Explication Scientifique :</strong>
                                  {block.explanation}
                                </div>
                              </div>
                            </div>

                            <div className="pt-4 border-t border-[#16213E]/30 flex justify-between items-center">
                              <span className="text-[10px] text-[#8E8E93] font-mono">LAB_ALPHA SYSTEM</span>
                              <button 
                                onClick={() => setQuizFlipped((prev) => ({ ...prev, [index]: false }))}
                                className="text-xs font-headline font-black text-[#E94560] hover:text-white transition-colors uppercase tracking-widest cursor-pointer"
                              >
                                Revoir ma réponse
                              </button>
                            </div>

                          </div>

                        </div>
                      </div>
                    );
                  }

                  return null;
                })}

              </div>
            </div>

            {/* STICKY ACTION BUTTON BAR AT THE BOTTOM */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#16213E]/50 bg-black/80 backdrop-blur-xl flex justify-between items-center z-40">
              <span className="text-xs font-mono text-[#8E8E93] font-medium">
                Lecture complète requise
              </span>

              <AlphaButton
                variant={state.completedLessons.includes(selectedLesson.id) ? 'success' : 'default'}
                onClick={handleMarkAsRead}
                className="font-black uppercase tracking-widest text-[11px] px-6 py-4 rounded-xl cursor-pointer"
              >
                {state.completedLessons.includes(selectedLesson.id) 
                  ? 'Continuer / Leçon validée ✓' 
                  : 'J\'AI COMPRIS (Valider la leçon) ✓'
                }
              </AlphaButton>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
