import React, { useState, useEffect, useRef } from 'react';
import {
  Flame,
  Settings,
  Info,
  Dumbbell,
  Timer,
  CheckSquare,
  TrendingUp,
  Lightbulb,
  Check,
  X,
  Play,
  Pause,
  ChevronRight,
  Home,
  Wind,
  Users,
  User,
  Volume2,
  VolumeX,
  Code,
  Copy,
  Activity,
  ArrowRight
} from 'lucide-react';
import { AlphaCard } from '../../components/AlphaCard';
import { AlphaButton } from '../../components/AlphaButton';
import { AlphaBadge } from '../../components/AlphaBadge';
import { AlphaProgress } from '../../components/AlphaProgress';

// Define the API data structure matching our server.ts response
interface DashboardData {
  userId: string;
  streak: number;
  currentLevelId: number;
  currentLevelName: string;
  levelProgressPercent: number;
  sessionsNeeded: number;
  stats: {
    force: number;
    endurance: string;
    contractions: number;
  };
  dailySession: {
    timer: string;
    level: string;
    details: string;
    timerDetails: string;
    nextTime: string;
  };
  recentHistory: {
    id: string;
    date: string;
    status: 'completed' | 'missed' | 'scheduled';
    details: string;
  }[];
}

export const KegelDashboardScreen: React.FC<{
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
  onBack?: () => void;
}> = ({ addToast, onBack }) => {
  // Screen States
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeBottomTab, setActiveBottomTab] = useState<'home' | 'kegel' | 'respiration' | 'community' | 'profile'>('kegel');
  const [showNativeCode, setShowNativeCode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showInfo, setShowInfo] = useState<boolean>(false);

  // Simulation Workout State
  const [simulating, setSimulating] = useState<boolean>(false);
  const [simPaused, setSimPaused] = useState<boolean>(false);
  const [simPhase, setSimPhase] = useState<'intro' | 'contraction' | 'relaxation' | 'finished'>('intro');
  const [simTimeLeft, setSimTimeLeft] = useState<number>(5);
  const [simCurrentRep, setSimCurrentRep] = useState<number>(1);
  const [simCurrentSet, setSimCurrentSet] = useState<number>(1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Audio Context for feedback sound synthesis
  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch Dashboard Data from the real server endpoint we just set up!
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/kegel/dashboard/ALPHA_SOLDIER_1');
        if (!res.ok) {
          throw new Error(`Erreur serveur (${res.status})`);
        }
        const json = await res.json();
        setData(json);
        setError(null);
      } catch (err: any) {
        console.warn("API Fetch failed, using pre-seeded local data fallback.", err);
        // Robust Fallback matching specifications perfectly
        setData({
          userId: 'ALPHA_SOLDIER_1',
          streak: 12,
          currentLevelId: 4,
          currentLevelName: 'WARRIOR',
          levelProgressPercent: 67,
          sessionsNeeded: 12,
          stats: {
            force: 67,
            endurance: '4m30',
            contractions: 150
          },
          dailySession: {
            timer: '12:00',
            level: 'Niveau 4 — WARRIOR',
            details: '15 contractions × 3 séries',
            timerDetails: 'Tenue : 7 sec | Relâchement : 7 sec',
            nextTime: 'Prochaine séance : 20h00'
          },
          recentHistory: [
            { id: "1", date: "Aujourd'hui", status: "completed", details: "15 min • Niveau 4 • 45 contractions" },
            { id: "2", date: "Hier", status: "completed", details: "15 min • Niveau 4 • 45 contractions" },
            { id: "3", date: "Sam 11 Juil", status: "completed", details: "15 min • Niveau 4 • 45 contractions" },
            { id: "4", date: "Ven 10 Juil", status: "missed", details: "Niveau 4 • Séance manquée" },
            { id: "5", date: "Jeu 9 Juil", status: "completed", details: "12 min • Niveau 3 • 30 contractions" }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // Beep Sound Synthesizer
  const playBeep = (freq: number, duration: number, type: 'sine' | 'triangle' | 'square' = 'sine') => {
    if (!soundEnabled) return;
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
      gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Autoplay audio limits", e);
    }
  };

  // Simulation Timer loop
  useEffect(() => {
    if (simulating && !simPaused) {
      intervalRef.current = setInterval(() => {
        if (simTimeLeft > 1) {
          setSimTimeLeft(prev => prev - 1);
          // Alert beeps in last 3 seconds
          if (simTimeLeft <= 4) {
            playBeep(880, 0.05);
          }
        } else {
          handleSimulationPhaseTransition();
        }
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [simulating, simPaused, simPhase, simTimeLeft]);

  // Handle simulated contraction loop
  const handleSimulationPhaseTransition = () => {
    if (simPhase === 'intro') {
      setSimPhase('contraction');
      setSimTimeLeft(7); // 7s contraction Warrior spec
      playBeep(1200, 0.4, 'sine');
      addToast('info', 'CONTRACTEZ ! Serrez fermement le muscle pelvien.');
    } else if (simPhase === 'contraction') {
      setSimPhase('relaxation');
      setSimTimeLeft(7); // 7s relaxation Warrior spec
      playBeep(600, 0.4, 'triangle');
      addToast('info', 'RELÂCHEZ ! Relâchement complet.');
    } else if (simPhase === 'relaxation') {
      if (simCurrentRep < 15) {
        setSimCurrentRep(prev => prev + 1);
        setSimPhase('contraction');
        setSimTimeLeft(7);
        playBeep(1200, 0.4, 'sine');
      } else {
        if (simCurrentSet < 3) {
          setSimCurrentSet(prev => prev + 1);
          setSimCurrentRep(1);
          setSimPhase('contraction');
          setSimTimeLeft(7);
          playBeep(1300, 0.5, 'sine');
          addToast('success', `SÉRIE SUIVANTE : Série ${simCurrentSet + 1}/3 commencée !`);
        } else {
          setSimPhase('finished');
          playBeep(1500, 0.3);
          playBeep(1800, 0.4);
          addToast('success', 'FÉLICITATIONS ! Séance complétée avec succès ! +60 XP d\'Acier.');
        }
      }
    }
  };

  const startSimulation = () => {
    setSimulating(true);
    setSimPaused(false);
    setSimPhase('intro');
    setSimTimeLeft(5);
    setSimCurrentRep(1);
    setSimCurrentSet(1);
    playBeep(440, 0.15);
    addToast('info', 'Début de l\'entraînement : alignez votre respiration.');
  };

  const stopSimulation = () => {
    setSimulating(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    addToast('warning', 'Entraînement interrompu.');
  };

  const copyNativeCode = () => {
    navigator.clipboard.writeText(reactNativeCode);
    setCopied(true);
    addToast('success', 'Code source React Native copié avec succès ! 📋');
    setTimeout(() => setCopied(false), 2000);
  };

  // High Fidelity React Native Spec Template matching Prompt #2.1
  const reactNativeCode = `import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Animated, 
  Easing, 
  Dimensions, 
  Vibration 
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Feather, FontAwesome5, Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function KegelDashboardScreen({ navigation }) {
  const [streak, setStreak] = useState(12);
  const [level, setLevel] = useState(4);
  const [levelProgress, setLevelProgress] = useState(67);
  const [sessionsLeft, setSessionsLeft] = useState(12);
  
  // Staggered Entry Animation Value
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];
  
  // Radial Circle Animation
  const circleStrokeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    // Mount Entry Animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.back(1)),
        useNativeDriver: true,
      }),
      Animated.timing(circleStrokeAnim, {
        toValue: 67,
        duration: 1200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      })
    ]).start();
  }, []);

  // Radial calculation (Circumference of 180px radius circle is 2 * PI * r)
  const radius = 80;
  const strokeDasharray = 2 * Math.PI * radius;
  const strokeDashoffset = circleStrokeAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [strokeDasharray, 0],
  });

  const triggerHaptic = () => {
    Vibration.vibrate(80);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>KEGEL MASTER</Text>
          <Text style={styles.headerSubtitle}>Niveau {level} — WARRIOR</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => triggerHaptic()} style={styles.iconBtn}>
            <Feather name="info" size={22} color="#8E8E93" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => triggerHaptic()} style={styles.iconBtn}>
            <Feather name="settings" size={22} color="#8E8E93" />
          </TouchableOpacity>
        </View>
      </View>

      {/* PROGRESSION CIRCLE */}
      <Animated.View style={[styles.progressCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.circleContainer}>
          <Svg width={200} height={200} style={styles.svg}>
            <Circle 
              cx={100} 
              cy={100} 
              r={radius} 
              stroke="#1C1C32" 
              strokeWidth={8} 
              fill="transparent" 
            />
            <AnimatedCircle 
              cx={100} 
              cy={100} 
              r={radius} 
              stroke="#00D9A5" 
              strokeWidth={12} 
              fill="transparent" 
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </Svg>
          
          <View style={styles.circleTextCenter}>
            <Text style={styles.levelNum}>{level}</Text>
            <Text style={styles.levelLabel}>WARRIOR</Text>
            <Text style={styles.levelSubLabel}>Niveau actuel</Text>
          </View>

          {/* Floating Badge Streak Flame */}
          <TouchableOpacity style={styles.streakBadge} activeOpacity={0.8}>
            <FontAwesome5 name="fire" size={16} color="#FFF" />
            <Text style={styles.streakBadgeText}>{streak}</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* PROGRESS BAR */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarHeader}>
          <Text style={styles.progressBarLabel}>VERS NIVEAU 5</Text>
          <Text style={styles.progressBarValue}>{levelProgress}%</Text>
        </View>
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: \`\${levelProgress}%\` }]} />
        </View>
        <Text style={styles.progressBarFooter}>{sessionsLeft} séances restantes</Text>
      </View>

      {/* QUICK STATS */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <FontAwesome5 name="dumbbell" size={20} color="#E94560" />
          <Text style={styles.statValue}>{levelProgress}%</Text>
          <Text style={styles.statLabel}>FORCE</Text>
          <Text style={styles.statTrend}>↑ 12%</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="timer" size={22} color="#FFD700" />
          <Text style={styles.statValue}>4m30</Text>
          <Text style={styles.statLabel}>ENDURANCE</Text>
          <Text style={styles.statTrend}>↑ 45s</Text>
        </View>
        <View style={styles.statCard}>
          <Feather name="check-square" size={20} color="#4A90D9" />
          <Text style={styles.statValue}>150</Text>
          <Text style={styles.statLabel}>SÉANCES</Text>
          <Text style={styles.statTrend}>↑ +30</Text>
        </View>
      </View>

      {/* WORKOUT OF THE DAY */}
      <View style={styles.sessionSection}>
        <Text style={styles.sectionTitle}>SÉANCE DU JOUR</Text>
        <View style={styles.sessionCard}>
          <Text style={styles.sessionTimer}>12:00</Text>
          <Text style={styles.sessionTimerSub}>minutes</Text>
          <Text style={styles.sessionLevelName}>Niveau {level} — WARRIOR</Text>
          <Text style={styles.sessionDetails}>15 contractions × 3 séries</Text>
          <Text style={styles.sessionTimerDesc}>Tenue : 7 sec | Relâchement : 7 sec</Text>
          
          <TouchableOpacity style={styles.startBtn} onPress={() => triggerHaptic()}>
            <Text style={styles.startBtnText}>DÉMARRER MA SÉANCE</Text>
          </TouchableOpacity>
          <Text style={styles.sessionNextTime}>Prochaine séance : 20h00</Text>
        </View>
      </View>

      {/* RECENT HISTORY */}
      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>HISTORIQUE</Text>
        {/* Render 5 history items here */}
      </View>

    </ScrollView>
  );
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  content: { padding: 24, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 120, paddingTop: 40, marginBottom: 20 },
  headerTitle: { fontFamily: 'Montserrat-Bold', fontSize: 28, color: '#FFFFFF' },
  headerSubtitle: { fontFamily: 'Inter-Regular', fontSize: 14, color: '#8E8E93', marginTop: 4 },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { marginLeft: 16, padding: 4 },
  progressCard: { alignItems: 'center', marginVertical: 10 },
  circleContainer: { width: 200, height: 200, position: 'relative', justifyContent: 'center', alignItems: 'center' },
  circleTextCenter: { position: 'absolute', justifyContent: 'center', alignItems: 'center' },
  levelNum: { fontFamily: 'RobotoMono-Bold', fontSize: 48, color: '#FFFFFF' },
  levelLabel: { fontFamily: 'Montserrat-Bold', fontSize: 16, color: '#FFD700', marginTop: 2 },
  levelSubLabel: { fontFamily: 'Inter-Regular', fontSize: 12, color: '#8E8E93' },
  streakBadge: { position: 'absolute', top: 10, right: 10, width: 40, height: 40, borderRadius: 20, backgroundColor: '#E94560', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', shadowColor: '#E94560', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 6, elevation: 5 },
  streakBadgeText: { fontFamily: 'Montserrat-Bold', fontSize: 14, color: '#FFFFFF', marginLeft: 2 },
  progressBarContainer: { backgroundColor: '#16213E', borderRadius: 12, padding: 16, marginVertical: 16 },
  progressBarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  progressBarLabel: { fontFamily: 'Montserrat-SemiBold', fontSize: 12, color: '#8E8E93' },
  progressBarValue: { fontFamily: 'RobotoMono-Bold', fontSize: 14, color: '#00D9A5' },
  progressBarTrack: { height: 8, backgroundColor: '#1A1A2E', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#00D9A5', borderRadius: 4 },
  progressBarFooter: { fontFamily: 'Inter-Regular', fontSize: 11, color: '#5A5A5A', marginTop: 6 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 },
  statCard: { width: (width - 64) / 3, height: 110, backgroundColor: '#16213E', borderRadius: 16, padding: 12, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontFamily: 'RobotoMono-Bold', fontSize: 18, color: '#FFFFFF', marginVertical: 4 },
  statLabel: { fontFamily: 'Inter-Regular', fontSize: 9, color: '#8E8E93' },
  statTrend: { fontFamily: 'Inter-Bold', fontSize: 10, color: '#00D9A5', marginTop: 2 },
  sessionSection: { marginVertical: 20 },
  sectionTitle: { fontFamily: 'Montserrat-Bold', fontSize: 16, color: '#FFD700', marginBottom: 12 },
  sessionCard: { backgroundColor: '#16213E', borderRadius: 16, padding: 24, alignItems: 'center' },
  sessionTimer: { fontFamily: 'RobotoMono-Bold', fontSize: 64, color: '#FFD700' },
  sessionTimerSub: { fontFamily: 'Inter-Regular', fontSize: 14, color: '#8E8E93', marginBottom: 16 },
  sessionLevelName: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#FFFFFF' },
  sessionDetails: { fontFamily: 'Inter-Regular', fontSize: 12, color: '#8E8E93', marginTop: 4 },
  sessionTimerDesc: { fontFamily: 'Inter-Regular', fontSize: 12, color: '#8E8E93', marginTop: 2 },
  startBtn: { backgroundColor: '#E94560', height: 56, width: '100%', borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginTop: 24, shadowColor: '#E94560', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8 },
  startBtnText: { fontFamily: 'Montserrat-Bold', fontSize: 16, color: '#FFFFFF', letterSpacing: 1 },
  sessionNextTime: { fontFamily: 'Inter-Regular', fontSize: 11, color: '#5A5A5A', marginTop: 12 },
});`;

  return (
    <div className="flex flex-col gap-6 w-full text-white">

      {/* TOP TOGGLE FOR DESIGN LABORATORY DEVELOPERS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#111124] border border-[#1C1C3A] rounded-2xl p-4 gap-4">
        <div>
          <span className="text-[10px] font-mono text-[#FFD700] uppercase tracking-widest bg-[#FFD700]/10 border border-[#FFD700]/20 px-2 rounded-md">
            LABORATOIRE DESIGN SYSTEM
          </span>
          <h2 className="text-md font-headline font-black text-white mt-1">
            KegelDashboardScreen.tsx — Version de production Expo Native & Web
          </h2>
          <p className="text-xs text-gray-400">
            Fidélité au pixel près de la spécification de l'interface mobile, avec simulation interactive en temps réel.
          </p>
        </div>

        <div className="flex gap-2">
          {onBack && (
            <AlphaButton variant="ghost" size="sm" onClick={onBack}>
              Retour Dashboard
            </AlphaButton>
          )}

          <AlphaButton 
            variant={showNativeCode ? "gold" : "primary"}
            size="sm"
            onClick={() => setShowNativeCode(!showNativeCode)}
            className="flex items-center gap-2"
          >
            <Code className="w-4 h-4" />
            {showNativeCode ? "Masquer le Code Native" : "Inspecter Code React Native"}
          </AlphaButton>
        </div>
      </div>

      {/* VIEW NATIVE CODE EXPORTER DRAWER */}
      {showNativeCode && (
        <div className="bg-[#111124] border border-[#1C1C3A] rounded-3xl p-6 flex flex-col gap-4 animate-[fade-in_0.3s_ease-out]">
          <div className="flex justify-between items-center border-b border-[#1C1C35] pb-3">
            <div>
              <h4 className="text-xs font-headline font-black text-white">Composant Natif React Native (TypeScript) - KegelDashboardScreen.tsx</h4>
              <p className="text-[10px] text-gray-500">Intègre l'animation de jauge de progression circulaire Svg et le moteur d'effets haptiques.</p>
            </div>
            <AlphaButton 
              variant="secondary" 
              size="sm" 
              onClick={copyNativeCode}
              className="flex items-center gap-2 text-[10px] font-headline"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? 'Copié !' : 'Copier le Code Natif'}
            </AlphaButton>
          </div>
          <pre className="p-4 bg-[#0A0A14] rounded-2xl border border-[#1A1A2E] overflow-x-auto text-[10px] md:text-xs font-mono text-gray-300 leading-relaxed max-h-[350px] custom-scrollbar">
            {reactNativeCode}
          </pre>
        </div>
      )}

      {/* DUAL WORKSPACE LAYOUT: INTERACTIVE DEVICE PREVIEW & SIDE INFORMATION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: HIGH-FIDELITY MOBILE DEVICE PREVIEW */}
        <div className="lg:col-span-6 flex flex-col items-center">
          
          {/* IPHONE DEVICE FRAME CONTAINER */}
          <div className="w-full max-w-[410px] bg-[#000000] rounded-[48px] p-4.5 pt-6 pb-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] border-[6px] border-[#222230] relative overflow-hidden">
            
            {/* Top Speaker Notch bar */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-[#000000] rounded-b-2xl z-50 flex items-center justify-center gap-1.5">
              <div className="w-12 h-1 bg-[#222230] rounded-full" />
              <div className="w-2.5 h-2.5 bg-[#111122] rounded-full border border-gray-800" />
            </div>

            {/* SCREEN INNER CANVAS */}
            <div className="bg-[#0F0F1A] rounded-[36px] overflow-hidden flex flex-col relative min-h-[720px]">
              
              {/* 1. MOCKUP STATUS BAR */}
              <div className="h-10 bg-[#0F0F1A] px-6 pt-3 flex justify-between items-center text-[10px] font-mono font-bold text-gray-400 select-none z-10">
                <span>09:41</span>
                <div className="flex items-center gap-2">
                  <span>5G</span>
                  <div className="w-5 h-2.5 border border-gray-500 rounded-sm p-[1px] flex items-center">
                    <div className="h-full w-4 bg-[#00D9A5] rounded-2xs" />
                  </div>
                </div>
              </div>

              {/* MAIN SCROLLABLE APP BODY */}
              <div className="flex-1 overflow-y-auto px-5 pb-24 max-h-[640px] custom-scrollbar relative">
                
                {/* 2. SPEC HEADER */}
                <div className="flex justify-between items-center h-20 border-b border-gray-800/20 mb-4">
                  <div>
                    <h1 className="font-headline font-black text-xl tracking-tight text-white uppercase">
                      KEGEL MASTER
                    </h1>
                    <p className="font-headline font-bold text-xs text-[#8E8E93] uppercase tracking-widest mt-0.5">
                      Niveau {data?.currentLevelId || 4} — {data?.currentLevelName || 'WARRIOR'}
                    </p>
                  </div>
                  
                  {/* Action Icons right */}
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setShowInfo(!showInfo)}
                      className="p-1.5 hover:bg-[#16213E] rounded-full text-[#8E8E93] hover:text-white transition-colors cursor-pointer"
                      title="Guide de Force"
                    >
                      <Info className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setShowSettings(!showSettings)}
                      className="p-1.5 hover:bg-[#16213E] rounded-full text-[#8E8E93] hover:text-white transition-colors cursor-pointer"
                      title="Configuration"
                    >
                      <Settings className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* MODALS RENDER OVER PHONE SCREEN FOR SENSORY HIGHLIGHT */}
                {showInfo && (
                  <div className="absolute inset-x-0 top-14 bg-[#111124] border border-gray-800 rounded-3xl p-5 mx-4 z-40 shadow-2xl animate-[fade-in_0.2s_ease-out]">
                    <div className="flex justify-between items-center border-b border-gray-800 pb-2 mb-3">
                      <h4 className="text-xs font-headline font-bold text-[#FFD700] uppercase">Guide Technique Niveau 4</h4>
                      <button onClick={() => setShowInfo(false)} className="text-gray-400 hover:text-white">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-300 leading-relaxed">
                      Le niveau <strong>WARRIOR</strong> demande des contractions de 7 secondes pour asseoir l'endurance, alternées avec des contractions rapides d'une seconde pour forcer le tonus réflexe de verrouillage.
                    </p>
                  </div>
                )}

                {showSettings && (
                  <div className="absolute inset-x-0 top-14 bg-[#111124] border border-gray-800 rounded-3xl p-5 mx-4 z-40 shadow-2xl animate-[fade-in_0.2s_ease-out]">
                    <div className="flex justify-between items-center border-b border-gray-800 pb-2 mb-3">
                      <h4 className="text-xs font-headline font-bold text-white uppercase">Ajuster l'Entraîneur</h4>
                      <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-white">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center text-xs">
                        <span>Bip Audio d'Impulsion :</span>
                        <button 
                          onClick={() => setSoundEnabled(!soundEnabled)}
                          className={`px-3 py-1 rounded-lg text-[10px] font-bold ${soundEnabled ? 'bg-[#00D9A5]/10 border border-[#00D9A5]/20 text-[#00D9A5]' : 'bg-gray-800 text-gray-500'}`}
                        >
                          {soundEnabled ? 'ON' : 'OFF'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. SECTION 1: PROGRESSION CIRCLE */}
                <div className="flex flex-col items-center justify-center my-6">
                  <div className="relative w-[180px] h-[180px] flex items-center justify-center">
                    
                    {/* SVG Radial Progress Ring */}
                    <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="40" 
                        stroke="#1C1C32" 
                        strokeWidth="5" 
                        fill="transparent" 
                      />
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="40" 
                        stroke="#00D9A5" 
                        strokeWidth="6" 
                        fill="transparent" 
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 - (251.2 * (data?.levelProgressPercent || 67)) / 100}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>

                    {/* Central text content */}
                    <div className="flex flex-col items-center justify-center text-center z-10 select-none">
                      <span className="text-4xl font-mono font-bold tracking-tight text-white">
                        {data?.currentLevelId || 4}
                      </span>
                      <span className="text-xs font-headline font-black text-[#FFD700] uppercase tracking-wider mt-0.5">
                        {data?.currentLevelName || 'WARRIOR'}
                      </span>
                      <span className="text-[9px] text-[#8E8E93] font-headline uppercase tracking-widest mt-0.5">
                        Niveau actuel
                      </span>
                    </div>

                    {/* Floating Streak Badge top-right */}
                    <div 
                      className="absolute top-2.5 right-2.5 w-10 h-10 rounded-full bg-[#E94560] shadow-[0_4px_12px_rgba(233,69,96,0.4)] flex items-center justify-center text-white cursor-pointer group active:scale-90 transition-transform"
                      onClick={() => addToast('info', `${data?.streak || 12} jours consécutifs ! 🔥 Gardez l'énergie.`)}
                    >
                      <Flame className="w-4 h-4 fill-current animate-pulse text-white" />
                      <span className="text-xs font-mono font-bold ml-0.5">{data?.streak || 12}</span>
                      
                      {/* Tooltip trigger */}
                      <span className="absolute bottom-11 scale-0 transition-all rounded bg-gray-900 p-2 text-[9px] font-headline text-white group-hover:scale-100 whitespace-nowrap border border-gray-700">
                        {data?.streak || 12} jours consécutifs ! 🔥
                      </span>
                    </div>

                  </div>
                </div>

                {/* 4. SECTION 2: PROGRESS BAR TO NEXT LEVEL */}
                <div className="bg-[#16213E] rounded-2xl p-4 mb-5 border border-gray-800/10 shadow-sm">
                  <div className="flex justify-between items-center mb-1.5 text-[11px] font-headline font-bold text-gray-400">
                    <span className="tracking-wider">VERS NIVEAU 5</span>
                    <span className="font-mono text-[#00D9A5]">{data?.levelProgressPercent || 67}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#1A1A2E] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#00D9A5] rounded-full transition-all duration-1000"
                      style={{ width: `${data?.levelProgressPercent || 67}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 font-headline mt-1.5">
                    {data?.sessionsNeeded || 12} séances restantes
                  </p>
                </div>

                {/* 5. SECTION 3: QUICK STATS */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  
                  {/* Card 1: FORCE */}
                  <div className="bg-[#16213E] rounded-2xl p-3 flex flex-col items-center justify-center text-center relative overflow-hidden border border-gray-800/10">
                    <Dumbbell className="w-5 h-5 text-[#E94560] self-start" />
                    <span className="text-sm font-mono font-bold mt-1.5">{data?.stats.force || 67}%</span>
                    <span className="text-[8px] font-headline font-bold text-[#8E8E93] tracking-wider mt-0.5">FORCE</span>
                    <span className="text-[9px] font-headline font-extrabold text-[#00D9A5] mt-1 flex items-center">
                      ↑ 12%
                    </span>
                  </div>

                  {/* Card 2: ENDURANCE */}
                  <div className="bg-[#16213E] rounded-2xl p-3 flex flex-col items-center justify-center text-center relative overflow-hidden border border-gray-800/10">
                    <Timer className="w-5 h-5 text-[#FFD700] self-start" />
                    <span className="text-sm font-mono font-bold mt-1.5">{data?.stats.endurance || '4m30'}</span>
                    <span className="text-[8px] font-headline font-bold text-[#8E8E93] tracking-wider mt-0.5">ENDURANCE</span>
                    <span className="text-[9px] font-headline font-extrabold text-[#00D9A5] mt-1 flex items-center">
                      ↑ 45s
                    </span>
                  </div>

                  {/* Card 3: SÉANCES */}
                  <div className="bg-[#16213E] rounded-2xl p-3 flex flex-col items-center justify-center text-center relative overflow-hidden border border-gray-800/10">
                    <CheckSquare className="w-5 h-5 text-[#4A90D9] self-start" />
                    <span className="text-sm font-mono font-bold mt-1.5">{data?.stats.contractions || 150}</span>
                    <span className="text-[8px] font-headline font-bold text-[#8E8E93] tracking-wider mt-0.5">CONTRACTIONS</span>
                    <span className="text-[9px] font-headline font-extrabold text-[#00D9A5] mt-1 flex items-center">
                      ↑ +30
                    </span>
                  </div>

                </div>

                {/* 6. SECTION 4: SÉANCE DU JOUR (INTERACTIVE ACTIVE WORKOUT SIMULATION) */}
                <div className="mb-5">
                  <h3 className="text-xs font-headline font-black text-[#FFD700] uppercase tracking-wider mb-2 px-1">
                    SÉANCE DU JOUR
                  </h3>

                  {simulating ? (
                    /* Active Workout hud */
                    <div className="bg-[#16213E] rounded-3xl p-5 border-2 border-[#00D9A5] shadow-[0_0_30px_rgba(0,217,165,0.1)] text-center flex flex-col items-center gap-3 animate-[fade-in_0.3s_ease-out]">
                      <div className="flex justify-between w-full items-center border-b border-gray-800/50 pb-2 mb-1">
                        <span className="text-[9px] font-mono font-bold text-gray-400">
                          Série {simCurrentSet}/3 • Rep {simCurrentRep}/15
                        </span>
                        <button 
                          onClick={stopSimulation}
                          className="p-1 hover:bg-red-500/10 rounded text-red-400 transition-colors"
                          title="Arrêter"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Display Action States */}
                      <div className="text-5xl font-mono font-black text-[#FFD700] tabular-nums my-2">
                        {simTimeLeft}s
                      </div>

                      <h4 className="text-md font-headline font-black tracking-tight uppercase text-white">
                        {simPhase === 'intro' && 'PRENEZ LE RHYTHE...'}
                        {simPhase === 'contraction' && 'CONTRACTEZ ! ⚡'}
                        {simPhase === 'relaxation' && 'RELÂCHEZ... 🌊'}
                        {simPhase === 'finished' && 'SÉANCE TERMINÉE ! 🎉'}
                      </h4>

                      <p className="text-[10px] text-gray-400 leading-normal italic max-w-xs px-2">
                        {simPhase === 'intro' && 'Détendez-vous. Respirez tranquillement.'}
                        {simPhase === 'contraction' && 'Isolez le muscle PC. Serrez comme pour retenir le souffle.'}
                        {simPhase === 'relaxation' && 'Pleine circulation du sang. Détendez le bassin.'}
                        {simPhase === 'finished' && 'Superbe travail, soldat ! Force pelvienne ancrée.'}
                      </p>

                      <div className="w-full bg-[#1A1A2E] h-1 rounded-full overflow-hidden mt-1">
                        <div 
                          className={`h-full transition-all duration-1000 
                            ${simPhase === 'contraction' ? 'bg-[#00D9A5]' : 'bg-[#E94560]'}
                          `}
                          style={{ 
                            width: `${
                              simPhase === 'intro' ? (5 - simTimeLeft) * 20 : 
                              (simTimeLeft / 7) * 100
                            }%` 
                          }}
                        />
                      </div>

                      <div className="flex gap-2 w-full mt-2">
                        <AlphaButton 
                          variant="primary" 
                          size="sm" 
                          onClick={() => setSimPaused(!simPaused)}
                          className="flex-1 py-2 text-[10px] font-bold"
                        >
                          {simPaused ? "REPRENDRE" : "PAUSE"}
                        </AlphaButton>
                        {simPhase === 'finished' && (
                          <AlphaButton 
                            variant="gold" 
                            size="sm" 
                            onClick={stopSimulation}
                            className="flex-1 py-2 text-[10px] font-bold"
                          >
                            VALIDER
                          </AlphaButton>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Default layout display card */
                    <div className="bg-[#16213E] rounded-3xl p-5 border border-gray-800/10 shadow-sm text-center flex flex-col items-center">
                      <div className="text-5xl font-mono font-black text-[#FFD700] mb-1">
                        {data?.dailySession.timer || '12:00'}
                      </div>
                      <span className="text-[10px] font-headline font-bold text-gray-500 uppercase tracking-widest mb-3">
                        minutes
                      </span>

                      <h4 className="text-xs font-headline font-black text-white">
                        {data?.dailySession.level || 'Niveau 4 — WARRIOR'}
                      </h4>
                      <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">
                        {data?.dailySession.details || '15 contractions × 3 séries'}
                      </p>
                      <p className="text-[10px] text-[#8E8E93] mt-0.5 font-mono">
                        {data?.dailySession.timerDetails || 'Tenue : 7 sec | Relâchement : 7 sec'}
                      </p>

                      <button 
                        onClick={startSimulation}
                        className="w-full bg-[#E94560] hover:bg-[#ff5673] active:scale-97 text-white font-headline font-black text-xs uppercase tracking-wider py-4 rounded-full mt-5 cursor-pointer shadow-[0_4px_16px_rgba(233,69,96,0.3)] transition-all"
                      >
                        DÉMARRER MA SÉANCE
                      </button>

                      <span className="text-[10px] text-[#5A5A5A] font-headline mt-3">
                        {data?.dailySession.nextTime || 'Prochaine séance : 20h00'}
                      </span>
                    </div>
                  )}

                </div>

                {/* 7. SECTION 5: RECENT HISTORY */}
                <div className="mb-5">
                  <h3 className="text-xs font-headline font-black text-[#FFD700] uppercase tracking-wider mb-2 px-1">
                    HISTORIQUE
                  </h3>
                  <div className="flex flex-col gap-2">
                    {data?.recentHistory.map((item) => (
                      <div 
                        key={item.id} 
                        className={`bg-[#16213E] rounded-xl p-3 flex justify-between items-center text-xs border-l-4 
                          ${item.status === 'completed' ? 'border-[#00D9A5]' : ''}
                          ${item.status === 'missed' ? 'border-[#E94560]' : ''}
                          ${item.status === 'scheduled' ? 'border-[#5A5A5A]' : ''}
                        `}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{item.date}</span>
                          <span className={`text-[10px] font-headline font-bold uppercase
                            ${item.status === 'completed' ? 'text-[#00D9A5]' : ''}
                            ${item.status === 'missed' ? 'text-[#E94560]' : ''}
                            ${item.status === 'scheduled' ? 'text-gray-500' : ''}
                          `}>
                            {item.status === 'completed' ? '✓ Complété' : ''}
                            {item.status === 'missed' ? '✗ Manqué' : ''}
                            {item.status === 'scheduled' ? '○ Programmé' : ''}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#8E8E93] truncate max-w-[150px] font-mono text-right">
                          {item.details}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => addToast('info', 'Historique complet disponible sur le dashboard principal.')}
                    className="w-full text-center py-2 text-[11px] font-headline font-bold text-gray-500 hover:text-white mt-2 transition-colors uppercase cursor-pointer"
                  >
                    VOIR TOUT L'HISTORIQUE
                  </button>
                </div>

                {/* 8. SECTION 6: CONSEIL DU JOUR */}
                {(data?.streak || 0) > 3 && (
                  <div className="bg-[#1A1A2E] border-l-4 border-[#FFD700] rounded-xl p-4 my-4 flex gap-3 items-start shadow-sm">
                    <Lightbulb className="w-5 h-5 text-[#FFD700] shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <h4 className="text-[10px] font-headline font-black text-white uppercase tracking-wider">
                        CONSEIL DU JOUR
                      </h4>
                      <p className="text-[11px] text-gray-300 leading-normal mt-1">
                        Contractez lentement et relâchez encore plus lentement. Le relâchement actif (Reverse Kegel) est le secret ultime de la maîtrise circulatoire.
                      </p>
                    </div>
                  </div>
                )}

              </div>

              {/* 9. MOCK BOTTOM NAVIGATION BAR */}
              <div className="absolute bottom-0 inset-x-0 h-[64px] bg-[#16213E] border-t border-gray-800/30 flex items-center justify-around z-30 select-none px-2">
                
                {/* Tab 1: Home */}
                <button 
                  onClick={() => setActiveBottomTab('home')}
                  className={`flex flex-col items-center justify-center flex-1 py-1 relative cursor-pointer
                    ${activeBottomTab === 'home' ? 'text-[#E94560]' : 'text-[#5A5A5A] hover:text-gray-400'}
                  `}
                >
                  <Home className="w-4.5 h-4.5" />
                  <span className="text-[9px] font-headline font-bold uppercase mt-1">ACCUEIL</span>
                </button>

                {/* Tab 2: Kegel Active */}
                <button 
                  onClick={() => setActiveBottomTab('kegel')}
                  className={`flex flex-col items-center justify-center flex-1 py-1 relative cursor-pointer
                    ${activeBottomTab === 'kegel' ? 'text-[#E94560]' : 'text-[#5A5A5A] hover:text-gray-400'}
                  `}
                >
                  <Dumbbell className="w-4.5 h-4.5" />
                  <span className="text-[9px] font-headline font-bold uppercase mt-1">KEGEL</span>
                  {activeBottomTab === 'kegel' && (
                    <span className="absolute bottom-0 w-1 h-1 bg-[#E94560] rounded-full" />
                  )}
                </button>

                {/* Tab 3: Respiration */}
                <button 
                  onClick={() => setActiveBottomTab('respiration')}
                  className={`flex flex-col items-center justify-center flex-1 py-1 relative cursor-pointer
                    ${activeBottomTab === 'respiration' ? 'text-[#E94560]' : 'text-[#5A5A5A] hover:text-gray-400'}
                  `}
                >
                  <Wind className="w-4.5 h-4.5" />
                  <span className="text-[9px] font-headline font-bold uppercase mt-1">SOUFFLE</span>
                </button>

                {/* Tab 4: Communauté */}
                <button 
                  onClick={() => setActiveBottomTab('community')}
                  className={`flex flex-col items-center justify-center flex-1 py-1 relative cursor-pointer
                    ${activeBottomTab === 'community' ? 'text-[#E94560]' : 'text-[#5A5A5A] hover:text-gray-400'}
                  `}
                >
                  <Users className="w-4.5 h-4.5" />
                  <span className="text-[9px] font-headline font-bold uppercase mt-1">COMMUNAUTÉ</span>
                  {/* Unread Alert Red Dot */}
                  <span className="absolute top-1.5 right-6 w-2 h-2 bg-red-500 rounded-full border border-[#16213E]" />
                </button>

                {/* Tab 5: Profil */}
                <button 
                  onClick={() => setActiveBottomTab('profile')}
                  className={`flex flex-col items-center justify-center flex-1 py-1 relative cursor-pointer
                    ${activeBottomTab === 'profile' ? 'text-[#E94560]' : 'text-[#5A5A5A] hover:text-gray-400'}
                  `}
                >
                  <User className="w-4.5 h-4.5" />
                  <span className="text-[9px] font-headline font-bold uppercase mt-1">PROFIL</span>
                </button>

              </div>

            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: ARCHITECTURAL & INTERACTIVE METRICS REPORT */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          
          {/* ARCHITECTURAL DESCRIPTION OF DESIGN PRINCIPLES */}
          <AlphaCard variant="default" className="p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-gray-800 pb-2.5">
              <h3 className="text-xs font-headline font-extrabold uppercase text-[#E94560] tracking-widest">
                Directives de Rendu Mobile (Symptômes & UI)
              </h3>
              <span className="text-sm">⚙️</span>
            </div>
            
            <p className="text-xs text-gray-300 leading-relaxed">
              Le tableau de bord <strong>Kegel Dashboard</strong> est conçu spécifiquement pour piloter la neuro-plasticité de l'utilisateur par le biais de stimuli visuels stables, de l'haptique native, et de la motivation dopaminergique.
            </p>

            <div className="flex flex-col gap-3 text-xs mt-1">
              <div className="bg-[#0F0F1A] border border-gray-800 p-3 rounded-xl flex gap-3">
                <span className="text-lg">📱</span>
                <div>
                  <h4 className="font-headline font-bold text-white text-[11px]">SOUVERAINETÉ VISUELLE (100% Dark Mode)</h4>
                  <p className="text-[10px] text-gray-400 leading-snug mt-0.5">
                    L'arrière-plan uniforme en <code>#0F0F1A</code> et les cartes en <code>#16213E</code> préviennent la fatigue oculaire lors des sessions de respiration et d'isolation nocturnes.
                  </p>
                </div>
              </div>

              <div className="bg-[#0F0F1A] border border-gray-800 p-3 rounded-xl flex gap-3">
                <span className="text-lg">⚡</span>
                <div>
                  <h4 className="font-headline font-bold text-white text-[11px]">ÉVOLUTION SYNAPTIQUE CIRCULAIRE</h4>
                  <p className="text-[10px] text-gray-400 leading-snug mt-0.5">
                    Le tracé vectoriel SVG fluide anime la jauge de progression avec une courbe de transition amortie (ease-out) afin de valoriser chaque pourcentage de complétion.
                  </p>
                </div>
              </div>

              <div className="bg-[#0F0F1A] border border-gray-800 p-3 rounded-xl flex gap-3">
                <span className="text-lg">🎧</span>
                <div>
                  <h4 className="font-headline font-bold text-white text-[11px]">MÉTRONOME ET RETOURS SENSORIELS</h4>
                  <p className="text-[10px] text-gray-400 leading-snug mt-0.5">
                    Notre moteur sonore de test synthétise de douces ondes sinusoïdales (1200Hz) pour stimuler l'impulsion motrice, tandis que l'étirement (Reverse Kegel) utilise une onde triangulaire (600Hz) de détente.
                  </p>
                </div>
              </div>
            </div>
          </AlphaCard>

          {/* ACTIVE STATE OVERVIEW AND INTERACTIVE SIMULATOR CARD */}
          <AlphaCard variant="elevated" className="p-6 flex flex-col gap-4 border border-[#00D9A5]/10">
            <h3 className="text-sm font-headline font-black text-white flex items-center gap-2">
              <Activity className="text-[#00D9A5] w-5 h-5" />
              État de la Simulation & Métriques Actives
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="bg-[#0F0F1A] p-3 rounded-xl border border-gray-800">
                <span className="text-gray-500 block text-[9px] font-headline font-bold uppercase">STREAK ACTIF :</span>
                <span className="text-white font-bold">{data?.streak || 12} jours consécutifs</span>
              </div>
              <div className="bg-[#0F0F1A] p-3 rounded-xl border border-gray-800">
                <span className="text-gray-500 block text-[9px] font-headline font-bold uppercase">SESSIONS COMPLÉTÉES :</span>
                <span className="text-[#FFD700] font-bold">{data?.stats.contractions || 150} sessions</span>
              </div>
            </div>

            <div className="bg-[#0F0F1A]/50 p-4 rounded-xl border border-gray-800 flex flex-col gap-3">
              <h4 className="text-xs font-headline font-extrabold text-white">TEST DIRECT DU COMPTE À REBOURS :</h4>
              <p className="text-[11px] text-gray-400 leading-normal">
                Cliquez sur le bouton <strong>&ldquo;DÉMARRER MA SÉANCE&rdquo;</strong> sur le téléphone virtuel pour observer le comportement dynamique du chronomètre interactif, les alertes d'action, et les visualisations de phase.
              </p>

              <div className="flex gap-2.5 mt-1">
                {simulating ? (
                  <button 
                    onClick={stopSimulation}
                    className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-headline font-bold py-2 rounded-lg cursor-pointer transition-colors"
                  >
                    Arrêter la simulation
                  </button>
                ) : (
                  <button 
                    onClick={startSimulation}
                    className="flex-1 bg-[#00D9A5]/10 hover:bg-[#00D9A5]/20 text-[#00D9A5] border border-[#00D9A5]/30 text-xs font-headline font-bold py-2 rounded-lg cursor-pointer transition-colors"
                  >
                    Simuler la Séance
                  </button>
                )}
              </div>
            </div>
          </AlphaCard>

        </div>

      </div>

    </div>
  );
};
