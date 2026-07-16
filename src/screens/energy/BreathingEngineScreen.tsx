import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft,
  Info,
  ChevronLeft,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Award,
  Flame,
  BookOpen,
  Brain,
  Wind,
  Square,
  Moon,
  Heart,
  Lock,
  Plus,
  Clock,
  Code,
  Copy,
  Settings,
  X,
  TrendingUp,
  Volume2,
  VolumeX,
  Volume1,
  AlertTriangle,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AlphaCard } from '../../components/AlphaCard';
import { AlphaButton } from '../../components/AlphaButton';

interface BreathingEngineScreenProps {
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
  onBack?: () => void;
}

type TechniqueId = 'box_breathing' | 'wim_hof' | 'four_seven_eight' | 'alpha_breath' | 'coherence';

interface Technique {
  id: TechniqueId;
  name: string;
  pattern: string;
  difficulty: 'Facile' | 'Moyen' | 'Avancé';
  diffColor: string;
  badge?: 'PREMIUM' | 'ELITE';
  icon: React.ReactNode;
  benefits: string[];
  description: string;
  benefitsSummary: string;
  source: string;
  inhale: number;
  hold: number;
  expire: number;
  relax: number;
}

export const BreathingEngineScreen: React.FC<BreathingEngineScreenProps> = ({ addToast, onBack }) => {
  // Simulator Controls & View Modes
  const [showNativeCode, setShowNativeCode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [hasSubscription, setHasSubscription] = useState<boolean>(false);

  // Core App States specified in the prompt
  const [selectedTechnique, setSelectedTechnique] = useState<TechniqueId>('box_breathing');
  const [selectedDuration, setSelectedDuration] = useState<number | 'custom'>(180); // Default 3 min (180s)
  const [customDuration, setCustomDuration] = useState<number>(300); // 5 min default for custom
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);

  // Active session states
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [timerStarted, setTimerStarted] = useState<boolean>(false);
  const [timerPaused, setTimerPaused] = useState<boolean>(false);
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'hold' | 'exhale' | 'relax'>('inhale');
  const [currentCycle, setCurrentCycle] = useState<number>(1);
  const [totalCycles, setTotalCycles] = useState<number>(10);
  const [phaseSecondsRemaining, setPhaseSecondsRemaining] = useState<number>(4);

  // BottomSheet modal for science
  const [showScienceSheet, setShowScienceSheet] = useState<boolean>(false);

  // Stats & History States
  const [stats, setStats] = useState({
    totalSessions: 89,
    totalTime: "7h 45m",
    streakDays: 12,
    weeklyData: [
      { day: "Lun", minutes: 10, pattern: "Box Breathing" },
      { day: "Mar", minutes: 5, pattern: "4-7-8" },
      { day: "Mer", minutes: 15, pattern: "Wim Hof" },
      { day: "Jeu", minutes: 0, pattern: "None" },
      { day: "Ven", minutes: 8, pattern: "Box Breathing" },
      { day: "Sam", minutes: 12, pattern: "Alpha Breath" },
      { day: "Dim", minutes: 5, pattern: "Cohérence" },
    ]
  });

  const [recentSessions, setRecentSessions] = useState([
    { technique: "Box Breathing", duration: 5, date: "Aujourd'hui, 08:15", time: "08:15", id: "s1" },
    { technique: "Wim Hof", duration: 10, date: "Hier, 18:30", time: "18:30", id: "s2" },
    { technique: "4-7-8", duration: 3, date: "11 Juil, 22:45", time: "22:45", id: "s3" }
  ]);

  // Audio Context Ref for Web Audio API tone generator
  const audioContextRef = useRef<AudioContext | null>(null);

  // Techniques catalog definition
  const techniques: Record<TechniqueId, Technique> = {
    box_breathing: {
      id: 'box_breathing',
      name: "Box Breathing",
      pattern: "4-4-4-4",
      difficulty: "Facile",
      diffColor: "text-[#00D9A5]",
      icon: <Square className="w-5 h-5 text-[#00D9A5]" />,
      benefitsSummary: "CALME & FOCUS",
      description: "Inspire 4 sec, retiens 4 sec, expire 4 sec, relâche 4 sec. Utilisé par les Navy SEALs pour gérer le stress en situation critique.",
      benefits: [
        "Réduit le cortisol de 23%",
        "Améliore la concentration immédiate",
        "Prépare le corps à l'action ou au sommeil"
      ],
      source: "Nestor, J. (2020). Breath. Riverhead.",
      inhale: 4,
      hold: 4,
      expire: 4,
      relax: 4
    },
    wim_hof: {
      id: 'wim_hof',
      name: "Wim Hof",
      pattern: "30-2-2",
      difficulty: "Moyen",
      diffColor: "text-[#FF9500]",
      icon: <Wind className="w-5 h-5 text-[#4A90D9]" />,
      benefitsSummary: "VITALITÉ & IMMUNITÉ",
      description: "Inspirations profondes répétées suivies d'une rétention poumons vides puis poumons pleins. Idéal pour saturer le sang en oxygène et booster l'énergie.",
      benefits: [
        "Augmente l'alcalinité du sang",
        "Stimule la production d'adrénaline saine",
        "Renforce la tolérance au stress thermique"
      ],
      source: "Hof, W. (2020). The Wim Hof Method.",
      inhale: 2,
      hold: 0, // Wim Hof is done differently, but we represent it in timing for simulator
      expire: 2,
      relax: 0
    },
    four_seven_eight: {
      id: 'four_seven_eight',
      name: "4-7-8",
      pattern: "4-7-8",
      difficulty: "Facile",
      diffColor: "text-[#00D9A5]",
      icon: <Moon className="w-5 h-5 text-[#FFD700]" />,
      benefitsSummary: "SOMMEIL IMMÉDIAT",
      description: "Inspire 4 sec, retiens 7 sec, expire 8 sec par la bouche. Active immédiatement le système nerveux parasympathique pour éteindre le mental.",
      benefits: [
        "Ralentit le rythme cardiaque instantanément",
        "Combat les insomnies rebelles",
        "Ancre l'attention sur le souffle long"
      ],
      source: "Weil, A. (2014). Breathing: The Master Key to Self-Healing.",
      inhale: 4,
      hold: 7,
      expire: 8,
      relax: 0
    },
    alpha_breath: {
      id: 'alpha_breath',
      name: "Alpha Breath",
      pattern: "5-2-5",
      difficulty: "Moyen",
      diffColor: "text-[#FF9500]",
      badge: "PREMIUM",
      icon: <Flame className="w-5 h-5 text-[#E94560]" />,
      benefitsSummary: "RECHARGE HORMONALE",
      description: "Inspirations diaphragmatiques lentes de 5 secondes, rétention de 2 secondes, expiration de 5 secondes. Optimisé pour la synthèse de testostérone.",
      benefits: [
        "Active le nerf vague profond",
        "Augmente la variabilité du rythme cardiaque (HRV)",
        "Améliore l'oxygénation des muscles lombaires"
      ],
      source: "Alpha Man Labs research protocol (2024).",
      inhale: 5,
      hold: 2,
      expire: 5,
      relax: 0
    },
    coherence: {
      id: 'coherence',
      name: "Cohérence",
      pattern: "5.5-5.5",
      difficulty: "Avancé",
      diffColor: "text-[#E94560]",
      badge: "ELITE",
      icon: <Heart className="w-5 h-5 text-[#FF2D55]" />,
      benefitsSummary: "COHÉRENCE CARDIAQUE",
      description: "Synchronisation parfaite à 6 cycles par minute (5.5s inspire, 5.5s expire). Amène le système cardiovasculaire et le cerveau dans un état de résonance.",
      benefits: [
        "Calibre la tension artérielle",
        "Équilibre parfait sympathico-vagal",
        "Diminue l'anxiété chronique de 40%"
      ],
      source: "O'Hare, D. (2012). Cohérence Cardiaque 365.",
      inhale: 5.5,
      hold: 0,
      expire: 5.5,
      relax: 0
    }
  };

  const activeTech = techniques[selectedTechnique];
  const isPremiumLocked = (activeTech.badge === 'PREMIUM' || activeTech.badge === 'ELITE') && !hasSubscription;

  // Initialize Web Audio API on human interaction
  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  // Play browser sound tone depending on phase
  const playPhaseTone = (phase: 'inhale' | 'hold' | 'exhale' | 'relax') => {
    if (!soundEnabled) return;
    initAudio();
    if (!audioContextRef.current) return;

    // Check if audio context is suspended
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    let freq = 0;
    if (phase === 'inhale') freq = 440; // A4
    else if (phase === 'hold') freq = 523; // C5
    else if (phase === 'exhale') freq = 330; // E4

    if (freq === 0) return; // Silent on relax phase

    try {
      const osc = audioContextRef.current.createOscillator();
      const gain = audioContextRef.current.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      gain.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, audioContextRef.current.currentTime + 0.05); // 12% volume for pleasant tone
      gain.gain.exponentialRampToValueAtTime(0.0001, audioContextRef.current.currentTime + 0.4); // Fade out quickly
      
      osc.connect(gain);
      gain.connect(audioContextRef.current.destination);
      
      osc.start();
      osc.stop(audioContextRef.current.currentTime + 0.5);
    } catch (e) {
      console.warn("Could not play phase tone:", e);
    }
  };

  // Trigger browser haptic-like vibration
  const triggerHaptic = (style: 'light' | 'medium' | 'heavy') => {
    if (navigator.vibrate) {
      if (style === 'light') navigator.vibrate(40);
      else if (style === 'medium') navigator.vibrate(80);
      else navigator.vibrate([100, 50, 100]);
    }
  };

  // Session timer ticker effect
  useEffect(() => {
    let interval: any = null;
    if (timerStarted && !timerPaused) {
      interval = setInterval(() => {
        // Decrease global session timer
        setTimerSeconds(prev => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });

        // Handle breathing phase duration progress
        setPhaseSecondsRemaining(prev => {
          if (prev <= 1) {
            // Move to next phase in the cycle
            advanceBreathingPhase();
            return 1; // Temporary placeholder, actual new value is set in advanceBreathingPhase
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [timerStarted, timerPaused, currentPhase, selectedTechnique]);

  const advanceBreathingPhase = () => {
    const tech = techniques[selectedTechnique];
    
    // Sequence flows: inhale -> hold (if > 0) -> exhale -> relax (if box_breathing) -> loop
    let nextPhase: 'inhale' | 'hold' | 'exhale' | 'relax' = 'inhale';
    let nextPhaseDuration = tech.inhale;

    if (currentPhase === 'inhale') {
      if (tech.hold > 0) {
        nextPhase = 'hold';
        nextPhaseDuration = tech.hold;
      } else {
        nextPhase = 'exhale';
        nextPhaseDuration = tech.expire;
      }
    } else if (currentPhase === 'hold') {
      nextPhase = 'exhale';
      nextPhaseDuration = tech.expire;
    } else if (currentPhase === 'exhale') {
      if (selectedTechnique === 'box_breathing') {
        nextPhase = 'relax';
        nextPhaseDuration = tech.relax;
      } else {
        nextPhase = 'inhale';
        nextPhaseDuration = tech.inhale;
        setCurrentCycle(c => c + 1);
      }
    } else if (currentPhase === 'relax') {
      nextPhase = 'inhale';
      nextPhaseDuration = tech.inhale;
      setCurrentCycle(c => c + 1);
    }

    setCurrentPhase(nextPhase);
    setPhaseSecondsRemaining(Math.round(nextPhaseDuration));
    playPhaseTone(nextPhase);
    triggerHaptic('light');
  };

  const handleStartSession = () => {
    initAudio();
    if (isPremiumLocked) {
      addToast('error', "Cette technique de respiration nécessite un abonnement Premium.");
      return;
    }

    const duration = selectedDuration === 'custom' ? customDuration : selectedDuration;
    setTimerSeconds(duration);
    setCurrentCycle(1);
    setCurrentPhase('inhale');
    setPhaseSecondsRemaining(Math.round(techniques[selectedTechnique].inhale));
    setTimerStarted(true);
    setTimerPaused(false);
    
    playPhaseTone('inhale');
    triggerHaptic('medium');
    addToast('success', `Session de respiration commencée ! Respiration diaphragmatique lente... 🫁`);
  };

  const handleTogglePause = () => {
    setTimerPaused(!timerPaused);
    triggerHaptic('light');
    addToast('info', timerPaused ? "Respiration reprise" : "Respiration suspendue");
  };

  const handleStopSession = () => {
    triggerHaptic('heavy');
    const confirmStop = window.confirm("Souhaitez-vous vraiment arrêter la séance de respiration guidée ?");
    if (confirmStop) {
      setTimerStarted(false);
      setTimerPaused(false);
      setTimerSeconds(0);
      addToast('warning', "Séance de respiration interrompue.");
    }
  };

  const handleSessionComplete = () => {
    setTimerStarted(false);
    setTimerSeconds(0);
    triggerHaptic('heavy');

    const duration = selectedDuration === 'custom' ? customDuration : selectedDuration;
    const addedMinutes = Math.round(duration / 60);

    // Update stats
    setStats(prev => ({
      ...prev,
      totalSessions: prev.totalSessions + 1,
      streakDays: prev.streakDays + 1
    }));

    // Add to recent list
    const todayStr = "Aujourd'hui, " + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    setRecentSessions(prev => [
      {
        technique: activeTech.name,
        duration: addedMinutes,
        date: todayStr,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        id: "s" + Date.now()
      },
      ...prev.slice(0, 2)
    ]);

    addToast('success', `Félicitations ! Séance de ${activeTech.name} terminée. Système nerveux rechargé. 🌬️`);
  };

  // Convert duration to standard formatting "05:00"
  const formatTimerValue = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectTechnique = (techId: TechniqueId) => {
    triggerHaptic('light');
    setSelectedTechnique(techId);
    
    // Auto-adjust standard breathing cycles duration
    const tech = techniques[techId];
    if (techId === 'four_seven_eight') {
      setSelectedDuration(180); // 3 min
    } else {
      setSelectedDuration(300); // 5 min default
    }
  };

  // React Native Expo Native implementation code
  const expoNativeCode = `import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
  Alert
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

type Phase = 'inhale' | 'hold' | 'exhale' | 'relax';

export default function BreathingEngineScreen() {
  const [technique, setTechnique] = useState('box_breathing');
  const [timerStarted, setTimerStarted] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(180);
  const [currentPhase, setCurrentPhase] = useState<Phase>('inhale');
  const [currentCycle, setCurrentCycle] = useState(1);
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState(4);

  // Animated breathe scale & opacity
  const breathAnimScale = useRef(new Animated.Value(1.0)).current;
  const breathAnimOpacity = useRef(new Animated.Value(0.05)).current;

  const techniques = {
    box_breathing: { inhale: 4, hold: 4, expire: 4, relax: 4, label: "BOX" },
    wim_hof: { inhale: 2, hold: 0, expire: 2, relax: 0, label: "WIM HOF" },
    four_seven_eight: { inhale: 4, hold: 7, expire: 8, relax: 0, label: "4-7-8" }
  };

  // Sound generator
  const playSoundTone = async (phase: Phase) => {
    try {
      // Load and play a synthesized sound or custom short sound file in Expo
      const { sound } = await Audio.Sound.createAsync(
        phase === 'inhale' 
          ? require('./assets/sounds/inhale_beep.mp3') 
          : require('./assets/sounds/hold_beep.mp3')
      );
      await sound.playAsync();
    } catch (e) {
      console.log('Audio playback error', e);
    }
  };

  // Loop Breathing Circle animations depending on phase
  useEffect(() => {
    if (!timerStarted || timerPaused) {
      breathAnimScale.stopAnimation();
      breathAnimOpacity.stopAnimation();
      return;
    }

    let duration = 4000;
    let targetScale = 1.0;
    let targetOpacity = 0.05;

    const currentTech = techniques[technique];

    if (currentPhase === 'inhale') {
      duration = currentTech.inhale * 1000;
      targetScale = 1.4;
      targetOpacity = 0.2;
    } else if (currentPhase === 'hold') {
      duration = currentTech.hold * 1000;
      targetScale = 1.4;
      targetOpacity = 0.2;
    } else if (currentPhase === 'exhale') {
      duration = currentTech.expire * 1000;
      targetScale = 1.0;
      targetOpacity = 0.05;
    } else if (currentPhase === 'relax') {
      duration = currentTech.relax * 1000;
      targetScale = 1.0;
      targetOpacity = 0.05;
    }

    Animated.parallel([
      Animated.timing(breathAnimScale, {
        toValue: targetScale,
        duration: duration,
        useNativeDriver: true,
      }),
      Animated.placeholder || Animated.timing(breathAnimOpacity, {
        toValue: targetOpacity,
        duration: duration,
        useNativeDriver: true,
      })
    ]).start();

  }, [currentPhase, timerStarted, timerPaused, technique]);

  // Phase controller interval
  useEffect(() => {
    let interval = null;
    if (timerStarted && !timerPaused) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setTimerStarted(false);
            Alert.alert("Séance terminée !", "Excellent travail, votre esprit est apaisé.");
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            return 0;
          }
          return prev - 1;
        });

        setPhaseSecondsLeft(prev => {
          if (prev <= 1) {
            advancePhase();
            return 1;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerStarted, timerPaused, currentPhase, technique]);

  const advancePhase = () => {
    const currentTech = techniques[technique];
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (currentPhase === 'inhale') {
      if (currentTech.hold > 0) {
        setCurrentPhase('hold');
        setPhaseSecondsLeft(currentTech.hold);
      } else {
        setCurrentPhase('exhale');
        setPhaseSecondsLeft(currentTech.expire);
      }
    } else if (currentPhase === 'hold') {
      setCurrentPhase('exhale');
      setPhaseSecondsLeft(currentTech.expire);
    } else if (currentPhase === 'exhale') {
      if (technique === 'box_breathing') {
        setCurrentPhase('relax');
        setPhaseSecondsLeft(currentTech.relax);
      } else {
        setCurrentPhase('inhale');
        setPhaseSecondsLeft(currentTech.inhale);
        setCurrentCycle(c => c + 1);
      }
    } else if (currentPhase === 'relax') {
      setCurrentPhase('inhale');
      setPhaseSecondsLeft(currentTech.inhale);
      setCurrentCycle(c => c + 1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F1A" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {}}>
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>RESPIRATION</Text>
        <TouchableOpacity>
          <Feather name="info" size={24} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.animationContainer}>
          <Animated.View style={[
            styles.breathCircle,
            {
              transform: [{ scale: breathAnimScale }],
              backgroundColor: 'rgba(0, 217, 165, 0.05)',
              opacity: breathAnimOpacity
            }
          ]}>
            <Text style={styles.phaseLabel}>{currentPhase.toUpperCase()}</Text>
          </Animated.View>
        </View>
        
        {/* Rest of the visual controller components ... */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  header: { height: 80, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#00D9A5' },
  scroll: { paddingBottom: 40 },
  animationContainer: { height: 240, backgroundColor: '#16213E', borderBottomLeftRadius: 20, borderBottomRightRadius: 20, justifyContent: 'center', alignItems: 'center' },
  breathCircle: { width: 160, height: 160, borderRadius: 80, borderWidth: 3, borderColor: '#00D9A5', justifyContent: 'center', alignItems: 'center' },
  phaseLabel: { color: '#00D9A5', fontWeight: 'bold', fontSize: 18 }
});`;

  const copyExpoCode = () => {
    navigator.clipboard.writeText(expoNativeCode);
    setCopied(true);
    addToast('success', "Code source BreathingEngineScreen copié ! 📋");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 w-full text-white relative">
      
      {/* HEADER BAR FOR THE SIMULATOR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#111124] border border-[#1C1C3A] rounded-2xl p-4 gap-4 shadow-xl text-left">
        <div>
          <span className="text-[10px] font-mono text-[#00D9A5] uppercase tracking-widest bg-[#00D9A5]/10 border border-[#00D9A5]/20 px-2 rounded-md">
            Pilier Vitalité #5 — Respiration (3.5)
          </span>
          <h2 className="text-md font-headline font-black text-white mt-1">
            Générateur de Rythme Respiratoire & Cohérence Cardiaque
          </h2>
          <p className="text-xs text-gray-400">
            Prenez le contrôle de votre nerf vague, calibrez le parasympathique et régulez le cortisol instantanément.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {onBack && (
            <AlphaButton variant="ghost" size="sm" onClick={onBack}>
              Retour
            </AlphaButton>
          )}

          <AlphaButton 
            variant={showNativeCode ? "gold" : "primary"}
            size="sm"
            onClick={() => setShowNativeCode(!showNativeCode)}
            className="flex items-center gap-2"
          >
            <Code className="w-4 h-4" />
            {showNativeCode ? "Masquer le Code" : "Inspecter Code Expo"}
          </AlphaButton>
        </div>
      </div>

      {/* REACT NATIVE CODE INSPECTOR */}
      {showNativeCode && (
        <div className="bg-[#111124] border border-[#1C1C3A] rounded-3xl p-6 flex flex-col gap-4 animate-[fade-in_0.3s_ease-out] text-left">
          <div className="flex justify-between items-center border-b border-[#1C1C35] pb-3">
            <div>
              <h4 className="text-xs font-headline font-black text-white">Composant BreathingEngineScreen.tsx (TypeScript)</h4>
              <p className="text-[10px] text-gray-500">
                Implémente les boucles d'animation trigonométriques pour le cercle thoracique, la synthèse audio de signaux sinusoïdaux et la gestion haptique multi-niveaux.
              </p>
            </div>
            <AlphaButton 
              variant="secondary" 
              size="sm" 
              onClick={copyExpoCode}
              className="flex items-center gap-2 text-[10px] font-headline"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? 'Copié !' : 'Copier le Code Natif'}
            </AlphaButton>
          </div>
          <pre className="p-4 bg-[#0A0A14] rounded-2xl border border-[#1A1A2E] overflow-x-auto text-[10px] md:text-xs font-mono text-gray-300 leading-relaxed max-h-[400px] custom-scrollbar">
            {expoNativeCode}
          </pre>
        </div>
      )}

      {/* CORE WRAPPER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT PANEL: SIMULATOR ADJUSTER */}
        <div className="lg:col-span-4 bg-[#111124] border border-[#1C1C3A] rounded-[24px] p-5 space-y-5 text-left shadow-lg">
          <div className="border-b border-gray-800 pb-3">
            <h3 className="text-sm font-headline font-black text-[#FFD700] uppercase tracking-wider flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Contrôleur de Système
            </h3>
            <p className="text-[11px] text-gray-400 mt-1">
              Configurez l'environnement de simulation et les permissions de test.
            </p>
          </div>

          {/* SIMULATED SUBSCRIPTION LOCK */}
          <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5">
            <div className="space-y-0.5">
              <span className="text-xs font-headline font-bold text-white block">Abonnement ALPHA ELITE</span>
              <span className="text-[10px] text-gray-400 block">Déverrouille les techniques avancées</span>
            </div>
            <button
              onClick={() => {
                setHasSubscription(!hasSubscription);
                addToast('success', hasSubscription ? "Abonnement Premium désactivé (Test)" : "Compte de test surclassé en ALPHA ELITE ! ⭐");
              }}
              className={`py-1 px-3.5 rounded-lg text-[10px] font-headline font-black uppercase transition-all ${hasSubscription ? 'bg-[#FFD700] text-black' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
            >
              {hasSubscription ? "ACTIVÉ" : "ACTIVER"}
            </button>
          </div>

          {/* AUDIO TONES TOGGLE */}
          <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5">
            <div className="space-y-0.5">
              <span className="text-xs font-headline font-bold text-white block">Tonalités Sonores (Audio API)</span>
              <span className="text-[10px] text-gray-400 block">Signaux de phases inspiratoire/expiratoire</span>
            </div>
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                addToast('info', soundEnabled ? "Effets sonores désactivés" : "Effets sonores activés (Web Audio API)");
              }}
              className="text-[#00D9A5] hover:bg-[#00D9A5]/10 p-2 rounded-lg transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-gray-600" />}
            </button>
          </div>

          {/* RECENT STREAK ADJUSTER */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs text-gray-400 font-headline">Assiduité (Streak de jours)</label>
              <span className="text-xs font-mono font-bold text-[#00D9A5]">{stats.streakDays} jours</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="30" 
              value={stats.streakDays} 
              onChange={(e) => setStats({ ...stats, streakDays: parseInt(e.target.value) })}
              className="w-full accent-[#00D9A5] h-1.5 bg-gray-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* RESET SIMULATOR LOGS */}
          <div className="border-t border-gray-800 pt-4 space-y-2">
            <button
              onClick={() => {
                setStats({
                  totalSessions: 0,
                  totalTime: "0h 00m",
                  streakDays: 0,
                  weeklyData: [
                    { day: "Lun", minutes: 0, pattern: "None" },
                    { day: "Mar", minutes: 0, pattern: "None" },
                    { day: "Mer", minutes: 0, pattern: "None" },
                    { day: "Jeu", minutes: 0, pattern: "None" },
                    { day: "Ven", minutes: 0, pattern: "None" },
                    { day: "Sam", minutes: 0, pattern: "None" },
                    { day: "Dim", minutes: 0, pattern: "None" },
                  ]
                });
                setRecentSessions([]);
                addToast('warning', "Historique de respiration réinitialisé à zéro.");
              }}
              className="w-full py-2 px-3 bg-[#FF2D55]/10 border border-[#FF2D55]/20 hover:bg-[#FF2D55]/20 text-[#FF2D55] rounded-xl text-xs font-headline font-black transition-all"
            >
              Réinitialiser les Données
            </button>
          </div>
        </div>

        {/* RIGHT PANEL: PHONE EMULATION FRAME */}
        <div className="lg:col-span-8 flex flex-col items-center">
          <div className="w-full max-w-[430px] bg-black rounded-[48px] p-3.5 pt-5 pb-5 border-[7px] border-[#222232] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] relative overflow-hidden">
            
            {/* Dynamic Island Notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-5 bg-black rounded-b-2xl z-50 flex items-center justify-center gap-1.5">
              <div className="w-12 h-0.5 bg-[#222232] rounded-full" />
              <div className="w-2.5 h-2.5 bg-[#101020] rounded-full" />
            </div>

            {/* SCREEN INNER CONTAINER */}
            <div className="bg-[#0F0F1A] rounded-[36px] overflow-hidden flex flex-col relative min-h-[790px] text-left select-none">
              
              {/* TOP STATUS BAR LINE */}
              <div className="h-10 px-6 pt-3 flex justify-between items-center text-[10px] font-mono font-bold text-gray-500 z-20">
                <span>15:35</span>
                <div className="flex items-center gap-1.5">
                  <span>5G</span>
                  <div className="w-4 h-2 border border-gray-600 rounded-2xs p-[1px] flex items-center">
                    <div className="h-full w-3 bg-[#00D9A5] rounded-3xs" />
                  </div>
                </div>
              </div>

              {/* SCREEN HEADER */}
              <div className="h-14 px-4 flex items-center justify-between border-b border-gray-900 bg-[#0F0F1A] z-10">
                <button 
                  onClick={onBack}
                  className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-white/5 active:bg-white/10 transition-colors text-white cursor-pointer"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <h1 className="text-md font-headline font-black tracking-widest text-[#00D9A5] uppercase">
                  Respiration
                </h1>
                <button 
                  onClick={() => setShowScienceSheet(true)}
                  className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-white/5 active:bg-white/10 transition-colors text-[#8E8E93]"
                >
                  <Info className="w-5 h-5" />
                </button>
              </div>

              {/* DYNAMIC SCROLL CONTAINER */}
              <div className="flex-1 overflow-y-auto max-h-[590px] p-4 space-y-6 custom-scrollbar">

                {/* SECTION 1: ANIMATION RESPIRATION (HEADER VISUEL) */}
                <div className="rounded-3xl p-6 h-[240px] flex flex-col items-center justify-center relative overflow-hidden border border-white/5 bg-gradient-to-t from-[#16213E] to-[#1A1A2E]">
                  
                  {/* Absolute positioning header items (timer if active) */}
                  {timerStarted && (
                    <div className="absolute top-4 inset-x-0 text-center z-10 animate-[fade-in_0.3s_ease-out]">
                      <span className="text-sm font-mono font-black text-white block tracking-widest">
                        {formatTimerValue(timerSeconds)}
                      </span>
                      <span className="text-[9px] text-[#8E8E93] font-headline uppercase font-bold tracking-wider">
                        Cycle {currentCycle}
                      </span>
                    </div>
                  )}

                  {/* 12 orbiting particles around center circle */}
                  <div className="absolute inset-0 pointer-events-none z-0">
                    {[...Array(12)].map((_, i) => {
                      const angle = (i * 30 * Math.PI) / 180;
                      const initialRadius = 100;
                      // Synced rotate animation speed
                      return (
                        <motion.div 
                          key={i}
                          animate={{
                            rotate: 360,
                            scale: timerStarted && !timerPaused ? [1.0, 1.15, 1.0] : 1.0
                          }}
                          transition={{
                            rotate: { repeat: Infinity, duration: 12, ease: "linear" },
                            scale: { repeat: Infinity, duration: activeTech.inhale + activeTech.expire, ease: "easeInOut" }
                          }}
                          className="absolute w-2 h-2 rounded-full bg-[#00D9A5]/40"
                          style={{
                            left: `calc(50% - 4px + ${Math.cos(angle) * initialRadius}px)`,
                            top: `calc(50% - 4px + ${Math.sin(angle) * initialRadius}px)`,
                            transformOrigin: '4px 4px'
                          }}
                        />
                      );
                    })}
                  </div>

                  {/* Main breathing circle with dynamic scale & background opacity */}
                  <motion.div 
                    animate={{ 
                      scale: timerStarted && !timerPaused
                        ? currentPhase === 'inhale' ? [1.0, 1.4]
                          : currentPhase === 'hold' ? 1.4
                          : currentPhase === 'exhale' ? [1.4, 1.0]
                          : 1.0
                        : 1.0,
                      backgroundColor: timerStarted && !timerPaused
                        ? currentPhase === 'inhale' ? ["rgba(0,217,165,0.05)", "rgba(0,217,165,0.2)"]
                          : "rgba(0,217,165,0.2)"
                        : "rgba(0,217,165,0.05)"
                    }}
                    transition={{ 
                      duration: timerStarted && !timerPaused
                        ? currentPhase === 'inhale' ? activeTech.inhale
                          : currentPhase === 'hold' ? activeTech.hold
                          : currentPhase === 'exhale' ? activeTech.expire
                          : activeTech.relax
                        : 2, 
                      ease: "easeInOut" 
                    }}
                    className="w-[160px] h-[160px] rounded-full border-3 border-[#00D9A5] flex flex-col items-center justify-center z-10 shadow-[0_0_35px_rgba(0,217,165,0.15)] relative"
                  >
                    {/* Breathing Phase Center Text */}
                    <AnimatePresence mode="wait">
                      <motion.span 
                        key={currentPhase}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        className="text-md font-headline font-black text-[#00D9A5] tracking-widest uppercase block"
                      >
                        {timerStarted ? (
                          currentPhase === 'inhale' ? "INSPIRE"
                          : currentPhase === 'hold' ? "RETIENS"
                          : currentPhase === 'exhale' ? "EXPIRE"
                          : "RELÂCHE"
                        ) : (
                          "FOCUS"
                        )}
                      </motion.span>
                    </AnimatePresence>

                    {/* Seconds left indicator in phase */}
                    {timerStarted && (
                      <span className="text-[10px] font-mono font-bold text-white/70 mt-1 block">
                        {phaseSecondsRemaining}s
                      </span>
                    )}
                  </motion.div>

                  {/* Static bottom helper label */}
                  <div className="absolute bottom-4 left-0 right-0 text-center z-10">
                    <span className="text-[11px] text-gray-400 font-headline font-bold">
                      Synchronise ta respiration avec le cercle
                    </span>
                  </div>
                </div>

                {/* SECTION 2: SÉLECTION DE TECHNIQUE (TABS HORIZONTAUX) */}
                <div className="space-y-2">
                  <h3 className="text-[13px] font-headline font-black text-[#FFD700] uppercase tracking-wider px-1">
                    Choisir un Protocole
                  </h3>

                  <div className="flex gap-2.5 overflow-x-auto pb-2 px-1 snap-x custom-scrollbar">
                    {Object.values(techniques).map((tech) => {
                      const isSelected = selectedTechnique === tech.id;
                      const hasBadge = !!tech.badge;
                      return (
                        <button
                          key={tech.id}
                          onClick={() => handleSelectTechnique(tech.id)}
                          className={`w-[120px] h-[86px] rounded-xl flex flex-col items-center justify-center p-3 flex-shrink-0 snap-start border-2 relative transition-all duration-200 cursor-pointer
                            ${isSelected 
                              ? 'bg-[#16213E] border-[#00D9A5] scale-105 shadow-md shadow-[#00D9A5]/10' 
                              : 'bg-[#16213E]/60 border-transparent hover:border-gray-800'
                            }
                          `}
                        >
                          {/* Premium/Elite Corner Badge */}
                          {hasBadge && (
                            <span className="absolute -top-1 right-1 bg-[#FFD700] text-[#0F0F1A] text-[7px] font-headline font-black px-1 py-0.5 rounded-sm shadow-sm scale-90">
                              {tech.badge}
                            </span>
                          )}

                          <div className="mb-1">{tech.icon}</div>
                          <span className="text-xs font-headline font-extrabold text-white leading-tight">
                            {tech.name === "Box Breathing" ? "Box" : tech.name}
                          </span>
                          <span className="text-[9px] font-mono text-gray-400 mt-0.5">{tech.pattern}</span>
                          <span className={`text-[8px] font-headline font-bold ${tech.diffColor} mt-0.5`}>
                            {tech.difficulty}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* SECTION 3: TECHNIQUE DETAILS (CARD) */}
                <div className="bg-[#16213E] border border-white/5 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                  
                  {/* Decorative background aura */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-[#00D9A5]/5 rounded-full blur-xl pointer-events-none" />

                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-headline font-black text-[#00D9A5] uppercase tracking-wider">
                      {activeTech.name}
                    </h3>
                    <span className="bg-[#00D9A5]/10 border border-[#00D9A5]/20 text-[#00D9A5] text-[9px] font-headline font-black px-2 py-0.5 rounded uppercase">
                      {activeTech.benefitsSummary}
                    </span>
                  </div>

                  <p className="text-[12px] text-gray-300 leading-relaxed">
                    {activeTech.description}
                  </p>

                  {/* Bullet Benefits List */}
                  <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5">
                    {activeTech.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex gap-2 items-center text-[11px] text-gray-400">
                        <span className="text-[#00D9A5] font-black text-xs">✓</span>
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>

                  {/* Suggérée clock label & Citation */}
                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/5 text-[10px] text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#00D9A5]" />
                      Durée suggérée : 5-10 min
                    </span>
                    <span className="italic max-w-[150px] truncate text-right">
                      {activeTech.source}
                    </span>
                  </div>
                </div>

                {/* SECTION 4: ACTIVE TIMER CONTROL (IF RUNNING) */}
                {timerStarted && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#1A1A2E] border-2 border-[#00D9A5] rounded-3xl p-6 flex flex-col items-center justify-center shadow-2xl relative"
                  >
                    {/* Glowing effect inside */}
                    <div className="absolute inset-0 bg-[#00D9A5]/2 rounded-3xl pointer-events-none" />

                    <h4 className="text-[11px] font-headline font-black text-gray-400 uppercase tracking-widest">
                      Séance Active
                    </h4>

                    {/* Massive visual digital timer */}
                    <span className="text-5xl font-mono font-black text-[#00D9A5] tracking-tighter mt-1 block">
                      {formatTimerValue(timerSeconds)}
                    </span>
                    <span className="text-[10px] text-gray-500 font-headline uppercase mt-0.5">
                      temps restant
                    </span>

                    {/* Cycle details column */}
                    <div className="flex flex-col items-center justify-center mt-3 text-center">
                      <span className="text-xs text-gray-300 font-headline font-bold">
                        Cycle {currentCycle} sur 10
                      </span>
                      <span className="text-xs text-[#00D9A5] font-headline font-black uppercase mt-1">
                        Phase : {currentPhase}
                      </span>
                    </div>

                    {/* Linear session Progress Bar */}
                    <div className="w-full h-1.5 bg-black/40 rounded-full mt-4 overflow-hidden relative border border-white/5">
                      <div 
                        className="h-full bg-[#00D9A5] transition-all duration-1000"
                        style={{
                          width: `${(( (selectedDuration === 'custom' ? customDuration : selectedDuration) - timerSeconds ) / (selectedDuration === 'custom' ? customDuration : selectedDuration)) * 100}%`
                        }}
                      />
                    </div>

                    {/* Control Buttons (Pause, Stop) circular */}
                    <div className="flex gap-5 mt-5">
                      {/* Pause Circle button */}
                      <button 
                        onClick={handleTogglePause}
                        className="w-12 h-12 rounded-full bg-[#FF9500] hover:bg-[#FF9500]/90 text-white flex items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer"
                      >
                        {timerPaused ? <Play className="w-5 h-5 fill-white text-white" /> : <Pause className="w-5 h-5 fill-white text-white" />}
                      </button>

                      {/* Stop Circle button */}
                      <button 
                        onClick={handleStopSession}
                        className="w-12 h-12 rounded-full bg-transparent border-2 border-[#FF2D55] hover:bg-[#FF2D55]/10 text-[#FF2D55] flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                      >
                        <Square className="w-5 h-5 fill-[#FF2D55]/20" />
                      </button>
                    </div>

                  </motion.div>
                )}

                {/* SECTION 5: DURATION SELECTOR & START (IF NOT RUNNING) */}
                {!timerStarted && (
                  <div className="space-y-4">
                    
                    {/* Duration pills */}
                    <div className="space-y-2">
                      <label className="text-[11px] text-gray-400 font-headline font-bold uppercase tracking-wider block px-1">
                        Durée de la séance
                      </label>
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => setSelectedDuration(180)}
                          className={`flex-1 py-2 rounded-full text-xs font-headline font-extrabold transition-all cursor-pointer
                            ${selectedDuration === 180 
                              ? 'bg-[#00D9A5] text-[#0F0F1A]' 
                              : 'bg-[#16213E] text-gray-400 hover:text-white'
                            }
                          `}
                        >
                          3 min
                        </button>
                        <button
                          onClick={() => setSelectedDuration(300)}
                          className={`flex-1 py-2 rounded-full text-xs font-headline font-extrabold transition-all cursor-pointer
                            ${selectedDuration === 300 
                              ? 'bg-[#00D9A5] text-[#0F0F1A]' 
                              : 'bg-[#16213E] text-gray-400 hover:text-white'
                            }
                          `}
                        >
                          5 min
                        </button>
                        <button
                          onClick={() => setSelectedDuration(600)}
                          className={`flex-1 py-2 rounded-full text-xs font-headline font-extrabold transition-all cursor-pointer
                            ${selectedDuration === 600 
                              ? 'bg-[#00D9A5] text-[#0F0F1A]' 
                              : 'bg-[#16213E] text-gray-400 hover:text-white'
                            }
                          `}
                        >
                          10 min
                        </button>
                        <button
                          onClick={() => setShowCustomModal(true)}
                          className={`flex-1 py-2 rounded-full text-xs font-headline font-extrabold transition-all cursor-pointer
                            ${selectedDuration === 'custom' 
                              ? 'bg-[#00D9A5] text-[#0F0F1A]' 
                              : 'bg-[#16213E] text-gray-400 hover:text-white'
                            }
                          `}
                        >
                          {selectedDuration === 'custom' ? `${Math.round(customDuration / 60)} min` : "Perso"}
                        </button>
                      </div>
                    </div>

                    {/* Locked warning card if selected but premium locked */}
                    {isPremiumLocked && (
                      <div className="bg-[#FFD700]/5 border border-[#FFD700]/30 rounded-xl p-4 flex flex-col gap-3">
                        <div className="flex items-center gap-2.5">
                          <Lock className="w-5 h-5 text-[#FFD700] flex-shrink-0" />
                          <p className="text-[11px] text-[#FFD700] font-headline leading-tight">
                            Cette technique nécessite un abonnement Premium ou supérieur pour débloquer les exercices neurologiques.
                          </p>
                        </div>
                        <button 
                          onClick={() => {
                            setHasSubscription(true);
                            addToast('success', "Abonnement Premium activé ! Profitez de tous les protocoles. 🚀");
                          }}
                          className="w-full py-1.5 bg-[#FFD700]/10 hover:bg-[#FFD700]/20 text-[#FFD700] rounded-lg text-[10px] font-headline font-black uppercase transition-all"
                        >
                          VOIR LES PLANS (DÉVERROUILLER)
                        </button>
                      </div>
                    )}

                    {/* Master start button */}
                    <button
                      onClick={handleStartSession}
                      disabled={isPremiumLocked}
                      className={`w-full h-15 rounded-2xl flex items-center justify-center gap-3 transition-all font-headline font-black text-sm uppercase tracking-wider
                        ${isPremiumLocked 
                          ? 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-55' 
                          : 'bg-[#00D9A5] text-[#0F0F1A] hover:bg-[#00D9A5]/90 active:scale-98 shadow-[0_8px_32px_rgba(0,217,165,0.25)] cursor-pointer'
                        }
                      `}
                    >
                      <Wind className="w-6 h-6 text-[#0F0F1A]" />
                      DÉMARRER LA SESSION
                    </button>

                    <div className="text-center">
                      <span className="text-[11px] text-gray-500 font-headline">
                        Dernière session : hier, 5 min Box Breathing • 10 cycles
                      </span>
                    </div>

                  </div>
                )}

                {/* SECTION 6: HISTORIQUE & STATS */}
                <div className="space-y-3">
                  <h3 className="text-[13px] font-headline font-black text-[#FFD700] uppercase tracking-wider">
                    Statistiques de Souffle
                  </h3>

                  <div className="bg-[#16213E] border border-white/5 rounded-2xl p-4 space-y-4">
                    
                    {/* Stats cells grid */}
                    <div className="grid grid-cols-3 gap-2.5 text-center">
                      <div className="p-2 bg-black/15 rounded-xl border border-white/5">
                        <span className="text-lg font-mono font-black text-white">{stats.totalSessions}</span>
                        <p className="text-[9px] text-[#8E8E93] font-headline uppercase mt-0.5">sessions</p>
                      </div>
                      <div className="p-2 bg-black/15 rounded-xl border border-white/5">
                        <span className="text-lg font-mono font-black text-white">{stats.totalTime}</span>
                        <p className="text-[9px] text-[#8E8E93] font-headline uppercase mt-0.5">totales</p>
                      </div>
                      <div className="p-2 bg-black/15 rounded-xl border border-white/5">
                        <span className="text-lg font-mono font-black text-[#FF9500]">{stats.streakDays}</span>
                        <p className="text-[9px] text-[#8E8E93] font-headline uppercase mt-0.5">streak</p>
                      </div>
                    </div>

                    {/* Bar Chart Representation (Weekly usage in minutes) */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-gray-400 font-headline font-bold uppercase tracking-wider">
                        minutes de respiration par jour
                      </span>
                      
                      <div className="h-16 flex items-end justify-between px-3 pt-2 bg-black/10 rounded-xl p-2.5">
                        {stats.weeklyData.map((d, idx) => {
                          const barHeight = `${Math.min((d.minutes / 15) * 100, 100)}%`;
                          return (
                            <div key={idx} className="flex flex-col items-center flex-1 group relative">
                              
                              {/* Tooltip on hover */}
                              <div className="absolute bottom-full mb-1 bg-black text-white text-[8px] font-mono p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                                {d.minutes} min<br/>{d.pattern}
                              </div>

                              <div className="h-10 w-4 bg-black/30 rounded-t-xs flex items-end overflow-hidden relative">
                                <motion.div 
                                  initial={{ height: 0 }}
                                  animate={{ height: barHeight }}
                                  transition={{ duration: 0.6, delay: idx * 0.04 }}
                                  className="w-full bg-[#00D9A5]"
                                />
                              </div>
                              <span className="text-[8px] text-gray-500 font-headline mt-1">{d.day}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* List of Recent Sessions */}
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <span className="text-[10px] text-gray-400 font-headline font-bold uppercase tracking-wider block">
                        Dernières Activités
                      </span>
                      
                      <div className="space-y-1.5">
                        {recentSessions.length === 0 ? (
                          <p className="text-[11px] text-gray-500 text-center py-2">Aucune séance récente.</p>
                        ) : (
                          recentSessions.map((session) => (
                            <div 
                              key={session.id} 
                              className="flex items-center justify-between p-2.5 bg-black/10 rounded-xl border border-white/5 text-xs hover:bg-black/20 transition-colors"
                            >
                              <div className="flex items-center gap-2.5">
                                {session.technique.includes("Box") ? <Square className="w-3.5 h-3.5 text-[#00D9A5]" /> 
                                  : session.technique.includes("Wim") ? <Wind className="w-3.5 h-3.5 text-[#4A90D9]" />
                                  : <Moon className="w-3.5 h-3.5 text-[#FFD700]" />}
                                <span className="font-headline font-bold text-white">
                                  {session.technique} • {session.duration} min
                                </span>
                              </div>
                              <span className="text-[10px] text-gray-500 font-headline">
                                {session.date.split(',')[0]}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                  </div>
                </div>

                {/* SECTION 7: CONSEIL SCIENTIFIQUE */}
                <div className="bg-[#1A1A2E] border-l-3 border-[#00D9A5] rounded-r-xl rounded-l-md p-4 flex gap-3 text-left">
                  <Brain className="w-5 h-5 text-[#00D9A5] flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-white font-headline leading-relaxed">
                      💡 La respiration diaphragmatique active le nerf vague, qui contrôle le système nerveux parasympathique. Résultat : calme instantané, régulation instantanée du cortisol, meilleure HRV et concentration ultime.
                    </p>
                    <span className="text-[10px] text-gray-500 font-headline italic mt-1.5 block">
                      Nestor, J. (2020). Breath. Riverhead.
                    </span>
                  </div>
                </div>

              </div>

              {/* BOTTOM SAFETY GAP */}
              <div className="h-6" />

            </div>
          </div>
        </div>

      </div>

      {/* SCIENCE SHEET MODAL BOTTOMSHEET EMULATION */}
      <AnimatePresence>
        {showScienceSheet && (
          <div className="fixed inset-0 bg-black/70 flex items-end justify-center z-50 p-4">
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-[#111124] border-t border-x border-[#1C1C3A] rounded-t-[32px] w-full max-w-md p-6 relative text-left"
            >
              <button 
                onClick={() => setShowScienceSheet(false)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/30 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#00D9A5]/10 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-[#00D9A5]" />
                </div>
                <div>
                  <h3 className="text-md font-headline font-black text-white">Science du Souffle</h3>
                  <p className="text-[11px] text-gray-400">Pilier #5 de la Vitalité Masculine</p>
                </div>
              </div>

              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1 text-xs text-gray-300 leading-relaxed custom-scrollbar">
                <p>
                  La respiration est la seule fonction du système nerveux autonome sur laquelle nous possédons un contrôle conscient direct. En modifiant volontairement notre rythme respiratoire, nous pouvons court-circuiter l'amygdale et commander au cerveau de calmer le jeu ou d'augmenter sa vigilance.
                </p>

                <div className="bg-black/20 p-3 rounded-xl border border-white/5 space-y-2">
                  <h4 className="font-headline font-extrabold text-[#00D9A5] uppercase text-[10px]">1. Box Breathing (Calme de combat)</h4>
                  <p className="text-[11px] text-gray-400">
                    Utilisé par les forces spéciales (Navy SEALs, GIGN). Le ratio symétrique bloque la panique en forçant le rythme cardiaque à descendre sous 70 bpm tout en préservant l'attention visuelle maximale.
                  </p>
                </div>

                <div className="bg-black/20 p-3 rounded-xl border border-white/5 space-y-2">
                  <h4 className="font-headline font-extrabold text-[#4A90D9] uppercase text-[10px]">2. Wim Hof Method (Hypocapnie contrôlée)</h4>
                  <p className="text-[11px] text-gray-400">
                    Une hyperventilation contrôlée de 30 cycles qui chasse le CO2 sanguin, provoquant une alcalinisation passagère et une libération d'adrénaline. Réduit l'inflammation globale et renforce l'immunité innée.
                  </p>
                </div>

                <div className="bg-black/20 p-3 rounded-xl border border-white/5 space-y-2">
                  <h4 className="font-headline font-extrabold text-[#FFD700] uppercase text-[10px]">3. 4-7-8 (Sommeil profond)</h4>
                  <p className="text-[11px] text-gray-400">
                    Développé par le Dr Andrew Weil. L'expiration de 8 secondes force une stimulation parasympathique puissante via le nerf vague, chassant le stress résiduel accumulé en fin de journée.
                  </p>
                </div>

                <p className="text-[10px] text-gray-500 italic">
                  Sources et lectures : James Nestor (Breath: The New Science of a Lost Art), publications Harvard Medical School sur la HRV et l'anxiété.
                </p>
              </div>

              <div className="mt-6 pt-2">
                <AlphaButton 
                  variant="primary" 
                  className="w-full"
                  onClick={() => setShowScienceSheet(false)}
                >
                  Compris
                </AlphaButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CUSTOM DURATION DIALOG MODAL */}
      <AnimatePresence>
        {showCustomModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#111124] border border-[#1C1C3A] rounded-3xl w-full max-w-sm p-6 relative text-left"
            >
              <button 
                onClick={() => setShowCustomModal(false)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/30 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-sm font-headline font-black text-white uppercase tracking-wider mb-2">
                Durée Personnalisée
              </h3>
              <p className="text-[11px] text-gray-400 mb-4">
                Calibrez la séance de respiration à vos exigences.
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between font-mono text-xs">
                    <span className="text-gray-400">Durée cible</span>
                    <span className="text-[#00D9A5] font-bold">{Math.round(customDuration / 60)} minutes ({customDuration}s)</span>
                  </div>
                  <input 
                    type="range" 
                    min="60" 
                    max="1800" 
                    step="60"
                    value={customDuration}
                    onChange={(e) => setCustomDuration(parseInt(e.target.value))}
                    className="w-full accent-[#00D9A5] h-1.5 bg-gray-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      setSelectedDuration('custom');
                      setShowCustomModal(false);
                      addToast('success', `Durée réglée à ${Math.round(customDuration / 60)} minutes.`);
                    }}
                    className="flex-1 h-10 bg-[#00D9A5] text-[#0F0F1A] rounded-xl text-xs font-headline font-black uppercase transition-all hover:bg-[#00D9A5]/90 cursor-pointer"
                  >
                    Valider
                  </button>
                  <button
                    onClick={() => setShowCustomModal(false)}
                    className="flex-1 h-10 bg-gray-800 text-gray-400 hover:text-white rounded-xl text-xs font-headline font-black uppercase transition-all cursor-pointer"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
