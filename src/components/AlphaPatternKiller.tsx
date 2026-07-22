import React, { useState, useEffect, useRef } from 'react';
import {
  Brain,
  Zap,
  Moon,
  Sun,
  Flame,
  Shield,
  Bell,
  Check,
  AlertTriangle,
  Clock,
  User,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Phone,
  Compass,
  CheckCircle,
  TrendingDown,
  TrendingUp,
  MapPin,
  Calendar,
  XCircle,
  Play,
  Pause
} from 'lucide-react';
import { AlphaCard } from './AlphaCard';
import { AlphaButton } from './AlphaButton';
import { AlphaBadge } from './AlphaBadge';
import { AlphaProgress } from './AlphaProgress';
import { AlphaSlider } from './AlphaSlider';
import { CircuitObserverDiagram } from './CircuitObserverDiagram';

interface AlphaPatternKillerProps {
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
  userId?: string;
}

export const AlphaPatternKiller: React.FC<AlphaPatternKillerProps> = ({ addToast, userId = 'ALPHA_SOLDIER_1' }) => {
  const userLanguage = localStorage.getItem('alpha-language') || localStorage.getItem('alpha-user-language') || 'fr';
  // AI Settings State for urge surf
  const [settingsUrgeSurfSeconds, setSettingsUrgeSurfSeconds] = useState<number>(90);
  const [hasCompletedCircuitSimulation, setHasCompletedCircuitSimulation] = useState<boolean>(false);
  const [fullSettings, setFullSettings] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`/api/ai-engine/${userId}/settings`);
        if (res.ok) {
          const data = await res.json();
          if (data?.settings) {
            setFullSettings(data.settings);
            if (data.settings.urgeSurfDurationSeconds !== undefined) {
              setSettingsUrgeSurfSeconds(Number(data.settings.urgeSurfDurationSeconds));
            } else if (data.settings.urgeSurfDuration !== undefined) {
              setSettingsUrgeSurfSeconds(Number(data.settings.urgeSurfDuration));
            }
            if (data.settings.hasCompletedCircuitSimulation !== undefined) {
              setHasCompletedCircuitSimulation(!!data.settings.hasCompletedCircuitSimulation);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch settings in AlphaPatternKiller:', err);
      }
    };
    fetchSettings();
  }, [userId]);

  const handleSimulationComplete = async (choice: 'automatic' | 'observe', wasFirstTime: boolean) => {
    if (wasFirstTime) {
      try {
        const updatedSettings = fullSettings ? { ...fullSettings, hasCompletedCircuitSimulation: true } : {
          coachTone: 'spartan',
          notificationFrequency: 'smart',
          sensitivity: 'moderate',
          urgeSurfDurationSeconds: settingsUrgeSurfSeconds,
          hasCompletedCircuitSimulation: true,
          permissions: {
            contractile: true,
            sleep: true,
            stress: true,
            screenTime: true,
            urges: true,
            coldExposure: true
          }
        };
        setHasCompletedCircuitSimulation(true);
        setFullSettings(updatedSettings);
        const res = await fetch(`/api/ai-engine/${userId}/settings`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ settings: updatedSettings })
        });
        if (res.ok) {
          addToast('success', "Félicitations pour votre première simulation ! Badge 'Observateur Éveillé' débloqué ! 🏆");
        }
      } catch (err) {
        console.error('Failed to update settings in AlphaPatternKiller:', err);
      }
    }
  };

  // 1. FACTOR STATES
  const [timeOfDay, setTimeOfDay] = useState<number>(21); // 0-23
  const [dayOfWeek, setDayOfWeek] = useState<number>(6); // 1-7 (1=Mon, 7=Sun)
  const [sleepQuality, setSleepQuality] = useState<number>(5); // 1-10
  const [stressLevel, setStressLevel] = useState<number>(8); // 1-10
  const [mood, setMood] = useState<number>(4); // 1-10 (lower = worse)
  const [streakDays, setStreakDays] = useState<number>(7); // critical days
  const [socialMedia, setSocialMedia] = useState<number>(90); // minutes
  const [locationRisk, setLocationRisk] = useState<number>(0.8); // 0-1

  // 2. INTERNAL STATES
  const [riskScore, setRiskScore] = useState<number>(87);
  const [riskCategory, setRiskCategory] = useState<'GREEN' | 'ORANGE' | 'RED'>('RED');
  const [vitalityPoints, setVitalityPoints] = useState<number>(1420);
  const [activeSubTab, setActiveSubTab] = useState<'detector' | 'protocol' | 'analytics' | 'coach' | 'circuit'>('detector');

  // ML local weights tracker (simulating live feedback loop model adaptation)
  const [weights, setWeights] = useState<Record<string, number>>({
    timeOfDay: 0.25,
    dayOfWeek: 0.15,
    sleepQuality: 0.15,
    stressLevel: 0.20,
    mood: 0.10,
    streak: 0.05,
    socialMedia: 0.05,
    location: 0.05,
  });

  // Emergency Protocol Timer State
  const [activeStep, setActiveStep] = useState<number | null>(null); // null = off, 1-5 = active step
  const [stepSeconds, setStepSeconds] = useState<number>(60);
  const [isTimerPlaying, setIsTimerPlaying] = useState<boolean>(false);
  const [checklist, setChecklist] = useState<boolean[]>([false, false, false, false, false]);

  // Chat/Coach State
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; sender: 'user' | 'coach'; text: string; loading?: boolean }>>([
    { id: 'initial-1', sender: 'coach', text: "Soldat. Ton esprit vacille mais ta volonté est souveraine. L'envie est une illusion passagère qui culmine à 10 minutes maximum. Je suis là pour t'ancrer. Que ressens-tu ?" }
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  // Takeover / Crisis Mode State
  const [crisisTakeover, setCrisisTakeover] = useState<boolean>(false);
  const [crisisTimer, setCrisisTimer] = useState<number>(600); // 10 minutes countdown
  const [isCrisisTimerActive, setIsCrisisTimerActive] = useState<boolean>(false);
  const [showCrisisDiagram, setShowCrisisDiagram] = useState<boolean>(false);

  // Confetti particles state
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; y: number; color: string; size: number; delay: number }>>([]);

  const timerRef = useRef<any>(null);
  const crisisTimerRef = useRef<any>(null);

  // 3. ALGORITHMIC SCORING ENGINE
  useEffect(() => {
    // Normalization of risk variables corresponding to the Python FastAPI and TF Lite algorithms
    const timeNorm = (timeOfDay >= 20 || timeOfDay <= 4) ? 0.95 : (timeOfDay >= 12 && timeOfDay <= 14) ? 0.5 : 0.2;
    const dayNorm = (dayOfWeek === 6 || dayOfWeek === 7) ? 0.90 : 0.35;
    const sleepNorm = (10 - sleepQuality) / 10;
    const stressNorm = stressLevel / 10;
    const moodNorm = (10 - mood) / 10;
    
    let streakNorm = 0.3;
    if ([7, 14, 30].includes(streakDays)) {
      streakNorm = 0.95; // Hormonal spikes / withdrawal milestones
    } else if (streakDays < 3) {
      streakNorm = 0.80; // High post-relapse vulnerability
    } else {
      streakNorm = Math.max(0.1, 0.6 - (streakDays * 0.01));
    }

    const socialNorm = Math.min(1.0, socialMedia / 120);
    const locNorm = locationRisk;

    // Linear weighted sum
    const sum = (
      timeNorm * weights.timeOfDay +
      dayNorm * weights.dayOfWeek +
      sleepNorm * weights.sleepQuality +
      stressNorm * weights.stressLevel +
      moodNorm * weights.mood +
      streakNorm * weights.streak +
      socialNorm * weights.socialMedia +
      locNorm * weights.location
    );

    // Sigmoid mapping
    const x = (sum - 0.5) * 6;
    const scoreVal = Math.round((1 / (1 + Math.exp(-x))) * 100);
    setRiskScore(scoreVal);

    if (scoreVal <= 30) {
      setRiskCategory('GREEN');
    } else if (scoreVal <= 60) {
      setRiskCategory('ORANGE');
    } else {
      setRiskCategory('RED');
    }
  }, [timeOfDay, dayOfWeek, sleepQuality, stressLevel, mood, streakDays, socialMedia, locationRisk, weights]);

  // Audio Alerts Simulation
  const playSoundSimulation = (type: 'emergency' | 'victory') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (type === 'emergency') {
        // High alert minor interval dual alarm tone
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc1.type = 'sawtooth';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
        osc2.frequency.setValueAtTime(466.16, audioCtx.currentTime); // Bb4 (dissonant semitone)
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc1.start();
        osc2.start();
        osc1.stop(audioCtx.currentTime + 0.8);
        osc2.stop(audioCtx.currentTime + 0.8);
        // Explicitly close AudioContext to prevent browser leak of suspended threads
        setTimeout(() => {
          try { audioCtx.close(); } catch (err) {}
        }, 1000);
      } else if (type === 'victory') {
        // Golden major chord triumphant sweep
        const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5 major chord
        notes.forEach((freq, idx) => {
          const osc = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.1);
          gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime + idx * 0.1);
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + idx * 0.1 + 0.6);
          osc.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          osc.start(audioCtx.currentTime + idx * 0.1);
          osc.stop(audioCtx.currentTime + idx * 0.1 + 0.6);
        });
        // Explicitly close AudioContext to prevent browser leak of suspended threads
        setTimeout(() => {
          try { audioCtx.close(); } catch (err) {}
        }, 1200);
      }
    } catch (e) {
      // Browser audio context disabled or unsupported
    }
  };

  // Trigger shake and sound alerts on RED risk
  useEffect(() => {
    if (riskCategory === 'RED') {
      playSoundSimulation('emergency');
    }
  }, [riskCategory]);

  // 4. ML MODEL REINFORCEMENT FEEDBACK LOOP
  const handleMLFeedback = (resisted: boolean) => {
    const learningRate = 0.05;
    const timeNorm = (timeOfDay >= 20 || timeOfDay <= 4) ? 0.9 : 0.3;
    const dayNorm = (dayOfWeek === 6 || dayOfWeek === 7) ? 0.8 : 0.3;
    const sleepNorm = (10 - sleepQuality) / 10;
    const stressNorm = stressLevel / 10;
    const moodNorm = (10 - mood) / 10;
    const streakNorm = [7, 14, 30].includes(streakDays) ? 0.9 : 0.4;
    const socialNorm = Math.min(1.0, socialMedia / 120);
    const locNorm = locationRisk;

    const factorsMap = {
      timeOfDay: timeNorm,
      dayOfWeek: dayNorm,
      sleepQuality: sleepNorm,
      stressLevel: stressNorm,
      mood: moodNorm,
      streak: streakNorm,
      socialMedia: socialNorm,
      location: locNorm
    };

    let newWeights = { ...weights };
    let deltaSum = 0;

    Object.keys(weights).forEach((key) => {
      const activeVal = factorsMap[key as keyof typeof factorsMap] || 0.5;
      const currentW = weights[key];
      let delta = 0;

      if (!resisted) {
        // Relapsed -> increase significance of active trigger factors
        delta = learningRate * activeVal * (1.0 - currentW);
      } else {
        // Resisted -> decrease significance of active triggers (weakening pattern!)
        delta = -learningRate * activeVal * currentW;
      }

      newWeights[key] = Math.max(0.01, Math.min(0.95, currentW + delta));
      deltaSum += Math.abs(delta);
    });

    // Re-normalize sum to 1
    const totalW = Object.values(newWeights).reduce((acc: number, v: number) => acc + v, 0) as number;
    let roundedSum = 0;
    let maxKey = Object.keys(newWeights)[0];
    let maxVal = -1;

    Object.keys(newWeights).forEach((key) => {
      const currentVal = (newWeights[key] || 0) as number;
      const roundedVal = Math.round((currentVal / (totalW || 1)) * 1000) / 1000;
      newWeights[key] = roundedVal;
      roundedSum += roundedVal;
      if (roundedVal > maxVal) {
        maxVal = roundedVal;
        maxKey = key;
      }
    });

    // Adjust any small rounding error to guarantee sum is exactly 1.0
    const diff = Math.round((1.0 - roundedSum) * 1000) / 1000;
    if (diff !== 0 && maxKey) {
      newWeights[maxKey] = Math.round((newWeights[maxKey] + diff) * 1000) / 1000;
    }

    setWeights(newWeights);
    return deltaSum;
  };

  // 5. EMERGENCY TIMER LIFE CYCLE
  useEffect(() => {
    if (isTimerPlaying && stepSeconds > 0) {
      timerRef.current = setInterval(() => {
        setStepSeconds((prev) => prev - 1);
      }, 1000);
    } else if (stepSeconds === 0 && isTimerPlaying) {
      clearInterval(timerRef.current);
      // Automatically validate checklist for current step and transition
      if (activeStep !== null) {
        const nextChecklist = [...checklist];
        nextChecklist[activeStep - 1] = true;
        setChecklist(nextChecklist);
        
        if (activeStep < 5) {
          setActiveStep(activeStep + 1);
          setStepSeconds(60);
          addToast('info', `Étape ${activeStep} complétée ! Passage à l'étape suivante.`);
        } else {
          completeEmergencyProtocol();
        }
      }
    }

    return () => clearInterval(timerRef.current);
  }, [isTimerPlaying, stepSeconds, activeStep]);

  // Crisis Count Down Timer
  useEffect(() => {
    if (isCrisisTimerActive && crisisTimer > 0) {
      crisisTimerRef.current = setInterval(() => {
        setCrisisTimer((prev) => prev - 1);
      }, 1000);
    } else if (crisisTimer === 0 && isCrisisTimerActive) {
      clearInterval(crisisTimerRef.current);
      completeEmergencyProtocol();
    }
    return () => clearInterval(crisisTimerRef.current);
  }, [isCrisisTimerActive, crisisTimer]);

  const handleStepClick = (stepIndex: number) => {
    setActiveStep(stepIndex);
    setStepSeconds(60);
    setIsTimerPlaying(true);
  };

  const toggleTimerPlay = () => {
    setIsTimerPlaying(!isTimerPlaying);
  };

  // 6. SUCCESS ACTION: RESISTED!
  const completeEmergencyProtocol = () => {
    setIsTimerPlaying(false);
    setActiveStep(null);
    setCrisisTakeover(false);
    setIsCrisisTimerActive(false);

    // Apply ML feedback (resisted = true)
    const delta = handleMLFeedback(true);
    
    // Add vitality reward
    setVitalityPoints((v) => v + 50);
    addToast('success', "🛡️ COMBAT COMPLÉTÉ : +50 POINTS DE VITALITÉ ! Le pattern a été affaibli.");
    playSoundSimulation('victory');

    // Trigger Confetti explosion
    const colors = ['#FFD700', '#E94560', '#00D9A5', '#3B82F6', '#8B5CF6'];
    const particles = Array.from({ length: 150 }).map((_, idx) => ({
      id: idx,
      x: Math.random() * 100, // percentage
      y: Math.random() * -40, // start above screen
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 10 + 6,
      delay: Math.random() * 3,
    }));
    setConfetti(particles);
    setTimeout(() => setConfetti([]), 6000);
  };

  const abandonEmergencyProtocol = () => {
    setIsTimerPlaying(false);
    setActiveStep(null);
    setCrisisTakeover(false);
    setIsCrisisTimerActive(false);

    // Minor reward for trying
    setVitalityPoints((v) => v + 10);
    addToast('warning', "C'est OK, soldat. Chaque effort est une graine de victoire. +10 pts d'honneur.");
  };

  // 7. GEMINI AI COACH CHAT AGENT
  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    
    const userText = chatInput;
    const userMsg = { id: Date.now().toString(), sender: 'user' as const, text: userText };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    // Add immediate typing indicator bubble
    const botTypingId = 'typing-' + Date.now();
    setChatMessages((prev) => [...prev, { id: botTypingId, sender: 'coach' as const, text: 'En train de canaliser...', loading: true }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: [chatMessages[0], ...chatMessages.slice(1).slice(-12)].map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
          }))
        })
      });

      // Remove typing bubble
      setChatMessages((prev) => prev.filter(m => m.id !== botTypingId));

      if (response.ok) {
        const data = await response.json();
        setChatMessages((prev) => [...prev, { id: Date.now().toString(), sender: 'coach', text: data.reply }]);
      } else {
        throw new Error('Server returned error status');
      }
    } catch (error) {
      // Clean typing bubble
      setChatMessages((prev) => prev.filter(m => m.id !== botTypingId));
      
      // Fallback local response matching the deep warrior aesthetic
      setTimeout(() => {
        const fallbacks = [
          "L'impulsion est une surcharge d'énergie électrique brute. Ne la fuis pas, ne lutte pas de front. Redirige-la immédiatement dans ton corps : fais 20 squats maintenant !",
          "Prends une inspiration profonde par le nez. Retiens l'air pendant 7 secondes. Expire lentement. Ce sentiment d'urgence n'est qu'un signal d'habitude erroné. Tu es libre.",
          "Chaque fois que tu dis NON à l'esclavage pulsionnel, tu rééduques ton cortex préfrontal. Tu es un bâtisseur de liberté.",
          "Rappelle-toi l'homme que tu as juré de devenir. Ses yeux sont calmes, sa force est maîtrisée. Respire."
        ];
        const text = fallbacks[Math.floor(Math.random() * fallbacks.length)];
        setChatMessages((prev) => [...prev, { id: Date.now().toString(), sender: 'coach', text }]);
      }, 1000);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Start Crisis Lockdown Takeover Mode
  const triggerCrisisMode = () => {
    setCrisisTakeover(true);
    setCrisisTimer(600);
    setIsCrisisTimerActive(true);
    playSoundSimulation('emergency');
    addToast('error', "🚨 MODE CRISE ACTIF ! Fermeture complète du dashboard.");
  };

  const protocolSteps = [
    { title: "1. Respiration Cohérence 4-7-8", desc: "Inspirez (4s), retenez (7s), expirez par la bouche (8s). Calme le système nerveux.", icon: <Compass className="w-5 h-5 text-sky-400" /> },
    { title: "2. Surcharge Physique Directe", desc: "Faites immédiatement 20 squats profonds ou 10 pompes explosives pour dériver le sang.", icon: <Zap className="w-5 h-5 text-red-500" /> },
    { title: "3. Choc Thermique Visage", desc: "Aspergez-vous d'eau glacée ou prenez une douche froide pendant 1 min pour briser le pattern mental.", icon: <Moon className="w-5 h-5 text-teal-400" /> },
    { title: "4. Journaling d'Ancrage", desc: "Rédigez : 'Pourquoi je préserve mon streak aujourd'hui et de quoi je me libère.'", icon: <Brain className="w-5 h-5 text-purple-400" /> },
    { title: "5. Visualisation de Libération", desc: "Visualisez l'énergie masculine pure restaurée et l'homme souverain que vous bâtissez.", icon: <Shield className="w-5 h-5 text-amber-400" /> },
  ];

  return (
    <div className="flex flex-col gap-6 relative select-none">
      
      {/* Dynamic Confetti Particle Overlay */}
      {confetti.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {confetti.map((c) => (
            <div
              key={c.id}
              className="absolute rounded-full animate-[fall_5s_linear_infinite]"
              style={{
                left: `${c.x}%`,
                top: `${c.y}px`,
                backgroundColor: c.color,
                width: `${c.size}px`,
                height: `${c.size}px`,
                animationDelay: `${c.delay}s`,
                boxShadow: `0 0 10px ${c.color}`,
              }}
            />
          ))}
        </div>
      )}

      {/* EMERGENCY TAKEOVER COVER (CRISIS MODE FULL-SCREEN) */}
      {crisisTakeover && (
        <div className="fixed inset-0 bg-[#0F0F1A] z-50 flex flex-col justify-center items-center p-6 animate-[fade-in_0.4s_ease-out] border-4 border-[#E94560]/40">
          <div className="absolute inset-0 bg-[radial-gradient(#e94560_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
          
          <div className="max-w-2xl w-full flex flex-col gap-8 text-center relative z-10">
            <div className="animate-bounce flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-[#E94560]/10 border-2 border-[#E94560] flex items-center justify-center text-[#E94560] shadow-[0_0_30px_rgba(233,69,96,0.3)] mb-4">
                <AlertTriangle className="w-10 h-10" />
              </div>
              <span className="font-mono text-xs text-[#E94560] tracking-widest font-extrabold uppercase">ALERTE CRITIQUE - BLOQUÉ</span>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="font-headline font-extrabold text-3xl text-white uppercase tracking-wider">Ton cerveau te ment</h2>
              <p className="text-sm text-[#FFD700] uppercase font-mono tracking-widest">Ce n'est PAS ce que tu veux. Tiens bon, guerrier.</p>
            </div>

            {/* BIG LOCK COUNTDOWN TIMER */}
            <div className="p-8 bg-[#16213E]/50 border border-[#1A1A2E] rounded-3xl flex flex-col items-center">
              <span className="text-[10px] text-[#8E8E93] font-mono tracking-widest uppercase">Temps restant avant extinction de l'impulsion</span>
              <span className="font-mono text-6xl text-white font-extrabold tracking-tight mt-3">
                {Math.floor(crisisTimer / 60)}:{(crisisTimer % 60).toString().padStart(2, '0')}
              </span>
              <p className="text-xs text-[#8E8E93] max-w-sm mt-3 leading-relaxed">
                Le pic d'influx d'une urgence comportementale chute drastiquement après 10 minutes d'inactivité ou de substitution physique.
              </p>
            </div>

            {/* Direct Instant AI Coach Chat Inside Takeover */}
            <div className="bg-[#16213E]/60 border border-[#E94560]/20 rounded-2xl p-4 flex flex-col gap-3 text-left">
              <h4 className="font-headline font-bold text-xs text-white uppercase flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#FFD700]" />
                Dialogue de secours instantané avec l'IA Coach
              </h4>
              <div className="h-32 overflow-y-auto bg-[#0F0F1A] border border-[#1A1A2E] p-3 rounded-xl flex flex-col gap-2 text-xs font-mono">
                {chatMessages.slice(-3).map((m, idx) => (
                  <p key={idx} className={m.sender === 'user' ? 'text-red-400' : 'text-emerald-400'}>
                    <strong className="uppercase">{m.sender === 'user' ? 'Vous: ' : 'Coach: '}</strong>{m.text}
                  </p>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Écris ton combat..."
                  className="flex-1 bg-[#0F0F1A] border border-[#1A1A2E] p-2 rounded-lg text-xs text-white outline-none focus:border-[#FFD700]/40 font-mono"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                />
                <AlphaButton variant="gold" size="sm" onClick={handleSendChatMessage}>
                  Canaliser
                </AlphaButton>
              </div>
            </div>

            {/* Direct high-priority link to Urge Surfing diagram */}
            <div className="flex justify-center my-1">
              <button
                type="button"
                onClick={() => setShowCrisisDiagram(true)}
                className="px-6 py-3.5 bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white font-black text-xs uppercase tracking-wider rounded-2xl flex items-center gap-2.5 shadow-[0_4px_20px_rgba(14,165,233,0.3)] transition-all cursor-pointer scale-105"
              >
                <Compass className="w-4.5 h-4.5 animate-[spin_10s_linear_infinite]" />
                Observer cette envie maintenant (Surfing Respiratoire)
              </button>
            </div>

            {/* Quick emergency action row */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <AlphaButton variant="danger" onClick={completeEmergencyProtocol}>
                ✓ J'AI RÉSISTÉ ET VAINCU
              </AlphaButton>
              <AlphaButton variant="ghost" className="border border-red-500/30 text-[#E94560]" onClick={abandonEmergencyProtocol}>
                Abandonner (Recommencer demain)
              </AlphaButton>
            </div>
          </div>
        </div>
      )}

      {crisisTakeover && showCrisisDiagram && (
        <div className="fixed inset-0 bg-[#0F0F1A] z-50 flex flex-col justify-center items-center p-4 md:p-6 border-4 border-sky-500/40 animate-[fade-in_0.3s_ease-out]">
          <div className="w-full max-w-3xl relative">
            <button
              type="button"
              onClick={() => setShowCrisisDiagram(false)}
              className="absolute top-4 right-4 z-50 px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-white/5 rounded-xl cursor-pointer border border-white/10"
            >
              Retour à la crise
            </button>
            <CircuitObserverDiagram
              mode="personal"
              context="crisis"
              embedded={true}
              addToast={addToast}
              isRTL={userLanguage === 'ar'}
              isFirstSimulationCompletion={!hasCompletedCircuitSimulation}
              onSimulationComplete={handleSimulationComplete}
              urgeSurfDurationSeconds={settingsUrgeSurfSeconds}
              onUrgeSurfComplete={(outcome, durationHeld) => {
                if (outcome === 'resisted') {
                  addToast('success', "Succès critique ! Tu as surfé l'envie avec brio 🌊");
                  completeEmergencyProtocol();
                  setShowCrisisDiagram(false);
                } else {
                  addToast('warning', "Chaque seconde d'observation affaiblit le pattern d'habitude.");
                  setShowCrisisDiagram(false);
                }
              }}
              onRequestCoachChat={() => {
                addToast('info', "Analyse neuronale en cours avec le Coach...");
                setShowCrisisDiagram(false);
              }}
            />
          </div>
        </div>
      )}

      {/* APP TOPPERS BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#16213E]/30 p-4 rounded-2xl border border-[#1A1A2E]">
        <div className="flex items-center gap-3">
          <Brain className="w-5 h-5 text-[#E94560]" />
          <div>
            <h4 className="font-headline font-extrabold text-sm text-white uppercase tracking-wider">NEURO-REWIRE LAB</h4>
            <p className="text-[10px] text-[#8E8E93] mt-0.5">Faites reculer les zones d'impulsion primitives du cerveau.</p>
          </div>
        </div>

        {/* Vitality Tracker */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[9px] font-mono text-[#8E8E93] uppercase">Réserve Vitalité</span>
            <p className="text-sm font-headline font-extrabold text-[#FFD700]">{vitalityPoints} VP</p>
          </div>
          <div className="flex gap-1.5 bg-[#0F0F1A] p-1 rounded-xl border border-[#1A1A2E]">
            {(['detector', 'protocol', 'analytics', 'coach', 'circuit'] as const).map((sub) => (
              <button
                key={sub}
                onClick={() => setActiveSubTab(sub)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-headline font-bold uppercase tracking-wider transition-colors cursor-pointer
                  ${activeSubTab === sub ? 'bg-[#E94560] text-white' : 'text-[#8E8E93] hover:text-white'}
                `}
              >
                {sub === 'detector' ? 'Trigger Detector' : sub === 'protocol' ? 'Urgence 5-Min' : sub === 'analytics' ? 'Analyses' : sub === 'coach' ? 'AI Coach' : 'Circuit CBT'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TAB 1: TRIGGER DETECTOR */}
      {activeSubTab === 'detector' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-[fade-in_0.2s_ease-out]">
          
          {/* Controls Sliders */}
          <div className="lg:col-span-7 flex flex-col gap-5 bg-[#16213E]/20 p-5 rounded-2xl border border-[#1A1A2E]">
            <div className="border-b border-[#1A1A2E] pb-3">
              <h5 className="font-headline font-extrabold text-xs text-white uppercase tracking-wider">Évaluation des Variables de Risque</h5>
              <p className="text-[10px] text-[#8E8E93] mt-0.5">Renseignez votre état en temps réel pour évaluer la charge nerveuse.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-headline font-bold text-[#8E8E93] uppercase">Sommeil (Nuit dernière) : {sleepQuality}/10</span>
                <AlphaSlider value={sleepQuality} min={1} max={10} onChange={setSleepQuality} />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-headline font-bold text-[#8E8E93] uppercase">Stress Actuel : {stressLevel}/10</span>
                <AlphaSlider value={stressLevel} min={1} max={10} onChange={setStressLevel} />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-headline font-bold text-[#8E8E93] uppercase">Humeur : {mood}/10</span>
                <AlphaSlider value={mood} min={1} max={10} onChange={setMood} />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-headline font-bold text-[#8E8E93] uppercase">Réseaux Sociaux : {socialMedia} mins</span>
                <AlphaSlider value={socialMedia} min={0} max={240} step={10} onChange={setSocialMedia} />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-headline font-bold text-[#8E8E93] uppercase">Risque Localisation (Isolement) : {Math.round(locationRisk * 100)}%</span>
                <AlphaSlider value={Math.round(locationRisk * 100)} min={0} max={100} step={5} onChange={(val) => setLocationRisk(val / 100)} />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-headline font-bold text-[#8E8E93] uppercase">Streak Actuel : {streakDays} jours</span>
                <AlphaSlider value={streakDays} min={0} max={90} onChange={setStreakDays} />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-headline font-bold text-[#8E8E93] uppercase">Heure de la Journée : {timeOfDay}h00</span>
                <AlphaSlider value={timeOfDay} min={0} max={23} onChange={setTimeOfDay} />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-headline font-bold text-[#8E8E93] uppercase">Jour de la Semaine : {dayOfWeek === 6 ? 'Samedi' : dayOfWeek === 7 ? 'Dimanche' : 'Semaine'}</span>
                <AlphaSlider value={dayOfWeek} min={1} max={7} onChange={setDayOfWeek} />
              </div>
            </div>
          </div>

          {/* Predict Score Panel */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <AlphaCard
              variant={riskCategory === 'RED' ? 'alert' : riskCategory === 'ORANGE' ? 'default' : 'success'}
              className={`p-6 flex flex-col justify-between h-full relative overflow-hidden transition-all duration-300
                ${riskCategory === 'RED' ? 'animate-[pulse_2s_infinite] border-2 border-[#E94560]' : ''}
              `}
            >
              <div className="flex justify-between items-start border-b border-[#1A1A2E]/50 pb-3 z-10">
                <div>
                  <span className="text-[9px] font-mono text-[#8E8E93] uppercase tracking-wider">NEURO-ALGORITHME PROACTIVE</span>
                  <h5 className="font-headline font-extrabold text-sm text-white mt-0.5">CHARGE DE RISQUE GLOBALE</h5>
                </div>
                <AlphaBadge
                  variant={riskCategory === 'RED' ? 'status' : 'streak'}
                  label={riskCategory === 'RED' ? 'URGENCE' : riskCategory === 'ORANGE' ? 'VIGILANCE' : 'STABLE'}
                  className={riskCategory === 'RED' ? 'bg-red-500/20 text-red-400' : riskCategory === 'ORANGE' ? 'bg-[#FFD700]/10 text-[#FFD700]' : 'bg-[#00D9A5]/10 text-[#00D9A5]'}
                />
              </div>

              {/* Central Large Dial */}
              <div className="flex flex-col items-center justify-center py-6 select-none z-10">
                <div className="relative flex items-center justify-center">
                  {/* Outer circle animation glow */}
                  <div className={`absolute w-36 h-36 rounded-full border border-dashed transition-transform duration-1000 animate-[spin_20s_linear_infinite]
                    ${riskCategory === 'RED' ? 'border-[#E94560]/30' : 'border-gray-500/20'}
                  `} />
                  <div className="text-center z-10">
                    <span className={`font-mono text-5xl font-extrabold tracking-tight transition-all
                      ${riskCategory === 'RED' ? 'text-[#E94560] drop-shadow-[0_0_15px_rgba(233,69,96,0.3)]' : riskCategory === 'ORANGE' ? 'text-[#FFD700]' : 'text-[#00D9A5]'}
                    `}>
                      {riskScore}%
                    </span>
                    <p className="text-[9px] font-mono text-[#8E8E93] uppercase tracking-widest mt-1">Niveau d'urgence</p>
                  </div>
                </div>
              </div>

              {/* Description and CTA */}
              <div className="flex flex-col gap-4 z-10">
                <p className="text-xs text-[#8E8E93] leading-relaxed text-center">
                  {riskCategory === 'RED' 
                    ? "🚨 Risque Élevé ! Les conditions neurologiques (stress, isolement, heure) forment un pattern relapse d'une force critique." 
                    : riskCategory === 'ORANGE' 
                      ? "Le risque est modéré. Restez vigilant, ne laissez pas le désœuvrement s'installer." 
                      : "Félicitations. Vos variables de focus et récupération indiquent un état optimal."
                  }
                </p>

                {riskCategory === 'RED' ? (
                  <div className="flex flex-col gap-2">
                    <AlphaButton variant="danger" className="w-full font-bold text-xs py-3" onClick={triggerCrisisMode}>
                      ⚠️ ACTIVER CRISIS TAKEOVER MODE
                    </AlphaButton>
                    <button
                      type="button"
                      onClick={() => {
                        triggerCrisisMode();
                        setShowCrisisDiagram(true);
                      }}
                      className="w-full bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/30 text-sky-300 font-extrabold text-xs py-3 rounded-2xl cursor-pointer transition-colors"
                    >
                      🌊 OBSERVER CETTE ENVIE MAINTENANT (SURFING)
                    </button>
                    <AlphaButton variant="secondary" className="w-full text-xs" onClick={() => setActiveSubTab('protocol')}>
                      Amorcer Protocole d'Urgence (5 mins)
                    </AlphaButton>
                  </div>
                ) : (
                  <AlphaButton variant="ghost" disabled className="w-full text-[10px] text-gray-500 border border-dashed border-gray-800">
                    SÉCURISÉ - AUCUN PROTOCOLE REQUIS
                  </AlphaButton>
                )}
              </div>
            </AlphaCard>
          </div>
        </div>
      )}

      {/* TAB 2: EMERGENCY PROTOCOL */}
      {activeSubTab === 'protocol' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-[fade-in_0.2s_ease-out]">
          
          {/* Timeline navigation of 5 steps */}
          <div className="lg:col-span-5 flex flex-col gap-3 bg-[#16213E]/10 p-5 rounded-2xl border border-[#1A1A2E]">
            <div className="border-b border-[#1A1A2E] pb-3 mb-2">
              <h5 className="font-headline font-extrabold text-xs text-white uppercase tracking-wider">Protocole de Secours Neuro-Rewire</h5>
              <p className="text-[10px] text-[#8E8E93] mt-0.5">Basculez votre influx nerveux vers des tâches d'ancrage en 5 minutes.</p>
            </div>

            <div className="flex flex-col gap-2">
              {protocolSteps.map((step, idx) => {
                const stepNum = idx + 1;
                const isActive = activeStep === stepNum;
                const isCompleted = checklist[idx];

                return (
                  <div
                    key={idx}
                    onClick={() => handleStepClick(stepNum)}
                    className={`flex items-center gap-4 p-3 rounded-xl border transition-all cursor-pointer select-none
                      ${isActive 
                        ? 'bg-[#E94560]/10 border-[#E94560]' 
                        : isCompleted 
                          ? 'bg-[#00D9A5]/5 border-[#00D9A5]/30 opacity-80' 
                          : 'bg-[#16213E]/30 border-transparent hover:bg-[#16213E]/60'
                      }
                    `}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold
                      ${isActive 
                        ? 'bg-[#E94560] text-white' 
                        : isCompleted 
                          ? 'bg-[#00D9A5] text-[#0F0F1A]' 
                          : 'bg-[#16213E] text-[#8E8E93]'
                      }
                    `}>
                      {isCompleted ? '✓' : stepNum}
                    </div>

                    <div className="flex-1">
                      <h6 className="font-headline font-bold text-xs text-white">{step.title}</h6>
                      <p className="text-[10px] text-[#8E8E93] mt-0.5 line-clamp-1">{step.desc}</p>
                    </div>

                    <div className="shrink-0">
                      {step.icon}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Active Details & Countdown */}
          <div className="lg:col-span-7 flex flex-col justify-between bg-[#16213E]/20 p-6 rounded-2xl border border-[#1A1A2E] min-h-[350px]">
            {activeStep === null ? (
              <div className="flex flex-col items-center justify-center text-center h-full gap-4">
                <div className="w-16 h-16 rounded-full bg-[#E94560]/10 border border-[#E94560]/20 flex items-center justify-center text-[#E94560]">
                  <Clock className="w-8 h-8 animate-pulse" />
                </div>
                <div>
                  <h6 className="font-headline font-bold text-sm text-white uppercase">Prêt à briser l'habitude ?</h6>
                  <p className="text-xs text-[#8E8E93] max-w-sm mt-2 leading-relaxed">
                    Cliquez sur n'importe quelle étape du protocole d'urgence ci-contre pour démarrer le chronomètre d'ancrage physique et mental.
                  </p>
                </div>
                <AlphaButton variant="danger" size="md" onClick={() => handleStepClick(1)}>
                  Déclencher le chronomètre global
                </AlphaButton>
              </div>
            ) : (
              <div className="flex flex-col justify-between h-full gap-6">
                
                {/* Step header */}
                <div className="flex justify-between items-start border-b border-[#1A1A2E] pb-3">
                  <div>
                    <span className="text-[9px] font-mono text-[#E94560] uppercase tracking-wider">PROTOCOLE ACTIVE - ETAPE {activeStep} SUR 5</span>
                    <h5 className="font-headline font-extrabold text-sm text-white mt-0.5">{protocolSteps[activeStep - 1].title}</h5>
                  </div>
                  <AlphaBadge variant="premium" label="DURÉE: 1 MIN" />
                </div>

                {/* Main Instruction */}
                <div className="flex flex-col items-center gap-6">
                  <p className="text-xs text-[#8E8E93] text-center leading-relaxed max-w-md">
                    {protocolSteps[activeStep - 1].desc}
                  </p>

                  {/* ACTIVE TIMING GRAPHIC */}
                  <div className="relative flex items-center justify-center">
                    {/* Ring background */}
                    <div className="w-24 h-24 rounded-full border-4 border-[#16213E] flex items-center justify-center">
                      <span className="font-mono text-3xl font-extrabold text-white">
                        {stepSeconds}s
                      </span>
                    </div>
                  </div>
                </div>

                {/* Step controls */}
                <div className="flex flex-col sm:flex-row justify-between items-center bg-[#0F0F1A]/50 p-4 rounded-xl border border-[#1A1A2E]/50 gap-4">
                  <div className="flex gap-2">
                    <AlphaButton variant="ghost" size="sm" onClick={toggleTimerPlay}>
                      {isTimerPlaying ? <Pause className="w-4 h-4 mr-1.5" /> : <Play className="w-4 h-4 mr-1.5" />}
                      {isTimerPlaying ? 'Mettre en pause' : 'Reprendre'}
                    </AlphaButton>
                    <AlphaButton variant="ghost" size="sm" onClick={() => setStepSeconds(60)}>
                      Réinitialiser
                    </AlphaButton>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={abandonEmergencyProtocol}
                      className="px-3 py-1.5 border border-red-500/20 text-red-400 text-xs rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer font-bold"
                    >
                      Abandonner
                    </button>
                    <AlphaButton 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => {
                        const nextChecklist = [...checklist];
                        nextChecklist[activeStep - 1] = true;
                        setChecklist(nextChecklist);
                        if (activeStep < 5) {
                          setActiveStep(activeStep + 1);
                          setStepSeconds(60);
                          addToast('success', "Étape validée !");
                        } else {
                          completeEmergencyProtocol();
                        }
                      }}
                    >
                      {activeStep === 5 ? "J'AI SURMONTÉ ⚔️" : "Valider & Suivant"}
                    </AlphaButton>
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 3: PATTERN ANALYTICS */}
      {activeSubTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-[fade-in_0.2s_ease-out]">
          
          {/* Stat panel */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <AlphaCard variant="premium" className="p-5 text-center flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#00D9A5]/10 border border-[#00D9A5]/20 flex items-center justify-center text-[#00D9A5]">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#8E8E93] uppercase tracking-wider">AFFAIBLISSEMENT DU PATTERN</span>
                <h4 className="font-headline font-extrabold text-3xl text-white mt-1">-34%</h4>
                <p className="text-[10px] text-[#8E8E93] mt-2 leading-relaxed">
                  Votre zone d'urgence comportementale s'est contractée de 34% depuis le début de vos entrainements, signe de restructuration synaptique active.
                </p>
              </div>
            </AlphaCard>

            <AlphaCard variant="default" className="p-5 flex flex-col gap-3">
              <span className="text-[10px] font-mono text-[#8E8E93] uppercase tracking-wider border-b border-[#1A1A2E] pb-2">TOP 3 TRIGGERS PERSONNELS</span>
              <div className="flex flex-col gap-2.5">
                {[
                  { name: "Stress fin de journée (20h-23h)", pct: 84, color: "bg-[#E94560]" },
                  { name: "Surcharge écran réseaux sociaux", pct: 68, color: "bg-orange-500" },
                  { name: "Weekend isolement à la maison", pct: 55, color: "bg-blue-400" },
                ].map((trig, idx) => (
                  <div key={idx} className="flex flex-col gap-1 text-xs">
                    <div className="flex justify-between font-mono text-[11px]">
                      <span className="text-white">{trig.name}</span>
                      <span className="text-[#8E8E93] font-bold">{trig.pct}%</span>
                    </div>
                    <div className="w-full bg-[#0F0F1A] h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full ${trig.color}`} style={{ width: `${trig.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </AlphaCard>
          </div>

          {/* Interactive Heatmap mockups */}
          <div className="lg:col-span-8 flex flex-col gap-5 bg-[#16213E]/20 p-5 rounded-2xl border border-[#1A1A2E]">
            <div className="border-b border-[#1A1A2E] pb-3 flex justify-between items-center">
              <div>
                <h5 className="font-headline font-extrabold text-xs text-white uppercase tracking-wider">HEATMAP HEURES/JOURS DE RISQUE</h5>
                <p className="text-[10px] text-[#8E8E93] mt-0.5">Représentation thermographique de la charge de risque accumulée sur la semaine.</p>
              </div>
              <AlphaBadge variant="streak" label="MODÈLE ML SYNCHRO" />
            </div>

            {/* Custom Grid Heatmap representation */}
            <div className="flex flex-col gap-2 py-2">
              <div className="flex justify-between text-[9px] font-mono text-gray-500 mb-1 px-8">
                <span>00h-04h</span>
                <span>04h-08h</span>
                <span>08h-12h</span>
                <span>12h-16h</span>
                <span>16h-20h</span>
                <span>20h-00h</span>
              </div>

              {['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'].map((day, dIdx) => {
                // Generate color intensities representing hours
                const intensities = dIdx >= 4 ? [0.6, 0.1, 0.2, 0.4, 0.7, 0.9] : [0.3, 0.1, 0.1, 0.3, 0.4, 0.6];
                return (
                  <div key={dIdx} className="flex items-center gap-3">
                    <span className="w-8 font-mono text-[10px] text-white font-bold">{day}</span>
                    <div className="flex-1 grid grid-cols-6 gap-2">
                      {intensities.map((intensity, iIdx) => {
                        let bg = 'bg-[#16213E]/40';
                        if (intensity >= 0.8) bg = 'bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.4)]';
                        else if (intensity >= 0.6) bg = 'bg-orange-500/70';
                        else if (intensity >= 0.4) bg = 'bg-[#FFD700]/60';
                        else if (intensity >= 0.2) bg = 'bg-[#00D9A5]/50';

                        return (
                          <div
                            key={iIdx}
                            className={`h-8 rounded-lg ${bg} transition-all duration-300 hover:scale-105 cursor-help`}
                            title={`Jour ${day}, Heure bloc ${iIdx * 4}h. Risque : ${Math.round(intensity * 100)}%`}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legende */}
            <div className="flex items-center justify-end gap-4 text-[9px] font-mono text-gray-400 mt-2 border-t border-[#1A1A2E]/50 pt-2">
              <span>Risque :</span>
              <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded bg-[#16213E]/40" /><span>Min (0-20%)</span></div>
              <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded bg-[#00D9A5]/50" /><span>Basse (21-40%)</span></div>
              <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded bg-[#FFD700]/60" /><span>Moyenne (41-60%)</span></div>
              <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded bg-orange-500/70" /><span>Élevée (61-80%)</span></div>
              <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded bg-red-500/80" /><span>Critique (81-100%)</span></div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AI COACH INSTANT CHAT */}
      {activeSubTab === 'coach' && (
        <div className="flex flex-col gap-4 bg-[#16213E]/20 p-5 rounded-2xl border border-[#1A1A2E] animate-[fade-in_0.2s_ease-out]">
          <div className="border-b border-[#1A1A2E] pb-3 flex justify-between items-center">
            <div>
              <h5 className="font-headline font-extrabold text-xs text-white uppercase tracking-wider">DIALOGUE D'ACCOMPAGNEMENT D'URGENCE</h5>
              <p className="text-[10px] text-[#8E8E93] mt-0.5">Discutez en temps réel avec le Coach IA souverain alimenté par Gemini.</p>
            </div>
            <AlphaBadge variant="premium" label="VIP GEMINI CHAT" />
          </div>

          {/* Chat feed container */}
          <div className="h-64 overflow-y-auto bg-[#0F0F1A]/80 border border-[#1A1A2E] p-4 rounded-xl flex flex-col gap-3">
            {chatMessages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-[85%] ${isUser ? 'self-end flex-row-reverse' : 'self-start'}`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border
                    ${isUser ? 'bg-[#E94560]/10 border-[#E94560]/30 text-[#E94560]' : 'bg-[#FFD700]/10 border-[#FFD700]/30 text-[#FFD700]'}
                  `}>
                    {isUser ? <User className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                  </div>

                  <div className={`p-3 rounded-2xl text-xs leading-relaxed
                    ${isUser 
                      ? 'bg-[#E94560] text-white rounded-tr-none' 
                      : 'bg-[#16213E] text-[#E0E0E0] rounded-tl-none border border-[#1A1A2E]'
                    }
                  `}>
                    {msg.loading ? (
                      <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#FFD700]">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Canalisation en cours...</span>
                      </div>
                    ) : (
                      msg.text
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Inputs */}
          <div className="flex gap-2 border-t border-[#1A1A2E] pt-3">
            <input
              type="text"
              placeholder="Exprimez votre situation, votre stress ou l'impulsion qui vous tiraille..."
              className="flex-1 bg-[#0F0F1A] border border-[#1A1A2E] p-3 rounded-xl text-xs text-white outline-none focus:border-[#FFD700]/40 font-mono"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
              disabled={isChatLoading}
            />
            <AlphaButton variant="gold" className="px-6" onClick={handleSendChatMessage} disabled={isChatLoading}>
              Canaliser
            </AlphaButton>
          </div>
        </div>
      )}

      {activeSubTab === 'circuit' && (
        <div className="flex flex-col gap-5 bg-[#16213E]/20 p-5 rounded-2xl border border-[#1A1A2E] animate-[fade-in_0.2s_ease-out] text-left">
          <div className="border-b border-[#1A1A2E] pb-3">
            <h5 className="font-headline font-extrabold text-xs text-white uppercase tracking-wider">CBT : Circuit de l'Observateur</h5>
            <p className="text-[10px] text-[#8E8E93] mt-0.5">Entraînez votre cortex préfrontal à intercepter l'impulsion motrice réflexe.</p>
          </div>
          <CircuitObserverDiagram
            mode="personal"
            context="lesson"
            embedded={true}
            addToast={addToast}
            isRTL={userLanguage === 'ar'}
            isFirstSimulationCompletion={!hasCompletedCircuitSimulation}
            onSimulationComplete={handleSimulationComplete}
            urgeSurfDurationSeconds={settingsUrgeSurfSeconds}
            onUrgeSurfComplete={(outcome) => {
              if (outcome === 'resisted') {
                addToast('success', 'Entraînement de surf de crise validé souverainement ! 🌊');
              }
            }}
          />
        </div>
      )}

      {/* FOOTER CALL FOR FRIEND */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-[#FFD700]/5 border border-[#FFD700]/10 p-4 rounded-xl gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#FFD700]/10 flex items-center justify-center text-[#FFD700]">
            <Phone className="w-4 h-4" />
          </div>
          <div>
            <h6 className="font-headline font-bold text-xs text-white uppercase">Option ALPHA BUDDY active</h6>
            <p className="text-[10px] text-[#8E8E93]">Appelez un frère d'armes du clan en un clic pour vaincre le pattern ensemble.</p>
          </div>
        </div>
        <AlphaButton variant="gold" size="sm" onClick={() => addToast('info', "Appel simulé vers votre ALPHA BUDDY de liaison ! Restez groupés.")}>
          Appeler mon ALPHA BUDDY
        </AlphaButton>
      </div>

    </div>
  );
};
