import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Award, 
  X, 
  MessageSquare 
} from 'lucide-react';

export interface CircuitObserverDiagramProps {
  mode?: 'demo' | 'personal';
  context?: 'lesson' | 'dashboard' | 'crisis'; // default: 'lesson'
  userStats?: {
    resistCount: number;
    relapseCount: number;
  } | null;
  topTrigger?: string | null;
  trendData?: Array<{ date: string; observeRatio: number }> | null;
  isFirstSimulationCompletion?: boolean;
  isRTL?: boolean;
  urgeSurfDurationSeconds?: number; // default: 90
  embedded?: boolean;
  addToast?: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
  onSimulationComplete?: (choice: 'automatic' | 'observe', wasFirstTime: boolean) => void;
  onUrgeSurfComplete?: (outcome: 'resisted' | 'relapsed', durationHeld: number) => void;
  onRequestCoachChat?: () => void;
}

export const CircuitObserverDiagram: React.FC<CircuitObserverDiagramProps> = ({
  mode = 'demo',
  context = 'lesson',
  userStats = null,
  topTrigger = null,
  trendData = null,
  isFirstSimulationCompletion = false,
  isRTL = false,
  urgeSurfDurationSeconds = 90,
  embedded = false,
  addToast,
  onSimulationComplete,
  onUrgeSurfComplete,
  onRequestCoachChat
}) => {
  const isMounted = useRef<boolean>(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Safe haptic utility
  const triggerHaptic = (style: 'light' | 'medium') => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      try {
        if (style === 'light') {
          window.navigator.vibrate(15);
        } else {
          window.navigator.vibrate(30);
        }
      } catch (e) {
        // Ignored
      }
    }
  };

  const showToast = addToast || ((type, msg) => console.log(`[Toast ${type}] ${msg}`));

  // Resolve initial activeMode taking context into account
  const getInitialMode = () => {
    if (context === 'crisis') {
      return userStats ? 'personal' : 'demo';
    }
    return mode;
  };

  // Component states
  const [activeMode, setActiveMode] = useState<'demo' | 'personal'>(getInitialMode);
  const [simulationStep, setSimulationStep] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [userChoice, setUserChoice] = useState<'automatic' | 'observe' | null>(null);
  const [tempHighlight, setTempHighlight] = useState<boolean>(false);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  // Sparkline trend state
  const [trendDays, setTrendDays] = useState<7 | 30>(7);

  // Crisis Mode States
  const [timerStatus, setTimerStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const [timeLeft, setTimeLeft] = useState<number>(urgeSurfDurationSeconds);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold1' | 'exhale' | 'hold2'>('inhale');
  const [breathingSeconds, setBreathingSeconds] = useState<number>(4);
  const [rotatingMessageIndex, setRotatingMessageIndex] = useState<number>(0);
  const [crisisOutcome, setCrisisOutcome] = useState<'resisted' | 'relapsed' | null>(null);

  // Reward state
  const [showRewardOverlay, setShowRewardOverlay] = useState<boolean>(false);

  // Sync mode changes
  useEffect(() => {
    setActiveMode(getInitialMode());
  }, [mode, context, userStats]);

  // Timeouts references for cleanup
  const simTimeout1Ref = useRef<NodeJS.Timeout | null>(null);
  const simTimeout2Ref = useRef<NodeJS.Timeout | null>(null);
  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimers = () => {
    if (simTimeout1Ref.current) clearTimeout(simTimeout1Ref.current);
    if (simTimeout2Ref.current) clearTimeout(simTimeout2Ref.current);
    if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  // Calculate widths
  const stats = userStats || { resistCount: 0, relapseCount: 0 };
  const total = stats.resistCount + stats.relapseCount || 1;
  const observeRatio = stats.resistCount / total;

  let autoWidth = 9;
  let consciousWidth = 3;

  if (activeMode === 'personal' && userStats) {
    autoWidth = 3 + (1 - observeRatio) * 7;
    consciousWidth = 3 + observeRatio * 7;
  }

  // Handle mode toggle
  const handleToggleMode = (targetMode: 'demo' | 'personal') => {
    if (targetMode === 'personal' && !userStats) {
      triggerHaptic('light');
      showToast('info', "Complète 5 jours de suivi Pattern Killer pour débloquer ton circuit personnel");
      setShowTooltip(true);
      setTimeout(() => {
        if (isMounted.current) setShowTooltip(false);
      }, 4000);
      return;
    }

    triggerHaptic('light');
    setActiveMode(targetMode);
    // Reset simulation when switching modes
    setSimulationStep(0);
    setUserChoice(null);
  };

  // Start simulation
  const startSimulation = () => {
    clearTimers();
    triggerHaptic('medium');
    setSimulationStep(1);
    setUserChoice(null);

    // Step 1: Déclencheur pulse for 1.5s, then transition to Step 2 (Urge Wave)
    simTimeout1Ref.current = setTimeout(() => {
      if (isMounted.current) {
        setSimulationStep(2);
        // Step 2: Urge Wave runs for 5 seconds (from 1500ms to 6500ms)
        simTimeout2Ref.current = setTimeout(() => {
          if (isMounted.current) {
            setSimulationStep(3); // Choices appear
          }
        }, 5000);
      }
    }, 1500);
  };

  // Start Crisis Urge Surfing Minuteur
  const startCrisisUrgeSurf = () => {
    clearTimers();
    triggerHaptic('medium');
    setTimeLeft(urgeSurfDurationSeconds);
    setBreathingPhase('inhale');
    setBreathingSeconds(4);
    setRotatingMessageIndex(0);
    setTimerStatus('running');
    setCrisisOutcome(null);
  };

  // Crisis mode countdown interval
  useEffect(() => {
    if (timerStatus !== 'running') return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerStatus('completed');
          triggerHaptic('medium');
          return 0;
        }
        return prev - 1;
      });

      // Box Breathing 4-4-4-4 countdown
      setBreathingSeconds(prev => {
        if (prev <= 1) {
          setBreathingPhase(curr => {
            if (curr === 'inhale') return 'hold1';
            if (curr === 'hold1') return 'exhale';
            if (curr === 'exhale') return 'hold2';
            return 'inhale';
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerStatus]);

  // Message rotator: change index every 15s
  useEffect(() => {
    if (timerStatus !== 'running') return;

    const msgInterval = setInterval(() => {
      setRotatingMessageIndex(prev => (prev + 1) % 3);
    }, 15000);

    return () => clearInterval(msgInterval);
  }, [timerStatus]);

  // Handle choice in simulation
  const handleChoice = (choice: 'automatic' | 'observe') => {
    if (choice === 'observe') {
      triggerHaptic('medium');
    } else {
      triggerHaptic('light');
    }

    setUserChoice(choice);
    setSimulationStep(4);
    setTempHighlight(true);

    // Call simulation complete callback
    if (onSimulationComplete) {
      onSimulationComplete(choice, isFirstSimulationCompletion);
    }

    // Show Reward overlay if it's the first completion and the parent reports it
    if (isFirstSimulationCompletion) {
      setShowRewardOverlay(true);
      setTimeout(() => {
        if (isMounted.current) {
          setShowRewardOverlay(false);
        }
      }, 3000);
    }

    highlightTimeoutRef.current = setTimeout(() => {
      if (isMounted.current) {
        setTempHighlight(false);
      }
    }, 400);
  };

  // Handle Crisis Final Outcome Tap
  const handleCrisisOutcomeChoice = (outcome: 'resisted' | 'relapsed') => {
    triggerHaptic(outcome === 'resisted' ? 'medium' : 'light');
    
    // Calculate total duration user held
    const durationHeld = urgeSurfDurationSeconds - timeLeft;
    if (onUrgeSurfComplete) {
      onUrgeSurfComplete(outcome, durationHeld);
    }

    setCrisisOutcome(outcome);
    setTimerStatus('idle');
  };

  // Handle Early Close (X button) in Minuteur
  const handleEarlyExit = () => {
    triggerHaptic('light');
    const durationHeld = urgeSurfDurationSeconds - timeLeft;
    
    if (onUrgeSurfComplete) {
      onUrgeSurfComplete('relapsed', durationHeld);
    }

    setTimerStatus('idle');
    setCrisisOutcome('relapsed');
  };

  const resetSimulation = () => {
    clearTimers();
    triggerHaptic('light');
    setSimulationStep(0);
    setUserChoice(null);
  };

  // Anchor phrase selection
  let anchorPhrase = "Le circuit non nourri s'affaiblit. Celui qu'on pratique devient le réflexe.";
  if (activeMode === 'personal' && userStats) {
    if (observeRatio >= 0.6) {
      anchorPhrase = "Ton chemin conscient est déjà plus fort que ton circuit automatique. Continue ! 🔥";
    } else if (observeRatio >= 0.3) {
      anchorPhrase = "Les deux chemins sont encore proches. Chaque observation fait pencher la balance. ⚖️";
    } else {
      anchorPhrase = "Le circuit automatique est encore dominant, et c'est normal au début. Il s'affaiblit à chaque fois que tu ne le nourris pas. ⏳";
    }
  }

  // Top trigger resolver
  const triggerText = activeMode === 'personal' && topTrigger 
    ? (topTrigger.length > 14 ? topTrigger.substring(0, 13) + '…' : topTrigger)
    : "stress, ennui...";

  // Sparkline points calculation
  const getSparklineData = () => {
    if (!trendData || trendData.length < 3) return null;
    const items = trendData.slice(-trendDays);
    const N = items.length;
    if (N < 3) return null;

    const xStep = 300 / (N - 1);
    const points = items.map((p, i) => {
      const x = 10 + i * xStep;
      const y = 45 - (p.observeRatio * 40); // 0 ratio maps to y=45, 1 maps to y=5
      return { x, y };
    });

    const linePath = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
    const fillPath = `M ${points[0].x} 48 L ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ') + ` L ${points[N-1].x} 48 Z`;
    const lastPoint = points[N - 1];

    return { linePath, fillPath, lastPoint };
  };

  const sparkline = getSparklineData();

  // RTL dynamic geometry coordinates mapper
  const rx = (x: number, w: number = 0) => isRTL ? 320 - x - w : x;

  // Breathing dynamic scale calculation
  let breathingCircleScale = 0.7;
  if (breathingPhase === 'inhale') {
    breathingCircleScale = 0.7 + (4 - breathingSeconds) * 0.075; // scale from 0.7 to 1.0
  } else if (breathingPhase === 'hold1') {
    breathingCircleScale = 1.0;
  } else if (breathingPhase === 'exhale') {
    breathingCircleScale = 1.0 - (4 - breathingSeconds) * 0.075; // scale from 1.0 to 0.7
  } else {
    breathingCircleScale = 0.7;
  }

  // Time remaining circular progress
  const timerRadius = 64;
  const timerCircumference = 2 * Math.PI * timerRadius;
  const timerStrokeDashoffset = timerCircumference - (timeLeft / urgeSurfDurationSeconds) * timerCircumference;

  // Crisis rotating helper tips
  const rotatingMessages = [
    "L'envie monte, culmine, puis redescend. Tu n'as rien à faire d'autre que respirer.",
    "Tu observes, tu ne combats pas.",
    "Chaque seconde ici muscle ton chemin conscient."
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`w-full max-w-md mx-auto relative ${
        embedded ? '' : 'bg-[#16213E] p-5 rounded-[24px] shadow-xl border border-white/5 mt-4'
      }`}
      aria-label="Schéma illustrant le circuit automatique et le chemin conscient du cerveau"
    >
      {/* CSS Animations injector */}
      <style>{`
        @keyframes declencheurPulse {
          0% { stroke: #5A5A5A; fill: #1A1A2E; }
          50% { stroke: #FFD700; fill: #2D2510; }
          100% { stroke: #5A5A5A; fill: #1A1A2E; }
        }
        @keyframes wavePulse {
          0% { transform: scale(0.6); opacity: 0.2; }
          50% { transform: scale(1.3); opacity: 0.7; }
          100% { transform: scale(0.6); opacity: 0.2; }
        }
        @keyframes bounceSlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes haloPulse {
          0%, 100% { box-shadow: 0 0 0 0px rgba(255, 215, 0, 0.4); }
          50% { box-shadow: 0 0 0 12px rgba(255, 215, 0, 0); }
        }
        .animate-declencheur {
          animation: declencheurPulse 1.5s infinite ease-in-out;
        }
        .animate-wave-glow {
          animation: wavePulse 2.5s infinite ease-in-out;
          transform-origin: center;
        }
        .animate-bounce-slow {
          animation: bounceSlow 3s infinite ease-in-out;
        }
        .animate-halo {
          animation: haloPulse 2s infinite ease-in-out;
        }
      `}</style>

      {/* HEADER COMPONENT */}
      <div className="flex flex-col mb-4">
        {context === 'crisis' ? (
          <div>
            <h3 className={`text-[#FFD700] text-sm font-sans font-bold uppercase flex items-center gap-1.5 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
              <Brain className="w-4.5 h-4.5" />
              TU PEUX OBSERVER CECI SANS AGIR
            </h3>
            <p className="text-[#8E8E93] text-[11px] mt-1 font-sans leading-relaxed">
              L'envie est réelle. Elle ne dure jamais aussi longtemps que tu le crois.
            </p>
          </div>
        ) : (
          <div>
            <h3 className={`text-[#FFD700] text-xs font-sans font-bold tracking-[1.5px] uppercase flex items-center gap-1.5 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
              <Brain className="w-4.5 h-4.5" />
              Ton Cerveau en cet Instant
            </h3>

            {/* Toggle segmenté */}
            <div className={`mt-3 bg-[#1A1A2E] rounded-[10px] p-[3px] flex items-center relative ${isRTL ? 'flex-row-reverse' : 'flex-row'}`} role="tablist" aria-label="Mode démonstration ou mode données personnelles">
              <button
                onClick={() => handleToggleMode('demo')}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold text-center transition-all ${
                  activeMode === 'demo'
                    ? 'bg-[#FFD700] text-[#0F0F1A]'
                    : 'bg-transparent text-[#8E8E93] hover:text-white'
                }`}
                role="tab"
                aria-selected={activeMode === 'demo'}
              >
                DÉMO
              </button>
              <button
                onClick={() => handleToggleMode('personal')}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold text-center transition-all flex items-center justify-center gap-1 relative ${isRTL ? 'flex-row-reverse' : 'flex-row'} ${
                  activeMode === 'personal'
                    ? 'bg-[#FFD700] text-[#0F0F1A]'
                    : userStats
                    ? 'bg-transparent text-[#8E8E93] hover:text-white'
                    : 'bg-transparent text-[#8E8E93]/40 cursor-not-allowed'
                }`}
                role="tab"
                aria-selected={activeMode === 'personal'}
              >
                MES DONNÉES
                {activeMode !== 'personal' && !userStats && (
                  <span className="text-[9px]">🔒</span>
                )}
              </button>

              {/* Inline Tooltip for Locked mode */}
              <AnimatePresence>
                {showTooltip && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#FF2D55] text-white text-[10px] font-medium px-3 py-1.5 rounded-lg shadow-lg z-30 text-center w-[240px]"
                  >
                    Complète 5 jours de suivi Pattern Killer pour débloquer ton circuit personnel
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* SVG DIAGRAM ZONE or COMPREHENSIVE URGE TIMER */}
      <div className="relative bg-[#0F0F1A] rounded-2xl p-2 border border-white/5 overflow-hidden">
        
        <AnimatePresence mode="wait">
          {timerStatus === 'running' ? (
            // MINUTEUR D'URGE SURFING LAYOUT
            <motion.div
              key="crisis-timer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative w-full min-h-[220px] flex flex-col items-center justify-center p-3"
            >
              {/* Escape small X button */}
              <button
                onClick={handleEarlyExit}
                className="absolute top-2 right-2 text-[#8E8E93] hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-full transition-all"
                aria-label="Fermer le minuteur"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Breathing Circle Container */}
              <div className="relative w-[140px] h-[140px] flex items-center justify-center">
                {/* Circular timer track */}
                <svg className="absolute w-[140px] h-[140px] -rotate-90">
                  <circle cx="70" cy="70" r="64" stroke="rgba(255,255,255,0.04)" strokeWidth="4" fill="none" />
                  <circle
                    cx="70"
                    cy="70"
                    r="64"
                    stroke="#FFD700"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={timerCircumference}
                    strokeDashoffset={timerStrokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>

                {/* Inner Breathing Box */}
                <div
                  className="rounded-full bg-[#00D9A5]/15 border-2 border-[#00D9A5]/80 flex items-center justify-center"
                  style={{
                    width: '106px',
                    height: '106px',
                    transform: `scale(${breathingCircleScale})`,
                    transition: 'transform 1000ms ease-in-out',
                  }}
                >
                  <span className="text-white text-[13px] font-sans font-bold tracking-wider uppercase">
                    {breathingPhase === 'inhale' && "Inspire"}
                    {breathingPhase === 'hold1' && "Retiens"}
                    {breathingPhase === 'exhale' && "Expire"}
                    {breathingPhase === 'hold2' && "Retiens"}
                  </span>
                </div>
              </div>

              {/* Seconds remaining display */}
              <div className="text-center mt-3">
                <span className="font-mono font-bold text-2xl text-[#FFD700]">
                  {timeLeft}
                </span>
                <span className="text-[10px] text-[#8E8E93] font-semibold uppercase tracking-wider ml-1">
                  sec
                </span>
              </div>

              {/* Rotating tip messages */}
              <div className="mt-3 text-center min-h-[38px] px-4 flex items-center justify-center">
                <p className="text-[#8E8E93] text-[11px] leading-relaxed font-sans transition-all duration-500">
                  {rotatingMessages[rotatingMessageIndex]}
                </p>
              </div>

              {/* Speak to Coach chat trigger */}
              {onRequestCoachChat && (
                <button
                  onClick={() => {
                    triggerHaptic('light');
                    onRequestCoachChat();
                  }}
                  className="mt-2.5 text-[10.5px] text-[#8E8E93] hover:text-[#00D9A5] transition-colors underline decoration-dotted"
                >
                  Parler au Coach maintenant
                </button>
              )}

            </motion.div>
          ) : (
            // STANDARD CIRCUIT DIAGRAM
            <motion.div
              key="circuit-diagram"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <svg viewBox="0 0 320 220" className="w-full h-[220px]">
                {/* Subtle Grid Pattern in background */}
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" rx="16" />

                {/* PATH A - CIRCUIT AUTOMATIQUE (Top Curve) */}
                <path
                  d={`M ${rx(78)} 95 C ${rx(130)} 50, ${rx(180)} 40, ${rx(230)} 45`}
                  stroke="#FF2D55"
                  strokeWidth={autoWidth + (userChoice === 'automatic' && tempHighlight ? 1 : 0)}
                  strokeLinecap="round"
                  fill="none"
                  style={{ transition: 'stroke-width 400ms ease-out, stroke 400ms ease-out, opacity 400ms ease-out' }}
                  opacity={
                    simulationStep === 4
                      ? userChoice === 'automatic'
                        ? 1
                        : 0.1
                      : simulationStep === 2 || simulationStep === 3
                      ? 0.3
                      : 0.85
                  }
                />

                {/* PATH B1 - VERS OBSERVATEUR (Bottom Curve, Part 1) */}
                <path
                  d={`M ${rx(55)} 110 C ${rx(80)} 135, ${rx(110)} 145, ${rx(140)} 140`}
                  stroke="#00D9A5"
                  strokeWidth={consciousWidth + (userChoice === 'observe' && tempHighlight ? 1 : 0)}
                  strokeLinecap="round"
                  fill="none"
                  style={{ transition: 'stroke-width 400ms ease-out, stroke 400ms ease-out, opacity 400ms ease-out' }}
                  opacity={
                    simulationStep === 4
                      ? userChoice === 'observe'
                        ? 1
                        : 0.1
                      : simulationStep === 2 || simulationStep === 3
                      ? 0.3
                      : 0.85
                  }
                />

                {/* PATH B2 - VERS TU RESTES MAÎTRE (Bottom Curve, Part 2) */}
                <path
                  d={`M ${rx(205)} 140 C ${rx(215)} 150, ${rx(220)} 165, ${rx(230)} 175`}
                  stroke="#00D9A5"
                  strokeWidth={consciousWidth + (userChoice === 'observe' && tempHighlight ? 1 : 0)}
                  strokeLinecap="round"
                  fill="none"
                  style={{ transition: 'stroke-width 400ms ease-out, stroke 400ms ease-out, opacity 400ms ease-out' }}
                  opacity={
                    simulationStep === 4
                      ? userChoice === 'observe'
                        ? 1
                        : 0.1
                      : simulationStep === 2 || simulationStep === 3
                      ? 0.3
                      : 0.85
                  }
                />

                {/* NŒUD "DÉCLENCHEUR" (Left) */}
                <g className="transition-all duration-300">
                  <rect
                    x={rx(10, 70)}
                    y="80"
                    width="70"
                    height="50"
                    rx="10"
                    className={simulationStep === 1 ? 'animate-declencheur' : ''}
                    fill="#1A1A2E"
                    stroke={simulationStep === 1 ? '#FFD700' : '#5A5A5A'}
                    strokeWidth={simulationStep === 1 ? 2 : 1}
                  />
                  <text x={rx(45)} y="103" fill="#FFFFFF" fontSize="9" fontWeight="600" textAnchor="middle" fontFamily="Inter, sans-serif">Déclencheur</text>
                  <text x={rx(45)} y="115" fill="#8E8E93" fontSize="7" fontWeight="400" textAnchor="middle" fontFamily="Inter, sans-serif">
                    {triggerText}
                  </text>
                </g>

                {/* NŒUD "OBSERVATEUR" (Center-Bottom) */}
                <g className="transition-all duration-300" opacity={simulationStep === 4 && userChoice === 'automatic' ? 0.2 : 1}>
                  <rect
                    x={rx(140, 65)}
                    y="125"
                    width="65"
                    height="42"
                    rx="10"
                    fill="#1A1A2E"
                    stroke="#00D9A5"
                    strokeWidth={userChoice === 'observe' ? 2 : 1.5}
                    className={userChoice === 'observe' ? 'animate-pulse' : ''}
                  />
                  <text x={rx(172.5)} y="144" fill="#00D9A5" fontSize="8" fontWeight="600" textAnchor="middle" fontFamily="Inter, sans-serif">Observateur</text>
                  <text x={rx(172.5)} y="154" fill="#8E8E93" fontSize="6" fontWeight="400" textAnchor="middle" fontFamily="Inter, sans-serif">zone consciente</text>
                </g>

                {/* NŒUD "RECHUTE" (Top Right) */}
                <g className="transition-all duration-300" opacity={simulationStep === 4 && userChoice === 'observe' ? 0.2 : 1}>
                  <rect
                    x={rx(230, 80)}
                    y="20"
                    width="80"
                    height="45"
                    rx="10"
                    fill="rgba(255, 45, 85, 0.12)"
                    stroke="#FF2D55"
                    strokeWidth={userChoice === 'automatic' ? 2 : 1}
                  />
                  <text x={rx(270)} y="40" fill="#FF2D55" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="Inter, sans-serif">Rechute</text>
                  <text x={rx(270)} y="51" fill="#8E8E93" fontSize="7" fontWeight="400" textAnchor="middle" fontFamily="Inter, sans-serif">action automatique</text>
                </g>

                {/* NŒUD "TU RESTES MAÎTRE" (Bottom Right) */}
                <g className="transition-all duration-300" opacity={simulationStep === 4 && userChoice === 'automatic' ? 0.2 : 1}>
                  <rect
                    x={rx(230, 80)}
                    y="155"
                    width="80"
                    height="45"
                    rx="10"
                    fill="rgba(0, 217, 165, 0.12)"
                    stroke="#00D9A5"
                    strokeWidth={userChoice === 'observe' ? 2 : 1}
                  />
                  <text x={rx(270)} y="174" fill="#00D9A5" fontSize="8" fontWeight="700" textAnchor="middle" fontFamily="Inter, sans-serif">Tu restes maître</text>
                  <text x={rx(270)} y="185" fill="#8E8E93" fontSize="7" fontWeight="400" textAnchor="middle" fontFamily="Inter, sans-serif">réponse choisie</text>
                </g>
              </svg>

              {/* SIMULATION STEP OVERLAYS */}
              <AnimatePresence>
                {/* STEP 2: Urge Wave Overlay */}
                {simulationStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-[#0F0F1A]/85 z-10 p-4"
                  >
                    <div className="relative w-36 h-36 flex items-center justify-center">
                      <div className="absolute w-24 h-24 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 animate-wave-glow" />
                      <div className="absolute w-16 h-16 rounded-full bg-[#FFD700]/15 border border-[#FFD700]/40 animate-pulse" />
                      <Brain className="w-8 h-8 text-[#FFD700] z-20 animate-bounce-slow" />
                    </div>
                    <div className="text-center mt-3 max-w-[200px]">
                      <p className="text-white text-xs font-semibold leading-relaxed">L'envie monte...</p>
                      <p className="text-[#FFD700] text-[10px] mt-0.5 font-medium tracking-wide uppercase">observe-la sans agir</p>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: Choice Buttons Overlay */}
                {simulationStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-[#0F0F1A]/90 z-15 p-4"
                  >
                    <h4 className="text-white text-xs font-bold mb-3 tracking-wide text-center">QUE CHOISIS-TU DE FAIRE ?</h4>
                    <div className={`flex flex-col gap-2 w-full max-w-[220px] ${isRTL ? 'flex-col-reverse' : 'flex-col'}`}>
                      <button
                        onClick={() => handleChoice('observe')}
                        className="bg-rgba(0,217,165,0.15) border border-[#00D9A5] text-[#00D9A5] py-2.5 px-3 rounded-xl text-xs font-bold hover:bg-[#00D9A5] hover:text-[#0F0F1A] transition-all flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Observer sans agir
                      </button>
                      <button
                        onClick={() => handleChoice('automatic')}
                        className="bg-rgba(255,45,85,0.15) border border-[#FF2D55] text-[#FF2D55] py-2.5 px-3 rounded-xl text-xs font-bold hover:bg-[#FF2D55] hover:text-[#0F0F1A] transition-all flex items-center justify-center gap-1.5"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Suivre l'automatique
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* DIAGRAM LEGEND */}
      {timerStatus !== 'running' && (
        <div className={`flex items-center justify-center gap-4 mt-2.5 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#FF2D55]" />
            <span className="text-[9px] text-[#8E8E93] font-medium">Circuit automatique</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#00D9A5]" />
            <span className="text-[9px] text-[#8E8E93] font-medium">Chemin conscient</span>
          </div>
        </div>
      )}

      {/* SPARKLINE TENDANCE 7/30 DAYS */}
      {timerStatus !== 'running' && sparkline && activeMode === 'personal' && (
        <div className="mt-4 p-3 bg-[#1A1A2E]/50 rounded-xl border border-white/5">
          {/* Header & Toggle Days */}
          <div className={`flex items-center justify-between mb-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <span className="text-[9px] text-[#8E8E93] font-bold uppercase tracking-wider">Évolution du Cerveau</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setTrendDays(7)}
                className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all ${
                  trendDays === 7 
                    ? 'bg-[#FFD700] text-[#0F0F1A]' 
                    : 'bg-[#1A1A2E] text-[#8E8E93] hover:text-white'
                }`}
              >
                7J
              </button>
              <button
                onClick={() => setTrendDays(30)}
                className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all ${
                  trendDays === 30 
                    ? 'bg-[#FFD700] text-[#0F0F1A]' 
                    : 'bg-[#1A1A2E] text-[#8E8E93] hover:text-white'
                }`}
              >
                30J
              </button>
            </div>
          </div>

          {/* Sparkline Canvas Area */}
          <div className="relative">
            <svg viewBox="0 0 320 50" className="w-full h-[50px]">
              <path d={sparkline.fillPath} fill="rgba(0, 217, 165, 0.08)" />
              <path d={sparkline.linePath} fill="none" stroke="#00D9A5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx={sparkline.lastPoint.x} cy={sparkline.lastPoint.y} r="3.5" fill="#00D9A5" stroke="#0F0F1A" strokeWidth="1" />
            </svg>
          </div>

          <p className="text-[9.5px] text-[#8E8E93] text-center mt-1">
            Ton chemin conscient sur les {trendDays} derniers jours
          </p>
        </div>
      )}

      {/* ANCHOR PHRASE OR CRISIS INSTRUCTIONS */}
      {timerStatus !== 'running' && !crisisOutcome && (
        <div className="mt-3.5 text-center min-h-[36px] flex items-center justify-center px-2">
          <p className="text-white/90 text-[10.5px] italic leading-normal font-medium tracking-wide">
            "{anchorPhrase}"
          </p>
        </div>
      )}

      {/* LOWER INTERACTION INTERFACES */}
      {/* Simulation standard Launcher */}
      {timerStatus === 'running' ? null : context === 'crisis' ? (
        // Mode Crisis CTA
        !crisisOutcome && (
          <button
            onClick={startCrisisUrgeSurf}
            className="mt-4 w-full bg-[#FFD700] hover:bg-[#FFE043] text-[#0F0F1A] py-3 px-4 rounded-xl text-xs font-extrabold tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-lg active:scale-[0.98] animate-halo"
          >
            <Brain className="w-4 h-4" />
            C'EST LE MOMENT
          </button>
        )
      ) : (
        // Standard Simulation Launcher
        simulationStep === 0 && (
          <button
            onClick={startSimulation}
            className="mt-4 w-full bg-[#FFD700] hover:bg-[#FFE043] text-[#0F0F1A] py-2.5 px-4 rounded-xl text-xs font-extrabold tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-lg active:scale-[0.98]"
          >
            <Brain className="w-4 h-4" />
            🧠 ESSAIE MAINTENANT
          </button>
        )
      )}

      {/* CRISIS OUTCOME BUTTONS (at the completion of the countdown) */}
      {timerStatus === 'completed' && (
        <div className="mt-4 bg-[#1A1A2E] p-4 rounded-xl border border-white/5 text-center">
          <h4 className="text-white text-xs font-bold mb-3 tracking-wide uppercase">Minuteur d'Urge Surfing Terminé</h4>
          <p className="text-[#8E8E93] text-[10.5px] mb-4 leading-relaxed">
            Prends un instant pour faire le point. Comment s'est passée cette observation ?
          </p>
          <div className={`flex gap-2.5 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <button
              onClick={() => handleCrisisOutcomeChoice('resisted')}
              className="flex-1 bg-[#00D9A5] hover:bg-[#00F4B9] text-[#0F0F1A] py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all"
            >
              J'ai tenu 💪
            </button>
            <button
              onClick={() => handleCrisisOutcomeChoice('relapsed')}
              className="flex-1 bg-transparent hover:bg-white/5 border border-[#5A5A5A] text-[#8E8E93] hover:text-white py-2.5 px-3 rounded-xl text-xs font-bold transition-all"
            >
              J'ai craqué
            </button>
          </div>
        </div>
      )}

      {/* CRISIS RESULT CARD */}
      {context === 'crisis' && crisisOutcome && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 bg-[#1A1A2E] p-4 rounded-xl border border-white/5 text-center"
        >
          {crisisOutcome === 'resisted' ? (
            <div>
              <p className="text-[#00D9A5] text-[12px] font-bold mb-1.5 flex items-center justify-center gap-1 uppercase tracking-wide">
                <CheckCircle2 className="w-4 h-4" />
                Victoire Consciente !
              </p>
              <p className="text-[#8E8E93] text-[10px] leading-relaxed">
                BRAVO ! Ton cortex préfrontal a repris les commandes. Chaque victoire de ce type réécrit tes chemins neuronaux. 🏆
              </p>
            </div>
          ) : (
            <div>
              <p className="text-[#8E8E93] text-[12px] font-bold mb-1.5 flex items-center justify-center gap-1 uppercase tracking-wide">
                <AlertTriangle className="w-4 h-4" />
                Apprentissage en cours
              </p>
              <p className="text-[#8E8E93] text-[10px] leading-relaxed">
                C'est un apprentissage. Pas de culpabilité, le chemin automatique s'affaiblit déjà car tu as lutté. Demain est un autre jour. 🌱
              </p>
            </div>
          )}

          <button
            onClick={() => setCrisisOutcome(null)}
            className="mt-3 bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 py-1.5 px-4 rounded-lg text-[9.5px] font-bold transition-all mx-auto"
          >
            Fermer
          </button>
        </motion.div>
      )}

      {/* STANDARD SIMULATION STEP 4 RESULT */}
      {context !== 'crisis' && simulationStep === 4 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 bg-[#1A1A2E] p-3 rounded-xl border border-white/5 text-center relative"
        >
          {userChoice === 'observe' ? (
            <div>
              <p className="text-[#00D9A5] text-[11px] font-bold mb-1.5 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                EXCELLENT CHOIX !
              </p>
              <p className="text-[#8E8E93] text-[9.5px] leading-relaxed">
                Exactement ça. Tu viens de muscler ton chemin conscient. Recommence, c'est tout l'entraînement. ⭐
              </p>
            </div>
          ) : (
            <div>
              <p className="text-[#FF2D55] text-[11px] font-bold mb-1.5 flex items-center justify-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                CHEMIN AUTOMATIQUE SUIVI
              </p>
              <p className="text-[#8E8E93] text-[9.5px] leading-relaxed">
                C'est normal, c'est le chemin le plus fort aujourd'hui. Chaque observation, même après coup, compte pour demain. 🌱
              </p>
            </div>
          )}

          <button
            onClick={resetSimulation}
            className="mt-2.5 mx-auto bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 py-1.5 px-3 rounded-lg text-[9.5px] font-bold transition-all flex items-center justify-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            Recommencer
          </button>

          {/* FIRST SIMULATION COMPLETION CELEBRATION REWARD OVERLAY */}
          <AnimatePresence>
            {showRewardOverlay && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                onClick={() => setShowRewardOverlay(false)}
                className="absolute inset-0 bg-[#0F0F1A]/95 z-40 flex flex-col items-center justify-center p-4 text-center cursor-pointer rounded-xl"
              >
                <div className="relative mb-2.5 flex items-center justify-center">
                  <div className="absolute w-12 h-12 rounded-full bg-[#FFD700]/15 animate-ping" />
                  <Award className="w-9 h-9 text-[#FFD700] relative z-10" />
                </div>
                <h4 className="text-[#FFD700] text-xs font-sans font-bold uppercase tracking-wider mb-0.5">
                  Badge débloqué : Observateur Éveillé 🧠
                </h4>
                <p className="text-white text-[10px] mb-2 font-medium">
                  Félicitations pour ta première simulation de surf d'urge !
                </p>
                <div className="bg-[#00D9A5]/10 border border-[#00D9A5]/20 rounded-lg px-3 py-1 inline-block">
                  <p className="text-[#00D9A5] text-sm font-mono font-bold tracking-tight">
                    +15 PTS
                  </p>
                </div>
                <p className="text-[#8E8E93] text-[8px] mt-3 uppercase tracking-widest animate-pulse">
                  Tape pour continuer
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

    </motion.div>
  );
};
